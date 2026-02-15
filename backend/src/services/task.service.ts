import prisma from '../config/database';
import { ActivityType } from '@prisma/client';

export class TaskService {
  async createTask(
    listId: string,
    userId: string,
    title: string,
    description?: string
  ) {
    const list = await prisma.list.findUnique({
      where: { id: listId },
      include: {
        board: true,
        tasks: { orderBy: { position: 'desc' }, take: 1 },
      },
    });

    if (!list) {
      throw new Error('List not found');
    }

    if (list.board.ownerId !== userId) {
      throw new Error('Access denied');
    }

    // Calculate position
    const position = list.tasks[0] ? list.tasks[0].position + 1 : 0;

    const task = await prisma.task.create({
      data: {
        title,
        description,
        position,
        listId,
        createdById: userId,
      },
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
    });

    // Create activity
    await prisma.activity.create({
      data: {
        type: ActivityType.TASK_CREATED,
        description: `Created task "${title}"`,
        userId,
        boardId: list.board.id,
        taskId: task.id,
      },
    });

    return task;
  }

  async getTask(taskId: string, userId: string) {
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        list: {
          include: {
            board: true,
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
    });

    if (!task) {
      throw new Error('Task not found');
    }

    if (task.list.board.ownerId !== userId) {
      throw new Error('Access denied');
    }

    return task;
  }

  async updateTask(
    taskId: string,
    userId: string,
    data: { title?: string; description?: string }
  ) {
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        list: {
          include: {
            board: true,
          },
        },
      },
    });

    if (!task) {
      throw new Error('Task not found');
    }

    if (task.list.board.ownerId !== userId) {
      throw new Error('Access denied');
    }

    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data,
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
    });

    // Create activity
    await prisma.activity.create({
      data: {
        type: ActivityType.TASK_UPDATED,
        description: `Updated task "${updatedTask.title}"`,
        userId,
        boardId: task.list.board.id,
        taskId: task.id,
      },
    });

    return updatedTask;
  }

  async deleteTask(taskId: string, userId: string) {
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        list: {
          include: {
            board: true,
          },
        },
      },
    });

    if (!task) {
      throw new Error('Task not found');
    }

    if (task.list.board.ownerId !== userId) {
      throw new Error('Access denied');
    }

    await prisma.task.delete({
      where: { id: taskId },
    });

    // Create activity
    await prisma.activity.create({
      data: {
        type: ActivityType.TASK_DELETED,
        description: `Deleted task "${task.title}"`,
        userId,
        boardId: task.list.board.id,
      },
    });

    return { message: 'Task deleted successfully' };
  }

  async moveTask(
    taskId: string,
    userId: string,
    newListId: string,
    newPosition: number
  ) {
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        list: {
          include: {
            board: true,
          },
        },
      },
    });

    if (!task) {
      throw new Error('Task not found');
    }

    const newList = await prisma.list.findUnique({
      where: { id: newListId },
      include: { board: true },
    });

    if (!newList) {
      throw new Error('Target list not found');
    }

    if (task.list.board.ownerId !== userId || newList.board.ownerId !== userId) {
      throw new Error('Access denied');
    }

    // Move task in transaction
    await prisma.$transaction(async (tx) => {
      // Get all tasks in target list
      const tasksInNewList = await tx.task.findMany({
        where: { listId: newListId },
        orderBy: { position: 'asc' },
      });

      // Remove task from calculations if it's in the same list
      const filteredTasks =
        task.listId === newListId
          ? tasksInNewList.filter((t) => t.id !== taskId)
          : tasksInNewList;

      // Reorder tasks
      const updatedTasks = filteredTasks.map((t, index) => {
        if (index >= newPosition) {
          return { ...t, position: index + 1 };
        }
        return { ...t, position: index };
      });

      updatedTasks.splice(newPosition, 0, {
        ...task,
        position: newPosition,
        listId: newListId,
      });

      // Update all tasks
      for (const t of updatedTasks) {
        await tx.task.update({
          where: { id: t.id },
          data: {
            position: t.position,
            listId: t.listId,
          },
        });
      }
    });

    // Create activity
    await prisma.activity.create({
      data: {
        type: ActivityType.TASK_MOVED,
        description: `Moved task "${task.title}" to ${newList.name}`,
        userId,
        boardId: task.list.board.id,
        taskId: task.id,
      },
    });

    return await this.getTask(taskId, userId);
  }

  async assignUser(taskId: string, userId: string, assigneeId: string) {
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        list: {
          include: {
            board: true,
          },
        },
      },
    });

    if (!task) {
      throw new Error('Task not found');
    }

    if (task.list.board.ownerId !== userId) {
      throw new Error('Access denied');
    }

    // Check if user exists
    const assignee = await prisma.user.findUnique({
      where: { id: assigneeId },
    });

    if (!assignee) {
      throw new Error('User not found');
    }

    // Assign user
    await prisma.taskUser.create({
      data: {
        taskId,
        userId: assigneeId,
      },
    });

    // Create activity
    await prisma.activity.create({
      data: {
        type: ActivityType.TASK_ASSIGNED,
        description: `Assigned ${assignee.name} to task "${task.title}"`,
        userId,
        boardId: task.list.board.id,
        taskId: task.id,
      },
    });

    return await this.getTask(taskId, userId);
  }

  async unassignUser(taskId: string, userId: string, assigneeId: string) {
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        list: {
          include: {
            board: true,
          },
        },
      },
    });

    if (!task) {
      throw new Error('Task not found');
    }

    if (task.list.board.ownerId !== userId) {
      throw new Error('Access denied');
    }

    const assignee = await prisma.user.findUnique({
      where: { id: assigneeId },
    });

    // Unassign user
    await prisma.taskUser.delete({
      where: {
        taskId_userId: {
          taskId,
          userId: assigneeId,
        },
      },
    });

    // Create activity
    if (assignee) {
      await prisma.activity.create({
        data: {
          type: ActivityType.TASK_UNASSIGNED,
          description: `Unassigned ${assignee.name} from task "${task.title}"`,
          userId,
          boardId: task.list.board.id,
          taskId: task.id,
        },
      });
    }

    return await this.getTask(taskId, userId);
  }
}
