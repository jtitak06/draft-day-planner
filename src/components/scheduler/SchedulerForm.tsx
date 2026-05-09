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
  getCurrentNflOpenerDate,
} from "@/lib/historical-config";

export type SchedulerFormValues = {
  totalEntries: number;
  endDate: Date;
};

type Props = {
  onSubmit: (values: SchedulerFormValues) => void;
};

export function SchedulerForm({ onSubmit }: Props) {
  const minDate = getEarliestSelectableEndDate();
  const maxDate = getCurrentNflOpenerDate();

  const [totalEntries, setTotalEntries] = useState<number>(150);
  const [endDate, setEndDate] = useState<Date | undefined>(maxDate);

  const canSubmit =
    totalEntries > 0 && endDate !== undefined && endDate >= minDate && endDate <= maxDate;

  return (
    <form
      className="grid gap-4 sm:grid-cols-3 sm:items-end"
      onSubmit={(e) => {
        e.preventDefault();
        if (canSubmit && endDate) onSubmit({ totalEntries, endDate });
      }}
    >
      <div className="space-y-2">
        <Label htmlFor="entries">Total entries</Label>
        <Input
          id="entries"
          type="number"
          min={1}
          max={10000}
          value={totalEntries}
          onChange={(e) => setTotalEntries(Number(e.target.value) || 0)}
        />
      </div>

      <div className="space-y-2">
        <Label>Projected fill date</Label>
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
              defaultMonth={endDate ?? maxDate}
              disabled={(d) => d < minDate || d > maxDate}
              initialFocus
              className={cn("p-3 pointer-events-auto")}
            />
          </PopoverContent>
        </Popover>
        <p className="text-xs text-muted-foreground">
          {format(minDate, "MMM d")} – {format(maxDate, "MMM d, yyyy")}
        </p>
      </div>

      <Button type="submit" disabled={!canSubmit}>
        Generate schedule
      </Button>
    </form>
  );
}