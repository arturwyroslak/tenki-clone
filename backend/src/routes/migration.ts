import { Router, Response } from 'express';
import { Octokit } from '@octokit/rest';
import { asyncHandler, AppError } from '../middleware/error';
import { AuthRequest } from '../types';
import { PrismaClient } from '@prisma/client';

const router = Router();

// Analyze repository for migration
router.post('/analyze', asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new AppError('Not authenticated', 401);
  }

  const { repoOwner, repoName } = req.body;
  const prisma: PrismaClient = req.app.get('prisma');

  if (!repoOwner || !repoName) {
    throw new AppError('Repository owner and name are required', 400);
  }

  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
  });

  if (!user || !user.githubToken) {
    throw new AppError('GitHub integration not configured', 400);
  }

  const octokit = new Octokit({ auth: user.githubToken });

  try {
    // Get repository info
    const { data: repo } = await octokit.repos.get({
      owner: repoOwner,
      repo: repoName,
    });

    // Get workflow files
    let workflows: any[] = [];
    try {
      const { data: contents } = await octokit.repos.getContent({
        owner: repoOwner,
        repo: repoName,
        path: '.github/workflows',
      });

      if (Array.isArray(contents)) {
        const workflowFiles = contents.filter(
          (file) => file.name.endsWith('.yml') || file.name.endsWith('.yaml')
        );

        workflows = await Promise.all(
          workflowFiles.map(async (file) => {
            const { data: fileContent } = await octokit.repos.getContent({
              owner: repoOwner,
              repo: repoName,
              path: file.path,
            });

            if ('content' in fileContent) {
              const content = Buffer.from(fileContent.content, 'base64').toString('utf-8');
              
              // Analyze workflow for compatibility
              const hasGitHubRunner = content.includes('runs-on:');
              const isCompatible = hasGitHubRunner;

              return {
                name: file.name,
                path: file.path,
                size: file.size,
                content,
                compatible: isCompatible,
                issues: !isCompatible ? ['No runner specification found'] : [],
              };
            }
            return null;
          })
        );

        workflows = workflows.filter((w) => w !== null);
      }
    } catch (error: any) {
      if (error.status !== 404) {
        throw error;
      }
    }

    const compatibleCount = workflows.filter((w) => w.compatible).length;

    res.json({
      repository: {
        name: repo.name,
        fullName: repo.full_name,
        private: repo.private,
        description: repo.description,
      },
      analysis: {
        totalWorkflows: workflows.length,
        compatibleWorkflows: compatibleCount,
        incompatibleWorkflows: workflows.length - compatibleCount,
        estimatedMigrationTime: workflows.length * 2, // 2 minutes per workflow
      },
      workflows,
    });
  } catch (error: any) {
    if (error.status === 404) {
      throw new AppError('Repository not found', 404);
    }
    throw error;
  }
}));

// Start migration
router.post('/start', asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new AppError('Not authenticated', 401);
  }

  const { projectId, repoOwner, repoName, workflows } = req.body;
  const prisma: PrismaClient = req.app.get('prisma');

  if (!projectId || !repoOwner || !repoName || !workflows) {
    throw new AppError('Project ID, repository info, and workflows are required', 400);
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

  const migration = await prisma.migration.create({
    data: {
      githubRepo: `${repoOwner}/${repoName}`,
      totalWorkflows: workflows.length,
      status: 'IN_PROGRESS',
      startedAt: new Date(),
    },
  });

  try {
    // Create workflow records
    let migratedCount = 0;
    const errors: string[] = [];

    for (const workflow of workflows) {
      try {
        if (workflow.compatible) {
          await prisma.workflow.create({
            data: {
              name: workflow.name.replace(/\.(yml|yaml)$/, ''),
              fileName: workflow.name,
              content: workflow.content,
              githubPath: workflow.path,
              projectId,
            },
          });
          migratedCount++;
        }
      } catch (error: any) {
        errors.push(`Failed to migrate ${workflow.name}: ${error.message}`);
      }
    }

    // Update migration status
    await prisma.migration.update({
      where: { id: migration.id },
      data: {
        status: migratedCount === workflows.length ? 'COMPLETED' : 'FAILED',
        migratedWorkflows: migratedCount,
        errors: errors.length > 0 ? errors.join('\n') : null,
        completedAt: new Date(),
      },
    });

    res.json({
      migrationId: migration.id,
      status: migratedCount === workflows.length ? 'COMPLETED' : 'PARTIAL',
      migratedCount,
      totalCount: workflows.length,
      errors,
    });
  } catch (error: any) {
    await prisma.migration.update({
      where: { id: migration.id },
      data: {
        status: 'FAILED',
        errors: error.message,
        completedAt: new Date(),
      },
    });
    throw error;
  }
}));

// Get migration status
router.get('/:id', asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new AppError('Not authenticated', 401);
  }

  const { id } = req.params;
  const prisma: PrismaClient = req.app.get('prisma');

  const migration = await prisma.migration.findUnique({
    where: { id },
  });

  if (!migration) {
    throw new AppError('Migration not found', 404);
  }

  res.json(migration);
}));

// Get all migrations
router.get('/', asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new AppError('Not authenticated', 401);
  }

  const prisma: PrismaClient = req.app.get('prisma');

  const migrations = await prisma.migration.findMany({
    orderBy: { createdAt: 'desc' },
    take: 50,
  });

  res.json(migrations);
}));

export default router;
