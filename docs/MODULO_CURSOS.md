# Documentación Técnica — Módulo de Gestión de Cursos

**Responsable:** Equipo 1 (Cursos)  
**Última actualización:** 24 Mayo 2026  
**Estado:** Activo

---

## Tabla de Contenidos

1. [Arquitectura del Módulo](#arquitectura-del-módulo)
2. [Entidades de Dominio](#entidades-de-dominio)
3. [Servicios y Mapeo](#servicios-y-mapeo)
4. [Componentes de UI](#componentes-de-ui)
5. [Rutas y Navegación](#rutas-y-navegación)
6. [Flujos de Usuario](#flujos-de-usuario)
7. [Estado Global](#estado-global)
8. [Testing](#testing)
9. [Guía de Desarrollo](#guía-de-desarrollo)

---

## Arquitectura del Módulo

### Estructura de Archivos

```
src/
├── domain/
│   ├── courses/
│   │   ├── types.ts              # Tipos Course, CourseLevel, CourseStatus
│   │   └── courseRepository.ts   # Repositorio mock (in-memory)
│   ├── modules/
│   │   └── types.ts              # Tipos Module, ModuleStatus
│   └── contents/
│       ├── types.ts              # Tipos Content, ContentType, QuizData
│       └── contentRepository.ts  # Repositorio mock (in-memory)
├── presentation/
│   ├── services/
│   │   ├── courseService.ts      # API real + mapeo backend→domain
│   │   ├── moduleService.ts      # API real + mapeo backend→domain
│   │   └── contentService.ts     # API real + mapeo backend→domain
│   └── features/
│       └── courses/
│           ├── CourseListPage.tsx          # Lista de cursos
│           ├── CreateCoursePage.tsx        # Crear curso
│           ├── CourseCard.tsx              # Card de curso
│           ├── ModuleListPage.tsx          # Lista de módulos
│           ├── CreateModulePage.tsx        # Crear módulo
│           ├── ModuleCard.tsx              # Card de módulo
│           ├── ContentListPage.tsx         # Lista de contenidos
│           ├── AddContentPage.tsx          # Crear contenido
│           └── ContentCard.tsx             # Card de contenido
└── routes/
    └── definitions/
        └── courses.routes.ts     # Definición de rutas
```

### Principios de Diseño

- **Separación de capas:** Domain (tipos puros) → Presentation (servicios con mapeo) → UI (componentes)
- **Mapeo explícito:** Cada servicio tiene funciones `mapBackendToDomain` para traducir nombres de campos (ej: `titulo` → `title`)
- **Optimistic updates:** Las acciones de toggle status actualizan el estado local antes de confirmar con el backend
- **Cascade operations:** Desactivar un curso desactiva en cascada todos sus módulos activos

---

## Entidades de Dominio

### Course

**Archivo:** `src/domain/courses/types.ts`

```typescript
export type CourseLevel = 'beginner' | 'intermediate' | 'advanced'
export type CourseStatus = 'active' | 'inactive'

export interface Course {
  id: string
  title: string
  description: string
  instructor: string
  level: CourseLevel
  status: CourseStatus
  moduleIds: string[]      // IDs de módulos asociados
  studentCount: number
}
```

**Campos notables:**
- `moduleIds`: Array de IDs que representa la relación 1:N con módulos
- `instructor`: Actualmente es un string, pero debería ser una referencia a usuario en el futuro
- `studentCount`: Contador de estudiantes inscritos (agregado)

### Module

**Archivo:** `src/domain/modules/types.ts`

```typescript
export type ModuleStatus = 'active' | 'inactive'

export interface Module {
  id: string
  courseId: string        // FK al curso padre
  title: string
  description: string
  order: number           // Orden dentro del curso
  status: ModuleStatus
  contentIds: string[]    // IDs de contenidos asociados
}
```

**Campos notables:**
- `courseId`: Clave foránea al curso
- `order`: Define el orden secuencial de los módulos dentro del curso
- `contentIds`: Array de IDs para relación 1:N con contenidos

### Content

**Archivo:** `src/domain/contents/types.ts`

```typescript
export enum ContentType {
  VIDEO    = 'video',
  TEXT     = 'text',
  IMAGE    = 'image',
  DOCUMENT = 'document',
  QUIZ_TF  = 'quiz_tf',      // Quiz verdadero/falso
  QUIZ_MC  = 'quiz_mc',      // Quiz múltiple opción
}

export type ContentStatus = 'active' | 'draft'

export interface Content {
  id: string
  moduleId: string         // FK al módulo padre
  title: string
  description: string
  type: ContentType
  status: ContentStatus
  resourceUrl?: string      // URL del recurso (video, PDF, etc.)
  durationMinutes?: number  // Duración estimada (solo para videos)
  order: number             // Orden dentro del módulo
}
```

**Tipos de Quiz:**

```typescript
export interface QuizTFData {
  questionType: 'quiz_tf'
  question: string
  correctAnswer: boolean
  explanation?: string
}

export interface QuizMCOption {
  id: string
  text: string
}

export interface QuizMCData {
  questionType: 'quiz_mc'
  question: string
  options: QuizMCOption[]
  correctAnswerId: string
  explanation?: string
}

export type QuizData = QuizTFData | QuizMCData
```

**Nota:** Los quizzes se almacenan como JSON en el campo `resourceUrl` cuando el tipo es `text`. La función `parseQuizData()` valida y parsea el JSON.

---

## Servicios y Mapeo

### courseService.ts

**Archivo:** `src/presentation/services/courseService.ts`

**Backend Schema (Backend → Frontend):**

| Campo Backend | Campo Domain | Tipo |
|---|---|---|
| `idCurso` | `id` | string |
| `titulo` | `title` | string |
| `descripcion` | `description` | string |
| `activo` | `status` | boolean → `'active'`/`'inactive'` |
| `modulosCount` | `moduleIds` | number → string[] (generado) |
| `creacion` | - | string (no mapeado) |
| `actualizacion` | - | string (no mapeado) |

**Funciones principales:**

```typescript
// GET /cursos
fetchCursos(params?: { activo?: boolean; id_usuario?: string; page?: number; limit?: number }): Promise<Course[]>

// GET /cursos/:id
fetchCursoById(cursoId: string): Promise<Course | null>

// POST /cursos
createCurso(course: Omit<Course, "id">, idUsuario: string): Promise<Course>

// PUT /cursos/:id
updateCurso(courseId: string, updates: Partial<Course>): Promise<Course>

// PATCH /cursos/:id/activo
toggleCursoActivo(courseId: string, activo: boolean): Promise<Course>

// DELETE /cursos/:id
deleteCurso(courseId: string): Promise<void>
```

**Comportamiento especial:**
- `createCurso`: Si el curso se crea con `status: 'active'`, llama automáticamente a `toggleCursoActivo` para asegurar el estado en el backend
- `moduleIds`: Se genera como array de IDs sintéticos (`{courseId}-mod-{index}`) basado en `modulosCount` del backend

### moduleService.ts

**Archivo:** `src/presentation/services/moduleService.ts`

**Backend Schema:**

| Campo Backend | Campo Domain | Tipo |
|---|---|---|
| `idModulo` | `id` | string |
| `idCurso` | `courseId` | string |
| `titulo` | `title` | string |
| `descripcion` | `description` | string |
| `activo` | `status` | boolean → `'active'`/`'inactive'` |
| `orden` | `order` | number |
| `contenidosCount` | `contentIds` | number → string[] (generado) |

**Funciones principales:**

```typescript
// GET /cursos/:courseId/modulos
fetchModulos(cursoId: string, params?: { activo?: boolean }): Promise<Module[]>

// GET /cursos/:courseId/modulos/:moduloId
fetchModuloById(cursoId: string, moduloId: string): Promise<Module | null>

// POST /cursos/:courseId/modulos
createModulo(cursoId: string, modulo: Omit<Module, "id" | "contentIds">): Promise<Module>

// PUT /cursos/:courseId/modulos/:moduloId
updateModulo(cursoId: string, moduloId: string, updates: Partial<Module>): Promise<Module>

// PATCH /cursos/:courseId/modulos/:moduloId/activo
toggleModuloActivo(cursoId: string, moduloId: string, activo: boolean): Promise<Module>

// DELETE /cursos/:courseId/modulos/:moduloId
deleteModulo(cursoId: string, moduloId: string): Promise<void>

// PATCH /cursos/:courseId/modulos/reorder
reorderModulos(cursoId: string, orden: { id_modulo: string; orden: number }[]): Promise<Module[]>
```

**Comportamiento especial:**
- `toggleModuloActivo`: Después de actualizar, re-fetch el módulo para devolver el estado actualizado
- `reorderModulos`: Envía el array de orden y luego re-fetch todos los módulos

### contentService.ts

**Archivo:** `src/presentation/services/contentService.ts`

**Backend Schema:**

| Campo Backend | Campo Domain | Tipo |
|---|---|---|
| `idContenido` | `id` | string |
| `idModulo` | `moduleId` | string |
| `titulo` | `title` | string |
| `descripcion` | `description` | string |
| `tipo` | `type` | enum → `ContentType` |
| `urlOTexto` | `resourceUrl` | string (para quizzes, es JSON) |
| `orden` | `order` | number |
| `activo` | `status` | boolean → `'active'`/`'draft'` |

**Mapeo de tipos:**

| Backend `tipo` | Domain `ContentType` |
|---|---|
| `video` | `VIDEO` |
| `texto` | `TEXT` (o `QUIZ_TF`/`QUIZ_MC` si el contenido es JSON válido) |
| `archivo` | `DOCUMENT` |
| `imagen` | `IMAGE` |

**Funciones principales:**

```typescript
// GET /modulos/:moduloId/contenidos
fetchContenidos(moduloId: string, params?: { activo?: boolean; tipo?: string }): Promise<Content[]>

// GET /modulos/:moduloId/contenidos/:contenidoId
fetchContenidoById(moduloId: string, contenidoId: string): Promise<Content | null>

// POST /modulos/:moduloId/contenidos
createContenido(moduloId: string, contenido: Omit<Content, "id" | "durationMinutes">): Promise<Content>

// PUT /modulos/:moduloId/contenidos/:contenidoId
updateContenido(moduloId: string, contenidoId: string, updates: Partial<Content>): Promise<Content>

// DELETE /modulos/:moduloId/contenidos/:contenidoId
deleteContenido(moduloId: string, contenidoId: string): Promise<void>

// PATCH /modulos/:moduloId/contenidos/reorder
reorderContenidos(moduloId: string, orden: { id_contenido: string; orden: number }[]): Promise<Content[]>
```

**Comportamiento especial:**
- `mapTipoToContentType`: Si el tipo es `texto` y el `urlOTexto` es JSON válido de quiz, retorna `QUIZ_TF` o `QUIZ_MC`
- `mapContentTypeToTipo`: Los quizzes se mapean a `texto` en el backend (el JSON va en `url_o_texto`)

---

## Componentes de UI

### CourseListPage

**Archivo:** `src/presentation/features/courses/CourseListPage.tsx`

**Responsabilidades:**
- Listar todos los cursos con filtros (todos/activos/inactivos)
- Buscar por título, descripción o instructor
- Cambiar vista entre tabla y grid
- Activar/desactivar cursos con confirmación y cascade a módulos
- Editar título/descripción inline
- Eliminar cursos con confirmación

**Estado local:**
```typescript
const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all')
const [searchTerm, setSearchTerm] = useState('')
const [viewMode, setViewMode] = useState<'grid' | 'table'>('table')
const [courses, setCourses] = useState<Course[]>([])
const [loading, setLoading] = useState(true)
const [togglingCourse, setTogglingCourse] = useState<string | null>(null)
const [editingCourse, setEditingCourse] = useState<Course | null>(null)
```

**Cascade de desactivación:**
Cuando se desactiva un curso:
1. Busca todos los módulos del curso
2. Cuenta módulos activos
3. Muestra confirmación con el conteo
4. Desactiva el curso
5. Desactiva todos los módulos activos en paralelo (`Promise.all`)

### CreateCoursePage

**Archivo:** `src/presentation/features/courses/CreateCoursePage.tsx`

**Responsabilidades:**
- Formulario para crear nuevo curso
- Campos: título, descripción, nivel, instructor
- Validación de campos requeridos
- Guardar draft en localStorage (no implementado aún)

**Estado local:**
```typescript
const [formData, setFormData] = useState({
  title: '',
  description: '',
  level: 'beginner' as CourseLevel,
  instructor: ''
})
const [loading, setLoading] = useState(false)
const [error, setError] = useState<string | null>(null)
```

### ModuleListPage

**Archivo:** `src/presentation/features/courses/ModuleListPage.tsx`

**Responsabilidades:**
- Listar módulos de un curso específico
- Activar/desactivar módulos
- Reordenar módulos (drag & drop no implementado)
- Navegar a contenidos de cada módulo

**Estado local:**
```typescript
const [modules, setModules] = useState<Module[]>([])
const [loading, setLoading] = useState(true)
const [course, setCourse] = useState<Course | null>(null)
```

### CreateModulePage

**Archivo:** `src/presentation/features/courses/CreateModulePage.tsx`

**Responsabilidades:**
- Formulario para crear nuevo módulo
- Campos: título, descripción, orden
- Auto-cálculo de orden sugerido (último orden + 1)

### ContentListPage

**Archivo:** `src/presentation/features/courses/ContentListPage.tsx`

**Responsabilidades:**
- Listar contenidos de un módulo
- Filtrar por tipo (video/texto/archivo/imagen)
- Activar/desactivar contenidos
- Reordenar contenidos

### AddContentPage

**Archivo:** `src/presentation/features/courses/AddContentPage.tsx`

**Responsabilidades:**
- Formulario para crear nuevo contenido
- Selector de tipo con campos dinámicos:
  - Video: URL + duración
  - Texto: Texto plano o JSON de quiz
  - Document: URL
  - Imagen: URL
- Validación según tipo

---

## Rutas y Navegación

### courses.routes.ts

**Archivo:** `src/routes/definitions/courses.routes.ts`

```typescript
export const coursesRoutes: RouteObject[] = [
  {
    path: '/courses',
    element: createElement(CourseListPage),
  },
  {
    path: '/courses/new',
    element: createElement(CreateCoursePage),
  },
  {
    path: '/courses/:courseId',
    element: createElement(ModuleListPage),
  },
  {
    path: '/courses/:courseId/modules/new',
    element: createElement(CreateModulePage),
  },
  {
    path: '/courses/:courseId/modules/:moduleId',
    element: createElement(ContentListPage),
  },
  {
    path: '/courses/:courseId/modules/:moduleId/contents/new',
    element: createElement(AddContentPage),
  },
]
```

**Jerarquía de rutas:**
```
/courses                    → CourseListPage
/courses/new                → CreateCoursePage
/courses/:courseId          → ModuleListPage
/courses/:courseId/modules/new        → CreateModulePage
/courses/:courseId/modules/:moduleId  → ContentListPage
/courses/:courseId/modules/:moduleId/contents/new → AddContentPage
```

**Parámetros de ruta:**
- `courseId`: ID del curso (string)
- `moduleId`: ID del módulo (string)

**Guard de autenticación:**
Todas las rutas están dentro del wrapper `RequireAuth` en `routes/definitions/index.ts`.

---

## Flujos de Usuario

### Flujo 1: Crear Curso

1. Usuario navega a `/courses`
2. Hace clic en "Nuevo curso"
3. Navega a `/courses/new`
4. Completa formulario (título, descripción, nivel, instructor)
5. Hace clic en "Crear curso"
6. `createCurso()` llama a `POST /cursos`
7. Si el curso se crea con `status: 'active'`, llama a `toggleCursoActivo`
8. Redirige a `/courses` (lista de cursos)

### Flujo 2: Desactivar Curso (Cascade)

1. Usuario en `/courses` hace clic en toggle de un curso activo
2. `handleToggleStatus()` detecta cambio a `inactive`
3. Llama a `fetchModulos(courseId)` para obtener módulos
4. Cuenta módulos activos
5. Muestra `window.confirm()` con mensaje: "¿Estás seguro? Esta acción desactivará X módulo(s) activo(s)"
6. Si confirma:
   - Optimistic update: actualiza estado local a `inactive`
   - Llama a `toggleCursoActivo(courseId, false)`
   - Llama a `Promise.all` de `toggleModuloActivo` para cada módulo activo
   - Log de éxito
7. Si cancela: no hace nada
8. Si error: revert optimistic update, muestra error

### Flujo 3: Crear Módulo

1. Usuario en `/courses/:courseId` hace clic en "Nuevo módulo"
2. Navega a `/courses/:courseId/modules/new`
3. Completa formulario (título, descripción, orden)
4. Hace clic en "Crear módulo"
5. `createModulo()` llama a `POST /cursos/:courseId/modulos`
6. Redirige a `/courses/:courseId` (lista de módulos)

### Flujo 4: Crear Contenido (Quiz)

1. Usuario en `/courses/:courseId/modules/:moduleId` hace clic en "Nuevo contenido"
2. Navega a `/courses/:courseId/modules/:moduleId/contents/new`
3. Selecciona tipo "Quiz"
4. Selecciona subtipo (Verdadero/Falso o Múltiple Opción)
5. Si es Verdadero/Falso:
   - Ingresa pregunta
   - Selecciona respuesta correcta (true/false)
   - Opcional: explicación
6. Si es Múltiple Opción:
   - Ingresa pregunta
   - Agrega opciones (mínimo 2)
   - Selecciona opción correcta
   - Opcional: explicación
7. Hace clic en "Crear contenido"
8. `createContenido()` serializa el quiz a JSON
9. Llama a `POST /modulos/:moduleId/contenidos` con `tipo: 'texto'` y `url_o_texto: <JSON>`
10. Redirige a lista de contenidos

### Flujo 5: Reordenar Módulos

1. Usuario en `/courses/:courseId` hace clic en "Reordenar"
2. Abre modal con lista de módulos
3. Arrastra y suelta para reordenar (no implementado aún)
4. Hace clic en "Guardar"
5. `reorderModulos()` llama a `PATCH /cursos/:courseId/modulos/reorder`
6. Payload: `{ orden: [{ id_modulo: string, orden: number }, ...] }`
7. Re-fetch módulos para actualizar UI

---

## Estado Global

### Contextos Utilizados

**InstitutionContext:**
- Provee `colors` para theming dinámico
- Usado en todos los componentes del módulo courses
- `const { colors } = useInstitution()`

**AuthStore (Zustand):**
- No utilizado directamente en el módulo courses
- El guard `RequireAuth` maneja la autenticación a nivel de ruta

### Estado Local vs Global

**Patrón actual:** Todo el estado del módulo courses es local a cada componente.

**Estado que podría ser global:**
- Lista de cursos (cache entre navegaciones)
- Lista de módulos del curso actual
- Filtros activos (persistir entre sesiones)

**Recomendación:** Implementar un `useCourseStore` con Zustand para:
- Cache de cursos
- Cache de módulos por curso
- Filtros persistentes

---

## Testing

### Archivos de Test

| Archivo | Tests | Estado |
|---|---|---|
| `CourseListPage.test.tsx` | 11 | ❌ 11 fallan |
| `CreateCoursePage.test.tsx` | 9 | ❌ 9 fallan |
| `ModuleListPage.test.tsx` | 8 | ❌ 2 fallan |
| `CreateModulePage.test.tsx` | 10 | ❌ 10 fallan |
| `ContentListPage.test.tsx` | 8 | ❌ 2 fallan |
| `AddContentPage.test.tsx` | 10 | ❌ 8 fallan |
| `CourseCard.test.tsx` | 10 | ❌ 10 fallan |
| `ModuleCard.test.tsx` | 10 | ❌ 10 fallan |
| `ContentCard.test.tsx` | 10 | ❌ 10 fallan |
| `courseService.test.ts` | 15 | ❌ 10 fallan |
| `moduleService.test.ts` | 15 | ❌ 10 fallan |
| `contentService.test.ts` | 14 | ❌ 9 fallan |

### Causa de Fallos

**Principal:** `renderWithProviders` no incluye `InstitutionProvider`. Los componentes que usan `useInstitution()` fallan porque el context no está disponible.

**Secundario:** Path aliases en `vitest.config.ts` apuntan a `./src/` en vez de `../src/` (el config está en `config/`).

### Ejemplo de Test

```typescript
// CourseListPage.test.tsx
describe('CourseListPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockFetchCursos.mockResolvedValue(mockCourses)
    mockFetchModulos.mockResolvedValue(mockModules)
  })

  it('should render course list after loading', async () => {
    renderWithRouter(<CourseListPage />)
    
    await waitFor(() => {
      expect(screen.getByText('Gestión de Cursos')).toBeInTheDocument()
      expect(screen.getByText('React Fundamentals')).toBeInTheDocument()
    })
  })
})
```

---

## Guía de Desarrollo

### Agregar un Nuevo Campo a Course

1. **Actualizar tipo de dominio:**
   ```typescript
   // src/domain/courses/types.ts
   export interface Course {
     // ... campos existentes
     category?: string  // nuevo campo
   }
   ```

2. **Actualizar servicio de mapeo:**
   ```typescript
   // src/presentation/services/courseService.ts
   export interface CursoBackend {
     // ... campos existentes
     categoria?: string  // campo del backend
   }

   function mapCursoToCourse(c: CursoBackend): Course {
     return {
       // ... mapeo existente
       category: c.categoria || undefined,
     }
   }
   ```

3. **Actualizar componentes:**
   - Agregar campo a formulario en `CreateCoursePage.tsx`
   - Agregar columna a tabla en `CourseListPage.tsx`
   - Actualizar `CourseCard.tsx` si se muestra en grid

### Agregar un Nuevo Tipo de Contenido

1. **Actualizar enum de tipos:**
   ```typescript
   // src/domain/contents/types.ts
   export enum ContentType {
     // ... tipos existentes
     AUDIO = 'audio',  // nuevo tipo
   }
   ```

2. **Actualizar mapeo en servicio:**
   ```typescript
   // src/presentation/services/contentService.ts
   function mapTipoToContentType(tipo: ContenidoBackend["tipo"]): ContentType {
     const tipoMap: Record<ContenidoBackend["tipo"], ContentType> = {
       // ... mapeo existente
       audio: ContentType.AUDIO,
     }
     return tipoMap[tipo] || ContentType.TEXT
   }

   function mapContentTypeToTipo(contentType: ContentType): ContenidoBackend["tipo"] {
     const contentTypeMap: Record<ContentType, ContenidoBackend["tipo"]> = {
       // ... mapeo existente
       [ContentType.AUDIO]: "audio",
     }
     return contentTypeMap[contentType] || "texto"
   }
   ```

3. **Agregar componente de renderizado:**
   - Crear `AudioContent.tsx` en `src/presentation/features/student/content-modal/components/`
   - Agregar case en `ContentModal.tsx` para renderizar el nuevo tipo

### Debug de Errores Comunes

**Error: "Module not found" al importar servicios**
- Verificar que el path alias esté correcto (`@presentation/services/courseService`)
- Verificar `tsconfig.json` y `vite.config.ts` tengan los aliases configurados

**Error: "useInstitution() returned undefined"**
- El componente no está envuelto en `InstitutionProvider`
- Usar `renderWithProviders` en tests (agregar `InstitutionProvider` al helper)

**Error: Cascade de módulos no funciona**
- Verificar que `toggleModuloActivo` reciba `activo: false`
- Verificar que el backend tenga el endpoint `PATCH /cursos/:courseId/modulos/:moduloId/activo`

**Error: Quiz no se renderiza**
- Verificar que el JSON en `resourceUrl` sea válido
- Usar `parseQuizData()` para validar antes de asignar
- Verificar que el tipo sea `QUIZ_TF` o `QUIZ_MC` después del mapeo

### Checklist para PRs

- [ ] Tipos de dominio actualizados
- [ ] Servicios de mapeo actualizados
- [ ] Componentes de UI actualizados
- [ ] Tests actualizados (mocks de nuevos campos)
- [ ] Tests pasan localmente
- [ ] Sin `console.log` en código de producción
- [ ] Sin imports relativos largos (usar aliases)
- [ ] Sin `any` en TypeScript (usar tipos explícitos)

---

## Referencias

- **Documentación general:** `README.md`
- **Guía de equipos:** `GUIA_EQUIPOS.md`
- **Arquitectura:** `COMPLETO.md`
- **Rutas:** `ROUTING.md`
- **API Backend:** Documentación separada (no incluida en este repo)

---

## Notas Técnicas

### Limitaciones Actuales

1. **Repositorios mock:** `courseRepository.ts` y `contentRepository.ts` tienen datos estáticos. No se usan en producción (se usan los servicios con API real).

2. **Drag & drop no implementado:** Reordenar módulos y contenidos requiere un modal manual. Se recomienda implementar `dnd-kit` o `react-beautiful-dnd`.

3. **Instructor como string:** El campo `instructor` es un string simple. Debería ser una referencia a usuario con nombre, avatar, etc.

4. **Duración de videos:** `durationMinutes` no se calcula automáticamente. Se requiere integración con servicio de video para obtener metadatos.

5. **Preview de contenidos:** No hay preview de videos/PDFs antes de guardar. Se recomienda agregar preview en el formulario de creación.

### Mejoras Sugeridas

1. **Implementar cache con Zustand:** Reducir llamadas a API reusando datos entre componentes.

2. **Agregar paginación:** `fetchCursos` soporta `page` y `limit` pero la UI no implementa paginación.

3. **Implementar drag & drop:** Usar `@dnd-kit/core` para reordenar módulos y contenidos visualmente.

4. **Agregar validación de formularios:** Usar `react-hook-form` con `zod` para validación robusta.

5. **Implementar undo/redo:** Para operaciones de reordenar y toggle status.

6. **Agregar skeleton loaders:** Mejorar UX durante loading states.

7. **Implementar infinite scroll:** Para listas largas de cursos/módulos/contenidos.

---

**Fin de la documentación**
