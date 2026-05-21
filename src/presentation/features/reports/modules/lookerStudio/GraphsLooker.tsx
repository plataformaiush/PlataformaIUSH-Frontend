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
    return (
        <section className="relative overflow-hidden rounded-2xl border  bg-[#7ea5a9] from-white  p-5 sm:p-6 lg:p-8 shadow-sm">
            <div className="absolute -top-20 -right-20 h-44 w-44 rounded-full bg-emerald-100/70 blur-2xl" aria-hidden="true" />
            <div className="absolute -bottom-16 -left-16 h-40 w-40 rounded-full bg-cyan-100/70 blur-2xl" aria-hidden="true" />

            <div className="relative">
                <h3 className="text-xl sm:text-2xl font-bold text-[#FFF] tracking-[-0.4px] text-center">
                    Paneles embebidos de Looker Studio
                </h3>

                <div className="mt-6 grid grid-cols-1 xl:grid-cols-2 gap-5">
                    {lookerGraphs.map((graph) => (
                        <article
                            key={graph.src}
                            className="overflow-hidden rounded-xl border border-slate-200 bg-white/90 backdrop-blur-sm shadow-sm transition hover:shadow-md"
                        >

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
            </div>
        </section>
    );
};

export default GraphsLooker;
