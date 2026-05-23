import { ExternalLink } from "lucide-react";

import { useInstitution } from "../../../../../context/InstitutionContext";

type LookerGraph = {
  title: string;
  src: string;
};

const lookerGraphs: LookerGraph[] = [
  {
    title: "Evento - Inicios de sesión",
    src: "https://datastudio.google.com/embed/reporting/26b1b0c9-9143-4b19-bd30-bc63dc7a548e/page/p_vvduqgzw3d",
  },
  {
    title: "Evento - Rol más usado",
    src: "https://datastudio.google.com/embed/reporting/26b1b0c9-9143-4b19-bd30-bc63dc7a548e/page/p_uggq1d5w3d",
  },
  {
    title: "Evento - Inicio de modulos",
    src: "https://datastudio.google.com/embed/reporting/26b1b0c9-9143-4b19-bd30-bc63dc7a548e/page/p_qi4jca6w3d",
  },
  {
    title: "Evento - Certificado obtenido",
    src: "https://datastudio.google.com/embed/reporting/26b1b0c9-9143-4b19-bd30-bc63dc7a548e/page/p_5jqh6a5w3d",
  },
  {
    title: "Evento - Curso iniciado",
    src: "https://datastudio.google.com/embed/reporting/26b1b0c9-9143-4b19-bd30-bc63dc7a548e/page/PB7yF",
  },
  {
    title: "Evento - Curso Completado",
    src: "https://datastudio.google.com/embed/reporting/26b1b0c9-9143-4b19-bd30-bc63dc7a548e/page/p_yk1viv7w3d",
  },
];

const GraphsLooker = () => {
  const { colors } = useInstitution();

  return (
    <section
      className="rounded-lg border p-5 shadow-sm sm:p-6"
      style={{ background: colors.input, borderColor: colors.border }}
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h3 className="text-xl font-bold" style={{ color: colors.textBase }}>
            Paneles embebidos de Looker Studio
          </h3>
          <p className="mt-1 text-sm" style={{ color: colors.textSecondary }}>
            Visualización de eventos capturados por Google Tag Manager y GA4.
          </p>
        </div>
        <span
          className="inline-flex w-fit items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold"
          style={{ background: colors.tertiary, color: colors.primary }}
        >
          {lookerGraphs.length} paneles
        </span>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-2">
        {lookerGraphs.map((graph) => (
          <article
            key={graph.src}
            className="overflow-hidden rounded-lg border shadow-sm transition hover:shadow-md"
            style={{
              background: colors.background,
              borderColor: colors.border,
            }}
          >
            <div
              className="flex items-center justify-between gap-3 border-b px-4 py-3"
              style={{ borderColor: colors.border }}
            >
              <h4
                className="truncate text-sm font-semibold"
                style={{ color: colors.textBase }}
              >
                {graph.title}
              </h4>

            </div>
            <div className="aspect-[16/12] w-full">
              <iframe
                title={graph.title}
                src={graph.src}
                className="h-full w-full border-0"
                allowFullScreen
                sandbox="allow-storage-access-by-user-activation allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
              />
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};

export default GraphsLooker;
