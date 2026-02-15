import { Response } from 'express';
import { AuthRequest } from '../types';
import { BoardService } from '../services/board.service';
import { createBoardSchema, updateBoardSchema } from '../utils/validation';

const boardService = new BoardService();

export class BoardController {
  async getBoards(req: AuthRequest, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      
      const result = await boardService.getBoards(req.user!.id, page, limit);
      res.json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async getBoard(req: AuthRequest, res: Response) {
    try {
      const board = await boardService.getBoardById(req.params.id, req.user!.id);
      res.json(board);
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  }

  async createBoard(req: AuthRequest, res: Response) {
    try {
      const validated = createBoardSchema.parse(req.body);
      const board = await boardService.createBoard(
        req.user!.id,
        validated.name,
        validated.description
      );
      res.status(201).json(board);
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ error: 'Validation failed', details: error.errors });
      }
      res.status(400).json({ error: error.message });
    }
  }

  async updateBoard(req: AuthRequest, res: Response) {
    try {
      const validated = updateBoardSchema.parse(req.body);
      const board = await boardService.updateBoard(
        req.params.id,
        req.user!.id,
        validated
      );
      res.json(board);
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ error: 'Validation failed', details: error.errors });
      }
      res.status(400).json({ error: error.message });
    }
  }

  async deleteBoard(req: AuthRequest, res: Response) {
    try {
      const result = await boardService.deleteBoard(req.params.id, req.user!.id);
      res.json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
}
