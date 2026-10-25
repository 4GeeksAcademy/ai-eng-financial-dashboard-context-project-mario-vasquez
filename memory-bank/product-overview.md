# Product Overview

> **Disclaimer**: Este documento solo describe hechos verificables en el código fuente del repositorio. No se incluyen roadmaps, promesas de producto, ni afirmaciones sin respaldo en `verification.md`, tests, o configuraciones.

## ¿Qué es?

Un **dashboard financiero** que presenta KPIs y gráficos mensuales calculados a partir de datos simulados. No consume datos reales ni está conectado a fuentes externas de información financiera.

**Evidencia**: `frontend/src/App.tsx`, `frontend/src/components/dashboard/`

## Funcionalidad verificada

| Funcionalidad | Cómo se verifica | Archivo(s) |
|---|---|---|
| 4 KPIs: Total Income, Total Outcome, Profit, Profit Margin % | Componente `KPIRow` renderiza `KpiCard` con valores de `KPIMetrics` | `frontend/src/lib/financial-types.ts`, `frontend/src/components/dashboard/kpi-row.tsx`, `kpi-card.tsx` |
| 2 gráficos: Income vs Outcome (líneas), Profit Margin % (línea + reference line) | `IncomeOutcomeChart` y `ProfitPercentChart` usan recharts `LineChart` con `ReferenceLine` | `frontend/src/components/dashboard/income-outcome-chart.tsx`, `profit-percent-chart.tsx` |
| 9 endpoints REST (2 deprecados) | Router de FastAPI con 9 rutas; b2b/b2c con `deprecated=True` | `backend/app/routes.py`, `backend/app/main.py` |
| Filtros por fecha, categoría, tipo de operación, tipo de negocio | Parámetros `Query` en endpoints; `filter_movements_by_date()` existente | `backend/app/routes.py` |
| Datos mock deterministas (360 movimientos, semilla 42) | `random.Random(42)` + `@lru_cache`; test verifica 360 movimientos ordenados | `backend/app/routes.py`, `backend/tests/test_routes.py::test_generate_mock_movements_returns_full_year_sorted_data` |

**No incluye** (evidencia de ausencia en el código):
- Autenticación / autorización
- Base de datos (cero imports ORM/DB)
- Datos financieros reales
- WebSockets
- Paginación
- Rate limiting

## Arquitectura

```
Navegador (React 19)
    │  GET /api/metrics  (Vite proxy /api → backend:8000)
    ▼
FastAPI (Python 3.13)
    │  generate_mock_movements(seed=42) → _cached_movements()
    ▼
En memoria (dict / list)
    └── 360 FinancialMovement objects (sin persistencia)
```

**Evidencia**: `docker-compose.yml`, `frontend/vite.config.ts`, `backend/app/routes.py`, `frontend/src/App.tsx`

## UX states verificados

Cada sección del dashboard maneja tres estados (evidencia en componentes):

| Componente | Loading | Error | Empty / Data |
|---|---|---|---|
| `App.tsx` | `loading` state → `KPIRow loading` + `Skeleton` | `error` state → `div` con clase `destructive` | Datos renderizados en KPIs y gráficos |
| `kpi-card.tsx` | `Skeleton` cuando `isLoading` | N/A | `Card` con valor formateado |
| `income-outcome-chart.tsx` | `Skeleton` cuando `isLoading` | N/A | `ResponsiveContainer` con `LineChart` |
| `profit-percent-chart.tsx` | `Skeleton` cuando `isLoading` | N/A | `ResponsiveContainer` con `LineChart` |

**Evidencia**: `frontend/src/App.tsx` líneas 35-49 (estados loading/error), `frontend/src/components/dashboard/*.tsx`

## Despliegue

- **Contenedorizado**: Docker Compose con dos servicios (`backend` + `frontend`)
- **Puertos**: 5173 (frontend), 8000 (backend API), 5678 (debug remoto)
- **Documentación API**: http://localhost:8000/docs (Swagger UI, generado por FastAPI)
- **CI/CD**: GitHub Actions en push/PR a `main` — ejecuta pytest + vitest + eslint
- **Dockerignore**: Archivos de caché, node_modules, .git excluidos (backend y frontend)

**Evidencia**: `docker-compose.yml`, `backend/Dockerfile`, `frontend/Dockerfile`, `.github/workflows/test.yml`, `backend/.dockerignore`, `frontend/.dockerignore`