# Usar modelos Pydantic con `response_model` para toda estructura de datos

## Alcance
`backend/app/routes.py` — modelos en líneas 18-57 y decoradores `@router.get(…, response_model=…)` en todos los endpoints.

## Justificación
FastAPI usa los modelos Pydantic para:
- Validar tipos en runtime (los datos incorrectos lanzan error 422 automático).
- Serializar a JSON correctamente (ej. `date` → string ISO).
- Generar documentación OpenAPI interactiva en `/docs` y `/openapi.json`.
- Proveer autocompletado en herramientas de desarrollo.

El proyecto ya define 6 modelos (`FinancialMovement`, `MetricsFacets`, `MetricsSummaryItem`, `TopCategoryItem`, `MetricsComparison`, `MetricsAlert`) y todos los endpoints los usan. Es un patrón consolidado.

## Guía específica
- Todo nuevo endpoint que devuelva una estructura con **más de 2 campos** debe:
  1. Definir un modelo Pydantic (heredando de `BaseModel`).
  2. Declararlo en el decorador: `@router.get("…", response_model=NuevoModelo)`.
  3. Usar type hints en los parámetros del modelo (ej. `date`, `float`, `Literal[…]`).
- Para listas, usar `response_model=list[MiModelo]`.
- Si un campo puede ser `None`, declararlo con `| None` (PEP 604) gracias a `from __future__ import annotations`.