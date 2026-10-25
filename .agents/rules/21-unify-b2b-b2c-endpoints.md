# No crear endpoints separados por tipo de negocio — usar query param `business_type`

## Alcance
`backend/app/routes.py`:
- `get_b2b_metrics()` (líneas 367-377): filtra `business_type == "B2B"`.
- `get_b2c_metrics()` (líneas 383-395): filtra `business_type == "B2C"`.
- Ambos duplican el mismo código, solo cambia el valor del filtro.
- El endpoint `get_metrics_summary()` ya soporta `business_type` como query param opcional.

## Justificación
Tener dos endpoints que hacen exactamente lo mismo con distinto filtro es código duplicado:
- Cualquier cambio en la lógica de filtrado o respuesta debe aplicarse en ambos.
- Aumenta la superficie de testing (tests separados para b2b y b2c).
- La API es inconsistente: unos endpoints usan query params y otros crean rutas específicas.

## Guía específica
- No crear nuevos endpoints `b2b` o `b2c`. Si un endpoint necesita filtrar por tipo de negocio, añadir un query param opcional `business_type: BusinessType | None = Query(default=None)`.
- Los endpoints `get_b2b_metrics()` y `get_b2c_metrics()` existentes pueden refactorizarse para delegar en `get_metrics()` con el filtro, o mantenerse como compatibilidad hacia atrás pero marcados como `@deprecated`.
- Si se decide mantenerlos, refactorizar para que no dupliquen lógica:
  ```python
  @router.get("/api/metrics/b2b", response_model=list[FinancialMovement], deprecated=True)
  def get_b2b_metrics(...) -> ...:
      return get_metrics(..., business_type="B2B")
  ```
- En el frontend, no añadir nuevas llamadas a `/api/metrics/b2b` o `/api/metrics/b2c`. Usar `/api/metrics?business_type=B2B`.