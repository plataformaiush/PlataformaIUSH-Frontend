# EduPlatform - Plataforma Educativa LMS

## Descripción

EduPlatform es una **plataforma educativa web tipo LMS (Learning Management System)** personalizable por institución educativa, diseñada para gestionar todo el ciclo de aprendizaje: desde la creación de cursos hasta la certificación del estudiante.

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
- **React 19** + **TypeScript** + **Vite 6**
- **Tailwind CSS 4** + **Design System**
- **Zustand** + **TanStack Query**
- **React Router 7** + **React Hook Form** + **Zod**
- **Axios** + **Lucide Icons**

### Desarrollo
- **Node.js** + **npm**
- **ESLint** + **Prettier**
- **Vitest** + **Testing Library** + **MSW**
- **TypeScript** con path aliases

### Arquitectura
- **Arquitectura Hexagonal** (Ports & Adapters)
- **Domain-Driven Design**
- **Separación por equipos** (10 equipos trabajando en paralelo)

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
- `npm run test:ui` - UI de tests
- `npm run test:coverage` - Cobertura de tests
- `npm run lint` - Linting del código
- `npm run format` - Formateo del código
- `npm run type-check` - Verificación de tipos

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
VITE_APP_NAME=EduPlatform
```

## Paleta de Colores

- **Primary**: `#223740`
- **Secondary**: `#5A878C`
- **Tertiary**: `#AEEBF2`
- **Neutral**: `#060A0D`

## Personalización por Institución

Cada institución puede personalizar:
- Logo de la aplicación
- Colores (fondo, texto primario, secundario, terciario)
- Nombre y datos de contacto
- Configuración de analytics

## Licencia

Proyecto propiedad de la institución educativa. Todos los derechos reservados.

---

**Estado Actual**: Arquitectura completa y lista para desarrollo en paralelo por los 10 equipos.
