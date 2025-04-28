// src/routes/api/caddy-status/+server.ts
import { json } from '@sveltejs/kit';

export async function GET() {
  try {
    // URL de l'API Caddy définie dans votre fichier .env
    const caddyApiUrl = process.env.CADDY_API_URL || 'http://localhost:2019';
    
    // Tester une requête simple vers l'API Caddy (endpoint de statut)
    const response = await fetch(`${caddyApiUrl}/config/`);
    
    if (!response.ok) {
      return json({
        status: 'error',
        message: `L'API Caddy a répondu avec le code ${response.status}`,
        code: response.status
      }, { status: 502 });
    }
    
    const data = await response.json();
    
    return json({
      status: 'success',
      message: 'Connexion à l\'API Caddy établie avec succès',
      version: data.apps?.http?.servers?.default ? 'Caddy v2' : 'Version inconnue',
      data: data
    });
  } catch (error) {
    console.error('Erreur lors de la connexion à l\'API Caddy:', error);
    
    return json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Erreur inconnue lors de la connexion à l\'API Caddy',
    }, { status: 500 });
  }
}