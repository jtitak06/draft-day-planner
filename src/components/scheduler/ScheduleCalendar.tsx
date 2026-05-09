import { useMemo } from "react";
import {
  addDays,
  endOfMonth,
  format,
  isSameMonth,
  parseISO,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import type { Schedule } from "@/lib/schedule";
import { cn } from "@/lib/utils";

type Props = { schedule: Schedule };

export function ScheduleCalendar({ schedule }: Props) {
  const byDate = useMemo(() => {
    const map = new Map<string, number>();
    for (const d of schedule.days) map.set(d.date, d.count);
    return map;
  }, [schedule.days]);

  const start = parseISO(schedule.startDate);
  const end = parseISO(schedule.endDate);

  const months: Date[] = [];
  let cursor = startOfMonth(start);
  while (cursor <= end) {
    months.push(cursor);
    cursor = startOfMonth(addDays(endOfMonth(cursor), 1));
  }

  const max = Math.max(1, ...schedule.days.map((d) => d.count));

  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
      {months.map((m) => (
        <MonthGrid
          key={m.toISOString()}
          month={m}
          byDate={byDate}
          max={max}
          rangeStart={start}
          rangeEnd={end}
        />
      ))}
    </div>
  );
}

function MonthGrid({
  month,
  byDate,
  max,
  rangeStart,
  rangeEnd,
}: {
  month: Date;
  byDate: Map<string, number>;
  max: number;
  rangeStart: Date;
  rangeEnd: Date;
}) {
  const gridStart = startOfWeek(startOfMonth(month), { weekStartsOn: 0 });
  const cells: Date[] = [];
  for (let i = 0; i < 42; i++) cells.push(addDays(gridStart, i));

  return (
    <div className="rounded-lg border bg-card p-4">
      <h3 className="mb-3 text-sm font-semibold text-card-foreground">
        {format(month, "MMMM yyyy")}
      </h3>
      <div className="grid grid-cols-7 gap-1 text-center text-[10px] text-muted-foreground">
        {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
          <div key={i}>{d}</div>
        ))}
      </div>
      <div className="mt-1 grid grid-cols-7 gap-1">
        {cells.map((d, i) => {
          const inMonth = isSameMonth(d, month);
          const inRange = d >= rangeStart && d <= rangeEnd;
          const key = format(d, "yyyy-MM-dd");
          const count = byDate.get(key) ?? 0;
          const intensity = count / max;
          return (
            <div
              key={i}
              className={cn(
                "aspect-square rounded-sm border text-[10px] p-1 flex flex-col items-start justify-between transition-colors",
                !inMonth && "opacity-30",
                !inRange && "bg-muted/40 border-transparent",
              )}
              style={
                inRange && count > 0
                  ? {
                      backgroundColor: `color-mix(in oklab, var(--primary) ${
                        Math.round(15 + intensity * 75)
                      }%, var(--background))`,
                      color: intensity > 0.5 ? "var(--primary-foreground)" : undefined,
                    }
                  : undefined
              }
              title={inRange ? `${key}: ${count} drafts` : undefined}
            >
              <span className="opacity-70">{format(d, "d")}</span>
              {count > 0 && (
                <span className="self-end text-xs font-semibold">{count}</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}