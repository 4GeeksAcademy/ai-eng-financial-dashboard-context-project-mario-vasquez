# Technology Stack

> Cada afirmación incluye la ruta al archivo donde se verifica. Sin especulación.

## Lenguajes

| Lenguaje | Versión | Dónde se declara |
|---|---|---|
| **Python** | 3.13 | `backend/Dockerfile`: `FROM python:3.13-slim` |
| **TypeScript** | ~6.0.2 | `frontend/package.json`: `"typescript": "~6.0.2"` |
| **Node.js** | 24 (Alpine) | `frontend/Dockerfile`: `FROM node:24-alpine` |
| **HTML** | — | `frontend/index.html` |
| **CSS** | — | `frontend/src/index.css` |

## Frameworks y librerías — Backend

| Componente | Tecnología | Versión / Config | Evidencia |
|---|---|---|---|
| Framework web | **FastAPI** | En `requirements.txt` | `backend/app/main.py`: `FastAPI(title="Financial Metrics API")` |
| Servidor ASGI | **Uvicorn** | `uvicorn[standard]` | `backend/requirements.txt` |
| Depuración remota | **debugpy** | — | `backend/Dockerfile` CMD: `python -m debugpy --listen 0.0.0.0:5678` |
| Validación de datos | **Pydantic** (incluido con FastAPI) | `BaseModel`, `Field` | `backend/app/routes.py`: 6 modelos (`FinancialMovement`, `MetricsFacets`, etc.) |
| Cliente HTTP para tests | **httpx** | — | `backend/requirements.txt`; usado por `fastapi.testclient.TestClient` |
| Testing | **pytest** + pytest-cov | `pyproject.toml` `[tool.pytest.ini_options]` | `backend/tests/test_routes.py` (15 tests) |
| Linter | **ruff** | line-length=100, target-version=py313 | `backend/pyproject.toml` `[tool.ruff]` |
| Type checker | **mypy** | strict=true, python_version=3.13 | `backend/pyproject.toml` `[tool.mypy]` |

## Frameworks y librerías — Frontend

| Componente | Tecnología | Versión | Evidencia |
|---|---|---|---|
| UI Framework | **React** | ^19.2.4 | `frontend/package.json` |
| Bundler / dev server | **Vite** | ^8.0.4 | `frontend/package.json`, `frontend/vite.config.ts` |
| CSS Framework | **Tailwind CSS** | ^4.2.2 | `frontend/package.json`, `frontend/src/index.css`: `@import "tailwindcss"` |
| Gráficos | **Recharts** | ^3.8.1 | `frontend/package.json`; usado en `income-outcome-chart.tsx` y `profit-percent-chart.tsx` |
| Iconos | **lucide-react** | ^1.8.0 | `frontend/package.json` |
| Utilidades CSS | **clsx** + **tailwind-merge** + **class-variance-authority** | — | `frontend/package.json`; función `cn()` en `frontend/src/lib/utils.ts` |
| Testing | **Vitest** | ^4.1.4 | `frontend/package.json`; `frontend/src/lib/financial-utils.test.ts` (5 tests) |
| Linter | **ESLint** 9 + typescript-eslint | ^9.39.4 | `frontend/package.json`, `frontend/eslint.config.js` |
| TypeScript plugin | **@vitejs/plugin-react** | ^6.0.1 | `frontend/package.json` |
| Tailwind Vite plugin | **@tailwindcss/vite** | ^4.2.2 | `frontend/package.json` |

## Infraestructura y tooling

| Componente | Detalle | Evidencia |
|---|---|---|
| Contenedores | **Docker Compose** (2 servicios) | `docker-compose.yml` |
| Imagen backend | `python:3.13-slim` | `backend/Dockerfile` |
| Imagen frontend | `node:24-alpine` (build + serve con Vite) | `frontend/Dockerfile` |
| CI/CD | **GitHub Actions** (push/PR a main) | `.github/workflows/test.yml` |
| Gestor de paquetes Python | **pip** | `backend/requirements.txt` |
| Gestor de paquetes Node | **npm** | `frontend/package.json` `"scripts"` |
| Variables de entorno | `CORS_ORIGINS`, `VITE_API_BASE_URL` | `backend/app/main.py`, `frontend/src/App.tsx`, `frontend/.env.example` |

## Dependencias clave — Backend

```
fastapi, uvicorn[standard], debugpy          # Runtime
pytest, pytest-cov, httpx                     # Testing
ruff, mypy                                    # Linting / type-checking
```

**Evidencia**: `backend/requirements.txt`

## Dependencias clave — Frontend

```
react, react-dom                              # UI runtime
recharts                                      # Charts
lucide-react                                  # Icons
clsx, tailwind-merge, class-variance-authority # CSS utilities
tailwindcss, @tailwindcss/vite                # CSS framework
vite, @vitejs/plugin-react, typescript        # Build toolchain
vitest, @vitest/coverage-v8                   # Testing
eslint, typescript-eslint                     # Linting
```

**Evidencia**: `frontend/package.json`

## Estructura de directorios

```ascii
.
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py           # FastAPI app + CORS middleware
│   │   └── routes.py         # 9 endpoints + mock data generation
│   ├── tests/
│   │   ├── conftest.py       # Config limpia (sin sys.path)
│   │   └── test_routes.py    # 15 tests con TestClient
│   ├── Dockerfile
│   ├── pyproject.toml        # pytest + ruff + mypy config
│   ├── requirements.txt
│   └── .dockerignore
├── frontend/
│   ├── src/
│   │   ├── main.tsx          # Entry point React
│   │   ├── App.tsx           # Componente principal con fetching
│   │   ├── index.css         # Variables Oklch + Tailwind
│   │   ├── components/
│   │   │   ├── dashboard/    # Header, KPIRow, KpiCard, charts
│   │   │   └── ui/           # Card, Skeleton (shadcn/ui)
│   │   └── lib/
│   │       ├── financial-types.ts     # Tipos compartidos
│   │       ├── financial-utils.ts     # computeKPIs, computeMonthlyData
│   │       ├── financial-utils.test.ts # 5 tests vitest
│   │       └── utils.ts               # cn() helper
│   ├── Dockerfile
│   ├── package.json
│   ├── vite.config.ts
│   └── .dockerignore
├── .github/workflows/test.yml  # CI/CD
├── docker-compose.yml
└── verification.md              # Matriz de verificación (25 filas)
```

## Convenciones y patrones del código (verificados en archivos reales)

- **Alias `@/`** para imports del frontend → `frontend/vite.config.ts` + `frontend/tsconfig.app.json`
- **`from __future__ import annotations`** en todos los `.py` → 4 archivos verificados
- **Colores Oklch** con doble capa de variables CSS → `frontend/src/index.css`
- **Patrón `variantStyles`** con `Record<K, V>` → `kpi-card.tsx`
- **`cn()` function** → `frontend/src/lib/utils.ts`, usada en todos los componentes UI
- **No hay `sys.path`** en conftest → usa `pyproject.toml` `pythonpath = ["."]`
- **Instancia local `random.Random(42)`** en lugar de `random.seed()` global