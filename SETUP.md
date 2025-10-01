# Tenki Clone - Setup Guide

This guide will help you set up and run the Tenki Clone application locally.

## Prerequisites

- Node.js 18+ 
- Docker & Docker Compose
- PostgreSQL 14+ (or use Docker)
- Redis 6+ (or use Docker)
- GitHub OAuth App (for authentication)

## Quick Start with Docker

The easiest way to run the application is using Docker Compose:

```bash
# Clone the repository
git clone https://github.com/arturwyroslak/tenki-clone.git
cd tenki-clone

# Copy environment file
cp .env.example .env

# Edit .env file with your GitHub OAuth credentials
# You need to create a GitHub OAuth App first
nano .env

# Start all services
docker-compose up -d

# Wait for services to start, then run migrations
docker-compose exec backend npx prisma migrate dev

# Seed the database with demo data
docker-compose exec backend npm run db:seed
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001

## Manual Setup

### 1. Setup GitHub OAuth App

1. Go to GitHub Settings → Developer settings → OAuth Apps
2. Click "New OAuth App"
3. Fill in the details:
   - Application name: `Tenki Clone (Dev)`
   - Homepage URL: `http://localhost:3000`
   - Authorization callback URL: `http://localhost:3000/auth/callback`
4. Save the Client ID and Client Secret

### 2. Setup Environment Variables

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit `.env` and fill in your values:

```env
# Database
DATABASE_URL="postgresql://tenki:tenki_password@localhost:5432/tenki_db"
REDIS_URL="redis://localhost:6379"

# GitHub Integration
GITHUB_CLIENT_ID="your_github_client_id_here"
GITHUB_CLIENT_SECRET="your_github_client_secret_here"
GITHUB_WEBHOOK_SECRET="your_webhook_secret_here"

# Authentication
JWT_SECRET="your_random_jwt_secret_minimum_32_characters"
NEXTAUTH_SECRET="your_random_nextauth_secret_minimum_32_chars"

# Application URLs
NEXT_PUBLIC_API_URL="http://localhost:3001"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 3. Start Databases

Using Docker:

```bash
docker-compose up -d postgres redis
```

Or install PostgreSQL and Redis locally.

### 4. Setup Backend

```bash
cd backend

# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Seed database (optional)
npm run db:seed

# Start backend server
npm run dev
```

The backend will run on http://localhost:3001

### 5. Setup Frontend

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The frontend will run on http://localhost:3000

## Database Schema

The application uses PostgreSQL with the following main tables:

- `users` - User accounts
- `workspaces` - Workspaces for organizing projects
- `workspace_members` - Workspace membership and roles
- `projects` - Projects within workspaces
- `runners` - CI/CD runners
- `workflows` - GitHub workflow files
- `workflow_runs` - Workflow execution history
- `usage` - Usage tracking
- `invoices` - Billing invoices
- `migrations` - Migration records

## API Endpoints

### Authentication
- `GET /api/auth/login` - GitHub OAuth redirect
- `POST /api/auth/callback` - OAuth callback handler
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout

### Workspaces
- `GET /api/workspaces` - List workspaces
- `POST /api/workspaces` - Create workspace
- `GET /api/workspaces/:id` - Get workspace details
- `PUT /api/workspaces/:id` - Update workspace
- `DELETE /api/workspaces/:id` - Delete workspace
- `POST /api/workspaces/:id/members` - Invite member
- `DELETE /api/workspaces/:id/members/:memberId` - Remove member

### Projects
- `GET /api/projects?workspaceId=:id` - List projects
- `POST /api/projects` - Create project
- `GET /api/projects/:id` - Get project details
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

### Runners
- `GET /api/runners?workspaceId=:id` - List runners
- `POST /api/runners` - Create runner
- `GET /api/runners/:id` - Get runner details
- `GET /api/runners/:id/status` - Get runner status
- `PUT /api/runners/:id` - Update runner
- `DELETE /api/runners/:id` - Delete runner

### GitHub Integration
- `GET /api/github/repos` - List user's repositories
- `POST /api/github/repos/:repoId/connect` - Connect repository
- `GET /api/github/repos/:owner/:repo/workflows` - Get workflows
- `POST /api/github/migrate` - Migrate workflows

### Analytics
- `GET /api/analytics/workspace/:workspaceId` - Workspace analytics
- `GET /api/analytics/project/:projectId` - Project analytics
- `GET /api/analytics/runner/:runnerId` - Runner analytics

### Billing
- `GET /api/billing/usage?workspaceId=:id` - Get usage
- `GET /api/billing/invoices?workspaceId=:id` - List invoices
- `GET /api/billing/invoices/:id` - Get invoice
- `POST /api/billing/payment-intent` - Create payment

### Migration
- `POST /api/migration/analyze` - Analyze repository
- `POST /api/migration/start` - Start migration
- `GET /api/migration/:id` - Get migration status

### Webhooks
- `POST /api/webhooks/github` - GitHub webhook handler
- `POST /api/webhooks/stripe` - Stripe webhook handler

## Runner Types

The application supports the following runner types:

- `SMALL_2C_4G` - 2 vCPU, 4GB RAM - $0.0008/min
- `MEDIUM_4C_8G` - 4 vCPU, 8GB RAM - $0.0016/min
- `LARGE_8C_16G` - 8 vCPU, 16GB RAM - $0.0032/min
- `LARGE_PLUS_16C_32G` - 16 vCPU, 32GB RAM - $0.0088/min
- `AUTOSCALE` - Autoscaling - $0.0008/min

## Development

### Backend Development

```bash
cd backend

# Run in development mode with auto-reload
npm run dev

# Type checking
npm run build

# Linting
npm run lint

# Run Prisma Studio (database GUI)
npm run db:studio
```

### Frontend Development

```bash
cd frontend

# Run in development mode
npm run dev

# Type checking
npm run type-check

# Linting
npm run lint

# Build for production
npm run build
```

## Testing

### Demo Credentials

After running `npm run db:seed` in the backend, you can use these demo credentials:

- Email: `demo@tenki.dev`
- GitHub ID: `12345678`

Demo data includes:
- 1 Workspace
- 1 Project
- 2 Runners
- 1 Workflow with 2 runs
- Usage and invoice records

## Troubleshooting

### Database Connection Issues

If you can't connect to the database:

1. Make sure PostgreSQL is running
2. Check DATABASE_URL in .env
3. Try running migrations: `npx prisma migrate dev`

### GitHub OAuth Issues

If GitHub authentication fails:

1. Verify your GitHub OAuth app credentials
2. Check that callback URL matches exactly
3. Ensure GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET are set

### Backend Won't Start

1. Check if port 3001 is already in use
2. Verify all environment variables are set
3. Make sure Prisma client is generated: `npx prisma generate`

### Frontend Won't Start

1. Check if port 3000 is already in use
2. Verify NEXT_PUBLIC_API_URL points to backend
3. Clear .next folder: `rm -rf .next`

## Production Deployment

For production deployment:

1. Set NODE_ENV=production
2. Use strong secrets for JWT_SECRET and NEXTAUTH_SECRET
3. Use production database credentials
4. Enable SSL/TLS
5. Set up proper CORS origins
6. Configure rate limiting appropriately
7. Set up monitoring and logging
8. Use environment-specific .env files

## Support

For issues or questions:
- GitHub Issues: https://github.com/arturwyroslak/tenki-clone/issues
- Documentation: See README.md

## License

MIT License - see LICENSE file for details
