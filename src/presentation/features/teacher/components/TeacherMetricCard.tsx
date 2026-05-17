import { LucideIcon } from "lucide-react";

interface TeacherMetricCardProps {
  label: string;
  value: number;
  helper: string;
  icon: LucideIcon;
}

export function TeacherMetricCard({
  label,
  value,
  helper,
  icon: Icon,
}: TeacherMetricCardProps) {
  return (
    <article className="rounded-[28px] border border-[var(--teacher-border)] bg-[var(--teacher-card)] p-5 shadow-[0_18px_38px_rgba(22,55,68,0.08)]">
      <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--teacher-soft)] text-[var(--teacher-accent)]">
        <Icon size={22} strokeWidth={2.3} />
      </div>

      <p className="text-sm font-bold text-[var(--teacher-muted)]">{label}</p>

      <h3 className="mt-2 text-4xl font-black tracking-tight text-[var(--teacher-text)]">
        {value}
      </h3>

      <p className="mt-2 text-sm font-medium text-[var(--teacher-muted)]">
        {helper}
      </p>
    </article>
  );
}