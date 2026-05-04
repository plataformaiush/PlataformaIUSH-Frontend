import { useForm } from "react-hook-form";
import { loginRequest } from "../services/authService";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

type LoginData = {
  correo: string;
  contrasena: string;
};

export default function LoginForm() {
  const navigate = useNavigate();
  const [errorMsg, setErrorMsg] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginData>();

  const onSubmit = async (data: LoginData) => {
    try {
      const response = await loginRequest(data);

      console.log("LOGIN OK:", response);

      localStorage.setItem("token", response.token);
      localStorage.setItem("user", JSON.stringify(response.user));

      //redireccion
      navigate("/role");

    } catch (error) {
      console.error("Error login:", error);
      setErrorMsg("Credenciales incorrectas o error del servidor");
    }
  };

  return (
    <div className="rounded-3xl bg-transparent px-2 md:px-4">
      <div className="mb-8">
        <h2 className="text-4xl font-bold tracking-tight text-[#223740]">
          Bienvenido
        </h2>
        <p className="mt-2 text-sm text-[#5A878C]">
          Inicia sesión para acceder a tus cursos, seguir tu progreso y descubrir nuevas oportunidades de aprendizaje con nosotros.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        
        {/* ERROR GENERAL */}
        {errorMsg && (
          <div className="rounded-lg bg-[#AEEBF2] text-[#223740] text-sm p-2 text-center border border-[#5A878C]/40">
            {errorMsg}
          </div>
        )}

        {/* CORREO */}
        <div>
          <label className="mb-2 block text-sm font-medium text-[#223740]">
            Correo electrónico
          </label>
          <input
            type="email"
            placeholder="Ingresa tu correo electrónico"
            {...register("correo", {
              required: "El correo es obligatorio",
            })}
            className="w-full rounded-xl border border-[#5A878C]/50 bg-white px-4 py-3 text-sm text-[#223740] outline-none transition placeholder:text-[#5A878C]/70 focus:border-[#5A878C] focus:ring-2 focus:ring-[#AEEBF2]"
          />
          {errors.correo && (
            <p className="mt-1 text-sm text-[#223740]">
              {errors.correo.message}
            </p>
          )}
        </div>

        {/* CONTRASEÑA */}
        <div>
          <label className="mb-2 block text-sm font-medium text-[#223740]">
            Contraseña
          </label>
          <input
            type="password"
            placeholder="Ingresa tu contraseña"
            {...register("contrasena", {
              required: "La contraseña es obligatoria",
            })}
            className="w-full rounded-xl border border-[#5A878C]/50 bg-white px-4 py-3 text-sm text-[#223740] outline-none transition placeholder:text-[#5A878C]/70 focus:border-[#5A878C] focus:ring-2 focus:ring-[#AEEBF2]"
          />
          {errors.contrasena && (
            <p className="mt-1 text-sm text-[#223740]">
              {errors.contrasena.message}
            </p>
          )}
        </div>

        {/* DIVIDER */}
        <div className="flex items-center gap-3 py-1 text-xs text-[#5A878C]">
          <div className="h-px flex-1 bg-[#AEEBF2]" />
          <span>o</span>
          <div className="h-px flex-1 bg-[#AEEBF2]" />
        </div>

        {/* boton */}
        <button
          type="submit"
          className="w-full rounded-xl bg-[#223740] py-3 text-sm font-semibold text-white transition hover:bg-[#5A878C]"
        >
          Iniciar sesión
        </button>
      </form>
    </div>
  );
}