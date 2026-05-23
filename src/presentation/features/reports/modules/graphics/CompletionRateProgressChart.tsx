interface CompletionRate {
  curso_id: string;
  curso_titulo: string;
  porcentaje_completados: string;
}

interface Props {
  completionRate: CompletionRate[];
  colors: any;
}

const CompletionRateProgressChart = ({ completionRate, colors }: Props) => (
  <div className="rounded-2xl p-5 shadow-sm" style={{ background: colors.input }}>
    <p className="text-xs mb-4" style={{ color: colors.textSecondary }}>Tasa de completado por curso</p>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {completionRate.map((course) => {
        // Convierte el porcentaje string a número y si viene vacío o null, usa 0
        const pct = course.porcentaje_completados ? parseFloat(course.porcentaje_completados) : 0;
        const isHigh = pct >= 80; // Si el porcentaje es >= 80 se considera alto
        return (
          <div key={course.curso_id}>
            <div className="flex justify-between items-baseline mb-1">
              <span className="text-xs font-medium" style={{ color: colors.textBase }}>{course.curso_titulo}</span>
              <span className="text-xs font-bold ml-2" style={{ color: isHigh ? colors.primary : colors.tertiary }}>{pct.toFixed(0)}%</span>
            </div>
            <div className="h-1 rounded-full" style={{ background: colors.border }}>
              <div className="h-1 rounded-full" style={{ width: `${pct}%`, background: isHigh ? colors.primary : colors.tertiary }} />
            </div>
          </div>
        );
      })}
    </div>
  </div>
);

export default CompletionRateProgressChart;
