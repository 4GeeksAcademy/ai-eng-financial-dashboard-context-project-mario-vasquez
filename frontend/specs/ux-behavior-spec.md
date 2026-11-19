# Especificación de Comportamientos UX

> **Fuente**: `frontend/src/App.tsx` y `frontend/src/components/dashboard/*.tsx`

## Comportamiento al cargar la página

1. El componente `App` se monta.
2. `useEffect` ejecuta `fetchFinancialData()` que llama a `GET /api/metrics`.
3. Durante la carga, `loading=true`:
   - El `DashboardHeader` muestra el badge con texto "Loading…".
   - `KPIRow` recibe `loading=true` y `metrics=null`, mostrando 4 `KPICard` en modo skeleton.
   - `IncomeOutcomeChart` y `ProfitPercentChart` reciben `loading=true` y muestran skeletons.
4. Al completarse el fetch:
   - Si es exitoso: se calculan KPIs y datos mensuales, se actualiza el período, se desactiva loading.
   - Si falla: se muestra mensaje de error, se desactiva loading, KPIs y charts quedan sin datos.

**Evidencia**: `frontend/src/App.tsx:24-48`

## Cálculo del período

`computePeriodLabel(movements: FinancialMovement[]): string`

- Toma la fecha mínima y máxima de todos los movimientos.
- Si ambas pertenecen al mismo año, retorna `"2024 - Full Year"` (ejemplo).
- Si son años diferentes, retorna `"2024 - 2025"` (ejemplo).

**Evidencia**: `frontend/src/App.tsx:20-28`

## Tooltips en gráficos

### IncomeOutcomeChart — CustomTooltip

- Aparece al hacer hover sobre un punto del gráfico.
- Muestra:
  - Label del mes (negrita)
  - Para cada línea: bullet de color, nombre, valor formateado como moneda (`formatCurrency`)
- Estilo: `rounded-lg`, borde, sombra, fondo `card`.

**Evidencia**: `frontend/src/components/dashboard/income-outcome-chart.tsx:24-37`

### ProfitPercentChart — CustomTooltip

- Aparece al hacer hover sobre un punto del gráfico.
- Muestra:
  - Label del mes (negrita)
  - Bullet de color (`var(--chart-profit)`), "Profit margin:", valor como porcentaje con 1 decimal
- Estilo: mismo que IncomeOutcomeChart.

**Evidencia**: `frontend/src/components/dashboard/profit-percent-chart.tsx:24-37`

## Interacciones

### Hover en gráficos

- Los `LineChart` de recharts muestran tooltip al hacer hover sobre los puntos de datos.
- No hay interacciones de click, drag, zoom, ni animaciones personalizadas.

### Layout responsive

- **KPIRow**: Grid `grid-cols-1 sm:grid-cols-2 xl:grid-cols-4` — 1 columna en mobile, 2 en tablet, 4 en desktop.
- **Charts**: Grid `grid-cols-1 xl:grid-cols-2` — 1 columna en mobile, 2 en desktop.
- **DashboardHeader**: Flexbox `flex-col sm:flex-row` — apilado en mobile, fila en desktop.
- **Contenedor principal**: `max-w-7xl` con padding responsive.

**Evidencia**: Clases CSS en cada componente del dashboard.

## Dark mode

- El `<main>` tiene clase `dark`, lo que activa el tema oscuro de Tailwind.
- Los colores se definen con variables CSS Oklch en `frontend/src/index.css`.

**Evidencia**: `frontend/src/App.tsx:46`, `frontend/src/index.css`

## Fetch único

- La petición a la API se realiza **una sola vez** al montar el componente (`useEffect` con dependencias vacías `[]`).
- No hay refetch automático, polling, ni WebSockets.
- No hay botón de recarga manual en la UI.

**Evidencia**: `frontend/src/App.tsx:30-43`

## Patrón de fetch contrastado con el código

El frontend actual tiene un **solo punto de entrada de datos** (`App.tsx`). El patrón completo es:

```
componentDidMount (useEffect [])
  │
  ├─ setLoading(true)
  │
  ├─ fetchFinancialData()
  │     │
  │     ├─ response = await fetch(API_BASE_URL + "/api/metrics")
  │     ├─ if (!response.ok) → throw Error(status)
  │     └─ return response.json()  → FinancialMovement[]
  │
  ├─ .then(movements → computeKPIs + computeMonthlyData + computePeriodLabel)
  ├─ .catch(error → setError mensaje hardcodeado)
  └─ .finally(setLoading(false))
```

Este patrón se repite en el código tal cual, sin abstracciones intermedias. Si se agregaran
nuevos endpoints de análisis (`categories/top`, `comparison`, `alerts`), el patrón esperado
sería replicar esta misma estructura por cada nuevo fetch, potencialmente con un helper
genérico `apiFetch<T>(path: string): Promise<T>`.

**Evidencia**: `frontend/src/App.tsx:11-48`
