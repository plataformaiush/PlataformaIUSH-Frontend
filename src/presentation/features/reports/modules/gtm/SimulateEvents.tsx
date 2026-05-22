
import {
  trackCursoCompletado
} from "../../events/TagManagerEvents";

// declare global {
//   interface Window {
//     dataLayer: any[];
//   }
// }

const SimulateEvents = () => {


  return (
    <div className="pt-5">
      <div className="mb-8 rounded-lg border border-slate-300 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900 mb-3 text-center">
          Simulación de eventos para GTM Y GA4
        </h2>

        <div className="flex flex-col gap-3">

          <button
            type="button"
            onClick={() => trackCursoCompletado("Curso React")}
            className="cursor-pointer rounded-md border border-blue-500 bg-[#5A878C] px-4 py-2 text-sm font-medium text-white focus:ring-2 focus:ring-blue-400"
          >
            Simular evento de Curso Completado
          </button>

        </div>
      </div>
    </div>
  );
};

export default SimulateEvents;
