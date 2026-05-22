import { trackCursoCompletado } from "../../events/TagManagerEvents";

import { useInstitution } from "../../../../../context/InstitutionContext";
// declare global {
//   interface Window {
//     dataLayer: any[];
//   }
// }

const SimulateEvents = () => {
  const { colors } = useInstitution();

  return (
    <div className="flex flex-col gap-3">
      <button
        type="button"
        onClick={() => trackCursoCompletado("Curso React")}
        className="cursor-pointer rounded-md border px-4 py-3 text-sm font-semibold transition focus:ring-2"
        style={{
          background: colors.primary,
          borderColor: colors.primary,
          color: colors.textOnDark,
        }}
      >
        Simular evento de curso completado
      </button>

      <div
        className="rounded-lg border px-3 py-2 text-xs"
        style={{
          background: colors.background,
          borderColor: colors.border,
          color: colors.textSecondary,
        }}
      >
        Evento:{" "}
        <span className="font-semibold" style={{ color: colors.textBase }}>
          curso_completado
        </span>
      </div>
    </div>
  );
};

export default SimulateEvents;
