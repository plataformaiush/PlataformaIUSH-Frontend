import { useState } from "react";

export interface FilterOption {
  label: string;
  options: string[];
}

interface FiltersProps {
  filters: FilterOption[];
}

export default function Filters({
  filters,
}: FiltersProps) {

  const [selected, setSelected] =
    useState<Record<string, string>>(
      Object.fromEntries(
        filters.map((f) => [
          f.label,
          f.options[0],
        ])
      )
    );

  return (
    <div className="flex items-center gap-4 flex-wrap">

      {filters.map((filter) => (

        <div
          key={filter.label}
          className="flex flex-col gap-2"
        >

          <label
            className="
              text-[11px]
              font-semibold
              text-[#404040]
              uppercase
              tracking-wide
              font-['Plus_Jakarta_Sans']
            "
          >
            {filter.label}
          </label>

          <select
            value={selected[filter.label]}
            onChange={(e) =>
              setSelected((prev) => ({
                ...prev,
                [filter.label]:
                  e.target.value,
              }))
            }
            className="
              h-11
              min-w-[180px]
              rounded-xl
              border
              border-[#E7EEF0]
              bg-white
              px-3
              text-[14px]
              font-medium
              text-[#223740]
              outline-none
              transition-all
              duration-200
              hover:border-[#BDD5D9]
              focus:border-[#5A878C]
              focus:ring-2
              focus:ring-[#D9EFF2]
              font-['Plus_Jakarta_Sans']
            "
          >
            {filter.options.map((opt) => (
              <option
                key={opt}
                value={opt}
              >
                {opt}
              </option>
            ))}
          </select>
        </div>
      ))}
    </div>
  );
}