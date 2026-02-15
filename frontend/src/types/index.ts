export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

export interface Board {
  id: string;
  name: string;
  description?: string;
  ownerId: string;
  owner: User;
  lists?: List[];
  createdAt: string;
  updatedAt: string;
}

export interface List {
  id: string;
  name: string;
  position: number;
  boardId: string;
  tasks?: Task[];
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  position: number;
  listId: string;
  createdById: string;
  createdBy: User;
  assignedUsers: TaskUser[];
  createdAt: string;
  updatedAt: string;
}

export interface TaskUser {
  taskId: string;
  userId: string;
  user: User;
  assignedAt: string;
}

export interface Activity {
  id: string;
  type: string;
  description: string;
  userId: string;
  user: User;
  boardId: string;
  taskId?: string;
  task?: { id: string; title: string };
  createdAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
