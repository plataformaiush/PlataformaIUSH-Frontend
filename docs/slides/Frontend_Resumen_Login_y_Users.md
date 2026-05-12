# Diapositivas: Resumen Frontend — Autenticación y Gestión de Usuarios

---

## 1. Portada
- Proyecto: PlataformaIUSH-Frontend
- Tema: Flujo de login, manejo de token y gestión de usuarios
- Autor: Santi

---

## 2. Objetivos de la presentación
- Entender dónde y cómo se guarda el token.
- Mostrar el flujo completo de autenticación.
- Explicar la gestión de usuarios (listar, crear, roles).
- Preparar respuestas a preguntas técnicas puntuales.

---

## 3. Estructura general del frontend
- Punto de entrada: `App.tsx` → `AppRouter`.
- Rutas principales: `/` y `/login` (Login), `/dashboard`, `/users`.
- Carpetas clave: `presentation/features/...`, `presentation/services`, `presentation/stores`.

---

## 4. Login — componentes y archivos
- `LoginPage` — layout y diseño de la pantalla de acceso.
- `LoginForm` — formulario, validaciones (`react-hook-form`) y manejo de errores.
- `authService.loginRequest` — realiza `POST /api/auth/login`.

---

## 5. Dónde se guarda el token
- `tokenManager.setToken(token, expiresIn)` guarda en `localStorage`:
  - `token` (clave `token`)
  - `token_expires` (fecha ISO)
  - `user` (clave `user`, JSON)
- Archivo: [src/presentation/services/tokenManager.ts](src/presentation/services/tokenManager.ts#L1-L240)

---

## 6. Cómo se añade el token a cada petición
- `axiosInterceptor` añade `Authorization: Bearer <token>` en el interceptor de `request` usando `tokenManager.getToken()`.
- Si una respuesta es `401`, el interceptor limpia sesión y navega a `/login` sin recargar (pushState + popstate).
- Archivo: [src/presentation/services/axiosInterceptor.ts](src/presentation/services/axiosInterceptor.ts#L1-L220)

---

## 7. Estado de autenticación (store)
- `auth.store` coordina: `setUser`, `logout`, `getInitialAuth`.
- `setUser(user, token, expiresIn)` llama internamente a `tokenManager.setToken` y `tokenManager.setUser`.
- Permite que la app restablezca sesión al recargar si el token no está expirado.
- Archivo: [src/presentation/stores/auth.store.ts](src/presentation/stores/auth.store.ts#L1-L140)

---

## 8. Gestión de usuarios (UI y servicios)
- `UserManagementPage` — lista usuarios, filtro por nombre, eliminar, formulario de creación.
- `userManagementService` — `getRoles()`, `getUsers()`, `createUser(payload)`.
- Endpoints usados: `GET /api/roles`, `GET /api/users`, `POST /api/users`.

---

## 9. Flujo completo (resumen paso a paso)
1. Usuario envía `LoginForm` → `authService.loginRequest`.
2. Si OK: recibe `{ token, user, expiresIn }` → `auth.store.setUser`.
3. `setUser` → `tokenManager.setToken` y `tokenManager.setUser` (persistencia local).
4. Navegación a `/dashboard`.
5. En peticiones futuras, `axiosInterceptor` añade el header con el token.
6. Si backend responde `401`, interceptor hace `logout()` y redirige a `/login` (sin recarga completa).

---

## 10. Preguntas frecuentes (respuestas preparadas)
- ¿Dónde guardas el token? → En `localStorage` desde `tokenManager.setToken`.
- ¿Cómo invalidas o compruebas expiración? → `tokenManager.isTokenExpired()` lee `token_expires`.
- ¿Qué añade el header Authorization? → `axiosInterceptor` en el request interceptor.
- ¿Cómo muestras error de login? → `LoginForm` captura el error y muestra `errorMsg` en la UI.
- ¿Por qué a veces se redirige a `/login`? → El interceptor detecta `401`, ejecuta `logout()` y redirige.

---

## 11. Cómo demostrar en vivo
- 1) Abrir la app y tratar de loguear con credenciales inválidas → observar `errorMsg` en `LoginForm`.
- 2) Loguear con usuario válido → inspeccionar `localStorage` para `token` y `token_expires`.
- 3) Hacer una petición a `/api/users` (con token) → ver listado en `UserManagementPage`.

---

## 12. Recursos y archivos clave (para mostrar rápido)
- `LoginForm`: [src/presentation/features/student/auth/components/LoginForm.tsx](src/presentation/features/student/auth/components/LoginForm.tsx#L1-L200)
- `authService`: [src/presentation/features/student/auth/services/authService.ts](src/presentation/features/student/auth/services/authService.ts#L1-L120)
- `tokenManager`: [src/presentation/services/tokenManager.ts](src/presentation/services/tokenManager.ts#L1-L240)
- `axiosInterceptor`: [src/presentation/services/axiosInterceptor.ts](src/presentation/services/axiosInterceptor.ts#L1-L220)
- `UserManagementPage`: [src/presentation/features/student/auth/pages/UserManagementPage.tsx](src/presentation/features/student/auth/pages/UserManagementPage.tsx#L1-L200)

---

## 13. Siguientes pasos sugeridos
- Añadir mensajes más explícitos para errores del backend (p. ej. "Usuario no existe").
- Exportar estas diapositivas a PDF o presentador (Marp / Reveal) si las necesitas para la defensa.

---

*Archivo generado: docs/slides/Frontend_Resumen_Login_y_Users.md*
