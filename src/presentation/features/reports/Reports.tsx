import React, { useState } from 'react';
import Filters, { FilterOption } from "./modules/Filters";
import MetricCard, { Metric } from "./modules/MetricCard";
import ActivityChart from "./modules/ActivityChart";
import CourseRanking from "./modules/CourseRanking";
import GraphsLooker from "./modules/lookerStudio/GraphsLooker";

import { IoPersonOutline } from "react-icons/io5";
import { TfiBlackboard } from "react-icons/tfi";
import { LiaCertificateSolid } from "react-icons/lia";
import { FaRegClock } from "react-icons/fa6";
import SimulateEvents from './modules/gtm/SimulateEvents';


const filters: FilterOption[] = [
  {
    label: "Rango de fechas",
    options: [
      "Últimos 30 días",
      "Últimos 7 días",
      "Este año",
    ],
  },
  {
    label: "Institución",
    options: [
      "Todas las Sedes",
      "Sede Norte",
      "Sede Sur",
    ],
  },
  {
    label: "Curso",
    options: [
      "Todos los cursos",
      "UI/UX Design Master",
      "Python Essentials",
    ],
  },
];

const metric: Metric[] = [
  {
    icon: IoPersonOutline,
    value: "12,842",
    label: "Usuarios Activos",
    badge: "+12.5%",
    variant: "positive",
  },
  {
    icon: TfiBlackboard,
    value: "156",
    label: "Cursos Activos",
    badge: "+4.2%",
    variant: "positive",
  },
  {
    icon: LiaCertificateSolid,
    value: "3,490",
    label: "Certificados",
    badge: "Estable",
    variant: "neutral",
  },
  {
    icon: FaRegClock,
    value: "45m",
    label: "Tiempo Promedio",
    badge: "-2.1%",
    variant: "negative",
  },
];

const activity = [
  {
    day: "Lun",
    visualizaciones: 320,
    completitud: 140,
  },
  {
    day: "Mar",
    visualizaciones: 450,
    completitud: 200,
  },
  {
    day: "Mié",
    visualizaciones: 380,
    completitud: 170,
  },
  {
    day: "Jue",
    visualizaciones: 520,
    completitud: 240,
  },
  {
    day: "Vie",
    visualizaciones: 610,
    completitud: 290,
  },
  {
    day: "Sáb",
    visualizaciones: 480,
    completitud: 210,
  },
  {
    day: "Dom",
    visualizaciones: 390,
    completitud: 160,
  },
];

const courses = [
  {
    name: "UI/UX Design Master",
    visits: 2400,
    max: 2400,
  },
  {
    name: "Python Essentials",
    visits: 1900,
    max: 2400,
  },
  {
    name: "Digital Marketing",
    visits: 1200,
    max: 2400,
  },
  {
    name: "Soft Skills",
    visits: 850,
    max: 2400,
  },
];

export default function Reports() {

  return (
    <div className="min-h-full w-full bg-[#f6f6f6] font-['Plus_Jakarta_Sans'] select-none">

      <div className="w-full max-w-none px-10 py-8">

        {/* Header */}
        <div className="pb-8">
          <h1 className="text-[32px] font-bold text-[#223740] tracking-[-1px]">
            Reportes y Analítica Avanzada
          </h1>

          <p className="text-[16.5px] text-[#3a3a3a] mt-2 font-medium">
            Visualiza el rendimiento y compromisos en la plataforma.
          </p>
        </div>

        {/* Filters */}
        <div className="mb-8">
          <Filters filters={filters} />
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8 mt-8">

          {metric.map((m) => (
            <MetricCard
              key={m.label}
              metric={m}
            />
          ))}

        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 items-start mb-8">

          <div className="xl:col-span-2">
            <ActivityChart data={activity} />
          </div>

          <div>
            <CourseRanking courses={courses} />
          </div>

        </div>

        {/*GA4 & GTM*/}
        <div className="mb-8">
          <SimulateEvents/>
        </div>

        {/* Gráfica embebida */}
        <div className="mt-8 mb-8">
          <GraphsLooker />
        </div>
      </div>
    </div>
  );
}