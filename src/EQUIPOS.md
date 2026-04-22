# Guía para Equipos de Desarrollo

## Estructura Actual del Proyecto

### Código Funcional (No modificar)
- `src/main.tsx` - Entry point
- `src/App.tsx` - App principal  
- `src/routes/AppRouter.tsx` - Router placeholder
- `src/styles/globals.css` - Estilos globales

### Código de Estructura (Usar como base)
- `src/domain/shared/` - Entidades y value objects compartidos
- `src/tests/` - Infraestructura de testing

## Carpetas Asignadas por Equipo

### Equipo 1: Cursos, Módulos, Contenidos
```
src/domain/courses/
src/domain/modules/  
src/domain/contents/
src/application/courses/
src/application/modules/
src/application/contents/
src/infrastructure/repositories/CourseRepository.impl.ts
src/infrastructure/repositories/ModuleRepository.impl.ts
src/infrastructure/repositories/ContentRepository.impl.ts
src/presentation/features/course-management/
src/presentation/features/module-management/
src/presentation/features/content-management/
```

### Equipo 2: Gestión de Archivos
```
src/domain/files/
src/application/files/
src/infrastructure/repositories/FileRepository.impl.ts
src/infrastructure/file-handlers/
src/presentation/features/file-management/
```

### Equipo 3: Vista Institución (Super Admin)
```
src/domain/institutions/
src/application/institutions/
src/infrastructure/repositories/InstitutionRepository.impl.ts
src/presentation/pages/institution/
src/presentation/layouts/InstitutionLayout.tsx
```

### Equipo 4: Vista Administrador
```
src/presentation/pages/admin/
src/presentation/layouts/AdminLayout.tsx
```

### Equipo 5: Notas y Certificaciones
```
src/domain/grades/
src/domain/certifications/
src/application/grades/
src/application/certifications/
src/presentation/features/grade-management/
src/presentation/features/certification-management/
```

### Equipo 6: Vista Docente
```
src/presentation/pages/teacher/
src/presentation/layouts/TeacherLayout.tsx
```

### Equipo 7: Competencias Socioemocionales
```
src/domain/socio-emotional/
src/application/socio-emotional/
src/infrastructure/repositories/SocioEmotionalRepository.impl.ts
src/presentation/features/socio-emotional/
```

### Equipo 8: Auth, Usuarios, Roles
```
src/domain/auth/
src/domain/users/
src/domain/roles/
src/application/auth/
src/application/users/
src/application/roles/
src/infrastructure/security/
src/infrastructure/repositories/[modulo].impl.ts
src/presentation/features/auth/
src/presentation/pages/public/
```

### Equipo 9: Analytics y Reportes
```
src/domain/analytics/
src/application/analytics/
src/infrastructure/analytics/
src/infrastructure/repositories/AnalyticsRepository.impl.ts
src/presentation/features/analytics-dashboard/
```

### Equipo 10: Vista Estudiante
```
src/presentation/pages/student/
src/presentation/layouts/StudentLayout.tsx
```

## Reglas de Oro

1. **No modificar archivos de otros equipos**
2. **Seguir arquitectura hexagonal**
3. **Usar solo tipos de domain layer en stores**
4. **Crear stores específicos en presentation/stores/**
5. **Crear rutas específicas en routes/definitions/**
6. **Usar componentes del design system**

## Ejemplos de Implementación

### Store para Equipo 8 (Auth)
```typescript
// src/presentation/stores/auth.store.ts
import { create } from 'zustand'
import type { User } from '@domain/users/entities/User.entity'

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
}

interface AuthActions {
  login: (user: User) => void
  logout: () => void
}

export const useAuthStore = create<AuthState & AuthActions>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  login: (user) => set({ user, isAuthenticated: true, isLoading: false }),
  logout: () => set({ user: null, isAuthenticated: false, isLoading: false }),
}))
```

### Rutas para Equipo 1 (Cursos)
```typescript
// src/routes/definitions/course.routes.ts
import { lazy } from 'react'

export const courseRoutes = [
  {
    path: '/courses',
    component: lazy(() => import('@presentation/features/course-management/CourseListPage.tsx'))
  },
  {
    path: '/courses/create',
    component: lazy(() => import('@presentation/features/course-management/CreateCoursePage.tsx'))
  },
  {
    path: '/courses/:id',
    component: lazy(() => import('@presentation/features/course-management/CourseDetailPage.tsx'))
  }
]
```

## Testing

Cada equipo debe crear tests para sus módulos:
```typescript
// src/tests/factories/course.factory.ts
import { Course } from '@domain/courses/entities/Course.entity'

export const courseFactory = {
  build: (overrides?: Partial<Course>) => ({
    id: '1',
    title: 'Test Course',
    description: 'Test Description',
    status: 'DRAFT',
    teacherId: '1',
    institutionId: '1',
    ...overrides
  })
}
```

## Soporte

Para dudas o problemas:
1. Revisar DOCUMENTACION_COMPLETA.md
2. Consultar CONTRIBUTING.md
3. Preguntar en el canal del equipo
4. Contactar líderes técnicos para problemas de arquitectura
