# Especificación de Componentes por Funcionalidad

> **Fuente**: `backend/app/routes.py` (endpoints), `frontend/specs/api-types.ts` (interfaces de respuesta), `frontend/specs/param-types.ts` (parámetros query), `frontend/src/App.tsx` (patrón de fetch existente)
>
> **Verificación**: Todos los nombres de campo en este spec fueron trazados al OpenAPI real (`/docs`) y verificados contra respuestas curl. Ver `TRACEABILITY.md` para la trazabilidad campo por campo.
>
> Los tres grupos de componentes descritos aquí son **nuevos** — no existen en el frontend actual. El código existente (KPIRow, IncomeOutcomeChart, ProfitPercentChart) no se modifica.

---

## Funcionalidad 1 — Filtro de rango de fechas (`DateRangeFilter`)

### Propósito

Permitir al usuario seleccionar un rango de fechas que filtre **todos los datos del dashboard** (KPIs, gráficos, tabla de alertas, tabla de categorías, gráfico comparativo). El backend acepta `start_date` y `end_date` como query parameters opcionales en todos los endpoints de /api/metrics (salvo `GET /api/metrics/facets`, que no filtra).

### Decisión de diseño (ambigüedad PM resuelta)

El PM no especifica el alcance del filtro. **Decisión**: el `DateRangeFilter` gobierna el estado global de fecha en `App.tsx` y se pasa como parámetro a **todos** los fetch de datos (alertas, categorías, comparativa). No filtra localmente — siempre provoca un refetch con los nuevos parámetros. Esto evita inconsistencias entre componentes y asegura que KPIs, gráficos y tablas siempre muestren el mismo período.

### Props

```tsx
interface DateRangeFilterProps {
  /**
   * Rango actual del filtro. Valor controlado desde App.tsx.
   * Si start_date y end_date están vacíos/undefined, muestra "sin filtro".
   * Si solo start_date está definido, filtra desde esa fecha en adelante.
   */
  value: {
    start_date?: string; // ISO 8601 — yyyy-MM-dd
    end_date?: string;   // ISO 8601 — yyyy-MM-dd
  };

  /**
   * Callback al cambiar las fechas.
   * Se dispara onBlur de cada input type="date".
   * El padre (App.tsx) actualiza su estado y lanza refetch de todos los datos.
   */
  onChange: (range: { start_date?: string; end_date?: string }) => void;

  /**
   * Rango de fechas disponible, obtenido de GET /api/metrics/facets.
   * Se usa para establecer min/max en los inputs type="date".
   * No es responsivo — se carga una vez al montar App.tsx.
   */
  dateRange?: {
    min_date?: string; // ISO 8601 — primera fecha con datos
    max_date?: string; // ISO 8601 — última fecha con datos
  };

  /** Deshabilitar ambos inputs (ej. durante loading global) */
  disabled?: boolean;
}
```

### Layout

```
┌──────────────────────────────────────────────────┐
│  Desde: [yyyy-mm-dd ▾]  Hasta: [yyyy-mm-dd ▾]   │
│              📅 Rango disponible:                │
│        2025-11-01  —  2026-10-28                 │
└──────────────────────────────────────────────────┘
```

- Los dos inputs en fila (flex row), con label "Desde:" y "Hasta:".
- Debajo de los inputs, en texto secundario (`text-muted-foreground`), el rango completo disponible con formato `"📅 {min_date} — {max_date}"`.

### Comportamiento

| Estado | Input start_date | Input end_date | Pista de rango |
|---|---|---|---|
| **Cargando facets** | Deshabilitado + Skeleton | Deshabilitado + Skeleton | Skeleton texto |
| **Error facets** | Deshabilitado | Deshabilitado | `"⚠️ Rango no disponible"` |
| **Sin filtro** | Vacío | Vacío | `"📅 Rango: 2025-11-01 — 2026-10-28"` |
| **Solo start** | "2025-01-01" | Vacío | `"📅 Rango: 2025-11-01 — 2026-10-28"` |
| **Solo end** | Vacío | "2025-06-30" | `"📅 Rango: 2025-11-01 — 2026-10-28"` |
| **Completo** | "2025-01-01" | "2025-06-30" | `"📅 Rango: 2025-11-01 — 2026-10-28"` |
| **Rango inválido** | end < start → input end_date con `setCustomValidity("La fecha final debe ser posterior a la inicial")` | | |

### Validaciones del input

- `type="date"` en ambos campos (navegador valida formato ISO)
- `min` y `max` atados a `dateRange.min_date` / `dateRange.max_date`
- Si `end_date < start_date`: mensaje de validación nativo (`setCustomValidity`)
- Al limpiar un campo: se setea a `undefined` (no a cadena vacía) para que el fetch lo omita

### Fetch asociado

El padre (`App.tsx`) orquesta el fetch:

- **Endpoint**: `GET /api/metrics/facets`
- **Parámetros**: ninguno
- **Tipo de respuesta**: `FacetsResponse` (`frontend/specs/api-types.ts`)
- **Extraer**: `min_date` y `max_date` para los atributos `min`/`max` de los inputs
- **Cache**: no es necesario refetch, facets se obtiene una vez al montar App.tsx

```tsx
// Contrato fetch — implementado en App.tsx, NO en DateRangeFilter
type FacetsPromise = Promise<FacetsResponse>;
```

---

## Funcionalidad 2 — Tabla de alertas de anomalías (`AlertsTable`)

### Propósito

Mostrar una tabla con los períodos donde el outcome excede un umbral respecto al promedio de los 3 meses anteriores. El backend (`GET /api/metrics/alerts`) devuelve las alertas según el `threshold` y `group_by` especificados.

### Decisión de diseño (ambigüedad PM resuelta)

1. **Group-by**: PM dice "tabla de anomalías mensuales". Backend soporta `day | week | month`. **Decisión**: se expone como prop opcional con default `"month"`, alineado con el PM. Sin selector visual en la UI por ahora; se pasa desde `App.tsx`.

2. **Threshold**: PM no especifica valor por defecto. **Decisión**: default `1.5` (constante usada en el seed data del backend). El callback `onThresholdChange` recibe `number` (se parsea de `event.target.value` en el handler interno).

3. **Nombres de campos `AlertEntry`**: la API real devuelve `outcome_total`, `baseline_average`, `increase_ratio` (verificado contra OpenAPI). El spec de componentes usa estos nombres directamente de `api-types.ts`.

### Props

```tsx
import type { AlertEntry } from "../specs/api-types";

interface AlertsTableProps {
  /**
   * Lista de alertas devueltas por GET /api/metrics/alerts.
   * Vacío ([]) = "Sin alertas" — no es error.
   * Cada entrada sigue AlertEntry de api-types.ts:
   *   { period: string; outcome_total: number; baseline_average: number; increase_ratio: number }
   */
  data: AlertEntry[];

  /**
   * Umbral de desviación para considerar una anomalía.
   * Se pasa como query param `threshold` al backend.
   * Default en el backend: 1.5.
   */
  threshold: number;

  /**
   * Callback al cambiar el umbral desde el input de la UI.
   * Recibe number (ya parseado de event.target.value).
   * El padre actualiza threshold en estado y lanza refetchAlerts().
   */
  onThresholdChange: (newThreshold: number) => void;

  /**
   * Agrupación temporal. Default: "month".
   * PM asume "month" ("anomalías mensuales"), pero el backend soporta
   * día y semana también. Se expone como prop para flexibilidad futura.
   */
  groupBy?: "day" | "week" | "month";

  /** Callback para notificar cambio de groupBy al padre */
  onGroupByChange?: (groupBy: "day" | "week" | "month") => void;

  /** Estado de carga */
  loading?: boolean;

  /** Mensaje de error, si lo hay */
  error?: string | null;
}
```

### Layout

```
┌─────────────────────────────────────────────────────────┐
│  🚨 Alertas de gasto          Threshold: [1.50 ▾]      │
│  Umbral: aumento >1.5× sobre el promedio histórico      │
├──────────┬──────────────┬──────────────────┬─────────────┤
│ Período  │ Outcome      │ Promedio previo  │ Incremento  │
├──────────┼──────────────┼──────────────────┼─────────────┤
│ 2025-12  │ $103,378.98  │ $41,404.44       │ +149.68%    │
│ 2026-03  │ $88,076.90   │ $55,334.29       │ +59.17%     │
└──────────┴──────────────┴──────────────────┴─────────────┘
```

### Columnas de la tabla

| # | Columna | Tipo | Fuente (api-types.ts) | Formateo |
|---|---|---|---|---|
| 1 | **Período** | `string` | `AlertEntry.period` | ISO según group_by: "2025-01-15" (day), "2025-W03" (week), "2025-01" (month) |
| 2 | **Outcome** | `number` | `AlertEntry.outcome_total` | `formatCurrency()` → `"$103,378.98"` |
| 3 | **Promedio previo** | `number` | `AlertEntry.baseline_average` | `formatCurrency()` → `"$41,404.44"` |
| 4 | **Incremento** | `number` | `AlertEntry.increase_ratio` | `formatPercent()` → `"+149.68%"` (rojo si >0) |

### Fetch asociado

El padre (`App.tsx`) orquesta el fetch:

- **Endpoint**: `GET /api/metrics/alerts`
- **Parámetros**: `AlertsParams` (`frontend/specs/param-types.ts`) — `threshold`, `group_by`, `start_date`, `end_date`, `business_type`
- **Tipo de respuesta**: `AlertEntry[]` (`frontend/specs/api-types.ts`)
- **Frecuencia**: refetch cada vez que cambia `threshold`, `group_by` o el rango de fechas global

```tsx
// Contrato fetch — implementado en App.tsx
type AlertsFetch = (params: AlertsParams) => Promise<AlertEntry[]>;
```

### Comportamiento

#### Estado vacío (data.length === 0)

```
┌─────────────────────────────────────────────────────────┐
│  🚨 Alertas de gasto          Threshold: [1.50 ▾]      │
│  Umbral: aumento >1.5× sobre el promedio histórico      │
├─────────────────────────────────────────────────────────┤
│                    ✅ Sin alertas                        │
│         Ningún período superó el umbral de 1.5×         │
│         sobre el promedio histórico.                    │
└─────────────────────────────────────────────────────────┘
```

- Ícono de check verde (`✅` o `CheckCircle2` de lucide).
- Mensaje: "Sin alertas — ningún período superó el umbral de {threshold}× sobre el promedio histórico."
- Texto secundario: "Intenta con un umbral más bajo para detectar anomalías menores."

#### Threshold fuera de rango

El backend acepta `threshold ≥ 0` (float). Casos:

| Valor | Comportamiento del backend | Lo que ve el usuario |
|---|---|---|
| `threshold = 0` | Alerta en **todo** período con increment > 0. Válido pero extremo. | Tabla llena; input muestra `0.00`. |
| `0 < threshold < 1.5` | Más alertas que el default. | Tabla con más filas. |
| `threshold = 1.5` | Default del seed data. | Normal. |
| `threshold > 1.5` | Menos alertas. | Tabla con menos filas. |
| `threshold < 0` | Backend rechaza con HTTP 422. | Input debe tener `min={0}`. |

Input threshold: `<input type="number" min={0} step={0.1}>`. Si el backend devuelve 422:
```
⚠️ Umbral inválido: debe ser un número mayor o igual a 0.
```

#### Estados visuales

| Estado | Cabecera | Tabla |
|---|---|---|
| **Cargando** | Threshold deshabilitado | 4 filas de Skeleton |
| **Error** | Threshold deshabilitado | `"⚠️ {mensaje de error}"` |
| **Vacío** | Threshold habilitado | `"✅ Sin alertas — ningún período superó el umbral de 1.5×"` |
| **Datos** | Threshold habilitado | Filas con datos formateados |

---

## Funcionalidad 3 — Vista comparativa B2B vs B2C (`B2BvsB2CView`)

### Propósito

Comparar el rendimiento financiero de los segmentos de negocio B2B y B2C lado a lado, mostrando:
1. Las categorías top-5 (por defecto outcome) de cada segmento
2. Un gráfico de barras comparando neto actual vs. neto período anterior por segmento

### Decisión de diseño (ambigüedad PM resuelta)

1. **¿El componente gestiona su propio fetch o recibe props?** El PM es ambiguo. **Decisión**: `B2BvsB2CView` es **puramente presentacional** — recibe datos ya resueltos como props, no hace fetch propio. El padre (`App.tsx`) orquesta las 4 llamadas paralelas (2 a `categories/top` + 2 a `metrics/comparison`) y pasa los resultados como props.

2. **El gráfico comparativo requiere DOS llamadas a `comparison`** (una por `business_type`), porque `GET /api/metrics/comparison` solo acepta un `business_type` a la vez.

3. **Nombres de campos `CategoryEntry`**: la API real devuelve `total_amount` y `operation_type` (verificado contra OpenAPI). Idéntico a `api-types.ts`. No se renombra nada.

4. **Nombres de campos `MetricsComparison`**: la API real devuelve `current_period`, `previous_period`, `delta_abs`, `delta_pct` (este último nullable: `number | null`). Idéntico a la respuesta de `GET /api/metrics/comparison`. No se renombra nada.

5. **`operation_type` en top categorías**: El PM no especifica income vs outcome. **Decisión**: por defecto `"outcome"` (egresos), que es el default del backend. Se expone como prop para flexibilidad.

### Props

```tsx
import type { CategoryEntry, MetricsComparison } from "../specs/api-types";

interface B2BvsB2CViewProps {
  /**
   * Top categorías del segmento B2B (operation_type = "outcome" por defecto).
   * Array vacío si no hay datos para B2B en el período.
   * Cada entrada sigue CategoryEntry de api-types.ts:
   *   { category: string; total_amount: number; operation_type: OperationType }
   */
  b2bData: CategoryEntry[];

  /**
   * Top categorías del segmento B2C.
   * Misma estructura que b2bData.
   */
  b2cData: CategoryEntry[];

  /** Datos de comparación para ambos segmentos.
   *  Cada segmento requiere su propia llamada a GET /api/metrics/comparison
   *  con business_type="B2B" y business_type="B2C" respectivamente.
   *  null cuando aún no se ha completado la carga o hay error.
   *  Ver MetricsComparison en api-types.ts.
   */
  comparisonData: {
    b2b: MetricsComparison | null;
    b2c: MetricsComparison | null;
  };

  /** Tipo de operación mostrada en las tablas top-5. Default "outcome" */
  operationType?: "income" | "outcome";

  /** Estado de carga */
  loading?: boolean;

  /** Mensaje de error */
  error?: string | null;
}

> `MetricsComparison` se define en `frontend/specs/api-types.ts` — interfaz completa con JSDoc en cada propiedad. No se replica aquí.
> 
> Campos: `current_period: number`, `previous_period: number`, `delta_abs: number`, `delta_pct: number | null`.
```

### Sub-componentes

#### `TopCategoriesTable`

```tsx
interface TopCategoriesTableProps {
  /** "B2B" | "B2C" — se usa como título del panel */
  title: "B2B" | "B2C";

  /**
   * Datos de categorías. Array de CategoryEntry (api-types.ts).
   * Cada entrada: { category: string; total_amount: number }
   * Se renderiza como top-5 (según limit usado en el fetch).
   */
  data: CategoryEntry[];

  /** Estado de carga */
  loading?: boolean;

  /** Mensaje de error */
  error?: string | null;
}
```

Columnas:

| Columna | Tipo | Fuente (api-types.ts) |
|---|---|---|
| **Categoría** | `string` | `CategoryEntry.category` |
| **Total** | `number` | `CategoryEntry.total_amount`, formateado como `currency(USD)` |

#### `ComparisonChart`

```tsx
interface ComparisonChartProps {
  /**
   * Datos para ambos segmentos.
   * Se renderizan 4 barras en un BarChart de Recharts:
   * - B2B current_period (azul), B2B previous_period (azul claro)
   * - B2C current_period (verde), B2C previous_period (verde claro)
   *
   * Si un segmento es null, se omite ese par de barras.
   * Si ambos son null, se muestra "Sin datos para la comparativa."
   */
  data: {
    b2b: MetricsComparison | null;
    b2c: MetricsComparison | null;
  };

  /** Estado de carga */
  loading?: boolean;
}
```

### Layout general

```
┌──────────────────────────────────────────────────────────────┐
│              🔄 Comparativa B2B vs B2C                       │
├──────────────────────────┬───────────────────────────────────┤
│       📊 B2B              │        📊 B2C                    │
│  ┌────────────────────┐  │   ┌────────────────────┐         │
│  │ Categoría    Total │  │   │ Categoría    Total │         │
│  ├────────────────────┤  │   ├────────────────────┤         │
│  │ others    $120,000 │  │   │ others    $104,428 │         │
│  │ operatio.  $95,000 │  │   │ administ.  $98,000 │         │
│  │ ...               │  │   │ ...               │         │
│  └────────────────────┘  │   └────────────────────┘         │
│                          │                                   │
│  Neto actual:            │   Neto actual:                    │
│  $45,965.92              │   [dato B2C]                     │
│  vs anterior:            │   vs anterior:                    │
│  -$1,041.78              │   [dato B2C]                     │
│  Delta: +$47,007.70      │   Delta: [dato B2C]              │
│  (%) : +4,512.25%        │   (%) : [dato B2C]               │
├──────────────────────────┴───────────────────────────────────┤
│  📈 Comparación de valor neto                               │
│                                                              │
│    $50k ┤ ████████                                          │
│         │ ████████  ████████                                 │
│    $0   ┤████████  ████████  ████████                       │
│         │████████  ████████  ████████  ████████             │
│  -$50k  ┤████████  ████████  ████████  ████████  ████████  │
│         └──────────────────────────────────────────────────  │
│           B2B-Actual  B2C-Actual  B2B-Ant.    B2C-Ant.     │
└──────────────────────────────────────────────────────────────┘
```

### Fetch asociado

El padre (`App.tsx`) orquesta **4 llamadas paralelas**:

| # | Endpoint | Parámetros | Tipo respuesta |
|---|---|---|---|
| 1 | `GET /api/metrics/categories/top` | `business_type=B2B`, `operation_type=outcome`, `limit=5`, fechas | `CategoryEntry[]` |
| 2 | `GET /api/metrics/categories/top` | `business_type=B2C`, `operation_type=outcome`, `limit=5`, fechas | `CategoryEntry[]` |
| 3 | `GET /api/metrics/comparison` | `business_type=B2B`, `start_date`, `end_date` | `MetricsComparison` |
| 4 | `GET /api/metrics/comparison` | `business_type=B2C`, `start_date`, `end_date` | `MetricsComparison` |

```tsx
// Contrato fetch — implementado en App.tsx
type TopCategoriesFetch = (params: TopCategoriesParams & { business_type: BusinessType }) => Promise<CategoryEntry[]>;
type ComparisonFetch = (params: DateRangeFilter & { business_type: BusinessType }) => Promise<MetricsComparison>;

// Uso en App.tsx: 4 llamadas paralelas, resultados mapeados a props de B2BvsB2CView
// Props resultantes: { b2bData, b2cData, comparisonData: { b2b, b2c } }
```

**Nota**: `start_date` y `end_date` son **requeridos** por `GET /api/metrics/comparison` (el backend rechaza la petición sin ellos). El padre debe garantizar que ambas fechas estén definidas antes de llamar a `fetchComparison`.
```

### Comportamiento

#### Panel con lista top-5 vacía (data.length === 0)

```
┌──────────────────────────────┐
│  📊 B2B                      │
├──────────────────────────────┤
│  📭 Sin datos para B2B       │
│  en el período seleccionado. │
│                              │
│  Neto actual: —              │
│  vs anterior: —              │
└──────────────────────────────┘
```

Ícono `Inbox` o `FileMinus` de lucide.

#### Ambos paneles vacíos

```
┌─────────────────────────────────────────────────────────────┐
│        🔄 Comparativa B2B vs B2C                            │
├──────────────────────────┬──────────────────────────────────┤
│  📭 Sin datos para B2B  │  📭 Sin datos para B2C          │
│  en el período selec.   │  en el período selec.           │
├──────────────────────────┴──────────────────────────────────┤
│  📈 Comparación de valor neto                               │
│  Sin datos para la comparativa.                             │
└──────────────────────────────────────────────────────────────┘
```

#### Gráfico comparativo (ComparisonChart)

Un **`BarChart`** de Recharts con 4 barras:

| Barra | Valor | Color |
|---|---|---|
| B2B Actual | `comparisonB2B.current_period` | `var(--chart-1)` |
| B2C Actual | `comparisonB2C.current_period` | `var(--chart-3)` |
| B2B Anterior | `comparisonB2B.previous_period` | `var(--chart-2)` |
| B2C Anterior | `comparisonB2C.previous_period` | `var(--chart-4)` |

Comportamiento:
- Si ambos segmentos son `null`: "Sin datos para la comparativa."
- Si solo un segmento tiene datos: se muestran sus 2 barras.
- Si `loading=true`: Skeleton rectangular.

### Estados visuales completos

| Estado | Panel B2B | Panel B2C | Gráfico comparativo |
|---|---|---|---|
| **Cargando** | Skeleton 5 filas | Skeleton 5 filas | Skeleton rectangular |
| **Error** | `"⚠️ Error al cargar B2B: ..."` | `"⚠️ Error al cargar B2C: ..."` | `"⚠️ Error al cargar comparativa"` |
| **Datos completos** | Top 5 + neto + delta | Top 5 + neto + delta | 4 barras (2 tipos × 2 períodos) |
| **Un segmento vacío** | Tabla real | `"📭 Sin datos para B2C en este período"` | Barras del segmento con datos |
| **Ambos vacíos** | `"📭 Sin datos para B2B en este período"` | `"📭 Sin datos para B2C en este período"` | `"Sin datos para la comparativa"` |

---

## Resumen de todos los componentes nuevos

| Funcionalidad | Componente | Props clave | Depende de (tipos) |
|---|---|---|---|
| 1 — Filtro fechas | `DateRangeFilter` | `value`, `onChange`, `dateRange?` | `FacetsResponse` (solo min/max_date) |
| 2 — Alertas | `AlertsTable` | `data`, `threshold`, `onThresholdChange`, `groupBy?` | `AlertEntry[]` (api-types.ts), `AlertsParams` (param-types.ts) |
| 3 — Comparativa | `B2BvsB2CView` | `b2bData`, `b2cData`, `comparisonData: {b2b, b2c}` | `CategoryEntry[]` (api-types.ts) |
| 3 — Comparativa | `TopCategoriesTable` | `title`, `data`, `loading?`, `error?` | `CategoryEntry[]` (api-types.ts) |
| 3 — Comparativa | `ComparisonChart` | `data: {b2b?, b2c?}`, `loading?` | `MetricsComparison` (spec inline) |

### Fetch pattern común a todos

Todos los componentes nuevos dependen del mismo contrato fetch, gobernado por `App.tsx`:

- `VITE_API_BASE_URL` como base URL (variable de entorno, default `""`)
- Fetch nativo (`fetch` + `async/await` + `.ok` check + `.json()`)
- Sin librerías HTTP externas (axios, ky, TanStack Query, etc.)
- Error handling mediante `catch` + `setError` en el padre
- Loading controlado con `useState` en el padre
- Solo se pasan searchParams si el valor está definido (no cadenas vacías)
- Los componentes son puramente presentacionales — no gestionan su propio fetching

### Árbol de componentes resultante (con los nuevos)

```
App
├── DashboardHeader
├── DateRangeFilter (NUEVO) — filtra KPIs, charts, alerts, comparison
├── ErrorMessage (div inline, condicional)
├── KPIRow
│   ├── KPICard (×4)
├── IncomeOutcomeChart
├── ProfitPercentChart
├── AlertsTable (NUEVO)
├── B2BvsB2CView (NUEVO)
│   ├── TopCategoriesTable B2B
│   ├── TopCategoriesTable B2C
│   ├── ComparisonChart
```

Los nuevos componentes se integran en `App.tsx` debajo de los gráficos existentes, dentro del mismo contenedor `flex flex-col gap-8`. El `DateRangeFilter` gobierna el estado de fecha que se pasa como parámetro a los fetch de las tres funcionalidades.

> ⚠️ **Nota**: `GET /api/metrics` (endpoint que consume App.tsx actualmente) **no acepta** `business_type` como query parameter (documentado en `api-spec.md`). La funcionalidad 3 usa exclusivamente `GET /api/metrics/categories/top` y `GET /api/metrics/comparison`, que sí lo aceptan.
