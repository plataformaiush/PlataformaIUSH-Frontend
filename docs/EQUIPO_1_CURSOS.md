# Diagnóstico Específico — Equipo 1 (Gestión de Cursos)

**Responsable:** Equipo 1  
**Alcance:** Frontend + Backend del módulo de cursos  
**Fecha:** 24 de mayo de 2026  
**Objetivo:** Problemas y mejoras específicas del equipo

---

## Resumen Ejecutivo

**Estado del Equipo 1:** ⚠️ **PROBLEMÁTICO**

El Equipo 1 tiene una implementación funcional pero presenta problemas críticos en la integración frontend-backend y deuda técnica significativa que afecta mantenibilidad y UX.

### Top 3 Problemas del Equipo 1

1. **Campos faltantes en response de cursos** — El frontend espera `instructor`, `level`, `studentCount` que el backend no devuelve. El mapeo actual deja estos campos vacíos o hardcodeados.
2. **Repositorios mock en domain (frontend)** — `courseRepository.ts` y `contentRepository.ts` tienen datos estáticos en la capa de dominio, violando arquitectura DDD.
3. **Sin drag & drop para reordenar** — Las funciones `reorderModulos` y `reorderContenidos` existen en el backend y servicios, pero la UI no tiene implementación de drag & drop.

---

## 1. Frontend — Equipo 1

### Estructura de Archivos

```
src/
├── domain/
│   ├── courses/
│   │   ├── types.ts              # ✅ Tipos correctos
│   │   └── courseRepository.ts   # ❌ Mock en domain (deuda)
│   ├── modules/
│   │   └── types.ts              # ✅ Tipos correctos
│   └── contents/
│       ├── types.ts              # ✅ Tipos correctos
│       └── contentRepository.ts  # ❌ Mock en domain (deuda)
├── presentation/
│   ├── services/
│   │   ├── courseService.ts      # ✅ API real + mapeo
│   │   ├── moduleService.ts      # ✅ API real + mapeo
│   │   └── contentService.ts     # ✅ API real + mapeo
│   └── features/
│       └── courses/
│           ├── CourseListPage.tsx          # ⚠️ Estado local, sin paginación
│           ├── CreateCoursePage.tsx        # ⚠️ Sin validación robusta
│           ├── CourseCard.tsx              # ✅ OK
│           ├── ModuleListPage.tsx          # ⚠️ Sin drag & drop
│           ├── CreateModulePage.tsx        # ⚠️ Sin validación robusta
│           ├── ModuleCard.tsx              # ✅ OK
│           ├── ContentListPage.tsx         # ⚠️ Sin drag & drop
│           ├── AddContentPage.tsx          # ⚠️ Sin preview de contenidos
│           └── ContentCard.tsx             # ✅ OK
└── routes/
    └── definitions/
        └── courses.routes.ts     # ✅ Rutas correctas
```

### Problemas Críticos (Frontend)

#### #1 — Repositorios Mock en Domain

**Archivos:**
- `src/domain/courses/courseRepository.ts`
- `src/domain/contents/contentRepository.ts`

**Problema:**
```typescript
// domain/courses/courseRepository.ts
export class CourseRepository {
  static getAllCourses(): Course[] {
    return [
      {
        id: 'course-1',
        title: 'React Fundamentals',
        // ... datos estáticos
      }
    ]
  }
}
```

**Por qué es problema:**
- Violación de arquitectura DDD: Domain no debería tener implementaciones
- Estos repositorios NO se usan en producción (se usan los servicios con API real)
- Causan confusión: desarrolladores pueden pensar que estos son los repositorios reales
- Si se usan por error, los datos no reflejan el estado real del backend

**Fix:**
- Opción A: Mover a `infrastructure/repositories/mock/` (si se necesitan para tests)
- Opción B: Eliminar completamente (no se usan)

**Impacto:** Bajo (no se usan en producción)

---

#### #2 — Mapeo Incompleto de Cursos

**Archivo:** `src/presentation/services/courseService.ts:20-34`

```typescript
function mapCursoToCourse(c: CursoBackend): Course {
  return {
    id: c.idCurso,
    title: c.titulo,
    description: c.descripcion,
    instructor: "",        // ❌ Hardcodeado vacío
    level: "beginner",     // ❌ Hardcodeado
    status: c.activo ? "active" : "inactive",
    moduleIds: Array.from(
      { length: c.modulosCount },
      (_, i) => `${c.idCurso}-mod-${i}`,
    ),
    studentCount: 0,       // ❌ Hardcodeado
  };
}
```

**Problema:**
- `instructor` siempre vacío — la UI muestra "Sin instructor" para todos los cursos
- `level` siempre "beginner" — no hay forma de distinguir niveles reales
- `studentCount` siempre 0 — no hay estadísticas de estudiantes
- `moduleIds` se genera sintéticamente basado en `modulosCount` — no son IDs reales de módulos

**Impacto:** Alto — UI muestra información incorrecta/incompleta

**Fix:**
- **Corto plazo:** Hacer campos opcionales en `Course` type y mostrar "N/A" en UI
- **Medio plazo:** Backend agrega campos o frontend hace fetch adicional
- **Largo plazo:** Backend implementa JOIN con tabla `usuario` para instructor, agrega columna `nivel`, calcula `studentCount`

---

#### #3 — Sin Drag & Drop para Reordenar

**Archivos:**
- `src/presentation/features/courses/ModuleListPage.tsx`
- `src/presentation/features/courses/ContentListPage.tsx`

**Servicios existentes:**
```typescript
// moduleService.ts
export async function reorderModulos(
  cursoId: string,
  orden: { id_modulo: string; orden: number }[],
): Promise<Module[]>

// contentService.ts
export async function reorderContenidos(
  moduloId: string,
  orden: { id_contenido: string; orden: number }[],
): Promise<Content[]>
```

**Problema:**
- Los servicios de reordenar existen en el backend y están mapeados
- La UI NO tiene implementación de drag & drop
- Reordenar requiere un modal manual con inputs numéricos (no implementado aún)
- UX es deficiente para una operación crítica

**Impacto:** Medio — funcionalidad existe pero UX es mala

**Fix:**
- Implementar `@dnd-kit/core` o `react-beautiful-dnd` en `ModuleListPage` y `ContentListPage`
- Agregar skeleton de modal manual mientras se implementa drag & drop

---

#### #4 — Sin Paginación en UI

**Archivo:** `src/presentation/features/courses/CourseListPage.tsx`

**Servicio soporta paginación:**
```typescript
// courseService.ts
export async function fetchCursos(params?: {
  activo?: boolean;
  id_usuario?: string;
  page?: number;      // ✅ Soportado
  limit?: number;     // ✅ Soportado
}): Promise<Course[]>
```

**Problema:**
- `CourseListPage` llama a `fetchCursos()` sin parámetros
- Carga todos los cursos de golpe
- Si hay 100+ cursos, la UI será lenta
- No hay indicador de "cargando más" o "fin de lista"

**Impacto:** Medio — se degradará con volumen de datos

**Fix:**
- Implementar paginación en `CourseListPage` con botón "Cargar más"
- O implementar infinite scroll con `IntersectionObserver`

---

#### #5 — Estado Local en Todos los Componentes

**Archivos:**
- `CourseListPage.tsx`
- `ModuleListPage.tsx`
- `ContentListPage.tsx`

**Problema:**
```typescript
// CourseListPage.tsx
const [courses, setCourses] = useState<Course[]>([])
const [loading, setLoading] = useState(true)
```

- Cada componente hace su propio fetch
- Datos no se cachean entre navegaciones
- Si el usuario navega entre cursos y módulos, se re-fetch cada vez
- No hay store centralizado con Zustand

**Impacto:** Bajo — funciona pero es ineficiente

**Fix:**
- Implementar `useCourseStore` con Zustand
- Cache de cursos, módulos por curso
- Filtros persistentes

---

#### #6 — Sin Validación Robusta de Formularios

**Archivos:**
- `CreateCoursePage.tsx`
- `CreateModulePage.tsx`
- `AddContentPage.tsx`

**Problema:**
- Validación básica con `required` en inputs
- No hay validación de formato (ej: URL de video debe ser válida)
- No hay validación de longitud mínima/máxima
- No hay validación de caracteres especiales

**Impacto:** Medio — puede enviar datos inválidos al backend

**Fix:**
- Implementar `react-hook-form` + `zod`
- Crear schemas de validación para cada formulario

---

#### #7 — Sin Preview de Contenidos

**Archivo:** `src/presentation/features/courses/AddContentPage.tsx`

**Problema:**
- Al crear contenido (video, PDF, imagen), el usuario ingresa la URL
- No hay preview antes de guardar
- El usuario no sabe si la URL es válida hasta después de guardar
- Para videos, no hay metadatos (duración) antes de guardar

**Impacto:** Medio — UX deficiente, puede crear contenidos inválidos

**Fix:**
- Agregar preview de video (usar `<video>` tag con URL)
- Agregar preview de imagen (usar `<img>` tag)
- Agregar preview de PDF (usar embed o iframe)
- Para videos, obtener duración con metadata API

---

### Mejoras Recomendadas (Frontend)

#### Prioridad Alta

1. **Mover/eliminar repositorios mock** — Limpiar deuda arquitectónica
2. **Hacer campos opcionales en Course type** — Aceptar limitaciones del backend
3. **Implementar drag & drop** — Mejorar UX de reordenar

#### Prioridad Media

4. **Implementar paginación** — Preparar para volumen de datos
5. **Implementar validación robusta** — Prevenir datos inválidos
6. **Agregar preview de contenidos** — Mejorar UX de creación

#### Prioridad Baja

7. **Implementar useCourseStore** — Optimizar performance
8. **Agregar skeleton loaders** — Mejorar UX de loading
9. **Implementar undo/redo** — Para operaciones de reordenar

---

## 2. Backend — Equipo 1

### Endpoints de Cursos

| Endpoint | Método | Request | Response | Estado |
|---|---|---|---|---|
| `/api/cursos` | GET | Query: `activo`, `id_usuario`, `page`, `limit` | Array de cursos | ✅ OK |
| `/api/cursos/:id` | GET | Path: `id` | Curso + módulos | ✅ OK |
| `/api/cursos/:id/detalle/:id_usuario` | GET | Path: `id`, `id_usuario` | Curso + progreso + módulos | ✅ OK |
| `/api/cursos` | POST | Body: `titulo`, `descripcion`, `id_usuario` | Curso creado | ✅ OK |
| `/api/cursos/:id` | PUT | Path: `id`, Body: `titulo`, `descripcion`, `id_usuario` | Curso actualizado | ✅ OK |
| `/api/cursos/:id/activo` | PATCH | Path: `id`, Body: `activo` | Estado actualizado | ✅ OK |
| `/api/cursos/:id` | DELETE | Path: `id` | Soft delete | ✅ OK |

### Problemas Críticos (Backend)

#### #1 — Campos Faltantes en Response

**Archivo:** `src/controllers/curso.controller.js:9-19`

```javascript
const fmt = (c) => ({
  idCurso:       c.id_curso,
  idUsuario:     c.id_usuario,
  titulo:        c.titulo,
  descripcion:   c.descripcion ?? null,
  activo:        c.activo,
  modulosCount:  parseInt(c.modulos_count ?? '0', 10),
  creacion:      c.creacion,
  actualizacion: c.actualizacion,
  ...(c.nombre_usuario && { nombreUsuario: c.nombre_usuario }),
});
```

**Campos que NO existen:**
- ❌ `instructor` (solo `nombreUsuario` en endpoint de detalle)
- ❌ `level` o `nivel` (no hay columna en tabla)
- ❌ `studentCount` (no se calcula)

**Problema:**
- El frontend espera estos campos pero el backend no los devuelve
- `nombreUsuario` solo está disponible en endpoint de detalle, no en lista general
- No hay forma de obtener el nivel del curso
- No hay forma de obtener el conteo de estudiantes

**Impacto:** Alto — frontend muestra información incompleta

**Fix:**
1. **`instructor`:** Agregar JOIN con tabla `usuario` en query de `findAll` para incluir `nombreUsuario`
2. **`level`:** Agregar columna `nivel` a tabla `curso` (migration SQL)
3. **`studentCount`:** Agregar subquery con COUNT de inscripciones activas

**Archivos:**
- `src/models/curso.model.js` (actualizar query)
- Migración SQL para agregar columna `nivel`

---

#### #2 — Sin Tests de Endpoints

**Estado:** ❌ NO EXISTEN

**Problema:**
- No hay tests automatizados para endpoints de cursos
- Cambios en backend pueden romper el frontend sin detección
- No hay forma de verificar que el contrato API se mantiene

**Impacto:** Alto — riesgo de regresiones

**Fix:**
- Implementar Jest + Supertest
- Crear tests para cada endpoint de cursos
- Configurar CI/CD para ejecutar tests

---

#### #3 — Query SQL Manual Sin ORM

**Archivo:** `src/models/curso.model.js`

**Problema:**
```javascript
// Queries SQL manuales con strings concatenados
const dataQuery = `
  SELECT 
    c.id_curso, c.id_usuario, c.titulo, c.descripcion,
    c.activo, c.creacion, c.actualizacion,
    COUNT(m.id_modulo) FILTER (WHERE m.eliminacion IS NULL) as modulos_count
  FROM curso c
  LEFT JOIN modulo m ON c.id_curso = m.id_curso
  WHERE c.eliminacion IS NULL
  GROUP BY c.id_curso
  ORDER BY c.actualizacion DESC
  LIMIT $${paramCount} OFFSET $${paramCount + 1}
`;
```

- Queries SQL manuales son propensos a errores
- Difícil de mantener cuando cambia el esquema
- No hay type safety
- Refactorizaciones son riesgosas

**Impacto:** Medio — funciona pero es frágil

**Fix:**
- Considerar ORM (TypeORM o Prisma)
- O mantener queries manuales pero con mejor tooling (SQL builder como Knex)

---

#### #4 — Sin Índices en Tabla Curso

**Estado:** ⚠️ Índices insuficientes

**Índices encontrados:**
- Ningún índice específico para `curso` en migraciones revisadas

**Problema:**
- Query de `findAll` filtra por `eliminacion IS NULL` y ordena por `actualizacion DESC`
- Sin índices, queries serán lentos con muchos cursos
- JOIN con `modulo` sin índice en `id_curso` es ineficiente

**Impacto:** Medio — se degradará con volumen de datos

**Fix:**
```sql
CREATE INDEX idx_curso_eliminacion ON curso(eliminacion) WHERE eliminacion IS NULL;
CREATE INDEX idx_curso_actualizacion ON curso(actualizacion DESC);
CREATE INDEX idx_curso_usuario ON curso(id_usuario);
CREATE INDEX idx_modulo_curso ON modulo(id_curso);
```

---

#### #5 — Validación de Inputs Básica

**Archivo:** `src/controllers/curso.controller.js:176-184`

```javascript
// Validación básica
if (!isValidUUID(courseId)) {
  return res.status(400).json({ error: 'ID de curso inválido' });
}
if (!titulo || typeof titulo !== 'string' || titulo.trim().length === 0) {
  return res.status(400).json({ error: 'Título es requerido' });
}
```

**Problema:**
- Validación manual en cada controller
- No hay validación de longitud máxima
- No hay validación de caracteres especiales
- No hay sanitización de XSS en `titulo` y `descripcion`

**Impacto:** Medio — puede aceptar datos inválidos o maliciosos

**Fix:**
- Implementar librería de validación (Joi o Zod)
- Crear schemas de validación para cada endpoint
- Implementar sanitización de XSS

---

### Mejoras Recomendadas (Backend)

#### Prioridad Alta

1. **Agregar campos faltantes a response** — `instructor`, `level`, `studentCount`
2. **Implementar tests de endpoints** — Jest + Supertest
3. **Agregar índices a tabla curso** — Optimizar queries

#### Prioridad Media

4. **Implementar validación centralizada** — Joi o Zod
5. **Considerar ORM** — TypeORM o Prisma
6. **Implementar sanitización de XSS** — Para campos de texto

#### Prioridad Baja

7. **Optimizar queries complejos** — Usar vistas materializadas
8. **Implementar caching** — Redis para endpoints frecuentes
9. **Agregar métricas de performance** — Para monitoreo

---

## 3. Inconsistencias Frontend-Backend (Equipo 1)

### Tabla de Campos

| Campo Frontend | Campo Backend | Estado | Fix |
|---|---|---|---|
| `id` | `idCurso` | ✅ Mapeado | — |
| `title` | `titulo` | ✅ Mapeado | — |
| `description` | `descripcion` | ✅ Mapeado | — |
| `instructor` | ❌ NO EXISTE | 🔴 Hardcodeado vacío | Backend agrega JOIN |
| `level` | ❌ NO EXISTE | 🔴 Hardcodeado "beginner" | Backend agrega columna |
| `status` | `activo` | ✅ Mapeado (boolean → enum) | — |
| `moduleIds` | `modulosCount` | ⚠️ Generado sintético | Backend devuelve array real |
| `studentCount` | ❌ NO EXISTE | 🔴 Hardcodeado 0 | Backend calcula COUNT |

### Tabla de Endpoints

| Operación | Frontend Service | Backend Endpoint | Estado |
|---|---|---|---|
| Listar cursos | `fetchCursos()` | `GET /api/cursos` | ✅ OK |
| Obtener curso | `fetchCursoById()` | `GET /api/cursos/:id` | ✅ OK |
| Crear curso | `createCurso()` | `POST /api/cursos` | ✅ OK |
| Actualizar curso | `updateCurso()` | `PUT /api/cursos/:id` | ✅ OK |
| Toggle activo | `toggleCursoActivo()` | `PATCH /api/cursos/:id/activo` | ✅ OK |
| Eliminar curso | `deleteCurso()` | `DELETE /api/cursos/:id` | ✅ OK |
| Listar módulos | `fetchModulos()` | `GET /cursos/:id/modulos` | ✅ OK |
| Crear módulo | `createModulo()` | `POST /cursos/:id/modulos` | ✅ OK |
| Reordenar módulos | `reorderModulos()` | `PATCH /cursos/:id/modulos/reorder` | ✅ OK (sin UI) |
| Listar contenidos | `fetchContenidos()` | `GET /modulos/:id/contenidos` | ✅ OK |
| Crear contenido | `createContenido()` | `POST /modulos/:id/contenidos` | ✅ OK |
| Reordenar contenidos | `reorderContenidos()` | `PATCH /modulos/:id/contenidos/reorder` | ✅ OK (sin UI) |

---

## 4. Roadmap Específico para Equipo 1

### Fase 1: Desbloquear Integración (1 semana)

**Frontend:**
- [ ] Hacer `instructor`, `level`, `studentCount` opcionales en `Course` type
- [ ] Actualizar UI para mostrar "N/A" cuando campos estén vacíos
- [ ] Mover/eliminar repositorios mock de domain

**Backend:**
- [ ] Agregar JOIN con tabla `usuario` en query de `findAll` para incluir `nombreUsuario`
- [ ] Agregar columna `nivel` a tabla `curso` (migration)
- [ ] Calcular `studentCount` con COUNT de inscripciones en query

---

### Fase 2: Mejorar UX (2 semanas)

**Frontend:**
- [ ] Implementar drag & drop para reordenar módulos (`@dnd-kit/core`)
- [ ] Implementar drag & drop para reordenar contenidos
- [ ] Agregar preview de contenidos en `AddContentPage`
- [ ] Implementar paginación en `CourseListPage`

**Backend:**
- [ ] Agregar índices a tabla `curso` y `modulo`
- [ ] Implementar validación centralizada (Joi o Zod)
- [ ] Implementar sanitización de XSS

---

### Fase 3: Estabilizar (1 mes)

**Frontend:**
- [ ] Implementar `useCourseStore` con Zustand
- [ ] Implementar validación robusta de formularios (`react-hook-form` + `zod`)
- [ ] Agregar skeleton loaders
- [ ] Implementar undo/redo para reordenar

**Backend:**
- [ ] Implementar tests de endpoints (Jest + Supertest)
- [ ] Considerar ORM (TypeORM o Prisma)
- [ ] Implementar caching con Redis
- [ ] Agregar métricas de performance

---

## 5. Métricas del Equipo 1

### Cobertura de Tests

| Tipo | Frontend | Backend |
|---|---|---|
| Unit tests | 78/131 fallan (59.5%) | 0% (no existen) |
| Integration tests | 0% | 0% |
| E2E tests | 0% | 0% |

### Deuda Técnica

| Categoría | Frontend | Backend |
|---|---|---|
| Arquitectura | 🔴 Media (mocks en domain) | 🟡 Baja (sin ORM) |
| Seguridad | 🟢 Baja | 🟡 Media (sin sanitización XSS) |
| Performance | 🟡 Media (sin paginación) | 🟡 Media (sin índices) |
| UX | 🔴 Alta (sin drag & drop) | — |
| Testing | 🔴 Alta (tests rotos) | 🔴 Alta (sin tests) |

### Estado de Endpoints

| Endpoint | Frontend | Backend | Integración |
|---|---|---|---|
| CRUD cursos | ✅ Implementado | ✅ Implementado | ✅ Funcional |
| CRUD módulos | ✅ Implementado | ✅ Implementado | ✅ Funcional |
| CRUD contenidos | ✅ Implementado | ✅ Implementado | ✅ Funcional |
| Reordenar | ⚠️ Sin UI | ✅ Implementado | ⚠️ Parcial |
| Filtros | ✅ Implementado | ✅ Implementado | ✅ Funcional |
| Paginación | ❌ Sin UI | ✅ Implementado | ⚠️ Parcial |

---

## 6. Conclusión

El Equipo 1 tiene una implementación funcional del CRUD de cursos, módulos y contenidos. Los endpoints del backend están bien implementados y el frontend tiene los servicios de mapeo correctos.

Sin embargo, hay problemas críticos:
1. Campos faltantes en response (`instructor`, `level`, `studentCount`)
2. Repositorios mock en domain (deuda arquitectónica)
3. Sin drag & drop para reordenar (UX deficiente)
4. Sin tests en ambos lados (riesgo de regresiones)

**Estado general:** ⚠️ **PROBLEMÁTICO pero corregible**

**Estimación de esfuerzo para desbloquear integración:** 1 semana (1 desarrollador)

**Estimación de esfuerzo para estabilizar:** 3-4 semanas (1-2 desarrolladores)

---

**Fin del diagnóstico del Equipo 1**
