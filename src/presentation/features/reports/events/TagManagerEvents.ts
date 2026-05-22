//Acá se coloca toda la lógica de los eventos vinculados al tag manager.

declare global {
  interface Window {
    dataLayer: Record<string, unknown>[];
  }
}

const enviarDataLayer = (payload: Record<string, unknown>) => {
  if (typeof window === "undefined") return;

  window.dataLayer = window.dataLayer || [];

  try {
    window.dataLayer.push(payload);
  } catch (err) {
    console.warn("GTM push failed:", err);
  }
};

// 1. Iniciar Sesión
export const trackIniciarSesion = (rolName: string) => {
  enviarDataLayer({
    event: "iniciar_sesion",
    categoria: "login",
    etiqueta: "modulo2",
    nombre_rol: rolName,
  });
};

// 2. Rol más usado
export const trackRolMasUsado = (rolName: string) => {
  enviarDataLayer({
    event: "rol_mas_usado",
    categoria: "login",
    etiqueta: "modulo2",
    nombre_rol: rolName,
  });
};

// 3. Iniciar Curso
export const trackIniciarCurso = (courseName: string) => {
  enviarDataLayer({
    event: "iniciar_curso",
    categoria: "curso",
    etiqueta: "modulo23",
    nombre_curso: courseName,
  });
};

// 4. Iniciar modulo
export const trackIniciarModulo = (courseName: string, moduleName: string) => {
  enviarDataLayer({
    event: "iniciar_modulo",
    categoria: "curso",
    etiqueta: "modulo_1",
    nombre_curso: courseName,
    nombre_modulo: moduleName,
  });
};

// 5. Curso Completado
export const trackCursoCompletado = (courseName: string) => {
  enviarDataLayer({
    event: "curso_completado",
    categoria: "curso",
    etiqueta: "modulo_1",
    nombre_curso: courseName,
  });
};

// 6. Certificado Obtenido
export const trackCertificadoObtenido = (courseName: string) => {
  enviarDataLayer({
    event: "certificado_obtenido",
    categoria: "curso",
    etiqueta: "curso_react",
    nombre_curso: courseName,
  });
};
