// ============================================================
// api-types.ts — Interfaces TypeScript para respuestas de la API
//
// Fuente: backend/app/routes.py (modelos Pydantic)
// Verificado contra: respuestas reales de cada endpoint (2026-11-07)
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
  /** "income" | "outcome" */
  operation_types: OperationType[];
  /** "B2B" | "B2C" */
  business_types: BusinessType[];
  /** 5 categorías de movimientos */
  categories: Category[];
  /** Fecha ISO del movimiento más antiguo */
  min_date: string;
  /** Fecha ISO del movimiento más reciente */
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
  /** Período donde se detectó la anomalía (ej. "2025-12") */
  period: string;
  /** Total de egresos en el período anómalo */
  outcome_total: number;
  /** Promedio de egresos de todos los períodos anteriores */
  baseline_average: number;
  /** (outcome_total - baseline_average) / baseline_average.
   *  > threshold (default 0.3) dispara la alerta */
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
  /** Nombre de la categoría */
  category: Category;
  /** Tipo de operación al que pertenece el total */
  operation_type: OperationType;
  /** Suma total de montos para esta categoría y tipo */
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
