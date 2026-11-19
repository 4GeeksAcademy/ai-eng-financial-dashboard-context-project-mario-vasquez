# Especificación de Tipos — `financial-types.ts`

> **Fuente**: `frontend/src/lib/financial-types.ts`

## Enums / Literal Types

```typescript
type OperationType = 'income' | 'outcome'
type Category = 'suppliers' | 'sales' | 'operational' | 'administrative' | 'others'
type BusinessType = 'B2B' | 'B2C'
```

- **OperationType**: Define si un movimiento es ingreso (`income`) o egreso (`outcome`).
- **Category**: Categorías de movimiento: proveedores, ventas, operacional, administrativo, otros.
- **BusinessType**: Tipo de negocio: B2B (business-to-business) o B2C (business-to-consumer).

## Interfaces

### FinancialMovement

Representa un movimiento financiero individual devuelto por la API.

```typescript
interface FinancialMovement {
  create_date: string  // ISO date (formato "YYYY-MM-DD")
  amount: number
  operation_type: OperationType
  category: Category
  business_type: BusinessType
}
```

**Uso**: Recibido desde `GET /api/metrics`. Se procesa con `computeKPIs()` y `computeMonthlyData()`.

### KPIMetrics

Métricas agregadas del dashboard (KPIs principales).

```typescript
interface KPIMetrics {
  totalIncome: number
  totalOutcome: number
  profit: number
  profitPercent: number
}
```

**Cálculos** (ver `utils-spec.md`):
- `totalIncome` = suma de todos los `amount` donde `operation_type === "income"`
- `totalOutcome` = suma de todos los `amount` donde `operation_type === "outcome"`
- `profit = totalIncome - totalOutcome`
- `profitPercent = totalIncome > 0 ? (profit / totalIncome) * 100 : 0`

### MonthlyDataPoint

Agregación mensual para los gráficos.

```typescript
interface MonthlyDataPoint {
  month: string  // Etiqueta localizada, ej. "Jan 2024"
  income: number
  outcome: number
  profitPercent: number
}
```

**Cálculos** (ver `utils-spec.md`):
- `month`: etiqueta formateada desde la clave year-month (ej. "2024-01" → "Jan 2024")
- `income`: suma de ingresos del mes
- `outcome`: suma de egresos del mes
- `profitPercent = income > 0 ? ((income - outcome) / income) * 100 : 0`

## Referencias en el código

| Tipo | Declarado en | Usado en |
|---|---|---|
| `FinancialMovement` | `financial-types.ts:15-21` | `App.tsx` (fetch), `financial-utils.ts` (cálculos) |
| `KPIMetrics` | `financial-types.ts:23-28` | `kpi-row.tsx` (props), `financial-utils.ts` (retorno) |
| `MonthlyDataPoint` | `financial-types.ts:30-35` | `income-outcome-chart.tsx`, `profit-percent-chart.tsx` (props), `financial-utils.ts` (retorno) |
| `OperationType` | `financial-types.ts:1` | `App.tsx` no lo usa directamente; lo usa `financial-utils.ts` en filtros |
| `Category` | `financial-types.ts:2` | Solo definido como tipo, no usado en cálculos del frontend |
| `BusinessType` | `financial-types.ts:3` | Solo definido como tipo, no usado en cálculos del frontend |
