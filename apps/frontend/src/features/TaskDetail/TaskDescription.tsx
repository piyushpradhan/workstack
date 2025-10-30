import { useEffect, useRef, useState } from 'react';

interface TaskDescriptionProps {
    description?: string;
    onChange?: (nextDescription: string) => void;
}

export function TaskDescription({ description, onChange }: TaskDescriptionProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [draft, setDraft] = useState(description ?? '');
    const textareaRef = useRef<HTMLTextAreaElement | null>(null);

    useEffect(() => { setDraft(description ?? ''); }, [description]);
    useEffect(() => {
        if (isEditing && textareaRef.current) {
            textareaRef.current.focus();
            textareaRef.current.selectionStart = textareaRef.current.value.length;
            textareaRef.current.selectionEnd = textareaRef.current.value.length;
        }
    }, [isEditing]);

    const commit = () => {
        const next = draft.trimEnd();
        if (next !== (description ?? '')) {
            onChange?.(next);
        }
        setIsEditing(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if ((e.key === 'Enter' && (e.metaKey || e.ctrlKey))) {
            e.preventDefault();
            commit();
        } else if (e.key === 'Escape') {
            e.preventDefault();
            setDraft(description ?? '');
            setIsEditing(false);
        }
    };

    return (
        <div className="bg-card border border-border rounded-lg p-5 sm:p-6 shadow-sm">
            <h2 className="text-foreground mb-4">Description</h2>
            {isEditing ? (
                <textarea
                    ref={textareaRef}
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onBlur={commit}
                    onKeyDown={handleKeyDown}
                    placeholder="Add a description…"
                    className="w-full bg-transparent text-foreground placeholder:text-muted-foreground outline-none resize-vertical min-h-[120px] leading-relaxed border border-border/50 rounded-md p-3"
                />
            ) : (
                <div
                    className="text-muted-foreground whitespace-pre-wrap leading-relaxed border border-transparent rounded-md p-3 -m-3 hover:border-border/60 cursor-text"
                    onClick={() => setIsEditing(true)}
                    title="Click to edit description"
                >
                    {draft ? draft : <span className="text-muted-foreground/70">Add a description…</span>}
                </div>
            )}
        </div>
    );
}


