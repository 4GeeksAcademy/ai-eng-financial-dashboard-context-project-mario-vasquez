# Especificaciones del Frontend — Financial Dashboard

Este directorio contiene todos los archivos de especificación del frontend.
Cada archivo describe un aspecto concreto del sistema, incluyendo tipos,
componentes, utilidades, estados UX, y la API del backend que se consume.

## Índice de archivos

| Archivo | Propósito |
|---|---|
| `types-spec.md` | Modelos de datos compartidos (`FinancialMovement`, `KPIMetrics`, `MonthlyDataPoint`) |
| `api-spec.md` | Endpoints REST del backend verificados contra `/docs` y OpenAPI real |
| `schemas-spec.md` | Schemas compartidos (modelos Pydantic ↔ tipos TypeScript) |
| `components-spec.md` | Componentes React y jerarquía de composición |
| `utils-spec.md` | Funciones utilitarias (`computeKPIs`, `computeMonthlyData`, formateo) |
| `ux-states-spec.md` | Estados de experiencia de usuario (loading, error, empty, data) |
| `ux-behavior-spec.md` | Comportamientos e interacciones del dashboard |

## Convenciones

- Todos los archivos están escritos en **Markdown**.
- Las especificaciones se basan únicamente en el código fuente del repositorio.
- Cada afirmación incluye la referencia al archivo de código que la respalda.
- No incluyen roadmaps, promesas de producto ni funcionalidades no implementadas.
