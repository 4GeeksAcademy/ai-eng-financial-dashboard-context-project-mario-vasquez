// ============================================================
// api-types.ts — Interfaces TypeScript para respuestas de la API
//
// Fuente: backend/app/routes.py (modelos Pydantic)
// Verificado contra: respuestas reales de cada endpoint (2026-11-07)
// Verificado contra: OpenAPI /docs (esquemas y tipos propiedad por propiedad)
//
// Funcionalidades cubiertas:
//   1. Facets — rango de fechas y vista B2B vs B2C
//   2. Alertas — tabla de anomalías mensuales
//   3. Top categorías — tabla comparativa B2B vs B2C
//
// Convención de nomenclatura:
//   - Los tipos siguen el naming del backend (snake_case)
//   - Las interfaces con "Response" envuelven arrays si el
//     endpoint devuelve lista directamente
// ============================================================

import type {
  BusinessType,
  OperationType,
  Category,
} from "../src/lib/financial-types";

// ============================================================
// Funcionalidad 1 — Facets (rango de fechas y vista B2B vs B2C)
// ============================================================

/** Respuesta de GET /api/metrics/facets
 *
 *  Provee los valores discretos disponibles para cada dimensión
 *  del dashboard, más el rango temporal completo de los datos.
 *
 *  Ejemplo real (2026-11-07):
 *  {
 *    "operation_types": ["income", "outcome"],
 *    "business_types": ["B2B", "B2C"],
 *    "categories": ["administrative", "operational", "others", "sales", "suppliers"],
 *    "min_date": "2025-11-01",
 *    "max_date": "2026-10-28"
 *  }
 */
export interface FacetsResponse {
  /** Tipos de operación disponibles para filtrar.
   *  Valores: `"income"` (ingresos), `"outcome"` (egresos). */
  operation_types: OperationType[];
  /** Tipos de negocio disponibles para filtrar.
   *  Valores: `"B2B"` (business-to-business), `"B2C"` (business-to-consumer). */
  business_types: BusinessType[];
  /** Categorías de movimientos disponibles para filtrar.
   *  Valores: `"suppliers"`, `"sales"`, `"operational"`, `"administrative"`, `"others"`. */
  categories: Category[];
  /** Fecha del movimiento más antiguo en el dataset.
   *  Formato ISO 8601: `"YYYY-MM-DD"`.
   *  Ejemplo: `"2025-11-01"`. */
  min_date: string;
  /** Fecha del movimiento más reciente en el dataset.
   *  Formato ISO 8601: `"YYYY-MM-DD"`.
   *  Ejemplo: `"2026-10-28"`. */
  max_date: string;
}

// ============================================================
// Funcionalidad 2 — Alertas (tabla de anomalías)
// ============================================================

/** Una alerta individual generada por GET /api/metrics/alerts
 *
 *  Se dispara cuando el outcome de un período supera el umbral
 *  sobre el promedio histórico de outcomes anteriores.
 *
 *  Ejemplo real:
 *  {
 *    "period": "2025-12",
 *    "outcome_total": 103378.98,
 *    "baseline_average": 41404.44,
 *    "increase_ratio": 1.4968
 *  }
 */
export interface AlertEntry {
  /** Período donde se detectó la anomalía.
   *  Formato: `"YYYY-MM"` (agrupación mensual) o `"YYYY-MM-DD"` (diaria).
   *  Ejemplo: `"2025-12"` indica diciembre de 2025. */
  period: string;
  /** Total de egresos en el período anómalo.
   *  Unidad: la misma moneda que los montos de entrada (float).
   *  Ejemplo: `103378.98`. */
  outcome_total: number;
  /** Promedio de egresos de todos los períodos anteriores al actual.
   *  Sirve como línea base (baseline) para detectar la anomalía.
   *  Unidad: misma moneda que `outcome_total`.
   *  Ejemplo: `41404.44`. */
  baseline_average: number;
  /** Razón de incremento respecto al promedio histórico.
   *  Fórmula: `(outcome_total - baseline_average) / baseline_average`.
   *  Una alerta se dispara cuando `increase_ratio > threshold`
   *  (threshold por defecto = 0.3, es decir, 30% sobre el promedio).
   *  Valores típicos: `0.0` (sin desviación), `1.5` (150% sobre el promedio).
   *  Ejemplo: `1.4968` significa ~150% por encima del baseline. */
  increase_ratio: number;
}

/** Respuesta de GET /api/metrics/alerts
 *
 *  El endpoint devuelve directamente un array de alertas.
 *  El primer período nunca genera alerta (no hay historial previo).
 */
export type AlertsResponse = AlertEntry[];

// ============================================================
// Funcionalidad 3 — Top categorías (tabla comparativa B2B vs B2C)
// ============================================================

/** Una categoría con su total acumulado para un tipo de operación.
 *
 *  Ejemplo real (top 3 outcome):
 *  {
 *    "category": "others",
 *    "operation_type": "outcome",
 *    "total_amount": 224428.44
 *  }
 */
export interface CategoryEntry {
  /** Nombre de la categoría.
   *  Valores posibles: `"suppliers"`, `"sales"`, `"operational"`,
   *  `"administrative"`, `"others"`.
   *  Ejemplo: `"others"`. */
  category: Category;
  /** Tipo de operación al que pertenece el total acumulado.
   *  Valores: `"income"` (ingreso) o `"outcome"` (egreso).
   *  Ejemplo: `"outcome"`. */
  operation_type: OperationType;
  /** Suma total de montos para esta categoría y tipo de operación.
   *  Unidad: misma moneda que los montos de entrada (float).
   *  Orden: descendente (mayor total primero).
   *  Ejemplo: `224428.44`. */
  total_amount: number;
}

/** Respuesta de GET /api/metrics/categories/top
 *
 *  El endpoint devuelve directamente un array de categorías,
 *  ordenado descendente por total_amount.
 *
 *  Uso previsto — tabla comparativa B2B vs B2C:
 *  ```ts
 *  // Dos llamadas paralelas, una por cada business_type
 *  const [b2b, b2c] = await Promise.all([
 *    fetchTopCategories("outcome", 5, "B2B"),
 *    fetchTopCategories("outcome", 5, "B2C"),
 *  ]);
 *  // Renderizar lado a lado en una tabla comparativa
 *  ```
 */
export type TopCategoriesResponse = CategoryEntry[];

// ============================================================
// Funcionalidad 3 — Comparativa B2B vs B2C
// ============================================================

/** Respuesta de GET /api/metrics/comparison
 *
 *  Compara el neto (income - outcome) del período actual contra
 *  el período anterior de igual longitud. Los endpoints de comparison
 *  requieren start_date y end_date como query params obligatorios.
 *
 *  Uso previsto — gráfico de barras B2B vs B2C:
 *  Se hacen DOS llamadas paralelas (una por business_type) y se
 *  renderizan 4 barras en un BarChart.
 *
 *  Ejemplo real (2026-11-07):
 *  {
 *    "current_period": 45965.92,
 *    "previous_period": -1041.78,
 *    "delta_abs": 47007.70,
 *    "delta_pct": 100.0
 *  }
 */
export interface MetricsComparison {
  /** Neto del período actual (income - outcome).
   *  Ejemplo: `45965.92`. */
  current_period: number;
  /** Neto del período anterior (misma longitud que el actual).
   *  Ejemplo: `-1041.78`. */
  previous_period: number;
  /** Diferencia absoluta: current_period - previous_period.
   *  Ejemplo: `47007.70`. */
  delta_abs: number;
  /** Variación porcentual respecto al período anterior.
   *  Fórmula: (delta_abs / |previous_period|) * 100.
   *  null cuando previous_period === 0 (división por cero).
   *  Ejemplo: `100.0` significa un 100% de variación. */
  delta_pct: number | null;
}

// ============================================================
// Endpoints adicionales (referencia cruzada)
// ============================================================

// GET /api/metrics/comparison
// Respuesta: MetricsComparison (definido en schemas-spec.md)
// Campos: current_period, previous_period, delta_abs, delta_pct
//
// GET /api/metrics/summary
// Respuesta: list[MetricsSummaryItem] (definido en schemas-spec.md)
// Campos: period, income, outcome, net
//
// Ambos se documentan en schemas-spec.md y api-spec.md.
// Solo FacetsResponse, AlertEntry, AlertsResponse, CategoryEntry,
// y TopCategoriesResponse están tipados aquí porque son las
// interfaces que las tres funcionalidades del dashboard necesitan
// para renderizar tablas, rangos de fechas, y vistas comparativas.
