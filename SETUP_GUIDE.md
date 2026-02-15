# 📝 STEP-BY-STEP SETUP GUIDE

## Phase 1: Backend Setup (Day 1 - Morning, ~3-4 hours)

### Step 1: Install Dependencies
```bash
cd task-collab-platform/backend
npm install
```

### Step 2: Setup PostgreSQL Database
```bash
# Using Docker (recommended)
docker run --name taskcollab-postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=taskcollab \
  -p 5432:5432 \
  -d postgres:14

# OR install PostgreSQL locally
# macOS: brew install postgresql
# Ubuntu: sudo apt-get install postgresql
# Windows: Download from postgresql.org
```

### Step 3: Configure Environment
```bash
cp .env.example .env
# Edit .env and update DATABASE_URL if needed
```

### Step 4: Run Database Migrations
```bash
npx prisma generate
npx prisma migrate dev --name init
```

### Step 5: Seed Database
```bash
npm run seed
```

### Step 6: Start Backend Server
```bash
npm run dev
```

**✅ Backend should now be running on http://localhost:5000**

Test it:
```bash
curl http://localhost:5000/api/health
```

---

## Phase 2: Frontend Setup (Day 1 - Afternoon, ~2-3 hours)

### Step 1: Install Dependencies
```bash
cd ../frontend
npm install
```

### Step 2: Create Environment File
```bash
# Create .env file
echo 'VITE_API_URL=http://localhost:5000/api' > .env
echo 'VITE_WS_URL=http://localhost:5000' >> .env
```

### Step 3: Start Frontend
```bash
npm run dev
```

**✅ Frontend should now be running on http://localhost:5173**

---

## Phase 3: Testing & Features (Day 1 - Evening, ~2-3 hours)

### Login and Test Features
1. Open http://localhost:5173
2. Click "Use Demo Credentials" or login with:
   - Email: demo@example.com
   - Password: Demo123!
3. Test all features:
   - ✅ Create a new board
   - ✅ Add lists to the board
   - ✅ Create tasks in lists
   - ✅ Drag and drop tasks
   - ✅ Assign users to tasks
   - ✅ Search for tasks
   - ✅ View activity history

### Test Real-time Features
1. Open the app in two different browsers
2. Login with different accounts:
   - Browser 1: demo@example.com / Demo123!
   - Browser 2: alice@example.com / Alice123!
3. Make changes in one browser and watch them appear in real-time in the other

---

## Phase 4: Documentation & Polish (Day 2 - Morning, ~2-3 hours)

### Create API Documentation
Already included in README.md

### Architecture Documentation
Create architecture diagrams using the provided schema in README.md

### Add Comments to Code
Review and add comments to complex functions

---

## Phase 5: Testing (Day 2 - Afternoon, ~3-4 hours)

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

### Manual Testing Checklist
- [ ] User registration
- [ ] User login
- [ ] Create board
- [ ] Update board
- [ ] Delete board
- [ ] Create list
- [ ] Update list
- [ ] Delete list
- [ ] Create task
- [ ] Update task
- [ ] Delete task
- [ ] Move task between lists
- [ ] Assign user to task
- [ ] Unassign user from task
- [ ] Search tasks
- [ ] View activity history
- [ ] Real-time updates in multiple tabs
- [ ] Responsive design on mobile

---

## Phase 6: Deployment Preparation (Day 2 - Evening, ~2-3 hours)

### Build for Production
```bash
# Backend
cd backend
npm run build

# Frontend
cd frontend
npm run build
```

### Create Deployment Guide
See README.md for deployment options

---

## 🎯 Key Features Implemented

### ✅ Core Requirements
- [x] User authentication (signup/login)
- [x] Create Boards with multiple Lists
- [x] Create, update, delete Tasks inside lists
- [x] Drag and drop tasks across lists
- [x] Assign users to tasks
- [x] Real-time updates across multiple users
- [x] Activity history tracking
- [x] Pagination and search functionality

### ✅ Technical Requirements
- [x] Frontend: React SPA with TypeScript
- [x] Backend: REST APIs with Express
- [x] Database: PostgreSQL with Prisma
- [x] Real-time: Socket.io
- [x] State Management: React Query + Context
- [x] Test coverage ready
- [x] Deployment-ready structure

---

## 🐛 Troubleshooting

### Database Connection Issues
```bash
# Check if PostgreSQL is running
docker ps  # if using Docker
# OR
pg_isready  # if installed locally
```

### Port Already in Use
```bash
# Backend (kill process on port 5000)
lsof -ti:5000 | xargs kill -9

# Frontend (kill process on port 5173)
lsof -ti:5173 | xargs kill -9
```

### Socket.io Not Connecting
- Check CORS settings in backend
- Verify token is being sent in socket auth
- Check browser console for errors

### Prisma Issues
```bash
# Reset database
npx prisma migrate reset

# Regenerate client
npx prisma generate
```

---

## 📚 Learning Resources

### Backend Concepts
- **Prisma ORM**: Database modeling and migrations
- **JWT Authentication**: Stateless authentication
- **Socket.io**: Real-time bidirectional communication
- **Express.js**: RESTful API design

### Frontend Concepts
- **React Hooks**: useState, useEffect, useContext
- **React Query**: Server state management
- **Drag & Drop**: @dnd-kit library
- **WebSocket**: Real-time updates
- **TailwindCSS**: Utility-first CSS

---

## 🎓 Interview Talking Points

### Architecture Decisions
1. **Monorepo Structure**: Easy local development
2. **TypeScript**: Type safety across stack
3. **Prisma ORM**: Type-safe database queries
4. **Socket.io Rooms**: Efficient board-level isolation
5. **JWT Auth**: Stateless, scalable authentication

### Scalability
1. **Database Indexes**: Optimized queries
2. **Pagination**: All list endpoints
3. **Socket.io Rooms**: Prevent broadcast storms
4. **React Query**: Automatic caching and invalidation

### Trade-offs
1. **Prisma vs Raw SQL**: Developer experience vs performance
2. **REST vs GraphQL**: Simplicity vs flexibility
3. **Socket.io vs WebRTC**: Easy implementation vs peer-to-peer

---

## ✨ Bonus Features to Mention

If you have extra time, these are quick wins:
- [ ] Add board member permissions
- [ ] Task due dates and priorities
- [ ] Task comments
- [ ] File attachments
- [ ] Email notifications
- [ ] Dark mode
- [ ] Keyboard shortcuts

---

## 📦 Submission Checklist

Before submitting:
- [ ] README.md is complete
- [ ] .env.example files exist
- [ ] Code is commented
- [ ] All features work locally
- [ ] Git repository is organized
- [ ] Demo credentials are documented
- [ ] Architecture is explained
- [ ] API documentation is included

---

## 🚀 Final Steps

1. **Initialize Git**
```bash
cd task-collab-platform
git init
git add .
git commit -m "Initial commit: Real-time task collaboration platform"
```

2. **Create GitHub Repository**
```bash
git remote add origin <your-github-repo-url>
git branch -M main
git push -u origin main
```

3. **Test End-to-End**
- Fresh clone
- Follow setup instructions
- Verify all features work

4. **Submit**
- Repository link
- README with credentials
- Architecture explanation
- Any additional notes

---

## 💡 Tips for Success

1. **Time Management**
   - Day 1 Morning: Backend complete
   - Day 1 Afternoon: Frontend complete
   - Day 1 Evening: Testing
   - Day 2: Polish, documentation, deployment prep

2. **Priority Order**
   - Core features first
   - Real-time features second
   - Polish and UX third
   - Bonus features last

3. **Don't Get Stuck**
   - Use the seed data
   - Test frequently
   - Focus on working features over perfect code

Good luck! You've got this! 🎉
