# No manipular `sys.path` en `conftest.py` — instalar el paquete en modo editable

## Alcance
`backend/tests/conftest.py`:
```python
import sys
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parents[1]
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))
```

## Justificación
Insertar rutas en `sys.path` manualmente es un patrón frágil:
- Si el proyecto se reestructura (ej. se mueve `tests/` fuera de `backend/`), la raja relativa `parents[1]` se rompe.
- Si se cambia de test runner o se ejecuta desde otro directorio, los imports fallan.
- No todas las herramientas respetan las modificaciones de `sys.path` hechas en `conftest.py`.
- La forma estándar en Python es instalar el paquete con `pip install -e .` o definir `PYTHONPATH`.

## Guía específica
- **Opción A (recomendada)**: Crear `backend/pyproject.toml` con la configuración del proyecto y ejecutar `pip install -e .` para desarrollo.
  ```toml
  [build-system]
  requires = ["setuptools"]
  build-backend = "setuptools.build_meta"

  [project]
  name = "financial-metrics-api"
  version = "0.1.0"
  ```
- **Opción B (mínimo)**: Configurar `PYTHONPATH` en un `pyproject.toml` de pytest:
  ```toml
  [tool.pytest.ini_options]
  pythonpath = ["."]
  ```
- Si se mantiene el `conftest.py` actual, no modificar la ruta relativa sin verificar que `parents[1]` sigue siendo la raíz del backend.