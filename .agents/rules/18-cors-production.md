# Restringir CORS en producción

## Alcance
`backend/app/main.py` línea 7:
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## Justificación
`allow_origins=["*"]` permite que cualquier origen (dominio) haga peticiones al backend. Esto es:
- **Aceptable en desarrollo local** con Vite proxy (el frontend se sirve desde el mismo origen gracias al proxy).
- **Un riesgo de seguridad en producción**: cualquier sitio web externo puede hacer peticiones a la API y leer los datos financieros mock. Aunque los datos son simulados, la configuración laxa puede ser explotada en ataques CSRF o de exfiltración.

## Guía específica
- En desarrollo local no hace falta cambiar nada porque Vite proxy elimina la necesidad de CORS.
- Para un despliegue público, reemplazar `allow_origins=["*"]` con los orígenes específicos:
  ```python
  allow_origins=[
      "http://localhost:5173",              # desarrollo local
      "https://midominio.com",              # producción
      "https://www.midominio.com",
  ]
  ```
- Si se usa Docker Compose en un entorno controlado, se puede leer de una variable de entorno:
  ```python
  import os
  allow_origins=os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",")
  ```
- No permitir `allow_origins=["*"]` junto con `allow_credentials=True` en producción (es inválido según la especificación CORS: con credenciales, `*` no está permitido).