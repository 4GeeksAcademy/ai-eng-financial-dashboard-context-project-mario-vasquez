# Usar la función `cn()` para combinar clases CSS

## Alcance
`frontend/src/lib/utils.ts`:
```typescript
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```
Usada en: `card.tsx`, `skeleton.tsx`, `kpi-card.tsx`, y todos los componentes UI.

## Justificación
`cn()` combina `clsx` (generación condicional de clases) con `tailwind-merge` (resolución de conflictos entre clases Tailwind). Esto:
- Permite pasar clases condicionales: `cn('base', condicion && 'activa')`.
- Resuelve conflictos cuando dos clases Tailwind intentan modificar la misma propiedad CSS (la última gana, como en CSS nativo).
- Evita errores de sintaxis al concatenar strings manualmente.

## Guía específica
- **Siempre** usar `cn()` para construir el string `className` de cualquier elemento.
- No concatenar strings: `` `clase1 ${cond ? 'clase2' : ''}` `` está **prohibido**.
- Ejemplos de uso correcto:
  ```typescript
  cn('flex items-center gap-4', className)
  cn('text-sm', isActive && 'font-bold', isDisabled && 'opacity-50')
  cn('px-6', className, 'mt-4')
  ```
- Si se necesita depurar el valor final de `className`, `cn()` devuelve un string limpio sin duplicados.
- No reemplazar `cn()` por `clsx` a secas: se perdería la resolución de conflictos de Tailwind.