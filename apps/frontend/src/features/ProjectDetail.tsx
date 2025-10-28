import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { KanbanBoard } from '../components/tasks/KanbanBoard';
import { ProjectModal } from '../components/projects/ProjectModal';
import { Button } from '../components/ui/button';
import {
    ArrowLeft,
    Settings,
    Users,
    CheckCircle2,
    Circle,
    AlertCircle,
    TrendingUp
} from 'lucide-react';
import { motion } from 'motion/react';
import { useAllProjects } from '@/api/projects/queries';
import { useAuth } from '@/api/auth/queries';
// import { useAllTasks } from '@/api/tasks/queries';
import { useUsers } from '@/api/users/queries';
import type { Task } from '@/state';

const ProjectDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { data: projects = [] } = useAllProjects();
    // const { data: tasks = [] } = useAllTasks();
    const tasks: Task[] = [];
    const { allProjectUsers } = useUsers();
    const { user: currentUser } = useAuth();
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    const project = projects.find(p => p.id === id);

    if (!project) {
        return (
            <div className="p-6">
                <div className="text-center py-12">
                    <h2 className="text-white mb-2">Project not found</h2>
                    <p className="text-[#8b949e] mb-4">The project you're looking for doesn't exist.</p>
                    <Button
                        onClick={() => navigate('/projects')}
                        className="bg-[#0969da] hover:bg-[#0550ae] text-white gap-2"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Projects
                    </Button>
                </div>
            </div>
        );
    }

    const projectTasks = tasks.filter((t: Task) => t.projectId === id);
    const members = allProjectUsers.filter(u => project.members.some(m => m.id === u.id));
    const isOwner = project.owners.some(o => o.id === currentUser?.id);

    const tasksByStatus = {
        todo: projectTasks.filter((t: Task) => t.status === 'TODO').length,
        inProgress: projectTasks.filter((t: Task) => t.status === 'IN_PROGRESS').length,
        inReview: projectTasks.filter((t: Task) => t.status === 'IN_REVIEW').length,
        done: projectTasks.filter((t: Task) => t.status === 'DONE').length,
        cancelled: projectTasks.filter((t: Task) => t.status === 'CANCELLED').length,
    };

    const completionRate = projectTasks.length > 0
        ? Math.round((tasksByStatus.done / projectTasks.length) * 100)
        : 0;

    const stats = [
        { label: 'Total Tasks', value: projectTasks.length, icon: Circle, color: '#6b7280' },
        { label: 'In Progress', value: tasksByStatus.inProgress, icon: AlertCircle, color: '#3b82f6' },
        { label: 'Completed', value: tasksByStatus.done, icon: CheckCircle2, color: '#10b981' },
        { label: 'Completion', value: `${completionRate}%`, icon: TrendingUp, color: '#0969da' },
    ];

    return (
        <div className="p-4 md:p-6 space-y-4 md:space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 md:gap-4">
                <div className="flex-1 min-w-0">
                    <Button
                        variant="ghost"
                        onClick={() => navigate('/projects')}
                        className="mb-3 md:mb-4 text-[#8b949e] hover:text-white -ml-3"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        <span className="text-sm md:text-base">Back to Projects</span>
                    </Button>

                    <h1 className="text-white mb-2 text-xl md:text-2xl break-words">{project.name}</h1>
                    <p className="text-[#8b949e] mb-3 md:mb-4 text-sm md:text-base">{project.description}</p>

                    <div className="flex flex-wrap items-center gap-3 md:gap-4">
                        <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-[#8b949e] flex-shrink-0" />
                            <div className="flex -space-x-2">
                                {members.map((member) => (
                                    <div
                                        key={member.id}
                                        className="w-7 h-7 md:w-8 md:h-8 bg-[#0969da] rounded-full flex items-center justify-center border-2 border-[#0d1117]"
                                        title={member.name}
                                    >
                                        <span className="text-white text-xs md:text-sm">{member.name.charAt(0)}</span>
                                    </div>
                                ))}
                            </div>
                            <span className="text-[#8b949e] text-sm md:text-base whitespace-nowrap">{members.length} member{members.length !== 1 ? 's' : ''}</span>
                        </div>
                    </div>
                </div>

                {isOwner && (
                    <Button
                        onClick={() => setIsEditModalOpen(true)}
                        variant="outline"
                        className="gap-2 bg-[#161b22] border-[#21262d] text-white hover:bg-[#21262d] w-full sm:w-auto flex-shrink-0"
                    >
                        <Settings className="w-4 h-4" />
                        Settings
                    </Button>
                )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                {stats.map((stat, index) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-[#161b22] border border-[#21262d] rounded-lg p-3 md:p-5"
                    >
                        <div className="flex items-center justify-between mb-2 md:mb-3">
                            <div
                                className="w-8 h-8 md:w-10 md:h-10 rounded-lg flex items-center justify-center"
                                style={{ backgroundColor: `${stat.color}20` }}
                            >
                                <stat.icon className="w-4 h-4 md:w-5 md:h-5" style={{ color: stat.color }} />
                            </div>
                        </div>
                        <div className="text-white mb-1 text-lg md:text-xl">{stat.value}</div>
                        <div className="text-[#8b949e] text-xs md:text-sm truncate">{stat.label}</div>
                    </motion.div>
                ))}
            </div>

            {/* Task Board */}
            <div>
                <h2 className="text-white mb-3 md:mb-4 text-lg md:text-xl">Task Board</h2>
                <KanbanBoard tasks={projectTasks} projectId={id} />
            </div>

            <ProjectModal

            />
        </div>
    );
};

export default ProjectDetail;
