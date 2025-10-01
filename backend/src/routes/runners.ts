import { Router, Response } from 'express';
import { asyncHandler, AppError } from '../middleware/error';
import { AuthRequest } from '../types';
import { PrismaClient } from '@prisma/client';

const router = Router();

const RUNNER_CONFIGS: Record<string, { cores: number; memory: number; pricePerMin: number }> = {
  SMALL_2C_4G: { cores: 2, memory: 4, pricePerMin: 0.0008 },
  MEDIUM_4C_8G: { cores: 4, memory: 8, pricePerMin: 0.0016 },
  LARGE_8C_16G: { cores: 8, memory: 16, pricePerMin: 0.0032 },
  LARGE_PLUS_16C_32G: { cores: 16, memory: 32, pricePerMin: 0.0088 },
  AUTOSCALE: { cores: 2, memory: 4, pricePerMin: 0.0008 },
};

// Get all runners
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

  const runners = await prisma.runner.findMany({
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
          workflowRuns: true,
        },
      },
    },
  });

  res.json(runners);
}));

// Create runner
router.post('/', asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new AppError('Not authenticated', 401);
  }

  const { name, type, workspaceId } = req.body;
  const prisma: PrismaClient = req.app.get('prisma');

  if (!name || !type || !workspaceId) {
    throw new AppError('Name, type, and workspace ID are required', 400);
  }

  if (!RUNNER_CONFIGS[type as string]) {
    throw new AppError('Invalid runner type', 400);
  }

  // Check if user is member of workspace
  const member = await prisma.workspaceMember.findFirst({
    where: {
      workspaceId,
      userId: req.user.id,
    },
  });

  if (!member) {
    throw new AppError('Not authorized to create runners in this workspace', 403);
  }

  const config = RUNNER_CONFIGS[type as string];

  const runner = await prisma.runner.create({
    data: {
      name,
      type,
      cores: config.cores,
      memory: config.memory,
      pricePerMin: config.pricePerMin,
      workspaceId,
      status: 'IDLE',
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

  res.status(201).json(runner);
}));

// Get runner by ID
router.get('/:id', asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new AppError('Not authenticated', 401);
  }

  const { id } = req.params;
  const prisma: PrismaClient = req.app.get('prisma');

  const runner = await prisma.runner.findUnique({
    where: { id },
    include: {
      workspace: {
        select: {
          id: true,
          name: true,
        },
      },
      workflowRuns: {
        orderBy: { createdAt: 'desc' },
        take: 10,
      },
    },
  });

  if (!runner) {
    throw new AppError('Runner not found', 404);
  }

  // Check if user is member of workspace
  const member = await prisma.workspaceMember.findFirst({
    where: {
      workspaceId: runner.workspaceId,
      userId: req.user.id,
    },
  });

  if (!member) {
    throw new AppError('Not authorized to access this runner', 403);
  }

  res.json(runner);
}));

// Get runner status
router.get('/:id/status', asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new AppError('Not authenticated', 401);
  }

  const { id } = req.params;
  const prisma: PrismaClient = req.app.get('prisma');

  const runner = await prisma.runner.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      status: true,
      type: true,
      cores: true,
      memory: true,
      ipAddress: true,
      workspaceId: true,
    },
  });

  if (!runner) {
    throw new AppError('Runner not found', 404);
  }

  // Check if user is member of workspace
  const member = await prisma.workspaceMember.findFirst({
    where: {
      workspaceId: runner.workspaceId,
      userId: req.user.id,
    },
  });

  if (!member) {
    throw new AppError('Not authorized to access this runner', 403);
  }

  res.json(runner);
}));

// Update runner
router.put('/:id', asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new AppError('Not authenticated', 401);
  }

  const { id } = req.params;
  const { name, status } = req.body;
  const prisma: PrismaClient = req.app.get('prisma');

  const runner = await prisma.runner.findUnique({
    where: { id },
  });

  if (!runner) {
    throw new AppError('Runner not found', 404);
  }

  // Check if user is member of workspace
  const member = await prisma.workspaceMember.findFirst({
    where: {
      workspaceId: runner.workspaceId,
      userId: req.user.id,
    },
  });

  if (!member) {
    throw new AppError('Not authorized to update this runner', 403);
  }

  const updatedRunner = await prisma.runner.update({
    where: { id },
    data: {
      ...(name && { name }),
      ...(status && { status }),
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

  res.json(updatedRunner);
}));

// Delete runner
router.delete('/:id', asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new AppError('Not authenticated', 401);
  }

  const { id } = req.params;
  const prisma: PrismaClient = req.app.get('prisma');

  const runner = await prisma.runner.findUnique({
    where: { id },
  });

  if (!runner) {
    throw new AppError('Runner not found', 404);
  }

  // Check if user is admin of workspace
  const member = await prisma.workspaceMember.findFirst({
    where: {
      workspaceId: runner.workspaceId,
      userId: req.user.id,
      role: 'ADMIN',
    },
  });

  if (!member) {
    throw new AppError('Only workspace admins can delete runners', 403);
  }

  await prisma.runner.delete({
    where: { id },
  });

  res.json({ message: 'Runner deleted successfully' });
}));

export default router;
