import {
    Search,
    Plus,
    Bell,
    Command,
    Menu,
    CheckSquare,
    FolderKanban,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate, useLocation } from "react-router-dom";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useUIState } from "@/state/ui/state";
import { useModal } from "@/contexts/ModalContext";

interface TopNavProps {
    onMobileMenuClick?: () => void;
}

export function TopNav({ onMobileMenuClick }: TopNavProps) {
    const navigate = useNavigate();
    const location = useLocation();
    const { setIsCommandPaletteOpen, getIsCommandPaletteOpen } = useUIState();
    const { openModal } = useModal();

    const getPageTitle = () => {
        const path = location.pathname;
        if (path === "/dashboard") return "Dashboard";
        if (path === "/projects") return "Projects";
        if (path === "/tasks") return "Tasks";
        if (path === "/settings") return "Settings";
        if (path.startsWith("/projects/")) return "Project Details";
        return "Workstack";
    };

    const isCommandPaletteOpen = getIsCommandPaletteOpen();

    return (
        <div
            className="border-b dark:border-gray-700 dark:bg-gray-900 sticky top-0 z-10 backdrop-blur-sm"
            style={{ boxShadow: "0 1px 0 0 rgba(0, 0, 0, 0.1)" }}
        >
            <div className="flex items-center justify-between px-3 md:px-4 py-2.5 gap-2 md:gap-3">
                <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0">
                    <Button
                        onClick={onMobileMenuClick}
                        className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-smooth lg:hidden flex-shrink-0"
                    >
                        <Menu className="w-5 h-5 dark:text-gray-100" />
                    </Button>

                    <h1 className="dark:text-gray-100 text-base md:text-lg truncate">
                        {getPageTitle()}
                    </h1>

                    <Button
                        onClick={() => setIsCommandPaletteOpen(!isCommandPaletteOpen)}
                        className="hidden bg-background hover:bg-secondary sm:flex items-center gap-2 px-2.5 py-1.5 dark:bg-gray-800 border dark:border-gray-700 rounded text-gray-500 hover:border-gray-700 dark:hover:border-gray-600 transition-smooth max-w-md w-full shadow-sm"
                    >
                        <Search className="w-3.5 h-3.5 flex-shrink-0" />
                        <span className="flex-1 text-left text-xs truncate">
                            Search...
                        </span>
                        <kbd className="hidden md:inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-background dark:bg-gray-900 border dark:border-gray-700 rounded text-xs text-gray-500">
                            <Command className="w-2.5 h-2.5" />K
                        </kbd>
                    </Button>
                </div>

                <div className="flex items-center gap-1.5 md:gap-2 flex-shrink-0">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsCommandPaletteOpen(!isCommandPaletteOpen)}
                        className="sm:hidden bg-gray-50 dark:bg-gray-800 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 border dark:border-gray-700 shadow-sm transition-smooth p-2"
                    >
                        <Search className="w-4 h-4" />
                    </Button>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                size="sm"
                                className="cursor-pointer"
                            >
                                <Plus className="w-4 h-4" />
                                <span className="hidden md:inline">New</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                            align="end"
                        >
                            <DropdownMenuItem
                                onClick={() => openModal('task')}
                            >
                                <CheckSquare className="mr-2 h-4 w-4" />
                                New Task
                                <span className="ml-auto text-gray-500 text-xs">
                                    N
                                </span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => openModal('project')}
                            >
                                <FolderKanban className="mr-2 h-4 w-4" />
                                New Project
                                <span className="ml-auto text-gray-500 text-xs">
                                    P
                                </span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <Button
                        variant="ghost"
                        size="sm"
                    >
                        <Bell className="w-4 h-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
}