import { PrismaClient } from "@prisma/client";
import { hash } from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting database seeding...");

  // Hash passwords
  const passwordHash = await hash("password123", 10);

  // Create sample users with different roles
  const adminUser = await prisma.user.upsert({
    where: { email: "admin@workstack.com" },
    update: {},
    create: {
      email: "admin@workstack.com",
      name: "Admin User",
      role: "ADMIN",
      isActive: true,
      password: passwordHash,
      avatar: "https://ui-avatars.com/api/?name=Admin+User&background=random",
      emailVerifiedAt: new Date(),
      lastLoginAt: new Date(),
    },
  });

  const managerUser = await prisma.user.upsert({
    where: { email: "manager@workstack.com" },
    update: {},
    create: {
      email: "manager@workstack.com",
      name: "Project Manager",
      role: "MANAGER",
      isActive: true,
      password: passwordHash,
      avatar: "https://ui-avatars.com/api/?name=Project+Manager&background=random",
      emailVerifiedAt: new Date(),
      lastLoginAt: new Date(),
    },
  });

  const memberUser1 = await prisma.user.upsert({
    where: { email: "member1@workstack.com" },
    update: {},
    create: {
      email: "member1@workstack.com",
      name: "Sarah Johnson",
      role: "MEMBER",
      isActive: true,
      password: passwordHash,
      avatar: "https://ui-avatars.com/api/?name=Sarah+Johnson&background=random",
      emailVerifiedAt: new Date(),
    },
  });

  const memberUser2 = await prisma.user.upsert({
    where: { email: "member2@workstack.com" },
    update: {},
    create: {
      email: "member2@workstack.com",
      name: "Michael Chen",
      role: "MEMBER",
      isActive: true,
      password: passwordHash,
      avatar: "https://ui-avatars.com/api/?name=Michael+Chen&background=random",
      emailVerifiedAt: new Date(),
    },
  });

  const memberUser3 = await prisma.user.upsert({
    where: { email: "member3@workstack.com" },
    update: {},
    create: {
      email: "member3@workstack.com",
      name: "Emily Davis",
      role: "MEMBER",
      isActive: true,
      password: passwordHash,
      avatar: "https://ui-avatars.com/api/?name=Emily+Davis&background=random",
      emailVerifiedAt: new Date(),
    },
  });

  console.log("✅ Created users");

  // Create projects
  const project1 = await prisma.project.create({
    data: {
      name: "Website Redesign",
      description: "Complete redesign of company website with modern UI/UX",
      status: "ACTIVE",
      startDate: new Date("2024-01-15"),
      endDate: new Date("2024-06-30"),
    },
  });

  const project2 = await prisma.project.create({
    data: {
      name: "Mobile App Development",
      description: "Building a cross-platform mobile application",
      status: "ACTIVE",
      startDate: new Date("2024-02-01"),
      endDate: new Date("2024-08-31"),
    },
  });

  const project3 = await prisma.project.create({
    data: {
      name: "Q4 Marketing Campaign",
      description: "Q4 marketing initiatives and content creation",
      status: "PLANNING",
      startDate: new Date("2024-10-01"),
      endDate: new Date("2024-12-31"),
    },
  });

  console.log("✅ Created projects");

  // Add project owners and members
  await Promise.all([
    // Project 1 owners and members
    prisma.projectOwner.create({
      data: {
        projectId: project1.id,
        userId: managerUser.id,
      },
    }),
    prisma.projectMember.create({
      data: {
        projectId: project1.id,
        userId: memberUser1.id,
      },
    }),
    prisma.projectMember.create({
      data: {
        projectId: project1.id,
        userId: memberUser2.id,
      },
    }),
    // Project 2 owners and members
    prisma.projectOwner.create({
      data: {
        projectId: project2.id,
        userId: adminUser.id,
      },
    }),
    prisma.projectMember.create({
      data: {
        projectId: project2.id,
        userId: managerUser.id,
      },
    }),
    prisma.projectMember.create({
      data: {
        projectId: project2.id,
        userId: memberUser1.id,
      },
    }),
    prisma.projectMember.create({
      data: {
        projectId: project2.id,
        userId: memberUser3.id,
      },
    }),
    // Project 3 owners and members
    prisma.projectOwner.create({
      data: {
        projectId: project3.id,
        userId: managerUser.id,
      },
    }),
    prisma.projectMember.create({
      data: {
        projectId: project3.id,
        userId: memberUser2.id,
      },
    }),
    prisma.projectMember.create({
      data: {
        projectId: project3.id,
        userId: memberUser3.id,
      },
    }),
  ]);

  console.log("✅ Added project owners and members");

  // Create tasks for project 1
  const task1 = await prisma.task.create({
    data: {
      title: "Design homepage layout",
      description: "Create responsive homepage with hero section, features, and CTA",
      projectId: project1.id,
      status: "TODO",
      priority: "HIGH",
      dueDate: new Date("2024-03-15"),
    },
  });

  const task2 = await prisma.task.create({
    data: {
      title: "Implement user authentication",
      description: "Set up login, register, and password reset functionality",
      projectId: project1.id,
      status: "IN_PROGRESS",
      priority: "URGENT",
      dueDate: new Date("2024-03-10"),
    },
  });

  const task3 = await prisma.task.create({
    data: {
      title: "Mobile responsive testing",
      description: "Test all pages on various mobile devices",
      projectId: project1.id,
      status: "TODO",
      priority: "HIGH",
      dueDate: new Date("2024-04-01"),
    },
  });

  const task4 = await prisma.task.create({
    data: {
      title: "Performance optimization",
      description: "Optimize page load times and implement lazy loading",
      projectId: project1.id,
      status: "DONE",
      priority: "MEDIUM",
      dueDate: new Date("2024-02-28"),
      completedAt: new Date("2024-02-25"),
    },
  });

  // Create tasks for project 2
  const task5 = await prisma.task.create({
    data: {
      title: "Set up development environment",
      description: "Configure React Native with TypeScript and navigation",
      projectId: project2.id,
      status: "DONE",
      priority: "MEDIUM",
      dueDate: new Date("2024-02-15"),
      completedAt: new Date("2024-02-12"),
    },
  });

  const task6 = await prisma.task.create({
    data: {
      title: "Design app wireframes",
      description: "Create initial wireframes for all main screens",
      projectId: project2.id,
      status: "IN_PROGRESS",
      priority: "HIGH",
      dueDate: new Date("2024-03-20"),
    },
  });

  const task7 = await prisma.task.create({
    data: {
      title: "API integration",
      description: "Connect app to backend API endpoints",
      projectId: project2.id,
      status: "TODO",
      priority: "URGENT",
      dueDate: new Date("2024-04-05"),
    },
  });

  const task8 = await prisma.task.create({
    data: {
      title: "User onboarding flow",
      description: "Implement welcome screens and tutorial",
      projectId: project2.id,
      status: "TODO",
      priority: "MEDIUM",
      dueDate: new Date("2024-04-15"),
    },
  });

  // Create tasks for project 3
  const task9 = await prisma.task.create({
    data: {
      title: "Define campaign goals",
      description: "Set KPIs and success metrics for Q4 campaign",
      projectId: project3.id,
      status: "TODO",
      priority: "HIGH",
      dueDate: new Date("2024-09-15"),
    },
  });

  const task10 = await prisma.task.create({
    data: {
      title: "Content calendar",
      description: "Plan social media posts and blog articles for Q4",
      projectId: project3.id,
      status: "TODO",
      priority: "MEDIUM",
      dueDate: new Date("2024-09-20"),
    },
  });

  console.log("✅ Created tasks");

  // Add task dependencies
  await Promise.all([
    // Task 2 depends on task 1
    prisma.taskDependency.create({
      data: {
        taskId: task2.id,
        dependsOnId: task1.id,
        dependencyType: "DEPENDS_ON",
      },
    }),
    // Task 7 depends on task 6
    prisma.taskDependency.create({
      data: {
        taskId: task7.id,
        dependsOnId: task6.id,
        dependencyType: "DEPENDS_ON",
      },
    }),
    // Task 3 depends on task 2
    prisma.taskDependency.create({
      data: {
        taskId: task3.id,
        dependsOnId: task2.id,
        dependencyType: "DEPENDS_ON",
      },
    }),
  ]);

  console.log("✅ Created task dependencies");

  // Add task owners and members
  await Promise.all([
    // Task 1: homepage design
    prisma.taskOwner.create({
      data: { taskId: task1.id, userId: managerUser.id },
    }),
    prisma.taskMember.create({
      data: { taskId: task1.id, userId: memberUser1.id },
    }),
    // Task 2: authentication
    prisma.taskOwner.create({
      data: { taskId: task2.id, userId: adminUser.id },
    }),
    prisma.taskMember.create({
      data: { taskId: task2.id, userId: memberUser2.id },
    }),
    // Task 3: mobile testing
    prisma.taskOwner.create({
      data: { taskId: task3.id, userId: memberUser2.id },
    }),
    prisma.taskMember.create({
      data: { taskId: task3.id, userId: memberUser1.id },
    }),
    // Task 4: performance (completed)
    prisma.taskOwner.create({
      data: { taskId: task4.id, userId: adminUser.id },
    }),
    // Task 5: dev environment
    prisma.taskOwner.create({
      data: { taskId: task5.id, userId: adminUser.id },
    }),
    // Task 6: wireframes
    prisma.taskOwner.create({
      data: { taskId: task6.id, userId: managerUser.id },
    }),
    prisma.taskMember.create({
      data: { taskId: task6.id, userId: memberUser3.id },
    }),
    // Task 7: API integration
    prisma.taskOwner.create({
      data: { taskId: task7.id, userId: adminUser.id },
    }),
    prisma.taskMember.create({
      data: { taskId: task7.id, userId: memberUser1.id },
    }),
    prisma.taskMember.create({
      data: { taskId: task7.id, userId: memberUser3.id },
    }),
    // Task 8: onboarding
    prisma.taskOwner.create({
      data: { taskId: task8.id, userId: managerUser.id },
    }),
    // Task 9: campaign goals
    prisma.taskOwner.create({
      data: { taskId: task9.id, userId: managerUser.id },
    }),
    prisma.taskMember.create({
      data: { taskId: task9.id, userId: memberUser2.id },
    }),
    // Task 10: content calendar
    prisma.taskOwner.create({
      data: { taskId: task10.id, userId: memberUser3.id },
    }),
    prisma.taskMember.create({
      data: { taskId: task10.id, userId: memberUser2.id },
    }),
  ]);

  console.log("✅ Added task owners and members");

  console.log("\n🎉 Database seeding completed successfully!");
  console.log("\n📊 Summary:");
  console.log(`   - Users: 5 (1 Admin, 1 Manager, 3 Members)`);
  console.log(`   - Projects: 3`);
  console.log(`   - Tasks: 10`);
  console.log(`   - Task dependencies: 3`);
  console.log(`\n🔑 All users can login with password: password123`);
  console.log("📧 Test accounts:");
  console.log("   - admin@workstack.com (ADMIN)");
  console.log("   - manager@workstack.com (MANAGER)");
  console.log("   - member1@workstack.com (MEMBER)");
  console.log("   - member2@workstack.com (MEMBER)");
  console.log("   - member3@workstack.com (MEMBER)");
}

main()
  .catch((e) => {
    console.error("Error during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    console.log("\n👋 Disconnected from Prisma");
  });
