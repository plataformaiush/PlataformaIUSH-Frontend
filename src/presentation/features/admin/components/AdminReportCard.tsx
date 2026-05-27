import type { AdminReport } from '../../../../domain/admin/types'

export function AdminReportCard({ report }: { report: AdminReport }) {
  return (
    <section className="border border-border rounded-2xl overflow-hidden bg-input">
      <header className="px-4 py-3 bg-gradient-to-r from-primary to-secondary">
        <h2 className="text-sm font-semibold tracking-tight text-[var(--color-text-on-dark)]">
          {report.order}. {report.title}
        </h2>
        {report.description && (
          <p className="mt-1 text-xs text-[var(--color-text-on-dark)] opacity-80">
            {report.description}
          </p>
        )}
      </header>

      <div className="p-4">
        {report.kind === 'metrics' ? (
          report.metrics.length === 0 ? (
            <p className="text-sm text-muted-foreground">Sin datos para mostrar</p>
          ) : (
            <div className="divide-y divide-border">
              {report.metrics.map((metric) => (
                <div key={metric.id} className="flex items-center justify-between gap-4 py-2">
                  <span className="text-sm text-muted-foreground">{metric.label}</span>
                  <span className="text-sm font-semibold text-foreground text-right whitespace-nowrap">
                    {metric.value}
                  </span>
                </div>
              ))}
            </div>
          )
        ) : (
          <div className="space-y-4">
            {report.sections.map((section) => (
              <div key={section.id}>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {section.title}
                </p>
                <ul className="mt-2 space-y-1 list-disc pl-5">
                  {section.entries.map((entry, index) => (
                    <li key={`${section.id}-${index}`} className="text-sm text-foreground">
                      {entry}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
