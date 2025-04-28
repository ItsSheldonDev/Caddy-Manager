import { json } from '@sveltejs/kit';
import { SiteRepository } from '$lib/repositories/site-repository';
import { error } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import { ActivityLogRepository } from '$lib/repositories/activity-log-repository';

export async function POST({ params, locals }: RequestEvent) {
  try {
    const id = params.id;
    if (!id) {
      throw error(400, 'ID de site manquant');
    }
    
    // Vérifier l'authentification
    // Pour le développement, on utilise un utilisateur fictif
    const user = locals.user || {
      id: 'dev-user',
      email: 'dev@example.com',
      name: 'Developer',
      role: 'admin'
    };
    
    // Récupérer le site avant la mise à jour pour l'historique
    const siteBefore = await SiteRepository.findById(id);
    if (!siteBefore) {
      throw error(404, 'Site non trouvé');
    }
    
    // Inverser le statut du site
    const updatedSite = await SiteRepository.toggleStatus(id);
    
    // Enregistrer l'activité
    await ActivityLogRepository.create({
      action: updatedSite.enabled ? 'enable' : 'disable',
      entity: 'site',
      entityId: id,
      details: { 
        before: { enabled: siteBefore.enabled },
        after: { enabled: updatedSite.enabled }
      },
      performedBy: user.id
    });
    
    return json(updatedSite);
  } catch (err) {
    console.error('Erreur lors de la modification du statut:', err);
    
    if (err instanceof Error) {
      throw error(500, err.message);
    }
    
    throw error(500, 'Erreur inconnue lors de la modification du statut');
  }
}