// Este componente es solo un ejemplo para mostrar que se reconoce el rol del usuario después de iniciar sesión. Puedes personalizarlo según tus necesidades

export default function RolePage() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const rol = user?.roles?.[0] || "Sin rol";

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#AEEBF2] px-4 py-10">
      <div className="pointer-events-none absolute -left-16 top-12 h-64 w-64 rounded-full bg-[#5A878C] opacity-30 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-16 right-8 h-72 w-72 rounded-full bg-[#223740] opacity-25 blur-3xl" />

      <div className="relative w-full max-w-xl rounded-4xl border border-[#5A878C]/30 bg-white p-10 text-center shadow-[0_24px_50px_rgba(34,55,64,0.22)] md:p-12">
        <h1 className="text-3xl font-bold text-[#223740] md:text-4xl">
          Bienvenido
        </h1>
        <p className="mt-3 text-sm text-[#5A878C]">
          Tu rol actual en la plataforma es:
        </p>

        <div className="mx-auto mt-6 inline-flex items-center rounded-full border border-[#5A878C]/30 bg-[#AEEBF2] px-8 py-3">
          <span className="text-xl font-semibold text-[#223740] md:text-2xl">
            {rol}
          </span>
        </div>
      </div>
    </div>
  );
}