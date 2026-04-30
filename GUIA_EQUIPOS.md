# 📋 Guía Específica por Equipos

## 🎯 **Cómo usar esta guía**

1. **Busca tu equipo** en la tabla abajo
2. **Ve a tu sección** específica
3. **Sigue los pasos** en orden
4. **Copia y adapta** los ejemplos

---

## 🏢 **Tabla de Equipos y Responsabilidades**

| Equipo | Módulo | Integrantes | Carpeta Domain | Carpeta Presentation | Prioridad |
|--------|--------|-------------|----------------|-------------------|-----------|
| **Equipo 1** | Cursos, Módulos, Contenidos | ~3 estudiantes | `domain/courses/`, `domain/modules/`, `domain/contents/` | `presentation/features/courses/` | 🔥 Alta |
| **Equipo 2** | Gestión de Archivos | ~3 estudiantes | `domain/files/` | `presentation/features/files/` | 🔥 Alta |
| **Equipo 3** | Vista Institución (Super Admin) | ~3 estudiantes | `domain/institutions/` | `presentation/features/institutions/` | 🟡 Media |
| **Equipo 4** | Vista Administrador | ~3 estudiantes | `domain/admin/` | `presentation/features/admin/` | 🟡 Media |
| **Equipo 5** | Notas y Certificaciones | ~3 estudiantes | `domain/grades/`, `domain/certifications/` | `presentation/features/grades/` | 🟡 Media |
| **Equipo 6** | Vista Docente | ~3 estudiantes | `domain/teacher/` | `presentation/features/teacher/` | 🟡 Media |
| **Equipo 7** | Competencias Socioemocionales | ~3 estudiantes | `domain/socio-emotional/` | `presentation/features/socio-emotional/` | 🟢 Baja |
| **Equipo 8** | Login, Usuarios, Roles | ~3 estudiantes | `domain/auth/`, `domain/users/`, `domain/roles/` | `presentation/features/auth/` | 🔥 Alta |
| **Equipo 9** | Reportes (Ad Manager) | ~3 estudiantes | `domain/analytics/` | `presentation/features/analytics/` | 🟢 Baja |
| **Equipo 10** | Vista Estudiante | ~3 estudiantes | `domain/student/` | `presentation/features/student/` | 🔥 Alta |

---

## 🔥 **EQUIPO 1: Cursos, Módulos, Contenidos**

### 📁 **Tus carpetas:**
```bash
src/domain/courses/      ← Reglas de los cursos
src/domain/modules/      ← Reglas de los módulos  
src/domain/contents/     ← Reglas del contenido
src/presentation/features/courses/  ← Vistas de cursos
```

### 🎯 **Tus responsabilidades:**
- **Cursos**: Crear, editar, eliminar cursos
- **Módulos**: Organizar contenido en lecciones
- **Contenido**: Videos, textos, PDF, docs, xlsx

### 🛠️ **Paso 1: Crea tus tipos**
```typescript
// src/domain/courses/types.ts
export interface Course {
  id: string
  title: string
  description: string
  instructorId: string
  institutionId: string
  modules: Module[]
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface CreateCourseRequest {
  title: string
  description: string
  instructorId: string
}

// src/domain/modules/types.ts
export interface Module {
  id: string
  courseId: string
  title: string
  description: string
  order: number
  contents: Content[]
  isPublished: boolean
}

// src/domain/contents/types.ts (YA CREADO - solo revisa)
export interface Content {
  id: string
  title: string
  type: 'video' | 'text' | 'pdf' | 'doc' | 'xlsx'
  url?: string
  data?: string
  moduleId: string
  order: number
}
```

### 🎨 **Paso 2: Crea tus componentes**
```typescript
// src/presentation/features/courses/CourseList.tsx
import React from 'react'
import { Course } from '../../../domain/courses/types'

export function CourseList() {
  // Mock data para empezar
  const courses: Course[] = [
    {
      id: '1',
      title: 'React Básico',
      description: 'Aprende React desde cero',
      instructorId: 'teacher-1',
      institutionId: 'inst-1',
      modules: [],
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ]
  
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Mis Cursos</h1>
        <button className="bg-blue-600 text-white px-4 py-2 rounded">
          Nuevo Curso
        </button>
      </div>
      
      <div className="grid gap-4">
        {courses.map(course => (
          <div key={course.id} className="border rounded-lg p-4">
            <h3 className="font-semibold text-lg">{course.title}</h3>
            <p className="text-gray-600 mb-2">{course.description}</p>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">
                {course.modules.length} módulos
              </span>
              <button className="text-blue-600 hover:text-blue-800">
                Ver detalles
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
```

### 🧪 **Paso 3: Crea tus tests**
```typescript
// src/presentation/features/courses/CourseList.test.tsx
import { render, screen } from '@testing-library/react'
import { CourseList } from './CourseList'

describe('CourseList', () => {
  it('should render course list title', () => {
    render(<CourseList />)
    expect(screen.getByText('Mis Cursos')).toBeInTheDocument()
  })
  
  it('should render new course button', () => {
    render(<CourseList />)
    expect(screen.getByText('Nuevo Curso')).toBeInTheDocument()
  })
})
```

---

## 📁 **EQUIPO 2: Gestión de Archivos**

### 📁 **Tus carpetas:**
```bash
src/domain/files/         ← Reglas de archivos
src/presentation/features/files/  ← Vistas de archivos
```

### 🎯 **Tus responsabilidades:**
- **Upload**: Subir archivos (PDF, docs, xlsx, videos)
- **Preview**: Vista previa de archivos
- **Download**: Descargar archivos
- **Storage**: Gestión de almacenamiento

### 🛠️ **Paso 1: Crea tus tipos**
```typescript
// src/domain/files/types.ts
export interface FileItem {
  id: string
  name: string
  type: FileType
  size: number
  url: string
  uploadedBy: string
  courseId?: string
  moduleId?: string
  contentId?: string
  uploadedAt: Date
  isPublic: boolean
}

export type FileType = 
  | 'video'
  | 'pdf' 
  | 'doc'
  | 'xlsx'
  | 'image'
  | 'audio'

export interface UploadRequest {
  file: File
  courseId?: string
  moduleId?: string
  contentId?: string
  isPublic: boolean
}

export interface FilePreview {
  id: string
  type: FileType
  url: string
  canPreview: boolean
  thumbnailUrl?: string
}
```

### 🎨 **Paso 2: Crea tus componentes**
```typescript
// src/presentation/features/files/FileUpload.tsx
import React, { useState } from 'react'
import { FileItem, FileType } from '../../../domain/files/types'

export function FileUpload() {
  const [files, setFiles] = useState<FileItem[]>([])
  const [dragActive, setDragActive] = useState(false)

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)
    // Lógica de upload aquí
  }

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Subir Archivos</h2>
      
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center ${
          dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
        }`}
        onDrop={handleDrop}
        onDragOver={(e) => { e.preventDefault(); setDragActive(true) }}
        onDragLeave={() => setDragActive(false)}
      >
        <div className="mb-4">
          <div className="text-4xl mb-2">📁</div>
          <p className="text-lg font-medium">Arrastra archivos aquí</p>
          <p className="text-gray-500">o haz clic para seleccionar</p>
        </div>
        
        <div className="text-sm text-gray-400">
          Formatos soportados: PDF, DOC, XLSX, MP4, JPG, PNG
        </div>
        
        <input
          type="file"
          multiple
          className="hidden"
          accept=".pdf,.doc,.docx,.xlsx,.mp4,.jpg,.jpeg,.png"
        />
      </div>
      
      {files.length > 0 && (
        <div className="mt-6">
          <h3 className="font-semibold mb-3">Archivos subidos:</h3>
          <div className="space-y-2">
            {files.map(file => (
              <div key={file.id} className="flex items-center justify-between p-3 border rounded">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">
                    {file.type === 'pdf' ? '📄' : 
                     file.type === 'doc' ? '📝' :
                     file.type === 'xlsx' ? '📊' :
                     file.type === 'video' ? '🎥' : '🖼️'}
                  </span>
                  <div>
                    <div className="font-medium">{file.name}</div>
                    <div className="text-sm text-gray-500">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </div>
                  </div>
                </div>
                <button className="text-blue-600 hover:text-blue-800">
                  Descargar
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
```

---

## 🔐 **EQUIPO 8: Login, Usuarios, Roles**

### 📁 **Tus carpetas:**
```bash
src/domain/auth/          ← Reglas de autenticación
src/domain/users/         ← Reglas de usuarios
src/domain/roles/         ← Reglas de roles
src/presentation/features/auth/     ← Vistas de auth
```

### 🎯 **Tus responsabilidades:**
- **Login**: Formulario de inicio de sesión
- **Registro**: Creación de nuevos usuarios
- **Roles**: Definición de permisos
- **Tokens**: Gestión de sesión

### 🛠️ **Paso 1: Revisa tus tipos (YA CREADOS)**
```typescript
// src/domain/auth/types.ts (YA CREADO - solo revisa)
export interface AuthState {
  token: string | null
  user: User | null
  expiresAt: Date | null
  isAuthenticated: boolean
  permissions: Permission[]
}
```

### 🎨 **Paso 2: Crea tus componentes**
```typescript
// src/presentation/features/auth/LoginForm.tsx
import React, { useState } from 'react'
import { LoginCredentials } from '../../../domain/auth/types'

export function LoginForm() {
  const [credentials, setCredentials] = useState<LoginCredentials>({
    email: '',
    password: '',
    institutionCode: ''
  })
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      // Lógica de login aquí
      console.log('Login con:', credentials)
    } catch (error) {
      console.error('Error en login:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Iniciar Sesión
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Plataforma Educativa IUSH
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Correo electrónico
              </label>
              <input
                id="email"
                type="email"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                value={credentials.email}
                onChange={(e) => setCredentials({...credentials, email: e.target.value})}
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                value={credentials.password}
                onChange={(e) => setCredentials({...credentials, password: e.target.value})}
              />
            </div>
            
            <div>
              <label htmlFor="institution" className="block text-sm font-medium text-gray-700">
                Código de institución
              </label>
              <input
                id="institution"
                type="text"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                value={credentials.institutionCode}
                onChange={(e) => setCredentials({...credentials, institutionCode: e.target.value})}
                placeholder="Ej: UNIV001"
              />
            </div>
          </div>
          
          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
```

---

## 🎓 **EQUIPO 10: Vista Estudiante**

### 📁 **Tus carpetas:**
```bash
src/domain/student/        ← Reglas del estudiante
src/presentation/features/student/  ← Vistas del estudiante
```

### 🎯 **Tus responsabilidades:**
- **Dashboard**: Vista principal del estudiante
- **Cursos**: Lista de cursos inscritos
- **Progreso**: Seguimiento de aprendizaje
- **Certificados**: Certificados obtenidos

### 🛠️ **Paso 1: Revisa tus tipos (YA CREADOS)**
```typescript
// src/domain/student/index.ts (YA CREADO - solo revisa)
export interface Student {
  id: string
  name: string
  email: string
  enrolledCourses: Course[]
  progress: StudentProgress
}
```

### 🎨 **Paso 2: Tu componente YA ESTÁ CREADO**
```typescript
// src/presentation/features/student/Dashboard.tsx (YA CREADO - solo revisa)
export function StudentDashboard() {
  // Tu dashboard ya está funcionando
}
```

---

## 🧪 **PASO FINAL: Testing para Todos**

### 📋 **Checklist antes de commitear:**

```bash
# 1. Verificar que todo compila
npm run type-check

# 2. Verificar calidad de código
npm run lint

# 3. Ejecutar tests
npm run test

# 4. Probar build
npm run build:fast
```

### 🎯 **Comandos útiles:**

```bash
# Desarrollo rápido
npm run dev

# Build rápido para pruebas
npm run build:fast

# Ver build local
npm run preview

# Tests con cobertura
npm run test:coverage
```

---

## ❓ **Preguntas Frecuentes**

**🤔 ¿Puedo modificar código de otro equipo?**
❌ **NO** - Trabaja solo en tus carpetas asignadas.

**🤔 ¿Qué hago si necesito algo de otro equipo?**
✅ **Usa interfaces compartidas** - `src/domain/shared/interfaces/`

**🤔 ¿Cómo me comunico con otros equipos?**
✅ **Crea issues en GitHub** - Describe lo que necesitas.

**🤔 ¿Puedo agregar nuevas dependencias?**
⚠️ **Pregunta primero** - Habla con el profesor.

**🤔 ¿Cómo sé que mi código está bien?**
✅ **Sigue el checklist** - type-check + lint + test + build.

---

## 🎯 **Tips para el Éxito**

1. **Empieza simple** - No intentes hacerlo perfecto desde el inicio
2. **Copia y adapta** - Usa los ejemplos de esta guía
3. **Haz commits pequeños** - Un cambio por commit
4. **Escribe tests** - Te ahorrará tiempo después
5. **Pide ayuda** - No te quedes bloqueado más de 1 hora

**¡Mucha suerte! 🚀**
