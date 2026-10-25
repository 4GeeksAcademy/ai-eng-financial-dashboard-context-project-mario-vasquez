# Añadir GitHub Actions para CI/CD

## Alcance
No existe el directorio `.github/` ni ningún archivo de workflow en el repositorio.

## Justificación
La ausencia de CI/CD implica:
- Los tests solo se ejecutan localmente, si quien hace el cambio se acuerda.
- No hay barrera automática para evitar que código que rompe tests llegue a `main`.
- No hay verificación de linting ni type checking en backend.
- Los contribuidores externos no reciben feedback automático sobre sus PRs.
- No hay despliegue automatizado.

## Guía específica
- Crear `.github/workflows/test.yml` con:
  ```yaml
  name: Tests

  on:
    push:
      branches: [main]
    pull_request:
      branches: [main]

  jobs:
    backend:
      runs-on: ubuntu-latest
      defaults:
        run:
          working-directory: ./backend
      steps:
        - uses: actions/checkout@v4
        - uses: actions/setup-python@v5
          with:
            python-version: "3.13"
        - run: pip install -r requirements.txt
        - run: pytest --cov=app --cov-report=term-missing

    frontend:
      runs-on: ubuntu-latest
      defaults:
        run:
          working-directory: ./frontend
      steps:
        - uses: actions/checkout@v4
        - uses: actions/setup-node@v4
          with:
            node-version: "24"
        - run: npm ci
        - run: npm test
  ```
- Considerar añadir un job de linting para el backend cuando `ruff` esté configurado.
- No usar `npm install` en CI: usar `npm ci` (más rápido, usa `package-lock.json`).
- Si el proyecto tiene secretos para despliegue, añadirlos como GitHub Secrets y referenciarlos con `${{ secrets.… }}`.