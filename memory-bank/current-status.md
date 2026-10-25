# Current Status

> Estado del proyecto basado exclusivamente en el código y configuraciones presentes en el repositorio a fecha de este documento. Sin roadmaps ni compromisos futuros no verificables.

## Timeline

- **Último commit registrado**: `implementarrule` (contiene reglas de `.agents/rules/` + refactor de código)
- **Commits anteriores**: `derivarhallazgos` (reglas iniciales)
- No hay tags, releases, ni changelog formal.

## ✅ Lo que funciona

### Backend (FastAPI) — 15 tests pasando

| Componente | Estado | Detalle |
|---|---|---|
| 9 endpoints REST | ✅ Operativos | health, metrics, facets, summary, categories/top, comparison, alerts, b2b (deprecated), b2c (deprecated) |
| Generación de datos mock | ✅ Determinista | 360 movimientos, `random.Random(42)`, cacheado con `@lru_cache(maxsize=1)` |
| Filtros por fecha | ✅ | `filter_movements_by_date()` con soporte de inclusión de bordes |
| Filtros por categoría / tipo | ✅ | Parámetros `Query` opcionales en endpoints |
| CORS configurable | ✅ | Variable `CORS_ORIGINS`, default `http://localhost:5173` |
| Documentación Swagger | ✅ | `/docs` generado por FastAPI automáticamente |
| Depuración remota | ✅ | debugpy en puerto 5678 |

### Frontend (React + Vite) — 5 tests pasando + tsc + eslint

| Componente | Estado | Detalle |
|---|---|---|
| KPIs (4 tarjetas) | ✅ | `KPIRow` renderiza `KpiCard` para cada métrica |
| Gráfico Income vs Outcome | ✅ | Líneas dobles con recharts |
| Gráfico Profit Margin % | ✅ | Línea + `ReferenceLine` en 0% |
| Período dinámico | ✅ | `computePeriodLabel()` desde fechas de movimientos |
| Tema oscuro | ✅ | Clase `dark` en `<main>`, variables Oklch en `index.css` |
| Estados loading/error | ✅ | `Skeleton` + mensaje de error con clase `destructive` |
| Alias `@/` | ✅ | Resuelto por Vite + tsconfig |

### Infraestructura

| Componente | Estado | Detalle |
|---|---|---|
| Docker Compose | ✅ | `docker compose up --build` funcional |
| `.dockerignore` (backend + frontend) | ✅ | Excluye cachés, node_modules, .git |
| CI/CD (GitHub Actions) | ✅ | Tests + lint en push/PR a main |
| Linter (ruff) | ✅ | Configurado en `pyproject.toml` |
| Type checker (mypy) | ✅ | strict=true en `pyproject.toml` |
| Variables de entorno documentadas | ✅ | `frontend/.env.example` |
| `verification.md` actualizado | ✅ | 25 afirmaciones verificadas contra el código |

## ⚠️ Gaps conocidos (inferidos por ausencia en el código)

Estos no son bugs — son limitaciones del alcance actual del proyecto, verificables porque **no existe código que los implemente**:

| Gap | Detalle | Impacto |
|---|---|---|
| **Sin autenticación** | No hay login, tokens, ni middlewares de auth | Cualquier persona con acceso a la red puede consumir la API |
| **Sin base de datos** | Todo es en memoria (datos mock) | No persiste información entre reinicios del contenedor |
| **Sin datos reales** | Fuente única: `generate_mock_movements()` | No apto para uso productivo sin conectar una fuente real |
| **Sin pruebas de frontend para componentes** | Solo hay tests para `financial-utils.ts` (unitarios) | Los componentes visuales (KPIRow, charts) no tienen tests de renderizado |
| **Sin paginación** | Endpoints devuelven listas completas | Conjuntos grandes de datos degradarían rendimiento |
| **Sin WebSockets** | Todo es polling HTTP | No hay actualizaciones en tiempo real |
| **Sin rate limiting** | No hay protección contra uso excesivo | Vulnerable a abuso en producción |
| **Sin tests de integración** | Los tests backend usan datos mock generados inline | No se prueba contra datos reales ni contenedores |

## 🔍 Próximas prioridades (basadas en reglas existentes y gaps)

> Estas prioridades se derivan de las reglas documentadas en `.agents/rules/` y de los gaps identificados arriba. No son compromisos de producto.

| Prioridad | Origen | Descripción |
|---|---|---|
| **Unificar b2b/b2c** | `Regla 21` — Endpoints ya están marcados `deprecated=True` | Migrar lógica B2B/B2C a los filtros de `/api/metrics` y eliminar rutas duplicadas |
| **Conectar datos reales** | Gap identificado + `Regla 04` (Pydantic models) | Reemplazar `generate_mock_movements()` por fuente externa respetando los modelos existentes |
| **Tests de componentes** | Gap identificado | Agregar tests de renderizado para KPIRow, charts, header con `vitest` + `@testing-library/react` |
| **Rate limiting** | Gap identificado | Agregar middleware de rate limiting (slowapi o similar) antes de producción |
| **Cobertura de mypy** | `Regla 25` | Resolver errores de tipo estrictos reportados por mypy (actualmente `strict=true`) |

## 📊 Métricas del repositorio

| Métrica | Valor | Cómo se obtiene |
|---|---|---|
| Tests backend | 15/15 pasando | `pytest -v` |
| Tests frontend | 5/5 pasando | `vitest run` |
| Endpoints API | 9 (2 deprecados) | `backend/app/routes.py` |
| Archivos Python | 4 (app + tests) | `find backend -name '*.py'` (excluyendo `__pycache__`) |
| Archivos TypeScript/TSX | ~12 fuentes | `find frontend/src -name '*.ts' -o -name '*.tsx'` |
| Archivos de reglas | 25 + INDEX.md | `.agents/rules/` |
| Cobertura de tests backend | ~88-95% (reportada por pytest-cov) | `pytest --cov=app` |
| Cobertura de tests frontend | Solo unitarios (utils) | No hay métrica de cobertura configurada para vitest |

> **Nota**: Las métricas de cobertura son estimaciones basadas en la salida de herramientas. No se ha configurado un umbral mínimo de cobertura en CI.