import Badge, { BadgeVariant } from "./Badge";
import { IconType } from "react-icons";

export interface Metric {
  icon: IconType;
  value: string;
  label: string;
  badge: string;
  variant: BadgeVariant;
}

interface MetricCardProps {
  metric: Metric;
}

export default function MetricCard({
  metric,
}: MetricCardProps) {

  const Icon = metric.icon;

  return (
    <div
      className="
        bg-white
        border
        border-l-5
        rounded-2xl
        p-4
        h-[160px]
        shadow-sm
      "
    >

      <div className="flex items-center justify-between mb-4">

        <div className="w-9 h-9 rounded-xl bg-[#EEF8FA] flex items-center justify-center">
          <Icon className="text-[#5A878C] text-[15px]" />
        </div>

        <Badge
          variant={metric.variant}
          text={metric.badge}
        />
      </div>

      <p
        className="
          text-[22px]
          leading-none
          font-bold
          text-[#223740]
          tracking-[-0.5px]
          font-['Plus_Jakarta_Sans']
        "
      >
        {metric.value}
      </p>

      <p
        className="
          mt-2
          text-[13px]
          font-medium
          text-[#7A8D91]
          font-['Plus_Jakarta_Sans']
        "
      >
        {metric.label}
      </p>
    </div>
  );
}