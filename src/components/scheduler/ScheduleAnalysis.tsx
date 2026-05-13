import { AlertTriangle, CheckCircle2, Info } from "lucide-react";
import type { WindowAnalysis } from "@/lib/analysis";
import { cn } from "@/lib/utils";

type Props = { analysis: WindowAnalysis; blurDetails?: boolean };

export function ScheduleAnalysis({ analysis, blurDetails = false }: Props) {
  const blur = blurDetails
    ? "pointer-events-none select-none blur-sm"
    : "";
  const Icon =
    analysis.severity === "optimal"
      ? CheckCircle2
      : analysis.severity === "reasonable"
        ? Info
        : AlertTriangle;

  const tone =
    analysis.severity === "optimal"
      ? "border-primary/40 bg-primary/5"
      : analysis.severity === "reasonable"
        ? "border-border bg-card"
        : "border-destructive/40 bg-destructive/5";

  return (
    <div className="space-y-4">
    <div className={cn("rounded-lg border p-5", tone)}>
      <div className="flex items-start gap-3">
        <Icon
          className={cn(
            "mt-0.5 h-5 w-5 shrink-0",
            analysis.severity === "optimal" && "text-primary",
            analysis.severity === "suboptimal" && "text-destructive",
          )}
        />
        <div className="space-y-2">
          <p className="font-medium text-foreground">{analysis.headline}</p>
          <ul
            className={cn(
              "list-disc space-y-1 pl-5 text-sm text-muted-foreground",
              blur,
            )}
            aria-hidden={blurDetails}
          >
            {analysis.details.map((d, i) => (
              <li key={i}>{d}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>

    <div className="rounded-lg border bg-card p-5">
      <p className="font-medium text-foreground">
        Finalist draft history (BBM II–V, 2021–2024)
      </p>
      <p className="mt-1 text-xs text-muted-foreground">
        Combined across 1,609 finalist drafts over 4 BBM seasons. BBM IV–V use{" "}
        <code>draft_filled_time</code>; BBM II–III use <code>draft_time</code>{" "}
        (fill time isn't available in those years).
      </p>
      <ul
        className={cn(
          "mt-3 list-disc space-y-1 pl-5 text-sm text-muted-foreground",
          blur,
        )}
        aria-hidden={blurDetails}
      >
        {analysis.historyBullets.map((b, i) => (
          <li key={i}>{b}</li>
        ))}
      </ul>
    </div>

    <div className="rounded-lg border bg-card p-5">
      <p className="font-medium text-foreground">Suggestions for your window</p>
      <ul
        className={cn(
          "mt-3 list-disc space-y-1 pl-5 text-sm text-muted-foreground",
          blur,
        )}
        aria-hidden={blurDetails}
      >
        {analysis.suggestionBullets.map((b, i) => (
          <li key={i}>{b}</li>
        ))}
      </ul>
    </div>
    </div>
  );
}