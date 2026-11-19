# Especificación de Estados UX

> **Fuente**: `frontend/src/App.tsx` y `frontend/src/components/dashboard/*.tsx`

Cada sección del dashboard maneja estados específicos de loading, error, empty y data.

## Matriz de estados por componente

| Componente | Loading | Error | Empty | Data |
|---|---|---|---|---|
| `App.tsx` | ✅ `loading=true` → KPIs y gráficos en estado loading | ✅ `error ≠ null` → mensaje destructive | N/A (API siempre devuelve data mock) | ✅ Renderiza todo |
| `DashboardHeader` | ❌ No aplica | ❌ No aplica | ❌ No aplica | ✅ Badge con período |
| `KPIRow` | ✅ `loading=true` → 4 `KPICard` en loading | ❌ No maneja error propio | N/A (recibe metrics/null) | ✅ Tarjetas con valores |
| `KPICard` | ✅ `loading=true` → 4 `Skeleton` | ❌ No maneja error propio | N/A | ✅ Label, valor, icono, helper |
| `IncomeOutcomeChart` | ✅ `loading=true` → `Skeleton` 280px | ❌ No maneja error propio | ✅ "No data available" si `income=0` y `outcome=0` | ✅ `LineChart` |
| `ProfitPercentChart` | ✅ `loading=true` → `Skeleton` 280px | ❌ No maneja error propio | ✅ "No data available" si todos `profitPercent=0` | ✅ `LineChart` |

## Descripción de estados

### Loading

- **App.tsx**: Al iniciar, `loading=true`. KPIs y gráficos reciben `loading=true` y muestran skeletons.
- **KPICard**: 4 barras `Skeleton` (label, icon, value, helper).
- **IncomeOutcomeChart**: `Skeleton` de 280px de alto para el gráfico + skeletons para header.
- **ProfitPercentChart**: Igual que IncomeOutcomeChart.

**Evidencia**: `frontend/src/App.tsx:30-43`, `frontend/src/components/dashboard/kpi-card.tsx:32-44`, `frontend/src/components/dashboard/income-outcome-chart.tsx:61-72`, `frontend/src/components/dashboard/profit-percent-chart.tsx:60-71`

### Error

- **App.tsx**: Si el fetch falla, se muestra un `div` con clases `destructive` y el mensaje: "No se pudo cargar la informacion financiera. Revisa la API de backend."
- Los KPIs y gráficos permanecen en estado vacío (no se renderizan en error, solo el mensaje).

**Evidencia**: `frontend/src/App.tsx:38-48`

### Empty

- **IncomeOutcomeChart**: Verifica `data.some(d => d.income > 0 || d.outcome > 0)`. Si es `false`, muestra "No data available to display".
- **ProfitPercentChart**: Verifica `data.some(d => d.profitPercent !== 0)`. Si es `false`, muestra "No data available to display".

**Evidencia**: `frontend/src/components/dashboard/income-outcome-chart.tsx:78-82`, `frontend/src/components/dashboard/profit-percent-chart.tsx:77-81`

### Data

- **KPIRow**: Muestra 4 tarjetas con valores formateados usando `formatCurrency()` y `formatPercent()`.
- **IncomeOutcomeChart**: `ResponsiveContainer` con `LineChart`, dos líneas (`income` verde, `outcome` rojo).
- **ProfitPercentChart**: `ResponsiveContainer` con `LineChart`, una línea + `ReferenceLine` en y=0.
- **DashboardHeader**: Badge con el período calculado desde los datos.

**Evidencia**: Todos los componentes en `frontend/src/components/dashboard/`

## Diagrama de flujo de estados

```
App monta
  │
  ├─→ loading=true
  │     ├─→ KPIRow (skeletons)
  │     └─→ Charts (skeletons)
  │
  ├─→ fetch /api/metrics
  │     │
  │     ├─→ OK → computeKPIs + computeMonthlyData
  │     │       ├─→ KPIRow (data)
  │     │       ├─→ IncomeOutcomeChart (data / empty)
  │     │       └─→ ProfitPercentChart (data / empty)
  │     │
  │     └─→ Error → setError(mensaje)
  │             └─→ Mensaje destructive visible
  │
  └─→ finally: loading=false
```

**Nota**: Los estados de empty son teóricos (la API mock siempre devuelve datos con valores positivos), pero el código los maneja correctamente.
