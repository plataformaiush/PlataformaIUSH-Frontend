import { useState } from 'react'

declare global {
  interface Window {
    dataLayer: any[];
  }
}

const SimulateEvents = () => {

  const [evalChecked, setEvalChecked] = useState(false);
  const [certChecked, setCertChecked] = useState(false);

  const handleSimulateEval = () => {
    setEvalChecked(true);

    window.dataLayer.push({
      event: "evento_lms",
      accion: "evaluacion_completada",
      categoria: "curso",
      etiqueta: "modulo_1"
    });
  };

  const handleSimulateCert = () => {
    setCertChecked(true);

    window.dataLayer.push({
      event: "evento_lms",
      accion: "certificado_obtenido",
      categoria: "curso",
      etiqueta: "curso_react"
    });
  };
  return (
    <div className='pt-5'>
        <div className="mb-8 rounded-lg border border-slate-300 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900 mb-3 text-center">
            Simulación de eventos para GTM Y GA4
        </h2>

        <div className="flex gap-4 mb-4 justify-center">
            <label className="flex items-center gap-2 text-sm text-slate-700">
            <input type="checkbox" checked={evalChecked} readOnly />
            Evaluación simulada
            </label>

            <label className="flex items-center gap-2 text-sm text-slate-700">
            <input type="checkbox" checked={certChecked} readOnly />
            Certificado simulado
            </label>
        </div>

        <div className="flex flex-col gap-3">
            <button
            type="button"
            onClick={handleSimulateEval}
            className="cursor-pointer rounded-md border border-blue-500 bg-[#5A878C] px-4 py-2 text-sm font-medium text-white focus:ring-2 focus:ring-blue-400"
            >
            Simular evento de evaluación
            </button>

            <button
            type="button"
            onClick={handleSimulateCert}
            className="cursor-pointer rounded-md border border-emerald-500 bg-[#5A878C] px-4 py-2 text-sm font-medium text-white focus:ring-2 focus:ring-emerald-400"
            >
                Simular evento de obtener certificado
            </button>

        </div>
        </div>
    </div>
  )
}

export default SimulateEvents
