# Mantener `frontend/.env.example` con las variables de entorno documentadas

## Alcance
- `frontend/.env.example` **no existe**.
- El `.gitignore` raíz línea 9 permite trackear archivos `!.env.example`.
- La única variable de entorno del proyecto está en `frontend/src/App.tsx` línea 11:
  ```typescript
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";
  ```

## Justificación
El `.gitignore` explícitamente excluye `.env` pero incluye `!.env.example` como excepción, indicando que el proyecto **espera** que exista un archivo `.env.example` trackeado. Sin embargo, el archivo no se creó. Esto causa:
- Nuevos desarrolladores no saben qué variables de entorno pueden configurar.
- El README dice "copia `frontend/.env.example` a `.env`" pero el archivo no existe.
- La variable `VITE_API_BASE_URL` queda oculta para quien no lea el código fuente.

## Guía específica
- Crear `frontend/.env.example` con:
  ```env
  # URL base de la API de backend.
  # En desarrollo con Docker Compose, Vite proxy resuelve /api automáticamente,
  # por lo que esta variable puede dejarse vacía.
  # Si se apunta a un backend externo, descomentar y ajustar:
  # VITE_API_BASE_URL=http://localhost:8000
  ```
- Mantener este archivo sincronizado si se añaden nuevas variables de entorno (`VITE_*`).
- El archivo debe estar en git (el `.gitignore` ya tiene la excepción `!.env.example`).
- No incluir secretos reales en `.env.example`. Usar valores de ejemplo inocuos.