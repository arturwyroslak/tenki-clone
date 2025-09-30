import { Router, Response } from 'express';
import { asyncHandler, AppError } from '../middleware/error';
import { AuthRequest } from '../types';
import { PrismaClient } from '@prisma/client';

const router = Router();

// Get all projects
router.get('/', asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new AppError('Not authenticated', 401);
  }

  const { workspaceId } = req.query;
  const prisma: PrismaClient = req.app.get('prisma');

  if (!workspaceId) {
    throw new AppError('Workspace ID is required', 400);
  }

  // Check if user is member of workspace
  const member = await prisma.workspaceMember.findFirst({
    where: {
      workspaceId: workspaceId as string,
      userId: req.user.id,
    },
  });

  if (!member) {
    throw new AppError('Not authorized to access this workspace', 403);
  }

  const projects = await prisma.project.findMany({
    where: { workspaceId: workspaceId as string },
    include: {
      workspace: {
        select: {
          id: true,
          name: true,
        },
      },
      _count: {
        select: {
          workflows: true,
        },
      },
    },
  });

  res.json(projects);
}));

// Create project
router.post('/', asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new AppError('Not authenticated', 401);
  }

  const { name, description, githubRepo, workspaceId } = req.body;
  const prisma: PrismaClient = req.app.get('prisma');

  if (!name || !workspaceId) {
    throw new AppError('Name and workspace ID are required', 400);
  }

  // Check if user is member of workspace
  const member = await prisma.workspaceMember.findFirst({
    where: {
      workspaceId,
      userId: req.user.id,
    },
  });

  if (!member) {
    throw new AppError('Not authorized to create projects in this workspace', 403);
  }

  const project = await prisma.project.create({
    data: {
      name,
      description,
      githubRepo,
      workspaceId,
    },
    include: {
      workspace: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  res.status(201).json(project);
}));

// Get project by ID
router.get('/:id', asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new AppError('Not authenticated', 401);
  }

  const { id } = req.params;
  const prisma: PrismaClient = req.app.get('prisma');

  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      workspace: {
        select: {
          id: true,
          name: true,
        },
      },
      workflows: {
        include: {
          runs: {
            orderBy: { createdAt: 'desc' },
            take: 10,
          },
        },
      },
    },
  });

  if (!project) {
    throw new AppError('Project not found', 404);
  }

  // Check if user is member of workspace
  const member = await prisma.workspaceMember.findFirst({
    where: {
      workspaceId: project.workspaceId,
      userId: req.user.id,
    },
  });

  if (!member) {
    throw new AppError('Not authorized to access this project', 403);
  }

  res.json(project);
}));

// Update project
router.put('/:id', asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new AppError('Not authenticated', 401);
  }

  const { id } = req.params;
  const { name, description, githubRepo } = req.body;
  const prisma: PrismaClient = req.app.get('prisma');

  const project = await prisma.project.findUnique({
    where: { id },
  });

  if (!project) {
    throw new AppError('Project not found', 404);
  }

  // Check if user is member of workspace
  const member = await prisma.workspaceMember.findFirst({
    where: {
      workspaceId: project.workspaceId,
      userId: req.user.id,
    },
  });

  if (!member) {
    throw new AppError('Not authorized to update this project', 403);
  }

  const updatedProject = await prisma.project.update({
    where: { id },
    data: {
      ...(name && { name }),
      ...(description !== undefined && { description }),
      ...(githubRepo !== undefined && { githubRepo }),
    },
    include: {
      workspace: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  res.json(updatedProject);
}));

// Delete project
router.delete('/:id', asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new AppError('Not authenticated', 401);
  }

  const { id } = req.params;
  const prisma: PrismaClient = req.app.get('prisma');

  const project = await prisma.project.findUnique({
    where: { id },
  });

  if (!project) {
    throw new AppError('Project not found', 404);
  }

  // Check if user is admin of workspace
  const member = await prisma.workspaceMember.findFirst({
    where: {
      workspaceId: project.workspaceId,
      userId: req.user.id,
      role: 'ADMIN',
    },
  });

  if (!member) {
    throw new AppError('Only workspace admins can delete projects', 403);
  }

  await prisma.project.delete({
    where: { id },
  });

  res.json({ message: 'Project deleted successfully' });
}));

export default router;
