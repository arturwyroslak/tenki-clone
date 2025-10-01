import { Router, Response } from 'express';
import { asyncHandler, AppError } from '../middleware/error';
import { AuthRequest } from '../types';
import { PrismaClient } from '@prisma/client';

const router = Router();

// Get workspace analytics
router.get('/workspace/:workspaceId', asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new AppError('Not authenticated', 401);
  }

  const { workspaceId } = req.params;
  const prisma: PrismaClient = req.app.get('prisma');

  // Check if user is member of workspace
  const member = await prisma.workspaceMember.findFirst({
    where: {
      workspaceId,
      userId: req.user.id,
    },
  });

  if (!member) {
    throw new AppError('Not authorized to access this workspace', 403);
  }

  // Get workspace with counts
  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    include: {
      _count: {
        select: {
          projects: true,
          runners: true,
          members: true,
        },
      },
    },
  });

  if (!workspace) {
    throw new AppError('Workspace not found', 404);
  }

  // Get usage stats
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const recentUsage = await prisma.usage.findMany({
    where: {
      workspaceId,
      date: {
        gte: thirtyDaysAgo,
      },
    },
    orderBy: { date: 'asc' },
  });

  const totalMinutes = recentUsage.reduce((sum: number, u: any) => sum + u.minutes, 0);
  const totalCost = recentUsage.reduce((sum: number, u: any) => sum + u.cost, 0);

  // Get workflow run stats
  const workflows = await prisma.workflow.findMany({
    where: {
      project: {
        workspaceId,
      },
    },
    include: {
      runs: {
        where: {
          createdAt: {
            gte: thirtyDaysAgo,
          },
        },
      },
    },
  });

  const totalRuns = workflows.reduce((sum: number, w: any) => sum + w.runs.length, 0);
  const successfulRuns = workflows.reduce(
    (sum: number, w: any) => sum + w.runs.filter((r: any) => r.status === 'SUCCESS').length,
    0
  );
  const failedRuns = workflows.reduce(
    (sum: number, w: any) => sum + w.runs.filter((r: any) => r.status === 'FAILED').length,
    0
  );

  // Get runner stats
  const runners = await prisma.runner.findMany({
    where: { workspaceId },
  });

  const runnerStats = {
    total: runners.length,
    idle: runners.filter((r: any) => r.status === 'IDLE').length,
    busy: runners.filter((r: any) => r.status === 'BUSY').length,
    offline: runners.filter((r: any) => r.status === 'OFFLINE').length,
  };

  res.json({
    workspace: {
      id: workspace.id,
      name: workspace.name,
      projectCount: workspace._count.projects,
      runnerCount: workspace._count.runners,
      memberCount: workspace._count.members,
    },
    usage: {
      totalMinutes,
      totalCost,
      dailyUsage: recentUsage,
    },
    workflowRuns: {
      total: totalRuns,
      successful: successfulRuns,
      failed: failedRuns,
      successRate: totalRuns > 0 ? (successfulRuns / totalRuns) * 100 : 0,
    },
    runners: runnerStats,
  });
}));

// Get project analytics
router.get('/project/:projectId', asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new AppError('Not authenticated', 401);
  }

  const { projectId } = req.params;
  const prisma: PrismaClient = req.app.get('prisma');

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      workspace: true,
      workflows: {
        include: {
          runs: {
            orderBy: { createdAt: 'desc' },
            take: 100,
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

  const allRuns = project.workflows.flatMap((w: any) => w.runs);
  const totalRuns = allRuns.length;
  const successfulRuns = allRuns.filter((r: any) => r.status === 'SUCCESS').length;
  const failedRuns = allRuns.filter((r: any) => r.status === 'FAILED').length;
  const avgDuration = allRuns.length > 0
    ? allRuns.reduce((sum: number, r: any) => sum + (r.duration || 0), 0) / allRuns.length
    : 0;
  const totalCost = allRuns.reduce((sum: number, r: any) => sum + (r.cost || 0), 0);

  res.json({
    project: {
      id: project.id,
      name: project.name,
      workflowCount: project.workflows.length,
    },
    workflowRuns: {
      total: totalRuns,
      successful: successfulRuns,
      failed: failedRuns,
      successRate: totalRuns > 0 ? (successfulRuns / totalRuns) * 100 : 0,
      avgDuration,
      totalCost,
    },
    recentRuns: allRuns.slice(0, 10),
  });
}));

// Get runner analytics
router.get('/runner/:runnerId', asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new AppError('Not authenticated', 401);
  }

  const { runnerId } = req.params;
  const prisma: PrismaClient = req.app.get('prisma');

  const runner = await prisma.runner.findUnique({
    where: { id: runnerId },
    include: {
      workflowRuns: {
        orderBy: { createdAt: 'desc' },
        take: 100,
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

  const totalRuns = runner.workflowRuns.length;
  const successfulRuns = runner.workflowRuns.filter((r: any) => r.status === 'SUCCESS').length;
  const totalDuration = runner.workflowRuns.reduce((sum: number, r: any) => sum + (r.duration || 0), 0);
  const totalCost = runner.workflowRuns.reduce((sum: number, r: any) => sum + (r.cost || 0), 0);

  res.json({
    runner: {
      id: runner.id,
      name: runner.name,
      type: runner.type,
      status: runner.status,
    },
    stats: {
      totalRuns,
      successfulRuns,
      successRate: totalRuns > 0 ? (successfulRuns / totalRuns) * 100 : 0,
      totalDuration,
      totalCost,
      avgDuration: totalRuns > 0 ? totalDuration / totalRuns : 0,
    },
    recentRuns: runner.workflowRuns.slice(0, 10),
  });
}));

export default router;
