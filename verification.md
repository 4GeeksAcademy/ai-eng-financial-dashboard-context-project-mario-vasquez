# Verificación del resumen del proyecto

Contraste realizado contra el código y la documentación del repositorio.

| Afirmación | Estado | Evidencia |
|---|---|---|
| Dashboard financiero con React y TypeScript; muestra KPIs y gráficos mensuales. | ✅ | `frontend/package.json`, `frontend/src/App.tsx` |
| El frontend consulta `GET /api/metrics` y calcula los KPIs y agregados mensuales en el navegador. | ✅ | `frontend/src/App.tsx`, `frontend/src/lib/financial-utils.ts` |
| Vite reenvía `/api` al servicio `backend:8000`. | ✅ | `frontend/vite.config.ts`, `docker-compose.yml` |
| FastAPI expone 9 endpoints (2 deprecados): health, metrics, facets, summary, categories/top, comparison, alerts, b2b (deprecated), b2c (deprecated). | ✅ | `backend/app/main.py`, `backend/app/routes.py` — b2b/b2c marcados con `deprecated=True` |
| El backend genera 360 datos simulados (12 meses × 30) con semilla fija `seed=42` usando instancia local `random.Random(42)`. | ✅ | `backend/app/routes.py` — `get_movements(seed=42)` → `_cached_movements()` con `lru_cache` |
| Los datos mock se cachean con `@lru_cache` y no se regeneran en cada endpoint. | ✅ | `backend/app/routes.py` — `_cached_movements()` decorada con `@lru_cache(maxsize=1)`, 8 endpoints usan `get_movements()` |
| No se usa ninguna base de datos. | ✅ | Cero imports de ORM/DB. Solo stdlib: `random`, `defaultdict`, `date`, `timedelta`, `functools`. |
| 4 KPIs: Total Income, Total Outcome, Profit, Profit Margin %. | ✅ | `frontend/src/lib/financial-types.ts` (`KPIMetrics`), `frontend/src/components/dashboard/kpi-card.tsx`, `frontend/src/components/dashboard/kpi-row.tsx` |
| 2 gráficos: Income vs Outcome (líneas) y Profit Margin % (línea + reference line). | ✅ | `frontend/src/components/dashboard/income-outcome-chart.tsx`, `frontend/src/components/dashboard/profit-percent-chart.tsx` — usan recharts `LineChart` |
| Se puede iniciar con `docker compose up --build`; puertos 5173 (frontend) y 8000 (backend). | ✅ | `docker-compose.yml` — frontend build `./frontend/Dockerfile`, backend build `./backend/Dockerfile` |
| La documentación interactiva está disponible en `/docs` del backend. | ✅ | FastAPI genera `/docs` automáticamente; README indica `http://localhost:8000/docs`. |
| Backend expone puerto 5678 para debug remoto (debugpy). | ✅ | `backend/Dockerfile` CMD: `python -m debugpy --listen 0.0.0.0:5678` + `docker-compose.yml` ports `5678:5678` |
| CORS configurable por variable de entorno `CORS_ORIGINS`; por defecto `http://localhost:5173`. | ✅ | `backend/app/main.py` — `os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",")` |
| `API_BASE_URL` configurable por env `VITE_API_BASE_URL`; por defecto vacío (mismo origen). | ✅ | `frontend/src/App.tsx` línea 11: `import.meta.env.VITE_API_BASE_URL ?? ""` |
| `mock-data.ts` eliminado — no era usado por ningún archivo del proyecto. | ✅ | `frontend/src/lib/mock-data.ts` fue eliminado (`rm`), ningún import lo referenciaba |
| El período del dashboard se calcula dinámicamente desde las fechas de los movimientos. | ✅ | `frontend/src/App.tsx` — `computePeriodLabel()` usa `Math.min/max` sobre `create_date` |
| Tests: pytest (backend, 15 tests) + vitest (frontend, 5 tests). | ✅ | `backend/tests/test_routes.py` (15 tests endpoint), `frontend/src/lib/financial-utils.test.ts` (5 tests unitarios) |
| Python 3.13 + Node 24 oficial. | ✅ | `backend/Dockerfile`: `python:3.13-slim` · `frontend/Dockerfile`: `node:24-alpine` |
| Tailwind CSS v4 con variables CSS Oklch. | ✅ | `frontend/package.json`: `"tailwindcss": "^4.2.2"` · `frontend/src/index.css` usa `oklch()` y `@import "tailwindcss"` |
| `.dockerignore` para backend y frontend (ignora cachés, node_modules, .git, etc.). | ✅ | `backend/.dockerignore` y `frontend/.dockerignore` |
| `.env.example` con documentación de `VITE_API_BASE_URL`. | ✅ | `frontend/.env.example` |
| CI/CD con GitHub Actions (pytest + vitest + eslint en cada PR). | ✅ | `.github/workflows/test.yml` — jobs backend (pytest) y frontend (npm test + npm run lint) |
| ruff + mypy configurados en `backend/pyproject.toml` y listados en `requirements.txt`. | ✅ | `backend/pyproject.toml` (`[tool.ruff]`, `[tool.mypy]`), `backend/requirements.txt` incluye `ruff` y `mypy` |
| `from __future__ import annotations` en todos los archivos `.py` del backend. | ✅ | `backend/app/routes.py:1`, `backend/app/main.py:1`, `backend/tests/conftest.py:1`, `backend/tests/test_routes.py:1` |
| `conftest.py` no manipula `sys.path` — usa `pyproject.toml` con `pythonpath = ["."]`. | ✅ | `backend/pyproject.toml` (`[tool.pytest.ini_options]`), `backend/tests/conftest.py` limpio |

## Resumen corregido

El proyecto es un **dashboard financiero** con frontend **React 19 + TypeScript 6 + Vite 8 + Tailwind v4** y backend **Python 3.13 + FastAPI + Uvicorn**. El frontend, servido por Vite, obtiene los movimientos desde `GET /api/metrics` mediante el proxy `/api` hacia el backend (`http://backend:8000`); después computa en el navegador 4 KPIs (`computeKPIs()`) y la agregación mensual (`computeMonthlyData()`) que presentan los componentes del dashboard. El backend genera 360 movimientos simulados de forma determinista (instancia local `random.Random(42)`, cacheados con `@lru_cache`) para **9 endpoints REST** (2 deprecados) que soportan filtros por fecha, categoría, tipo de operación, tipo de negocio y agrupación. **No usa base de datos** — todo se genera en memoria. Los gráficos se renderizan con **recharts** (líneas) y las tarjetas con componentes **shadcn/ui** + **lucide-react** para iconos.

### Puertos

| Servicio | URL | Puerto |
|----------|-----|--------|
| Frontend | http://localhost:5173 | 5173 |
| Backend API | http://localhost:8000 | 8000 |
| Debug remoto (debugpy) | — | 5678 |
| Documentación API | http://localhost:8000/docs | — |

## Rastro de verificación: desajustes PM wording vs API fields (2026-11-07)

Contraste sistemático entre las afirmaciones de `memory-bank/product-overview.md` y los campos reales de la API (verificados contra `backend/app/routes.py` + llamadas curl a cada endpoint).

| # | Afirmación del PM | Campo real / Realidad | Desajuste | Resuelto en spec |
|---|---|---|---|---|
| 1 | "Filtros por fecha, categoría, tipo de operación, **tipo de negocio**" en `GET /api/metrics` | `GET /api/metrics` NO acepta `business_type`. Solo `start_date`, `end_date`, `category`, `operation_type`. | ⚠️ El filtro `business_type` no existe en el endpoint principal. Sí existe en summary, categories/top, comparison, alerts. | `api-spec.md` § "Desajuste con el PM: Filtro business_type ausente" |
| 2 | "Profit Margin %" (PM) vs "profit/profitPercent" (frontend) vs "net" (backend) | Backend `MetricsSummaryItem.net` = frontend `KPIMetrics.profit`. El PM llama "Profit Margin %" al mismo concepto. | ⚠️ `net` (backend) ≠ `profit` (frontend) para el mismo cálculo `income - outcome`. | `schemas-spec.md` § "Desajuste de terminología: Frontend Profit vs Backend Net" |
| 3 | Diagrama de arquitectura: solo `Navegador → GET /api/metrics → FastAPI` | 9 endpoints reales (solo 1 representado en el diagrama) | ⚠️ El diagrama es correcto para el flujo actual del frontend pero omite 8 endpoints que el backend expone. | `components-spec.md` § "Desajuste con el PM: Diagrama de arquitectura subestima la API" |
| 4 | "360 movimientos (12 meses × 30 días)" | Rango real de montos: 514.38 - 11984.17. Montos siempre positivos (no hay negativos). | ✅ Sin desajuste. El PM no especifica rangos. | N/A |
| 5 | "2 gráficos: Income vs Outcome y Profit Margin %" | El backend llama `net` a `income - outcome`; el frontend llama `profitPercent` a `(profit/income)*100`. | ⚠️ `monthlyData.profitPercent` (frontend) no tiene campo equivalente directo en `MetricsSummaryItem` (backend). | `schemas-spec.md` § "Desajuste de terminología" |
| 6 | `computeMonthlyData()` replica agregación del backend | `GET /api/metrics/summary?group_by=month` devuelve lo mismo que `computeMonthlyData()` en frontend. | ⚠️ Duplicación de lógica: servidor y cliente computan lo mismo por separado. | `utils-spec.md` § "Desajuste PM vs realidad: computeMonthlyData vs GET /api/metrics/summary" |

### Detalle de la verificación

**Verificado contra backend corriendo** (2026-11-07):
- Endpoint `GET /api/metrics?business_type=B2B` → 360 items sin filtrar (confirma bug: parámetro no declarado)
- Endpoint `GET /api/metrics/summary` → campo `net` en todos los items
- Endpoint `GET /api/metrics/comparison` → campos `current_period`, `previous_period`, `delta_abs`, `delta_pct`
- Todos los endpoints responden con datos reales

**Decisión**: Todos los desajustes se resolvieron exclusivamente en los archivos de spec (`frontend/specs/`). No se modificó ni el PM ni la implementación.

### Cómo ejecutar

```bash
docker compose up --build
```
