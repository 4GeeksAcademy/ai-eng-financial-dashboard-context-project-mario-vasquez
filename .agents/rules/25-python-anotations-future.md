# Usar `from __future__ import annotations` en todos los archivos Python del backend

## Alcance
`backend/app/routes.py` línea 1:
```python
from __future__ import annotations
```

## Justificación
Esta importación (PEP 604, PEP 649) convierte **todas** las anotaciones de tipo del archivo en strings, lo que permite:
- Usar sintaxis de unión con `|` (ej. `date | None`, `float | int`) incluso en Python 3.9-3.10.
- Referencias adelantadas sin need de comillas: `def foo() -> list[FinancialMovement]: ...` funciona aunque `FinancialMovement` se defina después.
- Coincidir con el estilo de TypeScript/type hints modernos.

El proyecto ya lo usa en `routes.py`. Todos los archivos del backend deben seguir la misma convención.

## Guía específica
- Agregar `from __future__ import annotations` como **primera línea** de código en todo archivo Python nuevo.
- Si un archivo existente no lo tiene, agregarlo (siempre que sea seguro — no debe haber imports con side effects antes).
- Esto permite usar `list[X]` en vez de `typing.List[X]`, `dict[K, V]` en vez de `typing.Dict[K, V]`, y `X | None` en vez de `Optional[X]`.
- No mezclar estilos: si el archivo tiene `from __future__ import annotations`, usar las sintaxis modernas. Si no lo tiene, mantener el estilo existente.