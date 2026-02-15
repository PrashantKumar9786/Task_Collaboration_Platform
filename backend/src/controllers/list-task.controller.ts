import { Response } from 'express';
import { AuthRequest } from '../types';
import { ListService } from '../services/list.service';
import { TaskService } from '../services/task.service';
import {
  createListSchema,
  updateListSchema,
  createTaskSchema,
  updateTaskSchema,
  moveTaskSchema,
  assignTaskSchema,
} from '../utils/validation';

const listService = new ListService();
const taskService = new TaskService();

export class ListController {
  async createList(req: AuthRequest, res: Response) {
    try {
      const validated = createListSchema.parse(req.body);
      const list = await listService.createList(
        req.params.boardId,
        req.user!.id,
        validated.name
      );
      res.status(201).json(list);
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ error: 'Validation failed', details: error.errors });
      }
      res.status(400).json({ error: error.message });
    }
  }

  async updateList(req: AuthRequest, res: Response) {
    try {
      const validated = updateListSchema.parse(req.body);
      const list = await listService.updateList(req.params.id, req.user!.id, validated);
      res.json(list);
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ error: 'Validation failed', details: error.errors });
      }
      res.status(400).json({ error: error.message });
    }
  }

  async deleteList(req: AuthRequest, res: Response) {
    try {
      const result = await listService.deleteList(req.params.id, req.user!.id);
      res.json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async updateListPosition(req: AuthRequest, res: Response) {
    try {
      const { position } = req.body;
      const list = await listService.updateListPosition(
        req.params.id,
        req.user!.id,
        position
      );
      res.json(list);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
}

export class TaskController {
  async createTask(req: AuthRequest, res: Response) {
    try {
      const validated = createTaskSchema.parse(req.body);
      const task = await taskService.createTask(
        req.params.listId,
        req.user!.id,
        validated.title,
        validated.description
      );
      res.status(201).json(task);
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ error: 'Validation failed', details: error.errors });
      }
      res.status(400).json({ error: error.message });
    }
  }

  async getTask(req: AuthRequest, res: Response) {
    try {
      const task = await taskService.getTask(req.params.id, req.user!.id);
      res.json(task);
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  }

  async updateTask(req: AuthRequest, res: Response) {
    try {
      const validated = updateTaskSchema.parse(req.body);
      const task = await taskService.updateTask(req.params.id, req.user!.id, validated);
      res.json(task);
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ error: 'Validation failed', details: error.errors });
      }
      res.status(400).json({ error: error.message });
    }
  }

  async deleteTask(req: AuthRequest, res: Response) {
    try {
      const result = await taskService.deleteTask(req.params.id, req.user!.id);
      res.json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async moveTask(req: AuthRequest, res: Response) {
    try {
      const validated = moveTaskSchema.parse(req.body);
      const task = await taskService.moveTask(
        req.params.id,
        req.user!.id,
        validated.listId,
        validated.position
      );
      res.json(task);
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ error: 'Validation failed', details: error.errors });
      }
      res.status(400).json({ error: error.message });
    }
  }

  async assignUser(req: AuthRequest, res: Response) {
    try {
      const validated = assignTaskSchema.parse(req.body);
      const task = await taskService.assignUser(
        req.params.id,
        req.user!.id,
        validated.userId
      );
      res.json(task);
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ error: 'Validation failed', details: error.errors });
      }
      res.status(400).json({ error: error.message });
    }
  }

  async unassignUser(req: AuthRequest, res: Response) {
    try {
      const task = await taskService.unassignUser(
        req.params.id,
        req.user!.id,
        req.params.userId
      );
      res.json(task);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
}
