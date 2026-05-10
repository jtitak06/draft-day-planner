import { useState } from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import {
  getEarliestSelectableEndDate,
  getLatestCompletionDate,
  getTodayInPacific,
} from "@/lib/historical-config";

export type SchedulerFormValues = {
  completed: number;
  remaining: number;
  endDate: Date;
};

type Props = {
  onSubmit: (values: SchedulerFormValues) => void;
};

export function SchedulerForm({ onSubmit }: Props) {
  const minDate = getEarliestSelectableEndDate();
  const maxDate = getLatestCompletionDate();
  const today = getTodayInPacific();
  const defaultDate =
    today < minDate ? minDate : today > maxDate ? maxDate : today;

  const [completed, setCompleted] = useState<number>(0);
  const [remaining, setRemaining] = useState<number>(150);
  const [endDate, setEndDate] = useState<Date | undefined>(defaultDate);

  const total = completed + remaining;
  const totalValid = total >= 1 && total <= 150 && completed >= 0 && remaining >= 0;
  const canSubmit =
    totalValid &&
    remaining >= 1 &&
    endDate !== undefined &&
    endDate >= minDate &&
    endDate <= maxDate;

  return (
    <form
      className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:items-end"
      onSubmit={(e) => {
        e.preventDefault();
        if (canSubmit && endDate) onSubmit({ completed, remaining, endDate });
      }}
    >
      <div className="space-y-2">
        <Label htmlFor="completed">Drafts completed</Label>
        <Input
          id="completed"
          type="number"
          min={0}
          max={150}
          value={completed}
          onChange={(e) => setCompleted(Math.max(0, Number(e.target.value) || 0))}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="remaining">Drafts remaining</Label>
        <Input
          id="remaining"
          type="number"
          min={1}
          max={150}
          value={remaining}
          onChange={(e) => setRemaining(Math.max(0, Number(e.target.value) || 0))}
        />
      </div>

      <div className="space-y-2">
        <Label>Projected completion date</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              type="button"
              className={cn(
                "w-full justify-start text-left font-normal",
                !endDate && "text-muted-foreground",
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {endDate ? format(endDate, "PPP") : "Pick a date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={endDate}
              onSelect={setEndDate}
              defaultMonth={endDate ?? defaultDate}
              disabled={(d) => d < minDate || d > maxDate}
              initialFocus
              className={cn("p-3 pointer-events-auto")}
            />
          </PopoverContent>
        </Popover>
        <p className="text-xs text-muted-foreground">
          {format(minDate, "MMM d")} – {format(maxDate, "MMM d, yyyy")} (PT)
        </p>
      </div>

      <div className="space-y-2">
        <Button type="submit" disabled={!canSubmit} className="w-full">
          Generate schedule
        </Button>
        {!totalValid && total > 150 && (
          <p className="text-xs text-destructive">
            Completed + remaining can't exceed 150.
          </p>
        )}
      </div>
    </form>
  );
}