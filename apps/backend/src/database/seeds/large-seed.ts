import { PrismaClient } from "@prisma/client";
import { hash } from "bcrypt";

const prisma = new PrismaClient();

// Helper function to get random element from array
function getRandomElement<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
}

// Helper function to get random elements from array
function getRandomElements<T>(array: T[], count: number): T[] {
    const shuffled = [...array].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, Math.min(count, array.length));
}

// Generate random project name
function generateProjectName(index: number): string {
    const prefixes = [
        "Alpha", "Beta", "Gamma", "Delta", "Epsilon", "Zeta", "Eta", "Theta",
        "Iota", "Kappa", "Lambda", "Mu", "Nu", "Xi", "Omicron", "Pi", "Rho",
        "Sigma", "Tau", "Upsilon", "Phi", "Chi", "Psi", "Omega"
    ];
    const types = [
        "Development", "Marketing", "Research", "Operations", "Sales", "Support",
        "Infrastructure", "Analytics", "Design", "Content", "Strategy", "Innovation"
    ];
    const suffixes = [
        "Project", "Initiative", "Campaign", "Program", "System", "Platform"
    ];

    const prefix = prefixes[index % prefixes.length];
    const type = types[Math.floor(index / prefixes.length) % types.length];
    const suffix = suffixes[index % suffixes.length];

    return `${prefix} ${type} ${suffix} ${Math.floor(index / 24) + 1}`;
}

// Generate random task title
function generateTaskTitle(index: number): string {
    const verbs = [
        "Implement", "Design", "Review", "Test", "Deploy", "Optimize", "Refactor",
        "Document", "Analyze", "Plan", "Build", "Create", "Update", "Fix", "Enhance"
    ];
    const nouns = [
        "feature", "component", "module", "system", "interface", "workflow",
        "process", "dashboard", "API", "database", "security", "performance",
        "integration", "automation", "reporting", "analytics", "testing", "deployment"
    ];

    const verb = verbs[index % verbs.length];
    const noun = nouns[Math.floor(index / verbs.length) % nouns.length];
    const number = Math.floor(index / (verbs.length * nouns.length)) + 1;

    return `${verb} ${noun} ${number}`;
}

async function main() {
    console.log("Starting large-scale database seeding...");
    console.log("This will create 400 projects and 5000 tasks...\n");

    // Hash password for demo user
    const passwordHash = await hash("demo@123", 10);

    // Create or get demo user
    const demoUser = await prisma.user.upsert({
        where: { email: "demo@workstack.app" },
        update: {},
        create: {
            email: "demo@workstack.app",
            name: "Demo User",
            role: "ADMIN",
            isActive: true,
            password: passwordHash,
            avatar: "https://ui-avatars.com/api/?name=Demo+User&background=random",
            emailVerifiedAt: new Date(),
            lastLoginAt: new Date(),
        },
    });

    console.log("✅ Created/verified demo user: demo@workstack.app");

    // Create additional users for variety (they won't be in all projects/tasks)
    const additionalUsers = [];
    const userCount = 20; // Create 20 additional users

    for (let i = 1; i <= userCount; i++) {
        const user = await prisma.user.upsert({
            where: { email: `user${i}@workstack.app` },
            update: {},
            create: {
                email: `user${i}@workstack.app`,
                name: `User ${i}`,
                role: i % 4 === 0 ? "ADMIN" : i % 3 === 0 ? "MANAGER" : "MEMBER",
                isActive: true,
                password: passwordHash,
                avatar: `https://ui-avatars.com/api/?name=User+${i}&background=random`,
                emailVerifiedAt: new Date(),
            },
        });
        additionalUsers.push(user);
    }

    console.log(`✅ Created ${userCount} additional users`);

    // Create 400 projects
    const projectStatuses: Array<"PLANNING" | "ACTIVE" | "ON_HOLD" | "COMPLETED" | "CANCELLED"> =
        ["PLANNING", "ACTIVE", "ON_HOLD", "COMPLETED", "CANCELLED"];

    const projects = [];
    const batchSize = 50; // Process in batches for better performance

    console.log("\n📦 Creating 400 projects...");

    for (let i = 0; i < 400; i += batchSize) {
        const batch = [];
        const end = Math.min(i + batchSize, 400);

        for (let j = i; j < end; j++) {
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - Math.floor(Math.random() * 365));
            const endDate = new Date(startDate);
            endDate.setDate(endDate.getDate() + Math.floor(Math.random() * 180) + 30);

            batch.push({
                name: generateProjectName(j),
                description: `Description for ${generateProjectName(j)}. This is a comprehensive project with multiple phases and deliverables.`,
                status: getRandomElement(projectStatuses),
                startDate: Math.random() > 0.2 ? startDate : null,
                endDate: Math.random() > 0.3 ? endDate : null,
            });
        }

        const createdProjects = await Promise.all(
            batch.map(data => prisma.project.create({ data }))
        );
        projects.push(...createdProjects);

        if ((i + batchSize) % 100 === 0 || end === 400) {
            console.log(`   Created ${end} / 400 projects`);
        }
    }

    console.log("✅ Created 400 projects");

    // Add demo user to all projects (as owner or member)
    console.log("\n👥 Adding demo user to all projects...");

    const projectOwnerships = [];
    const projectMemberships = [];

    for (let i = 0; i < projects.length; i++) {
        // 60% owner, 40% member
        if (Math.random() < 0.6) {
            projectOwnerships.push({
                projectId: projects[i].id,
                userId: demoUser.id,
            });
        } else {
            projectMemberships.push({
                projectId: projects[i].id,
                userId: demoUser.id,
            });
        }

        // Optionally add some other users to some projects (not all)
        if (Math.random() < 0.3) {
            const randomUsers = getRandomElements(additionalUsers, Math.floor(Math.random() * 3) + 1);
            for (const user of randomUsers) {
                if (Math.random() < 0.5) {
                    projectOwnerships.push({
                        projectId: projects[i].id,
                        userId: user.id,
                    });
                } else {
                    projectMemberships.push({
                        projectId: projects[i].id,
                        userId: user.id,
                    });
                }
            }
        }
    }

    // Batch insert project relationships using createMany for better performance
    if (projectOwnerships.length > 0) {
        await prisma.projectOwner.createMany({
            data: projectOwnerships,
            skipDuplicates: true,
        });
    }
    if (projectMemberships.length > 0) {
        await prisma.projectMember.createMany({
            data: projectMemberships,
            skipDuplicates: true,
        });
    }

    console.log("✅ Added demo user to all projects");
    console.log(`   - Owner in ${projectOwnerships.length} projects`);
    console.log(`   - Member in ${projectMemberships.length} projects`);

    // Create 5000 tasks distributed across projects
    const taskStatuses: Array<"TODO" | "IN_PROGRESS" | "IN_REVIEW" | "DONE" | "CANCELLED"> =
        ["TODO", "IN_PROGRESS", "IN_REVIEW", "DONE", "CANCELLED"];
    const taskPriorities: Array<"LOW" | "MEDIUM" | "HIGH" | "URGENT"> =
        ["LOW", "MEDIUM", "HIGH", "URGENT"];

    const tasks = [];
    const tasksPerProject = Math.ceil(5000 / projects.length);

    console.log("\n📋 Creating 5000 tasks...");

    let taskIndex = 0;
    for (let i = 0; i < projects.length && taskIndex < 5000; i++) {
        const project = projects[i];
        // Distribute tasks unevenly across projects for realism
        const tasksForThisProject = Math.floor(Math.random() * tasksPerProject * 2) + 1;
        const actualTasks = Math.min(tasksForThisProject, 5000 - taskIndex);

        const taskBatch = [];
        for (let j = 0; j < actualTasks; j++) {
            const dueDate = new Date();
            dueDate.setDate(dueDate.getDate() + Math.floor(Math.random() * 90));

            const status = getRandomElement(taskStatuses);
            const completedAt = status === "DONE" ? new Date() : null;

            taskBatch.push({
                title: generateTaskTitle(taskIndex),
                description: `Task description for ${generateTaskTitle(taskIndex)}. This task involves multiple steps and requires careful attention to detail.`,
                projectId: project.id,
                status,
                priority: getRandomElement(taskPriorities),
                dueDate: Math.random() > 0.2 ? dueDate : null,
                completedAt,
            });
            taskIndex++;
        }

        const createdTasks = await Promise.all(
            taskBatch.map(data => prisma.task.create({ data }))
        );
        tasks.push(...createdTasks);

        if (taskIndex % 500 === 0 || taskIndex === 5000) {
            console.log(`   Created ${taskIndex} / 5000 tasks`);
        }
    }

    console.log("✅ Created 5000 tasks");

    // Add demo user to all tasks (as owner or member)
    console.log("\n👥 Adding demo user to all tasks...");

    const taskOwnerships = [];
    const taskMemberships = [];

    for (let i = 0; i < tasks.length; i++) {
        // 50% owner, 50% member
        if (Math.random() < 0.5) {
            taskOwnerships.push({
                taskId: tasks[i].id,
                userId: demoUser.id,
            });
        } else {
            taskMemberships.push({
                taskId: tasks[i].id,
                userId: demoUser.id,
            });
        }

        // Optionally add some other users to some tasks (not all)
        if (Math.random() < 0.2) {
            const randomUsers = getRandomElements(additionalUsers, Math.floor(Math.random() * 2) + 1);
            for (const user of randomUsers) {
                if (Math.random() < 0.5) {
                    taskOwnerships.push({
                        taskId: tasks[i].id,
                        userId: user.id,
                    });
                } else {
                    taskMemberships.push({
                        taskId: tasks[i].id,
                        userId: user.id,
                    });
                }
            }
        }
    }

    // Batch insert task relationships in chunks using createMany for better performance
    const chunkSize = 1000;
    if (taskOwnerships.length > 0) {
        for (let i = 0; i < taskOwnerships.length; i += chunkSize) {
            const chunk = taskOwnerships.slice(i, i + chunkSize);
            await prisma.taskOwner.createMany({
                data: chunk,
                skipDuplicates: true,
            });
            if ((i + chunkSize) % 2000 === 0 || i + chunkSize >= taskOwnerships.length) {
                console.log(`   Processed ${Math.min(i + chunkSize, taskOwnerships.length)} task ownerships`);
            }
        }
    }

    if (taskMemberships.length > 0) {
        for (let i = 0; i < taskMemberships.length; i += chunkSize) {
            const chunk = taskMemberships.slice(i, i + chunkSize);
            await prisma.taskMember.createMany({
                data: chunk,
                skipDuplicates: true,
            });
            if ((i + chunkSize) % 2000 === 0 || i + chunkSize >= taskMemberships.length) {
                console.log(`   Processed ${Math.min(i + chunkSize, taskMemberships.length)} task memberships`);
            }
        }
    }

    console.log("✅ Added demo user to all tasks");
    console.log(`   - Owner of ${taskOwnerships.length} tasks`);
    console.log(`   - Member of ${taskMemberships.length} tasks`);

    console.log("\n🎉 Large-scale database seeding completed successfully!");
    console.log("\n📊 Summary:");
    console.log(`   - Users: ${1 + userCount} (1 demo user + ${userCount} additional users)`);
    console.log(`   - Projects: ${projects.length}`);
    console.log(`   - Tasks: ${tasks.length}`);
    console.log(`   - Demo user (demo@workstack.app) is part of ALL projects and tasks`);
    console.log(`\n🔑 Demo user credentials:`);
    console.log(`   - Email: demo@workstack.app`);
    console.log(`   - Password: demo@123`);
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

