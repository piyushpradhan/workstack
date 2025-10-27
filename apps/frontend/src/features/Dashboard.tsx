import { Link, useNavigate } from 'react-router-dom';
import {
    FolderKanban,
    CheckSquare,
    AlertCircle,
    TrendingUp,
    Calendar,
    Activity
} from 'lucide-react';
import { motion } from 'motion/react';
import { TaskCard } from '@/components/tasks/TaskCard';
import { useAuth } from '@/api/auth/queries';
import { useAllProjects } from '@/api/projects/queries';
import { TaskModal } from '@/components/tasks/TaskModal';
import { ProjectModal } from '@/components/projects/ProjectModal';

const Dashboard = () => {
    const navigate = useNavigate();
    const { user: currentUser, isLoading: authLoading } = useAuth();
    const { data: projects = [], isLoading: projectsLoading } = useAllProjects();

    if (authLoading || projectsLoading) {
        return <div>Loading...</div>;
    }

    if (!currentUser) {
        navigate('/login');
        return null;
    }

    // TODO: Implement task hooks when task API is ready
    const tasks: any[] = [];
    const myTasks = tasks.filter(task => task.ownerId === currentUser.id);
    const overdueTasks = tasks.filter(
        t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'DONE' && t.status !== 'CANCELLED'
    );
    const completedTasks = tasks.filter(t => t.status === 'DONE');
    const recentTasks = [...myTasks]
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
        .slice(0, 5);

    const stats = [
        {
            label: 'Active Projects',
            value: projects.length,
            icon: FolderKanban,
            color: 'indigo-500',
            link: '/projects',
        },
        {
            label: 'My Tasks',
            value: myTasks.length,
            icon: CheckSquare,
            color: 'primary',
            link: '/tasks',
        },
        {
            label: 'Overdue',
            value: overdueTasks.length,
            icon: AlertCircle,
            color: 'destructive',
            link: '/tasks',
        },
        {
            label: 'Completed',
            value: completedTasks.length,
            icon: TrendingUp,
            color: 'primary',
            link: '/tasks',
        },
    ];

    const upcomingTasks = myTasks
        .filter(t => t.dueDate && t.status !== 'DONE' && t.status !== 'CANCELLED')
        .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())
        .slice(0, 5);

    return (
        <div className="p-4 md:p-6 space-y-4 md:space-y-6 w-full h-full">
            <div>
                <h1 className="text-foreground mb-2 text-xl md:text-2xl">Welcome back, {currentUser!.name}!</h1>
                <p className="text-muted-foreground text-sm md:text-base">Here's what's happening with your projects and tasks</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                {stats.map((stat, index) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                    >
                        <Link to={stat.link}>
                            <div className="bg-card border border-border rounded-lg p-3 md:p-5 hover:border-border/80 transition-smooth cursor-pointer shadow-sm">
                                <div className="flex items-center justify-between mb-2 md:mb-3">
                                    <div
                                        className={`rounded-lg flex items-center justify-center shadow-sm bg-${stat.color}/20`}
                                    >
                                        <stat.icon className={`w-4 h-4 md:w-5 md:h-5 text-${stat.color}`} />
                                    </div>
                                </div>
                                <div className="text-foreground mb-1 text-xl md:text-2xl">{stat.value}</div>
                                <div className="text-muted-foreground text-xs truncate">{stat.label}</div>
                            </div>
                        </Link>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-card border border-border rounded-lg p-4 md:p-5 shadow-sm"
                >
                    <div className="flex items-center gap-2 mb-4 md:mb-5">
                        <Activity className="w-4 h-4 md:w-5 md:h-5 text-primary" />
                        <h2 className="text-foreground text-base md:text-lg">Recent Activity</h2>
                    </div>
                    <div className="space-y-2 md:space-y-3">
                        {recentTasks.length > 0 ? (
                            recentTasks.map(task => (
                                <TaskCard
                                    key={task.id}
                                    task={task}
                                    onClick={() => { }}
                                />
                            ))
                        ) : (
                            <div className="text-center py-8 text-muted-foreground">
                                No recent tasks
                            </div>
                        )}
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="bg-card border border-border rounded-lg p-4 md:p-5 shadow-sm"
                >
                    <div className="flex items-center gap-2 mb-4 md:mb-5">
                        <Calendar className="w-4 h-4 md:w-5 md:h-5 text-primary" />
                        <h2 className="text-foreground text-base md:text-lg">Upcoming Deadlines</h2>
                    </div>
                    <div className="space-y-2 md:space-y-3">
                        {upcomingTasks.length > 0 ? (
                            upcomingTasks.map(task => {
                                const dueDate = new Date(task.dueDate!);
                                const isOverdue = dueDate < new Date();
                                const daysUntil = Math.ceil((dueDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

                                return (
                                    <div
                                        key={task.id}
                                        onClick={() => { }}
                                        className="bg-muted border border-border rounded-md p-2.5 md:p-3 hover:border-border/80 transition-smooth cursor-pointer shadow-sm"
                                    >
                                        <h3 className="text-foreground mb-1 md:mb-1.5 text-sm md:text-base truncate">{task.title}</h3>
                                        <div className={`flex items-center gap-1.5 text-xs ${isOverdue ? 'text-destructive' : 'text-muted-foreground'}`}>
                                            <Calendar className="w-3 h-3 md:w-3.5 md:h-3.5 flex-shrink-0" />
                                            <span className="truncate">
                                                {isOverdue
                                                    ? `Overdue by ${Math.abs(daysUntil)} day${Math.abs(daysUntil) !== 1 ? 's' : ''}`
                                                    : `Due in ${daysUntil} day${daysUntil !== 1 ? 's' : ''}`
                                                }
                                            </span>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="text-center py-8 text-muted-foreground">
                                No upcoming deadlines
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>

            <TaskModal />
            <ProjectModal />
        </div>
    );
}

export default Dashboard;