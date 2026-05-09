import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { SchedulerForm, type SchedulerFormValues } from "@/components/scheduler/SchedulerForm";
import { ScheduleCalendar } from "@/components/scheduler/ScheduleCalendar";
import { ScheduleTable } from "@/components/scheduler/ScheduleTable";
import { BbmStatusBanner } from "@/components/scheduler/BbmStatusBanner";
import { ExportCsvButton } from "@/components/scheduler/ExportCsvButton";
import { computeSchedule, type Schedule } from "@/lib/schedule";
import {
  FINALIST_DRAFT_DISTRIBUTION,
  getCurrentBbmOpenDate,
} from "@/lib/historical-config";

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

  const handleSubmit = (values: SchedulerFormValues) => {
    const result = computeSchedule({
      startDate: getCurrentBbmOpenDate(),
      endDate: values.endDate,
      totalEntries: values.totalEntries,
      weights: FINALIST_DRAFT_DISTRIBUTION,
    });
    setSchedule(result);
  };

  return (
    <main className="min-h-screen bg-background">
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
          <BbmStatusBanner />

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
                  drafts from{" "}
                  <span className="font-medium text-foreground">
                    {schedule.startDate}
                  </span>{" "}
                  to{" "}
                  <span className="font-medium text-foreground">
                    {schedule.endDate}
                  </span>
                  .
                </div>
                <ExportCsvButton schedule={schedule} />
              </section>

              <section>
                <h2 className="mb-3 text-lg font-semibold text-foreground">
                  Calendar
                </h2>
                <ScheduleCalendar schedule={schedule} />
              </section>

              <section>
                <h2 className="mb-3 text-lg font-semibold text-foreground">
                  Weekly breakdown
                </h2>
                <ScheduleTable schedule={schedule} />
              </section>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
