import { useState } from "react";
import GraphsLooker from "./modules/lookerStudio/GraphsLooker";
import { IoPersonOutline } from "react-icons/io5";
import { TfiBlackboard } from "react-icons/tfi";
import { LiaCertificateSolid } from "react-icons/lia";
import { FaRegClock } from "react-icons/fa6";
import SimulateEvents from "./modules/gtm/SimulateEvents";

const Reports = () => {
  return (
    <div className="min-h-full w-full bg-[#f6f6f6] font-['Plus_Jakarta_Sans'] select-none">
      <div className="w-full max-w-none px-10 py-8">
        {/* Header */}
        <div>
          <h1 className="text-[32px] font-bold text-[#223740] tracking-[-1px]">
            Reportes y Analítica Avanzada
          </h1>

          <p className="text-[16.5px] text-[#3a3a3a] mt-2 font-medium">
            Visualiza el rendimiento y compromisos en la plataforma.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <section className="bg-amber-300">
            <h1 className="text-center">Espacio dónde trabajará Asley</h1>
            <div>
              - Acá debe ir un GRID para ubicar las gráficas según el diseño
              planteado y el grid permite que se ajuste según la dimensión de la
              pantalla
            </div>
          </section>

          <section className="bg-blue-300">
            <h1 className="text-center">Espacio dónde trabajará Johan</h1>
            <div>
              - Acá debe ir la lógica de gráficas sacadas con TAG-MANAGER.
            </div>

            {/* <div className="mb-8">
              <SimulateEvents/>
            </div>

            <div className="mt-8 mb-8">
              <GraphsLooker />
            </div> */}
          </section>
        </div>
      </div>
    </div>
  );
};

export default Reports;
