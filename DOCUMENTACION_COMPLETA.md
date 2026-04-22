# Iush - Plataforma Educativa

## Guía de Arquitectura, Desarrollo e Integración por Equipos

---

## 1.  Introducción al Proyecto

### ¿Qué es Iush?

Iush es una **plataforma educativa web tipo LMS (Learning Management System)** que permite a instituciones educativas gestionar cursos, módulos, contenidos, calificaciones y certificaciones. Es una aplicación **white-label** (personalizable por institución).

### Stack Tecnológico

```
FRONTEND STACK
Framework:     React 19 + TypeScript
Build Tool:    Vite 6
Estilos:       Tailwind CSS 4
Estado Global: Zustand 5
Server State:  TanStack Query 5
Formularios:   React Hook Form + Zod
HTTP:          Axios
Router:        React Router 7
Iconos:        Lucide React
Tipografía:    Plus Jakarta Sans
Testing:       Vitest + Testing Library
Mocks:         MSW (Mock Service Worker)
```

### Roles de Usuario

```
Super Admin    Configura la institución y su apariencia
Administrador  Gestiona usuarios, cursos y reportes
Docente        Crea contenido, califica y evalúa
Estudiante     Consume contenido, ve notas y certificados
```

---

## 2.  Arquitectura Hexagonal - Explicación Visual

### ¿Qué es la Arquitectura Hexagonal?

Imagina tu aplicación como una **cebolla con capas**. El centro es la lógica de negocio pura y cada capa exterior agrega funcionalidad sin contaminar el centro.

```
                    PRESENTACIÓN
         (React, Tailwind, Componentes, Páginas)
              INFRAESTRUCTURA
       (Axios, Storage, Analytics, APIs)
          APLICACIÓN
    (Casos de Uso, DTOs, Mappers)
      DOMINIO
  (Entidades, Puertos, Value Objects, Enums)
```

### Las 4 Capas Explicadas

```
DOMINIO (src/domain/)
¿Qué es?     El corazón de la aplicación
¿Qué tiene?  Entidades, Value Objects, Enums, Errors, Puertos
¿Qué sabe?   Las reglas del negocio educativo
¿Qué NO sabe? NADA de React, Axios, Tailwind, Base de datos
Ejemplo:     "Un curso tiene título, descripción y estado"

APLICACIÓN (src/application/)
¿Qué es?     Los casos de uso del sistema
¿Qué tiene?  Use Cases, DTOs, Mappers
¿Qué sabe?   Qué acciones puede hacer el usuario
¿Qué NO sabe? NADA de React ni de cómo se conecta al servidor
Ejemplo:     "El docente puede crear un curso"

INFRAESTRUCTURA (src/infrastructure/)
¿Qué es?     La conexión con el mundo exterior
¿Qué tiene?  Repositories, HTTP Client, Storage, Analytics
¿Qué sabe?   Cómo hablar con el servidor, guardar datos, etc
¿Qué NO sabe? NADA de React ni de la interfaz visual
Ejemplo:     "Para crear un curso hago POST /api/courses"

PRESENTACIÓN (src/presentation/)
¿Qué es?     Todo lo que el usuario ve e interactúa
¿Qué tiene?  Componentes, Páginas, Hooks, Contexts, Layouts
¿Qué sabe?   Cómo mostrar la información bonita
¿Qué NO sabe? NADA de las reglas de negocio internas
Ejemplo:     "Muestro una tarjeta con el nombre del curso"
```

### Analogía Simple

Piensa en un **restaurante**:

```
DOMINIO        = Las RECETAS (no cambian si cambias la cocina)
APLICACIÓN     = El CHEF que decide qué preparar
INFRAESTRUCTURA = La COCINA y los PROVEEDORES de ingredientes
PRESENTACIÓN   = El MESERO y la DECORACIÓN del restaurante
```

---

## 3.  Estructura de Carpetas Explicada

### Vista General con Explicaciones

```
src/
|
domain/                    NUNCA importar React ni Axios aquí
  shared/                  Cosas que TODOS los dominios comparten
    entities/             Tipos base (BaseEntity, PaginatedResult)
    value-objects/        Validaciones encapsuladas (Email, HexColor)
    enums/                Constantes tipadas (UserRole, Permission)
    errors/               Errores de negocio (ValidationError)
    interfaces/           Contratos base (Repository, UseCase)
  
  auth/                   Dominio autenticación
    entities/             AuthToken, Session
    ports/                AuthRepository.port.ts (CONTRATO)
  
  users/                  Dominio usuarios
    entities/             User, UserProfile
    ports/                UserRepository.port.ts (CONTRATO)
  
  [otros dominios...]     Misma estructura para cada módulo

application/              Solo importa de domain/
  shared/                 DTOs y mappers compartidos
    dto/                  PaginationRequest, ApiResponse
    mappers/              BaseMapper
  
  auth/                   Casos de uso de auth
    usecases/             Login.usecase.ts, Logout.usecase.ts
    dto/                  LoginRequest.dto.ts, LoginResponse.dto.ts
    mappers/              AuthMapper.ts
  
  [otros módulos...]      Misma estructura para cada módulo

infrastructure/          Implementa los ports del domain
  http/                  Cliente HTTP (Axios)
    axios.config.ts       Configuración base
    AxiosHttpClient.ts    Implementación del cliente
    interceptors/         Auth, Refresh, Error interceptors
  
  repositories/          Implementaciones de los ports
    AuthRepository.impl.ts
    UserRepository.impl.ts
    [otros repos...]
  
  storage/               LocalStorage, Cookies, SessionStorage
  security/              TokenManager, PermissionGuard
  analytics/             Google Analytics, Plausible adapters
  file-handlers/         PDF, Word, Excel viewers
  di/                    Contenedor de inyección de dependencias

presentation/            Todo lo visual (React)
  design-system/         Componentes UI reutilizables
    tokens/              Colores, tipografía, espaciado
    primitives/          Button, Input, Modal, Skeleton, etc
  
  layouts/               Estructura visual por rol
    components/          Sidebar, Navbar, MobileNav, Footer
    PublicLayout.tsx
    AdminLayout.tsx
    TeacherLayout.tsx
    StudentLayout.tsx
  
  guards/                Protección visual de rutas/componentes
    AuthGuard.tsx
    RoleGuard.tsx
    PermissionGuard.tsx
  
  hooks/                 Custom hooks compartidos
    useAuth.ts
    useTheme.ts
    usePermissions.ts
    useMediaQuery.ts
  
  contexts/              React Contexts globales
    AuthContext.tsx
    ThemeContext.tsx
    PermissionContext.tsx
  
  stores/                Zustand stores
    auth.store.ts
    theme.store.ts
    ui.store.ts
  
  features/              Componentes específicos por funcionalidad
    auth/                LoginForm, RegisterForm
    course-management/   CourseList, CourseForm, CourseCard
    file-management/     FileUploadZone, PDFViewer
    grade-management/    GradeGrid, GradeForm
    [otras features...]
  
  pages/                 Páginas finales por rol
    public/              LoginPage, RegisterPage
    institution/         InstitutionDashboardPage
    admin/               AdminDashboardPage
    teacher/             TeacherDashboardPage
    student/             StudentDashboardPage
  
  feedback/              Estados de carga, error, vacío
    LoadingScreen.tsx
    ErrorBoundary.tsx
    EmptyState.tsx

routes/                  Configuración de navegación
  AppRouter.tsx
  PrivateRoute.tsx
  PublicRoute.tsx
  RoleRoute.tsx
  definitions/           Rutas por rol

config/                  Configuraciones globales
  app.config.ts
  api.config.ts
  permissions.config.ts
  analytics.config.ts

utils/                   Funciones utilitarias puras
  cn.ts                  Merge de clases Tailwind
  color.utils.ts         hexToRgb, isValidHex
  formatters.ts          formatDate, formatFileSize
  validators.ts          isValidEmail, isValidFileType

types/                   Tipos TypeScript globales
tests/                   Testing setup y mocks
styles/                  CSS global y animaciones
```

---

## 4.  Reglas de Oro (NO ROMPER)

### Regla #1: Dirección de Dependencias

```
CORRECTO (de afuera hacia adentro):
presentation -> infrastructure -> application -> domain

INCORRECTO (nunca de adentro hacia afuera):
domain -> application        PROHIBIDO
domain -> infrastructure     PROHIBIDO
domain -> presentation       PROHIBIDO
application -> presentation  PROHIBIDO
application -> infrastructure PROHIBIDO
```

### Tabla de Imports Permitidos

```
Yo soy...         domain/   application/  infrastructure/    presentation/
domain/           Sí        No            No                  No
application/      Sí        Sí            No                  No
infrastructure/   Sí        Sí            Sí                  No
presentation/     Sí        Sí            Sí                  Sí
```

### Regla #2: Domain es Puro

```typescript
// PROHIBIDO en domain/
import React from 'react'                    // NO
import axios from 'axios'                     // NO
import { useQuery } from '@tanstack/react-query' // NO
import { cn } from '@utils/cn'                // NO

// PERMITIDO en domain/
import type { BaseEntity } from '../shared/entities/BaseEntity'
import { UserRole } from '../shared/enums/UserRole.enum'
```

### Regla #3: Un Equipo, Sus Carpetas

```
PROHIBIDO: Equipo 1 modifica archivos de domain/auth/ (es del Equipo 8)
CORRECTO:  Equipo 1 solo trabaja en domain/courses/, domain/modules/, domain/contents/

PROHIBIDO: Equipo 10 modifica presentation/pages/admin/ (es del Equipo 4)
CORRECTO:  Equipo 10 solo trabaja en presentation/pages/student/
```

### Regla #4: Componentes Compartidos se Discuten

```
Si necesitas modificar algo en:
   - presentation/design-system/    Avisar a TODOS los equipos
   - domain/shared/                 Avisar a TODOS los equipos
   - infrastructure/http/           Avisar a TODOS los equipos
   - config/                        Avisar a TODOS los equipos
   - utils/                         Avisar a TODOS los equipos
   - routes/AppRouter.tsx           Avisar a TODOS los equipos

Estos archivos deben modificarse mediante PULL REQUEST con revisión
```

### Regla #5: Nomenclatura Obligatoria

```
Carpetas:        kebab-case     course-management/
Componentes:     PascalCase     CourseCard.tsx
Hooks:           camelCase      useCourses.ts
Utilidades:      camelCase      formatters.ts
Tipos:           PascalCase     Button.types.ts
Entidades:       PascalCase     Course.ts
Puertos:         PascalCase     CourseRepository.port.ts
Implementaciones:PascalCase     CourseRepository.impl.ts
Casos de uso:    PascalCase     CreateCourse.usecase.ts
DTOs:            PascalCase     CreateCourseRequest.dto.ts
Enums:           PascalCase     UserRole.enum.ts
Tests:           PascalCase     CourseCard.test.tsx
Stores:          camelCase      auth.store.ts
Barrel exports:  index.ts       index.ts (siempre)
```

---

## 5.  Flujo de Datos en la Aplicación

### Flujo Completo: Usuario hace clic -> Datos llegan a la pantalla

```
1. USUARIO
   Hace clic en "Crear Curso"

2. PÁGINA (presentation/pages/)
   TeacherCoursesPage.tsx renderiza CourseForm

3. FEATURE COMPONENT (presentation/features/)
   CourseForm.tsx usa el hook useCreateCourse()

4. CUSTOM HOOK (presentation/features/course-management/hooks/)
   useCreateCourse() llama al use case vía TanStack Query

5. USE CASE (application/courses/usecases/)
   CreateCourse.usecase.ts valida datos y llama al repositorio

6. REPOSITORY IMPL (infrastructure/repositories/)
   CourseRepository.impl.ts hace la petición HTTP

7. HTTP CLIENT (infrastructure/http/)
   AxiosHttpClient hace POST /api/courses con Bearer Token

8. INTERCEPTOR (infrastructure/http/interceptors/)
   auth.interceptor.ts agrega el token automáticamente

9. SERVIDOR (Backend API)
   Recibe la petición, procesa, responde JSON

10. MAPPER (application/courses/mappers/)
    CourseMapper.ts transforma la respuesta del server a entidad

11. COMPONENTE SE ACTUALIZA
    React re-renderiza con los nuevos datos
```

---

## 6.  Cómo Crear una Nueva Funcionalidad (Paso a Paso)

### Checklist Universal para Cualquier Feature Nueva

```
PASO 1: DOMAIN (¿Qué datos manejo?)
  Crear/actualizar entidad en domain/[modulo]/entities/
  Crear/actualizar puerto en domain/[modulo]/ports/
  Actualizar barrel export (index.ts)

PASO 2: APPLICATION (¿Qué acciones hay?)
  Crear DTOs de request/response
  Crear mapper
  Crear use case
  Actualizar barrel export (index.ts)

PASO 3: INFRASTRUCTURE (¿Cómo me conecto?)
  Implementar o actualizar repositorio
  Actualizar barrel export (index.ts)

PASO 4: PRESENTATION (¿Cómo se ve?)
  Crear custom hook en features/[feature]/hooks/
  Crear componente(s) en features/[feature]/components/
  Crear o actualizar página en pages/[rol]/
  Actualizar rutas si es necesario
  Actualizar barrel export (index.ts)

PASO 5: VERIFICACIÓN
  ¿Respeté la dirección de dependencias?
  ¿No modifiqué archivos de otro equipo?
  ¿Usé componentes del design system?
  ¿Es responsive (mobile-first)?
  ¿Usé PermissionGuard donde corresponde?
```

---

## 7.  Design System - Cómo Usar y Crear Componentes

### Estructura de un Componente del Design System

```
src/presentation/design-system/primitives/Button/
  Button.tsx          El componente
  Button.types.ts     Los tipos/props
  Button.test.tsx     Los tests
  index.ts            El barrel export
```

### Cómo USAR un Componente del Design System

```tsx
import { Button } from '@presentation/design-system/primitives/Button'
import { Search, Plus } from 'lucide-react'

// Variantes
<Button variant="primary">Guardar</Button>
<Button variant="secondary">Cancelar</Button>
<Button variant="inverted">Eliminar</Button>
<Button variant="outlined">Ver más</Button>

// Con iconos
<Button leftIcon={<Plus size={18} />}>Nuevo Curso</Button>
<Button rightIcon={<Search size={18} />}>Buscar</Button>

// Estados
<Button loading>Guardando...</Button>
<Button disabled>No disponible</Button>

// Tamaños
<Button size="sm">Pequeño</Button>
<Button size="md">Mediano</Button>
<Button size="lg">Grande</Button>

// Full width (mobile-first)
<Button fullWidth>Ocupar todo el ancho</Button>
```

---

## 8.  Sistema de Temas Dinámicos

### ¿Cómo Funciona?

```
1. Super Admin configura colores HEX para su institución
2. Al login, se carga el tema de la institución desde el API
3. Los colores se aplican como CSS Variables en :root
4. Tailwind usa esas variables -> TODA la UI cambia automáticamente
```

### Cómo Usar los Colores del Tema

```tsx
// CORRECTO - Usa las clases de Tailwind configuradas
<h1 className="text-primary">Título</h1>
<p className="text-secondary">Subtítulo</p>
<span className="text-tertiary">Etiqueta</span>
<div className="bg-primary text-white">Header</div>

// CORRECTO - Escalas de colores
<button className="bg-primary hover:bg-primary-700">Click</button>
<div className="bg-secondary-50 text-secondary-700">Card</div>

// INCORRECTO - No usar colores hardcodeados
<h1 className="text-[#223740]">NO hagas esto</h1>
<div className="bg-[#5A878C]">NI esto</div>
```

---

## 9.  Sistema de Seguridad y Autenticación

### Flujo de Autenticación

```
1. Usuario ingresa email + password
2. POST /api/auth/login (SIN token)
3. Server responde con:
   {
     accessToken: "eyJhbG...",
     refreshToken: "eyJhbG...",
     user: { id, email, role, permissions }
   }
4. TokenManager guarda tokens en cookies seguras
5. AuthContext actualiza el estado global
6. Router redirige según el rol:
   super_admin -> /institution/dashboard
   admin       -> /admin/dashboard
   teacher     -> /teacher/dashboard
   student     -> /student/dashboard

EN CADA PETICIÓN POSTERIOR:
auth.interceptor agrega automáticamente:
Authorization: Bearer eyJhbG...

SI EL TOKEN EXPIRA (401):
1. refresh.interceptor intenta renovar
2. Si renueva -> reintenta la petición original
3. Si falla   -> limpia tokens -> redirige a /login
```

---

## 10.  Sistema de Permisos y Guards

### Tipos de Guards

```
AuthGuard        Requiere estar logueado
RoleGuard        Requiere un rol específico
PermissionGuard  Requiere un permiso específico
```

### Cómo Usar los Guards

**Proteger una RUTA completa:**

```tsx
import { RoleRoute } from '@routes/RoleRoute'
import { UserRole } from '@domain/shared/enums/UserRole.enum'

export const teacherRoutes = [
  {
    path: '/teacher',
    element: <RoleRoute allowedRoles={[UserRole.TEACHER]} />,
    children: [
      { path: 'dashboard', element: <TeacherDashboardPage /> },
      { path: 'courses', element: <TeacherCoursesPage /> },
    ],
  },
]
```

**Proteger un BOTÓN o SECCIÓN:**

```tsx
import { PermissionGuard } from '@presentation/guards/PermissionGuard'
import { Permission } from '@domain/shared/enums/Permission.enum'

function CourseActions({ courseId }: { courseId: string }) {
  return (
    <div className="flex gap-2">
      {/* Todos ven el botón de ver */}
      <Button variant="secondary">Ver Curso</Button>

      {/* Solo quienes pueden editar ven este botón */}
      <PermissionGuard permission={Permission.COURSES_EDIT}>
        <Button variant="primary">Editar</Button>
      </PermissionGuard>

      {/* Solo quienes pueden eliminar ven este botón */}
      <PermissionGuard permission={Permission.COURSES_DELETE}>
        <Button variant="inverted">Eliminar</Button>
      </PermissionGuard>
    </div>
  )
}
```

---

## 11.  Sistema de Analytics

### Cómo Trackear Eventos

```tsx
import { useAnalytics } from '@presentation/hooks/useAnalytics'

function CourseViewerPage() {
  const { trackEvent, trackPageView } = useAnalytics()

  // Trackear cuando el usuario ve la página
  useEffect(() => {
    trackPageView('/student/course/123')
  }, [])

  // Trackear cuando el usuario descarga un archivo
  const handleDownload = (fileId: string) => {
    trackEvent('file_download', {
      fileId,
      fileType: 'pdf',
      courseName: 'React Avanzado',
    })
  }

  return (/* ... */)
}
```

### Eventos Estándar que Deben Trackearse

```
Evento                   Cuándo disparar
page_view                Al entrar a cada página
login_success            Login exitoso
login_failed             Login fallido
course_viewed            Al abrir un curso
module_started           Al iniciar un módulo
module_completed         Al terminar un módulo
content_viewed           Al ver contenido
video_played             Al reproducir un video
video_completed          Al terminar un video
file_downloaded          Al descargar archivo
grade_assigned           Docente asigna nota
certification_generated  Se genera certificado
search_performed         Al buscar algo
profile_updated          Al actualizar perfil
```

---

## 12.  Sistema de Rutas

### Estructura de Rutas

```
/ (raíz)
/login                          Público
/register                       Público
/forgot-password                Público
/reset-password/:token          Público

/institution/                   Solo Super Admin
  dashboard
  settings
  theme
  users
  reports

/admin/                         Solo Admin
  dashboard
  users
  courses
  roles
  reports
  settings

/teacher/                       Solo Docente
  dashboard
  courses
  courses/:courseId
  courses/:courseId/modules/:moduleId
  grades
  competencies
  students/:studentId/progress

/student/                       Solo Estudiante
  dashboard
  my-learning
  courses/:courseId
  courses/:courseId/modules/:moduleId
  courses/:courseId/content/:contentId
  grades
  certifications
  competencies
  profile

/404                            Not Found
```

---

## 13.  Manejo de Estado

### Cuándo Usar Qué

```
Tipo de Estado         Herramienta a Usar
Datos del servidor     TanStack Query (useQuery, useMutation
(cursos, usuarios)     con cache y refetch automático)

Estado global de UI    Zustand (sidebar abierto, modal,
(sidebar, theme)       toast notifications)

Estado de formulario   React Hook Form + Zod
(formularios complejos) (validación, errores, submit)

Estado local simple    useState
(componente simple)   (dropdowns, toggles)
```

---

## 14.  Manejo de Formularios

### Estructura Estándar de Formularios

```tsx
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@presentation/design-system/primitives/Button'
import { Input } from '@presentation/design-system/primitives/Input'

// 1. Definir schema de validación
const courseSchema = z.object({
  title: z.string().min(3, 'El título debe tener al menos 3 caracteres'),
  description: z.string().min(10, 'La descripción debe tener al menos 10 caracteres'),
})

type CourseFormData = z.infer<typeof courseSchema>

// 2. Componente del formulario
export function CourseForm({ onSuccess }: { onSuccess?: () => void }) {
  const form = useForm<CourseFormData>({
    resolver: zodResolver(courseSchema),
    defaultValues: { title: '', description: '' },
  })

  const handleSubmit = form.handleSubmit(async (data) => {
    try {
      // Lógica de submit
      onSuccess?.()
    } catch (error) {
      // El error se maneja automáticamente
    }
  })

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Título del curso"
        error={form.formState.errors.title?.message}
        {...form.register('title')}
      />

      <Input
        label="Descripción"
        error={form.formState.errors.description?.message}
        {...form.register('description')}
      />

      <Button type="submit" variant="primary">
        Crear Curso
      </Button>
    </form>
  )
}
```

---

## 15.  Testing

### Estructura de Tests

```
src/tests/
  setup.ts              Configuración global de tests
  mocks/                Mocks de API y servicios
  factories/            Generadores de datos de prueba
  helpers/              Utilidades de testing
```

### Ejemplo de Test de Componente

```tsx
// src/presentation/features/course-management/components/CourseCard.test.tsx
import { render, screen } from '@testing-library/react'
import { CourseCard } from './CourseCard'
import { courseFactory } from '@tests/factories/course.factory'

describe('CourseCard', () => {
  it('should render course information correctly', () => {
    const course = courseFactory.build({
      title: 'React Avanzado',
      description: 'Aprende React a fondo',
      enrolledStudents: 25,
    })

    render(<CourseCard course={course} />)

    expect(screen.getByText('React Avanzado')).toBeInTheDocument()
    expect(screen.getByText('Aprende React a fondo')).toBeInTheDocument()
    expect(screen.getByText('25 estudiantes')).toBeInTheDocument()
  })
})
```

---

## 16.  Guías Específicas por Equipo

### Equipo 1: Contenido Académico (Cursos, Módulos, Contenidos)

**Carpetas asignadas:**
```
domain/courses/
domain/modules/
domain/contents/
application/courses/
application/modules/
application/contents/
infrastructure/repositories/[modulo].impl.ts
presentation/features/course-management/
presentation/features/module-management/
presentation/features/content-management/
presentation/pages/teacher/
```

**Responsabilidades:**
- Crear, editar, eliminar cursos
- Gestionar módulos dentro de cursos
- Crear y organizar contenido (videos, textos, archivos)
- Vista del docente para gestión de contenido
- Vista del estudiante para consumo de contenido

**Endpoints principales:**
```
POST   /api/courses
GET    /api/courses
PUT    /api/courses/:id
DELETE /api/courses/:id
POST   /api/courses/:id/modules
GET    /api/courses/:id/modules
PUT    /api/modules/:id
DELETE /api/modules/:id
POST   /api/modules/:id/contents
GET    /api/modules/:id/contents
PUT    /api/contents/:id
DELETE /api/contents/:id
```

### Equipo 2: Gestión de Archivos

**Carpetas asignadas:**
```
domain/files/
application/files/
infrastructure/repositories/FileRepository.impl.ts
infrastructure/file-handlers/
presentation/features/file-management/
```

**Responsabilidades:**
- Subir archivos (PDF, Word, Excel, Video)
- Previsualizar archivos en el navegador
- Descargar archivos
- Validar tipos y tamaños de archivo
- Gestión de almacenamiento

**Endpoints principales:**
```
POST   /api/files/upload
GET    /api/files/:id
GET    /api/files/:id/download
DELETE /api/files/:id
```

### Equipo 3: Vista Institución (Super Admin)

**Carpetas asignadas:**
```
domain/institutions/
application/institutions/
infrastructure/repositories/InstitutionRepository.impl.ts
presentation/pages/institution/
presentation/layouts/InstitutionLayout.tsx
```

**Responsabilidades:**
- Dashboard de Super Admin
- Configuración de la institución
- Personalización visual (logo, colores)
- Gestión de usuarios a nivel global
- Reportes institucionales

**Endpoints principales:**
```
GET    /api/institution/settings
PUT    /api/institution/settings
POST   /api/institution/theme
GET    /api/institution/users
GET    /api/institution/reports
```

### Equipo 4: Vista Administrador

**Carpetas asignadas:**
```
presentation/pages/admin/
presentation/layouts/AdminLayout.tsx
```

**Responsabilidades:**
- Dashboard de administrador
- Gestión de usuarios y roles
- Asignación de docentes a cursos
- Reportes administrativos
- Configuración general

### Equipo 5: Evaluación (Notas y Certificaciones)

**Carpetas asignadas:**
```
domain/grades/
domain/certifications/
application/grades/
application/certifications/
infrastructure/repositories/[modulo].impl.ts
presentation/features/grade-management/
presentation/features/certification-management/
```

**Responsabilidades:**
- Asignar calificaciones por módulo
- Calcular promedios finales
- Generar certificados PDF
- Vista de notas para estudiantes
- Reportes de rendimiento

**Endpoints principales:**
```
POST   /api/grades
GET    /api/grades/student/:studentId
GET    /api/grades/course/:courseId
POST   /api/certifications
GET    /api/certifications/:studentId
GET    /api/certificates/:id/download
```

### Equipo 6: Vista Docente

**Carpetas asignadas:**
```
presentation/pages/teacher/
presentation/layouts/TeacherLayout.tsx
```

**Responsabilidades:**
- Dashboard del docente
- Gestión de sus cursos
- Calificación de estudiantes
- Seguimiento de progreso
- Herramientas de enseñanza

### Equipo 7: Desarrollo Humano (Competencias Socioemocionales)

**Carpetas asignadas:**
```
domain/socio-emotional/
application/socio-emotional/
infrastructure/repositories/SocioEmotionalRepository.impl.ts
presentation/features/socio-emotional/
```

**Responsabilidades:**
- Definición de competencias
- Evaluación de habilidades blandas
- Seguimiento de desarrollo
- Reportes de competencias
- Feedback a estudiantes

**Endpoints principales:**
```
GET    /api/competencies
POST   /api/competencies/evaluations
GET    /api/competencies/student/:studentId
GET    /api/competencies/reports
```

### Equipo 8: Seguridad y Acceso (Auth, Usuarios, Roles)

**Carpetas asignadas:**
```
domain/auth/
domain/users/
domain/roles/
application/auth/
application/users/
application/roles/
infrastructure/security/
infrastructure/repositories/[modulo].impl.ts
presentation/features/auth/
presentation/pages/public/
```

**Responsabilidades:**
- Login, logout, registro
- Gestión de tokens
- Permisos y roles granulares
- Guards de rutas y componentes
- Recuperación de contraseña

**Endpoints principales:**
```
POST   /api/auth/login
POST   /api/auth/logout
POST   /api/auth/register
POST   /api/auth/refresh
GET    /api/users
POST   /api/users
PUT    /api/users/:id
DELETE /api/users/:id
GET    /api/roles
GET    /api/permissions
```

### Equipo 9: Inteligencia de Datos (Analytics y Reportes)

**Carpetas asignadas:**
```
domain/analytics/
application/analytics/
infrastructure/analytics/
infrastructure/repositories/AnalyticsRepository.impl.ts
presentation/features/analytics-dashboard/
```

**Responsabilidades:**
- Dashboard de analytics
- Reportes personalizables
- Integración con Google Analytics/Plausible
- Métricas de uso
- Exportación de datos

**Endpoints principales:**
```
GET    /api/analytics/dashboard
GET    /api/analytics/reports
POST   /api/analytics/events
GET    /api/analytics/metrics
POST   /api/analytics/export
```

### Equipo 10: Experiencia Estudiantil

**Carpetas asignadas:**
```
presentation/pages/student/
presentation/layouts/StudentLayout.tsx
```

**Responsabilidades:**
- Dashboard del estudiante
- Vista de cursos inscritos
- Progreso de aprendizaje
- Vista de notas y certificados
- Perfil y configuración personal

---

## 17.  Convenciones de Código

### TypeScript

```typescript
// Usar tipos explícitos
const user: User = { id: '1', name: 'John' }

// Preferir interfaces para objetos
interface User {
  id: string
  name: string
}

// Usar tipos union para valores específicos
type Status = 'active' | 'inactive' | 'pending'

// Evitar any, usar unknown si es necesario
function processData(data: unknown) {
  // Validar y castear
}
```

### React

```tsx
// Componentes funcionales con TypeScript
interface ButtonProps {
  variant: 'primary' | 'secondary'
  children: React.ReactNode
  onClick?: () => void
}

export function Button({ variant, children, onClick }: ButtonProps) {
  return (
    <button className={`btn-${variant}`} onClick={onClick}>
      {children}
    </button>
  )
}

// Custom hooks con prefijo "use"
export function useUser() {
  const [user, setUser] = useState<User | null>(null)
  return { user, setUser }
}
```

### CSS/Tailwind

```tsx
// Mobile-first
<div className="w-full md:w-1/2 lg:w-1/3">

// Usar clases semánticas del design system
<Button variant="primary" size="lg">
  Submit
</Button>

// Evitar estilos inline
// <div style={{ color: 'red' }}> NO
<div className="text-red-500"> YES
```

### Nombres de Archivos

```
Componentes:    PascalCase.tsx     (Button.tsx)
Hooks:          camelCase.ts       (useUser.ts)
Utils:          camelCase.ts       (formatters.ts)
Types:          PascalCase.ts      (Button.types.ts)
Tests:          PascalCase.test.tsx (Button.test.tsx)
Stores:         camelCase.ts       (auth.store.ts)
```

---

## 18.  Errores Comunes y Cómo Evitarlos

### Error #1: Importar React en Domain

```typescript
// INCORRECTO
import React from 'react' // En domain/

// CORRECTO
import type { BaseEntity } from '../shared/entities/BaseEntity'
```

### Error #2: Romper la Arquitectura

```typescript
// INCORRECTO - Lógica de negocio en componente
function CourseList() {
  const [courses, setCourses] = useState([])
  
  useEffect(() => {
    axios.get('/api/courses').then(res => setCourses(res.data))
  }, [])
}

// CORRECTO - Separar responsabilidades
function CourseList() {
  const { data: courses, isLoading } = useCourses()
  // ...
}
```

### Error #3: No Usar el Design System

```typescript
// INCORRECTO - Botón custom
<button className="bg-blue-500 text-white px-4 py-2 rounded">
  Click
</button>

// CORRECTO - Usar componente del design system
<Button variant="primary">Click</Button>
```

### Error #4: Hardcodear Colores

```typescript
// INCORRECTO
<div className="bg-[#223740] text-white">

// CORRECTO
<div className="bg-primary text-white">
```

### Error #5: No Manejar Estados de Carga

```typescript
// INCORRECTO
function CourseList() {
  const { data: courses } = useCourses()
  return <div>{courses.map(/* ... */)}</div>
}

// CORRECTO
function CourseList() {
  const { data: courses, isLoading, error } = useCourses()
  
  if (isLoading) return <LoadingScreen />
  if (error) return <ErrorMessage error={error} />
  if (!courses?.length) return <EmptyState />
  
  return <div>{courses.map(/* ... */)}</div>
}
```

---

## 19.  FAQ

### P: ¿Puedo usar useState en lugar de Zustand?

R: Para estado local simple (un dropdown, un toggle), sí usa `useState`. Para estado global que necesita compartirse entre componentes (sidebar abierto, tema actual, usuario logueado), usa Zustand.

### P: ¿Cómo sé si necesito crear un nuevo componente para el Design System?

R: Si el componente se va a reutilizar en 3+ lugares diferentes o es un patrón UI común (botón, input, modal), créalo en el Design System. Si es específico de una feature, déjalo en la feature.

### P: ¿Puedo modificar archivos de otro equipo?

R: Solo si es absolutamente necesario y mediante Pull Request con revisión. Primero intenta hablar con el equipo responsable.

### P: ¿Cómo manejo errores de API?

R: TanStack Query maneja automáticamente errores de red y 4xx/5xx. Usa el estado `error` del hook y muestra mensajes amigables al usuario.

### P: ¿Qué hago si necesito una nueva dependencia?

R: Discútelo con los líderes técnicos. Si es una dependencia grande (Redux, Material-UI), probablemente no. Si es una librería pequeña y específica (date-fns, clsx), probablemente sí.

### P: ¿Cómo testeo componentes que usan hooks?

R: Usa `renderHook` de Testing Library para hooks, y `render` normal para componentes que usan hooks internamente.

### P: ¿Puedo usar CSS en lugar de Tailwind?

R: Para estilos globales y animaciones, sí usa CSS en `styles/`. Para estilos de componentes, usa siempre Tailwind.

### P: ¿Cómo manejo responsive design?

R: Siempre mobile-first. Diseña primero para móvil (`xs`), luego usa `sm:`, `md:`, `lg:` para pantallas más grandes.

### P: ¿Qué pasa si el backend no está listo?

R: Usa MSW para mockear las respuestas del API. Cada equipo debe crear sus propios mocks.

### P: ¿Cómo deployo la aplicación?

R: Ejecuta `npm run build` y sube la carpeta `dist/` a tu hosting preferido. Las variables de entorno se configuran en el servidor.

---

## 20.  Checklist de Pre-Commit

Antes de hacer commit de tu código, verifica:

```
- [ ] Mi código sigue la arquitectura hexagonal
- [ ] No importé React/Axios en domain/
- [ ] Usé componentes del Design System cuando aplica
- [ ] Mi código es responsive (mobile-first)
- [ ] Usé PermissionGuard donde corresponde
- [ ] Manejé estados de carga y error
- [ ] Mis tests pasan
- [ ] Mi código está formateado (npm run format)
- [ ] No hay errores de TypeScript (npm run type-check)
- [ ] No modifiqué archivos de otros equipos sin permiso
- [ ] Mis nombres de archivos siguen la convención
```

---

## 21.  Recursos y Herramientas

### Documentación
- [React 19 Docs](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Zustand](https://zustand.docs.pmnd.rs/)
- [TanStack Query](https://tanstack.com/query/latest)
- [React Hook Form](https://react-hook-form.com/)

### Herramientas de Desarrollo
- VS Code con extensiones de React, TypeScript, Tailwind
- React Developer Tools
- Redux DevTools (para Zustand)
- Network tab para debugging de API

### Comandos Útiles
```bash
npm run dev          # Iniciar desarrollo
npm run build        # Build para producción
npm run test         # Ejecutar tests
npm run test:ui      # UI de tests
npm run lint         # Linting
npm run format       # Formateo
npm run type-check   # Verificar tipos
```

---

## 22.  Soporte y Comunicación

### Canales de Comunicación
- **Slack**: #iush-dev para desarrollo general
- **Slack**: #iush-equipo-[numero] para comunicación por equipo
- **GitHub Issues**: Para bugs y features
- **Pull Requests**: Para revisión de código

### Reportar Issues
1. Buscar si ya existe un issue
2. Crear nuevo issue con template
3. Asignar al equipo responsable
4. Etiquetar con prioridad y tipo

### Pedir Ayuda
1. Primero buscar en esta documentación
2. Preguntar en el canal del equipo
3. Si es general, preguntar en #iush-dev
4. Para problemas críticos, @mention a los líderes técnicos

---

**¡Bienvenidos a Iush! Esta guía será su mejor amiga durante el desarrollo. Si algo no está claro, pregunten. Estamos aquí para construir algo increíble juntos.**
