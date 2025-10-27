import { useState } from 'react';
import { ProjectCard } from '@/components/projects/ProjectCard';
import { ProjectModal } from '@/components/projects/ProjectModal';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Plus, Search, Grid3x3, List } from 'lucide-react';
import { motion } from 'motion/react';
import { useAuth } from '@/api/auth/queries';
import { useAllProjects } from '@/api/projects/queries';
import type { Project } from '@/api/projects/types';
import { useModal } from '@/contexts/ModalContext';

const Projects = () => {
    const { user: currentUser } = useAuth();
    const { data: projects = [], isLoading } = useAllProjects();
    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [filter, setFilter] = useState<'all' | 'owned'>('all');
    const { openModal } = useModal();

    if (isLoading) {
        return <div className="p-4 md:p-6">Loading projects...</div>;
    }

    const filteredProjects = projects.filter((project: Project) => {
        const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            project.description?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = filter === 'all' || project.members.some(member => member.id === currentUser?.id);
        return matchesSearch && matchesFilter;
    });

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                    <h1 className="text-foreground mb-2 text-2xl">Projects</h1>
                    <p className="text-muted-foreground text-base">{filteredProjects.length} project{filteredProjects.length !== 1 ? 's' : ''}</p>
                </div>
                <Button
                    onClick={() => openModal('project')}
                    className="gap-2 flex-shrink-0"
                >
                    <Plus className="w-4 h-4" />
                    <span className="hidden sm:inline">New Project</span>
                </Button>
            </div>

            {/* Filters and Search */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                <div className="relative flex-1 sm:max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search projects..."
                        className="pl-10"
                    />
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <div className="flex items-center gap-2 bg-muted border rounded-md p-1">
                        <button
                            onClick={() => setFilter('all')}
                            className={`px-3 py-1.5 rounded transition-colors text-sm ${filter === 'all'
                                ? 'bg-primary text-primary-foreground'
                                : 'text-muted-foreground hover:text-foreground'
                                }`}
                        >
                            <span className="hidden sm:inline">All Projects</span>
                            <span className="sm:hidden">All</span>
                        </button>
                        <button
                            onClick={() => setFilter('owned')}
                            className={`px-3 py-1.5 rounded transition-colors text-sm ${filter === 'owned'
                                ? 'bg-primary text-primary-foreground'
                                : 'text-muted-foreground hover:text-foreground'
                                }`}
                        >
                            <span className="hidden sm:inline">Owned by Me</span>
                            <span className="sm:hidden">Mine</span>
                        </button>
                    </div>

                    <div className="flex items-center gap-1 bg-muted border rounded-md p-1">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-2 rounded transition-colors ${viewMode === 'grid'
                                ? 'bg-primary text-primary-foreground'
                                : 'text-muted-foreground hover:text-foreground'
                                }`}
                        >
                            <Grid3x3 className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-2 rounded transition-colors ${viewMode === 'list'
                                ? 'bg-primary text-primary-foreground'
                                : 'text-muted-foreground hover:text-foreground'
                                }`}
                        >
                            <List className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Projects Grid/List */}
            {filteredProjects.length > 0 ? (
                <motion.div
                    layout
                    className={
                        viewMode === 'grid'
                            ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'
                            : 'space-y-4'
                    }
                >
                    {filteredProjects.map((project: Project) => (
                        <ProjectCard key={project.id} project={project} />
                    ))}
                </motion.div>
            ) : (
                <div className="text-center py-12">
                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                        <Search className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-foreground mb-2">No projects found</h3>
                    <p className="text-muted-foreground mb-4">
                        {searchQuery ? 'Try adjusting your search' : 'Get started by creating your first project'}
                    </p>
                    {!searchQuery && (
                        <Button
                            onClick={() => openModal('project')}
                            className="gap-2"
                        >
                            <Plus className="w-4 h-4" />
                            New Project
                        </Button>
                    )}
                </div>
            )}

            <ProjectModal />
        </div>
    );
}

export default Projects;
