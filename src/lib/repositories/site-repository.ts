/**
 * +--------------------------------------------------+
 * | Caddy Manager                                    |
 * | Version: 1.0.0                                   |
 * | Dev: Marius.B (ItsSheldonDev)                   |
 * | Path: ./src/lib/repositories/site-repository.ts |
 * +--------------------------------------------------+
 */

import prisma from '$lib/services/prisma-service';
import type { Site, Prisma } from '@prisma/client';

export const SiteRepository = {
  // Trouver tous les sites
  async findAll(include: Prisma.SiteInclude = {}): Promise<Site[]> {
    return prisma.site.findMany({
      include: {
        creator: true,
        ...include
      },
      orderBy: { createdAt: 'desc' }
    });
  },
  
  // Trouver un site par son ID
  async findById(id: string, include: Prisma.SiteInclude = {}): Promise<Site | null> {
    return prisma.site.findUnique({
      where: { id },
      include: {
        creator: true,
        ...include
      }
    });
  },
  
  // Créer un nouveau site
  async create(data: Omit<Prisma.SiteCreateInput, 'creator'> & { createdBy: string }): Promise<Site> {
    const { createdBy, ...rest } = data;
    
    // Vérifier si l'utilisateur existe
    const user = await prisma.user.findUnique({
      where: { id: createdBy }
    });
    
    // Si l'utilisateur n'existe pas, le créer (seulement en développement)
    if (!user && createdBy === 'dev-user') {
      await prisma.user.create({
        data: {
          id: 'dev-user',
          email: 'dev@example.com',
          name: 'Developer',
          role: 'admin'
        }
      });
    }
    
    return prisma.site.create({
      data: {
        ...rest,
        creator: {
          connect: { id: createdBy }
        }
      }
    });
  },
  
  // Mettre à jour un site
  async update(id: string, data: Prisma.SiteUpdateInput): Promise<Site> {
    return prisma.site.update({
      where: { id },
      data
    });
  },
  
  // Supprimer un site
  async delete(id: string): Promise<Site> {
    return prisma.site.delete({
      where: { id }
    });
  },
  
  // Activer/désactiver un site
  async toggleStatus(id: string): Promise<Site> {
    // D'abord, récupérer l'état actuel
    const site = await prisma.site.findUnique({
      where: { id },
      select: { enabled: true }
    });
    
    if (!site) {
      throw new Error(`Site avec l'ID ${id} non trouvé`);
    }
    
    // Basculer l'état
    return prisma.site.update({
      where: { id },
      data: { enabled: !site.enabled }
    });
  }
};