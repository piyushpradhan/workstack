import { Button } from "@/components/ui/button";
import { SlidersHorizontal } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuCheckboxItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type ProjectStatus = "PLANNING" | "ACTIVE" | "ON_HOLD" | "COMPLETED" | "CANCELLED";

interface ProjectsFiltersProps {
    selectedStatuses: ProjectStatus[];
    setSelectedStatuses: (statuses: ProjectStatus[]) => void;
    hasActiveFilters: boolean;
    clearFilters: () => void;
}

export function ProjectsFilters({
    selectedStatuses,
    setSelectedStatuses,
    hasActiveFilters,
    clearFilters,
}: ProjectsFiltersProps) {
    const toggleFilter = (status: ProjectStatus) => {
        if (selectedStatuses.includes(status))
            setSelectedStatuses(selectedStatuses.filter((s) => s !== status));
        else setSelectedStatuses([...selectedStatuses, status]);
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="outline"
                    className="gap-2 border-border hover:bg-accent flex-shrink-0 w-full sm:w-auto cursor-pointer"
                >
                    <SlidersHorizontal className="w-4 h-4" />
                    <span className="hidden sm:inline">Filters</span>
                    {hasActiveFilters && (
                        <span className="ml-1 px-1.5 py-0.5 bg-primary text-primary-foreground rounded-full text-xs">
                            {selectedStatuses.length}
                        </span>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                align="end"
                className="w-64 max-h-[60vh] overflow-y-auto"
            >
                <DropdownMenuLabel>
                    Filter by Status
                </DropdownMenuLabel>
                {(
                    [
                        "PLANNING",
                        "ACTIVE",
                        "ON_HOLD",
                        "COMPLETED",
                        "CANCELLED",
                    ] as ProjectStatus[]
                ).map((status) => (
                    <DropdownMenuCheckboxItem
                        key={status}
                        checked={selectedStatuses.includes(status)}
                        onCheckedChange={() => toggleFilter(status)}
                    >
                        {status.replace("_", " ")}
                    </DropdownMenuCheckboxItem>
                ))}

                {hasActiveFilters && (
                    <>
                        <DropdownMenuSeparator />
                        <button
                            onClick={clearFilters}
                            className="w-full px-2 py-1.5 rounded text-sm text-muted-foreground hover:text-foreground hover:bg-accent text-left"
                        >
                            Clear all filters
                        </button>
                    </>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

