import { prisma } from '@/lib/prisma';

export interface CreateNotificationInput {
  userId: string;
  title: string;
  message: string;
  type?: string;
  link?: string;
}

export async function createNotification(input: CreateNotificationInput) {
  try {
    return await prisma.notification.create({
      data: {
        userId: input.userId,
        title: input.title,
        message: input.message,
        type: input.type || 'SYSTEM',
        link: input.link,
      },
    });
  } catch (error) {
    console.error('[NotificationService] Failed to create notification:', error);
    return null;
  }
}

export async function listUserNotifications(userId: string, limit: number = 20) {
  const notifications = await prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });

  const unreadCount = notifications.filter((n) => !n.isRead).length;
  return { notifications, unreadCount };
}

export async function markNotificationsAsRead(userId: string, notificationId?: string, all: boolean = false) {
  if (all) {
    return prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
  }

  if (notificationId) {
    return prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
    });
  }

  return { count: 0 };
}
