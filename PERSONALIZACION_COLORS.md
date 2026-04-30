# Personalización de Colores - Sistema de Temas

## 📋 Resumen de Cambios

El sistema de personalización del SuperAdmin ha sido actualizado para incluir **9 variables de color** que sincroniza directamente con el backend.

## 🎨 Variables de Color

### Formato del Backend
Estas son las variables que el backend envía en la respuesta de `GET /api/institucion/config`:

```json
{
  "logo_url": "https://cdn.example.com/logo.png",
  "primary_color": "#1E40AF",
  "secondary_color": "#0891B2",
  "tertiary_color": "#AEEDF2",
  "background_color": "#F8FAFC",
  "text_primary": "#0F172A",
  "text_secondary": "#475569",
  "text_tertiary": "#94A3B8",
  "border_color": "#E2E8F0",
  "input_color": "#FFFFFF"
}
```

### Mapeo Frontend ↔ Backend

| Frontend Property | Backend Key | CSS Variable | Uso |
|---|---|---|---|
| `primary` | `primary_color` | `--color-primary` | Color principal, botones, acentos |
| `secondary` | `secondary_color` | `--color-secondary` | Color secundario, enlaces |
| `tertiary` | `tertiary_color` | `--color-tertiary` | Acentos terciarios, destacados |
| `background` | `background_color` | `--color-background` | Fondo de la página |
| `textBase` | `text_primary` | `--color-foreground` | Texto principal del sitio |
| `textSecondary` | `text_secondary` | `--color-muted-foreground` | Texto secundario, subtítulos |
| `textTertiary` | `text_tertiary` | `--color-muted` | Texto tenue, labels |
| `border` | `border_color` | `--color-border` | Bordes, divisores |
| `input` | `input_color` | `--color-input` | Fondo de campos de entrada |

## 🔄 Flujo de Datos

### 1. Cargando la Configuración
```
Backend (GET /api/institucion/config)
  ↓
institutionService.getConfig()
  ↓
normalizeInstitutionData() → Mapea backend → frontend
  ↓
setColors(normalizedData.colors)
  ↓
applyTheme() → Establece CSS variables en :root
  ↓
UI se actualiza con los nuevos colores
```

### 2. Guardando la Configuración
```
Usuario edita colores en PersonalizacionView
  ↓
handleSave()
  ↓
institutionService.updateConfig()
  ↓
Transforma colors frontend → formato backend
  ↓
PUT /api/institucion/config
  ↓
Backend valida y guarda
  ↓
applyTheme() en response
```

## 📁 Archivos Modificados

### 1. **src/domain/institution/types.ts**
- ✅ Actualizada interface `InstitutionColors` con 9 propiedades
- ✅ Actualizado `defaultInstitutionColors` con valores por defecto
- ✅ Actualizada función `generateCSSVariables()` para incluir todas las variables

### 2. **src/domain/institution/institutionService.ts**
- ✅ `normalizeInstitutionData()`: Mapea todos los 9 campos del backend
- ✅ `updateConfig()`: Envía todos los campos al backend
- ✅ `applyTheme()`: Aplica 9 variables CSS en el `:root`

### 3. **src/presentation/features/institutions/components/PersonalizacionView.tsx**
- ✅ Actualizado `COLOR_FIELDS` con 9 colores organizados por categoría
- ✅ Agrupa colores en 4 secciones: Principales, Fondos, Texto, Bordes
- ✅ Agregar **Vista previa** que muestra cómo se ven los colores en botones, textos e inputs

### 4. **src/styles/globals.css**
- ✅ Actualizado tema claro con nuevos valores por defecto
- ✅ Actualizado tema oscuro con colores invertidos

## 🎯 Cómo Funciona en el SuperAdmin

### Interfaz de Personalización

La vista de **Personalización** del SuperAdmin ahora muestra:

1. **Logo URL** - Campo para URL del logo
2. **Colores principales** (3 campos)
   - Color primario
   - Color secundario
   - Color terciario

3. **Fondos** (2 campos)
   - Fondo principal
   - Fondo de inputs

4. **Texto** (3 campos)
   - Texto principal
   - Texto secundario
   - Texto tenue

5. **Bordes** (1 campo)
   - Color de bordes

6. **Vista previa** - Muestra cómo se ven los colores:
   - Botones en cada color
   - Textos en cada nivel
   - Input de ejemplo
   - Estilos en tiempo real

## 🧪 Pruebas

### Para verificar que funciona correctamente:

1. **Carga inicial**: Al abrir Personalización, deben cargar los colores actuales
2. **Cambios en tiempo real**: Al modificar un color en el input, se actualiza inmediatamente en:
   - El selector de color
   - La vista previa
   - Los estilos inline

3. **Guardado**: Al presionar "Guardar cambios":
   - Se envía JSON con todos los 9 campos al backend
   - Se recibe la respuesta y se actualizan todos los colores
   - Se muestra toast de éxito/error

4. **Persistencia**: Los colores deben persistir después de recargar la página

## 🌓 Tema Oscuro

El sistema soporta `prefers-color-scheme: dark`. En modo oscuro:
- Los colores se invierten automáticamente
- Se define un conjunto diferente de colores en globals.css
- El backend puede enviar diferentes colores según el tema

## 📝 Notas Importantes

- Todas las variables CSS usan formato `var(--color-*)` 
- Los colores hexadecimales se validan en el frontend con `type="color"`
- El mapeo es bidireccional (frontend ↔ backend)
- Los valores por defecto están sincronizados entre frontend y backend
