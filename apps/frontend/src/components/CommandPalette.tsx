import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
} from '@/components/ui/command';
import {
    Plus,
    FolderKanban,
    CheckSquare,
    LayoutDashboard,
    LogOut,
    Search
} from 'lucide-react';
import { useAuth } from '@/api/auth/queries';
import { useAllProjects } from '@/api/projects/queries';
import { useModal } from '@/contexts/ModalContext';

export function CommandPalette() {
    const navigate = useNavigate();
    const { logout } = useAuth();
    const { data: projects = [] } = useAllProjects();
    const [isOpen, setIsOpen] = useState(false);

    const { openModal } = useModal();

    useEffect(() => {
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setIsOpen(prev => !prev);
            }
            if (e.key === 'Escape') {
                setIsOpen(false);
            }
        };

        const onOpen = (_e: Event) => setIsOpen(true);
        const onToggle = (_e: Event) => setIsOpen(prev => !prev);

        document.addEventListener('keydown', onKeyDown, true);
        window.addEventListener('command-palette-open', onOpen as EventListener);
        window.addEventListener('command-palette-toggle', onToggle as EventListener);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (window as any).openCommandPalette = () => setIsOpen(true);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (window as any).toggleCommandPalette = () => setIsOpen((prev) => !prev);
        return () => {
            document.removeEventListener('keydown', onKeyDown, true);
            window.removeEventListener('command-palette-open', onOpen as EventListener);
            window.removeEventListener('command-palette-toggle', onToggle as EventListener);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            delete (window as any).openCommandPalette;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            delete (window as any).toggleCommandPalette;
        };
    }, []);

    const handleSelect = (callback: () => void) => {
        callback();
        setIsOpen(false);
    };

    return (
        <CommandDialog open={isOpen} onOpenChange={setIsOpen}>
            <CommandInput placeholder="Type a command or search..." />
            <CommandList>
                <CommandEmpty>No results found.</CommandEmpty>

                <CommandGroup heading="Quick Actions">
                    <CommandItem onSelect={() => openModal('task')}>
                        <Plus className="mr-2 h-4 w-4" />
                        <span>New Task</span>
                        <span className="ml-auto text-muted-foreground">N</span>
                    </CommandItem>
                    <CommandItem onSelect={() => openModal('project')}>
                        <Plus className="mr-2 h-4 w-4" />
                        <span>New Project</span>
                        <span className="ml-auto text-muted-foreground">P</span>
                    </CommandItem>
                </CommandGroup>

                <CommandSeparator />

                <CommandGroup heading="Navigation">
                    <CommandItem onSelect={() => handleSelect(() => navigate('/dashboard'))}>
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        <span>Dashboard</span>
                    </CommandItem>
                    <CommandItem onSelect={() => handleSelect(() => navigate('/projects'))}>
                        <FolderKanban className="mr-2 h-4 w-4" />
                        <span>Projects</span>
                    </CommandItem>
                    <CommandItem onSelect={() => handleSelect(() => navigate('/tasks'))}>
                        <CheckSquare className="mr-2 h-4 w-4" />
                        <span>Tasks</span>
                    </CommandItem>
                </CommandGroup>

                {projects.length > 0 && (
                    <>
                        <CommandSeparator />
                        <CommandGroup heading="Projects">
                            {projects.slice(0, 5).map(project => (
                                <CommandItem
                                    key={project.id}
                                    onSelect={() => handleSelect(() => navigate(`/projects/${project.id}`))}
                                >
                                    <Search className="mr-2 h-4 w-4" />
                                    <span>{project.name}</span>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </>
                )}

                <CommandSeparator />

                <CommandGroup heading="Account">
                    <CommandItem onSelect={() => handleSelect(logout)}>
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Logout</span>
                    </CommandItem>
                </CommandGroup>
            </CommandList>
        </CommandDialog>
    );
}
