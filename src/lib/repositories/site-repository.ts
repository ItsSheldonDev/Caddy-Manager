// src/lib/repositories/site-repository.ts
import prisma from '$lib/services/prisma-service';
import type { Site, Prisma } from '@prisma/client';

export const SiteRepository = {
  async findAll(): Promise<Site[]> {
    return prisma.site.findMany({
      orderBy: { createdAt: 'desc' }
    });
  },
  
  async findById(id: string): Promise<Site | null> {
    return prisma.site.findUnique({
      where: { id }
    });
  },
  
  async create(data: Omit<Prisma.SiteCreateInput, 'creator'> & { createdBy: string }): Promise<Site> {
    const { createdBy, ...rest } = data;
    return prisma.site.create({
      data: {
        ...rest,
        creator: {
          connect: { id: createdBy }
        }
      }
    });
  },
  
  async update(id: string, data: Partial<Omit<Prisma.SiteUpdateInput, 'creator'>>): Promise<Site> {
    return prisma.site.update({
      where: { id },
      data
    });
  },
  
  async delete(id: string): Promise<Site> {
    return prisma.site.delete({
      where: { id }
    });
  },
  
  async toggleStatus(id: string): Promise<Site> {
    const site = await prisma.site.findUnique({ where: { id } });
    if (!site) throw new Error('Site not found');
    
    return prisma.site.update({
      where: { id },
      data: { enabled: !site.enabled }
    });
  }
};