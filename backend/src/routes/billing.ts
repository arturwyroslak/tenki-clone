import { Router, Response } from 'express';
import { asyncHandler, AppError } from '../middleware/error';
import { AuthRequest } from '../types';
import { PrismaClient } from '@prisma/client';

const router = Router();

// Get usage for workspace
router.get('/usage', asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new AppError('Not authenticated', 401);
  }

  const { workspaceId, startDate, endDate } = req.query;
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

  const where: any = {
    workspaceId: workspaceId as string,
  };

  if (startDate || endDate) {
    where.date = {};
    if (startDate) where.date.gte = new Date(startDate as string);
    if (endDate) where.date.lte = new Date(endDate as string);
  }

  const usage = await prisma.usage.findMany({
    where,
    orderBy: { date: 'desc' },
  });

  const totalMinutes = usage.reduce((sum: number, u: any) => sum + u.minutes, 0);
  const totalCost = usage.reduce((sum: number, u: any) => sum + u.cost, 0);

  res.json({
    usage,
    summary: {
      totalMinutes,
      totalCost,
      freeMinutes: 12500,
      remainingFreeMinutes: Math.max(0, 12500 - totalMinutes),
    },
  });
}));

// Get invoices for workspace
router.get('/invoices', asyncHandler(async (req: AuthRequest, res: Response) => {
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

  const invoices = await prisma.invoice.findMany({
    where: { workspaceId: workspaceId as string },
    orderBy: { createdAt: 'desc' },
  });

  res.json(invoices);
}));

// Get invoice by ID
router.get('/invoices/:id', asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new AppError('Not authenticated', 401);
  }

  const { id } = req.params;
  const prisma: PrismaClient = req.app.get('prisma');

  const invoice = await prisma.invoice.findUnique({
    where: { id },
    include: {
      workspace: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  if (!invoice) {
    throw new AppError('Invoice not found', 404);
  }

  // Check if user is member of workspace
  const member = await prisma.workspaceMember.findFirst({
    where: {
      workspaceId: invoice.workspaceId,
      userId: req.user.id,
    },
  });

  if (!member) {
    throw new AppError('Not authorized to access this invoice', 403);
  }

  res.json(invoice);
}));

// Create payment intent (placeholder for Stripe integration)
router.post('/payment-intent', asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new AppError('Not authenticated', 401);
  }

  const { invoiceId } = req.body;
  const prisma: PrismaClient = req.app.get('prisma');

  if (!invoiceId) {
    throw new AppError('Invoice ID is required', 400);
  }

  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
  });

  if (!invoice) {
    throw new AppError('Invoice not found', 404);
  }

  // Check if user is member of workspace
  const member = await prisma.workspaceMember.findFirst({
    where: {
      workspaceId: invoice.workspaceId,
      userId: req.user.id,
    },
  });

  if (!member) {
    throw new AppError('Not authorized to pay this invoice', 403);
  }

  // TODO: Implement Stripe payment intent creation
  res.json({
    clientSecret: 'placeholder_client_secret',
    amount: invoice.amount,
  });
}));

// Update invoice status
router.put('/invoices/:id', asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new AppError('Not authenticated', 401);
  }

  const { id } = req.params;
  const { status } = req.body;
  const prisma: PrismaClient = req.app.get('prisma');

  const invoice = await prisma.invoice.findUnique({
    where: { id },
  });

  if (!invoice) {
    throw new AppError('Invoice not found', 404);
  }

  // Check if user is admin of workspace
  const member = await prisma.workspaceMember.findFirst({
    where: {
      workspaceId: invoice.workspaceId,
      userId: req.user.id,
      role: 'ADMIN',
    },
  });

  if (!member) {
    throw new AppError('Only workspace admins can update invoices', 403);
  }

  const updatedInvoice = await prisma.invoice.update({
    where: { id },
    data: {
      status,
      ...(status === 'PAID' && { paidAt: new Date() }),
    },
  });

  res.json(updatedInvoice);
}));

export default router;
