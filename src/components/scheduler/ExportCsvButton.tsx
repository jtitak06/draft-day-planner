import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { scheduleToCsv, type Schedule } from "@/lib/schedule";

export function ExportCsvButton({ schedule }: { schedule: Schedule }) {
  const onClick = () => {
    const csv = scheduleToCsv(schedule);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `bbm-draft-schedule-${schedule.startDate}-to-${schedule.endDate}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <Button variant="outline" onClick={onClick}>
      <Download className="mr-2 h-4 w-4" />
      Export CSV
    </Button>
  );
}