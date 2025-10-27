import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Command,
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
import { useUIState } from '@/state/ui/state';
import { useAuth } from '@/api/auth/queries';
import { useAllProjects } from '@/api/projects/queries';
import { useModal } from '@/contexts/ModalContext';

export function CommandPalette() {
    const navigate = useNavigate();
    const { logout } = useAuth();
    const { data: projects = [] } = useAllProjects();
    const { getIsCommandPaletteOpen, setIsCommandPaletteOpen, toggleCommandPalette } = useUIState();
    const [search, setSearch] = useState('');

    const { openModal } = useModal();

    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                toggleCommandPalette();
            }
            if (e.key === 'Escape') {
                setIsCommandPaletteOpen(false);
            }
        };

        document.addEventListener('keydown', down);
        return () => document.removeEventListener('keydown', down);
    }, [getIsCommandPaletteOpen, setIsCommandPaletteOpen, toggleCommandPalette]);

    const handleSelect = (callback: () => void) => {
        callback();
        setIsCommandPaletteOpen(false);
    };

    return (
        <CommandDialog open={getIsCommandPaletteOpen()} onOpenChange={setIsCommandPaletteOpen}>
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
