import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { X } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/api/auth/queries';
import { useProjects } from '@/api/projects/queries';
import { useModal } from '@/contexts/ModalContext';

export function ProjectModal() {
    const { user: currentUser } = useAuth();
    const { createProject, isCreating } = useProjects();

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [memberIds, setMemberIds] = useState<string[]>([]);

    const { isModalOpen, closeModal } = useModal();

    useEffect(() => {
        setName('');
        setDescription('');
        setMemberIds(currentUser ? [currentUser.id] : []);
    }, [currentUser]);

    const handleSubmit = () => {
        const projectData = {
            name: name.trim(),
            description: description.trim(),
            status: 'PLANNING',
            memberIds: memberIds.length > 0 ? memberIds : [currentUser?.id || '1'],
        };

        createProject(projectData, {
            onSuccess: () => {
                toast.success('Project created successfully');
                closeModal('project');
            },
            onError: (error: Error) => {
                toast.error(`Failed to create project: ${error.message}`);
            },
        });
    };

    return (
        <Dialog open={isModalOpen('project')} onOpenChange={() => closeModal('project')}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <div className="flex items-center justify-between">
                        <DialogTitle>
                            Create Project
                        </DialogTitle>
                    </div>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Project Name</Label>
                        <Input
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Enter project name"
                            className="mt-1"
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
                            className="mt-1"
                        />
                    </div>

                    <div className="flex justify-end gap-2">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => closeModal('project')}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isCreating}
                        >
                            Create Project
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
