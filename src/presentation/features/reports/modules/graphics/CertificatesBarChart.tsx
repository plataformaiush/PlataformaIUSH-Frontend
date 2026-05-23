// Componentes de Recharts para las barras dobles
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";

// Tipo con los totales de certificados emitidos y descargados
import { Certificates } from "../../types/BarChart";
import { useInstitution } from "../../../../../context/InstitutionContext";

type ColorsType =ReturnType<typeof useInstitution>["colors"];

// Props del componente
type Props = {
  certificates: Certificates | null; // Puede ser null mientras carga
  colors: ColorsType;    // Colores de la institución
};

export default function CertificatesBarChart({ certificates, colors }: Props) {
  // Estructura de datos que espera Recharts para las dos barras
  const data = [
    {
      name: "Certificados",
      Emitido: certificates ? parseInt(certificates.total_emitidos) : 0,
      Descargado: certificates ? parseInt(certificates.total_descargados) : 0,
    },
  ];

  return (
    <div className="rounded-2xl p-5 shadow-sm" style={{ background: colors.input }}>
      <p className="text-xs mb-1" style={{ color: colors.textSecondary }}>
        Certificado Emitido vs Certificado Descargado
      </p>

      {/* Total de emitidos como número destacado */}
      <h2 className="text-2xl font-bold mb-2" style={{ color: colors.primary }}>
        {certificates ? parseInt(certificates.total_emitidos).toLocaleString() : "—"}
      </h2>

      {/* Leyenda de colores */}
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

      {/* Gráfica de barras dobles: emitidos vs descargados */}
      <ResponsiveContainer width="100%" height={110}>
        <BarChart data={data} barCategoryGap="30%">
          <XAxis hide />
          <YAxis hide />
          <Tooltip
            contentStyle={{
              background: colors.input,
              borderColor: colors.border,
              color: colors.textBase,
            }}
          />
          <Bar dataKey="Emitido" fill={colors.primary} radius={[4, 4, 0, 0]} />
          <Bar dataKey="Descargado" fill={colors.tertiary} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}