# Añadir `.dockerignore` en backend/ y frontend/

## Alcance
No existe ningún archivo `.dockerignore` en el proyecto. Los Dockerfiles están en:
- `backend/Dockerfile` (imagen `python:3.13-slim`)
- `frontend/Dockerfile` (imagen `node:24-alpine`)

## Justificación
Sin `.dockerignore`, el comando `COPY . .` dentro del Dockerfile copia **todo** el directorio de contexto a la imagen:
- `__pycache__/` y `*.pyc` → basura compilada.
- `.pytest_cache/`, `.mypy_cache/`, `.ruff_cache/` → caches de herramientas.
- `.git/` → todo el historial del repo (pesado e innecesario).
- `node_modules/` (en frontend) → cientos de MB si no está en `.dockerignore` del host.
- Archivos `*.md`, `.gitignore`, etc. → innecesarios en producción.

Esto resulta en imágenes más pesadas, builds más lentos y posible cache poisoning.

## Guía específica
- Crear `backend/.dockerignore` con:
  ```
  __pycache__
  *.pyc
  .pytest_cache
  .mypy_cache
  .ruff_cache
  .coverage
  htmlcov
  .git
  .gitignore
  *.md
  .env
  .venv
  venv
  ```
- Crear `frontend/.dockerignore` con:
  ```
  node_modules
  dist
  .vite
  .npm
  coverage
  .git
  .gitignore
  *.md
  .env
  .env.local
  ```
- Verificar que la imagen resultante es significativamente más pequeña. Para Python 3.13-slim, la imagen debería estar por debajo de 200 MB.