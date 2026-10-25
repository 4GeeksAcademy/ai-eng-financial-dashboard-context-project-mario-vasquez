# No duplicar lógica de agregación entre backend y frontend

## Alcance
- Backend: `backend/app/routes.py` — función `summarize_movements()` (agrupa movimientos por day/week/month, calcula income/outcome/net).
- Frontend: `frontend/src/lib/financial-utils.ts` — función `computeMonthlyData()` (agrupa por mes, suma income/outcome, calcula profitPercent).

## Justificación
Ambas funciones realizan esencialmente la misma tarea: agrupar movimientos financieros por periodo y calcular totales. La lógica vive en dos lenguajes distintos (Python y TypeScript), lo que duplica el mantenimiento y abre la puerta a inconsistencias: si se cambia la lógica de agrupación en un lado pero no en el otro, los datos del dashboard dejarán de cuadrar.

## Guía específica
- **Estrategia recomendada**: que el backend devuelva datos ya agregados y el frontend solo renderice. El endpoint `GET /api/metrics/summary?group_by=month` ya provee esto.
- Si se decide mantener la agregación en frontend (por ejemplo para reducir llamadas API), eliminar `summarize_movements()` del backend y que el frontend sea el único responsable.
- Si se mantienen ambas, **cualquier cambio** en la lógica de agrupación debe aplicarse simultáneamente en:
  1. `backend/app/routes.py` → `summarize_movements()`
  2. `frontend/src/lib/financial-utils.ts` → `computeMonthlyData()`
- Documentar en ambos archivos que la lógica está duplicada con un comentario:
  ```typescript
  // NOTA: si cambias esta función, actualiza también summarize_movements() en backend/app/routes.py
  ```