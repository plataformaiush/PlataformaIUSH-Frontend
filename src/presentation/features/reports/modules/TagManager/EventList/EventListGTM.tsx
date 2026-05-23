import { MousePointerClick } from "lucide-react";
import { useInstitution } from "../../../../../../context/InstitutionContext";

const EventListGTM = () => {
  const { colors } = useInstitution();

  
  const gtmFlowItems = [
    "iniciar_sesion",
    "rol_mas_usado",
    "iniciar_curso",
    "iniciar_modulo",
    "curso_completado",
    "certificado_obtenido",
  ];


  return (
    <div
      className="rounded-lg border p-5 shadow-sm"
      style={{ background: colors.input, borderColor: colors.border }}
    >
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p
            className="text-base font-semibold"
            style={{ color: colors.textBase }}
          >
            Flujo de eventos GTM
          </p>
          <p className="mt-1 text-xs" style={{ color: colors.textSecondary }}>
            Eventos base enviados al dataLayer.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {gtmFlowItems.map((eventName, index) => (
          <div
            key={eventName}
            className="flex items-center gap-3 rounded-lg border px-3 py-2"
            style={{
              borderColor: colors.border,
              background: colors.background,
            }}
          >
            <span
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-xs font-bold"
              style={{
                background: colors.primary,
                color: colors.textOnDark,
              }}
            >
              {index + 1}
            </span>
            <span
              className="truncate text-sm font-medium"
              style={{ color: colors.textBase }}
            >
              {eventName}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EventListGTM;
