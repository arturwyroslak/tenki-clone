# Tenki Clone API Documentation

Base URL: `http://localhost:3001/api`

All endpoints (except `/auth/*` and `/webhooks/*`) require authentication via Bearer token.

## Authentication

### Login with GitHub
```
GET /auth/login
```

Returns GitHub OAuth authorization URL.

**Response:**
```json
{
  "url": "https://github.com/login/oauth/authorize?client_id=..."
}
```

### OAuth Callback
```
POST /auth/callback
```

**Request Body:**
```json
{
  "code": "github_oauth_code"
}
```

**Response:**
```json
{
  "token": "jwt_token",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "name": "User Name",
    "avatarUrl": "https://..."
  }
}
```

### Get Current User
```
GET /auth/me
Headers: Authorization: Bearer {token}
```

**Response:**
```json
{
  "id": "user_id",
  "email": "user@example.com",
  "name": "User Name",
  "avatarUrl": "https://...",
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

### Logout
```
POST /auth/logout
Headers: Authorization: Bearer {token}
```

**Response:**
```json
{
  "message": "Logged out successfully"
}
```

## Workspaces

### List Workspaces
```
GET /workspaces
Headers: Authorization: Bearer {token}
```

**Response:**
```json
[
  {
    "id": "workspace_id",
    "name": "My Workspace",
    "slug": "my-workspace",
    "description": "Workspace description",
    "creator": {
      "id": "user_id",
      "name": "User Name",
      "email": "user@example.com",
      "avatarUrl": "https://..."
    },
    "members": [...],
    "_count": {
      "projects": 5,
      "runners": 3
    },
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
]
```

### Create Workspace
```
POST /workspaces
Headers: Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "name": "New Workspace",
  "description": "Optional description"
}
```

### Get Workspace
```
GET /workspaces/:id
Headers: Authorization: Bearer {token}
```

### Update Workspace
```
PUT /workspaces/:id
Headers: Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "name": "Updated Name",
  "description": "Updated description"
}
```

### Delete Workspace
```
DELETE /workspaces/:id
Headers: Authorization: Bearer {token}
```

### Invite Member
```
POST /workspaces/:id/members
Headers: Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "email": "member@example.com",
  "role": "STANDARD" // or "ADMIN"
}
```

### Remove Member
```
DELETE /workspaces/:id/members/:memberId
Headers: Authorization: Bearer {token}
```

## Projects

### List Projects
```
GET /projects?workspaceId={workspace_id}
Headers: Authorization: Bearer {token}
```

### Create Project
```
POST /projects
Headers: Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "name": "Project Name",
  "description": "Optional description",
  "githubRepo": "owner/repo",
  "workspaceId": "workspace_id"
}
```

### Get Project
```
GET /projects/:id
Headers: Authorization: Bearer {token}
```

### Update Project
```
PUT /projects/:id
Headers: Authorization: Bearer {token}
```

### Delete Project
```
DELETE /projects/:id
Headers: Authorization: Bearer {token}
```

## Runners

### List Runners
```
GET /runners?workspaceId={workspace_id}
Headers: Authorization: Bearer {token}
```

### Create Runner
```
POST /runners
Headers: Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "name": "Runner Name",
  "type": "MEDIUM_4C_8G", // SMALL_2C_4G, MEDIUM_4C_8G, LARGE_8C_16G, LARGE_PLUS_16C_32G, AUTOSCALE
  "workspaceId": "workspace_id"
}
```

### Get Runner
```
GET /runners/:id
Headers: Authorization: Bearer {token}
```

### Get Runner Status
```
GET /runners/:id/status
Headers: Authorization: Bearer {token}
```

**Response:**
```json
{
  "id": "runner_id",
  "name": "Runner Name",
  "status": "IDLE", // IDLE, BUSY, OFFLINE, ERROR
  "type": "MEDIUM_4C_8G",
  "cores": 4,
  "memory": 8,
  "ipAddress": "10.0.0.1"
}
```

### Update Runner
```
PUT /runners/:id
Headers: Authorization: Bearer {token}
```

### Delete Runner
```
DELETE /runners/:id
Headers: Authorization: Bearer {token}
```

## GitHub Integration

### List Repositories
```
GET /github/repos
Headers: Authorization: Bearer {token}
```

**Response:**
```json
[
  {
    "id": 123,
    "name": "repo-name",
    "fullName": "owner/repo-name",
    "private": false,
    "description": "Repository description",
    "url": "https://github.com/owner/repo-name",
    "defaultBranch": "main"
  }
]
```

### Connect Repository
```
POST /github/repos/:repoId/connect
Headers: Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "projectId": "project_id"
}
```

### Get Workflows
```
GET /github/repos/:owner/:repo/workflows
Headers: Authorization: Bearer {token}
```

**Response:**
```json
[
  {
    "name": "ci.yml",
    "path": ".github/workflows/ci.yml",
    "content": "workflow content..."
  }
]
```

### Migrate Workflows
```
POST /github/migrate
Headers: Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "projectId": "project_id",
  "workflows": [
    {
      "name": "ci.yml",
      "path": ".github/workflows/ci.yml",
      "content": "workflow content..."
    }
  ]
}
```

## Analytics

### Workspace Analytics
```
GET /analytics/workspace/:workspaceId
Headers: Authorization: Bearer {token}
```

**Response:**
```json
{
  "workspace": {
    "id": "workspace_id",
    "name": "Workspace Name",
    "projectCount": 5,
    "runnerCount": 3,
    "memberCount": 2
  },
  "usage": {
    "totalMinutes": 1500,
    "totalCost": 1.2,
    "dailyUsage": [...]
  },
  "workflowRuns": {
    "total": 100,
    "successful": 85,
    "failed": 15,
    "successRate": 85
  },
  "runners": {
    "total": 3,
    "idle": 2,
    "busy": 1,
    "offline": 0
  }
}
```

### Project Analytics
```
GET /analytics/project/:projectId
Headers: Authorization: Bearer {token}
```

### Runner Analytics
```
GET /analytics/runner/:runnerId
Headers: Authorization: Bearer {token}
```

## Billing

### Get Usage
```
GET /billing/usage?workspaceId={workspace_id}&startDate={date}&endDate={date}
Headers: Authorization: Bearer {token}
```

**Response:**
```json
{
  "usage": [...],
  "summary": {
    "totalMinutes": 1500,
    "totalCost": 1.2,
    "freeMinutes": 12500,
    "remainingFreeMinutes": 11000
  }
}
```

### List Invoices
```
GET /billing/invoices?workspaceId={workspace_id}
Headers: Authorization: Bearer {token}
```

### Get Invoice
```
GET /billing/invoices/:id
Headers: Authorization: Bearer {token}
```

### Create Payment Intent
```
POST /billing/payment-intent
Headers: Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "invoiceId": "invoice_id"
}
```

### Update Invoice Status
```
PUT /billing/invoices/:id
Headers: Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "status": "PAID" // PENDING, PAID, OVERDUE
}
```

## Migration

### Analyze Repository
```
POST /migration/analyze
Headers: Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "repoOwner": "owner",
  "repoName": "repo-name"
}
```

**Response:**
```json
{
  "repository": {...},
  "analysis": {
    "totalWorkflows": 5,
    "compatibleWorkflows": 4,
    "incompatibleWorkflows": 1,
    "estimatedMigrationTime": 10
  },
  "workflows": [...]
}
```

### Start Migration
```
POST /migration/start
Headers: Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "projectId": "project_id",
  "repoOwner": "owner",
  "repoName": "repo-name",
  "workflows": [...]
}
```

### Get Migration Status
```
GET /migration/:id
Headers: Authorization: Bearer {token}
```

### List Migrations
```
GET /migration
Headers: Authorization: Bearer {token}
```

## Webhooks

### GitHub Webhook
```
POST /webhooks/github
Headers: X-Hub-Signature-256: sha256=...
```

Handles GitHub webhook events (push, workflow_run, pull_request).

### Stripe Webhook
```
POST /webhooks/stripe
```

Handles Stripe webhook events (payment_intent.succeeded, etc.).

## Error Responses

All endpoints return errors in this format:

```json
{
  "status": "error",
  "message": "Error description"
}
```

### Common HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

## Rate Limiting

The API implements rate limiting:
- 100 requests per 15 minutes per IP
- Returns 429 when limit exceeded

## WebSocket Events

The application uses Socket.IO for real-time updates:

### Events Emitted to Clients

- `github:push` - Push event from GitHub
- `workflow:run` - Workflow run status update
- `github:pull_request` - Pull request event

### Client Events

- `join-workspace` - Join workspace room
- `leave-workspace` - Leave workspace room

Connect to: `http://localhost:3001`
