import { format, parseISO } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Schedule } from "@/lib/schedule";

type Props = { schedule: Schedule };

export function ScheduleTable({ schedule }: Props) {
  return (
    <div className="rounded-lg border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Week of</TableHead>
            <TableHead className="text-right">Drafts</TableHead>
            <TableHead className="text-right">% of total</TableHead>
            <TableHead className="text-right">Cumulative</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {schedule.weeks.map((w) => (
            <TableRow key={w.weekStart}>
              <TableCell className="font-medium">
                {format(parseISO(w.weekStart), "MMM d, yyyy")}
              </TableCell>
              <TableCell className="text-right">{w.count}</TableCell>
              <TableCell className="text-right">
                {(w.pct * 100).toFixed(1)}%
              </TableCell>
              <TableCell className="text-right">{w.cumulative}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}