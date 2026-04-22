# Contributing to Iush Platform

¡Gracias por tu interés en contribuir al proyecto Iush! Esta guía te ayudará a comenzar.

## Tabla de Contenidos

- [Proceso de Contribución](#proceso-de-contribución)
- [Guía de Desarrollo](#guía-de-desarrollo)
- [Guía por Equipo](#guía-por-equipo)
- [Estándares de Código](#estándares-de-código)
- [Testing](#testing)
- [Pull Requests](#pull-requests)
- [Issues](#issues)

## Proceso de Contribución

### 1. Fork y Clone
```bash
# Fork el repositorio en GitHub
git clone https://github.com/tu-usuario/PlataformaIUSH-Frontend.git
cd PlataformaIUSH-Frontend
```

### 2. Crea una Rama
```bash
# Crea una rama para tu feature
git checkout -b feature/nombre-de-tu-feature
```

### 3. Desarrolla
- Sigue la [Guía de Desarrollo](#guía-de-desarrollo)
- Respeta las reglas de tu equipo
- Escribe tests

### 4. Commit y Push
```bash
# Commitea tus cambios
git commit -m "feat: agregar nueva funcionalidad"

# Push a tu fork
git push origin feature/nombre-de-tu-feature
```

### 5. Pull Request
- Crea un Pull Request a `develop`
- Llena el template de PR
- Espera la revisión

## Guía de Desarrollo

### Antes de Empezar
1. Lee [DOCUMENTACION_COMPLETA.md](./DOCUMENTACION_COMPLETA.md)
2. Entiende la [arquitectura hexagonal](./DOCUMENTACION_COMPLETA.md#2--arquitectura-hexagonal---explicación-visual)
3. Conoce las [reglas de oro](./DOCUMENTACION_COMPLETA.md#4--reglas-de-oro-no-romper)

### Setup Local
```bash
# Instala dependencias
npm install

# Inicia desarrollo
npm run dev

# Ejecuta tests
npm run test

# Verifica tipos
npm run type-check

# Formatea código
npm run format
```

## Guía por Equipo

### Equipo 1 - Cursos, Módulos, Contenidos
**Carpetas asignadas:**
```
src/domain/courses/
src/domain/modules/
src/domain/contents/
src/application/courses/
src/application/modules/
src/application/contents/
src/presentation/features/course-management/
src/presentation/features/module-management/
src/presentation/features/content-management/
```

**No modificar:**
- Archivos de otros equipos
- Configuración global sin permiso

### Equipo 2 - Gestión de Archivos
**Carpetas asignadas:**
```
src/domain/files/
src/application/files/
src/infrastructure/repositories/FileRepository.impl.ts
src/infrastructure/file-handlers/
src/presentation/features/file-management/
```

### Equipo 3 - Vista Institución (Super Admin)
**Carpetas asignadas:**
```
src/domain/institutions/
src/application/institutions/
src/infrastructure/repositories/InstitutionRepository.impl.ts
src/presentation/pages/institution/
src/presentation/layouts/InstitutionLayout.tsx
```

### Equipo 4 - Vista Administrador
**Carpetas asignadas:**
```
src/presentation/pages/admin/
src/presentation/layouts/AdminLayout.tsx
```

### Equipo 5 - Notas y Certificaciones
**Carpetas asignadas:**
```
src/domain/grades/
src/domain/certifications/
src/application/grades/
src/application/certifications/
src/presentation/features/grade-management/
src/presentation/features/certification-management/
```

### Equipo 6 - Vista Docente
**Carpetas asignadas:**
```
src/presentation/pages/teacher/
src/presentation/layouts/TeacherLayout.tsx
```

### Equipo 7 - Competencias Socioemocionales
**Carpetas asignadas:**
```
src/domain/socio-emotional/
src/application/socio-emotional/
src/infrastructure/repositories/SocioEmotionalRepository.impl.ts
src/presentation/features/socio-emotional/
```

### Equipo 8 - Auth, Usuarios, Roles
**Carpetas asignadas:**
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

### Equipo 9 - Analytics y Reportes
**Carpetas asignadas:**
```
src/domain/analytics/
src/application/analytics/
src/infrastructure/analytics/
src/infrastructure/repositories/AnalyticsRepository.impl.ts
src/presentation/features/analytics-dashboard/
```

### Equipo 10 - Vista Estudiante
**Carpetas asignadas:**
```
src/presentation/pages/student/
src/presentation/layouts/StudentLayout.tsx
```

## Estándares de Código

### TypeScript
```typescript
// Usar tipos explícitos
const user: User = { id: '1', name: 'John' }

// Preferir interfaces
interface User {
  id: string
  name: string
}

// Evitar any
function processData(data: unknown) {
  // Validar y castear
}
```

### React
```typescript
// Componentes funcionales con TypeScript
interface ButtonProps {
  variant: 'primary' | 'secondary'
  children: React.ReactNode
}

export function Button({ variant, children }: ButtonProps) {
  return <button className={`btn-${variant}`}>{children}</button>
}
```

### Nomenclatura
- **Componentes**: `PascalCase.tsx`
- **Hooks**: `camelCase.ts`
- **Utils**: `camelCase.ts`
- **Types**: `PascalCase.ts`
- **Tests**: `PascalCase.test.tsx`

### CSS/Tailwind
```typescript
// Mobile-first
<div className="w-full md:w-1/2 lg:w-1/3">

// Usar clases del design system
<Button variant="primary">Submit</Button>

// Evitar estilos inline
// <div style={{ color: 'red' }}> NO
<div className="text-red-500"> YES
```

## Testing

### Estructura de Tests
```typescript
// src/presentation/features/course-management/components/CourseCard.test.tsx
import { render, screen } from '@testing-library/react'
import { CourseCard } from './CourseCard'
import { courseFactory } from '@tests/factories/course.factory'

describe('CourseCard', () => {
  it('should render course information correctly', () => {
    const course = courseFactory.build({
      title: 'React Avanzado',
      description: 'Aprende React a fondo',
    })

    render(<CourseCard course={course} />)

    expect(screen.getByText('React Avanzado')).toBeInTheDocument()
    expect(screen.getByText('Aprende React a fondo')).toBeInTheDocument()
  })
})
```

### Commands de Testing
```bash
# Ejecutar todos los tests
npm run test

# Ejecutar tests con coverage
npm run test:coverage

# Ejecutar tests en modo watch
npm run test:watch

# Ejecutar tests de un archivo específico
npm run test CourseCard.test.tsx
```

## Pull Requests

### Antes de Crear un PR
- [ ] Todos los tests pasan
- [ ] No hay errores de TypeScript
- [ ] No hay warnings de ESLint
- [ ] El código está formateado
- [ ] Agregaste tests si es necesario
- [ ] Actualizaste la documentación

### Proceso de PR
1. Crea PR desde tu feature branch a `develop`
2. Usa el [template de PR](/.github/PULL_REQUEST_TEMPLATE.md)
3. Espera a que GitHub Actions termine
4. Solicita revisión a los miembros de tu equipo
5. Responde a los comentarios rápidamente
6. Haz los cambios solicitados
7. Espera aprobación y merge

### Status Checks Requeridos
- `quality / type-check`
- `quality / lint`
- `quality / test`
- `quality / build`
- `security / audit`
- `security / scan`
- `metrics / coverage`

## Issues

### Reportar Bugs
Usa el [template de bug report](/.github/ISSUE_TEMPLATE/bug_report.md)

### Solicitar Features
Usa el [template de feature request](/.github/ISSUE_TEMPLATE/feature_request.md)

### Etiquetas de Issues
- `bug` - Errores que necesitan ser arreglados
- `enhancement` - Nuevas funcionalidades
- `documentation` - Mejoras en la documentación
- `good first issue` - Buenos para principiantes
- `help wanted` - Necesita ayuda de la comunidad
- `team-1` a `team-10` - Asignado a equipo específico

## Comunicación

### Canales
- **Slack**: `#iush-dev` para desarrollo general
- **Slack**: `#iush-equipo-[numero]` para comunicación por equipo
- **GitHub Issues**: Para bugs y features
- **GitHub Discussions**: Para preguntas generales

### Code Review
- Sé constructivo y respetuoso
- Explica el "por qué" de tus sugerencias
- Sugiere mejoras específicas
- Agradece las contribuciones

## Recursos

### Documentación
- [DOCUMENTACION_COMPLETA.md](./DOCUMENTACION_COMPLETA.md) - Guía completa
- [README.md](./README.md) - Overview del proyecto
- [CONTRIBUTING.md](./CONTRIBUTING.md) - Esta guía

### Herramientas
- [React 19 Docs](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Vitest](https://vitest.dev/)

## Preguntas Frecuentes

### ¿Puedo trabajar en archivos de otros equipos?
Solo si es absolutamente necesario y mediante Pull Request con revisión. Primero habla con el equipo responsable.

### ¿Cómo solicito una nueva dependencia?
Abre un issue explicando por qué se necesita, qué problemas resuelve, y si hay alternativas.

### ¿Qué hago si GitHub Actions falla?
Revisa los logs del error, corrige el problema localmente, y haz push de nuevo.

### ¿Cómo hago deploy de mi feature?
Los deploys son manuales hasta que la arquitectura esté estable. Contacta a los líderes técnicos.

---

## Licencia

Al contribuir, aceptas que tus contribuciones se licencien bajo los mismos términos que el proyecto.

---

¡Gracias por contribuir a Iush! Tu ayuda hace este proyecto mejor para todos.
