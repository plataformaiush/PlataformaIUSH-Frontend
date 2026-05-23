interface ModuleAttempt {
  id_modulo: string;
  modulo_titulo: string;
  promedio_intentos: string | null;
}

interface Props {
  attemptsWithData: ModuleAttempt[];
  maxAttempt: number;
  globalAverage: string;
  colors: any;
}

const AttemptsHorizontalBarChart = ({ attemptsWithData, maxAttempt, globalAverage, colors }: Props) => (
  <div className="rounded-2xl p-5 shadow-sm" style={{ background: colors.primary }}>
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
    <div className="flex flex-col gap-3">
        {/* Muestra únicamente los primeros 3 módulos */}
      {attemptsWithData.slice(0, 3).map((module) => {
        const pct = Math.round((parseFloat(module.promedio_intentos!) / maxAttempt) * 100); // Convierte promedio a porcentaje, tomando como referencia el máximo valor
        return (
          <div key={module.id_modulo}>
            <div className="flex justify-between text-xs mb-1" style={{ color: colors.textOnDark }}>
              <span>{module.modulo_titulo}</span>
              <span>{parseFloat(module.promedio_intentos!).toFixed(1)}</span>
            </div>
            <div className="h-1.5 rounded-full" style={{ background: colors.tertiary }}>
              <div className="h-1.5 rounded-full" style={{ width: `${pct}%`, background: colors.secondary }} />
            </div>
          </div>
        );
      })}
    </div>
    <p className="text-xs mt-4" style={{ color: colors.textOnDark, opacity: 0.6 }}>
      Promedio global: {globalAverage}
    </p>
  </div>
);

export default AttemptsHorizontalBarChart;
