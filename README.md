# Tenki Clone - GitHub Actions Runners Alternative

Kompletny klon platformy Tenki Cloud - alternatywy dla GitHub Actions runners z interfejsem użytkownika, systemem zarządzania projektami i funkcjonalnościami migracji.

## 🚀 Funkcjonalności

### Core Features
- **90% taniej niż GitHub Runners** - optymalizacja kosztów
- **30% szybsze wykonanie** - wysokowydajne serwery bare-metal
- **2-kliknięciowa migracja** - Migration Wizard
- **Autoscaling** - automatyczne skalowanie runnerów
- **12,500 darmowych minut miesięcznie**

### Dashboard & Interface
- Nowoczesny interfejs użytkownika
- Dashboard z metrykami i wykresami
- System workspace i projektów
- Zarządzanie członkami zespołu
- Role-based permissions (Admin/Standard)
- Real-time monitoring workflow runs

### Runner Types
- `tenki-standard-small-2c-4g` - 2 vCPU, 4GB RAM - $0.0008/min
- `tenki-standard-medium-4c-8g` - 4 vCPU, 8GB RAM - $0.0016/min  
- `tenki-standard-large-8c-16g` - 8 vCPU, 16GB RAM - $0.0032/min
- `tenki-standard-large-plus-16c-32g` - 16 vCPU, 32GB RAM - $0.0088/min
- `tenki-standard-autoscale` - Autoscaling - $0.0008/min

### Migration Wizard
- Guided step-by-step migration
- Repository analysis
- Workflow compatibility check
- One-click runner replacement

## 🏗️ Architektura Techniczna

### Frontend
- **Next.js 14** z App Router
- **TypeScript** - type safety
- **Tailwind CSS** - styling
- **shadcn/ui** - komponenty UI
- **Framer Motion** - animacje
- **React Hook Form** - formularze
- **Zustand** - state management

### Backend
- **Node.js/Express** - API server
- **PostgreSQL** - główna baza danych
- **Redis** - cache i session storage
- **JWT** - autentykacja
- **Docker** - konteneryzacja

### Infrastructure
- **GitHub API** - integracja z repository
- **Webhook handlers** - real-time updates 
- **Queue system** - job processing
- **Metrics collection** - monitoring

## 📁 Struktura Projektu

```
tenki-clone/
├── frontend/                 # Next.js aplikacja
│   ├── app/                 # App Router pages
│   ├── components/          # React komponenty
│   ├── lib/                 # Utilities i konfiguracja
│   └── styles/              # CSS i Tailwind
├── backend/                 # Node.js API
│   ├── src/
│   │   ├── routes/          # API endpoints
│   │   ├── models/          # Database models
│   │   ├── middleware/      # Express middleware
│   │   ├── services/        # Business logic
│   │   └── utils/           # Helper functions
│   └── prisma/              # Database schema
├── docker-compose.yml       # Development environment
├── docs/                    # Dokumentacja
└── scripts/                 # Utility scripts
```

## 🎨 Design System

### Kolory
- **Primary**: Blue (#2563eb)
- **Secondary**: Gray (#6b7280) 
- **Success**: Green (#16a34a)
- **Warning**: Yellow (#d97706)
- **Error**: Red (#dc2626)
- **Background**: White/Gray-50
- **Text**: Gray-900/Gray-600

### Typography
- **Font**: Inter (system font)
- **Headings**: Font-semibold/bold
- **Body**: Font-normal
- **Code**: Font-mono

## 🚀 Instalacja i Uruchomienie

### Wymagania
- Node.js 18+
- Docker & Docker Compose
- PostgreSQL 14+
- Redis 6+

### Quick Start

```bash
# Klonowanie repozytorium
git clone https://github.com/arturwyroslak/tenki-clone.git
cd tenki-clone

# Uruchomienie z Docker Compose
docker-compose up -d

# Instalacja zależności
npm install

# Uruchomienie w trybie development
npm run dev
```

### Environment Variables

```env
# Database
DATABASE_URL="postgresql://user:pass@localhost:5432/tenki"
REDIS_URL="redis://localhost:6379"

# GitHub Integration  
GITHUB_CLIENT_ID="your_github_app_id"
GITHUB_CLIENT_SECRET="your_github_app_secret"
GITHUB_WEBHOOK_SECRET="your_webhook_secret"

# Authentication
JWT_SECRET="your_jwt_secret"
NEXTAUTH_SECRET="your_nextauth_secret"

# Application
NEXT_PUBLIC_API_URL="http://localhost:3001"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

## 📊 Funkcjonalności Szczegółowe

### Authentication & Authorization
- GitHub OAuth integration
- JWT-based sessions
- Role-based access control
- Multi-workspace support

### Workspace Management
- Create/manage workspaces
- Invite team members
- Project organization
- Resource allocation

### Runner Management
- Runner provisioning
- Real-time status monitoring
- Cost tracking
- Performance metrics

### Migration Tools
- Repository analysis 
- Workflow parsing
- Compatibility checking
- Automated migration

### Billing & Usage
- Usage tracking
- Cost calculations
- Invoice generation
- Credit management

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/callback` - GitHub OAuth callback
- `POST /api/auth/logout` - User logout

### Workspaces
- `GET /api/workspaces` - List user workspaces
- `POST /api/workspaces` - Create workspace
- `PUT /api/workspaces/:id` - Update workspace
- `DELETE /api/workspaces/:id` - Delete workspace

### Projects  
- `GET /api/projects` - List projects
- `POST /api/projects` - Create project
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

### Runners
- `GET /api/runners` - List runners
- `POST /api/runners` - Create runner
- `GET /api/runners/:id/status` - Runner status
- `DELETE /api/runners/:id` - Delete runner

### GitHub Integration
- `GET /api/github/repos` - List repositories
- `POST /api/github/repos/:id/connect` - Connect repository
- `POST /api/github/migrate` - Migrate workflows
- `POST /api/webhooks/github` - GitHub webhook handler

## 🎯 Roadmap

### Phase 1 (Current)
- [x] Core UI components
- [x] Authentication system
- [x] Basic dashboard
- [ ] Runner management
- [ ] GitHub integration

### Phase 2
- [ ] Migration Wizard
- [ ] Billing system
- [ ] Advanced metrics
- [ ] Team management

### Phase 3
- [ ] API optimizations
- [ ] Advanced runner types
- [ ] Integration plugins
- [ ] Mobile responsiveness

## 📄 Licencja

MIT License - zobacz [LICENSE](LICENSE) dla szczegółów.

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📞 Support

Dla wsparcia technicznego:
- GitHub Issues: [Issues](https://github.com/arturwyroslak/tenki-clone/issues)
- Email: support@tenki-clone.dev

---

**Tenki Clone** - Stworzony z ❤️ jako open-source alternatywa dla drogich GitHub Actions runners.