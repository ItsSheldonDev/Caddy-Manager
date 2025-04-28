// src/lib/repositories/setting-repository.ts
import prisma from '$lib/services/prisma-service';
import type { Setting } from '@prisma/client';

export const SettingRepository = {
  async findAll(): Promise<Setting[]> {
    return prisma.setting.findMany({
      orderBy: { key: 'asc' }
    });
  },
  
  async findByKey(key: string): Promise<Setting | null> {
    return prisma.setting.findUnique({
      where: { key }
    });
  },
  
  async upsert(key: string, value: string, description?: string): Promise<Setting> {
    return prisma.setting.upsert({
      where: { key },
      update: { 
        value,
        description: description !== undefined ? description : undefined,
        updatedAt: new Date()
      },
      create: {
        key,
        value,
        description
      }
    });
  },
  
  async delete(key: string): Promise<Setting> {
    return prisma.setting.delete({
      where: { key }
    });
  }
};