import { json } from '@sveltejs/kit';
import { SiteRepository } from '$lib/repositories/site-repository';
import { caddyService } from '$lib/services/caddy-service';
import { ActivityLogRepository } from '$lib/repositories/activity-log-repository';
import type { RequestEvent } from '@sveltejs/kit';
import prisma from '$lib/services/prisma-service';

// GET endpoint pour récupérer tous les sites
export async function GET() {
  try {
    const sites = await SiteRepository.findAll();
    return json(sites);
  } catch (error) {
    console.error('Erreur lors de la récupération des sites:', error);
    return new Response(JSON.stringify({ error: 'Erreur lors de la récupération des sites' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// POST endpoint pour créer un nouveau site
export async function POST({ request, locals }: RequestEvent) {
  try {
    const formData = await request.formData();
    
    // Récupérer les données du formulaire
    const name = formData.get('name') as string;
    const domain = formData.get('domain') as string;
    const type = formData.get('type') as string;
    
    // Vérifier l'authentification (si vous avez configuré l'authentification)
    // Pour le développement, on utilise un utilisateur fictif
    const user = locals.user || {
      id: 'dev-user',
      email: 'dev@example.com',
      name: 'Developer',
      role: 'admin'
    };
    
    // Vérifier si l'utilisateur existe dans la base de données
    // Si non, le créer pour des besoins de développement
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
    
    // Configurer l'objet de configuration en fonction du type de site
    let config: any = {};
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
          return json({ error: 'Format JSON invalide pour les en-têtes' }, { status: 400 });
        }
      }
      
      config = {
        targetUrl,
        preservePath,
        stripPrefix,
        headers
      };
      
      // Mettre à jour la configuration Caddy via l'API
      caddyResponse = await caddyService.addReverseProxySite(domain, targetUrl, {
        headers
      });
    }
    
    // Créer le site dans la base de données
    const site = await SiteRepository.create({
      name,
      domain,
      type,
      config,
      enabled: true,
      createdBy: user.id
    });
    
    // Enregistrer l'activité
    await ActivityLogRepository.create({
      action: 'create',
      entity: 'site',
      entityId: site.id,
      details: { site, caddyResponse },
      performedBy: user.id
    });
    
    return json({ success: true, site }, { status: 201 });
  } catch (error) {
    console.error('Erreur lors de la création du site:', error);
    
    return json({ 
      error: error instanceof Error ? error.message : 'Erreur inconnue lors de la création du site' 
    }, { status: 500 });
  }
}