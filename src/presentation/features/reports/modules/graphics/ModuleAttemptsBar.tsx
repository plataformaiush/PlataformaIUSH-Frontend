// Tipo con los datos de intentos por módulo
import { ModuleAttemptResponse } from "../../types/HorizontalBarChart";
import { useInstitution } from "../../../../../context/InstitutionContext";

type ColorsType =ReturnType<typeof useInstitution>["colors"];

// Props del componente
type Props = {
  moduleAttempts: ModuleAttemptResponse; // Lista de módulos con sus promedios de intentos
  colors: ColorsType;        // Colores de la institución
};

export default function ModuleAttemptsBar({ moduleAttempts, colors }: Props) {
  // Filtra solo los módulos que tienen al menos un intento registrado
  const attemptsWithData = moduleAttempts.filter((m) => m.promedio_intentos !== null);

  // Promedio global de intentos entre todos los módulos con datos
  const globalAverage =
    attemptsWithData.length > 0
      ? (
          attemptsWithData.reduce((acc, m) => acc + parseFloat(m.promedio_intentos!), 0) /
          attemptsWithData.length
        ).toFixed(1)
      : "—";

  // Valor máximo de intentos, usado como referencia para las barras de progreso
  const maxAttempt =
    attemptsWithData.length > 0
      ? Math.max(...attemptsWithData.map((m) => parseFloat(m.promedio_intentos!)))
      : 1;

  return (
    <div className="rounded-2xl p-5 shadow-sm" style={{ background: colors.primary }}>
      {/* Encabezado con ícono SVG y título */}
      <div className="flex items-center gap-2 mb-3">
        <div className="rounded-md p-1.5" style={{ background: colors.tertiary }}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <rect x="0" y="9" width="3" height="5" rx="1" fill={colors.textOnDark} />
            <rect x="4" y="6" width="3" height="8" rx="1" fill={colors.textOnDark} />
            <rect x="8" y="3" width="3" height="11" rx="1" fill={colors.textOnDark} />
            <rect x="12" y="0" width="2" height="14" rx="1" fill={colors.textOnDark} />
          </svg>
        </div>
        <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: colors.textOnDark }}>
          Promedio Intentos Por Curso
        </p>
      </div>

      {/* Top 3 módulos con más intentos, cada uno con su barra de progreso */}
      <div className="flex flex-col gap-3">
        {attemptsWithData.slice(0, 3).map((module) => {
          // Porcentaje relativo al módulo con más intentos
          const pct = Math.round((parseFloat(module.promedio_intentos!) / maxAttempt) * 100);
          return (
            <div key={module.id_modulo}>
              <div className="flex justify-between text-xs mb-1" style={{ color: colors.textOnDark }}>
                <span>{module.modulo_titulo}</span>
                <span>{parseFloat(module.promedio_intentos!).toFixed(1)}</span>
              </div>
              {/* Barra de fondo + barra de progreso */}
              <div className="h-1.5 rounded-full" style={{ background: colors.tertiary }}>
                <div
                  className="h-1.5 rounded-full"
                  style={{ width: `${pct}%`, background: colors.secondary }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Promedio global al pie de la tarjeta */}
      <p className="text-xs mt-4" style={{ color: colors.textOnDark, opacity: 0.6 }}>
        Promedio global: {globalAverage}
      </p>
    </div>
  );
}