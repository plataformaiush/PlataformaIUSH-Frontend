import { ExternalLink } from "lucide-react";

import { useInstitution } from "../../../../../context/InstitutionContext";

type LookerGraph = {
  title: string;
  src: string;
};

const lookerGraphs: LookerGraph[] = [
  {
    title: "Eventos por nombre",
    src: "https://datastudio.google.com/embed/reporting/be87b050-5fee-49bc-b4cd-f8c003555a8a/page/p_lvl3tbih3d",
  },
  {
    title: "Eventos a lo largo del tiempo",
    src: "https://datastudio.google.com/embed/reporting/be87b050-5fee-49bc-b4cd-f8c003555a8a/page/p_hu7f4bih3d",
  },
  {
    title: "Tabla ProfunSoft",
    src: "https://datastudio.google.com/embed/reporting/be87b050-5fee-49bc-b4cd-f8c003555a8a/page/p_0c939bih3d",
  },
  {
    title: "Usuarios activos por GTM",
    src: "https://datastudio.google.com/embed/reporting/be87b050-5fee-49bc-b4cd-f8c003555a8a/page/p_iq6x69hh3d",
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
              <ExternalLink
                className="h-4 w-4 shrink-0"
                style={{ color: colors.primary }}
              />
            </div>
            <div className="aspect-[16/10] w-full">
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
