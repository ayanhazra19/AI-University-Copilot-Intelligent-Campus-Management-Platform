import { prisma } from '@/lib/prisma';

export interface AuditLogInput {
  userId?: string | null;
  userName?: string | null;
  role?: string | null;
  action: string;
  entity: string;
  details?: string | null;
}

export async function recordAuditLog(input: AuditLogInput) {
  try {
    return await prisma.auditLog.create({
      data: {
        userId: input.userId || null,
        userName: input.userName || 'System',
        role: input.role || 'SYSTEM',
        action: input.action,
        entity: input.entity,
        details: input.details || null,
      },
    });
  } catch (error) {
    console.error('[AuditService] Failed to record audit log:', error);
    return null;
  }
}

export async function listAuditLogs(limit: number = 50) {
  return prisma.auditLog.findMany({
    orderBy: { createdAt: 'desc' },
    take: limit,
  });
}
