# 🎓 Iush - Plataforma Educativa LMS

## 🚀 ¡Nuevo aquí? Lee la guía completa

**[📖 Ver guía completa del proyecto](COMPLETO.md)**

---

## 🎓 Descripción

**Plataforma LMS tipo Duolingo/Platzi** para educación superior con modelo de suscripciones.

Iush es una **plataforma educativa web tipo LMS (Learning Management System)** diseñada para instituciones educativas que buscan ofrecer cursos online con:

- **Suscripciones pagas** por institución
- **Multi-tenant** - Cada cliente tiene su instancia independiente
- **Contenido multimedia** - Videos, textos, PDF, docs, xlsx
- **Personalización completa** - Logo y colores por institución
- **Seguridad robusta** - Bearer tokens y permisos granulares
- **Analytics integrado** - Google Ad Manager o equivalente

---

## 🎯 Características Principales

### 📚 **Gestión Educativa Completa**
- **Multi-rol**: Super Admin, Admin, Docente, Estudiante
- **Gestión de cursos**: Creación, módulos y contenido multimedia
- **Contenido diverso**: Videos, textos, archivos (PDF, Word, Excel)
- **Sistema de calificaciones**: Por módulo y curso completo
- **Certificaciones automáticas**: Generación de certificados PDF
- **Competencias socioemocionales**: Evaluación de habilidades blandas

### 🎨 **Personalización por Institución**
- **White-label completo**: Logo, colores y branding personalizado
- **Variables CSS**: Fondos, textos primarios/secundarios/terciarios
- **Configuración visual**: Cada institución con su identidad única

### 📱 **Experiencia de Usuario**
- **Responsive design**: Mobile-first, compatible con todos los dispositivos
- **Retrocompatibilidad**: Soporte para las 3 últimas versiones de navegadores
- **Interfaz moderna**: React 19 + TypeScript + Tailwind CSS 4

### 🔐 **Seguridad y Analytics**
- **Seguridad avanzada**: Bearer tokens con expiración automática
- **Permisos granulares**: Control visual por rol y permisos específicos
- **Analytics integrado**: Google Ad Manager o equivalente libre para métricas

---

## 🏗️ Arquitectura MVP (2 Meses)

### 📁 **Estructura Simple y Directa**

```
src/
├── 🧠 domain/                    ← REGLAS DEL JUEGO (Lógica pura)
│   ├── shared/                  ← Código que todos usan
│   │   ├── interfaces/          ← Contratos entre equipos
│   │   ├── value-objects/       ← UUID, Email, colores
│   │   └── enums/              ← Roles, estados
│   ├── auth/                    ← Equipo 8: Login y seguridad
│   ├── courses/                 ← Equipo 1: Cursos y contenido
│   ├── files/                   ← Equipo 2: Archivos multimedia
│   ├── institutions/            ← Equipo 3: Configuración visual
│   ├── grades/                  ← Equipo 5: Notas y certificados
│   ├── socio-emotional/         ← Equipo 7: Habilidades blandas
│   ├── analytics/               ← Equipo 9: Métricas y reportes
│   └── student/                 ← Equipo 10: Datos del estudiante
├── 🎨 presentation/              ← LO QUE VE EL USUARIO (Vistas)
│   ├── features/               ← Componentes por equipo
│   │   ├── auth/               ← Login, registro (Equipo 8)
│   │   ├── courses/            ← Lista cursos, detalle (Equipo 1)
│   │   ├── files/              ← Upload archivos (Equipo 2)
│   │   ├── institutions/       ← Configuración (Equipo 3)
│   │   ├── admin/              ← Vista admin (Equipo 4)
│   │   ├── grades/             ← Calificaciones (Equipo 5)
│   │   ├── teacher/            ← Vista docente (Equipo 6)
│   │   ├── socio-emotional/    ← Evaluación (Equipo 7)
│   │   ├── analytics/          ← Dashboard métricas (Equipo 9)
│   │   └── student/            ← Dashboard estudiante (Equipo 10)
│   └── stores/                 ← Estado global simple
├── 🛣️ routes/                    ← NAVEGACIÓN (Enlaces entre páginas)
├── 🎨 styles/                    ← ESTILOS GLOBALES (CSS)
└── 🧪 tests/                     ← PRUEBAS AUTOMÁTICAS
```

### 🔧 **¿Cómo funciona en práctica?**

**1. Cada equipo tiene SU carpeta:**
```bash
# Equipo 1 trabaja aquí:
src/domain/courses/          ← Reglas de los cursos
src/presentation/features/courses/  ← Vistas de cursos

# Equipo 8 trabaja aquí:
src/domain/auth/             ← Reglas de login
src/presentation/features/auth/    ← Vistas de login
```

**2. Los equipos NO se bloquean:**
- **Equipo 9** puede hacer analytics sin esperar al **Equipo 8**
- **Equipo 1** puede crear cursos sin esperar al **Equipo 3**
- **Todos trabajan en paralelo** 🚀

**3. Comunicación entre equipos:**
```typescript
// Si necesitas algo de otro equipo, usa interfaces compartidas
import { ITokenManager } from '../shared/interfaces/ITokenManager'

// No importes directamente de otros equipos
// ❌ import { TokenManager } from '../auth/types'  // BLOQUEA
// ✅ import { ITokenManager } from '../shared/interfaces/ITokenManager'  // LIBRE
```

### 👥 **División por Equipos (32 Estudiantes)**

| Equipo | Módulo Responsable | Carpeta Domain | Carpeta Presentation |
|--------|-------------------|----------------|-------------------|
| **Equipo 1** | Cursos, Módulos, Contenidos | `domain/courses/`, `domain/modules/`, `domain/contents/` | `presentation/features/courses/` |
| **Equipo 2** | Gestión de Archivos | `domain/files/` | `presentation/features/files/` |
| **Equipo 3** | Vista Institución (Super Admin) | `domain/institutions/` | `presentation/features/institutions/` |
| **Equipo 4** | Vista Administrador | `domain/admin/` | `presentation/features/admin/` |
| **Equipo 5** | Notas y Certificaciones | `domain/grades/`, `domain/certifications/` | `presentation/features/grades/` |
| **Equipo 6** | Vista Docente | `domain/teacher/` | `presentation/features/teacher/` |
| **Equipo 7** | Competencias Socioemocionales | `domain/socio-emotional/` | `presentation/features/socio-emotional/` |
| **Equipo 8** | Login, Usuarios, Roles | `domain/auth/`, `domain/users/`, `domain/roles/` | `presentation/features/auth/` |
| **Equipo 9** | Reportes (Ad Manager) | `domain/analytics/` | `presentation/features/analytics/` |
| **Equipo 10** | Vista Estudiante | `domain/student/` | `presentation/features/student/` |

---

## 🛠️ Stack Tecnológico

### Frontend
- **React 19.2.5** + **TypeScript 5.7.0** + **Vite 6.0.0**
- **Tailwind CSS 4.0.0** + **@tailwindcss/postcss 4.2.4**
- **Zustand 5.0.2** + **TanStack Query 5.62.0**
- **React Router 7.1.0** + **React Hook Form 7.54.0** + **Zod 3.24.1**
- **Axios 1.7.9** + **Lucide React 0.468.0**

### Desarrollo y Calidad
- **Node.js 20.20.0** + **npm 10.8.2**
- **ESLint 9.39.4** + **Prettier 3.4.2**
- **Vitest 2.1.0** + **Testing Library 16.3.2** + **MSW 2.7.0**
- **@vitest/coverage-v8 2.1.0** - Reporte de cobertura

### Build y Deploy
- **Vite 6.0.0** con **@vitejs/plugin-legacy** - Retrocompatibilidad
- **GitHub Actions** - CI/CD automatizado
- **Configuración optimizada** - Build rápido y eficiente

---

## 🚀 Empezar a Desarrollar

### 📋 **Prerrequisitos**
- Node.js 20.20.0+
- npm 10.8.2+
- Git

### ⚡ **Instalación y Setup**
```bash
# 1. Clonar el repositorio
git clone <repository-url>
cd PlataformaIUSH-Frontend

# 2. Instalar dependencias
npm install

# 3. Verificar que todo funciona
npm run type-check    # Debe decir "0 errors"
npm run lint          # Debe decir "0 warnings"
npm run test          # Debe pasar los tests

# 4. Iniciar desarrollo
npm run dev          # Abre http://localhost:3000
```

### 🎯 **Paso 2: Encuentra tu equipo y carpeta**

**Busca tu equipo en la tabla de arriba y ve a tu carpeta:**

```bash
# Ejemplo: Si eres Equipo 1 (Cursos)
cd src/domain/courses/           ← Trabajas aquí
cd src/presentation/features/courses/  ← Y aquí

# Ejemplo: Si eres Equipo 8 (Auth)
cd src/domain/auth/              ← Trabajas aquí
cd src/presentation/features/auth/     ← Y aquí
```

### 🛠️ **Paso 3: Crea tu primer código (Patrón para todos)**

**A. Crea tipos en domain:**
```typescript
// src/domain/[tu-equipo]/types.ts
export interface Course {
  id: string
  title: string
  description: string
}

export interface CreateCourseRequest {
  title: string
  description: string
}
```

**B. Crea componentes en presentation:**
```typescript
// src/presentation/features/[tu-equipo]/CourseList.tsx
import React from 'react'
import { Course } from '../../../domain/[tu-equipo]/types'

export function CourseList() {
  const courses: Course[] = [
    { id: '1', title: 'React Básico', description: 'Aprende React' }
  ]
  
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Mis Cursos</h1>
      <div className="grid gap-4">
        {courses.map(course => (
          <div key={course.id} className="border p-4 rounded">
            <h3 className="font-semibold">{course.title}</h3>
            <p className="text-gray-600">{course.description}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
```

**C. Crea tests:**
```typescript
// src/presentation/features/[tu-equipo]/CourseList.test.tsx
import { render, screen } from '@testing-library/react'
import { CourseList } from './CourseList'

describe('CourseList', () => {
  it('should render course list', () => {
    render(<CourseList />)
    expect(screen.getByText('Mis Cursos')).toBeInTheDocument()
  })
})
```

### 🧪 **Scripts Disponibles (Uso Diario)**
```bash
npm run dev              # Desarrollo rápido con recarga
npm run build            # Build para producción (7.33s)
npm run build:fast       # Build ultra rápido (0.85s)
npm run test             # Ejecutar tests
npm run test:coverage    # Tests con cobertura
npm run lint             # Revisar calidad de código
npm run type-check       # Verificar TypeScript
npm run preview          # Ver build local
```

### ⚠️ **Reglas de Oro (¡MUY IMPORTANTE!)**

**✅ HACER:**
- Trabaja SOLO en tus carpetas asignadas
- Usa interfaces compartidas para comunicarte
- Escribe tests para tu código
- Haz commits descriptivos
- Pide ayuda si estás bloqueado

**❌ NO HACER:**
- No toques código de otros equipos
- No importes directamente de otros equipos
- No subas código con errores
- No hagas cambios en config/ sin preguntar
- No te quedes bloqueado sin pedir ayuda

---

## 📁 Estructura de Carpetas

```
PlataformaIUSH-Frontend/
├── 📁 src/                  # Código fuente
│   ├── domain/            # Lógica de negocio por equipos
│   ├── presentation/      # Vistas y componentes
│   ├── routes/           # Navegación
│   ├── styles/           # Estilos globales
│   └── tests/            # Tests automatizados
├── 📁 config/              # Configuración técnica
│   ├── vite.config.ts    # Configuración Vite
│   ├── tailwind.config.ts # Configuración Tailwind
│   ├── eslint.config.js  # Reglas de código
│   └── tsconfig.json     # Configuración TypeScript
├── 📁 public/             # Archivos estáticos
├── 📁 .github/            # CI/CD automatización
├── 📄 package.json        # Dependencias y scripts
└── 📄 README.md           # Este archivo
```

---

## 🎯 MVP en 2 Meses

### 📅 **Timeline Realista**
- **Mes 1**: Setup y estructura (✅ Completado) → Desarrollo de módulos core
- **Mes 2**: Integraciones avanzadas → Testing y deploy

### 🎓 **Objetivos de Aprendizaje**
- **React 19 + TypeScript** - Tecnologías del mercado laboral
- **Arquitectura simple** - Práctica y aplicable
- **Trabajo en equipo** - Colaboración y coordinación
- **Testing automatizado** - Calidad de software
- **CI/CD** - Integración y despliegue continuo

---

## 🤝 Contribución

### 👥 **Guía para Estudiantes**
1. **Encuentra tu equipo** en la tabla de módulos
2. **Ve a tu carpeta** asignada en `src/domain/` y `src/presentation/features/`
3. **Sigue los patrones existentes** - Copia y adapta
4. **Escribe tests** para tu código
5. **Haz commits descriptivos** - Seguir convenciones

### 📋 **Requisitos de Calidad**
- **TypeScript estricto** - Sin errores de tipado
- **Tests funcionales** - Cobertura mínima del código
- **Componentes reutilizables** - DRY principle
- **Mobile First** - Responsive design
- **Accesibilidad** - Buenas prácticas WCAG

---

## 📄 Licencia

Proyecto educativo para la materia **Profundización 2 - Desarrollo Software** de la Universidad Salazar y Herrera.

---

## 🎓 Contacto

**Profesor:** Juan David Fernández Moreno  
**Email:** juan.fernandez@salazaryherrera.edu.co

---

*Última actualización: Abril 2026 - MVP listo para desarrollo de 32 estudiantes*

### Características Principales

- **Multi-rol**: Super Admin, Admin, Docente, Estudiante
- **Gestión completa de cursos**: Cursos, módulos y contenido multimedia
- **Contenido diverso**: Videos, textos, archivos (PDF, Word, Excel)
- **Sistema de calificaciones**: Por módulo y curso completo
- **Certificaciones automáticas**: Generación de certificados PDF
- **Competencias socioemocionales**: Evaluación de habilidades blandas
- **Analytics integrado**: Métricas y reportes en tiempo real
- **Personalización visual**: White-label por institución
- **Responsive design**: Mobile-first, compatible con todos los dispositivos
- **Seguridad avanzada**: Bearer tokens, permisos granulares

## Stack Tecnológico

### Frontend
- **React 19.2.5** + **TypeScript 5.7.0** + **Vite 6.0.0**
- **Tailwind CSS 4.0.0** + **@tailwindcss/postcss 4.2.4**
- **Zustand 5.0.2** + **TanStack Query 5.62.0**
- **React Router 7.1.0** + **React Hook Form 7.54.0** + **Zod 3.24.1**
- **Axios 1.7.9** + **Lucide React 0.468.0**

### Desarrollo
- **Node.js 20.20.0** + **npm 10.8.2**
- **ESLint 9.39.4** + **Prettier 3.4.2**
- **Vitest 2.1.0** + **Testing Library 16.3.2** + **MSW 2.7.0**
- **@vitest/coverage-v8 2.1.0** - Reporte de cobertura
- **TypeScript** con path aliases

### Arquitectura
- **Arquitectura Hexagonal** (Ports & Adapters)
- **Domain-Driven Design**
- **Separación por equipos** (10 equipos trabajando en paralelo)

### Vite 6 - Características Avanzadas

### Plugin Legacy para Retrocompatibilidad
```yaml
legacy({
  targets: ['last 3 versions', '> 0.5%', 'not dead'],
  additionalLegacyPolyfills: ['regenerator-runtime/runtime'],
  modernPolyfills: ['es.promise.finally', 'es/map', 'es/set'],
})
```

### Optimización de Bundle con Manual Chunks
```yaml
rollupOptions:
  output: {
    manualChunks: {
      'vendor-react': ['react', 'react-dom', 'react-router-dom'],
      'vendor-query': ['@tanstack/react-query'],
      'vendor-ui': ['lucide-react', 'clsx', 'tailwind-merge'],
      'vendor-forms': ['react-hook-form', 'zod', '@hookform/resolvers'],
      'vendor-state': ['zustand'],
    },
  },
}
```

### CSS Targets para Navegadores Antiguos
```yaml
cssTarget: ['chrome61', 'firefox60', 'safari11', 'edge79']
```

### HMR Ultra-rápido
```
- Cambios reflejados en < 50ms
- Recarga automática sin pérdida de estado
- Soporte para Hot Module Replacement en todos los tipos de archivos
```

### Build Optimizado
```
- Tree shaking automático elimina código no usado
- CSS purgado automáticamente
- Source maps para debugging en producción
- Bundle analysis con métricas detalladas
```

### Performance Metrics
```
Dev Server Startup: < 100ms
HMR Speed: < 50ms
Build Time: < 10s
Bundle Size: ~200KB gzipped
```
```

## Estructura del Proyecto

```
src/
  domain/          # Capa de dominio (entidades, value objects, ports)
  application/     # Capa de aplicación (use cases, DTOs, mappers)
  infrastructure/  # Capa de infraestructura (repositories, HTTP, storage)
  presentation/    # Capa de presentación (UI, components, pages)
  routes/          # Configuración de rutas
  config/          # Configuración de la aplicación
  utils/           # Utilidades compartidas
  styles/          # Estilos globales y CSS variables
  tests/           # Tests y mocks
```

## Equipos de Desarrollo

| Equipo | Responsabilidad | Módulos |
|--------|----------------|---------|
| **Equipo 1** | Contenido académico | Cursos + Módulos + Contenidos |
| **Equipo 2** | Gestión de archivos | Upload, preview, descarga de PDF/Word/Excel/Video |
| **Equipo 3** | Vista institución | Dashboard super admin + personalización white-label |
| **Equipo 4** | Vista administrador | Dashboard admin + gestión general |
| **Equipo 5** | Evaluación | Notas por módulo/curso + Certificaciones |
| **Equipo 6** | Vista docente | Dashboard docente + herramientas de enseñanza |
| **Equipo 7** | Desarrollo humano | Competencias socioemocionales |
| **Equipo 8** | Seguridad y acceso | Login + Usuarios + Roles + Permisos |
| **Equipo 9** | Inteligencia de datos | Analytics + Reportes + Ad Manager |
| **Equipo 10** | Experiencia estudiantil | Dashboard estudiante + consumo de contenido |

## Instalación

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev

# Build para producción
npm run build

# Ejecutar tests
npm run test

# Linting y formateo
npm run lint
npm run format
```

## Scripts Disponibles

- `npm run dev` - Inicia servidor de desarrollo
- `npm run build` - Build para producción
- `npm run preview` - Previa del build
- `npm run test` - Ejecuta tests
- `npm run test:ui` - UI de tests interactiva
- `npm run test:coverage` - Cobertura de tests (>80% requerido)
- `npm run lint` - Linting del código
- `npm run format` - Formateo del código
- `npm run type-check` - Verificación de tipos

## Testing - Infraestructura Completa

### Stack de Testing
```
Vitest 2.1.0              - Framework de testing rápido
Testing Library 16.3.2    - Testing de componentes React
MSW 2.7.0                - Mock Service Worker
@vitest/coverage-v8 2.1.0   - Reporte de cobertura
jsdom 25.0.1               - DOM environment para tests
```

### Estructura de Tests
```
src/tests/
  setup.ts              - Configuración global de tests
  mocks/
    server.ts         - MSW server setup
    handlers/
      auth.handlers.ts   - Mocks de autenticación
      index.ts          - Barrel export de handlers
  factories/
    user.factory.ts     - Generador de datos de prueba
    course.factory.ts   - Generador de cursos de prueba
  helpers/
    renderWithProviders.tsx - Render con providers
```

### Comandos de Testing
```bash
npm run test              # Ejecutar todos los tests
npm run test:ui            # UI interactiva de tests
npm run test:coverage      # Generar reporte de cobertura
npm run test --course     # Ejecutar tests específicos
```

### Métricas de Calidad
```
Coverage mínimo: 80% general, 90% en domain layer
Build success rate: >95%
TypeScript errors: 0
ESLint warnings: 0
Test execution time: < 30s
```

## GitHub Actions - Validación de Calidad

El proyecto incluye **GitHub Actions para validación automática de calidad** que se ejecutan en cada Pull Request:

### **CI Pipeline (Validación Obligatoria)**
```yaml
# .github/workflows/ci.yml
- TypeScript compilation (0 errores)
- ESLint checking (0 warnings)
- Prettier formatting verification
- Test execution (>80% coverage)
- Build verification
- Security audit (0 vulnerabilities)
```

### **Security Pipeline**
```yaml
# .github/workflows/security.yml
- Dependency vulnerability scan
- Code security analysis
- Secret scanning
- License compliance check
```

## Seguridad - Implementación Completa

### Bearer Token Authentication
```typescript
// src/infrastructure/security/TokenManager.ts
export class TokenManager {
  getAccessToken(): string | null
  getRefreshToken(): string | null
  setTokens(accessToken: string, refreshToken: string): void
  clearTokens(): void
  isAuthenticated(): boolean
  refreshToken(): Promise<boolean>
}
```

### HTTP Interceptors
```typescript
// src/infrastructure/http/interceptors/auth.interceptor.ts
// Adjunta Bearer token a cada request HTTP
// Excluye endpoints públicos (/login, /register)

// src/infrastructure/http/interceptors/refresh.interceptor.ts
// Detecta 401 y ejecuta refresh automático
// Maneja cola de peticiones fallidas

// src/infrastructure/http/interceptors/error.interceptor.ts
// Manejo global de errores HTTP
// Logging automático para debugging
```

### Permisos Granulares
```typescript
// src/config/permissions.config.ts
export const permissionsConfig = {
  SUPER_ADMIN: [
    'users:manage', 'courses:manage', 'analytics:view',
    'settings:manage', 'security:manage'
  ],
  ADMIN: [
    'users:read', 'courses:read', 'grades:manage',
    'analytics:view', 'security:manage'
  ],
  TEACHER: [
    'courses:read', 'modules:read', 'contents:read',
    'grades:manage', 'analytics:view'
  ],
  STUDENT: [
    'courses:read', 'modules:read', 'contents:read',
    'grades:view', 'certifications:view'
  ]
}
```

### Guards de Seguridad
```typescript
// src/presentation/guards/AuthGuard.tsx
// Requiere autenticación para acceder

// src/presentation/guards/RoleGuard.tsx
// Requiere rol específico (admin, teacher, etc.)

// src/presentation/guards/PermissionGuard.tsx
// Oculta/muestra elementos por permiso específico
```

### **¿Por qué solo validación y no deploy?**

```
1. Proyecto académico desde cero
2. 10 equipos trabajando en paralelo
3. Necesitamos asegurar calidad antes de integrar
4. Deploy manual hasta tener arquitectura estable
5. Evitar conflictos entre equipos
```

### **Error Handling - Sistema Completo**

### Tipos de Errores por Capa
```typescript
// Domain Errors (Errores de Negocio)
ValidationError      - Validación de datos de negocio
BusinessRuleError      - Reglas de negocio violadas
UnauthorizedError     - Permisos insuficientes
NotFoundError       - Recurso no encontrado

// Infrastructure Errors (Errores Técnicos)
NetworkError           - Errores de red/API
DatabaseError          - Errores de base de datos
```

### Error Boundaries
```typescript
// src/presentation/error-handling/ErrorBoundary.tsx
- Captura errores de React automáticamente
- Muestra UI amigable para usuarios
- Logging automático para debugging
- Botón de recuperación automática
```

### Logging Strategy
```typescript
// Development: console logging detallado con contexto
// Production: service logging estructurado
// Error tracking con información adicional
```

### **Status Checks en Pull Requests**
```
Todos los PRs deben pasar:
- CI Pipeline
- Security Scan
- Type Check
- Test Coverage
- Build Verification
```

**Nota**: Los equipos deben esperar a que todos los checks pasen antes de hacer merge a develop/main.

## Design System - Sistema Completo

### Tokens de Diseño
```typescript
// src/presentation/design-system/tokens/colors.ts
export const colors = {
  primary: '#223740',
  secondary: '#5A878C',
  tertiary: '#AEEBF2',
  neutral: '#060A0D'
}

// src/presentation/design-system/tokens/typography.ts
export const typography = {
  sans: ['Plus Jakarta Sans', 'system-ui', 'sans-serif']
}
```

### Componentes Base
```typescript
// Componentes reutilizables con variantes
Button/     - variantes: primary, secondary, inverted, outlined
Input/      - con label, error states, validación
Modal/      - responsive, accesible, sin backdrop
Card/       - flexible, shadow system, elevations
Toast/      - posicionamiento automático, auto-dismiss
Spinner/    - loading states, diferentes tamaños
```

### CSS Variables Dinámicas
```css
:root {
  --color-primary: #223740;
  --color-background: #ffffff;
  --color-foreground: #060a0d;
  --color-secondary: #5a878c;
  --color-tertiary: #aeebf2;
  --color-muted: #f1f5f9;
  --color-border: #e2e8f0;
}
```

### Responsive Design
```css
/* Mobile-first breakpoints */
.sm { /* 640px */ }
.md { /* 768px */ }
.lg { /* 1024px */ }
.xl { /* 1280px */ }
```

### **Status Checks en Pull Requests**
```
Todos los PRs deben pasar:
- CI Pipeline
- Security Scan
- Type Check
- Test Coverage
- Build Verification
```

**Nota**: Los equipos deben esperar a que todos los checks pasen antes de hacer merge a develop/main.

## Flujo de Trabajo

### Ramas
- `main` - Producción
- `develop` - Desarrollo principal
- `feature/nombre-funcionalidad` - Funcionalidades específicas

### Proceso
1. Trabajar desde la rama `develop`
2. Crear rama `feature/*` para cada funcionalidad
3. Hacer Pull Request a `develop`
4. Revisión y merge por el equipo correspondiente

## Configuración de Entorno

Copiar `.env.example` a `.env.local` y configurar:

```env
VITE_API_BASE_URL=http://localhost:8080/api
VITE_ANALYTICS_PROVIDER=plausible
VITE_MAX_FILE_SIZE=104857600
VITE_APP_NAME=Iush
```

## Paleta de Colores

- **Primary**: `#223740`
- **Secondary**: `#5A878C`
- **Tertiary**: `#AEEBF2`
- **Neutral**: `#060A0D`

## Analytics - Sistema Completo

### Proveedores Soportados
```
Plausible Analytics (Open Source) - Por defecto, respeta privacidad
Google Analytics 4 - Opcional, para instituciones que lo necesiten
Google Ad Manager - Opcional, para monetización
```

### Event Tracking
```typescript
// src/infrastructure/analytics/AnalyticsFactory.ts
export const trackEvent = (eventName: string, properties?: object) => {
  analytics.track(eventName, properties)
}

export const trackPageView = (path: string) => {
  analytics.page(path)
}

// src/presentation/contexts/AnalyticsContext.tsx
export const useAnalytics = () => {
  const { trackEvent, trackPageView } = useAnalyticsContext()
  return { trackEvent, trackPageView }
}
```

### Configuration
```env
VITE_ANALYTICS_PROVIDER=plausible
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
VITE_PLAUSIBLE_DOMAIN=plausible.io
VITE_GAM_NETWORK_CODE=1234567890
```

### Métricas Tracked
```
- Page views por usuario
- Time on page por curso
- Engagement con contenido
- Progreso de aprendizaje
- Interacciones con UI
- Errores y excepciones
- Performance metrics
```

## Personalización por Institución

Cada institución puede personalizar:
- Logo de la aplicación
- Colores (fondo, texto primario, secundario, terciario)
- Nombre y datos de contacto
- Configuración de analytics (proveedor y dominio)
- Configuración de Ad Manager (opcional)

## Performance - Optimización Completa

### Métricas Objetivo
```
First Contentful Paint: < 2s
Lighthouse Score: > 90
Bundle Size: < 1MB (gzipped)
Build Time: < 10s
Time to Interactive: < 3s
Cumulative Layout Shift: < 0.1
```

### Optimizaciones Implementadas
```typescript
// vite.config.ts - Optimización de build
build: {
  target: 'es2015',
  cssTarget: ['chrome61', 'firefox60', 'safari11', 'edge79'],
  rollupOptions: {
    output: {
      manualChunks: {
        'vendor-react': ['react', 'react-dom', 'react-router-dom'],
        'vendor-query': ['@tanstack/react-query'],
        'vendor-ui': ['lucide-react', 'clsx', 'tailwind-merge'],
        'vendor-forms': ['react-hook-form', 'zod', '@hookform/resolvers'],
        'vendor-state': ['zustand'],
      },
    },
  },
}
```

### Features de Performance
```
- Manual chunks para vendor code
- Tree shaking automático
- CSS purgado automáticamente
- Source maps para debugging
- Lazy loading de componentes
- Polyfills específicos por navegador
- Bundle analysis optimizado
```

### Build Optimization
```
Bundle Size Actual:
- Total: ~200KB gzipped
- Vendor chunks: ~50KB gzipped
- CSS: ~1.5KB gzipped
- Polyfills: ~37KB gzipped
```

## Licencia

Proyecto propiedad de la institución educativa. Todos los derechos reservados.

---
