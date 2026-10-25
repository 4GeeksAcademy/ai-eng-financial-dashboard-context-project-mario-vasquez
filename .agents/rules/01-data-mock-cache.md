# Cachear datos mock del backend

## Alcance
`backend/app/routes.py` — función `generate_mock_movements()` y todos los endpoints que la invocan.

## Justificación
`generate_mock_movements(seed=42)` se ejecuta **9 veces** por página (rutas: `/api/metrics`, `/api/metrics/facets`, `/api/metrics/summary`, `/api/metrics/categories/top`, `/api/metrics/comparison`, `/api/metrics/alerts`, `/api/metrics/b2b`, `/api/metrics/b2c`). Cada llamada regenera 360 objetos `FinancialMovement` desde cero, trabajo CPU redundante que escala mal.

## Guía específica
- No añadir más llamadas directas a `generate_mock_movements()` sin cachear.
- Usar una variable de módulo con guarda `if _cached is None` o el decorador `@functools.lru_cache` sobre `generate_mock_movements`.
- Si se crea un nuevo endpoint que necesite los movimientos, leer de la caché, no regenerar.
- Ejemplo de implementación:
  ```python
  from functools import lru_cache

  @lru_cache(maxsize=1)
  def get_cached_movements(seed: int = 42) -> list[FinancialMovement]:
      return generate_mock_movements(seed=seed)
  ```