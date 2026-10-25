# Verificación del resumen del proyecto

Contraste realizado contra el código y la documentación del repositorio.

| Afirmación | Estado | Evidencia |
|---|---|---|
| Dashboard financiero con React y TypeScript; muestra KPIs y gráficos mensuales. | ✅ | `frontend/package.json`, `frontend/src/App.tsx` |
| El frontend consulta `GET /api/metrics` y calcula los KPIs y agregados mensuales en el navegador. | ✅ | `frontend/src/App.tsx`, `frontend/src/lib/financial-utils.ts` |
| Vite reenvía `/api` al servicio `backend:8000`. | ✅ | `frontend/vite.config.ts`, `docker-compose.yml` |
| FastAPI expone 9 endpoints: health, metrics, facets, summary, categories/top, comparison, alerts, b2b, b2c. | ✅ | `backend/app/main.py`, `backend/app/routes.py` |
| El backend genera 360 datos simulados (12 meses × 30) con semilla fija `seed=42`. | ✅ | `backend/app/routes.py` — `generate_mock_movements(seed=42)`, confirmado en test: `assert len(movements) == 360` |
| No se usa ninguna base de datos. | ✅ | Cero imports de ORM/DB. Solo stdlib: `random`, `defaultdict`, `date`, `timedelta`. |
| 4 KPIs: Total Income, Total Outcome, Profit, Profit Margin %. | ✅ | `frontend/src/lib/financial-types.ts` (`KPIMetrics`), `frontend/src/components/dashboard/kpi-card.tsx`, `frontend/src/components/dashboard/kpi-row.tsx` |
| 2 gráficos: Income vs Outcome (líneas) y Profit Margin % (línea + reference line). | ✅ | `frontend/src/components/dashboard/income-outcome-chart.tsx`, `frontend/src/components/dashboard/profit-percent-chart.tsx` — usan recharts `LineChart` |
| Se puede iniciar con `docker compose up --build`; puertos 5173 (frontend) y 8000 (backend). | ✅ | `docker-compose.yml` — frontend build `./frontend/Dockerfile`, backend build `./backend/Dockerfile` |
| La documentación interactiva está disponible en `/docs` del backend. | ✅ | FastAPI genera `/docs` automáticamente; README indica `http://localhost:8000/docs`. |
| Backend expone puerto 5678 para debug remoto (debugpy). | ✅ | `backend/Dockerfile` CMD: `python -m debugpy --listen 0.0.0.0:5678` + `docker-compose.yml` ports `5678:5678` |
| CORS abierto (`allow_origins=["*"]`). | ✅ | `backend/app/main.py` — middleware CORSMiddleware con `allow_origins=["*"]` |
| `API_BASE_URL` configurable por env `VITE_API_BASE_URL`; por defecto vacío (mismo origen). | ✅ | `frontend/src/App.tsx` línea 11: `import.meta.env.VITE_API_BASE_URL ?? ""` |
| `mock-data.ts` existe en frontend pero NO se usa en el flujo principal de `App.tsx`. | ✅ | `frontend/src/lib/mock-data.ts` contiene datos estáticos; no es importado en `App.tsx` |
| Tests: pytest (backend, 14 tests) + vitest (frontend, 5 tests). | ✅ | `backend/tests/test_routes.py` (14 tests endpoint), `frontend/src/lib/financial-utils.test.ts` (5 tests unitarios) |
| Python 3.13 + Node 24 oficial. | ✅ | `backend/Dockerfile`: `python:3.13-slim` · `frontend/Dockerfile`: `node:24-alpine` |
| Tailwind CSS v4 con variables CSS Oklch. | ✅ | `frontend/package.json`: `"tailwindcss": "^4.2.2"` · `frontend/src/index.css` usa `oklch()` y `@import "tailwindcss"` |

## Resumen corregido

El proyecto es un **dashboard financiero** con frontend **React 19 + TypeScript 6 + Vite 8 + Tailwind v4** y backend **Python 3.13 + FastAPI + Uvicorn**. El frontend, servido por Vite, obtiene los movimientos desde `GET /api/metrics` mediante el proxy `/api` hacia el backend (`http://backend:8000`); después computa en el navegador 4 KPIs (`computeKPIs()`) y la agregación mensual (`computeMonthlyData()`) que presentan los componentes del dashboard. El backend genera 360 movimientos simulados de forma determinista (`random.seed(42)`) para **9 endpoints REST** que soportan filtros por fecha, categoría, tipo de operación, tipo de negocio y agrupación. **No usa base de datos** — todo se genera en memoria. Los gráficos se renderizan con **recharts** (líneas) y las tarjetas con componentes **shadcn/ui** + **lucide-react** para iconos.

### Puertos

| Servicio | URL | Puerto |
|----------|-----|--------|
| Frontend | http://localhost:5173 | 5173 |
| Backend API | http://localhost:8000 | 8000 |
| Debug remoto (debugpy) | — | 5678 |
| Documentación API | http://localhost:8000/docs | — |

### Cómo ejecutar

```bash
docker compose up --build
```
