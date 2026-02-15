import axios from 'axios';
import type { AuthResponse, Board, List, Task, Activity } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const authAPI = {
  register: async (email: string, password: string, name: string): Promise<AuthResponse> => {
    const { data } = await api.post('/auth/register', { email, password, name });
    return data;
  },
  login: async (email: string, password: string): Promise<AuthResponse> => {
    const { data } = await api.post('/auth/login', { email, password });
    return data;
  },
  getProfile: async (): Promise<{ user: any }> => {
    const { data } = await api.get('/auth/profile');
    return data;
  },
};

// Board API
export const boardAPI = {
  getBoards: async (page = 1, limit = 10) => {
    const { data } = await api.get(`/boards?page=${page}&limit=${limit}`);
    return data;
  },
  getBoard: async (id: string): Promise<Board> => {
    const { data } = await api.get(`/boards/${id}`);
    return data;
  },
  createBoard: async (board: { name: string; description?: string }): Promise<Board> => {
    const { data } = await api.post('/boards', board);
    return data;
  },
  updateBoard: async (id: string, updates: { name?: string; description?: string }): Promise<Board> => {
    const { data } = await api.put(`/boards/${id}`, updates);
    return data;
  },
  deleteBoard: async (id: string) => {
    const { data } = await api.delete(`/boards/${id}`);
    return data;
  },
};

// List API
export const listAPI = {
  createList: async (boardId: string, list: { name: string }): Promise<List> => {
    const { data } = await api.post(`/boards/${boardId}/lists`, list);
    return data;
  },
  updateList: async (id: string, updates: { name?: string }): Promise<List> => {
    const { data } = await api.put(`/lists/${id}`, updates);
    return data;
  },
  deleteList: async (id: string) => {
    const { data } = await api.delete(`/lists/${id}`);
    return data;
  },
  updatePosition: async (id: string, position: number) => {
    const { data } = await api.put(`/lists/${id}/position`, { position });
    return data;
  },
};

// Task API
export const taskAPI = {
  createTask: async (listId: string, task: { title: string; description?: string }): Promise<Task> => {
    const { data } = await api.post(`/lists/${listId}/tasks`, task);
    return data;
  },
  getTask: async (id: string): Promise<Task> => {
    const { data} = await api.get(`/tasks/${id}`);
    return data;
  },
  updateTask: async (id: string, updates: { title?: string; description?: string }): Promise<Task> => {
    const { data } = await api.put(`/tasks/${id}`, updates);
    return data;
  },
  deleteTask: async (id: string) => {
    const { data } = await api.delete(`/tasks/${id}`);
    return data;
  },
  moveTask: async (id: string, listId: string, position: number): Promise<Task> => {
    const { data } = await api.put(`/tasks/${id}/move`, { listId, position });
    return data;
  },
  assignUser: async (taskId: string, userId: string): Promise<Task> => {
    const { data } = await api.post(`/tasks/${taskId}/assign`, { userId });
    return data;
  },
  unassignUser: async (taskId: string, userId: string): Promise<Task> => {
    const { data } = await api.delete(`/tasks/${taskId}/unassign/${userId}`);
    return data;
  },
};

// Activity API
export const activityAPI = {
  getBoardActivities: async (boardId: string, page = 1, limit = 20) => {
    const { data } = await api.get(`/boards/${boardId}/activities?page=${page}&limit=${limit}`);
    return data;
  },
};

// Search API
export const searchAPI = {
  searchTasks: async (query: string, boardId: string) => {
    const { data } = await api.get(`/search?q=${encodeURIComponent(query)}&boardId=${boardId}`);
    return data;
  },
};

export default api;
