import prisma from '../config/database';

export class ActivityService {
  async getBoardActivities(
    boardId: string,
    userId: string,
    page: number = 1,
    limit: number = 20
  ) {
    const board = await prisma.board.findUnique({
      where: { id: boardId },
    });

    if (!board) {
      throw new Error('Board not found');
    }

    if (board.ownerId !== userId) {
      throw new Error('Access denied');
    }

    const skip = (page - 1) * limit;

    const [activities, total] = await Promise.all([
      prisma.activity.findMany({
        where: { boardId },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          task: {
            select: {
              id: true,
              title: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.activity.count({
        where: { boardId },
      }),
    ]);

    return {
      activities,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}

export class SearchService {
  async searchTasks(query: string, boardId: string, userId: string) {
    const board = await prisma.board.findUnique({
      where: { id: boardId },
    });

    if (!board) {
      throw new Error('Board not found');
    }

    if (board.ownerId !== userId) {
      throw new Error('Access denied');
    }

    const tasks = await prisma.task.findMany({
      where: {
        list: {
          boardId,
        },
        OR: [
          {
            title: {
              contains: query,
              mode: 'insensitive',
            },
          },
          {
            description: {
              contains: query,
              mode: 'insensitive',
            },
          },
        ],
      },
      include: {
        list: {
          select: {
            id: true,
            name: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        assignedUsers: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return tasks;
  }
}
