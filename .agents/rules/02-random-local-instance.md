# Usar instancia local de `random.Random()` en vez de `random.seed()` global

## Alcance
`backend/app/routes.py` línea 96: `random.seed(seed)` dentro de `generate_mock_movements()`.

## Justificación
`random.seed()` muta el estado **global** del módulo `random`. Cualquier otro código que use `random` en el mismo proceso (un nuevo endpoint, una librería, un test simultáneo) verá su secuencia alterada. Con datos mock esto no es crítico, pero si en el futuro se añade funcionalidad que necesite azar real (notificaciones, sampling, selección aleatoria), se romperá silenciosamente.

## Guía específica
- Para generación de datos mock o cualquier uso nuevo de aleatoriedad, crear una instancia dedicada:
  ```python
  _rng = random.Random(42)
  ```
- Llamar a `_rng.random()`, `_rng.uniform()`, `_rng.randint()` etc. sobre esa instancia, no sobre el módulo global.
- No añadir nuevos `random.seed()` en ningún punto del código.
- Si se necesita soportar seed dinámico, pasar la instancia como parámetro:
  ```python
  def generate_mock_movements(rng: random.Random | None = None) -> ...:
      rng = rng or random.Random(42)
  ```