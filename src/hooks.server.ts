// src/hooks.server.ts
import { lucia } from "$lib/server/auth";
import type { Handle } from "@sveltejs/kit";

export const handle: Handle = async ({ event, resolve }) => {
  // Récupérer le sessionId depuis les cookies
  const sessionId = event.cookies.get(lucia.sessionCookieName);
  
  if (!sessionId) {
    // Si pas de session, continuer sans authentification
    event.locals.user = null;
    event.locals.session = null;
    return resolve(event);
  }

  // Valider la session
  const { session, user } = await lucia.validateSession(sessionId);
  
  if (session && session.fresh) {
    // Si la session a été renouvelée, mettre à jour le cookie
    const sessionCookie = lucia.createSessionCookie(session.id);
    event.cookies.set(sessionCookie.name, sessionCookie.value, {
      path: ".",
      ...sessionCookie.attributes
    });
  }
  
  if (!session) {
    // Si la session n'est plus valide, supprimer le cookie
    const sessionCookie = lucia.createBlankSessionCookie();
    event.cookies.set(sessionCookie.name, sessionCookie.value, {
      path: ".",
      ...sessionCookie.attributes
    });
  }

  // Stocker l'utilisateur et la session dans les locals pour y accéder dans les routes
  event.locals.user = user;
  event.locals.session = session;
  
  return resolve(event);
};