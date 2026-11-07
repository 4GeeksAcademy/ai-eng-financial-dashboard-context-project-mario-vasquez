# Trazabilidad: Specs → OpenAPI `/docs`

Cada tipo, campo y endpoint en los archivos de especificación fue verificado contra:

1. **OpenAPI schema** (`http://localhost:8000/openapi.json`) — esquemas y tipos propiedad por propiedad
2. **Respuestas reales** (curl a cada endpoint) — nombres de campo y tipos en runtime

---

## Trazabilidad por schema

| Schema OpenAPI | Archivo spec | Interfaz TypeScript | Estado |
|---|---|---|---|
| `MetricsFacets` | `api-types.ts` | `FacetsResponse` | ✅ Verificado |
| `MetricsAlert` | `api-types.ts` | `AlertEntry` | ✅ Verificado |
| `TopCategoryItem` | `api-types.ts` | `CategoryEntry` | ✅ Verificado |
| `MetricsComparison` | `api-types.ts` | `MetricsComparison` | ✅ Verificado |

---

## Trazabilidad campo por campo

### `MetricsFacets` → `FacetsResponse`

| Campo OpenAPI | Tipo OpenAPI | Campo TypeScript | Tipo TypeScript |
|---|---|---|---|
| `operation_types` | `array[string]` | `operation_types` | `OperationType[]` |
| `business_types` | `array[string]` | `business_types` | `BusinessType[]` |
| `categories` | `array[string]` | `categories` | `Category[]` |
| `min_date` | `string` | `min_date` | `string` |
| `max_date` | `string` | `max_date` | `string` |

### `MetricsAlert` → `AlertEntry`

| Campo OpenAPI | Tipo OpenAPI | Campo TypeScript | Tipo TypeScript |
|---|---|---|---|
| `period` | `string` | `period` | `string` |
| `outcome_total` | `number` | `outcome_total` | `number` |
| `baseline_average` | `number` | `baseline_average` | `number` |
| `increase_ratio` | `number` | `increase_ratio` | `number` |

### `TopCategoryItem` → `CategoryEntry`

| Campo OpenAPI | Tipo OpenAPI | Campo TypeScript | Tipo TypeScript |
|---|---|---|---|
| `category` | `string` | `category` | `Category` |
| `operation_type` | `string` | `operation_type` | `OperationType` |
| `total_amount` | `number` | `total_amount` | `number` |

### `MetricsComparison` → `MetricsComparison`

| Campo OpenAPI | Tipo OpenAPI | Campo TypeScript | Tipo TypeScript |
|---|---|---|---|
| `current_period` | `number` | `current_period` | `number` |
| `previous_period` | `number` | `previous_period` | `number` |
| `delta_abs` | `number` | `delta_abs` | `number` |
| `delta_pct` | `number \| null` | `delta_pct` | `number \| null` |

---

## Trazabilidad por endpoint

| Endpoint | Parámetros OpenAPI | Archivo spec | Interface params |
|---|---|---|---|
| `GET /api/metrics/facets` | *(ninguno)* | `README.md` Funcionalidad 1 | — |
| `GET /api/metrics/alerts` | `threshold` (number, opt, default=0.3), `group_by` (string, opt, default="month"), `start_date`, `end_date`, `business_type` | `param-types.ts` | `AlertsParams` |
| `GET /api/metrics/categories/top` | `operation_type` (string, opt, default="outcome"), `limit` (int, opt, default=5), `start_date`, `end_date`, `business_type` | `param-types.ts` | `TopCategoriesParams` |
| `GET /api/metrics/comparison` | `start_date` (string, **required**), `end_date` (string, **required**), `business_type` (opt) | `README.md` Funcionalidad 3 | `DateRangeFilter & { business_type }` |

---

## Evidencia runtime (curl)

Verificado el 2026-11-07 contra `localhost:8000`:

### `GET /api/metrics/facets`
```json
{
    "operation_types": ["income", "outcome"],
    "business_types": ["B2B", "B2C"],
    "categories": ["administrative", "operational", "others", "sales", "suppliers"],
    "min_date": "2025-11-01",
    "max_date": "2026-10-28"
}
```

### `GET /api/metrics/alerts?threshold=0.5`
```json
[
    {
        "period": "2025-12",
        "outcome_total": 103378.98,
        "baseline_average": 41404.44,
        "increase_ratio": 1.4968
    }
]
```

### `GET /api/metrics/categories/top?operation_type=outcome&limit=3`
```json
[
    {
        "category": "others",
        "operation_type": "outcome",
        "total_amount": 224428.44
    }
]
```

### `GET /api/metrics/comparison?start_date=2026-10-01&end_date=2026-10-31`
```json
{
    "current_period": 45965.92,
    "previous_period": -9371.66,
    "delta_abs": 55337.58,
    "delta_pct": 590.48
}
```

---

## Nombres NO inventados

Ningún nombre de campo en `api-types.ts`, `param-types.ts`, `components.md` o `README.md` fue inventado. Todos provienen de:

- `openapi.json` → nombres de propiedad en los schemas Pydantic del backend
- Runtime → verificación con curl de que los nombres coinciden con la respuesta real
- `/docs` (Swagger UI) → confirmación visual de schemas y endpoints

Los únicos nombres que no están en OpenAPI son los **props de componentes React** (ej. `data`, `loading`, `onChange`, `b2bData`, `comparisonData`), que son nombres de interfaz del frontend, no de la API.
