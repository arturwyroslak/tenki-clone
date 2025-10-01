import { Request } from 'express';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    name?: string;
  };
}

export interface GitHubUser {
  id: number;
  login: string;
  email: string;
  name: string;
  avatar_url: string;
}

export interface GitHubRepository {
  id: number;
  name: string;
  full_name: string;
  private: boolean;
  description: string | null;
  html_url: string;
}

export interface WorkflowFile {
  name: string;
  path: string;
  content: string;
}
