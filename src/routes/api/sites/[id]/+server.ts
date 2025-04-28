/**
 * +--------------------------------------------------+
 * | Caddy Manager                                    |
 * | Version: 1.0.0                                   |
 * | Dev: Marius.B (ItsSheldonDev)                   |
 * | Path: ./src/routes/api/sites/[id]/+server.ts    |
 * +--------------------------------------------------+
 */

import { json } from '@sveltejs/kit';
import { SiteRepository } from '$lib/repositories/site-repository';
import { caddyService } from '$lib/services/caddy-service';
import { ActivityLogRepository } from '$lib/repositories/activity-log-repository';
import { error } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import prisma from '$lib/services/prisma-service';

// GET - Récupérer un site par son ID
export async function GET({ params }: RequestEvent) {
  try {
    const id = params.id;
    if (!id) {
      throw error(400, 'ID de site manquant');
    }
    
    const site = await SiteRepository.findById(id);
    
    if (!site) {
      throw error(404, 'Site non trouvé');
    }
    
    return json(site);
  } catch (err) {
    console.error('Erreur lors de la récupération du site:', err);
    
    if (err instanceof Error) {
      throw error(500, err.message);
    }
    
    throw error(500, 'Erreur inconnue lors de la récupération du site');
  }
}

// PATCH - Mettre à jour un site
export async function PATCH({ params, request, locals }: RequestEvent) {
  try {
    const id = params.id;
    if (!id) {
      throw error(400, 'ID de site manquant');
    }
    
    // Récupérer le site existant
    const existingSite = await SiteRepository.findById(id);
    if (!existingSite) {
      throw error(404, 'Site non trouvé');
    }
    
    // Vérifier l'authentification ou utiliser un utilisateur par défaut
    const user = locals.user || {
      id: 'dev-user',
      email: 'dev@example.com',
      name: 'Developer',
      role: 'admin'
    };
    
    // Vérifier si l'utilisateur existe dans la base de données
    let dbUser = await prisma.user.findUnique({
      where: { id: user.id }
    });
    
    if (!dbUser) {
      dbUser = await prisma.user.create({
        data: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        }
      });
    }
    
    // Récupérer les données du formulaire
    const formData = await request.formData();
    const name = formData.get('name') as string;
    const domain = formData.get('domain') as string;
    const type = formData.get('type') as string;
    
    // Vérifier que le type correspond
    if (type !== existingSite.type) {
      throw error(400, 'Le type de site ne peut pas être modifié');
    }
    
    // Configurer l'objet de configuration en fonction du type de site
    let config: any = existingSite.config || {};
    let caddyResponse: any = null;
    
    if (type === 'reverse_proxy') {
      const targetUrl = formData.get('targetUrl') as string;
      const preservePath = formData.get('preservePath') === 'on';
      const stripPrefix = formData.get('stripPrefix') === 'on';
      
      // Analyser les en-têtes personnalisés si présents
      let headers = {};
      const headersStr = formData.get('headers') as string;
      if (headersStr && headersStr.trim() !== '') {
        try {
          headers = JSON.parse(headersStr);
        } catch (e) {
          throw error(400, 'Format JSON invalide pour les en-têtes');
        }
      }
      
      config = {
        ...config,
        targetUrl,
        preservePath,
        stripPrefix,
        headers
      };
      
      // Mettre à jour la configuration Caddy seulement si le domaine ou l'URL cible a changé
      if (domain !== existingSite.domain || targetUrl !== (existingSite.config as any)?.targetUrl) {
        // Si le domaine a changé, nous devons supprimer l'ancienne configuration
        if (domain !== existingSite.domain) {
          await caddyService.deleteSite(existingSite.domain);
        }
        
        // Ajouter la nouvelle configuration
        caddyResponse = await caddyService.addReverseProxySite(domain, targetUrl, {
          headers
        });
      }
    }
    
    // Mettre à jour le site dans la base de données
    const updatedSite = await SiteRepository.update(id, {
      name,
      domain,
      config
    });
    
    // Enregistrer l'activité
    await ActivityLogRepository.create({
      action: 'update',
      entity: 'site',
      entityId: id,
      details: { 
        before: existingSite,
        after: updatedSite,
        caddyResponse
      },
      performedBy: user.id
    });
    
    return json({ success: true, site: updatedSite });
  } catch (err) {
    console.error('Erreur lors de la mise à jour du site:', err);
    
    if (err instanceof Error) {
      throw error(500, err.message);
    }
    
    throw error(500, 'Erreur inconnue lors de la mise à jour du site');
  }
}

// DELETE - Supprimer un site
export async function DELETE({ params, request, locals }: RequestEvent) {
  try {
    const id = params.id;
    if (!id) {
      throw error(400, 'ID de site manquant');
    }
    
    // Récupérer le site existant
    const existingSite = await SiteRepository.findById(id);
    if (!existingSite) {
      throw error(404, 'Site non trouvé');
    }
    
    // Vérifier l'authentification ou utiliser un utilisateur par défaut
    const user = locals.user || {
      id: 'dev-user',
      email: 'dev@example.com',
      name: 'Developer',
      role: 'admin'
    };
    
    // Vérifier si l'utilisateur existe dans la base de données
    let dbUser = await prisma.user.findUnique({
      where: { id: user.id }
    });
    
    if (!dbUser) {
      dbUser = await prisma.user.create({
        data: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        }
      });
    }
    
    // Vérifier si la confirmation est présente
    const formData = await request.formData();
    const confirm = formData.get('confirm');
    
    if (!confirm) {
      throw error(400, 'Confirmation requise pour supprimer le site');
    }
    
    // Supprimer la configuration de Caddy
    let caddyResponse = null;
    try {
      caddyResponse = await caddyService.deleteSite(existingSite.domain);
    } catch (caddyError) {
      console.error('Erreur lors de la suppression de la configuration Caddy:', caddyError);
      // Continuer même si la suppression Caddy échoue
    }
    
    // Supprimer le site de la base de données
    const deletedSite = await SiteRepository.delete(id);
    
    // Enregistrer l'activité
    await ActivityLogRepository.create({
      action: 'delete',
      entity: 'site',
      entityId: id,
      details: { 
        site: existingSite,
        caddyResponse
      },
      performedBy: user.id
    });
    
    return json({ success: true, site: deletedSite });
  } catch (err) {
    console.error('Erreur lors de la suppression du site:', err);
    
    if (err instanceof Error) {
      throw error(500, err.message);
    }
    
    throw error(500, 'Erreur inconnue lors de la suppression du site');
  }
}