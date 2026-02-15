#  TESTING CHECKLIST

## Pre-Testing Setup
- [ ] Backend server running on http://localhost:5000
- [ ] Frontend server running on http://localhost:5173
- [ ] PostgreSQL database is accessible
- [ ] No errors in terminal logs

---

## Authentication Tests

### Registration
- [ ] Navigate to /register
- [ ] Fill in name, email, password
- [ ] Submit form
- [ ] User redirected to /boards
- [ ] User info displayed in header

### Login
- [ ] Navigate to /login
- [ ] Click "Use Demo Credentials"
- [ ] Form fills with demo@example.com / Demo123!
- [ ] Submit form
- [ ] User redirected to /boards
- [ ] Welcome message shows "Demo User"

### Logout
- [ ] Click logout button
- [ ] Redirected to /login
- [ ] Cannot access /boards when logged out

---

## Board Management Tests

### Create Board
- [ ] Click "Create Board" button
- [ ] Modal opens
- [ ] Enter board name: "Test Board"
- [ ] Enter description: "Testing the platform"
- [ ] Click "Create"
- [ ] Board appears in list
- [ ] Board count updates

### View Board
- [ ] Click on a board card
- [ ] Navigate to board view
- [ ] Board name displays in header
- [ ] Description shows if present
- [ ] Existing lists load

### Update Board (Manual Test)
- [ ] Use API or database to update board name
- [ ] Refresh page
- [ ] Updated name displays

### Delete Board (Manual Test)
- [ ] Use API to delete board
- [ ] Board removed from list

---

## List Management Tests

### Create List
- [ ] On board view, click "+ Add List"
- [ ] Form appears
- [ ] Enter list name: "To Do"
- [ ] Click "Add List"
- [ ] List appears on board
- [ ] Form closes

### Multiple Lists
- [ ] Create "In Progress" list
- [ ] Create "Done" list
- [ ] All three lists visible
- [ ] Lists maintain order

### Delete List
- [ ] Hover over list
- [ ] Click delete (🗑️) button
- [ ] List disappears
- [ ] Tasks in list are deleted

---

## Task Management Tests

### Create Task
- [ ] Click "+ Add a card" in a list
- [ ] Form appears
- [ ] Enter task title: "Test task"
- [ ] Click "Add"
- [ ] Task appears in list
- [ ] Form closes

### Edit Task
- [ ] Hover over task
- [ ] Click edit (✏️) button
- [ ] Task becomes editable
- [ ] Update title
- [ ] Click outside or press Enter
- [ ] Task updates

### Delete Task
- [ ] Hover over task
- [ ] Click delete (🗑️) button
- [ ] Confirm deletion
- [ ] Task disappears

### Multiple Tasks
- [ ] Create 3-5 tasks in "To Do"
- [ ] All tasks display
- [ ] Tasks maintain order

---

## Drag and Drop Tests

### Drag Within List
- [ ] Create multiple tasks in one list
- [ ] Drag task to different position
- [ ] Task position updates
- [ ] Other tasks reorder

### Drag Between Lists
- [ ] Drag task from "To Do" to "In Progress"
- [ ] Task moves to new list
- [ ] Task removed from old list
- [ ] Position correct in new list

### Drag to Empty List
- [ ] Create empty list
- [ ] Drag task to empty list
- [ ] Task appears as first item

---

## Real-Time Features Tests

### Setup (Two Browsers)
- [ ] Open Chrome: login as demo@example.com
- [ ] Open Firefox: login as alice@example.com
- [ ] Both navigate to same board

### Real-Time List Creation
- [ ] Browser 1: Create new list
- [ ] Browser 2: List appears automatically
- [ ] No page refresh needed

### Real-Time Task Creation
- [ ] Browser 1: Create task
- [ ] Browser 2: Task appears in real-time
- [ ] Task in correct list

### Real-Time Task Updates
- [ ] Browser 1: Edit task title
- [ ] Browser 2: Title updates automatically

### Real-Time Drag & Drop
- [ ] Browser 1: Drag task to different list
- [ ] Browser 2: Task moves in real-time
- [ ] Both browsers in sync

### Real-Time Delete
- [ ] Browser 1: Delete a task
- [ ] Browser 2: Task disappears
- [ ] No errors

---

## Search Functionality (Future Feature)
- [ ] Search bar visible (if implemented)
- [ ] Enter search query
- [ ] Results filter correctly
- [ ] Can select result to navigate

---

## Activity History (Future Feature)
- [ ] Activity panel visible (if implemented)
- [ ] Recent activities listed
- [ ] Activities show user names
- [ ] Activities show timestamps

---

## Responsive Design Tests

### Desktop (1920x1080)
- [ ] Layout looks good
- [ ] All features accessible
- [ ] No horizontal scroll
- [ ] Drag and drop works

### Tablet (768x1024)
- [ ] Layout adjusts
- [ ] Lists scroll horizontally
- [ ] Buttons accessible
- [ ] Touch drag works

### Mobile (375x667)
- [ ] Login form fits screen
- [ ] Board list readable
- [ ] Can create tasks
- [ ] Touch interactions work

---

## Error Handling Tests

### Invalid Login
- [ ] Enter wrong password
- [ ] Error message displays
- [ ] Can retry

### Network Errors
- [ ] Stop backend server
- [ ] Try to create board
- [ ] Error displayed
- [ ] App doesn't crash

### Validation Errors
- [ ] Try to create board with empty name
- [ ] Validation message shows
- [ ] Form doesn't submit

---

## Performance Tests

### Large Dataset
- [ ] Create 10+ lists
- [ ] Create 50+ tasks
- [ ] App remains responsive
- [ ] Drag and drop works
- [ ] No noticeable lag

### Multiple Connections
- [ ] Open app in 3+ browsers
- [ ] All real-time updates work
- [ ] No delays or conflicts
- [ ] Server handles load

---

## Data Persistence Tests

### After Refresh
- [ ] Create board, lists, tasks
- [ ] Refresh page
- [ ] All data persists
- [ ] No data loss

### After Logout/Login
- [ ] Create data
- [ ] Logout
- [ ] Login again
- [ ] Data still present

---

## Browser Compatibility

### Chrome
- [ ] All features work
- [ ] No console errors
- [ ] UI renders correctly

### Firefox
- [ ] All features work
- [ ] No console errors
- [ ] UI renders correctly

### Safari
- [ ] All features work
- [ ] No console errors
- [ ] UI renders correctly

### Edge
- [ ] All features work
- [ ] No console errors
- [ ] UI renders correctly

---

## API Tests (Using curl or Postman)

### Health Check
```bash
curl http://localhost:5000/api/health
```
- [ ] Returns 200 OK
- [ ] Returns JSON with status

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@example.com","password":"Demo123!"}'
```
- [ ] Returns token
- [ ] Returns user data

### Get Boards (with token)
```bash
curl http://localhost:5000/api/boards \
  -H "Authorization: Bearer YOUR_TOKEN"
```
- [ ] Returns boards array
- [ ] Returns pagination info

---

## Socket.io Connection Tests

### Open DevTools
- [ ] Go to Network tab
- [ ] Filter WS (WebSocket)
- [ ] See socket.io connection
- [ ] Connection status: "connected"

### Events
- [ ] Create a task
- [ ] See "task:created" event in WS
- [ ] Payload contains task data

---

## Database Tests

### Prisma Studio
```bash
cd backend
npx prisma studio
```
- [ ] Opens on http://localhost:5555
- [ ] Can view all tables
- [ ] Can see seeded data
- [ ] Relationships work

---

## Critical Path Test (End-to-End)

This is the most important test - complete user journey:

1. [ ] Register new user account
2. [ ] Automatically logged in
3. [ ] Create first board "My Project"
4. [ ] Create lists: "Backlog", "In Progress", "Done"
5. [ ] Create task in Backlog: "Setup project"
6. [ ] Create task in Backlog: "Design database"
7. [ ] Drag "Setup project" to "Done"
8. [ ] Edit "Design database" title
9. [ ] Open in second browser as different user
10. [ ] Both browsers show same state
11. [ ] Browser 1: Create new task
12. [ ] Browser 2: See task appear in real-time
13. [ ] Logout from both browsers
14. [ ] Login again
15. [ ] All data persists

---

## Production Readiness Checklist

### Code Quality
- [ ] No TypeScript errors
- [ ] No console errors
- [ ] No warnings
- [ ] Code is commented
- [ ] No TODO comments left

### Documentation
- [ ] README.md complete
- [ ] SETUP_GUIDE.md clear
- [ ] ARCHITECTURE.md thorough
- [ ] Demo credentials documented
- [ ] API endpoints documented

### Security
- [ ] Passwords hashed
- [ ] JWT tokens used
- [ ] CORS configured
- [ ] Input validation present
- [ ] SQL injection prevented

### Deployment
- [ ] .env.example files present
- [ ] .gitignore files correct
- [ ] Build scripts work
- [ ] Environment variables documented

---

## Sign-off

Once all tests pass:
- [ ] Project is ready for submission
- [ ] Demo is prepared
- [ ] Repository is clean
- [ ] Confident in presentation

**Tested by**: _______________
**Date**: _______________
**Result**: PASS / FAIL

---

## Common Issues & Solutions

### Socket not connecting
- Check CORS settings
- Verify WS_URL in .env
- Check browser console

### Database connection failed
- Verify PostgreSQL is running
- Check DATABASE_URL
- Try `npx prisma migrate reset`

### Tasks not appearing
- Check browser console
- Verify API calls succeed
- Check real-time events

### Drag and drop not working
- Check @dnd-kit installation
- Verify sensors configured
- Test touch vs mouse

---

## Notes Section

Use this space to document any issues found:

```
Issue: [Description]
Steps to reproduce: [...]
Expected: [...]
Actual: [...]
Fixed: Yes/No
```
