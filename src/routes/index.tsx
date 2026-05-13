import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { SchedulerForm, type SchedulerFormValues } from "@/components/scheduler/SchedulerForm";
import { ScheduleCalendar } from "@/components/scheduler/ScheduleCalendar";
import { ScheduleAnalysis } from "@/components/scheduler/ScheduleAnalysis";
import { ExportCsvButton } from "@/components/scheduler/ExportCsvButton";
import { computeSchedule, type Schedule } from "@/lib/schedule";
import {
  DAY_OF_WEEK_WEIGHTS,
  FINALIST_DRAFT_DISTRIBUTION,
  getCurrentBbmOpenDate,
  getLatestCompletionDate,
} from "@/lib/historical-config";
import { analyzeWindow, type WindowAnalysis } from "@/lib/analysis";
import { AuthHeader } from "@/components/AuthHeader";
import { useAccess } from "@/hooks/use-access";
import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";

const STRIPE_CHECKOUT_URL = "https://buy.stripe.com/14A14o1sI5VRdYf4Mw0oM00";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Best Ball Mania Draft Scheduler" },
      {
        name: "description",
        content:
          "Free Best Ball Mania draft scheduler. Plan when to draft each entry using the historical distribution of finalist draft dates.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  const [schedule, setSchedule] = useState<Schedule | null>(null);
  const [analysis, setAnalysis] = useState<WindowAnalysis | null>(null);
  const [completedCount, setCompletedCount] = useState<number>(0);
  const { hasAccess, user, accessLoading } = useAccess();

  const handleSubmit = (values: SchedulerFormValues) => {
    const cycleStart = getCurrentBbmOpenDate();
    const result = computeSchedule({
      startDate: cycleStart,
      endDate: values.endDate,
      totalEntries: values.remaining,
      weights: FINALIST_DRAFT_DISTRIBUTION,
      dayOfWeekWeights: DAY_OF_WEEK_WEIGHTS,
    });
    setSchedule(result);
    setCompletedCount(values.completed);
    setAnalysis(
      analyzeWindow({
        cycleStart,
        cycleEnd: getLatestCompletionDate(),
        windowStart: cycleStart,
        windowEnd: values.endDate,
        weights: FINALIST_DRAFT_DISTRIBUTION,
        remaining: values.remaining,
        completed: values.completed,
      }),
    );
  };

  return (
    <main className="min-h-screen bg-background">
      <AuthHeader />
      <div className="mx-auto max-w-6xl px-4 py-10 sm:py-16">
        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Best Ball Mania Draft Scheduler
          </h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Plan when to draft each of your Best Ball Mania entries. Set your
            projected fill date and we'll spread your drafts across the
            window using the historical distribution of finalist draft dates.
          </p>
        </header>

        <div className="space-y-6">
          <section className="rounded-lg border bg-card p-6">
            <SchedulerForm onSubmit={handleSubmit} />
          </section>

          {schedule && (
            <>
              <section className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  Schedule for{" "}
                  <span className="font-medium text-foreground">
                    {schedule.totalEntries.toLocaleString()}
                  </span>{" "}
                  remaining drafts
                  {completedCount > 0 && (
                    <>
                      {" "}
                      (<span className="font-medium text-foreground">
                        {completedCount}
                      </span>{" "}
                      already complete)
                    </>
                  )}{" "}
                  from{" "}
                  <span className="font-medium text-foreground">
                    {schedule.startDate}
                  </span>{" "}
                  to{" "}
                  <span className="font-medium text-foreground">
                    {schedule.endDate}
                  </span>
                  .
                </div>
                {hasAccess && <ExportCsvButton schedule={schedule} />}
              </section>

              {analysis && (
                <section>
                  <h2 className="mb-3 text-lg font-semibold text-foreground">
                    Analysis
                  </h2>
                  <ScheduleAnalysis
                    analysis={analysis}
                    blurDetails={!hasAccess}
                  />
                </section>
              )}

              <section>
                <h2 className="mb-3 text-lg font-semibold text-foreground">
                  Calendar
                </h2>
                <div className="relative">
                  <div
                    className={
                      hasAccess
                        ? undefined
                        : "pointer-events-none select-none blur-md"
                    }
                    aria-hidden={!hasAccess}
                  >
                    <ScheduleCalendar schedule={schedule} />
                  </div>
                  {!hasAccess && !accessLoading && (
                    <PaywallOverlay isSignedIn={Boolean(user)} />
                  )}
                </div>
              </section>
            </>
          )}
        </div>
      </div>
    </main>
  );
}

function PaywallOverlay({ isSignedIn }: { isSignedIn: boolean }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center p-6">
      <div className="max-w-md rounded-lg border bg-card/95 p-6 text-center shadow-lg backdrop-blur">
        <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
          <Lock className="h-5 w-5 text-primary" />
        </div>
        <h3 className="mt-3 text-lg font-semibold text-foreground">
          Unlock your full draft schedule
        </h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Get the complete draft-by-draft calendar and detailed
          recommendations for the rest of the BBM season — one payment of
          $25, access through Dec 31.
        </p>
        <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-center">
          <Button asChild>
            <a href={STRIPE_CHECKOUT_URL}>Purchase access — $25</a>
          </Button>
          {!isSignedIn && (
            <Button asChild variant="outline">
              <a href="/login">I already paid · Sign in</a>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
