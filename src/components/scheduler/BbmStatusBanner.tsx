import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getBbmStatus } from "@/lib/underdog.functions";
import { Activity, AlertCircle } from "lucide-react";

export function BbmStatusBanner() {
  const fetchStatus = useServerFn(getBbmStatus);
  const { data, isLoading } = useQuery({
    queryKey: ["bbm-status"],
    queryFn: () => fetchStatus(),
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  if (isLoading) {
    return (
      <div className="rounded-lg border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
        Checking Underdog for current Best Ball Mania status…
      </div>
    );
  }

  if (!data || !data.ok) {
    return (
      <div className="flex items-start gap-2 rounded-lg border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
        <div>
          Live Underdog status unavailable right now. The scheduler still
          works using historical data.
        </div>
      </div>
    );
  }

  const { tournamentName, totalEntrants, maxEntrants, isOpen } = data.data;
  const pct =
    totalEntrants !== null && maxEntrants && maxEntrants > 0
      ? Math.round((totalEntrants / maxEntrants) * 100)
      : null;

  return (
    <div className="flex items-start gap-3 rounded-lg border bg-card px-4 py-3 text-sm">
      <Activity className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
      <div>
        <div className="font-medium text-card-foreground">
          {tournamentName ?? "Best Ball Mania"} —{" "}
          {isOpen ? "Open for drafts" : "Currently closed"}
        </div>
        {totalEntrants !== null && (
          <div className="text-muted-foreground">
            {totalEntrants.toLocaleString()}
            {maxEntrants ? ` / ${maxEntrants.toLocaleString()}` : ""} entries
            {pct !== null ? ` (${pct}% full)` : ""}
          </div>
        )}
      </div>
    </div>
  );
}