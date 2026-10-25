# Usar `Literal` para conjuntos cerrados de valores

## Alcance
`backend/app/routes.py` líneas 11-15:
```python
OperationType = Literal["income", "outcome"]
Category = Literal["suppliers", "sales", "operational", "administrative", "others"]
BusinessType = Literal["B2B", "B2C"]
GroupBy = Literal["day", "week", "month"]
```

## Justificación
`Literal` de `typing` restringe un valor a un conjunto fijo de strings. Esto:
- Habilita autocompletado en el editor.
- Valida en runtime cuando se usa en modelos Pydantic (un valor inválido da error 422).
- Genera documentación OpenAPI precisa ( enum con los valores).
- Hace el código autodocumentado: cualquiera sabe de un vistazo los valores posibles.

## Guía específica
- Cualquier nuevo tipo con valores fijos y acotados debe definirse como `Literal`.
- Ejemplos de candidatos: `Currency`, `PaymentMethod`, `Region`, `Status`, `Priority`.
- No usar strings planos ni `Enum` a menos que se necesiten métodos adicionales. `Literal` es más liviano y se integra directamente con FastAPI/Pydantic.
- Definir los tipos al inicio de `routes.py`, después de los imports y antes de los modelos.