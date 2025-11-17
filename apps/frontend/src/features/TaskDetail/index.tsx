import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
//
import { toast } from "sonner";
import { useTask, useUpdateTask } from "@/api/tasks/queries";
import { useAllProjects } from "@/api/projects/queries";
import { useUsersByProjects } from "@/api/users/queries";
import type { TaskPriority, TaskStatus } from "@/state";
import { TaskDetailHeader } from "@/features/TaskDetail/TaskDetailHeader";
import { TaskDescription } from "@/features/TaskDetail/TaskDescription";
import { TaskComments } from "@/features/TaskDetail/TaskComments";
import { TaskPropertiesCard } from "@/features/TaskDetail/TaskPropertiesCard";
import { TaskMetadataCard } from "@/features/TaskDetail/TaskMetadataCard";
import { TaskParticipantsCard } from "@/features/TaskDetail/TaskParticipantsCard";
import { isTemporaryId } from "@/lib/utils";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";

const TaskDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: task, isLoading, error } = useTask(id ?? "");
  const updateTaskMutation = useUpdateTask();

  const projectsQuery = useAllProjects();
  const projects = projectsQuery.data?.pages.flatMap(page => page.data) ?? [];
  const { data: usersData } = useUsersByProjects(task?.projectId ? [task.projectId] : [], 100);
  const allProjectUsers = usersData?.pages.flatMap(page => page.data) ?? [];

  const project = useMemo(
    () => projects.find((p) => p.id === task?.projectId) ?? null,
    [projects, task],
  );
  const owner = useMemo(
    () => allProjectUsers.find((u) => u.id === task?.ownerId) ?? null,
    [allProjectUsers, task],
  );
  const memberUsers = useMemo(
    () => allProjectUsers.filter((u) => (task?.memberIds ?? []).includes(u.id)),
    [allProjectUsers, task],
  );
  const currentUser = allProjectUsers[0] ?? null;

  useDocumentTitle(task?.title || "Task");

  useEffect(() => {
    if (!id) {
      navigate("/tasks");
      return;
    }
    if (isTemporaryId(id)) {
      navigate("/tasks");
      return;
    }
  }, [id, navigate]);

  useEffect(() => {
    if (error) {
      toast.error("Failed to load task");
    }
  }, [error]);

  if (!id) return null;

  const handleStatusChange = (status: TaskStatus) => {
    if (!task) return;
    updateTaskMutation.mutate({ id: task.id, data: { status } });
    toast.success("Status updated");
  };

  const handlePriorityChange = (priority: TaskPriority) => {
    if (!task) return;
    updateTaskMutation.mutate({ id: task.id, data: { priority } });
    toast.success("Priority updated");
  };

  const handleDueDateChange = (dueDate: string) => {
    if (!task) return;
    updateTaskMutation.mutate({
      id: task.id,
      data: { dueDate: dueDate ? new Date(dueDate).toISOString() : undefined },
    });
    toast.success("Due date updated");
  };

  // Removed delete and mark-done actions from UI; keeping logic out to avoid unused warnings

  const handleShareLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard");
    } catch {
      toast.error("Failed to copy link");
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date);
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }).format(date);
  };

  const isDueSoon =
    task?.dueDate &&
    new Date(task.dueDate) <= new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);
  const isOverdue = task?.dueDate && new Date(task.dueDate) < new Date();

  type Comment = {
    id: string;
    userId: string;
    content: string;
    createdAt: string;
  };
  const [commentContent, setCommentContent] = useState("");
  const [comments, setComments] = useState<Comment[]>([]);

  const handleAddComment = () => {
    if (!task) return;
    if (!commentContent.trim()) {
      toast.error("Comment cannot be empty");
      return;
    }
    const newComment: Comment = {
      id: `temp-${Date.now()}`,
      userId: currentUser?.id ?? "unknown",
      content: commentContent.trim(),
      createdAt: new Date().toISOString(),
    };
    setComments((prev) => [newComment, ...prev]);
    setCommentContent("");
    toast.success("Comment added");
  };

  const handleDeleteComment = (commentId: string) => {
    if (window.confirm("Delete this comment?")) {
      setComments((prev) => prev.filter((c) => c.id !== commentId));
      toast.success("Comment deleted");
    }
  };

  const handleTitleChange = (nextTitle: string) => {
    if (!task) return;
    updateTaskMutation.mutate({ id: task.id, data: { title: nextTitle } });
    toast.success("Title updated");
  };

  const handleDescriptionChange = (nextDescription: string) => {
    if (!task) return;
    updateTaskMutation.mutate({
      id: task.id,
      data: { description: nextDescription },
    });
    toast.success("Description updated");
  };

  return (
    <div className="h-full bg-background">
      <div className="p-4 md:p-6 space-y-4 md:space-y-6 w-full h-full">
        {/* Header */}
        <TaskDetailHeader
          isLoading={isLoading}
          projectName={project?.name}
          taskId={task?.id}
          title={task?.title ?? "Untitled task"}
          status={task?.status}
          priority={task?.priority}
          dueDate={task?.dueDate ?? undefined}
          isOverdue={Boolean(isOverdue)}
          onBack={() => navigate(-1)}
          onShare={handleShareLink}
          onTitleChange={handleTitleChange}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          {/* Main: Description + Comments */}
          <div className="lg:col-span-2 space-y-6">
            <TaskDescription
              description={task?.description ?? ""}
              onChange={handleDescriptionChange}
            />
            <TaskComments
              comments={comments}
              currentUserName={currentUser?.name}
              onAdd={(content) => {
                setCommentContent(content);
                handleAddComment();
              }}
              onAddDirect={(content) => {
                if (!content.trim()) {
                  toast.error("Comment cannot be empty");
                  return;
                }
                const newComment = {
                  id: `temp-${Date.now()}`,
                  userId: currentUser?.id ?? "unknown",
                  content: content.trim(),
                  createdAt: new Date().toISOString(),
                };
                setComments((prev) => [newComment, ...prev]);
              }}
              onDelete={(id) => handleDeleteComment(id)}
              formatDateTime={formatDateTime}
              users={allProjectUsers}
            />
          </div>

          {/* Right Rail: Properties + Metadata + Participants */}
          <div className="space-y-6">
            <TaskPropertiesCard
              status={task?.status}
              onStatusChange={(v) => handleStatusChange(v as TaskStatus)}
              priority={task?.priority}
              onPriorityChange={(v) => handlePriorityChange(v as TaskPriority)}
              dueDate={task?.dueDate ?? undefined}
              onDueDateChange={handleDueDateChange}
              isOverdue={Boolean(isOverdue)}
              isDueSoon={Boolean(isDueSoon)}
              formatDate={formatDate}
            />

            <TaskMetadataCard
              createdBy={owner?.name ?? "Unknown"}
              createdAt={task?.createdAt}
              updatedAt={task?.updatedAt}
              formatDate={formatDate}
            />

            <TaskParticipantsCard
              ownerName={owner?.name}
              memberNames={memberUsers.map((u) => u.name)}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskDetail;
