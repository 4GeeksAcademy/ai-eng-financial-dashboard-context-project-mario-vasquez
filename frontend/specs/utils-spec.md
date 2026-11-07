# Especificación de Utilidades — `financial-utils.ts`

> **Fuente**: `frontend/src/lib/financial-utils.ts`

## Funciones

### `computeKPIs(movements: FinancialMovement[]): KPIMetrics`

Calcula los 4 KPIs principales a partir de la lista de movimientos.

```typescript
function computeKPIs(movements: FinancialMovement[]): KPIMetrics
```

**Lógica**:
1. `totalIncome` = sumar `amount` de todos los movimientos con `operation_type === "income"`
2. `totalOutcome` = sumar `amount` de todos los movimientos con `operation_type === "outcome"`
3. `profit = totalIncome - totalOutcome`
4. `profitPercent = totalIncome > 0 ? (profit / totalIncome) * 100 : 0`

**Casos borde**:
- Si no hay ingresos (`totalIncome === 0`), `profitPercent = 0` (evita división por cero)
- Si no hay movimientos, todos los valores son 0

### `computeMonthlyData(movements: FinancialMovement[]): MonthlyDataPoint[]`

Agrupa los movimientos por mes y calcula agregados.

```typescript
function computeMonthlyData(movements: FinancialMovement[]): MonthlyDataPoint[]
```

**Lógica**:
1. Itera sobre todos los movimientos
2. Agrupa por clave `YYYY-MM` (ej. `"2024-01"`)
3. Para cada grupo, suma `income` y `outcome`
4. Calcula `profitPercent = income > 0 ? ((income - outcome) / income) * 100 : 0`
5. Ordena cronológicamente por clave year-month
6. Convierte clave a etiqueta legible (ej. `"2024-01"` → `"Jan 2024"`)

**Función auxiliar `toYearMonthKey(value: Date): string`**:
- Formatea una fecha como `"YYYY-MM"`

**Función auxiliar `formatMonthYearLabel(yearMonthKey: string): string`**:
- Convierte clave `"YYYY-MM"` a formato `"Mon YYYY"` usando `toLocaleDateString("en-US", { month: "short", year: "numeric" })`

**Casos borde**:
- Movimientos desordenados: se ordenan por clave year-month
- Movimientos entre años: se manejan correctamente (ej. Dic 2025 y Ene 2026)
- Mes sin ingresos: `profitPercent = 0`

### `formatCurrency(value: number): string`

Formatea un número como moneda USD.

```typescript
function formatCurrency(value: number): string
```

- Usa `Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0, maximumFractionDigits: 0 })`
- Sin decimales (redondeo a entero)

### `formatPercent(value: number): string`

Formatea un número como porcentaje con 1 decimal.

```typescript
function formatPercent(value: number): string
```

- Retorna `${value.toFixed(1)}%`

## Pruebas

Las funciones se prueban con **Vitest** en `frontend/src/lib/financial-utils.test.ts` (5 tests):

| Test | Función probada | Lo que verifica |
|---|---|---|
| `calculates totals and profit values` | `computeKPIs` | Cálculos correctos con 3 movimientos de muestra |
| `returns 0 profitPercent when there is no income` | `computeKPIs` | Caso borde sin ingresos |
| `returns chronological year-month points with aggregated totals` | `computeMonthlyData` | Agregación correcta con movimientos entre años y desordenados |
| `formats currency values` | `formatCurrency` | Formato `$1,000`, `$0`, `$1,234,567` |
| `formats percentage values` | `formatPercent` | Formato `"75.0%"`, `"0.0%"`, `"100.0%"` |

## Contraste: lógica frontend vs endpoint backend

`computeMonthlyData()` replica en el frontend lo que el backend ya ofrece en `GET /api/metrics/summary?group_by=month`.

| Aspecto | `computeMonthlyData()` (frontend) | `GET /api/metrics/summary` (backend) |
|---|---|---|
| **Datos fuente** | 360 movimientos sin agregar | Idem (mismos movimientos) |
| **Agrupación** | Por mes (solo `YYYY-MM`) | Por día, semana o mes (parámetro `group_by`) |
| **Cálculo** | Suma income/outcome, profitPercent | Suma income/outcome, net |
| **Formato de período** | "Jan 2024" (legible) | "2024-01" (ISO) |
| **Filtros** | No (se filtra antes de llamar) | Sí: fechas, categoría, tipo, business_type |
| **Ubicación** | En el navegador | En el servidor |

El resto de utilidades (`formatCurrency`, `formatPercent`) son puramente de presentación
y no tienen equivalente en el backend.

## ⚠️ Desajuste PM vs realidad: `computeMonthlyData` vs `GET /api/metrics/summary`

| Fuente | Afirmación | Realidad |
|---|---|---|
| `product-overview.md` | "El frontend computa en el navegador 4 KPIs y la agregación mensual" | ✅ Cierto — `computeMonthlyData()` en `frontend/src/lib/financial-utils.ts` |
| `backend/app/routes.py` | El backend ofrece `GET /api/metrics/summary` con `group_by=day\|week\|month` | `summarize_movements()` existe desde el inicio |
| Implicación | Duplicación de lógica | `computeMonthlyData(360 movements)` procesa en cliente lo mismo que `GET /api/metrics/summary?group_by=month` devuelve ya agregado |

**Decisión en la spec**: Actualmente `computeMonthlyData()` es necesaria porque el frontend solo llama a `GET /api/metrics` (movimientos crudos). Si en el futuro el frontend migrara a usar `GET /api/metrics/summary` directamente, `computeMonthlyData()` se eliminaría y `MonthlyDataPoint` se reemplazaría por el equivalente de `MetricsSummaryItem`. Pero la función `computeKPIs()` seguiría siendo necesaria porque el backend no tiene un endpoint que devuelva KPIMetrics directamente.

## Referencias en el código

| Función | Declarada en | Llamada desde |
|---|---|---|
| `computeKPIs` | `financial-utils.ts:35-47` | `App.tsx:34` |
| `computeMonthlyData` | `financial-utils.ts:49-76` | `App.tsx:35` |
| `formatCurrency` | `financial-utils.ts:78-84` | `kpi-card.tsx`, `income-outcome-chart.tsx` (tooltip) |
| `formatPercent` | `financial-utils.ts:86-88` | `kpi-row.tsx` |
