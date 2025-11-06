import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useAuth } from "@/api/auth/queries";
import { useAllProjects } from "@/api/projects/queries";
import { useCreateTask } from "@/api/tasks/queries";
import type { TaskStatus, TaskPriority } from "@/state/tasks/types";
import { useUsers } from "@/api/users/queries";
import type { User } from "@/api/users/types";
import { SelectField } from "./TaskOptionSelect";
import { useModal } from "@/contexts/ModalContext";

export function TaskModal() {
  const { isModalOpen, closeModal, modalState } = useModal();
  const { user: currentUser } = useAuth();
  const { data: projects = [] } = useAllProjects();
  const { allProjectUsers } = useUsers();
  const createTaskMutation = useCreateTask();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<TaskStatus>("TODO");
  const [priority, setPriority] = useState<TaskPriority>("MEDIUM");
  const [projectId, setProjectId] = useState("");
  const [ownerId, setOwnerId] = useState("");
  const [dueDate, setDueDate] = useState("");

  useEffect(() => {
    if (modalState.task) {
      setTitle("");
      setDescription("");
      setStatus("TODO");
      setPriority("MEDIUM");
      setProjectId("");
      setOwnerId(currentUser?.id || "");
      setDueDate("");
    }
  }, [currentUser, modalState.task]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error("Please enter a task title");
      return;
    }

    if (!projectId) {
      toast.error("Please select a project");
      return;
    }

    if (!ownerId) {
      toast.error("Please select an assignee");
      return;
    }

    createTaskMutation.mutate(
      {
        title: title.trim(),
        description: description.trim() || undefined,
        status,
        priority,
        dueDate: dueDate || undefined,
        projectId,
        ownerId,
        memberIds: [ownerId],
      },
      {
        onSuccess: () => {
          toast.success("Task created successfully");
          closeModal("task");
          setTitle("");
          setDescription("");
          setStatus("TODO");
          setPriority("MEDIUM");
          setProjectId("");
          setOwnerId(currentUser?.id || "");
          setDueDate("");
        },
        onError: (error) => {
          toast.error(error.message || "Failed to create task");
        },
      },
    );
  };

  return (
    <Dialog open={isModalOpen("task")} onOpenChange={() => closeModal("task")}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Create Task</DialogTitle>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Task title"
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add a description..."
              rows={4}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <SelectField
              label="Project"
              value={projectId}
              onValueChange={setProjectId}
              options={projects.map((p) => ({ value: p.id, label: p.name }))}
              placeholder="Select project"
            />
            <SelectField
              label="Assignee"
              value={ownerId}
              onValueChange={setOwnerId}
              options={allProjectUsers.map((user: User) => ({
                value: user.id,
                label: user.name,
              }))}
              placeholder="Unassigned"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <SelectField
              label="Status"
              value={status}
              onValueChange={(v) => setStatus(v as TaskStatus)}
              options={[
                { value: "TODO", label: "Todo" },
                { value: "IN_PROGRESS", label: "In Progress" },
                { value: "IN_REVIEW", label: "In Review" },
                { value: "DONE", label: "Done" },
                { value: "CANCELLED", label: "Cancelled" },
              ]}
            />
            <SelectField
              label="Priority"
              value={priority}
              onValueChange={(v) => setPriority(v as TaskPriority)}
              options={[
                { value: "LOW", label: "Low" },
                { value: "MEDIUM", label: "Medium" },
                { value: "HIGH", label: "High" },
                { value: "URGENT", label: "Urgent" },
              ]}
            />
            <div className="space-y-2">
              <Label htmlFor="dueDate">Due Date</Label>
              <Input
                id="dueDate"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => closeModal("task")}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={createTaskMutation.isPending}>
              {createTaskMutation.isPending ? "Creating..." : "Create Task"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
