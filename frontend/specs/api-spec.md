# Especificación de la API — Endpoints REST del Backend

> **Fuente**: `backend/app/routes.py` y `backend/app/main.py`
> 
> **Verificado contra**: `http://localhost:8000/docs` (OpenAPI 3.0) y llamadas reales a cada endpoint (2026-11-07)

## Tabla de todos los endpoints

| # | Endpoint | Método | Descripción | Funcionalidad | Deprecado |
|---|---|---|---|---|---|
| 1 | `/api/metrics` | GET | Movimientos financieros (crudos) | Obtención de datos | No |
| 2 | `/api/metrics/facets` | GET | Facetas disponibles (tipos, categorías, rango de fechas) | Obtención de datos | No |
| 3 | `/api/metrics/summary` | GET | Resumen agrupado por día/semana/mes | Agrupación y filtros | No |
| 4 | `/api/metrics/categories/top` | GET | Categorías principales por tipo de operación | Análisis — Top categorías | No |
| 5 | `/api/metrics/comparison` | GET | Comparación neta entre dos periodos | Análisis — Comparación | No |
| 6 | `/api/metrics/alerts` | GET | Alertas cuando outcome supera un umbral | Análisis — Alertas | No |
| 7 | `/api/metrics/b2b` | GET | Movimientos filtrados a B2B | Filtro de negocio | Sí |
| 8 | `/api/metrics/b2c` | GET | Movimientos filtrados a B2C | Filtro de negocio | Sí |
| 9 | `/health` | GET | Health check (devuelve `{"status": "ok"}`) | Utilidad | No |

## Funcionalidad 1 — Endpoint principal: `GET /api/metrics`

Devuelve todos los movimientos financieros simulados (crudos, sin agregar).

- **Response**: `list[FinancialMovement]`
- **Generación**: 360 movimientos (12 meses × 30 días) con semilla fija `seed=42` usando `random.Random(42)`
- **Cache**: `@lru_cache(maxsize=1)` — no se regenera en cada petición
- **Consumido por**: `frontend/src/App.tsx` (único endpoint que el frontend consume actualmente)

#### Ejemplo de respuesta real (1 movimiento)

```json
{
  "create_date": "2025-11-01",
  "amount": 5465.56,
  "operation_type": "income",
  "category": "sales",
  "business_type": "B2C"
}
```

#### Parámetros query opcionales (aunque el frontend no los usa)

| Parámetro | Tipo | Descripción |
|---|---|---|
| `start_date` | `date` (ISO) | Filtro desde fecha |
| `end_date` | `date` (ISO) | Filtro hasta fecha |
| `category` | `enum` | `suppliers`, `sales`, `operational`, `administrative`, `others` |
| `operation_type` | `enum` | `income`, `outcome` |

---

## Funcionalidad 2 — Agrupación y filtros

### `GET /api/metrics/facets`

Devuelve los valores disponibles para cada faceta y el rango de fechas.

- **Response**: `MetricsFacets`
- **Sin parámetros**
- **NO consumido por el frontend actual**

#### Ejemplo de respuesta real

```json
{
  "operation_types": ["income", "outcome"],
  "business_types": ["B2B", "B2C"],
  "categories": ["administrative", "operational", "others", "sales", "suppliers"],
  "min_date": "2025-11-01",
  "max_date": "2026-10-28"
}
```

### `GET /api/metrics/summary`

Resumen agregado por período (día, semana o mes), con múltiples filtros.

- **Response**: `list[MetricsSummaryItem]`
- **NO consumido por el frontend actual**

#### Parámetros

| Parámetro | Tipo | Default | Descripción |
|---|---|---|---|
| `group_by` | `enum` | `"month"` | `day`, `week`, `month` |
| `start_date` | `date` | `null` | Inicio del rango |
| `end_date` | `date` | `null` | Fin del rango |
| `category` | `enum` | `null` | Categoría específica |
| `operation_type` | `enum` | `null` | `income` o `outcome` |
| `business_type` | `enum` | `null` | `B2B` o `B2C` |

#### Ejemplos reales

**Agrupación mensual (por defecto)** — 12 períodos:
```json
{"period": "2025-11", "income": 111026.81, "outcome": 41404.44, "net": 69622.37}
{"period": "2025-12", "income": 68361.45, "outcome": 103378.98, "net": -35017.53}
```

**Agrupación semanal** — ~53 períodos:
```json
{"period": "2025-W44", "income": 10725.67, "outcome": 5478.37, "net": 5247.30}
```

**Filtros combinados** (B2B, income, Jun-Ago 2026):
```json
{"period": "2026-06", "income": 37650.80, "outcome": 0.0, "net": 37650.80}
```

---

## Funcionalidad 3 — Análisis (Top categorías, Comparación, Alertas)

### `GET /api/metrics/categories/top`

Devuelve las categorías con mayor acumulado para un tipo de operación.

- **Response**: `list[TopCategoryItem]`
- **NO consumido por el frontend actual**

#### Parámetros

| Parámetro | Tipo | Default | Descripción |
|---|---|---|---|
| `operation_type` | `enum` | `"outcome"` | `income` o `outcome` |
| `limit` | `int` (1-20) | `5` | Número máximo de categorías |
| `start_date` | `date` | `null` | Inicio del rango |
| `end_date` | `date` | `null` | Fin del rango |
| `business_type` | `enum` | `null` | `B2B` o `B2C` |

#### Lógica de negocio

`build_top_categories()` (línea 205):
1. Para cada movimiento del tipo especificado, suma `amount` por categoría
2. Ordena descendente por total acumulado
3. Retorna las primeras `limit` categorías

#### Ejemplos reales

**Top 3 egresos por categoría**:
```json
[
  {"category": "others", "operation_type": "outcome", "total_amount": 224428.44},
  {"category": "operational", "operation_type": "outcome", "total_amount": 196093.22},
  {"category": "administrative", "operation_type": "outcome", "total_amount": 188143.37}
]
```

**Top ingresos** (solo 2 categorías con income):
```json
[
  {"category": "sales", "operation_type": "income", "total_amount": 1132097.38},
  {"category": "others", "operation_type": "income", "total_amount": 126049.49}
]
```

### `GET /api/metrics/comparison`

Compara el valor neto de un período actual vs el período anterior de la misma duración.

- **Response**: `MetricsComparison`
- **NO consumido por el frontend actual**

#### Parámetros

| Parámetro | Tipo | Requerido | Descripción |
|---|---|---|---|
| `start_date` | `date` | **Sí** | Inicio del período actual |
| `end_date` | `date` | **Sí** | Fin del período actual |
| `business_type` | `enum` | `null` | `B2B` o `B2C` |

#### Lógica de negocio

`get_metrics_comparison()` y `calculate_net_value()` (líneas 232-259):

1. Calcula `net = income - outcome` para el período actual (`start_date` a `end_date`)
2. Calcula la duración en días: `duration = end_date - start_date`
3. Calcula el período anterior: `previous_end = start_date - 1 día`, `previous_start = previous_end - duration`
4. Calcula el neto del período anterior
5. `delta_abs = current_net - previous_net`
6. `delta_pct = (delta_abs / abs(previous_net)) * 100` si `previous_net ≠ 0`, sino `null`

#### Ejemplo real

Octubre 2026 vs período anterior (Septiembre 2026):
```json
{
  "current_period": 45965.92,
  "previous_period": -1041.78,
  "delta_abs": 47007.70,
  "delta_pct": 4512.25
}
```

### `GET /api/metrics/alerts`

Detecta períodos donde el outcome supera un umbral sobre el promedio histórico.

- **Response**: `list[MetricsAlert]`
- **NO consumido por el frontend actual**

#### Parámetros

| Parámetro | Tipo | Default | Descripción |
|---|---|---|---|
| `threshold` | `float` (≥0) | `0.3` | Umbral de aumento sobre el promedio (30%) |
| `group_by` | `enum` | `"month"` | `day`, `week`, `month` |
| `start_date` | `date` | `null` | Inicio del rango |
| `end_date` | `date` | `null` | Fin del rango |
| `business_type` | `enum` | `null` | `B2B` o `B2C` |

#### Lógica de negocio

`detect_outcome_alerts()` (líneas 223-244):

1. Itera sobre cada período del resumen cronológicamente
2. Para cada período, calcula el promedio (`baseline`) de outcomes de todos los períodos anteriores
3. Calcula `increase_ratio = (outcome_actual - baseline) / baseline`
4. Si `increase_ratio > threshold`, genera una alerta
5. El primer período nunca genera alerta (no hay historial)

#### Ejemplo real (threshold=0.3 por defecto)

```json
[
  {
    "period": "2025-12",
    "outcome_total": 103378.98,
    "baseline_average": 41404.44,
    "increase_ratio": 1.4968
  },
  {
    "period": "2026-03",
    "outcome_total": 88076.90,
    "baseline_average": 55334.29,
    "increase_ratio": 0.5917
  }
]
```

---

## Endpoints deprecados

### `GET /api/metrics/b2b` y `GET /api/metrics/b2c`

- Marcados con `deprecated=True` en el decorador de FastAPI
- Aparecen tachados en Swagger UI
- Filtran por `business_type` pero esta funcionalidad está disponible en los endpoints no-deprecados via parámetro `business_type`
- **NO consumidos por el frontend actual**

---

## Modelos de datos (response schemas)

| Schema | Campos | Descripción |
|---|---|---|
| `FinancialMovement` | `create_date: date`, `amount: float`, `operation_type`, `category`, `business_type` | Movimiento individual |
| `MetricsFacets` | `operation_types`, `business_types`, `categories`, `min_date`, `max_date` | Facetas disponibles |
| `MetricsSummaryItem` | `period: str`, `income: float`, `outcome: float`, `net: float` | Resumen agregado |
| `TopCategoryItem` | `category`, `operation_type`, `total_amount: float` | Categoría con total |
| `MetricsComparison` | `current_period: float`, `previous_period: float`, `delta_abs: float`, `delta_pct: float\|null` | Comparación entre periodos |
| `MetricsAlert` | `period: str`, `outcome_total: float`, `baseline_average: float`, `increase_ratio: float` | Alerta de gasto excesivo |

## Contraste con patrón de fetch existente en el frontend

### Patrón actual (único punto de referencia)

El frontend usa únicamente **`fetch` nativo** con `async/await` en `App.tsx`. No hay librerías HTTP (axios, ky, etc.) ni clientes con estado (TanStack Query, SWR, RTK Query, Apollo).

| Aspecto | Patrón actual en `App.tsx` |
|---|---|
| **Librería HTTP** | `fetch` nativo del navegador |
| **URL base** | `const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? ""` |
| **Proxy** | Vite proxy: `/api` → `http://backend:8000` (entorno dev) |
| **Manejo de errores** | `if (!response.ok) throw new Error(...)` + `.catch()` con mensaje hardcodeado |
| **Tipo de retorno** | `Promise<FinancialMovement[]>` anotado manualmente |
| **Almacenamiento** | `useState` (componente principal), sin caché externa |
| **Frecuencia** | Una llamada al montar (`useEffect` con `[]`) |
| **Loading** | `useState(true)` → `loading=false` en `.finally()` |
| **Ciclo de vida** | `useEffect` con dependencias vacías = fetch único |

**Evidencia**: `frontend/src/App.tsx:11-48`, `frontend/vite.config.ts:8-13`

### Implicaciones para nuevos endpoints

Si se integraran los endpoints de análisis (facets, summary, categories/top, comparison, alerts), el patrón actual sugiere:

1. **Misma función `fetch` nativa** — mantener consistencia sin agregar librerías
2. **Misma URL base** — `VITE_API_BASE_URL` reutilizada
3. **Mismo manejo de errores** — `if (!response.ok) throw new Error(...)`
4. **Mismo patrón de estados** — `useState` para data/loading/error por endpoint o grupo de datos
5. **Posible refactor** — crear un helper `apiFetch<T>(path, params?)` que centralice:
   - Construcción de URL con `API_BASE_URL`
   - Query params opcionales
   - Validación de `response.ok`
   - Tipado genérico `Promise<T>`

### Cobertura de endpoints vs componentes actuales

| Endpoint | ¿Consumido? | ¿Dónde? | Componente asociado |
|---|---|---|---|
| `GET /api/metrics` | ✅ Sí | `App.tsx:16` | KPIRow, IncomeOutcomeChart, ProfitPercentChart |
| `GET /api/metrics/facets` | ❌ No | — | — |
| `GET /api/metrics/summary` | ❌ No | — | (lógica equivalente en `computeMonthlyData()`) |
| `GET /api/metrics/categories/top` | ❌ No | — | — |
| `GET /api/metrics/comparison` | ❌ No | — | — |
| `GET /api/metrics/alerts` | ❌ No | — | — |

## Configuración de red

- **Proxy Vite**: `frontend/vite.config.ts` configura proxy de `/api` → `http://backend:8000`
- **CORS**: `backend/app/main.py` — `CORS_ORIGINS` por defecto `http://localhost:5173`
- **URL base**: `frontend/src/App.tsx` línea 11 — `import.meta.env.VITE_API_BASE_URL ?? ""` (vacío = mismo origen / proxy)

## Referencias

| Aspecto | Archivo | Líneas |
|---|---|---|
| Definición de rutas | `backend/app/routes.py` | Rutas con decoradores `@router.get` |
| Lógica de build_top_categories | `backend/app/routes.py` | `build_top_categories()` — línea 205 |
| Lógica de calculate_net_value | `backend/app/routes.py` | `calculate_net_value()` — línea 218 |
| Lógica de detect_outcome_alerts | `backend/app/routes.py` | `detect_outcome_alerts()` — línea 223 |
| Patrón fetch frontend | `frontend/src/App.tsx` | Líneas 11-18, 30-48 |
| Proxy Vite | `frontend/vite.config.ts` | Líneas 8-13 |
| Configuración CORS | `backend/app/main.py` | Líneas 10-16 |
| Sin librerías HTTP externas | `frontend/package.json` | Sin dependencias `axios`, `@tanstack/react-query`, `swr`, `ky` |

#### ⚠️ Desajuste con el PM: Filtro `business_type` ausente en `GET /api/metrics`

| Fuente | Afirmación | Realidad |
|---|---|---|
| `product-overview.md` | "Filtros por fecha, categoría, tipo de operación, **tipo de negocio**" | El endpoint `GET /api/metrics` **NO acepta** parámetro `business_type`. Solo tiene `start_date`, `end_date`, `category`, `operation_type`. |
| `backend/app/routes.py` (line 275) | Firma: `def get_metrics(...)` | No declara `business_type: BusinessType \| None = Query(default=None)`. |
| Verificación real | `curl /api/metrics?business_type=B2B` | Devuelve 360 items sin filtrar (el backend ignora el parámetro desconocido). |

El filtro `business_type` **sí existe** en otros endpoints:
- `GET /api/metrics/summary` ✅ (line 295)
- `GET /api/metrics/categories/top` ✅ (line 310)
- `GET /api/metrics/comparison` ✅ (line 321)
- `GET /api/metrics/alerts` ✅ (line 345)

**Decisión en la spec**: Documentar que si en el futuro se quiere filtrar por `business_type` desde el frontend, se debe usar el endpoint `/api/metrics/summary` (que sí lo soporta) en lugar de `/api/metrics`, o bien agregar el parámetro faltante al endpoint principal.
