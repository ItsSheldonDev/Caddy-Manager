import prisma from '$lib/services/prisma-service';
import type { ActivityLog, Prisma } from '@prisma/client';

export const ActivityLogRepository = {
  async findAll(limit = 100): Promise<ActivityLog[]> {
    return prisma.activityLog.findMany({
      include: { performer: true },
      orderBy: { performedAt: 'desc' },
      take: limit
    });
  },
  
  async findByEntity(entity: string, entityId?: string, limit = 50): Promise<ActivityLog[]> {
    return prisma.activityLog.findMany({
      where: {
        entity,
        entityId: entityId || undefined
      },
      include: { performer: true },
      orderBy: { performedAt: 'desc' },
      take: limit
    });
  },
  
  async create(data: Omit<Prisma.ActivityLogCreateInput, 'performer'> & { performedBy: string }): Promise<ActivityLog> {
    const { performedBy, ...rest } = data;
    return prisma.activityLog.create({
      data: {
        ...rest,
        performer: {
          connect: { id: performedBy }
        }
      }
    });
  }
};