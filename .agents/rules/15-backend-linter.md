# Añadir linter (ruff) y type checker (mypy) al backend

## Alcance
El frontend tiene `eslint.config.js` con TypeScript-ESLint + plugins (react-hooks, react-refresh). El backend **no tiene** ninguna herramienta de linting/formatting configurada en `backend/requirements.txt` ni en ningún archivo de configuración.

## Justificación
La ausencia de linter y type checker en el backend provoca:
- Estilo de código inconsistente entre contribuidores (espacios vs tabs, comillas simples vs dobles, saltos de línea, etc.).
- Errores de tipo que pasarían desapercibidos hasta runtime (ej. pasar `str` donde se espera `date`).
- Imports no utilizados acumulándose.
- Dificultad para mantener una base de código limpia a medida que crece.

## Guía específica
- Añadir a `backend/requirements.txt`:
  ```
  ruff
  mypy
  ```
- Crear secciones en `backend/pyproject.toml` (o crearlo si no existe) con:
  ```toml
  [tool.ruff]
  line-length = 100
  target-version = "py313"

  [tool.ruff.lint]
  select = ["E", "F", "I", "N", "W", "UP"]

  [tool.mypy]
  python_version = "3.13"
  strict = true
  ```
- Ejecutar antes de cada commit:
  ```bash
  ruff check .
  mypy app/
  ```
- Si se usa VS Code, instalar la extensión `charliermarsh.ruff` para formato automático al guardar.
- No añadir `pylint`, `flake8` u otras herramientas: `ruff` cubre linting y formato, `mypy` cubre tipos.