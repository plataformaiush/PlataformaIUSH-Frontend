// Tipos de React para estilos en línea y nodos hijos
import { type CSSProperties } from "react";

// Componentes de Recharts para construir la gráfica de línea
import {
  LineChart, Line, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, LabelList,
} from "recharts";
import { TrendingUp } from "lucide-react";
import { ImSpinner2 } from "react-icons/im";
import { useInstitution } from "../../../../../context/InstitutionContext";

// Tipos para los datos de inscripciones y el filtro de agrupación
import { PeriodEnrollmentResponse, Grouping } from "../../types/LineChart";

// Tipo para la configuración de colores de la gráfica
type ChartConfig = Record<string, { label: string; color: string }>;

// Tipo para cada ítem del tooltip
type TooltipPayloadItem = {
  dataKey?: string | number;
  name?: string | number;
  value?: string | number;
  color?: string;
};

type ColorsType =ReturnType<typeof useInstitution>["colors"];

// Tooltip personalizado que muestra el periodo y el total de inscripciones
function ChartTooltipContent({
  active, label, payload,
}: {
  active?: boolean;
  label?: string | number;
  payload?: TooltipPayloadItem[];
}) {
  if (!active || !payload?.length) return null;
  const item = payload[0];
  return (
    <div
      className="rounded-lg border px-3 py-2 text-xs shadow-md"
      style={{
        background: "var(--chart-tooltip-bg)",
        borderColor: "var(--chart-tooltip-border)",
        color: "var(--chart-tooltip-text)",
      }}
    >
      <div className="mb-1 font-medium">{label}</div>
      <div className="flex items-center gap-2">
        <span
          className="h-2.5 w-2.5 rounded-full"
          style={{ background: item.color ?? "var(--color-total_inscripciones)" }}
        />
        <span>Inscripciones</span>
        <span className="font-semibold">{Number(item.value ?? 0).toLocaleString()}</span>
      </div>
    </div>
  );
}

// Contenedor que inyecta las variables CSS de color para la gráfica
function ChartContainer({
  children, className = "", config,
}: {
  children: React.ReactNode;
  className?: string;
  config: ChartConfig;
}) {
  const chartVars: CSSProperties & Record<string, string> = {};
  Object.entries(config).forEach(([key, item]) => {
    chartVars[`--color-${key}`] = item.color;
  });
  return (
    <div className={`h-[180px] w-full ${className}`} style={chartVars}>
      {children}
    </div>
  );
}

// Props del componente
type Props = {
  periodEnrollments: PeriodEnrollmentResponse; // Datos de inscripciones por periodo
  agrupacion: Grouping;                         // Filtro activo (mensual, trimestral, etc.)
  onAgrupacionChange: (value: Grouping) => void; // Callback al cambiar el filtro
  loading: boolean;                             // Indica si se está recargando la data
  colors: ColorsType;               // Colores de la institución
};

export default function EnrollmentLineChart({
  periodEnrollments,
  agrupacion,
  onAgrupacionChange,
  loading,
  colors,
}: Props) {
  // Suma total de todas las inscripciones en los periodos disponibles
  const totalEnrollments = Array.isArray(periodEnrollments)
    ? periodEnrollments.reduce(
        (acc, item) => acc + parseInt(item.total_inscripciones), 0,
      )
    : 0;

  // Calcula la tendencia porcentual entre el primer y último periodo
  const enrollmentTrend =
    periodEnrollments.length > 1
      ? Math.round(
          ((parseInt(periodEnrollments[periodEnrollments.length - 1].total_inscripciones) -
            parseInt(periodEnrollments[0].total_inscripciones)) /
            Math.max(parseInt(periodEnrollments[0].total_inscripciones), 1)) * 100,
        )
      : 0;

  // Abrevia los ticks del eje X salvo en agrupación anual
  const formatTick = (value: string) =>
    agrupacion === "anual" ? value : value.slice(0, 3);

  // Configuración de color para la línea de inscripciones
  const chartConfig: ChartConfig = {
    total_inscripciones: { label: "Inscripciones", color: colors.primary },
  };

  return (
    <div
      className="rounded-lg border p-5 shadow-sm"
      style={
        {
          background: colors.input,
          borderColor: colors.border,
          "--chart-tooltip-bg": colors.input,
          "--chart-tooltip-border": colors.border,
          "--chart-tooltip-text": colors.textBase,
        } as CSSProperties
      }
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p className="text-base font-semibold" style={{ color: colors.textBase }}>
            Inscripciones por Periodo
          </p>
          <p className="mt-1 text-xs" style={{ color: colors.textSecondary }}>
            {totalEnrollments.toLocaleString()} estudiantes registrados
          </p>
        </div>
        <select
          value={agrupacion}
          onChange={(e) => onAgrupacionChange(e.target.value as Grouping)}
          className="h-8 shrink-0 cursor-pointer rounded-md border px-3 text-xs font-medium outline-none"
          style={{
            background: colors.tertiary,
            borderColor: colors.border,
            color: colors.primary,
          }}
        >
          <option value="mensual">Mensual</option>
          <option value="trimestral">Trimestral</option>
          <option value="semestral">Semestral</option>
          <option value="anual">Anual</option>
        </select>
      </div>

      {/* Muestra spinner mientras se recarga la agrupación, o la gráfica cuando está lista */}
      {loading ? (
        <div className="flex h-[180px] items-center justify-center">
          <ImSpinner2 className="animate-spin" style={{ color: colors.primary }} size={24} />
        </div>
      ) : (
        <ChartContainer config={chartConfig}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              accessibilityLayer
              data={periodEnrollments}
              margin={{ top: 24, left: 12, right: 12, bottom: 4 }}
            >
              <CartesianGrid vertical={false} stroke={colors.border} />
              <XAxis
                dataKey="periodo"
                tick={{ fontSize: 10, fill: colors.textSecondary }}
                axisLine={false}
                tickLine={false}
                tickMargin={8}
                tickFormatter={formatTick}
              />
              <YAxis hide />
              <Tooltip cursor={false} content={<ChartTooltipContent />} />
              <Line
                type="natural"
                dataKey="total_inscripciones"
                stroke="var(--color-total_inscripciones)"
                strokeWidth={2}
                dot={{ fill: "var(--color-total_inscripciones)", stroke: "var(--color-total_inscripciones)", r: 3 }}
                activeDot={{ r: 6 }}
              >
                {/* Etiquetas sobre cada punto de la línea */}
                <LabelList
                  position="top"
                  offset={12}
                  fill={colors.textBase}
                  fontSize={12}
                  valueAccessor={(entry) => Number(entry.value ?? 0).toLocaleString()}
                />
              </Line>
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      )}

      <div className="mt-4 flex flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 font-medium leading-none" style={{ color: colors.textBase }}>
          Tendencia {enrollmentTrend >= 0 ? "al alza" : "a la baja"} de {Math.abs(enrollmentTrend)}%
          <TrendingUp className="h-4 w-4" style={{ color: colors.primary }} />
        </div>
        <div className="leading-none" style={{ color: colors.textSecondary }}>
          Mostrando inscripciones por periodo con agrupación {agrupacion}.
        </div>
      </div>
    </div>
  );
}