import LoginForm from "../components/LoginForm";

export default function LoginPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#AEEBF2] px-4 py-10 md:px-8">
      <div className="pointer-events-none absolute -left-20 top-12 h-72 w-72 rounded-full bg-[#5A878C] opacity-35 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-16 right-4 h-72 w-72 rounded-full bg-[#223740] opacity-35 blur-3xl" />

      <div className="relative grid w-full max-w-6xl overflow-hidden rounded-4xl border border-[#5A878C]/25 bg-white shadow-[0_32px_60px_rgba(34,55,64,0.24)] md:grid-cols-[1fr_1.05fr]">
        <aside className="relative m-3 flex min-h-135 flex-col justify-between overflow-hidden rounded-3xl bg-[#223740] p-8 text-white md:m-4 md:p-10">

          <div className="relative mx-auto mt-4 flex h-64 w-full max-w-sm items-end justify-center">
            <div className="absolute bottom-0 h-40 w-52 rounded-3xl bg-white/12 backdrop-blur-sm" />
            <div className="absolute bottom-8 -left-2 h-36 w-28 rounded-t-4xl rounded-b-2xl bg-[#5A878C]" />
            <div className="absolute bottom-10 left-24 h-44 w-28 rounded-t-4xl rounded-b-2xl bg-[#AEEBF2]" />
            <div className="absolute bottom-8 right-2 h-40 w-28 rounded-t-4xl rounded-b-2xl bg-[#5A878C]" />
            <div className="absolute bottom-40 -left-1 h-11 w-11 rounded-full bg-white/90" />
            <div className="absolute bottom-48 left-24 h-11 w-11 rounded-full bg-[#AEEBF2]" />
            <div className="absolute bottom-40 right-0 h-11 w-11 rounded-full bg-[#060A0D]" />
          </div>

          <div className="max-w-sm">
            <h1 className="text-4xl font-bold leading-tight text-white/95 md:text-[2.7rem]">
                Bienvenido a la plataforma de aprendizaje
            </h1>
            <p className="mt-4 text-sm text-white/80 md:text-base">
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