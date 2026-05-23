import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip } from 'recharts'; // Contenedor responsive para las graficas
import { Grouping, PeriodEnrollmentResponse } from '../../types/LineChart';
import { ImSpinner2 } from "react-icons/im";


interface Props {
    data: PeriodEnrollmentResponse;
    total: number;
    agrupacion: Grouping;
    setAgrupacion: (g: Grouping) => void;
    loading: boolean;
    colors: any;
}

const EnrollmentLineChart = ({ data, total, agrupacion, setAgrupacion, loading, colors }: Props) => (
    <div className="rounded-2xl p-5 shadow-sm" style={{ background: colors.input }}>
        <p className="text-xs mb-1" style={{ color: colors.textSecondary }}>Inscripciones por Periodo</p>
        <div className="flex items-center justify-between mb-2">
            <h2 className="text-2xl font-bold" style={{ color: colors.primary }}>{total.toLocaleString()} Students</h2>
            {/* Agrupación */}
            <select
                value={agrupacion}
                onChange={e => setAgrupacion(e.target.value as Grouping)}
                className="text-xs px-3 py-1 rounded-full font-medium border-none outline-none cursor-pointer"
                style={{ background: colors.tertiary, color: colors.primary }}
            >
                {/* Opciones de agrupación */}
                <option value="mensual">Mensual</option>
                <option value="trimestral">Trimestral</option>
                <option value="semestral">Semestral</option>
                <option value="anual">Anual</option>
            </select>
        </div>
        {/* Estado de carga */}
        {loading ? (
            <div className="flex items-center justify-center h-[110px]">
                <ImSpinner2
                    className="animate-spin"
                    style={{ color: colors.primary }}
                    size={24}
                />
            </div>
        ) : (
            <ResponsiveContainer width="100%" height={110}> {/* Grafica de líneas */}
                <LineChart data={data}>
                    <XAxis dataKey="periodo" tick={{ fontSize: 10, fill: colors.textSecondary }} axisLine={false} tickLine={false} tickFormatter={v => v.slice(0, 3)} />
                    <YAxis hide />
                    <Tooltip formatter={value => [Number(value).toLocaleString(), 'Inscritos']} contentStyle={{ background: colors.input, borderColor: colors.border, color: colors.textBase }} />
                    <Line type="monotone" dataKey="total_inscripciones" stroke={colors.primary} strokeWidth={2} dot={{ r: 3, fill: colors.primary }} />
                </LineChart>
            </ResponsiveContainer>
        )}
    </div>
);

export default EnrollmentLineChart;
