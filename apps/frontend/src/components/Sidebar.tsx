import { Link, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    FolderKanban,
    CheckSquare,
    Settings,
    ChevronLeft,
    ChevronRight,
    X
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'motion/react';

const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Projects', href: '/projects', icon: FolderKanban },
    { name: 'Tasks', href: '/tasks', icon: CheckSquare },
    { name: 'Settings', href: '/settings', icon: Settings },
];

interface SidebarProps {
    isMobileOpen?: boolean;
    onMobileClose?: () => void;
}

export function Sidebar({ isMobileOpen = false, onMobileClose }: SidebarProps) {
    const location = useLocation();
    const [collapsed, setCollapsed] = useState(false);

    // Close mobile sidebar on route change
    useEffect(() => {
        if (isMobileOpen && onMobileClose) {
            onMobileClose();
        }
    }, [location.pathname]);

    const sidebarContent = (
        <motion.div
            initial={false}
            animate={{ width: collapsed ? 64 : 240 }}
            className="border-r flex flex-col h-screen"
        >
            <div className="p-3 flex items-center justify-between border-b dark:border-gray-700">
                {!collapsed && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center gap-2"
                    >
                        <div className="w-7 h-7 rounded flex items-center justify-center shadow-sm">
                            <CheckSquare className="w-4 h-4" />
                        </div>
                        <span className="dark:text-gray-100">Workstack</span>
                    </motion.div>
                )}
                <Button
                    onClick={() => setCollapsed(!collapsed)}
                    className="p-1 rounded transition-smooth ml-auto hidden lg:block bg-background cursor-pointer"
                >
                    {collapsed ? (
                        <ChevronRight className="w-4 h-4 text-gray-500" />
                    ) : (
                        <ChevronLeft className="w-4 h-4 text-gray-500" />
                    )}
                </Button>
                <Button
                    onClick={onMobileClose}
                    className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-smooth ml-auto lg:hidden"
                >
                    <X className="w-4 h-4 text-gray-500" />
                </Button>
            </div>

            <nav className="flex-1 px-2 py-2 space-y-0.5 overflow-y-auto">
                {navigation.map((item) => {
                    const isActive = location.pathname === item.href || location.pathname.startsWith(item.href + '/');
                    return (
                        <Link
                            key={item.name}
                            to={item.href}
                            className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded transition-smooth relative group ${isActive
                                ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
                                : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-900 hover:text-gray-900 dark:hover:text-gray-100'
                                }`}
                        >
                            <item.icon className="w-4 h-4 flex-shrink-0" />
                            {!collapsed && (
                                <motion.span
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                >
                                    {item.name}
                                </motion.span>
                            )}
                            {isActive && (
                                <motion.div
                                    layoutId="sidebar-indicator"
                                    className="absolute left-0 top-0 bottom-0 w-0.5 bg-blue-500 rounded-r"
                                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                                />
                            )}
                        </Link>
                    );
                })}
            </nav>

            <div className="p-3 border-t dark:border-gray-700">
                <div className={`flex items-center gap-2.5 ${collapsed ? 'justify-center' : ''}`}>
                    <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm">
                        <span className="text-white text-xs">D</span>
                    </div>
                    {!collapsed && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex-1 min-w-0"
                        >
                            <div className="text-sm truncate">Demo User</div>
                            <div className="text-xs truncate">demo@workstack.app</div>
                        </motion.div>
                    )}
                </div>
            </div>
        </motion.div>
    );

    return (
        <>
            {/* Desktop sidebar */}
            <div className="hidden lg:block sticky top-0">
                {sidebarContent}
            </div>

            {/* Mobile sidebar */}
            <AnimatePresence>
                {isMobileOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={onMobileClose}
                            className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm"
                        />

                        {/* Drawer */}
                        <motion.div
                            initial={{ x: -240 }}
                            animate={{ x: 0 }}
                            exit={{ x: -240 }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="fixed left-0 top-0 bottom-0 z-50 lg:hidden"
                        >
                            {sidebarContent}
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}