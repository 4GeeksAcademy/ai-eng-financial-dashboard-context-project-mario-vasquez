# Usar el alias `@/` para imports locales en el frontend

## Alcance
- `frontend/vite.config.ts` línea 16: `alias: { "@": path.resolve(__dirname, "./src") }`
- `frontend/tsconfig.app.json` línea 10: `"paths": { "@/*": ["./src/*"] }`

## Justificación
El alias `@/` resuelve a `frontend/src/`. Esto permite imports como `@/components/ui/card` en vez de `../../../components/ui/card`. Beneficios:
- Elimina rutas relativas frágiles que se rompen al mover archivos.
- Hace los imports más legibles y cortos.
- Consistente con la convención de shadcn/ui (el proyecto usa `components.json` con `"aliases": { "components": "@/components" }`).

## Guía específica
- Todos los imports de archivos dentro de `frontend/src/` deben usar `@/ruta/archivo`, **nunca** rutas relativas (`../../`).
- Ejemplo correcto:
  ```typescript
  import { Card } from '@/components/ui/card'
  import { cn } from '@/lib/utils'
  ```
- Ejemplo incorrecto:
  ```typescript
  import { Card } from '../ui/card'     // ← no
  import { cn } from '../../lib/utils'  // ← no
  ```
- El alias funciona tanto en Vite (build) como en TypeScript (IDE/type-checking) gracias a la doble configuración en `vite.config.ts` y `tsconfig.app.json`.