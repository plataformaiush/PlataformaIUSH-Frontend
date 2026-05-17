import LoginForm from "../components/LoginForm";

export default function LoginPage() {
  return (
    <div
      className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10 md:px-8"
      style={{ backgroundColor: 'var(--color-background)' }}
    >
      <div
        className="pointer-events-none absolute -left-20 top-12 h-72 w-72 rounded-full blur-3xl"
        style={{ backgroundColor: 'rgba(174, 235, 242, 0.45)' }}
      />
      <div
        className="pointer-events-none absolute -bottom-16 right-4 h-72 w-72 rounded-full blur-3xl"
        style={{ backgroundColor: 'rgba(34, 55, 64, 0.25)' }}
      />
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            'radial-gradient(circle at top left, rgba(174, 235, 242, 0.24), transparent 36%), radial-gradient(circle at bottom right, rgba(34, 55, 64, 0.12), transparent 32%)',
        }}
      />

      <div
        className="relative grid w-full max-w-6xl overflow-hidden rounded-3xl border border-border bg-surface md:grid-cols-[1fr_1.05fr]"
        style={{ boxShadow: '0 32px 70px rgba(15, 23, 42, 0.14)' }}
      >
        <aside className="relative m-3 flex min-h-135 flex-col justify-between overflow-hidden rounded-3xl bg-primary p-8 text-text-on-dark md:m-4 md:p-10">
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              backgroundImage:
                'linear-gradient(135deg, rgba(174, 235, 242, 0.09), transparent 45%)',
            }}
          />

          <div className="relative mx-auto mt-4 flex h-64 w-full max-w-sm items-end justify-center">
            <div className="absolute bottom-0 h-40 w-52 rounded-3xl backdrop-blur-sm" style={{ backgroundColor: 'rgba(255,255,255,0.10)' }} />
            <div className="absolute bottom-8 -left-2 h-36 w-28 rounded-t-4xl rounded-b-2xl bg-secondary" />
            <div className="absolute bottom-10 left-24 h-44 w-28 rounded-t-4xl rounded-b-2xl bg-tertiary" />
            <div className="absolute bottom-8 right-2 h-40 w-28 rounded-t-4xl rounded-b-2xl bg-secondary" />
            <div className="absolute bottom-40 -left-1 h-11 w-11 rounded-full" style={{ backgroundColor: 'rgba(255,255,255,0.90)' }} />
            <div className="absolute bottom-48 left-24 h-11 w-11 rounded-full bg-tertiary" />
            <div className="absolute bottom-40 right-0 h-11 w-11 rounded-full bg-neutral" />
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