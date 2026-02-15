import prisma from '../config/database';
import { ActivityType } from '@prisma/client';

export class BoardService {
  async getBoards(userId: string, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const [boards, total] = await Promise.all([
      prisma.board.findMany({
        where: { ownerId: userId },
        include: {
          owner: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          lists: {
            select: {
              id: true,
              name: true,
            },
            orderBy: { position: 'asc' },
          },
          _count: {
            select: {
              lists: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.board.count({
        where: { ownerId: userId },
      }),
    ]);

    return {
      boards,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getBoardById(boardId: string, userId: string) {
    const board = await prisma.board.findUnique({
      where: { id: boardId },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        lists: {
          include: {
            tasks: {
              include: {
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
              orderBy: { position: 'asc' },
            },
          },
          orderBy: { position: 'asc' },
        },
      },
    });

    if (!board) {
      throw new Error('Board not found');
    }

    if (board.ownerId !== userId) {
      throw new Error('Access denied');
    }

    return board;
  }

  async createBoard(userId: string, name: string, description?: string) {
    const board = await prisma.board.create({
      data: {
        name,
        description,
        ownerId: userId,
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Create activity
    await prisma.activity.create({
      data: {
        type: ActivityType.BOARD_CREATED,
        description: `Created board "${name}"`,
        userId,
        boardId: board.id,
      },
    });

    return board;
  }

  async updateBoard(
    boardId: string,
    userId: string,
    data: { name?: string; description?: string }
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

    const updatedBoard = await prisma.board.update({
      where: { id: boardId },
      data,
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Create activity
    await prisma.activity.create({
      data: {
        type: ActivityType.BOARD_UPDATED,
        description: `Updated board "${updatedBoard.name}"`,
        userId,
        boardId: board.id,
      },
    });

    return updatedBoard;
  }

  async deleteBoard(boardId: string, userId: string) {
    const board = await prisma.board.findUnique({
      where: { id: boardId },
    });

    if (!board) {
      throw new Error('Board not found');
    }

    if (board.ownerId !== userId) {
      throw new Error('Access denied');
    }

    await prisma.board.delete({
      where: { id: boardId },
    });

    return { message: 'Board deleted successfully' };
  }
}
