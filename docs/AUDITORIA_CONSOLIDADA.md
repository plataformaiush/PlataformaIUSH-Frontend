# Auditoría Consolidada — PlataformaIUSH (Frontend + Backend)

**Fecha:** 24 de mayo de 2026  
**Auditor:** Arquitecto Senior Full-Stack (Cascade AI)  
**Objetivo:** Diagnóstico integrado de inconsistencias críticas entre frontend y backend

---

## Resumen Ejecutivo

### Stack Tecnológico

**Frontend:**
- React 19, TypeScript 5.7, Vite 6
- Tailwind CSS 4, Zustand (state)
- React Router v6, Axios
- Vitest (testing)

**Backend:**
- Node.js + Express 5.2.1
- PostgreSQL (driver `pg` - SIN ORM)
- JWT (`jsonwebtoken` 9.0.3) + bcryptjs
- Swagger UI

### Estado General

**🔴 CRÍTICO** — El frontend y el backend tienen inconsistencias fundamentales que impedirán la integración. Ambos proyectos tienen arquitectura sólida individualmente, pero el contrato API no está alineado.

### Top 3 Inconsistencias Críticas

1. **4 sistemas de roles en frontend vs 1 en backend** — El backend usa PascalCase español (`'SuperAdmin'`, `'Admin'`, `'Docente'`, `'Estudiante'`). El frontend tiene 4 convenciones diferentes (snake_case inglés, UPPER_CASE inglés, PascalCase mixto, minúscula español). Ninguna coincide completamente con el backend.

2. **3 keys de token en frontend vs 1 en backend** — El backend devuelve `token`. El frontend usa `'token'`, `'auth_token'`, `'access_token'` en diferentes partes. Esto causa que algunos componentes no encuentren el token.

3. **Campos faltantes en response de cursos** — El frontend espera `instructor`, `level`, `studentCount` que NO existen en el backend. El mapeo `mapCursoToCourse` deja estos campos vacíos o hardcodeados.

---

## 1. Inconsistencia #1: Roles

### Backend (La Verdad)

**Archivo:** `src/config/constants.js:1-7`

```javascript
export const ROLES = Object.freeze({
  SUPER_ADMIN: 'SuperAdmin',
  ADMIN:       'Admin',
  DOCENTE:     'Docente',
  ESTUDIANTE:  'Estudiante',
});
```

**Valores exactos en DB:** `'SuperAdmin'`, `'Admin'`, `'Docente'`, `'Estudiante'` (PascalCase español)

### Frontend (4 Sistemas Diferentes)

**Sistema 1 — domain/auth/types.ts:**
```typescript
export type UserRole = 
  | 'super_admin'   // ❌ snake_case inglés
  | 'admin'
  | 'teacher'
  | 'student'
```

**Sistema 2 — domain/shared/enums/UserRole.enum.ts:**
```typescript
export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',  // ❌ UPPER_CASE inglés
  ADMIN = 'ADMIN',
  TEACHER = 'TEACHER',
  STUDENT = 'STUDENT',
}
```

**Sistema 3 — LoginForm.tsx:48-54:**
```typescript
if (userRoles.includes("SuperAdmin")) {    // ⚠️ PascalCase mixto
  navigate("/super-admin");
} else if (userRoles.includes("Admin")) {
} else if (userRoles.includes("Estudiante")) {  // ⚠️ Español
} else if (userRoles.includes("Docente")) {
```

**Sistema 4 — RequireRole.tsx:23:**
```typescript
const hasStudentRole = userRoles.some((role) => normalizeRole(role) === 'estudiante')
// ❌ Minúscula español
```

### Análisis de Mismatch

| Sistema Frontend | SuperAdmin | Admin | Docente | Estudiante | ¿Coincide con Backend? |
|---|---|---|---|---|---|
| Backend | `'SuperAdmin'` | `'Admin'` | `'Docente'` | `'Estudiante'` | — |
| Sistema 1 | `'super_admin'` | `'admin'` | `'teacher'` | `'student'` | ❌ No |
| Sistema 2 | `'SUPER_ADMIN'` | `'ADMIN'` | `'TEACHER'` | `'STUDENT'` | ❌ No |
| Sistema 3 | `"SuperAdmin"` | `"Admin"` | `"Docente"` | `"Estudiante"` | ✅ Sí |
| Sistema 4 | — | — | — | `'estudiante'` | ❌ No |

**Conclusión:** Solo Sistema 3 coincide parcialmente, pero `RequireRole` usa Sistema 4. Un usuario con rol `'Estudiante'` del backend pasaría por `normalizeRole('Estudiante')` → `'estudiante'` y coincidiría. Pero `'Docente'` → `'docente'` no coincide con nada definido en los tipos de dominio.

### Fix Recomendado

**Opción A (Recomendada):** Estandarizar frontend a backend

1. Eliminar `domain/auth/types.ts:UserRole` (sistema 1)
2. Eliminar `domain/shared/enums/UserRole.enum.ts` (sistema 2)
3. Actualizar `RequireRole.tsx` para no normalizar a minúscula, o normalizar ambos lados
4. Usar valores exactos del backend: `'SuperAdmin'`, `'Admin'`, `'Docente'`, `'Estudiante'`

**Archivos a modificar:**
- `src/domain/auth/types.ts` (eliminar UserRole type)
- `src/domain/shared/enums/UserRole.enum.ts` (actualizar valores)
- `src/presentation/features/student/auth/components/LoginForm.tsx` (ya está correcto)
- `src/routes/guards/RequireRole.tsx` (actualizar normalización)
- `src/routes/definitions/admin.routes.ts` (actualizar allowedRoles)

---

## 2. Inconsistencia #2: Tokens

### Backend (La Verdad)

**Archivo:** `src/services/authService.js:66-70`

```javascript
return {
  token,  // ← Key es 'token'
  token_expires: expiresAt.toISOString(),
  user: sanitizeUser(updatedUser),
};
```

**Header esperado:** `Authorization: Bearer <token>`

**Payload del token JWT:**
```javascript
{
  sub: user.id,
  correo: user.correo,
  nombre: user.nombre,
  roles: user.roles,      // Array de strings
  permisos: user.permisos,
}
```

### Frontend (3 Keys Diferentes)

**Sistema 1 — presentation/services/tokenManager.ts:3-13:**
```typescript
private readonly TOKEN_KEY = "token";  // ✅ Coincide con backend
return localStorage.getItem(this.TOKEN_KEY);
```

**Sistema 2 — domain/auth/types.ts:52-58:**
```typescript
static getToken(): string | null {
  return localStorage.getItem('auth_token')  // ❌ No coincide
}
static setToken(token: string, expiresAt: Date): void {
  localStorage.setItem('auth_token', token)  // ❌ No coincide
```

**Sistema 3 — teacherApi.ts:48-54:**
```typescript
function getAuthToken() {
  return (
    localStorage.getItem("auth_token") ||   // ❌ Prioriza auth_token
    localStorage.getItem("access_token") ||
    localStorage.getItem("token") ||         // ✅ Fallback correcto
    sessionStorage.getItem("auth_token") ||
    sessionStorage.getItem("access_token") ||
    sessionStorage.getItem("token")
  );
}
```

### Análisis de Mismatch

| Sistema Frontend | Key usada | ¿Coincide con Backend? |
|---|---|---|
| Backend | `'token'` | — |
| Sistema 1 (tokenManager) | `'token'` | ✅ Sí |
| Sistema 2 (domain/auth) | `'auth_token'` | ❌ No |
| Sistema 3 (teacherApi) | `'auth_token'` (prioridad) | ❌ No |

**Problema:** 
- `LoginForm.tsx` usa `auth.store.ts` que usa `tokenManager.ts` (key `'token'`) ✅
- Pero `teacherApi.ts` busca `'auth_token'` primero, no lo encuentra, y fallback a `'token'` ⚠️
- `domain/auth/types.ts:TokenManager` nunca se usa en producción pero causa confusión

### Fix Recomendado

**Opción A (Recomendada):** Estandarizar frontend a backend

1. Eliminar `domain/auth/types.ts:TokenManager` (no se usa en producción)
2. Eliminar `domain/shared/interfaces/ITokenManager.ts:MockTokenManager` (no se usa)
3. Actualizar `teacherApi.ts` para buscar solo `'token'` (eliminar fallbacks)
4. Confirmar que todos los componentes usan `presentation/services/tokenManager`

**Archivos a modificar:**
- `src/domain/auth/types.ts` (eliminar TokenManager class)
- `src/domain/shared/interfaces/ITokenManager.ts` (eliminar MockTokenManager)
- `src/presentation/features/teacher/services/teacherApi.ts` (simplificar getAuthToken)

---

## 3. Inconsistencia #3: Campos de Cursos

### Backend (La Verdad)

**Endpoint:** `GET /api/cursos`

**Response:**
```typescript
{
  idCurso: string
  idUsuario: string
  titulo: string
  descripcion: string
  activo: boolean
  modulosCount: number
  creacion: string
  actualizacion: string
}
```

**Campos que NO existen:**
- ❌ `instructor` (solo `nombreUsuario` en endpoint de detalle)
- ❌ `level` o `nivel` (no hay columna en tabla `curso`)
- ❌ `studentCount` (no se calcula en query)

### Frontend (Lo que Espera)

**Archivo:** `src/domain/courses/types.ts:4-13`

```typescript
export interface Course {
  id: string
  title: string
  description: string
  instructor: string      // ← NO existe en backend
  level: CourseLevel      // ← NO existe en backend
  status: CourseStatus
  moduleIds: string[]
  studentCount: number    // ← NO existe en backend
}
```

### Mapeo Actual (Incompleto)

**Archivo:** `src/presentation/services/courseService.ts:20-34`

```typescript
function mapCursoToCourse(c: CursoBackend): Course {
  return {
    id: c.idCurso,
    title: c.titulo,
    description: c.descripcion,
    instructor: "",        // ← Hardcodeado vacío
    level: "beginner",     // ← Hardcodeado
    status: c.activo ? "active" : "inactive",
    moduleIds: Array.from(
      { length: c.modulosCount },
      (_, i) => `${c.idCurso}-mod-${i}`,
    ),
    studentCount: 0,       // ← Hardcodeado
  };
}
```

### Análisis de Mismatch

| Campo Frontend | Campo Backend | Estado |
|---|---|---|
| `id` | `idCurso` | ✅ Mapeado |
| `title` | `titulo` | ✅ Mapeado |
| `description` | `descripcion` | ✅ Mapeado |
| `instructor` | ❌ NO EXISTE | 🔴 Hardcodeado vacío |
| `level` | ❌ NO EXISTE | 🔴 Hardcodeado `"beginner"` |
| `status` | `activo` | ✅ Mapeado (boolean → enum) |
| `moduleIds` | `modulosCount` | ⚠️ Generado sintético |
| `studentCount` | ❌ NO EXISTE | 🔴 Hardcodeado `0` |

### Fix Recomendado

**Opción A (Backend):** Agregar campos al backend

1. Agregar columna `nivel` a tabla `curso` (migration SQL)
2. Agregar columna `instructor_nombre` o hacer JOIN con tabla `usuario` en query
3. Calcular `student_count` con COUNT de inscripciones activas

**Opción B (Frontend - Recomendada para corto plazo):** Aceptar limitaciones

1. Actualizar `Course` type para hacer `instructor`, `level`, `studentCount` opcionales
2. Actualizar UI para mostrar "N/A" cuando estos campos estén vacíos
3. Documentar que estos campos no están disponibles en el backend actual

**Opción C (Frontend - Calcular en cliente):**

1. `instructor`: Hacer fetch adicional a `/api/users/:idUsuario` para obtener nombre
2. `level`: Agregar selector en UI para asignar nivel manualmente (guardar en localStorage o tabla separada)
3. `studentCount`: Calcular contando inscripciones en frontend (requiere fetch de inscripciones)

**Archivos a modificar:**
- `src/domain/courses/types.ts` (hacer campos opcionales)
- `src/presentation/services/courseService.ts` (actualizar mapeo)
- `src/presentation/features/courses/CourseListPage.tsx` (manejar campos vacíos)

---

## 4. Inconsistencia #4: Response de Login

### Backend (La Verdad)

**Archivo:** `src/services/authService.js:66-70`

```javascript
return {
  token,
  token_expires: expiresAt.toISOString(),  // ← ISO string
  user: sanitizeUser(updatedUser),
};
```

### Frontend (Lo que Espera)

**Archivo:** `src/presentation/features/student/auth/services/authService.ts:8-17`

```typescript
interface LoginResponse {
  token: string;
  user: {
    id: string;
    correo: string;
    nombre?: string;
    roles?: string[];
  };
  expiresIn?: number;  // ← Espera número de segundos
}
```

### Análisis de Mismatch

| Campo | Backend | Frontend | Estado |
|---|---|---|---|
| `token` | ✅ Existe | ✅ Espera | ✅ OK |
| `token_expires` | ✅ ISO string | ❌ No espera | ⚠️ Ignorado |
| `expiresIn` | ❌ No existe | ✅ Espera (opcional) | ⚠️ No usado |
| `user.id` | ✅ Existe | ✅ Espera | ✅ OK |
| `user.correo` | ✅ Existe | ✅ Espera | ✅ OK |
| `user.nombre` | ✅ Existe | ✅ Espera (opcional) | ✅ OK |
| `user.roles` | ✅ Existe | ✅ Espera (opcional) | ✅ OK |

**Problema menor:** `LoginForm.tsx:39` usa `response.expiresIn || 3600` con fallback a 1 hora. Como el backend no devuelve `expiresIn`, siempre usa el fallback.

### Fix Recomendado

**Backend:** Agregar campo `expiresIn` en segundos

```javascript
return {
  token,
  token_expires: expiresAt.toISOString(),
  expiresIn: Math.floor((expiresAt.getTime() - Date.now()) / 1000),  // ← Agregar
  user: sanitizeUser(updatedUser),
};
```

**Archivos a modificar:**
- `src/services/authService.js` (backend)

---

## 5. Inconsistencia #5: Logout

### Backend

**Estado:** ❌ NO EXISTE endpoint de logout

**Problema:** No hay forma de invalidar tokens en el backend. Los tokens siguen siendo válidos hasta su expiración natural (24 horas por defecto).

### Frontend

**Archivo:** `src/presentation/features/student/auth/services/authService.ts:38-45`

```typescript
export const logoutRequest = async (): Promise<void> => {
  try {
    await axiosInstance.post(`/api/auth/logout`);  // ← Endpoint no existe
  } catch (error) {
    console.error("Error al hacer logout en servidor:", error);
  }
};
```

**Comportamiento actual:** El frontend llama al endpoint, falla, y limpia la sesión local de todas formas. El token sigue siendo válido en el backend.

### Fix Recomendado

**Backend:** Implementar logout con invalidación

**Opción A (Redis blacklist):**
- Al hacer logout, agregar token a blacklist en Redis
- Middleware de auth verifica si token está en blacklist
- Tokens expiran de blacklist automáticamente después de TTL

**Opción B (Refresh tokens):**
- Implementar refresh tokens con rotación
- Al hacer logout, invalidar refresh token
- Access tokens de corta duración (15 min)

**Archivos a modificar:**
- `src/routes/authRoutes.js` (agregar ruta POST /api/auth/logout)
- `src/controllers/authController.js` (implementar controller)
- `src/services/authService.js` (implementar lógica de invalidación)

---

## 6. Inconsistencia #6: Nombres de Campos (Idioma)

### Backend

**Usa español:** `idCurso`, `idUsuario`, `titulo`, `descripcion`, `creacion`, `actualizacion`, `activo`, `modulosCount`

### Frontend

**Usa inglés:** `id`, `title`, `description`, `creation`, `update`, `status`, `moduleIds`

### Análisis

**Estado:** ⚠️ Inconsistente pero manejable

El frontend tiene funciones de mapeo (`mapCursoToCourse`, `mapModuloToModule`, `mapContenidoToContent`) que traducen los nombres. Esto es aceptable como capa de adaptación.

**Problema:** Los mapeos están dispersos en cada servicio. Si el backend cambia un nombre, hay que actualizar múltiples archivos.

### Fix Recomendado

**Mantener mapeos pero centralizar:**

1. Crear `src/presentation/services/mappers/` con todos los mappers
2. Exportar funciones reutilizables
3. Documentar que cualquier cambio en backend requiere actualizar mappers

---

## 7. Top 3 Fixes Prioritarios

### Fix #1: Estandarizar Roles (CRÍTICO)

**Impacto:** Bloquea autorización funcional

**Esfuerzo:** 2-3 horas

**Pasos:**
1. Eliminar `domain/auth/types.ts:UserRole` type
2. Actualizar `domain/shared/enums/UserRole.enum.ts` con valores del backend
3. Actualizar `RequireRole.tsx` para no normalizar roles
4. Actualizar `admin.routes.ts` con roles correctos
5. Actualizar `LoginForm.tsx` si es necesario (ya está correcto)

**Archivos:**
- `src/domain/auth/types.ts`
- `src/domain/shared/enums/UserRole.enum.ts`
- `src/routes/guards/RequireRole.tsx`
- `src/routes/definitions/admin.routes.ts`

---

### Fix #2: Estandarizar Token Key (CRÍTICO)

**Impacto:** Bloquea autenticación en algunos componentes

**Esfuerzo:** 1-2 horas

**Pasos:**
1. Eliminar `domain/auth/types.ts:TokenManager` class
2. Eliminar `domain/shared/interfaces/ITokenManager.ts:MockTokenManager`
3. Actualizar `teacherApi.ts` para usar solo `'token'`
4. Verificar que todos los componentes usan `presentation/services/tokenManager`

**Archivos:**
- `src/domain/auth/types.ts`
- `src/domain/shared/interfaces/ITokenManager.ts`
- `src/presentation/features/teacher/services/teacherApi.ts`

---

### Fix #3: Corregir Vitest Config (CRÍTICO PARA TESTS)

**Impacto:** Desbloquea ejecución de tests

**Esfuerzo:** 5 minutos

**Pasos:**
1. Cambiar paths en `config/vitest.config.ts` de `'./src/'` a `'../src/'`
2. Agregar `InstitutionProvider` a `src/tests/helpers/renderWithProviders.tsx`

**Archivos:**
- `config/vitest.config.ts`
- `src/tests/helpers/renderWithProviders.tsx`

---

## 8. Deuda Técnica Consolidada

### Bombas de Tiempo (Producción)

1. **No hay rate limiting en login (backend)** — Vulnerable a fuerza bruta
2. **CORS sin restricciones (backend)** — Vulnerable a CSRF en producción
3. **No hay invalidación de tokens (backend)** — Tokens válidos después de logout
4. **`/archivos` sin autenticación (frontend)** — Exposición de endpoint de archivos
5. **401 sin logout automático (frontend)** — Usuario atrapado con sesión expirada

### Deuda Estructural (Mantenimiento)

1. **4 sistemas de roles (frontend)** — Mantenimiento muy difícil
2. **3 keys de token (frontend)** — Confusión y bugs
3. **Domain importando de Presentation (frontend)** — Inversión de dependencias
4. **Sin ORM (backend)** — Queries SQL manuales propensos a errores
5. **Sin tests (ambos)** — Riesgo alto de regresiones

### Deuda Cosmética

1. **Nombres de campos en español/inglés** — Confusión pero manejable con mappers
2. **Formato de fechas inconsistente** — `token_expires` vs `expiresIn`
3. **34 warnings ESLint** — Variables no usadas
4. **Console.log en producción** — `LoginForm.tsx:36`

---

## 9. Lo que Está Bien Hecho (Preservar)

### Frontend

1. ✅ **Separación de capas** — Domain, Presentation, Routes bien separados
2. ✅ **Mappers explícitos** — Traducción backend→domain en servicios
3. ✅ **TokenManager centralizado** — `presentation/services/tokenManager.ts` bien implementado
4. ✅ **Guards de autenticación** — `RequireAuth` y `RequireRole` funcionan correctamente
5. ✅ **Path aliases** — Configurados en Vite y TS
6. ✅ **InstitutionContext** — Theming dinámico bien ejecutado
7. ✅ **Optimistic updates** — En toggle de cursos con cascade
8. ✅ **Zustand stores** — `auth.store.ts` y `studentProgressStore.ts` bien diseñados

### Backend

1. ✅ **Separación de capas** — Controllers, Services, Repositories, Models bien separados
2. ✅ **Middleware de autenticación** — `authenticate` y `authMiddleware` bien implementados
3. ✅ **Guards de roles** — `authorize` con verificación de roles funciona
4. ✅ **Soft deletes** — Implementados con columna `eliminacion`
5. ✅ **Parameterized queries** — Prevención de SQL injection
6. ✅ **Swagger documentation** — Documentación de API disponible
7. ✅ **Vistas materializadas** — Optimización de queries complejas
8. ✅ **Hash de passwords** — bcryptjs para hashing seguro

---

## 10. Roadmap de Correcciones

### Fase 1: Desbloquear Integración (1 semana)

- [ ] Fix #1: Estandarizar roles
- [ ] Fix #2: Estandarizar token key
- [ ] Fix #3: Corregir vitest config
- [ ] Actualizar mapeo de cursos (hacer campos opcionales)
- [ ] Configurar CORS con orígenes específicos (backend)

### Fase 2: Estabilizar (2 semanas)

- [ ] Implementar rate limiting (backend)
- [ ] Implementar logout con invalidación (backend)
- [ ] Mover `/archivos` dentro de RequireAuth (frontend)
- [ ] Implementar 401 con logout automático (frontend)
- [ ] Agregar `InstitutionProvider` a renderWithProviders

### Fase 3: Mejorar (1 mes)

- [ ] Implementar tests de integración (ambos)
- [ ] Implementar validación centralizada (backend)
- [ ] Implementar sanitización de XSS (backend)
- [ ] Mover repositorios mock a infrastructure (frontend)
- [ ] Implementar paginación en CourseListPage (frontend)

### Fase 4: Optimizar (2-3 meses)

- [ ] Considerar ORM para backend (TypeORM o Prisma)
- [ ] Implementar useCourseStore con Zustand (frontend)
- [ ] Implementar drag & drop para reordenar (frontend)
- [ ] Implementar CI/CD para ambos proyectos
- [ ] Monitoreo y logging centralizado

---

## 11. Conclusión

El frontend y el backend de PlataformaIUSH tienen arquitecturas sólidas individualmente, pero presentan inconsistencias críticas en el contrato API que impedirán una integración exitosa.

Los problemas más urgentes son:
1. Inconsistencia de nombres de roles (4 sistemas en frontend vs 1 en backend)
2. Inconsistencia de keys de token (3 sistemas en frontend vs 1 en backend)
3. Campos faltantes en response de cursos (instructor, level, studentCount)

Estos problemas deben resolverse antes de intentar la integración. Una vez resueltos, ambos proyectos están en buen estado para soportar la aplicación.

**Estado general:** 🔴 **CRÍTICO pero corregible con esfuerzo moderado**

**Estimación de esfuerzo para desbloquear integración:** 1 semana (1 desarrollador senior)

**Estimación de esfuerzo para estabilizar:** 3-4 semanas (1-2 desarrolladores)

---

**Fin del reporte consolidado**
