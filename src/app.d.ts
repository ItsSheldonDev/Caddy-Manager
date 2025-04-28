// src/app.d.ts
import type { PrismaClient } from '@prisma/client';

// Voir https://kit.svelte.dev/docs/types#app
declare global {
  namespace App {
    // interface Error {}
    interface Locals {
      user: {
        id: string;
        email: string;
        name: string | null;
        role: string;
      } | null;
      session: {
        id: string;
        userId: string;
        expiresAt: Date;
      } | null;
    }
    // interface PageData {}
    // interface Platform {}
  }
}

export {};