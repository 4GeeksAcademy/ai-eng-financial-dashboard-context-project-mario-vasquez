# Modelar variantes visuales con un diccionario `variantStyles` tipado

## Alcance
`frontend/src/components/dashboard/kpi-card.tsx` líneas 16-31:
```typescript
const variantStyles: Record<KPICardProps['variant'], { badge: string; icon: string }> = {
  income: {
    badge: 'bg-[var(--income-badge)] text-[var(--income-badge-fg)]',
    icon: 'text-[var(--income-badge-fg)]',
  },
  outcome: { ... },
  profit: { ... },
  profitPercent: { ... },
}
```

## Justificación
Centralizar las variantes visuales en un diccionario tipado tiene varias ventajas frente a `if/switch`:
- La estructura es explícita y visible de un vistazo.
- TypeScript verifica que todas las claves están cubiertas (si el tipo de `variant` cambia, el compilador señala dónde faltan valores).
- Añadir una nueva variante es solo añadir una entrada al diccionario.
- El renderizado queda limpio: `variantStyles[variant].badge` en vez de un `switch` de 4 casos.

## Guía específica
- Para cualquier componente que tenga **variantes visuales** (colores, estilos, iconos distintos según un tipo):
  1. Definir el tipo de variante como unión de strings literales.
  2. Crear un `Record<VariantType, { … }>` con las propiedades que cambian por variante.
  3. Acceder con `variantStyles[variant].propiedad`.
- No usar `if/else` o `switch` para seleccionar estilos por variante.
- Si una variante comparte estilos (ej. `profit` y `profitPercent` usan el mismo badge), es correcto duplicar la entrada o crear un alias.