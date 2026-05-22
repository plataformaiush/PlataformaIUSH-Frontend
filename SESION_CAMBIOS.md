# Registro de sesión — Integración y fixes del módulo de cursos

---

## Rama de trabajo

| Rama | Descripción |
|------|-------------|
| `feature/Equipo1-gestion-cursos` | Rama original del Equipo 1 |
| `feature/Equipo1-gestion-cursos-integrated` | Rama integrada con cambios de múltiples equipos |
| `feature/Equipo1-gestion-cursos-fix` | **Rama activa** — merge + todos los fixes aplicados |

---

## Cambios aplicados

### 1. Merge de `integrated` → nueva rama `fix`

```bash
git checkout feature/Equipo1-gestion-cursos && git pull
git checkout -b feature/Equipo1-gestion-cursos-fix
git merge feature/Equipo1-gestion-cursos-integrated --no-edit
```

El merge trajo: vista estudiante, docente, admin, superadmin, reportes, guards de rutas, contextos, servicios de API, sidebar/header globales.

---

### 2. `src/presentation/lib/axios.ts` — fix de autenticación

**Problema:** Usaba `TokenManager` estático de `domain/auth/types.ts` (clave `'auth_token'`) pero el login guarda el token con clave `'token'`. Todos los requests salían sin `Authorization`.

**Fix:** Cambiar a `tokenManager` instancia de `services/tokenManager.ts` (clave `'token'`). Usar `baseURL: "http://localhost:3000/api"` absoluta (el backend tiene el prefijo `/api` en sus rutas — el proxy de Vite lo quitaría).

```ts
import { tokenManager } from "../services/tokenManager";
// baseURL: "http://localhost:3000/api"
// interceptor: tokenManager.getToken() → Authorization: Bearer ${token}
```

---

### 3. `src/domain/courses/types.ts` — recreado

Eliminado por el merge de `integrated`. Rompía ~15 imports en todo el módulo de cursos.

```ts
export type CourseLevel = 'beginner' | 'intermediate' | 'advanced'
export type CourseStatus = 'active' | 'inactive'
export interface Course { id, title, description, instructor, level, status, moduleIds, studentCount }
```

---

### 4. `src/domain/modules/types.ts` — recreado (carpeta completa)

La carpeta `src/domain/modules/` fue eliminada por el merge. Rompía ~13 imports.

```ts
export type ModuleStatus = 'active' | 'inactive'
export interface Module { id, courseId, title, description, order, status, contentIds }
```

---

### 5. `src/presentation/features/courses/CreateCoursePage.tsx` — fix `id_usuario`

**Problema:** `id_usuario` hardcodeado como `'00000000-0000-0000-0000-000000000001'`. El backend valida FK en la BD y rechazaba la creación.

**Fix:** Leer `user.id` del `useAuthStore`.

```ts
const { user } = useAuthStore()
// ...
const idUsuario = user?.id
if (!idUsuario) throw new Error('Usuario no autenticado')
```

---

### 6. Rutas rotas — 5 archivos corregidos

Todas navegaban a rutas inexistentes (con `/modules` o `/contents` de más).

| Archivo | Ruta incorrecta | Ruta correcta |
|---------|----------------|---------------|
| `CourseListPage.tsx` | `/courses/${id}/modules` | `/courses/${id}` |
| `ContentListPage.tsx` (link volver) | `/courses/${id}/modules` | `/courses/${id}` |
| `AddContentPage.tsx` (header link) | `/courses/${id}/modules/${mid}/contents` | `/courses/${id}/modules/${mid}` |
| `AddContentPage.tsx` (botón cancelar) | `/courses/${id}/modules/${mid}/contents` | `/courses/${id}/modules/${mid}` |
| `ModuleCard.tsx` (nombre + botón ver) | `/courses/${id}/modules/${mid}/contents` | `/courses/${id}/modules/${mid}` |

---

### 7. Backend `src/middleware/auth.js` — fix JWT real

**Problema:** El middleware usaba `MOCK_TOKENS` (diccionario de tokens hardcodeados). Los endpoints de cursos, módulos y contenidos rechazaban cualquier JWT real con 401.

**Afectaba 8 rutas:** curso, modulo, contenido, grades, progreso, certificados, adminDashboard, evaluaciones.

**Fix:** Reemplazar lookup por verificación JWT real con `jsonwebtoken`.

```js
import jwt from 'jsonwebtoken';
import { readJwtConfig } from '../config/auth.js';

const authenticate = (req, res, next) => {
  const token = authHeader.slice(7).trim();
  const { secret } = readJwtConfig();
  const decoded = jwt.verify(token, secret);
  req.user = {
    userId: decoded.sub,
    name:   decoded.nombre,
    role:   Array.isArray(decoded.roles) ? decoded.roles[0] : decoded.roles,
  };
  req.auth = decoded;
  next();
};
```

---

### 8. `src/presentation/features/courses/AddContentPage.tsx` — upload de archivos y fixes de formulario

**Problema 1:** El área de drag & drop era solo visual. Solo funcionaba URL externa para todos los tipos.

**Fix:** Comportamiento diferenciado por tipo de contenido:

| Tipo | Comportamiento |
|------|---------------|
| **VIDEO** | Solo campo URL (YouTube, Vimeo, etc.) + campo duración en minutos |
| **IMAGE** | Drag & drop / selector de archivo → sube a `POST /api/documentos` (carpeta `imagenes`). Acepta: PNG, JPG, GIF, WEBP |
| **DOCUMENT** | Drag & drop / selector de archivo → sube a `POST /api/documentos` (carpeta `documentos`). Acepta: PDF, DOC, DOCX, XLS, XLSX |
| **TEXT** | Textarea para escribir el contenido directamente |

**Endpoint de upload:** `POST http://localhost:3000/api/documentos`
- `multipart/form-data` con campos `archivo` y `carpeta`
- Responde: `{ success: true, data: { id: "documentos/archivo.pdf", name: "..." } }`
- URL de descarga: `http://localhost:3000/api/documentos/${encodeURIComponent(id)}/descargar`

**Problema 2:** `durationMinutes` con `valueAsNumber: true` pasaba `NaN` a Zod cuando estaba vacío → el submit fallaba silenciosamente.

**Fix:** `z.preprocess` para convertir `NaN`/vacío a `undefined` antes de validar.

**Problema 3:** `description` era requerida por Zod pero el usuario podía no llenarla → bloqueaba el submit sin mostrar error claro.

**Fix:** Campo opcional con `.optional().default('')`.

**Problema 4:** `orden` se calculaba con `module.contentIds.length + 1` pero `contenidosCount` del módulo puede estar desactualizado → 409 Conflict porque ya existía contenido con ese orden.

**Fix:** Al cargar la página, consulta los contenidos reales del módulo con `fetchContenidos(moduleId)` y calcula `Math.max(...contenidos.map(c => c.order)) + 1` para garantizar un orden único.
- Límite: 50 MB por archivo

---

## Arquitectura de rutas del módulo de cursos

```
/courses                                          → CourseListPage (lista + CRUD)
/courses/new                                      → CreateCoursePage
/courses/:courseId                                → ModuleListPage
/courses/:courseId/modules/new                    → CreateModulePage → navega a /courses/:id/modules/:mid/contents/new
/courses/:courseId/modules/:moduleId              → ContentListPage
/courses/:courseId/modules/:moduleId/contents/new → AddContentPage → navega a /courses/:id/modules/:mid
```

---

## Conexión frontend ↔ backend — servicios verificados

| Servicio frontend | Método | Endpoint backend | Estado |
|-------------------|--------|-----------------|--------|
| `fetchCursos()` | GET | `/api/cursos` | ✅ |
| `fetchCursoById()` | GET | `/api/cursos/:id` | ✅ |
| `createCurso()` | POST | `/api/cursos` | ✅ |
| `updateCurso()` | PUT | `/api/cursos/:id` | ✅ |
| `toggleCursoActivo()` | PATCH | `/api/cursos/:id/activo` | ✅ |
| `deleteCurso()` | DELETE | `/api/cursos/:id` | ✅ |
| `fetchModulos()` | GET | `/api/cursos/:id/modulos` | ✅ |
| `fetchModuloById()` | GET | `/api/cursos/:id/modulos/:mid` | ✅ |
| `createModulo()` | POST | `/api/cursos/:id/modulos` | ✅ |
| `updateModulo()` | PUT | `/api/cursos/:id/modulos/:mid` | ✅ |
| `toggleModuloActivo()` | PATCH | `/api/cursos/:id/modulos/:mid/activo` | ✅ |
| `deleteModulo()` | DELETE | `/api/cursos/:id/modulos/:mid` | ✅ |
| `fetchContenidos()` | GET | `/api/modulos/:mid/contenidos` | ✅ |
| `createContenido()` | POST | `/api/modulos/:mid/contenidos` | ✅ |
| `updateContenido()` | PUT | `/api/modulos/:mid/contenidos/:cid` | ✅ |
| `deleteContenido()` | DELETE | `/api/modulos/:mid/contenidos/:cid` | ✅ |
| Upload archivo | POST | `/api/documentos` | ✅ |

---

## Problemas críticos pendientes (identificados en revisión)

| # | Problema | Archivo | Impacto |
|---|----------|---------|---------|
| 1 | Path absoluto en `studentProgressStore` — ruta de máquina local | `src/presentation/stores/studentProgressStore.ts:3` | Se rompe en otros entornos |
| 2 | Dos `UserRole` incompatibles — literales vs enum | `domain/auth/types.ts` vs `domain/shared/enums/UserRole.enum.ts` | Bugs en validación de roles |
| 3 | Tipos de Student duplicados — campos distintos para los mismos conceptos | `domain/student/index.ts` vs `domain/student/types.ts` | Runtime errors posibles |

---

## Cómo levantar el proyecto

```bash
# Backend
cd /Users/santiph19pc/Documents/PlataformaIUSH-Backend
npm run dev

# Frontend
cd /Users/santiph19pc/Documents/PlataformaIUSH-Frontend
npm run dev
```

Frontend: `http://localhost:5173`
Backend: `http://localhost:3000`
Swagger: `http://localhost:3000/api-docs`
