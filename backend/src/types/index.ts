import { Request } from 'express';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    name: string;
  };
}

export interface JWTPayload {
  id: string;
  email: string;
  name: string;
}

export interface SocketData {
  userId: string;
  boardIds: Set<string>;
}
