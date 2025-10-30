import { Input } from '../../../components/ui/input';
import { Button } from '../../../components/ui/button';
import { Search, SlidersHorizontal } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuCheckboxItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '../../../components/ui/dropdown-menu';
import type { TaskPriority, TaskStatus } from '@/state';

interface ProjectLike { id: string; name: string }
interface UserLike { id: string; name: string }

interface TasksFiltersProps {
    searchQuery: string;
    onSearchChange: (q: string) => void;
    projects: ProjectLike[];
    users: UserLike[];
    selectedProjects: string[];
    setSelectedProjects: (ids: string[]) => void;
    selectedStatuses: TaskStatus[];
    setSelectedStatuses: (statuses: TaskStatus[]) => void;
    selectedPriorities: TaskPriority[];
    setSelectedPriorities: (p: TaskPriority[]) => void;
    selectedAssignees: string[];
    setSelectedAssignees: (ids: string[]) => void;
    hasActiveFilters: boolean;
    clearFilters: () => void;
}

export function TasksFilters({
    searchQuery,
    onSearchChange,
    projects,
    users,
    selectedProjects,
    setSelectedProjects,
    selectedStatuses,
    setSelectedStatuses,
    selectedPriorities,
    setSelectedPriorities,
    selectedAssignees,
    setSelectedAssignees,
    hasActiveFilters,
    clearFilters,
}: TasksFiltersProps) {
    const toggleFilter = <T,>(value: T, selected: T[], setSelected: (values: T[]) => void) => {
        if (selected.includes(value)) setSelected(selected.filter(v => v !== value)); else setSelected([...selected, value]);
    };

    return (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 md:gap-4">
            <div className="relative flex-1 sm:max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6b7280]" />
                <Input
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    placeholder="Search tasks..."
                    className="bg-[#161b22] border-[#21262d] text-white placeholder:text-[#6b7280] pl-10"
                />
            </div>

            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="gap-2 bg-[#161b22] border-[#21262d] text-white hover:bg-[#21262d] flex-shrink-0 w-full sm:w-auto">
                        <SlidersHorizontal className="w-4 h-4" />
                        <span className="hidden sm:inline">Filters</span>
                        {hasActiveFilters && (
                            <span className="ml-1 px-1.5 py-0.5 bg-[#0969da] text-white rounded-full text-xs">
                                {selectedProjects.length + selectedStatuses.length + selectedPriorities.length + selectedAssignees.length}
                            </span>
                        )}
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64 bg-[#161b22] border-[#21262d] max-h-[80vh] overflow-y-auto">
                    <DropdownMenuLabel className="text-white">Filter by Project</DropdownMenuLabel>
                    {projects?.map(project => (
                        <DropdownMenuCheckboxItem
                            key={project.id}
                            checked={selectedProjects.includes(project.id)}
                            onCheckedChange={() => toggleFilter(project.id, selectedProjects, setSelectedProjects)}
                            className="text-white hover:bg-[#21262d]"
                        >
                            {project.name}
                        </DropdownMenuCheckboxItem>
                    ))}

                    <DropdownMenuSeparator className="bg-[#21262d]" />
                    <DropdownMenuLabel className="text-white">Filter by Status</DropdownMenuLabel>
                    {(['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE', 'CANCELLED'] as TaskStatus[]).map(status => (
                        <DropdownMenuCheckboxItem
                            key={status}
                            checked={selectedStatuses.includes(status)}
                            onCheckedChange={() => toggleFilter(status, selectedStatuses, setSelectedStatuses)}
                            className="text-white hover:bg-[#21262d]"
                        >
                            {status.replace('_', ' ')}
                        </DropdownMenuCheckboxItem>
                    ))}

                    <DropdownMenuSeparator className="bg-[#21262d]" />
                    <DropdownMenuLabel className="text-white">Filter by Priority</DropdownMenuLabel>
                    {(['LOW', 'MEDIUM', 'HIGH', 'URGENT'] as TaskPriority[]).map(priority => (
                        <DropdownMenuCheckboxItem
                            key={priority}
                            checked={selectedPriorities.includes(priority)}
                            onCheckedChange={() => toggleFilter(priority, selectedPriorities, setSelectedPriorities)}
                            className="text-white hover:bg-[#21262d]"
                        >
                            {priority}
                        </DropdownMenuCheckboxItem>
                    ))}

                    <DropdownMenuSeparator className="bg-[#21262d]" />
                    <DropdownMenuLabel className="text-white">Filter by Assignee</DropdownMenuLabel>
                    {users?.map(user => (
                        <DropdownMenuCheckboxItem
                            key={user.id}
                            checked={selectedAssignees.includes(user.id)}
                            onCheckedChange={() => toggleFilter(user.id, selectedAssignees, setSelectedAssignees)}
                            className="text-white hover:bg-[#21262d]"
                        >
                            {user.name}
                        </DropdownMenuCheckboxItem>
                    ))}

                    {hasActiveFilters && (
                        <>
                            <DropdownMenuSeparator className="bg-[#21262d]" />
                            <button onClick={clearFilters} className="w-full px-2 py-1.5 text-[#0969da] hover:bg-[#21262d] rounded">
                                Clear all filters
                            </button>
                        </>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}


