import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw } from "lucide-react";

interface ErrorProps {
  error: Error | null;
  onRetry: () => void;
}

const Error = ({ error, onRetry }: ErrorProps) => {
  if (!error) {
    return null;
  }

  return (
    <div className="p-4 md:p-6">
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-destructive" />
          </div>
          <h2 className="text-lg font-semibold text-foreground mb-2">
            Failed to load projects
          </h2>
          <p className="text-muted-foreground mb-4">
            {error.message || "Something went wrong while loading your projects."}
          </p>
          <Button onClick={onRetry} variant="outline" className="gap-2">
            <RefreshCw className="w-4 h-4" />
            Try Again
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Error;
