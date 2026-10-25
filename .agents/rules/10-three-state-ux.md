# Implementar los 3 estados UX en cada componente visual

## Alcance
Archivos del frontend que consumen datos de la API:
- `frontend/src/App.tsx` (orquestador: loading, error, metrics + monthlyData)
- `frontend/src/components/dashboard/kpi-card.tsx` (loading → Skeleton, datos → tarjeta)
- `frontend/src/components/dashboard/income-outcome-chart.tsx` (loading → Skeleton, sin datos → mensaje, datos → gráfico)
- `frontend/src/components/dashboard/profit-percent-chart.tsx` (loading → Skeleton, sin datos → mensaje, datos → gráfico)

## Justificación
Toda UI que muestra datos de red debe contemplar 3 escenarios:
1. **Loading**: mientras se espera la respuesta. Mostrar esqueletos animados (Skeleton) para que la página no aparezca rota.
2. **Error**: cuando la llamada falla. Mostrar un mensaje claro al usuario.
3. **Sin datos**: cuando la respuesta llega vacía o sin contenido renderizable. Mostrar un mensaje informativo en lugar del gráfico vacío.

El proyecto ya implementa este patrón correctamente. Cualquier nuevo componente debe seguir el mismo esquema.

## Guía específica
- Todo componente que reciba un `loading?: boolean` debe:
  ```typescript
  if (loading) {
    // Mostrar Skeleton o versión simplificada
    return <div>…</div>
  }
  ```
- Si los datos pueden llegar vacíos, verificar con `data.some(…)` o `data.length === 0`:
  ```typescript
  const hasData = data.some((d) => d.income > 0 || d.outcome > 0)
  if (!hasData) {
    return <div>No data available to display</div>
  }
  ```
- En el orquestador (`App.tsx`), capturar errores con `.catch()` y asignar un mensaje a un estado `error`.
- Usar las clases CSS semánticas del proyecto (`border-destructive/30`, `bg-destructive/10`, `text-destructive-foreground`) para el mensaje de error.