# 📁 Carpeta de Configuración

## ¿Qué hay aquí? ⚙️

Todos los archivos de configuración del proyecto en un solo lugar para no asustar a nadie.

## Archivos de Configuración 📋

### TypeScript
- `tsconfig.json` - Configuración principal de TypeScript
- `tsconfig.node.json` - Configuración para Node.js (build y herramientas)

### Estilos y Build
- `tailwind.config.ts` - Colores y estilos predefinidos
- `postcss.config.js` - Procesamiento de CSS
- `vite.config.ts` - Configuración del constructor rápido

### Calidad y Reglas
- `eslint.config.js` - Reglas para escribir código bonito
- `vitest.config.ts` - Configuración de pruebas automáticas

### Entorno y Sistema
- `.gitignore` - Archivos que Git debe ignorar
- `.env.example` - Ejemplo de variables de entorno
- `.browserslistrc` - Navegadores soportados

### Automatización
- `.github/workflows/` - Robots que revisan el código automáticamente

## ¿Por qué están aquí? 🤔

**Ventaja:** La carpeta principal (`src/`) queda limpia y solo contiene código de la aplicación.

**Ventaja:** Los nuevos desarrolladores saben exactamente dónde buscar configuración.

**Ventaja:** Es fácil copiar esta configuración para otros proyectos.

## ¿Cómo funciona? 🔄

Los archivos siguen funcionando igual, solo que están organizados.

### Antes (Desordenado):
```
PlataformaIUSH-Frontend/
├── src/
├── tsconfig.json  ← Aquí
├── vite.config.ts ← Aquí  
├── tailwind.config.ts ← Aquí
└── eslint.config.js ← Aquí
```

### Después (Organizado):
```
PlataformaIUSH-Frontend/
├── src/
├── config/
│   ├── tsconfig.json
│   ├── vite.config.ts
│   ├── tailwind.config.ts
│   └── eslint.config.js
└── package.json (apunta a la carpeta config)
```

## Para los equipos 👥

**No necesitas modificar estos archivos** a menos que:
- Estés agregando una nueva librería (raro)
- Cambies colores globales (Equipo 3)
- Necesites reglas nuevas de código (Equipo 8)

**Tu trabajo sigue siendo:** `src/` y tu área asignada.

---

*"La configuración es como el reglamento del juego: importante, pero no es el juego en sí."*
