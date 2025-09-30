import { Router, Response } from 'express';
import jwt from 'jsonwebtoken';
import { Octokit } from '@octokit/rest';
import { asyncHandler, AppError } from '../middleware/error';
import { AuthRequest } from '../types';
import { PrismaClient } from '@prisma/client';

const router = Router();

// GitHub OAuth login
router.get('/login', asyncHandler(async (_req: AuthRequest, res: Response) => {
  const clientId = process.env.GITHUB_CLIENT_ID;
  
  if (!clientId) {
    throw new AppError('GitHub OAuth not configured', 500);
  }

  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback`;
  const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=repo,user:email`;

  res.json({ url: githubAuthUrl });
}));

// GitHub OAuth callback
router.post('/callback', asyncHandler(async (req: AuthRequest, res: Response) => {
  const { code } = req.body;
  const prisma: PrismaClient = req.app.get('prisma');

  if (!code) {
    throw new AppError('Authorization code is required', 400);
  }

  // Exchange code for access token
  const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({
      client_id: process.env.GITHUB_CLIENT_ID,
      client_secret: process.env.GITHUB_CLIENT_SECRET,
      code,
    }),
  });

  const tokenData: any = await tokenResponse.json();

  if (tokenData.error) {
    throw new AppError('GitHub authentication failed', 401);
  }

  const accessToken = tokenData.access_token;

  // Get user info from GitHub
  const octokit = new Octokit({ auth: accessToken });
  const { data: githubUser } = await octokit.users.getAuthenticated();

  // Get or create user
  let user = await prisma.user.findUnique({
    where: { githubId: String(githubUser.id) },
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        email: githubUser.email || `${githubUser.login}@github.local`,
        name: githubUser.name || githubUser.login,
        githubId: String(githubUser.id),
        githubToken: accessToken,
        avatarUrl: githubUser.avatar_url,
      },
    });

    // Create default workspace for new user
    const workspace = await prisma.workspace.create({
      data: {
        name: `${user.name}'s Workspace`,
        slug: `${githubUser.login}-workspace`,
        description: 'Default workspace',
        creatorId: user.id,
      },
    });

    // Add user as admin member
    await prisma.workspaceMember.create({
      data: {
        userId: user.id,
        workspaceId: workspace.id,
        role: 'ADMIN',
      },
    });
  } else {
    // Update GitHub token
    user = await prisma.user.update({
      where: { id: user.id },
      data: { githubToken: accessToken },
    });
  }

  // Generate JWT
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    throw new AppError('JWT_SECRET not configured', 500);
  }

  const token = jwt.sign(
    {
      id: user.id,
      email: user.email,
      name: user.name,
    },
    jwtSecret,
    { expiresIn: '7d' }
  );

  res.json({
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      avatarUrl: user.avatarUrl,
    },
  });
}));

// Logout
router.post('/logout', asyncHandler(async (_req: AuthRequest, res: Response) => {
  // In a stateless JWT system, logout is handled client-side
  res.json({ message: 'Logged out successfully' });
}));

// Get current user
router.get('/me', asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new AppError('Not authenticated', 401);
  }

  const prisma: PrismaClient = req.app.get('prisma');
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: {
      id: true,
      email: true,
      name: true,
      avatarUrl: true,
      createdAt: true,
    },
  });

  if (!user) {
    throw new AppError('User not found', 404);
  }

  res.json(user);
}));

export default router;
