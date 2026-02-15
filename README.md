# 🚀 Real-Time Task Collaboration Platform

A full-stack real-time task management application similar to Trello/Notion, built with React, Node.js, PostgreSQL, and Socket.io.

## ✨ Features

- ✅ User Authentication (Signup/Login)
- 📋 Create and manage Boards
- 📝 Create Lists within Boards
- ✏️ Create, Update, Delete Tasks
- 🎯 Drag & Drop tasks across lists
- 👥 Assign users to tasks
- ⚡ Real-time updates across multiple users
- 📜 Activity history tracking
- 🔍 Search and pagination
- 📱 Responsive design

## 🏗️ Architecture

### Frontend
- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: TailwindCSS
- **State Management**: React Query + Context API
- **Real-time**: Socket.io-client
- **Drag & Drop**: @dnd-kit/core
- **Routing**: React Router v6

### Backend
- **Runtime**: Node.js + Express
- **Language**: TypeScript
- **ORM**: Prisma
- **Database**: PostgreSQL
- **Real-time**: Socket.io
- **Authentication**: JWT + bcrypt
- **Validation**: Zod

## 📊 Database Schema

```
┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│    User     │       │    Board    │       │    List     │
├─────────────┤       ├─────────────┤       ├─────────────┤
│ id          │───┐   │ id          │───┐   │ id          │
│ email       │   │   │ name        │   │   │ name        │
│ password    │   │   │ description │   │   │ position    │
│ name        │   │   │ ownerId     │───┘   │ boardId     │───┐
│ createdAt   │   │   │ createdAt   │       │ createdAt   │   │
└─────────────┘   │   └─────────────┘       └─────────────┘   │
                  │                                            │
                  │   ┌─────────────┐       ┌─────────────┐   │
                  │   │    Task     │       │  TaskUser   │   │
                  │   ├─────────────┤       ├─────────────┤   │
                  └───│ id          │   ┌───│ taskId      │   │
                      │ title       │   │   │ userId      │   │
                      │ description │   │   │ assignedAt  │   │
                      │ position    │   │   └─────────────┘   │
                      │ listId      │───┘                     │
                      │ createdById │                         │
                      │ createdAt   │                         │
                      │ updatedAt   │                         │
                      └─────────────┘                         │
                                                              │
                      ┌─────────────┐                         │
                      │  Activity   │                         │
                      ├─────────────┤                         │
                      │ id          │                         │
                      │ type        │                         │
                      │ description │                         │
                      │ userId      │                         │
                      │ boardId     │                         │
                      │ taskId      │                         │
                      │ createdAt   │                         │
                      └─────────────┘
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd task-collab-platform
```

2. **Backend Setup**
```bash
cd backend
npm install
```

3. **Configure Environment**
```bash
# Copy example env file
cp .env.example .env

# Update .env with your database credentials
DATABASE_URL="postgresql://user:password@localhost:5432/taskcollab"
JWT_SECRET="your-super-secret-jwt-key-change-this"
PORT=5000
```

4. **Database Setup**
```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Seed database (optional)
npm run seed
```

5. **Start Backend**
```bash
npm run dev
```

6. **Frontend Setup** (in new terminal)
```bash
cd frontend
npm install
npm run dev
```

7. **Access Application**
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000
- API Docs: http://localhost:5000/api-docs

### Demo Credentials
```
Email: demo@example.com
Password: Demo123!

Email: alice@example.com
Password: Alice123!

Email: bob@example.com
Password: Bob123!
```

## 📚 API Documentation

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Boards
- `GET /api/boards` - Get all boards (with pagination)
- `POST /api/boards` - Create board
- `GET /api/boards/:id` - Get board details
- `PUT /api/boards/:id` - Update board
- `DELETE /api/boards/:id` - Delete board

### Lists
- `POST /api/boards/:boardId/lists` - Create list
- `PUT /api/lists/:id` - Update list
- `DELETE /api/lists/:id` - Delete list
- `PUT /api/lists/:id/position` - Update list position

### Tasks
- `POST /api/lists/:listId/tasks` - Create task
- `GET /api/tasks/:id` - Get task details
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task
- `PUT /api/tasks/:id/move` - Move task to different list
- `POST /api/tasks/:id/assign` - Assign user to task
- `DELETE /api/tasks/:id/unassign/:userId` - Unassign user

### Activities
- `GET /api/boards/:boardId/activities` - Get board activities (paginated)

### Search
- `GET /api/search?q=query&boardId=id` - Search tasks

## 🔌 Real-Time Events

### Socket.io Events

**Client -> Server**
- `join:board` - Join board room
- `leave:board` - Leave board room

**Server -> Client**
- `board:updated` - Board updated
- `list:created` - New list created
- `list:updated` - List updated
- `list:deleted` - List deleted
- `task:created` - New task created
- `task:updated` - Task updated
- `task:deleted` - Task deleted
- `task:moved` - Task moved to different list
- `activity:created` - New activity

## 🧪 Testing

### Backend Tests
```bash
cd backend
npm test
```

### Frontend Tests
```bash
cd frontend
npm test
```

## 📈 Scalability Considerations

1. **Database**
   - Indexes on frequently queried fields (boardId, listId, userId)
   - Composite indexes for position-based queries
   - Connection pooling configured

2. **Caching**
   - Redis ready integration points
   - Query result caching with React Query

3. **Real-time**
   - Socket.io rooms for board-level isolation
   - Event throttling for high-frequency updates
   - Ready for Redis adapter for horizontal scaling

4. **API**
   - Pagination implemented on all list endpoints
   - Rate limiting ready
   - Request validation with Zod

5. **Frontend**
   - Code splitting with lazy loading
   - Optimistic updates for better UX
   - Virtual scrolling for large lists (ready)

## 🏭 Production Deployment

### Environment Variables
```env
# Backend
DATABASE_URL=
JWT_SECRET=
PORT=5000
NODE_ENV=production
CORS_ORIGIN=https://your-frontend-domain.com

# Frontend
VITE_API_URL=https://your-api-domain.com
VITE_WS_URL=https://your-api-domain.com
```

### Deployment Options
- **Backend**: Railway, Render, Heroku, AWS ECS
- **Frontend**: Vercel, Netlify, AWS S3 + CloudFront
- **Database**: Railway, Render, AWS RDS, DigitalOcean

## 🎯 Assumptions & Trade-offs

### Assumptions
1. Users must be authenticated to access any board
2. Board owner has full permissions (can add future RBAC)
3. Tasks can only be assigned to users who have access to the board
4. Real-time updates prioritize consistency over absolute performance

### Trade-offs
1. **Prisma ORM**: Easier development vs raw SQL performance
2. **JWT Auth**: Stateless vs refresh token rotation
3. **Socket.io**: Easy real-time vs WebRTC for peer-to-peer
4. **Monorepo**: Single repo vs separate repos for scaling

## 📝 Project Structure

```
task-collab-platform/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   ├── migrations/
│   │   └── seed.ts
│   ├── src/
│   │   ├── config/
│   │   ├── middleware/
│   │   ├── routes/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── utils/
│   │   ├── types/
│   │   └── server.ts
│   ├── tests/
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── contexts/
│   │   ├── types/
│   │   └── main.tsx
│   ├── public/
│   └── package.json
└── README.md
```

## 🤝 Contributing

This is an interview assignment project. For educational purposes only.

## 📄 License

MIT License

---

Built with ❤️ by [Your Name]
