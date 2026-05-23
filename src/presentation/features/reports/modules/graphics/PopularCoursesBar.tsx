// Componentes de Recharts para las barras verticales
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from "recharts";

// Tipo con la lista de cursos y sus inscritos
import { PopularCourseResponse } from "../../types/BarChart";
import { useInstitution } from "../../../../../context/InstitutionContext";

type ColorsType =ReturnType<typeof useInstitution>["colors"];

// Props del componente
type Props = {
  popularCourses: PopularCourseResponse; // Lista de cursos ordenados por inscritos
  colors: ColorsType;        // Colores de la institución
};

export default function PopularCoursesBar({ popularCourses, colors }: Props) {
  // Máximo de inscritos, usado para destacar el curso líder con color primario
  const maxInscritos =
    popularCourses.length > 0
      ? Math.max(...popularCourses.map((c) => parseInt(c.total_inscritos)))
      : 0;

  return (
    <div className="rounded-2xl p-5 shadow-sm" style={{ background: colors.input }}>
      <p className="text-xs mb-1" style={{ color: colors.textSecondary }}>
        Inscritos por curso
      </p>

      {/* Número máximo de inscritos como métrica destacada */}
      <h2 className="text-2xl font-bold mb-3" style={{ color: colors.textBase }}>
        {maxInscritos.toLocaleString()} inscritos
      </h2>

      {/* Gráfica de barras: el curso con más inscritos se resalta en color primario */}
      <ResponsiveContainer width="100%" height={110}>
        <BarChart data={popularCourses} barCategoryGap="20%">
          <XAxis
            dataKey="curso_titulo"
            tick={{ fontSize: 9, fill: colors.textSecondary }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => v.slice(0, 6)} // Abrevia el nombre del curso en el eje
          />
          <YAxis hide />
          <Tooltip
            formatter={(value) => [Number(value).toLocaleString(), "Inscritos"]}
            contentStyle={{
              background: colors.input,
              borderColor: colors.border,
              color: colors.textBase,
            }}
          />
          <Bar dataKey="total_inscritos" radius={[4, 4, 0, 0]}>
            {popularCourses.map((course) => (
              // El curso con más inscritos recibe el color primario, los demás el secundario
              <Cell
                key={course.curso_id}
                fill={
                  parseInt(course.total_inscritos) === maxInscritos
                    ? colors.primary
                    : colors.secondary
                }
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}