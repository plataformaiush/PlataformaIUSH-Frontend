# AGENTS.md — Guía para agentes de código

Propósito: ayudar a agentes AI a ser productivos rápidamente en este repositorio describiendo arquitectura, flujos clave, convenciones y comandos de verificación.

Checklist rápido
- Instalar dependencias: `npm ci`
- Levantar dev server: `npm run dev` (o `npm run dev:fast`)
- Ejecutar tests: `npm run test` (usar `renderWithProviders` para componentes)
- No tocar carpetas de otros equipos; seguir separación domain vs presentation

Resumen arquitectural (big picture)
- Tech: React + TypeScript + Vite, React Router v7, @tanstack/react-query, zustand, axios, Tailwind.
- Separación por capas y equipos: `src/domain/*` (tipos y reglas), `src/presentation/*` (UI, stores), `src/routes/*` (navegación).
- Equipo-responsabilidad: cada equipo trabaja exclusivamente en su carpeta (ver `README.md` tablas).

Comandos esenciales (PowerShell, en la raíz del proyecto)
- npm ci
- npm run dev
- npm run dev:fast
- npm run build
- npm run build:fast
- npm run preview
- npm run test
- npm run test:coverage
- npm run test:ui
- npm run lint
- npm run lint:fix
- npm run format
- npm run format:check
- npm run type-check

Puntos de integración y reglas específicas
- Path aliases: importar usando `@domain/*`, `@presentation/*`, `@routes/*`, `@tests/*`, etc. (configurados en `config/vite.config.ts`). Evita rutas relativas largas como `../../../domain/...`.
- Rutas: añadir rutas por equipo en `src/routes/definitions/*.routes.ts`. Ejemplo: `src/routes/definitions/auth.routes.ts` (exporta RouteObject[]).
- Auth: la lógica de token está en `src/domain/auth/types.ts` (class TokenManager). Ejemplo:
  - TokenManager usa localStorage key `auth_token` y `refresh_token` (método: `getToken()` → `localStorage.getItem('auth_token')`).
  - Atención: `src/presentation/features/student/auth/components/LoginForm.tsx` actualmente guarda `localStorage.setItem('token', response.token)` (clave distinta). Agents deben preferir usar TokenManager o armonizar las claves.
- Servicios HTTP: clientes y llamadas están en `src/presentation/features/**/services/*`. Dos patrones:
  - Axios con interceptores: `src/presentation/features/student/auth/services/authService.ts` (automatic Bearer token, 401 handling).
  - Fetch manual: `src/presentation/features/teacher/services/teacherApi.ts` (direct API calls con token en headers).
  - Preferir variable de entorno VITE_API_BASE_URL o usar proxy `/api` en dev server (redirige a `http://localhost:3000`).
- Contextos React: `InstitutionContext` (en `src/context/`) maneja configuración y personalización por institución (logo, colores, temas). Úsalo con `useInstitution()` para acceder a datos globales.

Estado y fetch
- Estado global: `zustand` stores bajo `src/presentation/stores` (naming `*.store.ts`). Ejemplo: `auth.store.ts` gestiona autenticación.
- Contextos React: `src/context/` para estado compartido (InstitutionContext, UsersViewPreferenceContext). Úsalos con hooks personalizados como `useInstitution()`.
- Data fetching: TanStack Query; tests crean QueryClient con opciones para test en `src/tests/helpers/renderWithProviders.tsx` (retry: false, gcTime: 0). Usar `renderWithProviders` en tests para inyectar QueryClient + Router.

Testing & Mocks
- MSW está incluido (`msw`) y se espera un setup en `src/tests/setup.ts` y `src/tests/mocks`.
- Para tests de componentes usar `renderWithProviders` (ejemplo en `src/tests/helpers/renderWithProviders.tsx`).
- Comando interactivo de tests: `npm run test:ui`.

Convenciones de modificación (reglas para agentes)
- Modifica `presentation` para UI/ stores; modifica `domain` solo para tipos y reglas de negocio.
- No importar implícitamente de otras carpetas de equipo — usar interfaces compartidas (`src/domain/shared/interfaces`).
- Mantener TypeScript estricto y pasar `npm run type-check` antes de proponer cambios.
- Ejecutar `npm run lint` y `npm run format` localmente.

Ejemplos cortos y referencias (copiar si necesitas reproducir comportamiento)
- TokenManager (token keys): `src/domain/auth/types.ts`
- LoginForm flow (guarda token en localStorage y navega a `/role`): `src/presentation/features/student/auth/components/LoginForm.tsx` (línea relevante: `localStorage.setItem("token", response.token)`)
- Auth HTTP call (axios): `src/presentation/features/student/auth/services/authService.ts` (`axios.post(`${API_URL}/api/auth/login`, data)`)
- Teacher API (fetch): `src/presentation/features/teacher/services/teacherApi.ts` (patrón con fetch y token manual)
- InstitutionContext usage: `src/context/InstitutionContext.tsx` (gestiona logo, colores, temas por institución)
- Test provider: `src/tests/helpers/renderWithProviders.tsx` (QueryClientProvider + BrowserRouter)
- Path aliases: usar `@domain`, `@presentation`, `@routes`, `@tests`, etc. en imports (ej: `import { Something } from '@domain/auth/types'`)

Troubleshooting rápido
- Si autenticación falla → comprobar keys en localStorage (`auth_token` vs `token`) y endpoint `API_URL`.
- Si build falla → ejecutar `npm run type-check` y revisar `config/tsconfig.json`.
- Si tests fallan por queries → verificar que `renderWithProviders` haya sido usado y que MSW handlers estén activos.

Qué extraer para PRs y mensajes de commit
- Incluir: archivo(s) modificados, motivo técnico, pasos para reproducir localmente (comandos), y checks realizados (`type-check`, `lint`, `test`).

Dónde buscar más contexto
- `README.md` (root) — guía de equipo y scripts
- `ROUTING.md` — cómo configurar y agregar rutas por equipo
- `GUIA_AUTENTICACION.md` y `AUTENTICACION_REFERENCIA.md` — flujo de login y token
- `config/*.ts` — tsconfig, vite (incluyendo path aliases), eslint, vitest settings
- `src/routes/*`, `src/domain/*`, `src/presentation/*` — código principal

Fin de AGENTS.md — mantén la guía corta y actualiza si la estructura cambia.
