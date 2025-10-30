import { useEffect, useRef, useState } from 'react';
import { Button } from '../../components/ui/button';
import { StatusBadge } from '@/components/common/StatusBadge';
import { PriorityIndicator } from '@/components/common/PriorityIndicator';
import { ArrowLeft, Link as LinkIcon } from 'lucide-react';
import type { TaskPriority, TaskStatus } from '@/state';

interface TaskDetailHeaderProps {
    isLoading: boolean;
    projectName?: string | null;
    taskId?: string;
    title: string;
    status?: TaskStatus;
    priority?: TaskPriority;
    dueDate?: string;
    isOverdue: boolean;
    onBack: () => void;
    onShare: () => void;
    onTitleChange?: (nextTitle: string) => void;
}

export function TaskDetailHeader({
    isLoading,
    projectName,
    taskId,
    title,
    status,
    priority,
    dueDate,
    isOverdue,
    onBack,
    onShare,
    onTitleChange,
}: TaskDetailHeaderProps) {
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [draftTitle, setDraftTitle] = useState(title);
    const inputRef = useRef<HTMLInputElement | null>(null);

    useEffect(() => { setDraftTitle(title); }, [title]);

    useEffect(() => {
        if (isEditingTitle && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [isEditingTitle]);

    const commitTitle = () => {
        const next = draftTitle.trim();
        if (next && next !== title) {
            onTitleChange?.(next);
        } else {
            setDraftTitle(title);
        }
        setIsEditingTitle(false);
    };

    const handleTitleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            commitTitle();
        } else if (e.key === 'Escape') {
            e.preventDefault();
            setDraftTitle(title);
            setIsEditingTitle(false);
        }
    };
    return (
        <div className="mb-4 sm:mb-6">
            <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                        <Button variant="ghost" onClick={onBack} className="h-7 px-2 -ml-2 text-muted-foreground hover:text-foreground hover:bg-accent">
                            <ArrowLeft className="w-4 h-4" />
                        </Button>
                        {projectName && <span className="truncate">{projectName}</span>}
                        {projectName && taskId && <span>•</span>}
                        {taskId && <span className="font-mono truncate">{taskId}</span>}
                    </div>
                    <div className="group inline-flex items-center">
                        {isEditingTitle ? (
                            <input
                                ref={inputRef}
                                value={draftTitle}
                                onChange={(e) => setDraftTitle(e.target.value)}
                                onBlur={commitTitle}
                                onKeyDown={handleTitleKeyDown}
                                placeholder="Task title"
                                className="text-foreground bg-transparent outline-none border-b border-transparent focus:border-border text-xl sm:text-2xl font-semibold tracking-tight"
                            />
                        ) : (
                            <h1
                                className="text-foreground break-words text-xl sm:text-2xl font-semibold tracking-tight border-b border-transparent group-hover:border-border/60 cursor-text"
                                onClick={() => setIsEditingTitle(true)}
                                title="Click to edit title"
                            >
                                {isLoading ? 'Loading…' : title}
                            </h1>
                        )}
                    </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                    <Button variant="outline" size="sm" onClick={onShare} className="gap-2">
                        <LinkIcon className="w-4 h-4" /> Share
                    </Button>
                </div>
            </div>

            <div className="mt-2 flex items-center gap-3 flex-wrap">
                {status && <StatusBadge status={status} />}
                {priority && <PriorityIndicator priority={priority} />}
                {dueDate && (
                    <span className={`text-sm ${isOverdue ? 'text-destructive' : 'text-muted-foreground'}`}>
                        Due {new Date(dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                )}
            </div>
        </div>
    );
}


