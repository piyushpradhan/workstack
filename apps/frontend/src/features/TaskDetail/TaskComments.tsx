import { Button } from "../../components/ui/button";
import { Textarea } from "../../components/ui/textarea";
import { Avatar } from "../../components/ui/avatar";
import { Trash2 } from "lucide-react";

type Comment = {
  id: string;
  userId: string;
  content: string;
  createdAt: string;
};
type UserLike = { id: string; name: string };

interface TaskCommentsProps {
  comments: Comment[];
  currentUserName?: string | null;
  onAdd?: (content: string) => void;
  onAddDirect: (content: string) => void;
  onDelete: (commentId: string) => void;
  formatDateTime: (iso: string) => string;
  users: UserLike[];
}

export function TaskComments({
  comments,
  currentUserName,
  onAdd,
  onAddDirect,
  onDelete,
  formatDateTime,
  users,
}: TaskCommentsProps) {
  const initial = (currentUserName ?? "?").charAt(0).toUpperCase();

  return (
    <div className="bg-card border border-border rounded-lg p-5 sm:p-6 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-foreground">Comments</h2>
        <span className="text-muted-foreground text-sm">{comments.length}</span>
      </div>

      <div className="mb-6">
        <div className="flex gap-3">
          <Avatar className="w-8 h-8 bg-primary flex items-center justify-center shrink-0">
            <span className="text-primary-foreground">{initial}</span>
          </Avatar>
          <div className="flex-1">
            <Textarea
              placeholder="Add a comment..."
              className="bg-background border-border text-foreground placeholder:text-muted-foreground mb-2 resize-none"
              rows={3}
              onKeyDown={(e) => {
                if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
                  const value = (e.target as HTMLTextAreaElement).value;
                  onAddDirect(value);
                  (e.target as HTMLTextAreaElement).value = "";
                }
              }}
            />
            <div className="flex justify-end">
              <Button
                onClick={(e) => {
                  const el =
                    (e.currentTarget.closest("div")
                      ?.previousSibling as HTMLTextAreaElement) ?? null;
                  const content = el?.value ?? "";
                  onAddDirect(content);
                  if (el) el.value = "";
                }}
                className="bg-primary hover:bg-primary/90 text-primary-foreground disabled:opacity-50 disabled:cursor-not-allowed"
                size="sm"
              >
                Comment
              </Button>
            </div>
          </div>
        </div>
        <p className="text-muted-foreground mt-2 ml-11">
          Press ⌘/Ctrl + Enter to submit
        </p>
      </div>

      <div className="space-y-4">
        {comments.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            No comments yet. Be the first to comment!
          </p>
        ) : (
          comments.map((comment) => {
            const user = users.find((u) => u.id === comment.userId);
            const isOwner = user?.name === currentUserName;
            return (
              <div key={comment.id} className="flex gap-3 group">
                <Avatar className="w-8 h-8 bg-primary flex items-center justify-center shrink-0">
                  <span className="text-primary-foreground">
                    {(user?.name ?? "?").charAt(0).toUpperCase()}
                  </span>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="bg-background border border-border rounded-lg p-4 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-foreground">
                          {user?.name ?? "Unknown"}
                        </span>
                        {isOwner && (
                          <span className="text-muted-foreground px-2 py-0.5 bg-accent rounded text-xs">
                            You
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">
                          {formatDateTime(comment.createdAt)}
                        </span>
                        {isOwner && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onDelete(comment.id)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive h-6 w-6 p-0"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                    <p className="text-foreground whitespace-pre-wrap break-words leading-relaxed">
                      {comment.content}
                    </p>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
