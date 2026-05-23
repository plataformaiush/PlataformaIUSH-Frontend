import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts'; // Contenedor responsive para las graficas
import { PopularCourseResponse } from '../../types/BarChart';

interface Props {
    popularCourses: PopularCourseResponse;
    totalInscritos: number;
    colors: any;
}

const EnrolledBarChart = ({ popularCourses, totalInscritos, colors }: Props) => (
    <div className="rounded-2xl p-5 shadow-sm" style={{ background: colors.input }}>
        <p className="text-xs mb-1" style={{ color: colors.textSecondary }}>Inscritos por curso</p>
        <h2 className="text-2xl font-bold mb-3" style={{ color: colors.textBase }}>{totalInscritos.toLocaleString()} inscritos</h2>
        <ResponsiveContainer width="100%" height={110}>
            <BarChart data={popularCourses} barCategoryGap="20%">  {/* Grafica de barras */}
                <XAxis dataKey="curso_titulo" tick={{ fontSize: 9, fill: colors.textSecondary }} axisLine={false} tickLine={false} tickFormatter={v => v.slice(0, 6)} />
                <YAxis hide />
                <Tooltip formatter={value => [Number(value).toLocaleString(), 'Inscritos']} contentStyle={{ background: colors.input, borderColor: colors.border, color: colors.textBase }} />
                <Bar dataKey="total_inscritos" radius={[4, 4, 0, 0]}>
                    {popularCourses.map((_, index) => (
                        <Cell
                            key={`cell-${index}`}
                            fill={colors.primary}
                        />
                    ))}
                </Bar>
            </BarChart>
        </ResponsiveContainer>
    </div>
);

export default EnrolledBarChart;