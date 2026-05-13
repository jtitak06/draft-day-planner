import { AlertTriangle, CheckCircle2, Info, Lock } from "lucide-react";
import type { WindowAnalysis } from "@/lib/analysis";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type Props = {
  analysis: WindowAnalysis;
  blurDetails?: boolean;
  purchaseUrl?: string;
  isSignedIn?: boolean;
};

export function ScheduleAnalysis({
  analysis,
  blurDetails = false,
  purchaseUrl,
  isSignedIn = false,
}: Props) {
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
          <div className="relative">
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
          {blurDetails && purchaseUrl && (
            <InlinePaywallButton href={purchaseUrl} isSignedIn={isSignedIn} />
          )}
          </div>
        </div>
      </div>
    </div>

    <div className="rounded-lg border bg-card p-5">
      <p className="font-medium text-foreground">
        Finalist draft history (BBM II–V, 2021–2024)
      </p>
      <p className="mt-1 text-xs text-muted-foreground">
        Combined across 1,609 finalist drafts over 4 BBM seasons.
      </p>
      <div className="relative mt-3">
      <ul
        className={cn(
          "list-disc space-y-1 pl-5 text-sm text-muted-foreground",
          blur,
        )}
        aria-hidden={blurDetails}
      >
        {analysis.historyBullets.map((b, i) => (
          <li key={i}>{b}</li>
        ))}
      </ul>
      {blurDetails && purchaseUrl && (
        <InlinePaywallButton href={purchaseUrl} isSignedIn={isSignedIn} />
      )}
      </div>
    </div>

    <div className="rounded-lg border bg-card p-5">
      <p className="font-medium text-foreground">Suggestions for your window</p>
      <div className="relative mt-3">
      <ul
        className={cn(
          "list-disc space-y-1 pl-5 text-sm text-muted-foreground",
          blur,
        )}
        aria-hidden={blurDetails}
      >
        {analysis.suggestionBullets.map((b, i) => (
          <li key={i}>{b}</li>
        ))}
      </ul>
      {blurDetails && purchaseUrl && (
        <InlinePaywallButton href={purchaseUrl} isSignedIn={isSignedIn} />
      )}
      </div>
    </div>
    </div>
  );
}

function InlinePaywallButton({
  href,
  isSignedIn,
}: {
  href: string;
  isSignedIn: boolean;
}) {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="flex flex-col gap-2 sm:flex-row">
        <Button asChild size="sm">
          <a href={href}>
            <Lock className="mr-1 h-3.5 w-3.5" />
            Purchase access — $25
          </a>
        </Button>
        {!isSignedIn && (
          <Button asChild size="sm" variant="outline">
            <a href="/login">I already paid · Sign in</a>
          </Button>
        )}
      </div>
    </div>
  );
}