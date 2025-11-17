import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Trash2, Save, Calendar } from "lucide-react";
import { toast } from "sonner";
import { useTask, useUpdateTask, useDeleteTask } from "@/api/tasks/queries";
import { useUsersByProjects } from "@/api/users/queries";
import { useAuth } from "@/api/auth/queries";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { isTemporaryId } from "@/lib/utils";
import type { TaskStatus, TaskPriority } from "@/state";

const TaskSettings = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { data: task, isLoading: isLoadingTask } = useTask(id || "");
    const updateTaskMutation = useUpdateTask();
    const deleteTaskMutation = useDeleteTask();
    const { data: usersData } = useUsersByProjects(task?.projectId ? [task.projectId] : [], 100);
    const users = usersData?.pages.flatMap(page => page.data) ?? [];
    const { user: currentUser } = useAuth();

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [status, setStatus] = useState<TaskStatus>("TODO");
    const [priority, setPriority] = useState<TaskPriority>("MEDIUM");
    const [dueDate, setDueDate] = useState("");
    const [selectedOwners, setSelectedOwners] = useState<string[]>([]);
    const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);

    useDocumentTitle(task ? `${task.title} - Settings` : "Task Settings");

    useEffect(() => {
        if (id && isTemporaryId(id)) {
            navigate("/tasks");
        }
    }, [id, navigate]);

    useEffect(() => {
        if (task) {
            setTitle(task.title || "");
            setDescription(task.description || "");
            setStatus(task.status || "TODO");
            setPriority(task.priority || "MEDIUM");
            setDueDate(task.dueDate ? task.dueDate.split("T")[0] : "");
            setSelectedOwners(task.owners?.map((o) => o.id) || []);
            setSelectedMembers(task.members?.map((m) => m.id) || []);
        }
    }, [task]);

    if (isLoadingTask) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-muted-foreground">Loading task settings...</div>
            </div>
        );
    }

    if (!task) {
        return (
            <div className="p-6">
                <div className="text-center py-12">
                    <h2 className="text-foreground mb-2 font-semibold text-xl">Task not found</h2>
                    <p className="text-muted-foreground mb-4">
                        The task you're looking for doesn't exist or may have been deleted.
                    </p>
                    <Button onClick={() => navigate("/tasks")} className="gap-2">
                        <ArrowLeft className="w-4 h-4" />
                        Back to Tasks
                    </Button>
                </div>
            </div>
        );
    }

    const isOwner = task.owners?.some((o) => o.id === currentUser?.id) || task.ownerId === currentUser?.id;
    const isMember = task.members?.some((m) => m.id === currentUser?.id);

    if (!isOwner && !isMember) {
        return (
            <div className="p-6">
                <div className="text-center py-12">
                    <h2 className="text-foreground mb-2 font-semibold text-xl">Access Denied</h2>
                    <p className="text-muted-foreground mb-4">
                        You don't have permission to edit this task's settings.
                    </p>
                    <Button onClick={() => navigate(`/tasks/${id}`)} className="gap-2">
                        <ArrowLeft className="w-4 h-4" />
                        Back to Task
                    </Button>
                </div>
            </div>
        );
    }

    const handleSave = () => {
        if (!title.trim()) {
            toast.error("Task title is required");
            return;
        }

        const updateData: {
            title?: string;
            description?: string;
            status?: TaskStatus;
            priority?: TaskPriority;
            dueDate?: string;
            ownerIds?: string[];
            memberIds?: string[];
        } = {};

        if (title.trim() !== task.title) {
            updateData.title = title.trim();
        }
        if (description.trim() !== (task.description || "")) {
            updateData.description = description.trim() || undefined;
        }
        if (status !== task.status) {
            updateData.status = status;
        }
        if (priority !== task.priority) {
            updateData.priority = priority;
        }
        if (dueDate !== (task.dueDate ? task.dueDate.split("T")[0] : "")) {
            updateData.dueDate = dueDate ? new Date(dueDate).toISOString() : undefined;
        }

        const currentOwnerIds = task.owners?.map((o) => o.id) || [];
        const ownersChanged =
            selectedOwners.length !== currentOwnerIds.length ||
            selectedOwners.some((id) => !currentOwnerIds.includes(id));

        if (ownersChanged) {
            updateData.ownerIds = selectedOwners;
        }

        const currentMemberIds = task.members?.map((m) => m.id) || [];
        const membersChanged =
            selectedMembers.length !== currentMemberIds.length ||
            selectedMembers.some((id) => !currentMemberIds.includes(id));

        if (membersChanged) {
            updateData.memberIds = selectedMembers;
        }

        if (Object.keys(updateData).length === 0) {
            toast.info("No changes to save");
            return;
        }

        updateTaskMutation.mutate(
            { id: task.id, data: updateData },
            {
                onSuccess: () => {
                    toast.success("Task updated successfully");
                    navigate(`/tasks/${task.id}`);
                },
                onError: (error: Error) => {
                    toast.error(`Failed to update task: ${error.message}`);
                },
            }
        );
    };

    const handleDelete = () => {
        deleteTaskMutation.mutate(task.id, {
            onSuccess: () => {
                toast.success("Task deleted successfully");
                navigate("/tasks");
            },
            onError: (error: Error) => {
                toast.error(`Failed to delete task: ${error.message}`);
            },
        }
        );
    };

    const toggleOwner = (userId: string) => {
        setSelectedOwners((prev) =>
            prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
        );
    };

    const toggleMember = (userId: string) => {
        setSelectedMembers((prev) =>
            prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
        );
    };

    const availableUsers = users?.filter((user) => user.id !== currentUser?.id) || [];

    return (
        <div className="flex flex-col h-full p-4 md:p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        onClick={() => navigate(`/tasks/${id}`)}
                        className="gap-2"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back
                    </Button>
                    <div>
                        <h1 className="text-foreground text-2xl font-semibold">Task Settings</h1>
                        <p className="text-muted-foreground text-sm mt-1">
                            Manage your task details and configuration
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-card border border-border rounded-lg p-6 space-y-4">
                        <h2 className="text-foreground text-lg font-semibold">Basic Information</h2>
                        <Separator />

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="title">Task Title</Label>
                                <Input
                                    id="title"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="Enter task title"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Describe the task..."
                                    rows={4}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="status">Status</Label>
                                    <Select value={status} onValueChange={(v) => setStatus(v as TaskStatus)}>
                                        <SelectTrigger id="status">
                                            <SelectValue placeholder="Select status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="TODO">Todo</SelectItem>
                                            <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                                            <SelectItem value="IN_REVIEW">In Review</SelectItem>
                                            <SelectItem value="DONE">Done</SelectItem>
                                            <SelectItem value="CANCELLED">Cancelled</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="priority">Priority</Label>
                                    <Select value={priority} onValueChange={(v) => setPriority(v as TaskPriority)}>
                                        <SelectTrigger id="priority">
                                            <SelectValue placeholder="Select priority" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="LOW">Low</SelectItem>
                                            <SelectItem value="MEDIUM">Medium</SelectItem>
                                            <SelectItem value="HIGH">High</SelectItem>
                                            <SelectItem value="URGENT">Urgent</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-card border border-border rounded-lg p-6 space-y-4">
                        <h2 className="text-foreground text-lg font-semibold flex items-center gap-2">
                            <Calendar className="w-5 h-5" />
                            Timeline
                        </h2>
                        <Separator />

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

                    <div className="bg-card border border-border rounded-lg p-6 space-y-4">
                        <h2 className="text-foreground text-lg font-semibold">Participants</h2>
                        <Separator />

                        <div className="space-y-4">
                            <div>
                                <Label className="mb-2 block">Owners</Label>
                                {availableUsers.length > 0 ? (
                                    <div className="space-y-2">
                                        {availableUsers.map((user) => (
                                            <label
                                                key={user.id}
                                                className="flex items-center gap-3 p-2 rounded-md hover:bg-accent cursor-pointer"
                                            >
                                                <Checkbox
                                                    checked={selectedOwners.includes(user.id)}
                                                    onCheckedChange={() => toggleOwner(user.id)}
                                                />
                                                <span className="text-sm">{user.name || user.email}</span>
                                            </label>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-muted-foreground text-sm">
                                        No additional users available to add as owners.
                                    </p>
                                )}
                            </div>

                            <div>
                                <Label className="mb-2 block">Members</Label>
                                {availableUsers.length > 0 ? (
                                    <div className="space-y-2">
                                        {availableUsers.map((user) => (
                                            <label
                                                key={user.id}
                                                className="flex items-center gap-3 p-2 rounded-md hover:bg-accent cursor-pointer"
                                            >
                                                <Checkbox
                                                    checked={selectedMembers.includes(user.id)}
                                                    onCheckedChange={() => toggleMember(user.id)}
                                                />
                                                <span className="text-sm">{user.name || user.email}</span>
                                            </label>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-muted-foreground text-sm">
                                        No additional users available to add as members.
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-card border border-border rounded-lg p-6 space-y-4">
                        <h2 className="text-foreground text-lg font-semibold">Actions</h2>
                        <Separator />

                        <div className="space-y-3">
                            <Button
                                onClick={handleSave}
                                disabled={updateTaskMutation.isPending}
                                className="w-full gap-2"
                            >
                                <Save className="w-4 h-4" />
                                {updateTaskMutation.isPending ? "Saving..." : "Save Changes"}
                            </Button>

                            <Button
                                variant="outline"
                                onClick={() => navigate(`/tasks/${id}`)}
                                className="w-full"
                            >
                                Cancel
                            </Button>
                        </div>
                    </div>

                    {isOwner && (
                        <div className="bg-card border border-destructive/50 rounded-lg p-6 space-y-4">
                            <h2 className="text-destructive text-lg font-semibold">Danger Zone</h2>
                            <Separator />

                            <div className="space-y-3">
                                <p className="text-muted-foreground text-sm">
                                    Once you delete a task, there is no going back. Please be certain.
                                </p>
                                <Button
                                    variant="destructive"
                                    onClick={() => setShowDeleteDialog(true)}
                                    disabled={deleteTaskMutation.isPending}
                                    className="w-full gap-2"
                                >
                                    <Trash2 className="w-4 h-4" />
                                    Delete Task
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Task</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete "{task.title}"? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setShowDeleteDialog(false)}
                            disabled={deleteTaskMutation.isPending}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDelete}
                            disabled={deleteTaskMutation.isPending}
                        >
                            {deleteTaskMutation.isPending ? "Deleting..." : "Delete Task"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default TaskSettings;

