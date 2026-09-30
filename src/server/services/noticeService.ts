import { prisma } from '@/lib/prisma';
import { recordAuditLog } from './auditService';

export async function listNotices(filters?: { category?: string | null; search?: string | null }) {
  const where: any = { isArchived: false };
  if (filters?.category && filters.category !== 'ALL') {
    where.category = filters.category;
  }
  if (filters?.search) {
    where.OR = [
      { title: { contains: filters.search } },
      { content: { contains: filters.search } },
    ];
  }

  return prisma.notice.findMany({
    where,
    orderBy: [{ isImportant: 'desc' }, { publishedAt: 'desc' }],
  });
}

export async function createNotice(
  data: {
    title: string;
    content: string;
    category?: string;
    targetRole?: string;
    department?: string;
    isImportant?: boolean;
  },
  user: { id: string; name: string; role: string }
) {
  const notice = await prisma.notice.create({
    data: {
      title: data.title,
      content: data.content,
      category: data.category || 'GENERAL',
      targetRole: data.targetRole || 'ALL',
      department: data.department || 'General Administration',
      isImportant: Boolean(data.isImportant),
      authorName: user.name,
    },
  });

  await recordAuditLog({
    userId: user.id,
    userName: user.name,
    role: user.role,
    action: 'NOTICE_PUBLISHED',
    entity: 'Notice',
    details: `Published notice "${notice.title}" [Category: ${notice.category}]`,
  });

  return notice;
}
