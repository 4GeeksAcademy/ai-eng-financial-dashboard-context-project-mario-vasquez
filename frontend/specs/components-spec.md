# Especificación de Componentes

> **Fuente**: `frontend/src/App.tsx` y `frontend/src/components/dashboard/*.tsx`

## Jerarquía de componentes

```
App
├── DashboardHeader
├── ErrorMessage (div inline, condicional)
├── KPIRow
│   ├── KPICard (×4: Total Income, Total Outcome, Profit, Profit Margin)
├── IncomeOutcomeChart
└── ProfitPercentChart
```

## App.tsx

Componente principal del dashboard.

- **Props**: Ninguna (usa `useState` y `useEffect`)
- **Fetch**: `GET /api/metrics` al montar el componente
- **Estados**: `loading`, `error`, `data` — controlados con `useState`
- **Renderizado condicional**: mensaje de error si `error ≠ null`, loading en KPIs y gráficos si `loading === true`
- **Layout**: `max-w-7xl`, padding responsive, dark mode

**Evidencia**: `frontend/src/App.tsx`

## DashboardHeader

- **Props**: `period?: string` (default `"2024 — Full Year"`)
- **Renderiza**: Icono `LayoutDashboard`, título "Financial Overview", subtítulo "Executive metrics dashboard", badge con el período
- **Layout**: Flexbox responsive (columnas en mobile, fila en desktop)

**Evidencia**: `frontend/src/components/dashboard/dashboard-header.tsx`

## KPIRow

- **Props**: `metrics: KPIMetrics | null`, `loading?: boolean`
- **Renderiza**: Grid de 4 `KPICard` en 1 columna (sm: 2, xl: 4)
- **Cada KPICard recibe**: label, valor formateado, helperText, icono, variant

**Evidencia**: `frontend/src/components/dashboard/kpi-row.tsx`

## KPICard

- **Props**: `label`, `value`, `helperText`, `icon: LucideIcon`, `variant`, `loading?`
- **Variant styles**: `Record<'income' | 'outcome' | 'profit' | 'profitPercent', { badge, icon }>`
- **Estados**:
  - **Loading**: Muestra 4 `Skeleton` (label, icon, value, helperText)
  - **Data**: Muestra label, icono con badge, valor numérico, helperText
- **Iconos**: `TrendingUp` (income), `TrendingDown` (outcome), `DollarSign` (profit), `BarChart2` (profitPercent)
- **Formateo**: `formatCurrency()` para valores monetarios, `formatPercent()` para porcentajes

**Evidencia**: `frontend/src/components/dashboard/kpi-card.tsx`

## IncomeOutcomeChart

- **Props**: `data: MonthlyDataPoint[]`, `loading?: boolean`
- **Gráfico**: `LineChart` de recharts con dos líneas (`income` y `outcome`)
- **Tooltip personalizado**: Muestra label del mes y valores formateados con `formatCurrency()`
- **Estados**:
  - **Loading**: `Skeleton` para header y área del gráfico
  - **Empty**: Mensaje "No data available to display" si todos los valores son 0
  - **Data**: `ResponsiveContainer` con `LineChart`, `CartesianGrid`, `XAxis`, `YAxis`, `Tooltip`, `Legend`
- **Eje Y**: Formateado como `$###k`

**Evidencia**: `frontend/src/components/dashboard/income-outcome-chart.tsx`

## ProfitPercentChart

- **Props**: `data: MonthlyDataPoint[]`, `loading?: boolean`
- **Gráfico**: `LineChart` de recharts con una línea (`profitPercent`) y `ReferenceLine` en y=0
- **Tooltip personalizado**: Muestra label del mes y valor en porcentaje con 1 decimal
- **Estados**:
  - **Loading**: `Skeleton` para header y área del gráfico
  - **Empty**: Mensaje "No data available to display" si todos los `profitPercent` son 0
  - **Data**: `ResponsiveContainer` con `LineChart`, `CartesianGrid`, `XAxis`, `YAxis`, `Tooltip`, `ReferenceLine`
- **Eje Y**: Formateado como `###%`
- **ReferenceLine**: `y=0`, stroke dasharray `"4 4"`

**Evidencia**: `frontend/src/components/dashboard/profit-percent-chart.tsx`

## Componentes UI (shadcn/ui)

| Componente | Archivo | Propósito |
|---|---|---|
| `Card` | `frontend/src/components/ui/card.tsx` | Contenedor con borde, padding, variantes de header/content/footer |
| `Skeleton` | `frontend/src/components/ui/skeleton.tsx` | Placeholder animado para estados de carga |

## Mapa de componentes actuales a funcionalidades del backend

| Funcionalidad del backend | Endpoints | Componente actual |
|---|---|---|
| Obtención de datos | `GET /api/metrics` | `App.tsx` (fetch + computeKPIs + computeMonthlyData) |
| Facetas disponibles | `GET /api/metrics/facets` | ❌ No implementado |
| Resumen agrupado | `GET /api/metrics/summary` | Parcial: `computeMonthlyData()` replica lógica en frontend |
| Top categorías | `GET /api/metrics/categories/top` | ❌ No implementado |
| Comparación períodos | `GET /api/metrics/comparison` | ❌ No implementado |
| Alertas de gasto | `GET /api/metrics/alerts` | ❌ No implementado |

Actualmente el frontend solo consume `GET /api/metrics` y replica la lógica de agregación en el navegador.
Los endpoints de análisis (top categorías, comparación, alertas) no tienen componentes asociados.

## Patrón de fetch actual vs lo que necesitarían nuevos componentes

| Aspecto | Fetch actual (`GET /api/metrics`) | Fetch para nuevos endpoints |
|---|---|---|
| **HTTP** | `fetch` nativo | Mismo `fetch` nativo (sin librerías externas) |
| **URL** | `const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? ""` | Reutilizar misma constante |
| **Proxy** | Vite proxy `/api` → `backend:8000` | No necesita cambios (mismo `/api/*`) |
| **Errores** | `if (!response.ok) throw new Error(...)` | Mismo patrón |
| **Loading** | `useState(true)` + `.finally(() => setLoading(false))` | Mismo patrón |
| **Fetch único** | `useEffect([], [])` — al montar | Cada nuevo componente con `useEffect([])` independiente |
| **Procesamiento** | `.then(movements => computeKPIs(movements))` | Response directo (los endpoints ya devuelven datos agregados) |
| **Sin librerías** | No hay axios, TanStack Query, SWR, ky, RTK Query | No deben agregarse para mantener consistencia |

**Implicación**: Si se crean componentes para `categories/top`, `comparison` y `alerts`,
cada uno podría:
- Tener su propio `useEffect` con fetch al endpoint correspondiente
- Seguir el mismo patrón de estados: `useState<T | null>`, `useState(true)`, `useState(null)`
- No requiere refactor de `App.tsx` ni agregar dependencias externas

## Alias de imports

- `@/` → `frontend/src/` (configurado en `vite.config.ts` y `tsconfig.app.json`)

**Evidencia**: `frontend/vite.config.ts`

## ⚠️ Desajuste con el PM: Diagrama de arquitectura subestima la API

| Fuente | Afirmación | Realidad |
|---|---|---|
| `product-overview.md` | Diagrama: solo `GET /api/metrics` | El backend expone **9 endpoints** (incluyendo facets, summary, categories/top, comparison, alerts, health, b2b, b2c) |
| Diagrama del PM | `Navegador → GET /api/metrics → FastAPI → En memoria` | Solo representa el flujo del fetch actual del frontend, no la API completa |
| Realidad | `backend/app/routes.py` | 9 endpoints con 6 schemas Pydantic distintos |

**Decisión en la spec**: El diagrama del PM es correcto para el **flujo actual** del frontend (único fetch a `/api/metrics`), pero no describe la superficie completa de la API. Si se agregan componentes de análisis (categorías, comparación, alertas), el diagrama se debe expandir para incluir esos flujos adicionales.
