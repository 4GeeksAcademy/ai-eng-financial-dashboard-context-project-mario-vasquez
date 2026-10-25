# El proxy de Vite es el único mecanismo de conexión frontend-backend

## Alcance
`frontend/vite.config.ts` líneas 9-13:
```typescript
proxy: {
  "/api": {
    target: "http://backend:8000",
    changeOrigin: true,
  },
},
```

## Justificación
Vite redirige todas las peticiones a `/api/*` hacia el backend (`http://backend:8000`). Esto:
- Elimina la necesidad de configurar CORS durante el desarrollo (el frontend se sirve desde el mismo origen via proxy).
- Permite que `API_BASE_URL` en `App.tsx` esté vacío por defecto (mismo origen).
- Es transparente para el navegador: las peticiones `fetch("/api/metrics")` funcionan como si fueran al mismo servidor.
- Evita tener que configurar variables de entorno en entornos locales y Codespaces.

## Guía específica
- No añadir configuración CORS adicional ni proxies extra en desarrollo.
- Si se necesita apuntar a un backend en un puerto/origen diferente, usar la variable de entorno `VITE_API_BASE_URL`.
- En producción, el proxy de Vite **no existe** (Vite es solo para desarrollo). Para producción:
  1. Usar un reverse proxy (Nginx, Caddy) que haga el mismo enrutamiento `/api → backend`.
  2. Configurar CORS correctamente en el backend si frontend y backend están en dominios distintos.
  3. O servir el frontend compilado (`vite build`) desde el propio backend (FastAPI + static files).
- No llamar a `http://backend:8000` directamente desde el frontend: ese hostname solo existe dentro de la red de Docker.