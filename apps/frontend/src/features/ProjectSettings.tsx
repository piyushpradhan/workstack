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
import { useProject, useUpdateProject, useDeleteProject } from "@/api/projects/queries";
import { useUsersByProjects } from "@/api/users/queries";
import { useAuth } from "@/api/auth/queries";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { isTemporaryId } from "@/lib/utils";

const ProjectSettings = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { data: project, isLoading: isLoadingProject } = useProject(id || "");
    const { updateProject, isUpdating } = useUpdateProject();
    const { deleteProject, isDeleting } = useDeleteProject();
    const { data: usersData } = useUsersByProjects(id ? [id] : [], 100);
    const users = usersData?.pages.flatMap(page => page.data) ?? [];
    const { user: currentUser } = useAuth();

    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [status, setStatus] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);

    useDocumentTitle(project ? `${project.name} - Settings` : "Project Settings");

    useEffect(() => {
        if (id && isTemporaryId(id)) {
            navigate("/projects");
        }
    }, [id, navigate]);

    useEffect(() => {
        if (project) {
            setName(project.name || "");
            setDescription(project.description || "");
            setStatus(project.status || "PLANNING");
            setStartDate(project.startDate ? project.startDate.split("T")[0] : "");
            setEndDate(project.endDate ? project.endDate.split("T")[0] : "");
            setSelectedMembers(project.members?.map((m) => m.id) || []);
        }
    }, [project]);

    if (isLoadingProject) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-muted-foreground">Loading project settings...</div>
            </div>
        );
    }

    if (!project) {
        return (
            <div className="p-6">
                <div className="text-center py-12">
                    <h2 className="text-foreground mb-2 font-semibold text-xl">Project not found</h2>
                    <p className="text-muted-foreground mb-4">
                        The project you're looking for doesn't exist or may have been deleted.
                    </p>
                    <Button onClick={() => navigate("/projects")} className="gap-2">
                        <ArrowLeft className="w-4 h-4" />
                        Back to Projects
                    </Button>
                </div>
            </div>
        );
    }

    const isOwner = project.owners?.some((o) => o.id === currentUser?.id);

    if (!isOwner) {
        return (
            <div className="p-6">
                <div className="text-center py-12">
                    <h2 className="text-foreground mb-2 font-semibold text-xl">Access Denied</h2>
                    <p className="text-muted-foreground mb-4">
                        You don't have permission to edit this project's settings.
                    </p>
                    <Button onClick={() => navigate(`/projects/${id}`)} className="gap-2">
                        <ArrowLeft className="w-4 h-4" />
                        Back to Project
                    </Button>
                </div>
            </div>
        );
    }

    const handleSave = () => {
        if (!name.trim()) {
            toast.error("Project name is required");
            return;
        }

        const updateData: {
            name?: string;
            description?: string;
            status?: string;
            startDate?: string;
            endDate?: string;
            memberIds?: string[];
        } = {};

        if (name.trim() !== project.name) {
            updateData.name = name.trim();
        }
        if (description.trim() !== (project.description || "")) {
            updateData.description = description.trim() || undefined;
        }
        if (status !== project.status) {
            updateData.status = status;
        }
        if (startDate !== (project.startDate ? project.startDate.split("T")[0] : "")) {
            updateData.startDate = startDate ? new Date(startDate).toISOString() : undefined;
        }
        if (endDate !== (project.endDate ? project.endDate.split("T")[0] : "")) {
            updateData.endDate = endDate ? new Date(endDate).toISOString() : undefined;
        }

        const currentMemberIds = project.members?.map((m) => m.id) || [];
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

        updateProject(
            { id: project.id, data: updateData },
            {
                onSuccess: () => {
                    toast.success("Project updated successfully");
                    navigate(`/projects/${project.id}`);
                },
                onError: (error: Error) => {
                    toast.error(`Failed to update project: ${error.message}`);
                },
            }
        );
    };

    const handleDelete = () => {
        deleteProject(project.id, {
            onSuccess: () => {
                toast.success("Project deleted successfully");
                navigate("/projects");
            },
            onError: (error: Error) => {
                toast.error(`Failed to delete project: ${error.message}`);
                setShowDeleteDialog(false);
            },
        });
    };

    const toggleMember = (userId: string) => {
        setSelectedMembers((prev) =>
            prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
        );
    };

    const availableUsers = users?.filter(
        (user) => !project.owners?.some((o) => o.id === user.id) && user.id !== currentUser?.id
    ) || [];

    return (
        <div className="flex flex-col h-full p-4 md:p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        onClick={() => navigate(`/projects/${id}`)}
                        className="gap-2"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back
                    </Button>
                    <div>
                        <h1 className="text-foreground text-2xl font-semibold">Project Settings</h1>
                        <p className="text-muted-foreground text-sm mt-1">
                            Manage your project details and configuration
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Settings */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Basic Information */}
                    <div className="bg-card border border-border rounded-lg p-6 space-y-4">
                        <h2 className="text-foreground text-lg font-semibold">Basic Information</h2>
                        <Separator />

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Project Name</Label>
                                <Input
                                    id="name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Enter project name"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Describe the project goals, timeline, and key deliverables..."
                                    rows={4}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="status">Status</Label>
                                <Select value={status} onValueChange={setStatus}>
                                    <SelectTrigger id="status">
                                        <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="PLANNING">Planning</SelectItem>
                                        <SelectItem value="ACTIVE">Active</SelectItem>
                                        <SelectItem value="ON_HOLD">On Hold</SelectItem>
                                        <SelectItem value="COMPLETED">Completed</SelectItem>
                                        <SelectItem value="CANCELLED">Cancelled</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>

                    {/* Dates */}
                    <div className="bg-card border border-border rounded-lg p-6 space-y-4">
                        <h2 className="text-foreground text-lg font-semibold flex items-center gap-2">
                            <Calendar className="w-5 h-5" />
                            Timeline
                        </h2>
                        <Separator />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="startDate">Start Date</Label>
                                <Input
                                    id="startDate"
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="endDate">End Date</Label>
                                <Input
                                    id="endDate"
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    min={startDate || undefined}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Members */}
                    <div className="bg-card border border-border rounded-lg p-6 space-y-4">
                        <h2 className="text-foreground text-lg font-semibold">Team Members</h2>
                        <Separator />

                        <div className="space-y-4">
                            <div>
                                <Label className="mb-2 block">Owners</Label>
                                <div className="flex flex-wrap gap-2">
                                    {project.owners?.map((owner) => (
                                        <div
                                            key={owner.id}
                                            className="px-3 py-1.5 bg-primary/10 text-primary rounded-md text-sm font-medium"
                                        >
                                            {owner.name || owner.email}
                                        </div>
                                    ))}
                                </div>
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

                {/* Actions Sidebar */}
                <div className="space-y-6">
                    <div className="bg-card border border-border rounded-lg p-6 space-y-4">
                        <h2 className="text-foreground text-lg font-semibold">Actions</h2>
                        <Separator />

                        <div className="space-y-3">
                            <Button
                                onClick={handleSave}
                                disabled={isUpdating}
                                className="w-full gap-2"
                            >
                                <Save className="w-4 h-4" />
                                {isUpdating ? "Saving..." : "Save Changes"}
                            </Button>

                            <Button
                                variant="outline"
                                onClick={() => navigate(`/projects/${id}`)}
                                className="w-full"
                            >
                                Cancel
                            </Button>
                        </div>
                    </div>

                    {/* Danger Zone */}
                    <div className="bg-card border border-destructive/50 rounded-lg p-6 space-y-4">
                        <h2 className="text-destructive text-lg font-semibold">Danger Zone</h2>
                        <Separator />

                        <div className="space-y-3">
                            <p className="text-muted-foreground text-sm">
                                Once you delete a project, there is no going back. Please be certain.
                            </p>
                            <Button
                                variant="destructive"
                                onClick={() => setShowDeleteDialog(true)}
                                disabled={isDeleting}
                                className="w-full gap-2"
                            >
                                <Trash2 className="w-4 h-4" />
                                Delete Project
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Delete Confirmation Dialog */}
            <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Project</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete "{project.name}"? This action cannot be undone
                            and will permanently delete the project and all associated tasks.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setShowDeleteDialog(false)}
                            disabled={isDeleting}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDelete}
                            disabled={isDeleting}
                        >
                            {isDeleting ? "Deleting..." : "Delete Project"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default ProjectSettings;

