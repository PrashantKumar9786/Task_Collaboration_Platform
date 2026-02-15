import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create users
  const demoPassword = await bcrypt.hash('Demo123!', 10);
  const alicePassword = await bcrypt.hash('Alice123!', 10);
  const bobPassword = await bcrypt.hash('Bob123!', 10);

  const demo = await prisma.user.upsert({
    where: { email: 'demo@example.com' },
    update: {},
    create: {
      email: 'demo@example.com',
      password: demoPassword,
      name: 'Demo User',
    },
  });

  const alice = await prisma.user.upsert({
    where: { email: 'alice@example.com' },
    update: {},
    create: {
      email: 'alice@example.com',
      password: alicePassword,
      name: 'Alice Johnson',
    },
  });

  const bob = await prisma.user.upsert({
    where: { email: 'bob@example.com' },
    update: {},
    create: {
      email: 'bob@example.com',
      password: bobPassword,
      name: 'Bob Smith',
    },
  });

  console.log('Users created');

  // Create a sample board for demo user
  const board = await prisma.board.create({
    data: {
      name: 'Product Development',
      description: 'Track product development tasks and features',
      ownerId: demo.id,
    },
  });

  console.log('Board created');

  // Create lists
  const todoList = await prisma.list.create({
    data: {
      name: 'To Do',
      position: 0,
      boardId: board.id,
    },
  });

  const inProgressList = await prisma.list.create({
    data: {
      name: 'In Progress',
      position: 1,
      boardId: board.id,
    },
  });

  const doneList = await prisma.list.create({
    data: {
      name: 'Done',
      position: 2,
      boardId: board.id,
    },
  });

  console.log('Lists created');

  // Create tasks
  const task1 = await prisma.task.create({
    data: {
      title: 'Design new landing page',
      description: 'Create mockups for the new landing page design',
      position: 0,
      listId: todoList.id,
      createdById: demo.id,
    },
  });

  const task2 = await prisma.task.create({
    data: {
      title: 'Implement user authentication',
      description: 'Set up JWT-based authentication system',
      position: 1,
      listId: todoList.id,
      createdById: demo.id,
    },
  });

  const task3 = await prisma.task.create({
    data: {
      title: 'Database optimization',
      description: 'Add indexes to improve query performance',
      position: 0,
      listId: inProgressList.id,
      createdById: demo.id,
    },
  });

  const task4 = await prisma.task.create({
    data: {
      title: 'Setup CI/CD pipeline',
      description: 'Configure automated testing and deployment',
      position: 0,
      listId: doneList.id,
      createdById: demo.id,
    },
  });

  console.log('Tasks created');

  // Assign users to tasks
  await prisma.taskUser.createMany({
    data: [
      { taskId: task1.id, userId: alice.id },
      { taskId: task2.id, userId: bob.id },
      { taskId: task3.id, userId: demo.id },
      { taskId: task3.id, userId: alice.id },
    ],
  });

  console.log('Task assignments created');

  // Create activities
  await prisma.activity.createMany({
    data: [
      {
        type: 'BOARD_CREATED',
        description: 'Created board "Product Development"',
        userId: demo.id,
        boardId: board.id,
      },
      {
        type: 'LIST_CREATED',
        description: 'Created list "To Do"',
        userId: demo.id,
        boardId: board.id,
      },
      {
        type: 'TASK_CREATED',
        description: 'Created task "Design new landing page"',
        userId: demo.id,
        boardId: board.id,
        taskId: task1.id,
      },
      {
        type: 'TASK_ASSIGNED',
        description: 'Assigned Alice Johnson to task "Design new landing page"',
        userId: demo.id,
        boardId: board.id,
        taskId: task1.id,
      },
    ],
  });

  console.log('Activities created');
  console.log('\n Database seeded successfully!');
  console.log('\n Demo credentials:');
  console.log('   Email: demo@example.com');
  console.log('   Password: Demo123!');
  console.log('\n Email: alice@example.com');
  console.log('   Password: Alice123!');
  console.log('\n Email: bob@example.com');
  console.log('   Password: Bob123!\n');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
