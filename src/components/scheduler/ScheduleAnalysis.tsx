import { AlertTriangle, CheckCircle2, Info } from "lucide-react";
import type { WindowAnalysis } from "@/lib/analysis";
import { cn } from "@/lib/utils";

type Props = { analysis: WindowAnalysis };

export function ScheduleAnalysis({ analysis }: Props) {
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
          <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
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
      <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
        {analysis.historyBullets.map((b, i) => (
          <li key={i}>{b}</li>
        ))}
      </ul>
    </div>

    <div className="rounded-lg border bg-card p-5">
      <p className="font-medium text-foreground">Suggestions for your window</p>
      <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
        {analysis.suggestionBullets.map((b, i) => (
          <li key={i}>{b}</li>
        ))}
      </ul>
    </div>
    </div>
  );
}