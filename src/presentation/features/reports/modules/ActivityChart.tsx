import { useState } from "react";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

export interface DayData {
  day: string;
  visualizaciones: number;
  completitud: number;
}

type TabKey =
  | "visualizaciones"
  | "completitud";

const tabLabels: Record<TabKey, string> = {
  visualizaciones: "Visualizaciones",
  completitud: "Completitud",
};

interface ActivityChartProps {
  data: DayData[];
}

export default function ActivityChart({
  data,
}: ActivityChartProps) {

  const [activeTab, setActiveTab] =
    useState<TabKey>("visualizaciones");

  return (
    <div className="bg-white border border-[#E7EEF0] rounded-2xl p-5 shadow-sm">

      <div className="flex items-center justify-between mb-5">

        <h2
          className="
            text-[16px]
            font-semibold
            text-[#223740]
            font-['Plus_Jakarta_Sans']
          "
        >
          Actividad Diaria
        </h2>

        <div className="flex items-center gap-1 bg-[#F4FBFC] p-1 rounded-xl">

          {(Object.keys(tabLabels) as TabKey[]).map((tab) => (

            <button
              key={tab}
              onClick={() =>
                setActiveTab(tab)
              }
              className={`
                px-3
                py-1.5
                rounded-lg
                text-[12px]
                font-semibold
                transition-all
                duration-200
                font-['Plus_Jakarta_Sans']

                ${
                  activeTab === tab
                    ? "bg-white text-[#223740] shadow-sm"
                    : "text-[#7A8D91]"
                }
              `}
            >
              {tabLabels[tab]}
            </button>
          ))}
        </div>
      </div>

      <ResponsiveContainer
        width="100%"
        height={220}
      >
        <LineChart
          data={data}
          margin={{
            top: 4,
            right: 4,
            left: -20,
            bottom: 0,
          }}
        >
          <CartesianGrid
            stroke="#EEF3F4"
            strokeDasharray="4 4"
            vertical={false}
          />

          <XAxis
            dataKey="day"
            tick={{
              fontSize: 11,
              fill: "#7A8D91",
            }}
            axisLine={false}
            tickLine={false}
          />

          <YAxis
            tick={{
              fontSize: 11,
              fill: "#7A8D91",
            }}
            axisLine={false}
            tickLine={false}
          />

          <Tooltip
            contentStyle={{
              borderRadius: 12,
              border:
                "1px solid #E7EEF0",
              fontSize: 12,
              boxShadow:
                "0 8px 24px rgba(0,0,0,0.06)",
            }}
          />

          <Line
            type="monotone"
            dataKey={activeTab}
            stroke="#5A878C"
            strokeWidth={3}
            dot={false}
            activeDot={{
              r: 5,
              fill: "#223740",
            }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}