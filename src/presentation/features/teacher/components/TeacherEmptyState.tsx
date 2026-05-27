import { ReactNode } from "react";

interface TeacherEmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
}

export function TeacherEmptyState({
  icon,
  title,
  description,
}: TeacherEmptyStateProps) {
  return (
    <div className="min-w-0 overflow-hidden rounded-[26px] border border-dashed border-[var(--teacher-border)] bg-[var(--teacher-card)] p-8 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--teacher-soft)] text-[var(--teacher-accent)]">
        {icon}
      </div>

      <h3 className="mt-4 text-lg font-black text-[var(--teacher-text)]">
        {title}
      </h3>

      <p className="mx-auto mt-2 max-w-md break-words text-sm font-medium leading-6 text-[var(--teacher-muted)]">
        {description}
      </p>
    </div>
  );
}