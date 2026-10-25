# Usar `seed=42` para datos deterministas en tests

## Alcance
- `backend/app/routes.py` — todos los endpoints llaman a `generate_mock_movements(seed=42)`.
- `backend/tests/test_routes.py` — línea 13: `generate_mock_movements(seed=42)`.

## Justificación
Usar una semilla fija (`42`) garantiza que los datos generados sean **deterministas**: el mismo seed produce exactamente los mismos 360 movimientos cada vez. Esto:
- Hace los tests reproducibles: no hay falsos positivos/negativos por aleatoriedad.
- Permite afirmar valores concretos en las aserciones.
- Evita que un test pase unas veces y falle otras (flaky tests).
- Es un contrato implícito: cualquier consumo de estos datos mock sabe que la semilla es 42.

## Guía específica
- En **tests**, pasar siempre `seed=42` a `generate_mock_movements()`. Nunca omitir el seed ni pasar `None`.
- Si un test necesita un conjunto de datos específico no cubierto por seed=42, crear movimientos manualmente en el propio test (como hace `test_routes.py` con listas literales).
- Si se añade una nueva función generadora de mock data, debe aceptar un parámetro `seed` opcional y usarlo para crear una instancia `random.Random(seed)` local.
- No cambiar el valor `42` sin actualizar todos los tests que dependen de él.