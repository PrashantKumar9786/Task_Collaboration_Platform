import prisma from '../config/database';
import { ActivityType } from '@prisma/client';

export class ListService {
  async createList(boardId: string, userId: string, name: string) {
    // Verify board ownership
    const board = await prisma.board.findUnique({
      where: { id: boardId },
      include: { lists: { orderBy: { position: 'desc' }, take: 1 } },
    });

    if (!board) {
      throw new Error('Board not found');
    }

    if (board.ownerId !== userId) {
      throw new Error('Access denied');
    }

    // Calculate position
    const position = board.lists[0] ? board.lists[0].position + 1 : 0;

    const list = await prisma.list.create({
      data: {
        name,
        position,
        boardId,
      },
      include: {
        tasks: true,
      },
    });

    // Create activity
    await prisma.activity.create({
      data: {
        type: ActivityType.LIST_CREATED,
        description: `Created list "${name}"`,
        userId,
        boardId,
      },
    });

    return list;
  }

  async updateList(listId: string, userId: string, data: { name?: string }) {
    const list = await prisma.list.findUnique({
      where: { id: listId },
      include: { board: true },
    });

    if (!list) {
      throw new Error('List not found');
    }

    if (list.board.ownerId !== userId) {
      throw new Error('Access denied');
    }

    const updatedList = await prisma.list.update({
      where: { id: listId },
      data,
    });

    // Create activity
    await prisma.activity.create({
      data: {
        type: ActivityType.LIST_UPDATED,
        description: `Updated list "${updatedList.name}"`,
        userId,
        boardId: list.boardId,
      },
    });

    return updatedList;
  }

  async deleteList(listId: string, userId: string) {
    const list = await prisma.list.findUnique({
      where: { id: listId },
      include: { board: true },
    });

    if (!list) {
      throw new Error('List not found');
    }

    if (list.board.ownerId !== userId) {
      throw new Error('Access denied');
    }

    await prisma.list.delete({
      where: { id: listId },
    });

    // Create activity
    await prisma.activity.create({
      data: {
        type: ActivityType.LIST_DELETED,
        description: `Deleted list "${list.name}"`,
        userId,
        boardId: list.boardId,
      },
    });

    return { message: 'List deleted successfully' };
  }

  async updateListPosition(
    listId: string,
    userId: string,
    newPosition: number
  ) {
    const list = await prisma.list.findUnique({
      where: { id: listId },
      include: { board: true },
    });

    if (!list) {
      throw new Error('List not found');
    }

    if (list.board.ownerId !== userId) {
      throw new Error('Access denied');
    }

    // Update positions in a transaction
    await prisma.$transaction(async (tx) => {
      const lists = await tx.list.findMany({
        where: { boardId: list.boardId },
        orderBy: { position: 'asc' },
      });

      const oldPosition = list.position;

      // Reorder lists
      const updatedLists = lists
        .filter((l) => l.id !== listId)
        .map((l, index) => {
          if (index >= newPosition) {
            return { ...l, position: index + 1 };
          }
          return { ...l, position: index };
        });

      updatedLists.splice(newPosition, 0, { ...list, position: newPosition });

      // Update all lists
      for (const l of updatedLists) {
        await tx.list.update({
          where: { id: l.id },
          data: { position: l.position },
        });
      }
    });

    return await prisma.list.findUnique({ where: { id: listId } });
  }
}
