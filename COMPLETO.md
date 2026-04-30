# 📚 Plataforma IUSH - Guía Completa

## 🎯 ¿Nuevo aquí? Empieza aquí

---

## 🎓 ¿Qué es Plataforma IUSH?

**Plataforma LMS tipo Duolingo/Platzi** para educación superior con:

- **Suscripciones pagas** por institución
- **Multi-tenant** - Cada cliente tiene su instancia
- **Contenido multimedia** - Videos, textos, PDF, docs, xlsx
- **Personalización completa** - Logo + colores por institución
- **Seguridad robusta** - Bearer tokens + permisos
- **Analytics integrado** - Google Ad Manager o equivalente

Es una plataforma web donde:
- Los **docentes** crean cursos y suben material
- Los **estudiantes** ven los cursos y hacen tareas  
- Los **administradores** gestionan toda la plataforma
- Las **instituciones** personalizan los colores y logo

---

## 🏗️ Arquitectura Explicada (Para que todos entiendan)

### 🎯 **¿Por qué esta arquitectura y no otra?**

**Problema real:** 32 estudiantes trabajando 2 meses sin que unos bloqueen a otros.

**Solución:** Arquitectura simple por **responsabilidad**, no por patrones complejos.

### 📚 **La Analogía del Departamento**

Imagina un edificio con 10 departamentos (equipos):

```
� EDIFICIO IUSH (32 estudiantes)
├── 🏠 Depto 1: Cursos (Equipo 1)
│   ├── Sala: Crear cursos
│   ├── Cocina: Subir contenido 
│   └── Baño: Gestionar módulos
├── 🏠 Depto 2: Archivos (Equipo 2)
│   ├── Solo maneja archivos
│   └── No necesita permiso de otros deptos
├── 🏠 Depto 8: Seguridad (Equipo 8)
│   ├── Controla llaves (login)
│   ├── Da permisos (roles)
│   └── Otros deptos usan sus llaves
└── 🏠 Depto 10: Estudiantes (Equipo 10)
    ├── Ve sus cursos
    ├── Hace sus tareas
    └── No depende de otros deptos
```

**Regla:** Cada departamento puede funcionar solo, pero comparten servicios básicos (luz, agua = interfaces compartidas).

### 🧠 **Domain Layer (Las REGLAS del juego)**

**¿Qué va aquí?** Solo reglas de negocio, nada de interfaces.

```typescript
// ✅ CORRECTO - Reglas del negocio
export interface Course {
  id: string
  title: string
  minGradeToPass: number  // REGLA: Necesitas 80% para aprobar
}

// ❌ INCORRECTO - No va aquí
export const CourseComponent = () => {  // Esto va a presentation
  return <div>...</div>
}
```

**Por qué separar?**
- **Equipo 1** define las reglas de los cursos
- **Equipo 10** usa esas reglas sin importar componentes
- **Cambio de reglas** no rompe la interfaz

### 🎨 **Presentation Layer (Lo que VE el usuario)**

**¿Qué va aquí?** Solo componentes React, nada de lógica compleja.

```typescript
// ✅ CORRECTO - Solo presentación
export function CourseList() {
  const courses = getCourses()  // Viene del domain
  
  return (
    <div>
      {courses.map(course => (
        <CourseCard key={course.id} course={course} />
      ))}
    </div>
  )
}

// ❌ INCORRECTO - No va aquí
export const calculateGrade = (grade: number) => {  // Esto va al domain
  return grade >= 80 ? 'APROBADO' : 'REPROBADO'
}
```

### 🔄 **Comunicación entre Equipos (El SECRETO)**

**Problema:** Equipo 9 necesita tokens de Equipo 8, pero no puede esperar.

**Solución:** Interfaces compartidas (como contratos).

```typescript
// Paso 1: Equipo 8 define el contrato
// src/domain/shared/interfaces/ITokenManager.ts
export interface ITokenManager {
  getToken(): string | null
  getAuthHeaders(): Record<string, string>
}

// Paso 2: Equipo 9 trabaja con el contrato
// src/domain/analytics/types.ts
import { ITokenManager } from '../shared/interfaces/ITokenManager'

export class AnalyticsService {
  private tokenManager: ITokenManager  // Usa el contrato, no la implementación
  
  static setTokenManager(manager: ITokenManager) {
    this.tokenManager = manager
  }
}

// Paso 3: Cuando Equipo 8 termina, conecta
import { TokenManager } from '../auth/types'
AnalyticsService.setTokenManager(TokenManager)
```

**Resultado:** 
- ✅ Equipo 9 trabaja desde día 1 con mock
- ✅ Equipo 8 trabaja sin presión
- ✅ Integración es una línea de código

---

## 👥 Los 10 Equipos (32 Estudiantes - 2 Meses MVP)

Cada equipo trabaja en su área específica sin estorbar a los demás:

| Equipo | Módulo | Estudiantes | Carpeta Domain | Carpeta Presentation | Estado |
|--------|--------|-----------|----------------|-------------------|---------|
| **Equipo 1** | Cursos, Módulos, Contenidos | ~3 estudiantes | `domain/courses/`, `domain/modules/`, `domain/contents/` | `presentation/features/courses/` | ✅ Listo |
| **Equipo 2** | Gestión de Archivos | ~3 estudiantes | `domain/files/` | `presentation/features/files/` | ✅ Listo |
| **Equipo 3** | Vista Institución (Super Admin) | ~3 estudiantes | `domain/institutions/` | `presentation/features/institutions/` | ✅ Listo |
| **Equipo 4** | Vista Administrador | ~3 estudiantes | `domain/admin/` | `presentation/features/admin/` | ✅ Listo |
| **Equipo 5** | Notas y Certificaciones | ~3 estudiantes | `domain/grades/`, `domain/certifications/` | `presentation/features/grades/` | ✅ Listo |
| **Equipo 6** | Vista Docente | ~3 estudiantes | `domain/teacher/` | `presentation/features/teacher/` | ✅ Listo |
| **Equipo 7** | Competencias Socioemocionales | ~3 estudiantes | `domain/socio-emotional/` | `presentation/features/socio-emotional/` | ✅ Listo |
| **Equipo 8** | Login, Usuarios, Roles | ~3 estudiantes | `domain/auth/`, `domain/users/`, `domain/roles/` | `presentation/features/auth/` | ✅ Listo |
| **Equipo 9** | Reportes (Ad Manager) | ~3 estudiantes | `domain/analytics/` | `presentation/features/analytics/` | ✅ Listo |
| **Equipo 10** | Vista Estudiante | ~3 estudiantes | `domain/student/` | `presentation/features/student/` | ✅ Listo |

**Regla de oro:** Cada equipo toca SOLO su área asignada, sin sobre-ingeniería.

---

## 🛠️ Tecnologías (En español simple)

### Frontend (Lo que ve el usuario)
- **React**: Como LEGO para construir interfaces web
- **TypeScript**: JavaScript con reglas para evitar errores
- **Tailwind CSS**: Como pintura premezclada para estilos rápidos
- **Vite**: Un constructor súper rápido

### Backend (Lo que no se ve)
- **Node.js**: El motor que corre todo
- **Zustand**: Una caja para guardar información temporal
- **Axios**: El cartero que lleva mensajes a otros servidores

### Calidad (Para que no se rompa)
- **Tests**: Pequeños robots que prueban que todo funciona
- **ESLint**: Un corrector de gramática para código
- **GitHub Actions**: Robots que revisan el código automáticamente

---

## 🏗️ Arquitectura MVP Simple (2 Meses)

### Estructura de Carpetas
- **Domain Layer**: Tipos simples y lógica por equipo
- **Presentation Layer**: Componentes React y vistas
- **Routes**: Navegación básica
- **Stores**: Estado global simple
- **Tests**: Pruebas automatizadas

### Módulos por Equipo (32 Estudiantes)
1. **Auth** (Equipo 8): Login, usuarios, roles - `domain/auth/`, `domain/users/`, `domain/roles/`
2. **Courses** (Equipo 1): Cursos, módulos, contenidos - `domain/courses/`, `domain/modules/`, `domain/contents/`
3. **Files** (Equipo 2): Gestión de archivos - `domain/files/`
4. **Institutions** (Equipo 3): Configuración y personalización - `domain/institutions/`
5. **Grades** (Equipo 5): Notas y certificaciones - `domain/grades/`, `domain/certifications/`
6. **Socio-Emotional** (Equipo 7): Competencias blandas - `domain/socio-emotional/`
7. **Analytics** (Equipo 9): Reportes y métricas - `domain/analytics/`
8. **Student** (Equipo 10): Vista estudiante - `domain/student/`
9. **Admin** (Equipo 4): Vista administrador - `domain/admin/`
10. **Teacher** (Equipo 6): Vista docente - `domain/teacher/`
    │   └── student/   # 👨‍🎓 Equipo 10
    └── stores/        de cursos

---

## 🎯 Patrones Importantes (MVP Simple)

**� Arquitectura por Capas**
- **Domain**: Lógica de negocio pura y tipada
- **Presentation**: Vistas React con componentes reutilizables
- **Separación clara**: Cada equipo en su zona sin conflictos

**🔄 Desarrollo Práctico**
- **TypeScript**: Tipado fuerte para evitar errores
- **Componentes**: Reutilizables y mantenibles
- **Tests**: Automatizados para calidad
- **Mobile First**: Responsive desde el inicio

**🎯 Domain-Driven Design**
- El código refleja el negocio real
- Cada "dominio" es un área independiente
- Fácil de entender y mantener

---

## 🚀 Cómo Empezar (Tu Ruta Personal)

### Si eres **nuevo en el proyecto**:

1. **🎯 Encuentra tu equipo** en la tabla de arriba
2. **📁 Ve a tu carpeta** - `src/domain/[tu-área]/`
3. **👀 Crea tipos simples** - Interfaces TypeScript básicas
4. **📋 Crea componentes** - Componentes React simples
5. **🧪 Escribe tests** - Tests básicos para tu código

### Si eres **Equipo 1 (Cursos)**:
```bash
# Trabajas aquí:
src/domain/courses/     # Lógica de cursos
src/presentation/features/courses/  # Vista de cursos
```

### Si eres **Equipo 8 (Login, Usuarios, Roles)**:
```typescript
// src/domain/auth/types.ts
export interface User {
  id: string
  email: string
  role: 'admin' | 'teacher' | 'student'
}

// src/presentation/features/auth/Login.tsx
export function LoginForm() {
  const [email, setEmail] = useState('')
  
  const handleLogin = () => {
    // Lógica de login
  }
  
  return (
    <form>
      <input value={email} onChange={(e) => setEmail(e.target.value)} />
      <button onClick={handleLogin}>Login</button>
    </form>
  )
}
```

### Si eres **Equipo 10 (Estudiantes)**:
```typescript
// src/domain/student/types.ts
export interface Student {
  id: string
  name: string
  email: string
  courses: Course[]
}

// src/presentation/features/student/Dashboard.tsx
export function StudentDashboard() {
  const student = {
    id: '1',
    name: 'Juan Pérez',
    courses: [
      { id: '1', title: 'React', progress: 75 }
    ]
  }
  
  return (
    <div className="p-6">
      <h1>Hola, {student.name}</h1>
      <div className="grid gap-4">
        {student.courses.map(course => (
          <div key={course.id}>
            <h3>{course.title}</h3>
            <div>Progreso: {course.progress}%</div>
          </div>
        ))}
      </div>
    </div>
  )
}
```

### Si eres **cualquier equipo**:
```typescript
// Patrón general:
// src/domain/[tu-area]/types.ts - Interfaces TypeScript
// src/presentation/features/[tu-área]/[Component].tsx - Componentes React
```

### 1. Crear una nueva funcionalidad:

```typescript
// 1. Creas la entidad en domain/
export class Course {
  constructor(private readonly id: UUID) {}
  
  static create(name: string): Course {
    return new Course(UUID.create())
  }
}

// 2. Creas el caso de uso en application/
export class CreateCourseUseCase {
  constructor(private courseRepository: CourseRepository) {}
  
  async execute(name: string): Promise<Course> {
    return this.courseRepository.save(Course.create(name))
  }
}

// 3. Creas la vista en presentation/
export function CreateCoursePage() {
  const mutation = useCreateCourse()
  
  return (
    <form onSubmit={mutation.mutate}>
      <input name="name" />
      <button type="submit">Crear Curso</button>
    </form>
  )
}
```

### 2. Reglas de Oro:

- ** Nunca modifiques código de otro equipo**
- ** Siempre usa las interfaces que te dan**
- ** Escribe tests para tu código**
- ** Usa el design system para componentes**

---

##  Calidad y Automatización

### Tests (Robots que ayudan):

```typescript
// Test básico para un valor objeto
describe('UUID', () => {
  it('should create a valid UUID', () => {
    const uuid = UUID.create()
    expect(uuid.getValue()).toMatch(/^[0-9a-f-]{36}$/)
  })
})

// Test básico para componentes
describe('CourseList', () => {
  it('should render course list', () => {
    render(<CourseList />)
    expect(screen.getByText('Mis Cursos')).toBeInTheDocument()
  })
})
```

### GitHub Actions (Robots automáticos):

- **🔍 Quality Gates**: Revisa que el código esté bonito
- **🛡️ Security Scan**: Busca vulnerabilidades
- **📊 Metrics**: Mide qué tan probado está el código
- **🚀 Deploy**: Publica la aplicación

---

## 📋 Checklist de Calidad

### Para tu código:
- [ ] **TypeScript sin errores** - `npm run type-check`
- [ ] **Linting limpio** - `npm run lint`
- [ ] **Tests funcionando** - `npm run test`
- [ ] **Build exitoso** - `npm run build`

### Para tu PR:
- [ ] **Título claro** - "feat: Agregar creación de cursos"
- [ ] **Descripción** - ¿Qué cambia y por qué
- [ ] **Tests pasando** - `npm run test`
- [ ] **Build exitoso** - `npm run build`

---

## 🎯 MVP Timeline (2 Meses)

### 📅 **Mes 1:**
- ✅ **Semana 1-2**: Setup y estructura (HECHO)
- 🎯 **Semana 3-4**: Desarrollo de módulos core
- 🎯 **Semana 5-6**: Integración y testing

### 📅 **Mes 2:**
- 🎯 **Semana 7-8**: Features avanzadas
- 🎯 **Semana 9-10**: Integraciones finales
- 🎯 **Semana 11-12**: Pruebas y deploy

---

## 🎓 Objetivos de Aprendizaje

### 🎓 **Para los Estudiantes:**
- **React 19 + TypeScript** - Tecnologías del mercado laboral
- **Arquitectura práctica** - Simple y aplicable
- **Trabajo en equipo** - Colaboración y coordinación
- **Testing automatizado** - Calidad de software
- **CI/CD** - Integración y despliegue continuo

### 🏆️ **Para el Profesor:**
- **Proyecto supervisado** - 32 estudiantes trabajando en paralelo
- **Métricas claras** - GitHub Actions para seguimiento
- **Evaluación objetiva** - Tests y coverage para calidad
- **Proyecto portafolio** - Resultado tangible para mostrar

---

## 🎯 Estado Actual del Proyecto

✅ **100% LISTO PARA DESARROLLO**

- **Estructura MVP simple** - Sin sobre-ingeniería
- **32 estudiantes organizados** - 10 equipos definidos
- **Tecnología moderna** - React 19 + TypeScript + Tailwind CSS
- **Testing automatizado** - Vitest + Testing Library
- **CI/CD configurado** - GitHub Actions funcionando
- **Documentación completa** - Guías para todos

**Los equipos pueden empezar a desarrollar INMEDIATAMENTAMENTE.** 🚀

## 📋 Checklist Antes de Contribuir

### Para tu código:
- [ ] **Funciona** - Probado localmente
- [ ] **Tests** - Tiene pruebas básicas
- [ ] **Estilo** - Sigue las reglas de ESLint
- [ ] **Tipo** - TypeScript sin errores
- [ ] **Documentado** - Comentarios donde sea necesario

### Para tu equipo:
- [ ] **Revisa la guía** - Lee `COMPLETO.md`
- [ ] **Encuentra tu módulo** - Usa la tabla de equipos
- [ ] **Sigue patrones** - Copia y adapta ejemplos
- [ ] **Haz PRs descriptivos** - Título claro, descripción clara

### Para tu PR:
- [ ] **Título claro** - "feat: Agregar [funcionalidad]"
- [ ] **Descripción** - ¿Qué cambia y por qué
- [ ] **Tests pasando** - `npm run test`
- [ ] **Build exitoso** - `npm run build`

### Para el proyecto:
- [ ] **Sin errores** - TypeScript y linting limpios
- [ ] **Tests funcionando** - Cobertura básica
- [ ] **Build exitoso** - Compilación exitosa
- [ ] **Documentación actualizada** - Cambios reflejados

---

## 🎯 Estado Actual del Proyecto

✅ **100% LISTO PARA DESARROLLO**

- **Estructura MVP simple** - Sin sobre-ingeniería
- **32 estudiantes organizados** - 10 equipos definidos
- **Tecnología moderna** - React 19 + TypeScript + Tailwind CSS
- **Testing automatizado** - Vitest + Testing Library
- **CI/CD configurado** - GitHub Actions funcionando
- **Documentación completa** - Guías para todos

**Los equipos pueden empezar a desarrollar INMEDIATAMENTE.** 🚀

### Para tu PR:

- [ ] **Título claro** - "feat: Agregar creación de cursos"
- [ ] **Descripción** - ¿Qué cambia y por qué?
- [ ] **Screenshots** - Si es una vista nueva
- [ ] **Tests pasan** - Los robots verifican automáticamente

---

## 🆘 Ayuda y Soporte

### ¿No sabes qué hacer?

1. **📖 Revisa este documento** - La respuesta probablemente está aquí
2. **👥 Habla con tu líder de equipo** - Ellos conocen tu área
3. **🔍 Mira los ejemplos** - Ya hay código funcionando
4. **📚 Consulta la documentación técnica** - Si es un problema complejo

### ¿Problemas comunes?

- **"No encuentro mi código"** → Revisa la tabla de equipos y rutas
- **"No sé cómo empezar"** → Copia un ejemplo existente
- **"Rompi algo de otro equipo"** → No modificaste código ajeno, ¿verdad?
- **"Mis tests no pasan"** → Revisa que estás usando los métodos correctos

---

## 🎓 Resumen para Recordar

**Plataforma IUSH = Google Classroom personalizable**

- **10 equipos** = 10 habitaciones, cada uno en su zona
- **Arquitectura hexagonal** = Cambios seguros y organizados
- **Tecnología moderna** = React + TypeScript + Tailwind
- **Calidad automática** = Tests + Robots + Revisión

**Tu trabajo:** Encuentra tu habitación, construye tu pieza del puzzle. 🧩

---

## 🚀 ¡Listo para empezar!

1. **Encuentra tu equipo** en la tabla de arriba
2. **Ve a tu carpeta** siguiendo la ruta indicada
3. **Mira los ejemplos** y adapta el patrón
4. **Contribuye código** siguiendo el checklist

**¡Bienvenido a Plataforma IUSH!** 🎉

---
