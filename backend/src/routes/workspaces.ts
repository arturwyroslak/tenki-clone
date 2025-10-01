import { Router, Response } from 'express';
import { asyncHandler, AppError } from '../middleware/error';
import { AuthRequest } from '../types';
import { PrismaClient } from '@prisma/client';

const router = Router();

// Get all workspaces for user
router.get('/', asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new AppError('Not authenticated', 401);
  }

  const prisma: PrismaClient = req.app.get('prisma');

  const workspaces = await prisma.workspace.findMany({
    where: {
      members: {
        some: {
          userId: req.user.id,
        },
      },
    },
    include: {
      creator: {
        select: {
          id: true,
          name: true,
          email: true,
          avatarUrl: true,
        },
      },
      members: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              avatarUrl: true,
            },
          },
        },
      },
      _count: {
        select: {
          projects: true,
          runners: true,
        },
      },
    },
  });

  res.json(workspaces);
}));

// Create workspace
router.post('/', asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new AppError('Not authenticated', 401);
  }

  const { name, description } = req.body;
  const prisma: PrismaClient = req.app.get('prisma');

  if (!name) {
    throw new AppError('Workspace name is required', 400);
  }

  const slug = name.toLowerCase().replace(/[^a-z0-9]/g, '-');

  const workspace = await prisma.workspace.create({
    data: {
      name,
      slug,
      description,
      creatorId: req.user.id,
      members: {
        create: {
          userId: req.user.id,
          role: 'ADMIN',
        },
      },
    },
    include: {
      creator: {
        select: {
          id: true,
          name: true,
          email: true,
          avatarUrl: true,
        },
      },
      members: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              avatarUrl: true,
            },
          },
        },
      },
    },
  });

  res.status(201).json(workspace);
}));

// Get workspace by ID
router.get('/:id', asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new AppError('Not authenticated', 401);
  }

  const { id } = req.params;
  const prisma: PrismaClient = req.app.get('prisma');

  const workspace = await prisma.workspace.findFirst({
    where: {
      id,
      members: {
        some: {
          userId: req.user.id,
        },
      },
    },
    include: {
      creator: {
        select: {
          id: true,
          name: true,
          email: true,
          avatarUrl: true,
        },
      },
      members: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              avatarUrl: true,
            },
          },
        },
      },
      projects: true,
      runners: true,
      _count: {
        select: {
          projects: true,
          runners: true,
        },
      },
    },
  });

  if (!workspace) {
    throw new AppError('Workspace not found', 404);
  }

  res.json(workspace);
}));

// Update workspace
router.put('/:id', asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new AppError('Not authenticated', 401);
  }

  const { id } = req.params;
  const { name, description } = req.body;
  const prisma: PrismaClient = req.app.get('prisma');

  // Check if user is admin of workspace
  const member = await prisma.workspaceMember.findFirst({
    where: {
      workspaceId: id,
      userId: req.user.id,
      role: 'ADMIN',
    },
  });

  if (!member) {
    throw new AppError('Not authorized to update this workspace', 403);
  }

  const workspace = await prisma.workspace.update({
    where: { id },
    data: {
      ...(name && { name }),
      ...(description !== undefined && { description }),
    },
    include: {
      creator: {
        select: {
          id: true,
          name: true,
          email: true,
          avatarUrl: true,
        },
      },
      members: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              avatarUrl: true,
            },
          },
        },
      },
    },
  });

  res.json(workspace);
}));

// Delete workspace
router.delete('/:id', asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new AppError('Not authenticated', 401);
  }

  const { id } = req.params;
  const prisma: PrismaClient = req.app.get('prisma');

  // Check if user is creator of workspace
  const workspace = await prisma.workspace.findUnique({
    where: { id },
  });

  if (!workspace) {
    throw new AppError('Workspace not found', 404);
  }

  if (workspace.creatorId !== req.user.id) {
    throw new AppError('Only workspace creator can delete it', 403);
  }

  await prisma.workspace.delete({
    where: { id },
  });

  res.json({ message: 'Workspace deleted successfully' });
}));

// Invite member to workspace
router.post('/:id/members', asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new AppError('Not authenticated', 401);
  }

  const { id } = req.params;
  const { email, role = 'STANDARD' } = req.body;
  const prisma: PrismaClient = req.app.get('prisma');

  // Check if user is admin of workspace
  const adminMember = await prisma.workspaceMember.findFirst({
    where: {
      workspaceId: id,
      userId: req.user.id,
      role: 'ADMIN',
    },
  });

  if (!adminMember) {
    throw new AppError('Not authorized to invite members', 403);
  }

  // Find user by email
  const userToInvite = await prisma.user.findUnique({
    where: { email },
  });

  if (!userToInvite) {
    throw new AppError('User not found', 404);
  }

  // Check if already a member
  const existingMember = await prisma.workspaceMember.findFirst({
    where: {
      workspaceId: id,
      userId: userToInvite.id,
    },
  });

  if (existingMember) {
    throw new AppError('User is already a member', 400);
  }

  const member = await prisma.workspaceMember.create({
    data: {
      workspaceId: id,
      userId: userToInvite.id,
      role,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          avatarUrl: true,
        },
      },
    },
  });

  res.status(201).json(member);
}));

// Remove member from workspace
router.delete('/:id/members/:memberId', asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new AppError('Not authenticated', 401);
  }

  const { id, memberId } = req.params;
  const prisma: PrismaClient = req.app.get('prisma');

  // Check if user is admin of workspace
  const adminMember = await prisma.workspaceMember.findFirst({
    where: {
      workspaceId: id,
      userId: req.user.id,
      role: 'ADMIN',
    },
  });

  if (!adminMember) {
    throw new AppError('Not authorized to remove members', 403);
  }

  await prisma.workspaceMember.delete({
    where: { id: memberId },
  });

  res.json({ message: 'Member removed successfully' });
}));

export default router;
