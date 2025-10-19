import { motion } from "motion/react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { LogOut, User, Settings } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/api/auth/queries";

const Dashboard = () => {
    const navigate = useNavigate();
    const { user, logout, isLoggingOut, isAuthenticated, isLoading } = useAuth();

    const handleLogout = () => {
        logout(undefined, {
            onSuccess: () => {
                toast.success('Logged out successfully');
                navigate('/login');
            },
            onError: (error) => {
                toast.error('Logout failed');
                console.error(error);
            },
        });
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        navigate('/login');
        return null;
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="border-b border-border bg-card">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center">
                            <h1 className="text-xl font-semibold text-foreground">Workstack</h1>
                        </div>

                        <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2">
                                <User className="h-5 w-5 text-muted-foreground" />
                                <span className="text-sm text-foreground">{user?.name}</span>
                            </div>

                            <Button variant="ghost" size="sm">
                                <Settings className="h-4 w-4" />
                            </Button>

                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleLogout}
                                disabled={isLoggingOut}
                            >
                                <LogOut className="h-4 w-4 mr-2" />
                                {isLoggingOut ? 'Logging out...' : 'Logout'}
                            </Button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                >
                    <div>
                        <h2 className="text-2xl font-bold text-foreground">Welcome back, {user?.name}!</h2>
                        <p className="text-muted-foreground">Here's what's happening with your projects today.</p>
                    </div>

                    {/* User Info Card */}
                    <div className="bg-card border border-border rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-foreground mb-4">Account Information</h3>
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Name:</span>
                                <span className="text-foreground">{user?.name}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Email:</span>
                                <span className="text-foreground">{user?.email}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Member since:</span>
                                <span className="text-foreground">
                                    {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="bg-card border border-border rounded-lg p-6">
                            <h3 className="text-lg font-semibold text-foreground mb-2">Projects</h3>
                            <p className="text-muted-foreground mb-4">Manage your projects and tasks</p>
                            <Button className="w-full">View Projects</Button>
                        </div>

                        <div className="bg-card border border-border rounded-lg p-6">
                            <h3 className="text-lg font-semibold text-foreground mb-2">Team</h3>
                            <p className="text-muted-foreground mb-4">Collaborate with your team</p>
                            <Button className="w-full">View Team</Button>
                        </div>

                        <div className="bg-card border border-border rounded-lg p-6">
                            <h3 className="text-lg font-semibold text-foreground mb-2">Settings</h3>
                            <p className="text-muted-foreground mb-4">Customize your experience</p>
                            <Button className="w-full">Open Settings</Button>
                        </div>
                    </div>
                </motion.div>
            </main>
        </div>
    );
};

export default Dashboard;
