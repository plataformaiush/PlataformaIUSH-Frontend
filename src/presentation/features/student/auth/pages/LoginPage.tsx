import LoginForm from "../components/LoginForm";
import { useInstitution } from "../../../../../context/InstitutionContext";

function hexToRgba(hex: string, alpha: number) {
  const normalized = hex.replace("#", "");
  const value = normalized.length === 3
    ? normalized.split("").map((char) => char + char).join("")
    : normalized;

  const red = parseInt(value.slice(0, 2), 16);
  const green = parseInt(value.slice(2, 4), 16);
  const blue = parseInt(value.slice(4, 6), 16);

  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}

export default function LoginPage() {
  const { colors } = useInstitution();

  const softGlow = hexToRgba(colors.tertiary, 0.45);
  const deepGlow = hexToRgba(colors.primary, 0.25);
  const topGlow = hexToRgba(colors.tertiary, 0.24);
  const bottomGlow = hexToRgba(colors.primary, 0.12);
  const accentStripe = hexToRgba(colors.tertiary, 0.09);
  const glassOverlay = hexToRgba(colors.textOnDark, 0.1);
  const brightHighlight = hexToRgba(colors.textOnDark, 0.9);
  const cardShadow = hexToRgba(colors.textBase, 0.14);

  return (
    <div
      className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10 md:px-8"
      style={{ backgroundColor: 'var(--color-background)' }}
    >
      <div
        className="pointer-events-none absolute -left-20 top-12 h-72 w-72 rounded-full blur-3xl"
        style={{ backgroundColor: softGlow }}
      />
      <div
        className="pointer-events-none absolute -bottom-16 right-4 h-72 w-72 rounded-full blur-3xl"
        style={{ backgroundColor: deepGlow }}
      />
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            `radial-gradient(circle at top left, ${topGlow}, transparent 36%), radial-gradient(circle at bottom right, ${bottomGlow}, transparent 32%)`,
        }}
      />

      <div
        className="relative grid w-full max-w-6xl overflow-hidden rounded-3xl border border-border bg-surface md:grid-cols-[1fr_1.05fr]"
        style={{ boxShadow: `0 32px 70px ${cardShadow}` }}
      >
        <aside className="relative m-3 flex min-h-135 flex-col justify-between overflow-hidden rounded-3xl bg-primary p-8 text-text-on-dark md:m-4 md:p-10">
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              backgroundImage:
                `linear-gradient(135deg, ${accentStripe}, transparent 45%)`,
            }}
          />

          <div className="relative mx-auto mt-4 flex h-64 w-full max-w-sm items-end justify-center">
            <div className="absolute bottom-0 h-40 w-52 rounded-3xl backdrop-blur-sm" style={{ backgroundColor: glassOverlay }} />
            <div className="absolute bottom-8 -left-2 h-36 w-28 rounded-t-4xl rounded-b-2xl" style={{ backgroundColor: colors.secondary }} />
            <div className="absolute bottom-10 left-24 h-44 w-28 rounded-t-4xl rounded-b-2xl" style={{ backgroundColor: colors.tertiary }} />
            <div className="absolute bottom-8 right-2 h-40 w-28 rounded-t-4xl rounded-b-2xl" style={{ backgroundColor: colors.secondary }} />
            <div className="absolute bottom-40 -left-1 h-11 w-11 rounded-full" style={{ backgroundColor: brightHighlight }} />
            <div className="absolute bottom-48 left-24 h-11 w-11 rounded-full" style={{ backgroundColor: colors.tertiary }} />
            <div className="absolute bottom-40 right-0 h-11 w-11 rounded-full" style={{ backgroundColor: colors.textBase }} />
          </div>

          <div className="max-w-sm">
            <h1 className="text-4xl font-bold leading-tight text-text-on-dark/95 md:text-[2.7rem]">
              Bienvenido a la plataforma de aprendizaje
            </h1>
            <p className="mt-4 text-sm text-text-on-dark/80 md:text-base">
              Accede a tus cursos, sigue tu progreso y continúa aprendiendo cada día con nosotros.
            </p>
          </div>
        </aside>

        <main className="flex items-center justify-center px-6 py-10 md:px-12 md:py-14">
          <div className="w-full max-w-lg">
            <LoginForm />
          </div>
        </main>
      </div>
    </div>
  );
}