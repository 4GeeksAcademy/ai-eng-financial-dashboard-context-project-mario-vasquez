# Especificación de Schemas Compartidos — Modelos Pydantic de la API

> **Fuente**: `backend/app/routes.py` (modelos Pydantic)
>
> **Verificado contra**: `http://localhost:8000/openapi.json` (OpenAPI 3.0) y respuestas reales

Estos son los modelos que definen la interfaz de datos entre backend y frontend.
El frontend debe mantener tipos TypeScript compatibles con estos schemas.

## FinancialMovement

Movimiento financiero individual. Es el schema base de toda la API.

```python
class FinancialMovement(BaseModel):
    create_date: date      # Formato ISO "YYYY-MM-DD"
    amount: float          # Valor positivo, 2 decimales aprox
    operation_type: Literal["income", "outcome"]
    category: Literal["suppliers", "sales", "operational", "administrative", "others"]
    business_type: Literal["B2B", "B2C"]
```

**Uso en frontend**: `frontend/src/lib/financial-types.ts` tiene el tipo `FinancialMovement` que debe coincidir. La única diferencia es que en TypeScript `create_date` es `string` (ISO date).

**Correspondencia frontend**:

| Campo Pydantic | Tipo API | Tipo TypeScript |
|---|---|---|
| `create_date` | `date` (ISO) | `string` |
| `amount` | `float` | `number` |
| `operation_type` | `"income"` \| `"outcome"` | `'income' \| 'outcome'` |
| `category` | `"suppliers"` \| `"sales"` \| `"operational"` \| `"administrative"` \| `"others"` | `'suppliers' \| 'sales' \| 'operational' \| 'administrative' \| 'others'` |
| `business_type` | `"B2B"` \| `"B2C"` | `'B2B' \| 'B2C'` |

## MetricsFacets

Facetas disponibles para filtros en el dashboard.

```python
class MetricsFacets(BaseModel):
    operation_types: list[Literal["income", "outcome"]]
    business_types: list[Literal["B2B", "B2C"]]
    categories: list[Literal["suppliers", "sales", "operational", "administrative", "others"]]
    min_date: date   # Fecha del movimiento más antiguo
    max_date: date   # Fecha del movimiento más reciente
```

**No existe tipo TypeScript equivalente** en `financial-types.ts` actualmente.

## MetricsSummaryItem

Resumen agregado de un período (día, semana o mes).

```python
class MetricsSummaryItem(BaseModel):
    period: str    # "YYYY-MM" para mes, "YYYY-WW" para semana, "YYYY-MM-DD" para día
    income: float  # Total de ingresos en el período, redondeado a 2 decimales
    outcome: float # Total de egresos en el período, redondeado a 2 decimales
    net: float     # income - outcome, redondeado a 2 decimales
```

**No existe tipo TypeScript equivalente** en `financial-types.ts` actualmente.
El frontend tiene `MonthlyDataPoint` que es similar pero con datos calculados en el navegador.

## TopCategoryItem

Categoría con su total acumulado para un tipo de operación.

```python
class TopCategoryItem(BaseModel):
    category: Literal["suppliers", "sales", "operational", "administrative", "others"]
    operation_type: Literal["income", "outcome"]
    total_amount: float  # Suma total de montos, redondeado a 2 decimales
```

**No existe tipo TypeScript equivalente** en `financial-types.ts` actualmente.

## MetricsComparison

Resultado de comparación entre dos períodos.

```python
class MetricsComparison(BaseModel):
    current_period: float   # Neto (income - outcome) del período actual
    previous_period: float  # Neto del período anterior (misma duración)
    delta_abs: float        # Diferencia absoluta: current - previous
    delta_pct: float | None # Diferencia porcentual. None si previous_period == 0
```

**No existe tipo TypeScript equivalente** en `financial-types.ts` actualmente.

## MetricsAlert

Alerta generada cuando un período excede el umbral de gasto sobre el promedio histórico.

```python
class MetricsAlert(BaseModel):
    period: str               # Identificador del período (ej. "2026-03")
    outcome_total: float      # Total de egresos en el período
    baseline_average: float   # Promedio de egresos de períodos anteriores
    increase_ratio: float     # (outcome_total - baseline_average) / baseline_average
```

**No existe tipo TypeScript equivalente** en `financial-types.ts` actualmente.

## ⚠️ Desajuste de terminología: Frontend "Profit" vs Backend "Net"

### KPIMetrics (frontend, computado en navegador)

```typescript
interface KPIMetrics {
  totalIncome: number     // Suma de amount donde operation_type === "income"
  totalOutcome: number    // Suma de amount donde operation_type === "outcome"
  profit: number          // totalIncome - totalOutcome  ← backend llama a esto "net"
  profitPercent: number   // (profit / totalIncome) * 100
}
```

### MetricsSummaryItem (backend, endpoint /api/metrics/summary)

```python
class MetricsSummaryItem(BaseModel):
    period: str
    income: float
    outcome: float
    net: float     # ← El backend llama "net" a lo que el frontend llama "profit"
```

| Fuente | Término usado | Contexto |
|---|---|---|
| `product-overview.md` | "Profit Margin %" | Tabla de funcionalidades, 4 KPIs |
| `frontend/src/lib/financial-types.ts` | `profit`, `profitPercent` | Tipo `KPIMetrics` |
| `backend/app/routes.py` (MetricsSummaryItem) | `net` | Schema Pydantic del backend |
| `frontend/src/lib/financial-utils.ts` | `profit` (variable local) | `computeKPIs()` y `computeMonthlyData()` ambos usan `profit` |

**Decisión en la spec**: El frontend y el PM usan "profit" para el mismo concepto que el backend llama "net". Esto no es un bug sino una diferencia de nomenclatura entre capas. Si en el futuro se consume `GET /api/metrics/summary` desde el frontend, el campo `net` del backend se mapea a `profit` en TypeScript.

## Mapa de schemas a endpoints

| Schema | Endpoint(s) |
|---|---|
| `FinancialMovement` | `GET /api/metrics`, `GET /api/metrics/b2b` (deprecated), `GET /api/metrics/b2c` (deprecated) |
| `MetricsFacets` | `GET /api/metrics/facets` |
| `MetricsSummaryItem` | `GET /api/metrics/summary` |
| `TopCategoryItem` | `GET /api/metrics/categories/top` |
| `MetricsComparison` | `GET /api/metrics/comparison` |
| `MetricsAlert` | `GET /api/metrics/alerts` |

## Referencias

| Schema | Archivo | Líneas |
|---|---|---|
| `FinancialMovement` | `backend/app/routes.py` | `class FinancialMovement(BaseModel)` |
| `MetricsFacets` | `backend/app/routes.py` | `class MetricsFacets(BaseModel)` |
| `MetricsSummaryItem` | `backend/app/routes.py` | `class MetricsSummaryItem(BaseModel)` |
| `TopCategoryItem` | `backend/app/routes.py` | `class TopCategoryItem(BaseModel)` |
| `MetricsComparison` | `backend/app/routes.py` | `class MetricsComparison(BaseModel)` |
| `MetricsAlert` | `backend/app/routes.py` | `class MetricsAlert(BaseModel)` |
| Tipos TypeScript | `frontend/src/lib/financial-types.ts` | Solo `FinancialMovement` tiene equivalente |
