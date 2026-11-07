// ============================================================
// param-types.ts — Tipos de parámetros query para la API
//
// Fuente: backend/app/routes.py (parámetros de cada endpoint)
// Verificado contra: respuestas reales de cada endpoint (2026-11-07)
//
// Funcionalidades cubiertas:
//   1. DateRangeFilter — filtro de fechas compartido
//   2. AlertsParams — parámetros de GET /api/metrics/alerts
//   3. TopCategoriesParams — parámetros de GET /api/metrics/categories/top
//
// Convenciones:
//   - snake_case para reflejar los nombres de query params del backend
//   - Los campos opcionales usan `?` (se omiten si no se envían)
//   - Los campos requeridos carecen de `?` (el backend los exige)
//   - Fechas como `string` en formato ISO "YYYY-MM-DD"
// ============================================================

import type {
  BusinessType,
  OperationType,
} from "../src/lib/financial-types";

// ============================================================
// Filtro compartido — rango de fechas opcional
// ============================================================

/** Parámetros de filtro por rango de fechas.
 *
 *  Reutilizado por múltiples endpoints. Ambos extremos son
 *  opcionales; si se omite uno se ignora ese lado del filtro.
 *
 *  Formato: "YYYY-MM-DD" (ISO 8601).
 *
 *  Uso:
 *  ```ts
 *  const monthly: DateRangeFilter = {
 *    start_date: "2026-01-01",
 *    end_date: "2026-01-31",
 *  };
 *  ```
 */
export interface DateRangeFilter {
  /** Fecha de inicio del rango (inclusive). Formato ISO "YYYY-MM-DD". */
  start_date?: string;
  /** Fecha de fin del rango (inclusive). Formato ISO "YYYY-MM-DD". */
  end_date?: string;
}

// ============================================================
// Funcionalidad 1 — Parámetros de GET /api/metrics/alerts
// ============================================================

/** Parámetros query de GET /api/metrics/alerts.
 *
 *  Todos son opcionales; el backend aplica defaults sensatos.
 *
 *  | Parámetro      | Tipo    | Default  | Descripción                              |
 *  |----------------|---------|----------|------------------------------------------|
 *  | threshold      | float   | 0.3      | Umbral de aumento sobre el promedio      |
 *  | group_by       | string  | "month"  | "day" | "week" | "month"                 |
 *  | start_date     | string  | null     | Inicio del rango ISO "YYYY-MM-DD"         |
 *  | end_date       | string  | null     | Fin del rango ISO "YYYY-MM-DD"           |
 *  | business_type  | string  | null     | "B2B" | "B2C"                             |
 *
 *  Ejemplo de uso:
 *  ```ts
 *  const params: AlertsParams = {
 *    threshold: 0.5,
 *    group_by: "month",
 *    start_date: "2026-01-01",
 *    end_date: "2026-06-30",
 *  };
 *  // fetch(`${API_BASE_URL}/api/metrics/alerts?${new URLSearchParams(params)}`)
 *  ```
 */
export interface AlertsParams extends DateRangeFilter {
  /** Umbral de incremento sobre el promedio histórico.
   *  Una alerta se dispara cuando:
   *    (outcome_actual - baseline) / baseline > threshold
   *  Default: 0.3 (30%). */
  threshold?: number;
  /** Granularidad de agrupación. "day" | "week" | "month".
   *  Default: "month". */
  group_by?: "day" | "week" | "month";
  /** Filtrar por tipo de negocio. "B2B" | "B2C". */
  business_type?: BusinessType;
}

// ============================================================
// Funcionalidad 2 — Parámetros de GET /api/metrics/categories/top
// ============================================================

/** Parámetros query de GET /api/metrics/categories/top.
 *
 *  Solo `operation_type` tiene default ("outcome"); el resto
 *  son opcionales.
 *
 *  | Parámetro       | Tipo    | Default   | Descripción                     |
 *  |-----------------|---------|-----------|---------------------------------|
 *  | operation_type  | string  | "outcome" | "income" | "outcome"            |
 *  | limit           | int     | 5         | 1-20                            |
 *  | start_date      | string  | null      | Inicio del rango ISO            |
 *  | end_date        | string  | null      | Fin del rango ISO               |
 *  | business_type   | string  | null      | "B2B" | "B2C"                 |
 *
 *  Ejemplo de uso — top 3 ingresos B2B en un período:
 *  ```ts
 *  const params: TopCategoriesParams = {
 *    operation_type: "income",
 *    limit: 3,
 *    business_type: "B2B",
 *    start_date: "2026-01-01",
 *    end_date: "2026-06-30",
 *  };
 *  ```
 */
export interface TopCategoriesParams extends DateRangeFilter {
  /** Tipo de operación a consultar. "income" | "outcome".
   *  Default: "outcome". */
  operation_type?: OperationType;
  /** Número máximo de categorías a retornar. 1-20.
   *  Default: 5. */
  limit?: number;
  /** Filtrar por tipo de negocio. "B2B" | "B2C". */
  business_type?: BusinessType;
}

// ============================================================
// Nota sobre endpoints adicionales
// ============================================================

// GET /api/metrics/comparison requiere `start_date` y `end_date` como
// parámetros **obligatorios** (no opcionales). Se definen inline
// en la firma de fetch porque no forman parte de las tres funcionalidades
// solicitadas y su comportamiento es distinto (obligatorio vs opcional).
// Esquema:
//   start_date: string        (requerido — período actual inicio)
//   end_date: string          (requerido — período actual fin)
//   business_type?: BusinessType  (opcional)
//
// GET /api/metrics/summary acepta un conjunto mayor de parámetros que
// incluye filtros por categoría, tipo de operación y tipo de negocio.
// No se incluye aquí por la misma razón (fuera del alcance de las tres
// funcionalidades).
