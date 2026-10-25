# Calcular dinámicamente el período mostrado en el encabezado del dashboard

## Alcance
`frontend/src/App.tsx` línea 37:
```typescript
<DashboardHeader period="2024 - Full Year" />
```

## Justificación
El período está hardcodeado como `"2024 - Full Year"`. Sin embargo:
- Los datos mock se generan con `date.today()` cada vez que se llama a la API.
- Si el año actual no es 2024, el header muestra un año incorrecto.
- Un agente o contribuidor podría asumir que el período se obtiene de los datos reales.
- El valor no se actualiza solo: hay que modificarlo manualmente al cambiar de año.

## Guía específica
- Calcular el período desde las fechas reales de los movimientos devueltos por la API.
- En `App.tsx`, después de recibir los movimientos, extraer `min` y `max` de `create_date`:
  ```typescript
  const dates = movements.map(m => new Date(m.create_date));
  const minDate = new Date(Math.min(...dates.map(d => d.getTime())));
  const maxDate = new Date(Math.max(...dates.map(d => d.getTime())));
  const periodLabel = `${minDate.getFullYear()} - ${maxDate.getFullYear()}`;
  ```
- Alternativamente, usar el endpoint `GET /api/metrics/facets` que ya devuelve `min_date` y `max_date`.
- Pasar el período calculado a `DashboardHeader` en vez del string fijo.
- Si no hay movimientos (error/loading), mostrar un valor por defecto como `"—"` o `"Loading…"`.