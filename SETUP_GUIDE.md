# Customer Health Platform - Setup & Installation Guide

## 📋 Prerequisites

- Node.js 20+ (`nvm use` to switch)
- npm 10+
- Docker (for PostgreSQL database)
- Git

---

## 🚀 Quick Start

### 1. Install Dependencies

```bash
# From project root - installs for all workspaces
npm install

# Install React Router for frontend
cd web
npm install react-router-dom@^6
cd ..
```

### 2. Setup Database

```bash
# Start PostgreSQL using Docker Compose
cd infra
docker-compose up -d
cd ..

# Generate Prisma client
npm run prisma:generate -w api

# Run migrations (if any)
npx prisma migrate dev -w api
```

### 3. Configure Environment

Create `.env` file in `api/` directory:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/customer_health?schema=public"
PORT=3000
NODE_ENV=development
```

### 4. Start Development Servers

**Terminal 1 - Backend:**
```bash
npm run dev -w api
# Backend runs on http://localhost:3000
```

**Terminal 2 - Frontend:**
```bash
npm run dev -w web
# Frontend runs on http://localhost:5173
```

---

## 📁 Project Structure

```
customer-health/
├── api/                          # Backend (Node.js + Express)
│   ├── src/
│   │   ├── schemas/             # Zod validation schemas
│   │   ├── middleware/          # Express middleware
│   │   ├── types/               # TypeScript types
│   │   ├── errors/              # Custom error classes
│   │   ├── services/            # Business logic
│   │   ├── routes/              # API endpoints
│   │   ├── lib/                 # Utilities (Prisma)
│   │   ├── app.ts               # Express app setup
│   │   └── index.ts             # Server entry point
│   ├── prisma/
│   │   └── schema.prisma        # Database schema
│   ├── tests/                   # Backend tests
│   └── package.json
│
├── web/                          # Frontend (React + Vite)
│   ├── src/
│   │   ├── api/                 # API client
│   │   ├── components/          # React components
│   │   ├── pages/               # Route pages
│   │   ├── layouts/             # Layout components
│   │   ├── types/               # TypeScript types
│   │   ├── App.tsx              # Main app with routing
│   │   ├── main.tsx             # React entry point
│   │   └── styles.css           # Global styles
│   └── package.json
│
├── infra/                        # Infrastructure
│   └── docker-compose.yml       # PostgreSQL setup
│
├── docs/                         # Documentation
└── package.json                 # Root workspace config
```

---

## 🔧 Available Commands

### Root Level Commands:

```bash
# Install all dependencies
npm install

# Run all linters
npm run lint

# Run all tests
npm test

# Build everything
npm run build
```

### Backend Commands:

```bash
# Development server (with watch)
npm run dev -w api

# Build for production
npm run build -w api

# Run tests
npm test -w api

# Run tests in watch mode
npm run test:watch -w api

# Lint code
npm run lint -w api

# Generate Prisma client
npm run prisma:generate -w api
```

### Frontend Commands:

```bash
# Development server (with HMR)
npm run dev -w web

# Build for production
npm run build -w web

# Preview production build
npm run preview -w web

# Run tests
npm test -w web

# Lint code
npm run lint -w web

# Type checking
npm run typecheck -w web
```

---

## 🧪 Running Tests

### Backend Tests (110+ tests):
```bash
npm test -w api

# With coverage
npm test -- --coverage -w api

# Watch mode
npm run test:watch -w api
```

**Test Coverage:**
- ✅ 30+ validation tests
- ✅ 40+ service layer tests
- ✅ 40+ route integration tests

### Frontend Tests (Coming Soon):
```bash
npm test -w web
```

---

## 🌐 API Endpoints

### Base URL: `http://localhost:3000/api/checklists`

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/` | Create new checklist |
| GET | `/` | List checklists (with filters) |
| GET | `/:id` | Get single checklist |
| PUT | `/:id` | Update checklist |
| DELETE | `/:id` | Delete checklist |
| GET | `/customer/:customerId/stats` | Get customer statistics |

### Query Parameters (List):
- `customerId` - Filter by customer ID
- `minScore` - Minimum score (0-100)
- `maxScore` - Maximum score (0-100)
- `limit` - Items per page (1-100, default: 10)
- `offset` - Pagination offset (default: 0)
- `sortBy` - Sort field: createdAt, updatedAt, score
- `sortOrder` - Sort order: asc, desc

---

## 🎨 Frontend Routes

| Route | Component | Description |
|-------|-----------|-------------|
| `/` | HomePage | List all checklists |
| `/create` | CreatePage | Create new checklist |
| `/edit/:id` | EditPage | Edit existing checklist |
| `/detail/:id` | DetailPage | View checklist details |

---

## 🗄️ Database Setup

### Using Docker (Recommended):

```bash
cd infra
docker-compose up -d

# Check if running
docker ps

# View logs
docker-compose logs -f postgres
```

### Prisma Commands:

```bash
# Generate client after schema changes
npx prisma generate

# Create and apply migrations
npx prisma migrate dev --name <migration_name>

# Open Prisma Studio (DB GUI)
npx prisma studio

# Reset database (⚠️ deletes all data)
npx prisma migrate reset
```

---

## 🐛 Troubleshooting

### Backend won't start:
```bash
# Check if PostgreSQL is running
docker ps

# Check database connection
npx prisma db pull

# Regenerate Prisma client
npm run prisma:generate -w api
```

### Frontend won't start:
```bash
# Clear node_modules and reinstall
cd web
rm -rf node_modules package-lock.json
npm install

# Check if react-router-dom is installed
npm list react-router-dom
```

### Port already in use:
```bash
# Backend (port 3000)
# Change PORT in api/.env

# Frontend (port 5173)
# Vite will auto-increment to 5174, 5175, etc.
```

### Tests failing:
```bash
# Clear test cache
npm test -- --clearCache -w api

# Update snapshots
npm test -- -u -w api
```

---

## 📝 Development Workflow

### 1. Create a new feature:
```bash
# Create feature branch
git checkout -b feature/my-feature

# Make changes...

# Run linters
npm run lint

# Run tests
npm test

# Commit changes
git add .
git commit -m "feat: add my feature"
```

### 2. Backend changes:
```bash
# Update Prisma schema
vim api/prisma/schema.prisma

# Generate client
npm run prisma:generate -w api

# Create migration
npx prisma migrate dev --name add_new_field

# Update types/services/routes as needed
# Add tests
# Run tests
npm test -w api
```

### 3. Frontend changes:
```bash
# Create new component
# Add types
# Add styling
# Update routes if needed
# Add tests (when test suite is ready)
```

---

## 🚢 Production Build

### Build all:
```bash
npm run build
```

### Backend:
```bash
npm run build -w api
# Output: api/dist/
```

### Frontend:
```bash
npm run build -w web
# Output: web/dist/
```

---

## 📚 Additional Resources

- [Prisma Documentation](https://www.prisma.io/docs)
- [Express.js Documentation](https://expressjs.com/)
- [React Documentation](https://react.dev/)
- [React Router Documentation](https://reactrouter.com/)
- [Vite Documentation](https://vitejs.dev/)
- [Zod Documentation](https://zod.dev/)

---

## ✅ Verification Checklist

After setup, verify everything works:

- [ ] Backend starts without errors
- [ ] Frontend starts without errors
- [ ] Can access http://localhost:5173/
- [ ] Can create a new checklist
- [ ] Can view checklist list
- [ ] Can edit a checklist
- [ ] Can view checklist details
- [ ] Can delete a checklist
- [ ] Filters work correctly
- [ ] Pagination works
- [ ] Tests pass (`npm test`)

---

## 🤝 Contributing

1. Follow the existing code style
2. Write tests for new features
3. Run linters before committing
4. Use Conventional Commits format
5. Update documentation as needed

---

## 📄 License

This project is proprietary and confidential.

---

## 💬 Support

For issues or questions:
1. Check the troubleshooting section above
2. Review the documentation in `/docs`
3. Contact the development team

---

**Happy Coding! 🚀**
