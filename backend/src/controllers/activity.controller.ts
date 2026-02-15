import { Response } from 'express';
import { AuthRequest } from '../types';
import { ActivityService, SearchService } from '../services/activity.service';

const activityService = new ActivityService();
const searchService = new SearchService();

export class ActivityController {
  async getBoardActivities(req: AuthRequest, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      
      const result = await activityService.getBoardActivities(
        req.params.boardId,
        req.user!.id,
        page,
        limit
      );
      res.json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
}

export class SearchController {
  async searchTasks(req: AuthRequest, res: Response) {
    try {
      const query = req.query.q as string;
      const boardId = req.query.boardId as string;

      if (!query) {
        return res.status(400).json({ error: 'Search query is required' });
      }

      if (!boardId) {
        return res.status(400).json({ error: 'Board ID is required' });
      }

      const tasks = await searchService.searchTasks(query, boardId, req.user!.id);
      res.json({ tasks });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
}
