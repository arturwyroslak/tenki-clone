import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seed...');

  // Clean existing data (optional, for development)
  console.log('Cleaning existing data...');
  await prisma.workflowRun.deleteMany();
  await prisma.workflow.deleteMany();
  await prisma.runner.deleteMany();
  await prisma.project.deleteMany();
  await prisma.usage.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.migration.deleteMany();
  await prisma.workspaceMember.deleteMany();
  await prisma.workspace.deleteMany();
  await prisma.user.deleteMany();

  console.log('Creating demo user...');
  const user = await prisma.user.create({
    data: {
      email: 'demo@tenki.dev',
      name: 'Demo User',
      githubId: '12345678',
      avatarUrl: 'https://avatars.githubusercontent.com/u/12345678',
    },
  });

  console.log('Creating demo workspace...');
  const workspace = await prisma.workspace.create({
    data: {
      name: 'Demo Workspace',
      slug: 'demo-workspace',
      description: 'A demo workspace for testing',
      creatorId: user.id,
    },
  });

  console.log('Adding user as workspace admin...');
  await prisma.workspaceMember.create({
    data: {
      userId: user.id,
      workspaceId: workspace.id,
      role: 'ADMIN',
    },
  });

  console.log('Creating demo project...');
  const project = await prisma.project.create({
    data: {
      name: 'Demo Project',
      description: 'A demo project for testing',
      githubRepo: 'demo-user/demo-repo',
      workspaceId: workspace.id,
    },
  });

  console.log('Creating demo runners...');
  const runners = await Promise.all([
    prisma.runner.create({
      data: {
        name: 'Runner 1 - Small',
        type: 'SMALL_2C_4G',
        cores: 2,
        memory: 4,
        pricePerMin: 0.0008,
        status: 'IDLE',
        workspaceId: workspace.id,
      },
    }),
    prisma.runner.create({
      data: {
        name: 'Runner 2 - Medium',
        type: 'MEDIUM_4C_8G',
        cores: 4,
        memory: 8,
        pricePerMin: 0.0016,
        status: 'BUSY',
        workspaceId: workspace.id,
      },
    }),
  ]);

  console.log('Creating demo workflows...');
  const workflow = await prisma.workflow.create({
    data: {
      name: 'CI Build',
      fileName: 'ci.yml',
      content: `name: CI
on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Build
        run: npm run build
      - name: Test
        run: npm test`,
      githubPath: '.github/workflows/ci.yml',
      projectId: project.id,
    },
  });

  console.log('Creating demo workflow runs...');
  await Promise.all([
    prisma.workflowRun.create({
      data: {
        status: 'SUCCESS',
        startedAt: new Date('2024-01-01T10:00:00Z'),
        completedAt: new Date('2024-01-01T10:05:00Z'),
        duration: 300,
        cost: 0.24,
        workflowId: workflow.id,
        runnerId: runners[0].id,
      },
    }),
    prisma.workflowRun.create({
      data: {
        status: 'RUNNING',
        startedAt: new Date(),
        workflowId: workflow.id,
        runnerId: runners[1].id,
      },
    }),
  ]);

  console.log('Creating demo usage records...');
  await prisma.usage.create({
    data: {
      minutes: 1500,
      cost: 1.2,
      date: new Date(),
      workspaceId: workspace.id,
    },
  });

  console.log('Creating demo invoice...');
  await prisma.invoice.create({
    data: {
      amount: 10.5,
      status: 'PAID',
      periodStart: new Date('2024-01-01'),
      periodEnd: new Date('2024-01-31'),
      paidAt: new Date('2024-02-01'),
      workspaceId: workspace.id,
    },
  });

  console.log('Seed completed successfully!');
  console.log(`
  Demo credentials:
  - Email: demo@tenki.dev
  - GitHub ID: 12345678
  
  Created:
  - 1 User
  - 1 Workspace
  - 1 Project
  - 2 Runners
  - 1 Workflow with 2 runs
  - 1 Usage record
  - 1 Invoice
  `);
}

main()
  .catch((e) => {
    console.error('Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
