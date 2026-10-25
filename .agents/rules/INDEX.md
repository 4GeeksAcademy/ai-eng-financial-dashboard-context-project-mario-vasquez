# Índice de Reglas del Proyecto

> **Financial Metrics Dashboard** — Reglas extraídas del análisis del código fuente,
> organizadas por categoría. Cada regla cita evidencia concreta (archivo:línea).

## 📐 Arquitectura (ARQ)

| #  | Regla | Archivo clave |
|----|-------|---------------|
| 01 | [Cachear datos mock del backend](01-data-mock-cache.md) | `routes.py` |
| 02 | [Instancia local de random.Random](02-random-local-instance.md) | `routes.py:96` |
| 03 | [No duplicar lógica de agregación](03-no-duplicate-aggregation.md) | `routes.py` ↔ `financial-utils.ts` |
| 18 | [Restringir CORS en producción](18-cors-production.md) | `main.py:7` |
| 21 | [Unificar endpoints b2b/b2c](21-unify-b2b-b2c-endpoints.md) | `routes.py:367-395` |
| 24 | [Proxy Vite es único mecanismo](24-vite-proxy-backend.md) | `vite.config.ts:9-13` |
| 25 | [from __future__ import annotations](25-python-anotations-future.md) | `routes.py:1` |

## 🏷️ Naming / Estilo (NAME)

| #  | Regla | Archivo clave |
|----|-------|---------------|
| 04 | [Usar modelos Pydantic con response_model](04-pydantic-models.md) | `routes.py:18-57` |
| 05 | [Literal types para conjuntos cerrados](05-literal-types.md) | `routes.py:11-15` |
| 07 | [Alias @/ para imports locales](07-alias-imports.md) | `vite.config.ts:16`, `tsconfig.app.json:10` |
| 08 | [Función cn() para clases CSS](08-cn-function-css.md) | `utils.ts` |
| 09 | [Patrón variantStyles](09-variant-styles-pattern.md) | `kpi-card.tsx:16-31` |
| 11 | [Colores Oklch con doble capa CSS](11-oklch-color-variables.md) | `index.css` |

## 🧪 Testing (TEST)

| #  | Regla | Archivo clave |
|----|-------|---------------|
| 06 | [No manipular sys.path en conftest.py](06-no-syspath-manipulation.md) | `conftest.py` |
| 12 | [Frameworks de testing](12-test-frameworks.md) | `test_routes.py`, `financial-utils.test.ts` |
| 13 | [Seed determinista en tests](13-deterministic-seed.md) | `test_routes.py:13` |

## 🎨 UI / UX

| #  | Regla | Archivo clave |
|----|-------|---------------|
| 10 | [Tres estados UX en componentes](10-three-state-ux.md) | `App.tsx`, `kpi-card.tsx`, charts |
| 20 | [Período dinámico en header](20-dynamic-period-header.md) | `App.tsx:37` |

## 🔧 Developer Experience (DX)

| #  | Regla | Archivo clave |
|----|-------|---------------|
| 14 | [Añadir .dockerignore](14-dockerignore.md) | — (no existe) |
| 15 | [Linter y type checker en backend](15-backend-linter.md) | `requirements.txt` |
| 16 | [Crear .env.example](16-env-example.md) | — (no existe) |
| 17 | [Añadir CI/CD](17-ci-cd-workflow.md) | — (no existe) |
| 19 | [Eliminar código muerto](19-remove-dead-code.md) | `mock-data.ts` |
| 22 | [Mantener verification.md actualizado](22-verify-before-pr.md) | `verification.md` |
| 23 | [Protocolo de bootstrap para agentes](23-agent-bootstrap.md) | `AGENTS.md` |

---

**Leyenda**: Cada regla enlaza a su archivo `.md` con nombre, alcance, justificación
y guía específica del proyecto.