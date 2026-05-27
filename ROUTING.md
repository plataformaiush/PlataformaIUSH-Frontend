# Rutas — Guía paso a paso

Este documento explica cómo funcionan las rutas en este proyecto y muestra pasos concretos para añadir, combinar y probar rutas por equipo.

Resumen rápido
- Las rutas por módulo se colocan en `src/routes/definitions/*.routes.ts` y exportan un `RouteObject[]` (p. ej. `export const authRoutes`).
- `src/routes/definitions/index.ts` centraliza todas las rutas en `allRoutes`.
- `src/routes/AppRouter.tsx` crea el router con `createBrowserRouter(allRoutes)` y monta `RouterProvider`.

Cambios realizados
------------------
- Se actualizó `src/routes/definitions/vista-estudiante.routes.ts` para agrupar todas las rutas de estudiante bajo un `StudentLayout`.
- Con esto el `StudentSidebar`, `StudentHeader` y `StudentBottomNav` se muestran únicamente en rutas que empiecen con `/student`.

Contenido actualizado de `vista-estudiante.routes.ts` (ejemplo):

```ts
import { createElement } from 'react'
import { RouteObject } from 'react-router-dom'
import { StudentLayout } from '../../presentation/features/student/layout/StudentLayout'
import { StudentDashboardPage } from '../../presentation/features/student/dashboard/StudentDashboardPage'
import { CourseMapPage } from '../../presentation/features/student/course-map/CourseMapPage'
import { StudentGradesPage } from '../../presentation/features/student/grades/StudentGradesPage'

export const vistaEstudiantesRutas: RouteObject[] = [
  {
    path: '/student',
    element: createElement(StudentLayout),
    children: [
      { index: true, element: createElement(StudentDashboardPage) },
      { path: 'dashboard', element: createElement(StudentDashboardPage) },
      { path: 'courses/:courseId', element: createElement(CourseMapPage) },
      { path: 'grades', element: createElement(StudentGradesPage) },
    ],
  },
]
```

Paso a paso: crear y habilitar rutas para tu módulo

1) Crear archivo de rutas del módulo

  - Ruta: `src/routes/definitions/{mi-modulo}.routes.ts`
  - Convención: exportar `const <module>Routes: RouteObject[]`.

  Ejemplo (plantilla mínima):

  ```ts
  // src/routes/definitions/course.routes.ts
  import { createElement } from 'react'
  import { RouteObject } from 'react-router-dom'
  import CourseListPage from '../../presentation/features/courses/pages/CourseListPage'
  import CourseDetailPage from '../../presentation/features/courses/pages/CourseDetailPage'

  export const courseRoutes: RouteObject[] = [
    { path: '/courses', element: createElement(CourseListPage) },
    { path: '/courses/:id', element: createElement(CourseDetailPage) },
  ]
  ```

2) Registrar tu módulo en el agregador

  - Edita `src/routes/definitions/index.ts` e importa tu `courseRoutes`.
  - Añádelo al array `allRoutes` usando spread: `...courseRoutes`.

  Ejemplo:

  ```ts
  import { authRoutes } from './auth.routes'
  import { courseRoutes } from './course.routes'

  export const allRoutes: RouteObject[] = [
    ...authRoutes,
    ...courseRoutes,
  ]
  ```

3) Verificar montaje del router

  - `src/routes/AppRouter.tsx` debe crear el router y montar `RouterProvider`:

  ```ts
  import { createBrowserRouter, RouterProvider } from 'react-router-dom'
  import { allRoutes } from './definitions'

  const router = createBrowserRouter(allRoutes)
  export const AppRouter = () => <RouterProvider router={router} />
  ```

  - IMPORTANTE: Si usas `RouterProvider`, NO envuelvas la app también con `<BrowserRouter>` en `main.tsx`.

4) Añadir rutas protegidas (guard) — patrón sencillo

  - Crear guard en `src/presentation/guards/AuthGuard.tsx`:

  ```tsx
  import { Navigate } from 'react-router-dom'
  import { TokenManager } from '../../../domain/auth/types'

  export function AuthGuard({ children }: { children: React.ReactNode }) {
    if (!TokenManager.getToken()) return <Navigate to="/" replace />
    return <>{children}</>
  }
  ```

  - Usarlo en rutas:

  ```ts
  { path: '/admin', element: createElement(() => <AuthGuard><AdminPage/></AuthGuard>) }
  ```

5) Probar localmente

  - Instalar dependencias y comprobar tipos:
    ```powershell
    npm ci
    npm run type-check
    npm run lint
    ```
  - Iniciar dev server y probar URLs en el navegador (Vite mostrará la URL):
    ```powershell
    npm run dev
    ```
  - Rutas a probar en esta app de ejemplo:
    - `/` → Login
    - `/role` → RolePage
    - `/student/dashboard` → Student Dashboard

Consejos y buenas prácticas

- Cada equipo modifica solo su carpeta (`domain/` + `presentation/features/<team>/` + `routes/definitions/<team>.routes.ts`).
- No pases `key` como prop; úsalo solo en JSX: `<Component key={id} ... />`.
- Usa `createElement(Componente)` o `element: <Componente />` en `RouteObject`.
- Si el editor no resuelve `@presentation/...`, crea `tsconfig.json` en la raíz que extienda `config/tsconfig.json` y reinicia el TS server.

Ejemplo rápido: añadir rutas para un nuevo equipo

1. Crear `src/routes/definitions/newteam.routes.ts` con `export const newteamRoutes`.
2. Importar y añadir `...newteamRoutes` en `src/routes/definitions/index.ts`.
3. Añadir páginas en `src/presentation/features/newteam/pages/` y exportarlas.

Soporte para tests

- En tests de componentes usa `src/tests/helpers/renderWithProviders.tsx` para inyectar `BrowserRouter` y `QueryClient`.
- Para tests de routing avanzados usa `createMemoryRouter` y `RouterProvider` dentro de tus tests.

Fin
