import { useForm } from "react-hook-form";
import { loginRequest } from "../services/authService";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuthStore } from "../../../../stores/auth.store";

type LoginData = {
  correo: string;
  contrasena: string;
};

export default function LoginForm() {
  const navigate = useNavigate();
  const [errorMsg, setErrorMsg] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { setUser, setLoading, setError } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginData>();

  const onSubmit = async (data: LoginData) => {
    try {
      setLoading(true);
      setErrorMsg("");
      setError("");

      const response = await loginRequest(data);

      console.log("LOGIN OK:", response);

      // Guarda el token y usuario en el store y localStorage
      const expiresIn = response.expiresIn || 3600; // 1 hora por defecto
      setUser(response.user, response.token, expiresIn);

      // Redirige según el rol del usuario
      const userRoles = response.user.roles || [];
      
      if (userRoles.includes("SuperAdmin") || userRoles.includes("Admin")) {
        navigate("/super-admin");
      } else if (userRoles.includes("Estudiante")) {
        navigate("/student");
      } else {
        const rolesText = userRoles.length > 0 ? userRoles.join(", ") : "ninguno";
        const errorMessage = `No hay vista disponible para los roles: ${rolesText}`;
        setErrorMsg(errorMessage);
        setError(errorMessage);
        // Limpiar el usuario si no tiene vista disponible
        setTimeout(() => {
          setUser({ id: "", correo: "" }, "", 0);
          navigate("/login");
        }, 2000);
      }
    } catch (error) {
      console.error("Error login:", error);
      const errorMessage = "Credenciales incorrectas o error del servidor";
      setErrorMsg(errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-3xl bg-transparent px-2 md:px-4">
      <div className="mb-8">
        <h2 className="text-4xl font-bold tracking-tight text-primary">
          Bienvenido
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Inicia sesión para acceder a tus cursos, seguir tu progreso y descubrir nuevas oportunidades de aprendizaje con nosotros.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        
        {/* ERROR GENERAL */}
        {errorMsg && (
          <div className="rounded-lg bg-tertiary text-primary text-sm p-2 text-center border border-primary/40">
            {errorMsg}
          </div>
        )}

        {/* CORREO */}
        <div>
          <label className="mb-2 block text-sm font-medium text-primary">
            Correo electrónico
          </label>
          <input
            type="email"
            placeholder="Ingresa tu correo electrónico"
            {...register("correo", {
              required: "El correo es obligatorio",
            })}
            className="w-full rounded-xl border border-primary/50 bg-white px-4 py-3 text-sm text-primary outline-none transition placeholder:text-muted-foreground/70 focus:border-primary focus:ring-2 focus:ring-tertiary"
          />
          {errors.correo && (
            <p className="mt-1 text-sm text-primary">
              {errors.correo.message}
            </p>
          )}
        </div>

        {/* CONTRASEÑA */}
        <div>
          <label className="mb-2 block text-sm font-medium text-primary">
            Contraseña
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Ingresa tu contraseña"
              {...register("contrasena", {
                required: "La contraseña es obligatoria",
              })}
              className="w-full rounded-xl border border-primary/50 bg-white px-4 py-3 pr-24 text-sm text-primary outline-none transition placeholder:text-muted-foreground/70 focus:border-primary focus:ring-2 focus:ring-tertiary"
            />
            <button
              type="button"
              onClick={() => setShowPassword((current) => !current)}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg px-3 py-1 text-xs font-semibold text-primary transition hover:bg-tertiary"
            >
              {showPassword ? "Ocultar" : "Mostrar"}
            </button>
          </div>
          {errors.contrasena && (
            <p className="mt-1 text-sm text-primary">
              {errors.contrasena.message}
            </p>
          )}
        </div>

        {/* DIVIDER */}
        <div className="flex items-center gap-3 py-1 text-xs text-muted-foreground">
          <div className="h-px flex-1 bg-tertiary" />
          <span>o</span>
          <div className="h-px flex-1 bg-tertiary" />
        </div>

        {/* boton */}
        <button
          type="submit"
          className="w-full rounded-xl bg-primary py-3 text-sm font-semibold text-white transition hover:bg-primary/90 disabled:opacity-50"
          disabled={false}
        >
          Iniciar sesión
        </button>
      </form>
    </div>
  );
}