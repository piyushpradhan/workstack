import { Button } from '../../components/ui/button';
import { Link as LinkIcon, CheckCircle2 } from 'lucide-react';

interface TaskQuickActionsCardProps {
    onShare: () => void;
    onMarkDone: () => void;
    isDone?: boolean;
}

export function TaskQuickActionsCard({ onShare, onMarkDone, isDone }: TaskQuickActionsCardProps) {
    return (
        <div className="bg-card border border-border rounded-lg p-4 shadow-sm">
            <label className="text-muted-foreground block mb-2">Quick Actions</label>
            <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={onShare} className="gap-2"><LinkIcon className="w-4 h-4" /> Share</Button>
                <Button size="sm" onClick={onMarkDone} disabled={isDone} className="gap-2"><CheckCircle2 className="w-4 h-4" /> Done</Button>
            </div>
        </div>
    );
}


