interface TaskMetadataCardProps {
    createdBy: string;
    createdAt?: string;
    updatedAt?: string;
    formatDate: (iso: string) => string;
}

export function TaskMetadataCard({ createdBy, createdAt, updatedAt, formatDate }: TaskMetadataCardProps) {
    return (
        <div className="bg-card border border-border rounded-lg p-4 shadow-sm space-y-3">
            <div>
                <span className="text-muted-foreground">Created by</span>
                <p className="text-foreground mt-1">{createdBy}</p>
            </div>
            <div>
                <span className="text-muted-foreground">Created</span>
                <p className="text-foreground mt-1">{createdAt ? formatDate(createdAt) : '—'}</p>
            </div>
            <div>
                <span className="text-muted-foreground">Last updated</span>
                <p className="text-foreground mt-1">{updatedAt ? formatDate(updatedAt) : '—'}</p>
            </div>
        </div>
    );
}


