import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { BoardController } from '../controllers/board.controller';
import { ListController, TaskController } from '../controllers/list-task.controller';
import { ActivityController, SearchController } from '../controllers/activity.controller';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Controllers
const authController = new AuthController();
const boardController = new BoardController();
const listController = new ListController();
const taskController = new TaskController();
const activityController = new ActivityController();
const searchController = new SearchController();

// Auth routes (public)
router.post('/auth/register', (req, res) => authController.register(req, res));
router.post('/auth/login', (req, res) => authController.login(req, res));
router.get('/auth/profile', authenticateToken, (req, res) => authController.getProfile(req, res));

// Board routes (protected)
router.get('/boards', authenticateToken, (req, res) => boardController.getBoards(req, res));
router.post('/boards', authenticateToken, (req, res) => boardController.createBoard(req, res));
router.get('/boards/:id', authenticateToken, (req, res) => boardController.getBoard(req, res));
router.put('/boards/:id', authenticateToken, (req, res) => boardController.updateBoard(req, res));
router.delete('/boards/:id', authenticateToken, (req, res) => boardController.deleteBoard(req, res));

// List routes (protected)
router.post('/boards/:boardId/lists', authenticateToken, (req, res) => listController.createList(req, res));
router.put('/lists/:id', authenticateToken, (req, res) => listController.updateList(req, res));
router.delete('/lists/:id', authenticateToken, (req, res) => listController.deleteList(req, res));
router.put('/lists/:id/position', authenticateToken, (req, res) => listController.updateListPosition(req, res));

// Task routes (protected)
router.post('/lists/:listId/tasks', authenticateToken, (req, res) => taskController.createTask(req, res));
router.get('/tasks/:id', authenticateToken, (req, res) => taskController.getTask(req, res));
router.put('/tasks/:id', authenticateToken, (req, res) => taskController.updateTask(req, res));
router.delete('/tasks/:id', authenticateToken, (req, res) => taskController.deleteTask(req, res));
router.put('/tasks/:id/move', authenticateToken, (req, res) => taskController.moveTask(req, res));
router.post('/tasks/:id/assign', authenticateToken, (req, res) => taskController.assignUser(req, res));
router.delete('/tasks/:id/unassign/:userId', authenticateToken, (req, res) => taskController.unassignUser(req, res));

// Activity routes (protected)
router.get('/boards/:boardId/activities', authenticateToken, (req, res) => activityController.getBoardActivities(req, res));

// Search routes (protected)
router.get('/search', authenticateToken, (req, res) => searchController.searchTasks(req, res));

// Health check
router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

export default router;
