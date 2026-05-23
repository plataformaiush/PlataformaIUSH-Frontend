import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts'; // Contenedor responsive para las graficas
import { Certificates } from '../../types/BarChart';

interface Props {
  certificates: Certificates | null;
  colors: any;
}

const CertificatesDoubleBarChart = ({ certificates, colors }: Props) => (
  <div className="rounded-2xl p-5 shadow-sm" style={{ background: colors.input }}>
    <p className="text-xs mb-1" style={{ color: colors.textSecondary }}>Certificado Emitido vs Certificado Descargado</p> 
    <h2 className="text-2xl font-bold mb-2" style={{ color: colors.primary }}>{certificates ? parseInt(certificates.total_emitidos).toLocaleString() : '—'}</h2> {/* Si existe información, muestra el total de emitidos */}
    <div className="flex items-center gap-4 mb-3">
      <div className="flex items-center gap-1">
        <span className="w-2 h-2 rounded-full inline-block" style={{ background: colors.primary }} />
        <span className="text-xs" style={{ color: colors.textSecondary }}>Emitido</span>
      </div>
      <div className="flex items-center gap-1">
        <span className="w-2 h-2 rounded-full inline-block" style={{ background: colors.tertiary }} />
        <span className="text-xs" style={{ color: colors.textSecondary }}>Descargado</span>
      </div>
    </div>
    <ResponsiveContainer width="100%" height={110}>
      <BarChart
        data={[
          {
            name: 'Certificados',
            Emitido: certificates ? parseInt(certificates.total_emitidos) : 0,
            Descargado: certificates ? parseInt(certificates.total_descargados) : 0,
          },
        ]}
        barCategoryGap="30%"
      >
        <XAxis hide />
        <YAxis hide />
        <Tooltip contentStyle={{ background: colors.input, borderColor: colors.border, color: colors.textBase }} />
        <Bar dataKey="Emitido" fill={colors.primary} radius={[4, 4, 0, 0]} />
        <Bar dataKey="Descargado" fill={colors.tertiary} radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  </div>
);

export default CertificatesDoubleBarChart;
