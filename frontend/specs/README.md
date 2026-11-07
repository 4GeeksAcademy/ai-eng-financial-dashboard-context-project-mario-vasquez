# Especificaciones del Frontend — Financial Dashboard

Este directorio contiene todos los archivos de especificación del frontend.
Cada archivo cubre tipos TypeScript, componentes, utilidades, estados UX,
y la API del backend que se consume — todo verificado contra OpenAPI `/docs`.

---

## Las tres funcionalidades principales

| # | Funcionalidad | Componente(s) | Endpoints | Spec principal |
|---|---|---|---|---|
| **1** | **Filtro de rango de fechas** | `DateRangeFilter` | `GET /api/metrics/facets` | `components.md` — § Funcionalidad 1 |
| **2** | **Tabla de alertas de anomalías** | `AlertsTable` | `GET /api/metrics/alerts` | `components.md` — § Funcionalidad 2 |
| **3** | **Vista comparativa B2B vs B2C** | `B2BvsB2CView`, `TopCategoriesTable`, `ComparisonChart` | `GET /api/metrics/categories/top`, `GET /api/metrics/comparison` | `components.md` — § Funcionalidad 3 |

---

## Funcionalidad 1 — Filtro de rango de fechas (`DateRangeFilter`)

### Endpoints que consume

| Endpoint | Rol | Parámetros |
|---|---|---|
| `GET /api/metrics/facets` | Obtener `min_date` y `max_date` del dataset para acotar los inputs `type="date"` | **Ninguno** — sin parámetros |

### Tipos TypeScript

#### Petición

No se necesitan parámetros de petición. La respuesta de facets se tipa como:

```ts
// frontend/specs/api-types.ts — FacetsResponse
interface FacetsResponse {
  operation_types: OperationType[];  // "income" | "outcome"
  business_types: BusinessType[];    // "B2B" | "B2C"
  categories: Category[];            // "suppliers" | "sales" | "operational" | "administrative" | "others"
  min_date: string;                  // ISO "YYYY-MM-DD", ej. "2025-11-01"
  max_date: string;                  // ISO "YYYY-MM-DD", ej. "2026-10-28"
}
```

Desde facets se extraen únicamente `min_date` y `max_date` para el `DateRangeFilter`.

#### Props del componente

```ts
// frontend/specs/components.md — DateRangeFilterProps
interface DateRangeFilterProps {
  value: {
    start_date?: string;  // ISO "YYYY-MM-DD"
    end_date?: string;    // ISO "YYYY-MM-DD"
  };
  onChange: (range: { start_date?: string; end_date?: string }) => void;
  dateRange?: {
    min_date?: string;    // ISO "YYYY-MM-DD"
    max_date?: string;    // ISO "YYYY-MM-DD"
  };
  disabled?: boolean;
}
```

### Valores válidos y restricciones de cada parámetro

| Prop / Parámetro | Valores válidos | Default | Restricciones |
|---|---|---|---|
| `start_date` | string ISO `"YYYY-MM-DD"` | `undefined` (sin filtro) | Debe ser ≥ `facets.min_date` y ≤ `end_date` (si existe) |
| `end_date` | string ISO `"YYYY-MM-DD"` | `undefined` (sin filtro) | Debe ser ≤ `facets.max_date` y ≥ `start_date` (si existe) |
| `min_date` (display) | string ISO, ej. `"2025-11-01"` | — | Solo lectura, proviene de facets |
| `max_date` (display) | string ISO, ej. `"2026-10-28"` | — | Solo lectura, proviene de facets |

### Casos límite (edge cases) y comportamiento UI

| # | Caso | Respuesta del backend / condición | Qué debe mostrar la UI |
|---|---|---|---|
| **1** | **Rango no disponible (facets falla)** | `GET /api/metrics/facets` devuelve 5xx o timeout. Los campos `min_date` / `max_date` quedan en `undefined`. | Ambos inputs deshabilitados con Skeleton. Pista de rango: `"⚠️ Rango no disponible"`. `onChange` no se dispara hasta que se recuperen los facets. |
| **2** | **end_date anterior a start_date** | Validación local, no llega al backend. | El input `end_date` muestra `setCustomValidity("La fecha final debe ser posterior a la inicial")`. El formulario no puede enviarse. Al corregir la fecha, se limpia la validación personalizada. |
| **3** | **Solo start_date definido, sin end_date** | Backend: filtra desde `start_date` hasta el final del dataset. | Input start_date con valor, input end_date vacío. Se lanza refetch con solo `start_date` en query params (end_date se omite del URL). |
| **4** | **Ambos vacíos (sin filtro)** | Backend: devuelve datos completos. | Ambos inputs vacíos. Pista de rango: `"📅 Rango: 2025-11-01 — 2026-10-28"`. |

---

## Funcionalidad 2 — Tabla de alertas de anomalías (`AlertsTable`)

### Endpoint que consume

| Endpoint | Rol | Parámetros |
|---|---|---|
| `GET /api/metrics/alerts` | Obtener períodos donde el outcome supera un umbral sobre el promedio histórico | `threshold`, `group_by`, `start_date`, `end_date`, `business_type` |

### Tipos TypeScript

#### Petición

```ts
// frontend/specs/param-types.ts — AlertsParams
interface AlertsParams extends DateRangeFilter {
  threshold?: number;           // ≥0, default backend 0.3
  group_by?: "day" | "week" | "month";  // default backend "month"
  business_type?: BusinessType; // "B2B" | "B2C"
}
```

#### Respuesta

```ts
// frontend/specs/api-types.ts — AlertEntry y AlertsResponse
interface AlertEntry {
  period: string;              // ISO según group_by: "2025-01" (month), "2025-W03" (week), "2025-01-15" (day)
  outcome_total: number;       // Total de egresos en el período, ej. 103378.98
  baseline_average: number;    // Promedio de egresos de períodos anteriores, ej. 41404.44
  increase_ratio: number;      // (outcome_total - baseline_average) / baseline_average, ej. 1.4968
}

type AlertsResponse = AlertEntry[];  // El endpoint devuelve el array directamente
```

#### Props del componente

```ts
// frontend/specs/components.md — AlertsTableProps
interface AlertsTableProps {
  data: AlertEntry[];
  threshold: number;
  onThresholdChange: (newThreshold: number) => void;
  groupBy?: "day" | "week" | "month";
  onGroupByChange?: (groupBy: "day" | "week" | "month") => void;
  loading?: boolean;
  error?: string | null;
}
```

### Valores válidos y restricciones de cada parámetro

| Prop / Parámetro | Valores válidos | Default | Restricciones |
|---|---|---|---|
| `threshold` | `number ≥ 0` | `1.5` (componente, sugerido por seed data) / `0.3` (backend) | Se pasa como string al query param. A `0` alerta cualquier desviación positiva. |
| `group_by` | `"day"` \| `"week"` \| `"month"` | `"month"` | Afecta el formato de `period` en la respuesta. |
| `start_date` | ISO `"YYYY-MM-DD"` | `undefined` | Opcional; proviene del `DateRangeFilter` global. |
| `end_date` | ISO `"YYYY-MM-DD"` | `undefined` | Opcional; proviene del `DateRangeFilter` global. |
| `business_type` | `"B2B"` \| `"B2C"` | `undefined` (ambos) | Opcional. |

### Casos límite (edge cases) y comportamiento UI

| # | Caso | Respuesta del backend / condición | Qué debe mostrar la UI |
|---|---|---|---|
| **1** | **Sin alertas (`data: []`)** | Ningún período superó el umbral. El array de alertas llega vacío. | La tabla no se oculta. Muestra una fila única con ícono `CheckCircle2` y el mensaje `"✅ Sin anomalías detectadas en este período con el umbral actual."` Las columnas de encabezado se mantienen visibles. |
| **2** | **Threshold extremo (0.0)** | El backend alerta en todos los períodos donde `outcome > average`, incluyendo desviaciones mínimas. | La tabla se llena con alertas, posiblemente muchos períodos. El usuario debe subir el threshold. El UI debe funcionar sin errores con cualquier cantidad de filas. |
| **3** | **Error en fetch** | `response.ok === false` (4xx/5xx). | El componente muestra `"⚠️ Error al cargar alertas: {status}"` dentro de la Card, reemplazando la tabla. Los controles de threshold/groupBy permanecen habilitados para reintentar. |
| **4** | **Loading sin datos previos** | Primera carga (no hay `data` cacheados). | Skeleton de 3 filas simulando la estructura de la tabla (4 columnas con rectángulos grises animados). Una vez cargados los datos, el skeleton se reemplaza por la tabla real. |

---

## Funcionalidad 3 — Vista comparativa B2B vs B2C (`B2BvsB2CView`)

### Endpoints que consume (4 llamadas paralelas)

| Endpoint | Rol | Parámetros |
|---|---|---|
| `GET /api/metrics/categories/top` | Top-5 categorías de egresos para B2B | `operation_type=outcome`, `limit=5`, `business_type=B2B`, fechas |
| `GET /api/metrics/categories/top` | Top-5 categorías de egresos para B2C | `operation_type=outcome`, `limit=5`, `business_type=B2C`, fechas |
| `GET /api/metrics/comparison` | Comparativa neta B2B (actual vs anterior) | `start_date`, `end_date` (requeridos), `business_type=B2B` |
| `GET /api/metrics/comparison` | Comparativa neta B2C (actual vs anterior) | `start_date`, `end_date` (requeridos), `business_type=B2C` |

### Tipos TypeScript

#### Petición (top categorías)

```ts
// frontend/specs/param-types.ts — TopCategoriesParams
interface TopCategoriesParams extends DateRangeFilter {
  operation_type?: OperationType;  // "income" | "outcome", default "outcome"
  limit?: number;                  // 1-20, default 5
  business_type?: BusinessType;    // "B2B" | "B2C"
}
```

#### Respuesta (top categorías)

```ts
// frontend/specs/api-types.ts — CategoryEntry
interface CategoryEntry {
  category: Category;               // "suppliers" | "sales" | "operational" | "administrative" | "others"
  operation_type: OperationType;    // "income" | "outcome"
  total_amount: number;             // Suma acumulada, ej. 224428.44
}

type TopCategoriesResponse = CategoryEntry[];
```

#### Petición (comparación)

```ts
// Combinación de DateRangeFilter + business_type
interface ComparisonParams extends DateRangeFilter {
  business_type?: BusinessType;  // "B2B" | "B2C"
}
// Nota: start_date y end_date son requeridos por el backend
```

#### Respuesta (comparación)

```ts
// frontend/specs/api-types.ts — MetricsComparison
interface MetricsComparison {
  current_period: number;       // Neto del período actual (income - outcome), ej. 45965.92
  previous_period: number;      // Neto del período anterior de igual duración, ej. -1041.78
  delta_abs: number;            // Diferencia absoluta: current_period - previous_period, ej. 47007.70
  delta_pct: number | null;     // Variación porcentual, ej. 590.48. null si previous_period === 0.
}
```

#### Props del componente

```ts
// frontend/specs/components.md — B2BvsB2CViewProps
interface B2BvsB2CViewProps {
  b2bData: CategoryEntry[];            // Top categorías B2B
  b2cData: CategoryEntry[];            // Top categorías B2C
  comparisonData: {
    b2b: MetricsComparison | null;     // Comparativa B2B (null si error/sin datos)
    b2c: MetricsComparison | null;     // Comparativa B2C (null si error/sin datos)
  };
  operationType?: "income" | "outcome";  // Default "outcome"
  loading?: boolean;
  error?: string | null;
}
```

### Valores válidos y restricciones de cada parámetro

| Parámetro | Endpoint | Valores válidos | Default | Restricciones |
|---|---|---|---|---|
| `operation_type` | categories/top | `"income"` \| `"outcome"` | `"outcome"` | Determina si el ranking es de ingresos o egresos |
| `limit` | categories/top | `1` – `20` | `5` | Rechazado por backend si fuera de rango |
| `business_type` | categories/top y comparison | `"B2B"` \| `"B2C"` | `undefined` | Si se omite, incluye ambos (solo aplica a categories/top) |
| `start_date` | comparison | ISO `"YYYY-MM-DD"` | **Requerido** | Define el inicio del período actual |
| `end_date` | comparison | ISO `"YYYY-MM-DD"` | **Requerido** | Define el fin del período actual |

### Casos límite (edge cases) y comportamiento UI

| # | Caso | Respuesta del backend / condición | Qué debe mostrar la UI |
|---|---|---|---|
| **1** | **Un segmento sin datos (ej. B2B no tiene egresos en el período)** | `GET /api/metrics/categories/top?business_type=B2B&operation_type=outcome` devuelve `[]`. El otro segmento tiene datos normales. | Panel B2B: ícono `Inbox` + `"📭 Sin datos para B2B en el período seleccionado."` Métricas de comparación: `"—"`. Panel B2C: tabla normal con top-5. Gráfico: solo 2 barras (B2C actual + B2C anterior). |
| **2** | **Ambos segmentos vacíos** | Ambos endpoints de categories/top devuelven `[]`, y ambos comparison devuelven `null` (o error). | Paneles izquierdo y derecho: `"📭 Sin datos para B2B en el período seleccionado."` / `"📭 Sin datos para B2C en el período seleccionado."` Gráfico: `"Sin datos para la comparativa."` Toda la sección se mantiene visible, no se oculta. |
| **3** | **previous_period = 0** (en comparison) | El backend no puede calcular `delta_pct`: `delta_abs / |previous_period|` es división por cero. Backend retorna `delta_pct: null`. | La UI debe mostrar `"—"` o `"N/A"` en lugar del porcentaje. `delta_abs` (absoluto) sí se muestra normal. |
| **4** | **Error parcial (3 de 4 llamadas fallan)** | Ej.: categories/top B2B falla (timeout), pero categories/top B2C, comparison B2B y comparison B2C funcionan. | El panel B2B muestra `"⚠️ Error al cargar B2B: ..."`. Panel B2C y gráfico se renderizan con datos disponibles. El error es por segmento, no global. |
| **5** | **Fechas sin movimientos en el período** | El backend retorna `[]` para categories/top y `current_period = 0`, `previous_period = 0`, `delta_abs = 0`, `delta_pct = 0` para comparison. | Ambos paneles: `"📭 Sin datos para {B2B|B2C} en el período seleccionado."` Gráfico: barras en 0 con tooltip indicando `"Sin actividad"`. |

---

## Índice de archivos

| Archivo | Propósito |
|---|---|
| `README.md` | **Este archivo** — índice con las tres funcionalidades, endpoints, tipos, valores válidos y casos límite |
| `api-types.ts` | Interfaces TypeScript para respuestas de la API (`FacetsResponse`, `AlertEntry`, `AlertsResponse`, `CategoryEntry`, `MetricsComparison`) — sin `any`, sin `object`, todas con JSDoc |
| `param-types.ts` | Tipos de parámetros query (`DateRangeFilter`, `AlertsParams`, `TopCategoriesParams`) — verificados propiedad por propiedad contra OpenAPI |
| `api-spec.md` | Endpoints REST del backend verificados contra `/docs` y OpenAPI real — los 9 endpoints, parámetros, ejemplos reales |
| `schemas-spec.md` | Schemas compartidos (modelos Pydantic ↔ tipos TypeScript) |
| `types-spec.md` | Modelos de datos compartidos (`FinancialMovement`, `KPIMetrics`, `MonthlyDataPoint`) |
| `components-spec.md` | Componentes React existentes y jerarquía de composición (KPIRow, KPICard, IncomeOutcomeChart, ProfitPercentChart) |
| `components.md` | Especificación detallada de los **5 componentes nuevos** por funcionalidad — props, layouts, fetch, estados, edge cases |
| `utils-spec.md` | Funciones utilitarias (`computeKPIs`, `computeMonthlyData`, formateo) |
| `ux-states-spec.md` | Estados de experiencia de usuario (loading, error, empty, data) |
| `ux-behavior-spec.md` | Comportamientos e interacciones del dashboard — fetch flow, dark mode, responsive |

## Convenciones

- Todos los archivos están escritos en **Markdown** (salvo `api-types.ts` y `param-types.ts` que son TypeScript).
- Las especificaciones se basan únicamente en el código fuente del repositorio y respuestas reales de la API.
- Cada afirmación incluye la referencia al archivo de código que la respalda.
- No incluyen roadmaps, promesas de producto ni funcionalidades no implementadas.
- Los tipos TypeScript usan **strict mode**: sin `any`, sin `object`, con JSDoc en cada propiedad.
