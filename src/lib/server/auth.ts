// src/lib/server/auth.ts
import { Lucia } from "lucia";
import { PrismaAdapter } from "@lucia-auth/adapter-prisma";
import prisma from '$lib/services/prisma-service';
import { dev } from "$app/environment";

// Configuration de l'adaptateur Prisma pour Lucia
const adapter = new PrismaAdapter(
  prisma.session,
  prisma.user
);

// Initialisation de Lucia avec l'adaptateur
export const lucia = new Lucia(adapter, {
  sessionCookie: {
    attributes: {
      // Définir sécurisé à 'true' en production
      secure: !dev,
    }
  },
  getUserAttributes: (attributes) => {
    return {
      // Retourner les attributs utilisateur souhaités
      email: attributes.email,
      name: attributes.name,
      role: attributes.role
    };
  }
});

// Déclaration pour TypeScript - Étendre l'espace de noms Lucia
declare module "lucia" {
  interface Register {
    Lucia: typeof lucia;
    DatabaseUserAttributes: {
      email: string;
      name: string | null;
      role: string;
    };
  }
}