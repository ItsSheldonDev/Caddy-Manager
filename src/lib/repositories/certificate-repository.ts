// src/lib/repositories/certificate-repository.ts
import prisma from '$lib/services/prisma-service';
import type { Certificate, Prisma } from '@prisma/client';

export const CertificateRepository = {
  async findAll(): Promise<Certificate[]> {
    return prisma.certificate.findMany({
      include: { site: true },
      orderBy: { domain: 'asc' }
    });
  },
  
  async findById(id: string): Promise<Certificate | null> {
    return prisma.certificate.findUnique({
      where: { id },
      include: { site: true }
    });
  },
  
  async findByDomain(domain: string): Promise<Certificate | null> {
    return prisma.certificate.findUnique({
      where: { domain },
      include: { site: true }
    });
  },
  
  async create(data: Prisma.CertificateCreateInput): Promise<Certificate> {
    return prisma.certificate.create({ data });
  },
  
  async update(id: string, data: Prisma.CertificateUpdateInput): Promise<Certificate> {
    return prisma.certificate.update({
      where: { id },
      data
    });
  },
  
  async delete(id: string): Promise<Certificate> {
    return prisma.certificate.delete({ where: { id } });
  }
};