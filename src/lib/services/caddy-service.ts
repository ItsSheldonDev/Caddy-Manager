import prisma from '$lib/services/prisma-service';
import type { CaddyReverseProxySite, CaddyStaticSite } from '$lib/types/caddy';

export class CaddyService {
  private apiUrl: string | null = null;

  constructor() {}

  // Initialiser l'URL de l'API Caddy depuis la base de données
  async init() {
    const settingRecord = await prisma.setting.findUnique({
      where: { key: 'caddy_api_url' }
    });
    
    if (settingRecord) {
      this.apiUrl = settingRecord.value;
    }
    return this;
  }

  // Récupérer la configuration Caddy actuelle
  async getConfig() {
    if (!this.apiUrl) await this.init();
    
    try {
      const response = await fetch(`${this.apiUrl}/config/`);
      if (!response.ok) {
        throw new Error(`Erreur API Caddy: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Erreur lors de la récupération de la configuration Caddy:', error);
      throw error;
    }
  }

  // Ajouter un site en reverse proxy
  async addReverseProxySite(domain: string, targetUrl: string, options: any = {}) {
    if (!this.apiUrl) await this.init();
    
    try {
      // Format de configuration Caddy v2 avec les propriétés correctes
      const route = {
        match: [{ host: [domain] }],
        handle: [
          {
            handler: "reverse_proxy",
            upstreams: [{ dial: targetUrl }],
            // Ne pas utiliser preserve_path_prefix qui n'est pas reconnu
            // Ne pas utiliser strip_prefix qui n'est pas reconnu
            // Utiliser uniquement les propriétés standard de Caddy
            ...(options.headers && { headers: { request: options.headers } })
          }
        ],
        terminal: true
      };

      // Obtenir la configuration actuelle
      const config = await this.getConfig();
      
      // Afficher la configuration pour débogage
      console.log("Configuration Caddy actuelle:", JSON.stringify(config, null, 2));
      
      // Vérifier si nous avons le serveur par défaut ou srv0
      const serverKey = config.apps?.http?.servers?.default ? 'default' : 'srv0';
      
      console.log("Utilisation du serveur:", serverKey);

      // Ajouter notre route à la configuration
      if (!config.apps.http.servers[serverKey].routes) {
        config.apps.http.servers[serverKey].routes = [];
      }
      
      config.apps.http.servers[serverKey].routes.push(route);
      
      // Mettre à jour la configuration via l'API
      const response = await fetch(`${this.apiUrl}/config/apps/http/servers/${serverKey}/routes`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify([...config.apps.http.servers[serverKey].routes])
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erreur API Caddy: ${response.status}\nDétails: ${errorText}`);
      }
      
      // Certains endpoints Caddy ne renvoient pas de JSON
      const responseText = await response.text();
      if (responseText.trim() === '') {
        // Si la réponse est vide, c'est probablement OK
        return { success: true, message: 'Configuration mise à jour avec succès' };
      }
      
      try {
        return JSON.parse(responseText);
      } catch (parseError) {
        // Si ce n'est pas du JSON mais que la requête a réussi, on retourne le texte
        return { success: true, message: responseText };
      }
    } catch (error) {
      console.error('Erreur lors de l\'ajout du site en reverse proxy:', error);
      throw error;
    }
  }

  // Ajouter un site statique
  async addStaticSite(domain: string, rootPath: string, options: any = {}) {
    if (!this.apiUrl) await this.init();
    
    const site: CaddyStaticSite = {
      handle: [
        {
          handler: 'file_server',
          root: rootPath,
          ...options
        }
      ],
      match: [
        {
          host: [domain]
        }
      ],
      terminal: true
    };

    return this.updateSite(domain, site);
  }

  // Mettre à jour la configuration d'un site
  private async updateSite(domain: string, siteConfig: CaddyReverseProxySite | CaddyStaticSite) {
    if (!this.apiUrl) await this.init();
    
    try {
      // Path pour l'API Caddy : routes pour les http servers
      const path = `/config/apps/http/servers/default/routes`;
      
      // Récupérer d'abord la configuration actuelle
      const currentConfig = await this.getConfig();
      const routes = currentConfig?.apps?.http?.servers?.default?.routes || [];
      
      // Vérifier si le domaine existe déjà
      const existingIndex = routes.findIndex((route: any) => 
        route.match?.some((m: any) => m.host?.includes(domain))
      );
      
      let newRoutes;
      if (existingIndex >= 0) {
        // Mettre à jour la route existante
        newRoutes = [...routes];
        newRoutes[existingIndex] = siteConfig;
      } else {
        // Ajouter une nouvelle route
        newRoutes = [...routes, siteConfig];
      }
      
      // Envoyer la mise à jour à l'API Caddy
      const response = await fetch(`${this.apiUrl}${path}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newRoutes)
      });
      
      if (!response.ok) {
        throw new Error(`Erreur API Caddy: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Erreur lors de la mise à jour du site:', error);
      throw error;
    }
  }

  // Supprimer un site
  async deleteSite(domain: string) {
    if (!this.apiUrl) await this.init();
    
    try {
      // Récupérer la configuration actuelle
      const config = await this.getConfig();
      
      // Vérifier si nous avons le serveur par défaut ou srv0
      const serverKey = config.apps?.http?.servers?.default ? 'default' : 'srv0';
      
      console.log("Suppression du site pour le domaine:", domain);
      console.log("Utilisation du serveur:", serverKey);
      
      // Trouver toutes les routes qui ne correspondent PAS au domaine
      const newRoutes = config.apps.http.servers[serverKey].routes.filter((route: any) => {
        // Une route sans match correspond à tout et doit être gardée
        if (!route.match) return true;
        
        // Ne gardez pas les routes qui correspondent à ce domaine
        return !route.match.some((matcher: any) => 
          matcher.host && matcher.host.includes(domain)
        );
      });
      
      // Mettre à jour la configuration avec les routes filtrées (sans le domaine supprimé)
      const response = await fetch(`${this.apiUrl}/config/apps/http/servers/${serverKey}/routes`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newRoutes)
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erreur API Caddy: ${response.status}\nDétails: ${errorText}`);
      }
      
      // Certains endpoints Caddy ne renvoient pas de JSON
      const responseText = await response.text();
      if (responseText.trim() === '') {
        // Si la réponse est vide, c'est probablement OK
        return { success: true, message: 'Site supprimé avec succès de la configuration Caddy' };
      }
      
      try {
        return JSON.parse(responseText);
      } catch (parseError) {
        // Si ce n'est pas du JSON mais que la requête a réussi, on retourne le texte
        return { success: true, message: responseText };
      }
    } catch (error) {
      console.error('Erreur lors de la suppression du site:', error);
      throw error;
    }
  }
}

export const caddyService = new CaddyService();