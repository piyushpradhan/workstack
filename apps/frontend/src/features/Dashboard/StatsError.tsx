import { useUserStats } from "@/api/users/queries";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

const StatsError = () => {
  const { refetch: refetchStats } = useUserStats();

  return (
    <div className="max-h-[126px] h-full flex justify-center items-center">
      <div className="flex items-center justify-center h-full">
        <div className="flex flex-row justify-center items-center gap-2 max-w-md">
          <Button
            className="bg-destructive/10 hover:bg-destructive/20 cursor-pointer rounded-full flex items-center justify-center mx-auto"
            onClick={() => {
              // TODO: Rate limit
              refetchStats();
            }}
          >
            <RefreshCw className="w-8 h-8 text-destructive" />
          </Button>
          <h2 className="text-lg font-semibold text-foreground">
            Failed to load your stats
          </h2>
        </div>
      </div>
    </div>
  );
};

export default StatsError;
