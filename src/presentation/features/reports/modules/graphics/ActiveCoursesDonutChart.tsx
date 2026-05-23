import { PieChart, Pie, Cell } from 'recharts'; // Contenedor responsive para las graficas
import { ActiveVsInactiveCourses } from '../../types/DonutChart';

interface Props {
  data: ActiveVsInactiveCourses | null;
  donutData: { name: string; value: number }[];
  activePercentage: number;
  colors: any;
}

const ActiveCoursesDonutChart = ({ data, donutData, activePercentage, colors }: Props) => (
  <div className="rounded-2xl p-5 shadow-sm" style={{ background: colors.input }}>
    <p className="text-xs mb-2" style={{ color: colors.textSecondary }}>Cursos Activos o Inactivos</p>
    <div className="flex items-center gap-4 mb-2">
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full inline-block" style={{ background: colors.primary }} />
        <span className="text-xs" style={{ color: colors.textBase }}>Cursos Activos</span>
        <span className="text-sm font-bold" style={{ color: colors.textBase }}>{data ? parseInt(data.activos) : 0}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full inline-block" style={{ background: colors.tertiary }} />
        <span className="text-xs" style={{ color: colors.textSecondary }}>Cursos Inactivos</span>
        <span className="text-sm font-bold" style={{ color: colors.textSecondary }}>{data ? parseInt(data.inactivos) : 0}</span>
      </div>
    </div>
    <div className="relative flex items-center justify-center">
      <PieChart width={140} height={140}>
        <Pie data={donutData} cx={65} cy={65} innerRadius={45} outerRadius={65} dataKey="value" startAngle={90} endAngle={-270}>
          <Cell fill={colors.primary} />
          <Cell fill={colors.tertiary} />
        </Pie>
      </PieChart>
      <span className="absolute text-lg font-bold" style={{ color: colors.primary }}>{activePercentage}%</span>
    </div>
  </div>
);

export default ActiveCoursesDonutChart;
