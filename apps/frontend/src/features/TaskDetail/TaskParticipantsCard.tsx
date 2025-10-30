import { Users } from 'lucide-react';

interface TaskParticipantsCardProps {
    ownerName?: string | null;
    memberNames: string[];
}

export function TaskParticipantsCard({ ownerName, memberNames }: TaskParticipantsCardProps) {
    return (
        <div className="bg-card border border-border rounded-lg p-4 shadow-sm">
            <div className="flex items-center gap-2 text-muted-foreground"><Users className="w-4 h-4" /><span>Participants</span></div>
            <div className="mt-3 flex -space-x-2">
                {ownerName && (
                    <div className="inline-flex items-center justify-center w-8 h-8 rounded-full border border-border bg-primary text-primary-foreground shadow-sm" title={`Owner: ${ownerName}`}>
                        {ownerName.charAt(0).toUpperCase()}
                    </div>
                )}
                {memberNames.map((name) => (
                    <div key={name} className="inline-flex items-center justify-center w-8 h-8 rounded-full border border-border bg-muted text-foreground shadow-sm" title={name}>
                        {name.charAt(0).toUpperCase()}
                    </div>
                ))}
                {(!ownerName && memberNames.length === 0) && (
                    <span className="text-muted-foreground text-sm">No participants</span>
                )}
            </div>
        </div>
    );
}


