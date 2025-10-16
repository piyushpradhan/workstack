-- CreateTable
CREATE TABLE "ProjectOwner" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProjectOwner_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectMember" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProjectMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TaskOwner" (
    "id" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TaskOwner_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TaskMember" (
    "id" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TaskMember_pkey" PRIMARY KEY ("id")
);

-- DropForeignKey
ALTER TABLE "Project" DROP CONSTRAINT "Project_ownerId_fkey";

-- DropForeignKey
ALTER TABLE "Task" DROP CONSTRAINT "Task_assigneeId_fkey";

-- DropIndex
DROP INDEX "Project_ownerId_idx";

-- DropIndex
DROP INDEX "Task_assigneeId_idx";

-- AlterTable
ALTER TABLE "Project" DROP COLUMN "ownerId";

-- AlterTable
ALTER TABLE "Task" DROP COLUMN "assigneeId";

-- CreateIndex
CREATE INDEX "ProjectOwner_projectId_idx" ON "ProjectOwner"("projectId");

-- CreateIndex
CREATE INDEX "ProjectOwner_userId_idx" ON "ProjectOwner"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ProjectOwner_projectId_userId_key" ON "ProjectOwner"("projectId", "userId");

-- CreateIndex
CREATE INDEX "ProjectMember_projectId_idx" ON "ProjectMember"("projectId");

-- CreateIndex
CREATE INDEX "ProjectMember_userId_idx" ON "ProjectMember"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ProjectMember_projectId_userId_key" ON "ProjectMember"("projectId", "userId");

-- CreateIndex
CREATE INDEX "TaskOwner_taskId_idx" ON "TaskOwner"("taskId");

-- CreateIndex
CREATE INDEX "TaskOwner_userId_idx" ON "TaskOwner"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "TaskOwner_taskId_userId_key" ON "TaskOwner"("taskId", "userId");

-- CreateIndex
CREATE INDEX "TaskMember_taskId_idx" ON "TaskMember"("taskId");

-- CreateIndex
CREATE INDEX "TaskMember_userId_idx" ON "TaskMember"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "TaskMember_taskId_userId_key" ON "TaskMember"("taskId", "userId");

-- AddForeignKey
ALTER TABLE "ProjectOwner" ADD CONSTRAINT "ProjectOwner_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectOwner" ADD CONSTRAINT "ProjectOwner_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectMember" ADD CONSTRAINT "ProjectMember_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectMember" ADD CONSTRAINT "ProjectMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskOwner" ADD CONSTRAINT "TaskOwner_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskOwner" ADD CONSTRAINT "TaskOwner_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskMember" ADD CONSTRAINT "TaskMember_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskMember" ADD CONSTRAINT "TaskMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;




