import { Activity, BarChart3, ShieldCheck } from "lucide-react";
import { useInstitution } from "../../../../../../context/InstitutionContext";

const EventCardsGTM = () => {
  const { colors } = useInstitution();

  const gtmEventCards = [
    {
      label: "Eventos de curso",
      value: "4",
      detail: "inicio, módulos, finalización y certificados",
      icon: Activity,
    },
    {
      label: "Eventos de acceso",
      value: "2",
      detail: "inicio de sesión y roles usados",
      icon: ShieldCheck,
    },
    {
      label: "Paneles Looker",
      value: "4",
      detail: "vistas conectadas a GA4 y Tag Manager",
      icon: BarChart3,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      {gtmEventCards.map((card) => {
        const Icon = card.icon;

        return (
          <article
            key={card.label}
            className="rounded-lg border p-5 shadow-sm"
            style={{
              background: colors.input,
              borderColor: colors.border,
            }}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p
                  className="text-sm font-semibold"
                  style={{ color: colors.textBase }}
                >
                  {card.label}
                </p>
                <p
                  className="mt-2 text-3xl font-bold"
                  style={{ color: colors.primary }}
                >
                  {card.value}
                </p>
              </div>
              <span
                className="inline-flex h-10 w-10 items-center justify-center rounded-lg"
                style={{
                  background: colors.tertiary,
                  color: colors.primary,
                }}
              >
                <Icon className="h-5 w-5" />
              </span>
            </div>
            <p
              className="mt-3 text-xs leading-5"
              style={{ color: colors.textSecondary }}
            >
              {card.detail}
            </p>
          </article>
        );
      })}
    </div>
  );
};

export default EventCardsGTM;
