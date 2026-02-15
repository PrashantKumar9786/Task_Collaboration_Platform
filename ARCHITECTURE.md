# 🏗️ ARCHITECTURE DOCUMENTATION

## System Overview

This is a full-stack real-time task collaboration platform built with modern web technologies. The system follows a client-server architecture with WebSocket support for real-time features.

```
┌─────────────────────────────────────────────────────────────┐
│                         CLIENT TIER                          │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐            │
│  │   React    │  │   Socket   │  │   React    │            │
│  │    SPA     │  │   Client   │  │   Query    │            │
│  └────────────┘  └────────────┘  └────────────┘            │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        │ HTTP/REST & WebSocket
                        │
┌───────────────────────┴─────────────────────────────────────┐
│                       API GATEWAY TIER                       │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐            │
│  │  Express   │  │  Socket.io │  │    JWT     │            │
│  │   Server   │  │   Server   │  │    Auth    │            │
│  └────────────┘  └────────────┘  └────────────┘            │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        │ Prisma ORM
                        │
┌───────────────────────┴─────────────────────────────────────┐
│                       DATABASE TIER                          │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              PostgreSQL Database                      │   │
│  │  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────────┐  │   │
│  │  │Users │ │Boards│ │Lists │ │Tasks │ │Activities│  │   │
│  │  └──────┘ └──────┘ └──────┘ └──────┘ └──────────┘  │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## Frontend Architecture

### Technology Stack
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite (fast HMR, optimized builds)
- **Styling**: TailwindCSS (utility-first CSS)
- **State Management**: 
  - React Query (server state)
  - Context API (authentication)
- **Routing**: React Router v6
- **Real-time**: Socket.io-client
- **Drag & Drop**: @dnd-kit

### Component Hierarchy

```
App
├── AuthProvider (Context)
│   └── QueryClientProvider
│       └── Router
│           ├── Login (Public)
│           ├── Register (Public)
│           ├── Boards (Protected)
│           │   └── BoardCard[]
│           └── BoardView (Protected)
│               ├── Header
│               ├── DndContext
│               │   └── ListComponent[]
│               │       └── TaskCard[]
│               └── AddList
```

### State Management Strategy

#### Server State (React Query)
- **Purpose**: Manage data from API (boards, lists, tasks)
- **Benefits**: Automatic caching, background refetching, optimistic updates
- **Queries**: 
  - `boards` - List of all boards
  - `board/:id` - Single board with lists and tasks
- **Mutations**: 
  - Create/Update/Delete operations
  - Automatic cache invalidation

#### Client State (Context API)
- **AuthContext**: User authentication state
  - Current user
  - Token
  - Login/Logout methods
  - Auto-reconnect socket on auth

### Real-Time Synchronization

```javascript
// On Board Mount
1. Join socket room: `board:${boardId}`
2. Listen to events:
   - list:created
   - list:updated
   - task:created
   - task:moved
   - etc.
3. On event → Invalidate React Query cache
4. React Query → Auto-refetch → UI updates

// On Board Unmount
1. Leave socket room
2. Remove all event listeners
```

### Drag & Drop Implementation

```
User Drags Task
    ↓
@dnd-kit captures event
    ↓
onDragEnd handler
    ↓
Calculate new position
    ↓
API Call: PUT /tasks/:id/move
    ↓
Optimistic UI Update (optional)
    ↓
Socket broadcast to other users
    ↓
All clients refresh
```

---

## Backend Architecture

### Technology Stack
- **Runtime**: Node.js + Express
- **Language**: TypeScript
- **ORM**: Prisma (type-safe queries)
- **Database**: PostgreSQL
- **Authentication**: JWT + bcrypt
- **Real-time**: Socket.io
- **Validation**: Zod

### Layered Architecture

```
Request Flow:

Client Request
    ↓
Express Middleware (CORS, Auth, Body Parser)
    ↓
Route Handler
    ↓
Controller (Request/Response handling)
    ↓
Service Layer (Business Logic)
    ↓
Prisma ORM
    ↓
PostgreSQL Database
    ↓
Response + Socket.io Broadcast
    ↓
Client Update
```

### Service Layer Pattern

Each domain has a dedicated service:
- **AuthService**: User registration, login, token generation
- **BoardService**: Board CRUD, ownership validation
- **ListService**: List CRUD, position management
- **TaskService**: Task CRUD, move operations, assignments
- **ActivityService**: Activity logging and retrieval

### Authentication Flow

```
1. User Login
   ↓
2. Validate credentials (bcrypt)
   ↓
3. Generate JWT token
   ↓
4. Return token + user data
   ↓
5. Client stores token
   ↓
6. Subsequent requests include token in header
   ↓
7. Middleware validates token
   ↓
8. Attach user to request object
```

### Real-Time Architecture

```
Socket.io Server Setup:
1. HTTP server created
2. Socket.io attached to HTTP server
3. JWT middleware for socket authentication
4. Room-based isolation (board:${id})

Event Flow:
1. Client performs action (e.g., create task)
2. REST API endpoint called
3. Database updated
4. Success response sent to client
5. Socket.io broadcasts event to room
6. All other clients receive event
7. Clients invalidate cache and refetch
```

---

## Database Design

### Schema Overview

```sql
Users (1) ──────→ (N) Boards (owner)
  │
  └──────→ (N) Tasks (creator)
  └──────→ (N) TaskUsers (assignments)
  └──────→ (N) Activities

Boards (1) ─────→ (N) Lists
  └──────→ (N) Activities

Lists (1) ──────→ (N) Tasks

Tasks (1) ──────→ (N) TaskUsers
  └──────→ (N) Activities
```

### Key Design Decisions

#### 1. Position Fields
- Lists and Tasks have `position` (integer)
- Enables drag & drop ordering
- Reordered in transactions for consistency

#### 2. Soft vs Hard Deletes
- Current: Hard deletes (CASCADE)
- Future: Could add `deletedAt` for soft deletes

#### 3. TaskUser Junction Table
- Many-to-many relationship
- Tracks assignment timestamp
- Allows multiple users per task

#### 4. Activity Logging
- Enum-based activity types
- Polymorphic references (taskId nullable)
- Metadata field (JSONB) for extensibility

### Indexes for Performance

```prisma
// Critical indexes for query performance:
@@index([email])           // User lookup
@@index([ownerId])         // User's boards
@@index([boardId])         // Board's lists
@@index([listId])          // List's tasks
@@index([boardId, position]) // Ordered lists
@@index([listId, position])  // Ordered tasks
@@index([boardId, createdAt]) // Activities timeline
```

---

## API Design

### RESTful Principles

- **Resource-based URLs**: `/boards/:id/lists`
- **HTTP Methods**: GET, POST, PUT, DELETE
- **Status Codes**: 200 (OK), 201 (Created), 400 (Bad Request), 401 (Unauthorized), 404 (Not Found)
- **JSON Responses**: Consistent structure

### Example API Endpoints

```
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/profile

GET    /api/boards
POST   /api/boards
GET    /api/boards/:id
PUT    /api/boards/:id
DELETE /api/boards/:id

POST   /api/boards/:boardId/lists
PUT    /api/lists/:id
DELETE /api/lists/:id

POST   /api/lists/:listId/tasks
GET    /api/tasks/:id
PUT    /api/tasks/:id
DELETE /api/tasks/:id
PUT    /api/tasks/:id/move

POST   /api/tasks/:taskId/assign
DELETE /api/tasks/:taskId/unassign/:userId

GET    /api/boards/:boardId/activities
GET    /api/search?q=query&boardId=id
```

### Error Handling

```typescript
// Consistent error responses
{
  "error": "User-friendly message",
  "details": [...validation errors] // optional
}
```

---

## Security Considerations

### Authentication
- Passwords hashed with bcrypt (10 rounds)
- JWT tokens (7-day expiration)
- Token required for all protected routes
- Socket.io connections authenticated

### Authorization
- Board ownership checked on all operations
- Users can only access their own boards
- Future: Add shared boards with permissions

### Input Validation
- Zod schemas validate all inputs
- SQL injection prevented (Prisma parameterized queries)
- XSS prevention (React auto-escapes)

---

## Scalability Considerations

### Current Implementation

1. **Database Pooling**: Prisma manages connection pool
2. **Indexes**: Optimized for common queries
3. **Pagination**: All list endpoints support pagination
4. **Socket.io Rooms**: Prevent broadcast storms

### Future Enhancements

1. **Horizontal Scaling**:
   - Redis for Socket.io adapter
   - Session storage in Redis
   - Load balancer (Nginx)

2. **Caching Layer**:
   - Redis for frequently accessed data
   - CDN for static assets

3. **Database Optimization**:
   - Read replicas for scaling reads
   - Database sharding by user/board

4. **Code Splitting**:
   - Lazy load routes
   - Virtual scrolling for large lists

---

## Testing Strategy

### Backend Tests
- Unit tests for services
- Integration tests for API endpoints
- E2E tests for critical flows

### Frontend Tests
- Component tests (React Testing Library)
- Integration tests for user flows
- E2E tests (Cypress/Playwright)

---

## Deployment Architecture

### Production Stack

```
┌─────────────────────────────────────────────┐
│           CDN (Cloudflare/CloudFront)        │
│               (Static Assets)                │
└──────────────────┬──────────────────────────┘
                   │
┌──────────────────┴──────────────────────────┐
│         Frontend (Vercel/Netlify)            │
│              (React Build)                   │
└──────────────────┬──────────────────────────┘
                   │
                   │ HTTPS/WSS
                   │
┌──────────────────┴──────────────────────────┐
│      Backend (Railway/Render/Heroku)         │
│      (Node.js + Socket.io Server)            │
└──────────────────┬──────────────────────────┘
                   │
┌──────────────────┴──────────────────────────┐
│   Database (Railway/Render/AWS RDS)          │
│            (PostgreSQL)                      │
└─────────────────────────────────────────────┘
```

### Environment Variables

**Backend**:
- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET`: Secret for signing tokens
- `PORT`: Server port
- `CORS_ORIGIN`: Allowed frontend origin

**Frontend**:
- `VITE_API_URL`: Backend API URL
- `VITE_WS_URL`: WebSocket server URL

---

## Monitoring & Observability

### Logging
- Request/Response logging
- Error logging with stack traces
- Socket.io connection events

### Future Additions
- Application Performance Monitoring (APM)
- Error tracking (Sentry)
- Analytics (Google Analytics/Mixpanel)
- Uptime monitoring

---

## Trade-offs & Decisions

### Monorepo vs Separate Repos
**Chosen**: Monorepo
- **Pros**: Easier local development, shared types
- **Cons**: Larger repository, deployment complexity
- **Rationale**: Better for development speed, can split later

### REST vs GraphQL
**Chosen**: REST
- **Pros**: Simpler, well-understood, easier to cache
- **Cons**: Over-fetching, multiple requests
- **Rationale**: Sufficient for current requirements

### Prisma vs Raw SQL
**Chosen**: Prisma
- **Pros**: Type safety, migrations, easier development
- **Cons**: Slight performance overhead
- **Rationale**: Developer experience > marginal performance

### Socket.io vs WebRTC
**Chosen**: Socket.io
- **Pros**: Easier implementation, server-mediated
- **Cons**: Server becomes bottleneck
- **Rationale**: Server authority important for data consistency

---

## Future Enhancements

1. **Features**:
   - Shared boards with permissions (RBAC)
   - Task comments and mentions
   - File attachments
   - Due dates and reminders
   - Labels and filters
   - Dark mode

2. **Technical**:
   - GraphQL subscriptions
   - Offline support (PWA)
   - Mobile apps (React Native)
   - Email notifications
   - Webhooks for integrations

---

## Conclusion

This architecture balances simplicity with scalability, using modern best practices and proven technologies. The modular design allows for easy feature additions and future enhancements while maintaining code quality and developer experience.
