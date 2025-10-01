import { Router, Response } from 'express';
import { Octokit } from '@octokit/rest';
import { asyncHandler, AppError } from '../middleware/error';
import { AuthRequest } from '../types';
import { PrismaClient } from '@prisma/client';

const router = Router();

// Get GitHub repositories
router.get('/repos', asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new AppError('Not authenticated', 401);
  }

  const prisma: PrismaClient = req.app.get('prisma');

  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
  });

  if (!user || !user.githubToken) {
    throw new AppError('GitHub integration not configured', 400);
  }

  const octokit = new Octokit({ auth: user.githubToken });

  const { data: repos } = await octokit.repos.listForAuthenticatedUser({
    sort: 'updated',
    per_page: 100,
  });

  res.json(
    repos.map((repo) => ({
      id: repo.id,
      name: repo.name,
      fullName: repo.full_name,
      private: repo.private,
      description: repo.description,
      url: repo.html_url,
      defaultBranch: repo.default_branch,
    }))
  );
}));

// Connect repository to project
router.post('/repos/:repoId/connect', asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new AppError('Not authenticated', 401);
  }

  const { repoId } = req.params;
  const { projectId } = req.body;
  const prisma: PrismaClient = req.app.get('prisma');

  if (!projectId) {
    throw new AppError('Project ID is required', 400);
  }

  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
  });

  if (!user || !user.githubToken) {
    throw new AppError('GitHub integration not configured', 400);
  }

  const octokit = new Octokit({ auth: user.githubToken });

  // Get repository details
  const { data: repo } = await octokit.repos.get({
    owner: repoId.split('/')[0],
    repo: repoId.split('/')[1] || repoId,
  });

  // Update project with GitHub repo
  const project = await prisma.project.update({
    where: { id: projectId },
    data: {
      githubRepo: repo.full_name,
    },
  });

  res.json(project);
}));

// Get workflows from repository
router.get('/repos/:owner/:repo/workflows', asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new AppError('Not authenticated', 401);
  }

  const { owner, repo } = req.params;
  const prisma: PrismaClient = req.app.get('prisma');

  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
  });

  if (!user || !user.githubToken) {
    throw new AppError('GitHub integration not configured', 400);
  }

  const octokit = new Octokit({ auth: user.githubToken });

  try {
    // Get workflow files from .github/workflows directory
    const { data: contents } = await octokit.repos.getContent({
      owner,
      repo,
      path: '.github/workflows',
    });

    if (!Array.isArray(contents)) {
      throw new AppError('Invalid workflow directory', 400);
    }

    const workflowFiles = contents.filter(
      (file) => file.name.endsWith('.yml') || file.name.endsWith('.yaml')
    );

    const workflows = await Promise.all(
      workflowFiles.map(async (file) => {
        const { data: fileContent } = await octokit.repos.getContent({
          owner,
          repo,
          path: file.path,
        });

        if ('content' in fileContent) {
          const content = Buffer.from(fileContent.content, 'base64').toString('utf-8');
          return {
            name: file.name,
            path: file.path,
            content,
          };
        }
        return null;
      })
    );

    res.json(workflows.filter((w) => w !== null));
  } catch (error: any) {
    if (error.status === 404) {
      res.json([]); // No workflows directory
    } else {
      throw error;
    }
  }
}));

// Migrate workflows
router.post('/migrate', asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new AppError('Not authenticated', 401);
  }

  const { projectId, workflows } = req.body;
  const prisma: PrismaClient = req.app.get('prisma');

  if (!projectId || !workflows || !Array.isArray(workflows)) {
    throw new AppError('Project ID and workflows array are required', 400);
  }

  const project = await prisma.project.findUnique({
    where: { id: projectId },
  });

  if (!project) {
    throw new AppError('Project not found', 404);
  }

  // Check if user has access to project
  const member = await prisma.workspaceMember.findFirst({
    where: {
      workspaceId: project.workspaceId,
      userId: req.user.id,
    },
  });

  if (!member) {
    throw new AppError('Not authorized to access this project', 403);
  }

  // Create migration record
  const migration = await prisma.migration.create({
    data: {
      githubRepo: project.githubRepo || 'unknown',
      totalWorkflows: workflows.length,
      status: 'IN_PROGRESS',
      startedAt: new Date(),
    },
  });

  // Create workflow records
  const createdWorkflows = await Promise.all(
    workflows.map(async (workflow: any) => {
      return prisma.workflow.create({
        data: {
          name: workflow.name,
          fileName: workflow.name,
          content: workflow.content,
          githubPath: workflow.path,
          projectId,
        },
      });
    })
  );

  // Update migration as completed
  await prisma.migration.update({
    where: { id: migration.id },
    data: {
      status: 'COMPLETED',
      migratedWorkflows: createdWorkflows.length,
      completedAt: new Date(),
    },
  });

  res.json({
    migration,
    workflows: createdWorkflows,
  });
}));

export default router;
