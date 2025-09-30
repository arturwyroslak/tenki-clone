import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import { asyncHandler, AppError } from '../middleware/error';
import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';

const router = Router();

// Verify GitHub webhook signature
function verifyGitHubSignature(req: Request): boolean {
  const signature = req.headers['x-hub-signature-256'] as string;
  const secret = process.env.GITHUB_WEBHOOK_SECRET;

  if (!signature || !secret) {
    return false;
  }

  const hmac = crypto.createHmac('sha256', secret);
  const digest = 'sha256=' + hmac.update(JSON.stringify(req.body)).digest('hex');

  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest));
}

// GitHub webhook handler
router.post('/github', asyncHandler(async (req: Request, res: Response) => {
  const prisma: PrismaClient = req.app.get('prisma');
  const io = req.app.get('io');

  // Verify webhook signature
  if (!verifyGitHubSignature(req)) {
    logger.warn('Invalid GitHub webhook signature');
    throw new AppError('Invalid signature', 401);
  }

  const event = req.headers['x-github-event'] as string;
  const payload = req.body;

  logger.info(`Received GitHub webhook: ${event}`);

  try {
    switch (event) {
      case 'push':
        // Handle push event
        logger.info(`Push to ${payload.repository.full_name} by ${payload.pusher.name}`);
        
        // Find projects with this repository
        const projects = await prisma.project.findMany({
          where: {
            githubRepo: payload.repository.full_name,
          },
          include: {
            workspace: true,
          },
        });

        // Emit event to connected clients
        for (const project of projects) {
          io.to(`workspace:${project.workspaceId}`).emit('github:push', {
            projectId: project.id,
            repository: payload.repository.full_name,
            branch: payload.ref.replace('refs/heads/', ''),
            commits: payload.commits,
            pusher: payload.pusher.name,
          });
        }
        break;

      case 'workflow_run':
        // Handle workflow run event
        logger.info(`Workflow run ${payload.workflow_run.id} ${payload.action}`);
        
        // Find corresponding workflow
        const workflows = await prisma.workflow.findMany({
          where: {
            githubPath: {
              contains: payload.workflow.path,
            },
          },
          include: {
            project: {
              include: {
                workspace: true,
              },
            },
          },
        });

        for (const workflow of workflows) {
          io.to(`workspace:${workflow.project.workspaceId}`).emit('workflow:run', {
            workflowId: workflow.id,
            status: payload.workflow_run.status,
            conclusion: payload.workflow_run.conclusion,
            url: payload.workflow_run.html_url,
          });
        }
        break;

      case 'pull_request':
        // Handle pull request event
        logger.info(`Pull request ${payload.action} #${payload.number} in ${payload.repository.full_name}`);
        
        const prProjects = await prisma.project.findMany({
          where: {
            githubRepo: payload.repository.full_name,
          },
          include: {
            workspace: true,
          },
        });

        for (const project of prProjects) {
          io.to(`workspace:${project.workspaceId}`).emit('github:pull_request', {
            projectId: project.id,
            action: payload.action,
            number: payload.number,
            title: payload.pull_request.title,
            user: payload.pull_request.user.login,
          });
        }
        break;

      default:
        logger.info(`Unhandled GitHub webhook event: ${event}`);
    }

    res.json({ status: 'ok' });
  } catch (error: any) {
    logger.error(`Error processing GitHub webhook: ${error.message}`);
    throw error;
  }
}));

// Stripe webhook handler (placeholder)
router.post('/stripe', asyncHandler(async (req: Request, res: Response) => {
  const event = req.body;

  logger.info(`Received Stripe webhook: ${event.type}`);

  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        // Handle successful payment
        logger.info('Payment succeeded');
        break;

      case 'payment_intent.payment_failed':
        // Handle failed payment
        logger.info('Payment failed');
        break;

      default:
        logger.info(`Unhandled Stripe webhook event: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error: any) {
    logger.error(`Error processing Stripe webhook: ${error.message}`);
    throw error;
  }
}));

export default router;
