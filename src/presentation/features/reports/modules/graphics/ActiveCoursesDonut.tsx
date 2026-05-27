// Componentes de Recharts para la gráfica donut
import { PieChart, Pie, Cell } from "recharts";

// Tipo con los conteos de cursos activos e inactivos
import { ActiveVsInactiveCourses } from "../../types/DonutChart";
import { useInstitution } from "../../../../../context/InstitutionContext";

type ColorsType =ReturnType<typeof useInstitution>["colors"];


// Props del componente
type Props = {
  activeVsInactive: ActiveVsInactiveCourses | null; // Puede ser null mientras carga
  colors: ColorsType;                   // Colores de la institución
};

export default function ActiveCoursesDonut({ activeVsInactive, colors }: Props) {
  // Porcentaje de cursos activos sobre el total
  const activePercentage = activeVsInactive
    ? Math.round(
        (parseInt(activeVsInactive.activos) / parseInt(activeVsInactive.total_cursos)) * 100,
      )
    : 0;

  // Datos formateados para que Recharts los entienda
  const donutData = activeVsInactive
    ? [
        { name: "Activos", value: parseInt(activeVsInactive.activos) },
        { name: "Inactivos", value: parseInt(activeVsInactive.inactivos) },
      ]
    : [];

  return (
    <div className="rounded-2xl p-5 shadow-sm" style={{ background: colors.input }}>
      <p className="text-xs mb-2" style={{ color: colors.textSecondary }}>
        Cursos Activos o Inactivos
      </p>

      {/* Leyenda con conteos de activos e inactivos */}
      <div className="flex items-center gap-4 mb-2">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full inline-block" style={{ background: colors.primary }} />
          <span className="text-xs" style={{ color: colors.textBase }}>Cursos Activos</span>
          <span className="text-sm font-bold" style={{ color: colors.textBase }}>
            {activeVsInactive ? parseInt(activeVsInactive.activos) : 0}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full inline-block" style={{ background: colors.tertiary }} />
          <span className="text-xs" style={{ color: colors.textSecondary }}>Cursos Inactivos</span>
          <span className="text-sm font-bold" style={{ color: colors.textSecondary }}>
            {activeVsInactive ? parseInt(activeVsInactive.inactivos) : 0}
          </span>
        </div>
      </div>

      {/* Gráfica donut */}
      <div className="relative flex items-center justify-center">
        <PieChart width={140} height={140}>
          <Pie
            data={donutData}
            cx={65}
            cy={65}
            innerRadius={45}
            outerRadius={65}
            dataKey="value"
            startAngle={90}
            endAngle={-270}
          >
            <Cell fill={colors.primary} />   {/* Activos */}
            <Cell fill={colors.tertiary} />  {/* Inactivos */}
          </Pie>
        </PieChart>
        {/* Porcentaje superpuesto en el centro del donut */}
        <span className="absolute text-lg font-bold" style={{ color: colors.primary }}>
          {activePercentage}%
        </span>
      </div>
    </div>
  );
}