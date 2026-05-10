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
  );
}