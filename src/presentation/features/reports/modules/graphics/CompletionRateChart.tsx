// Tipo con la lista de cursos y su porcentaje de completado
import { CourseCompletionRateResponse } from "../../types/ProgressChart";
import { useInstitution } from "../../../../../context/InstitutionContext";

type ColorsType =ReturnType<typeof useInstitution>["colors"];

// Props del componente
type Props = {
  completionRate: CourseCompletionRateResponse; // Lista de cursos con su tasa de completado
  colors: ColorsType;               // Colores de la institución
};

export default function CompletionRateChart({ completionRate, colors }: Props) {
  return (
    <div className="rounded-2xl p-5 shadow-sm" style={{ background: colors.input }}>
      <p className="text-xs mb-4" style={{ color: colors.textSecondary }}>
        Tasa de completado por curso
      </p>

      {/* Grid de barras de progreso, una por curso */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {completionRate.map((course) => {
          const pct = course.porcentaje_completados
            ? parseFloat(course.porcentaje_completados)
            : 0;
          // Los cursos con 80% o más se marcan en color primario, el resto en terciario
          const isHigh = pct >= 80;
          return (
            <div key={course.curso_id}>
              {/* Nombre del curso y porcentaje alineados en la misma fila */}
              <div className="flex justify-between items-baseline mb-1">
                <span className="text-xs font-medium" style={{ color: colors.textBase }}>
                  {course.curso_titulo}
                </span>
                <span
                  className="text-xs font-bold ml-2"
                  style={{ color: isHigh ? colors.primary : colors.tertiary }}
                >
                  {pct.toFixed(0)}%
                </span>
              </div>
              {/* Barra de fondo + barra de progreso coloreada según umbral */}
              <div className="h-1 rounded-full" style={{ background: colors.border }}>
                <div
                  className="h-1 rounded-full"
                  style={{
                    width: `${pct}%`,
                    background: isHigh ? colors.primary : colors.tertiary,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}