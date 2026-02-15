import { z } from 'zod';

// Auth schemas
export const registerSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

// Board schemas
export const createBoardSchema = z.object({
  name: z.string().min(1, 'Board name is required'),
  description: z.string().optional(),
});

export const updateBoardSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
});

// List schemas
export const createListSchema = z.object({
  name: z.string().min(1, 'List name is required'),
});

export const updateListSchema = z.object({
  name: z.string().min(1).optional(),
  position: z.number().int().min(0).optional(),
});

// Task schemas
export const createTaskSchema = z.object({
  title: z.string().min(1, 'Task title is required'),
  description: z.string().optional(),
});

export const updateTaskSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  position: z.number().int().min(0).optional(),
});

export const moveTaskSchema = z.object({
  listId: z.string(),
  position: z.number().int().min(0),
});

export const assignTaskSchema = z.object({
  userId: z.string(),
});
