# Usar `pytest` + `TestClient` para backend y `vitest` para frontend

## Alcance
- Backend: `backend/tests/test_routes.py` — usa `pytest` y `from fastapi.testclient import TestClient`.
- Frontend: `frontend/src/lib/financial-utils.test.ts` — usa `describe`, `it`, `expect` de `vitest`.

## Justificación
Cada capa tiene su framework de testing establecido:
- **Backend (pytest + TestClient)**: TestClient de FastAPI permite testear endpoints sin levantar un servidor HTTP real. Es rápido y no requiere puertos libres. pytest da fixtures, parametrización y plugins (coverage, etc.).
- **Frontend (vitest)**: vitest es nativo de Vite, comparte la misma configuración (alias `@/`, TypeScript, etc.) y es significativamente más rápido que jest al no requerir traducción de módulos.

## Guía específica
- **Backend**: los tests de endpoints deben usar `client = TestClient(app)` y llamar a `client.get("/api/…")`. Los tests de funciones puras pueden importar la función directamente.
- **Frontend**: los tests se colocan en archivos `*.test.ts` junto al código que prueban. Usar `describe`/`it`/`expect` (API estándar). Ejecutar con:
  ```bash
  npm test          # vitest run (una vez)
  npm run test:watch  # modo watch
  npm run test:coverage  # con reporte de cobertura
  ```
- No mezclar frameworks: no añadir `jest`, `unittest` (Python) u otros. Si se necesita funcionalidad extra, buscar plugins de pytest (backend) o vitest (frontend).