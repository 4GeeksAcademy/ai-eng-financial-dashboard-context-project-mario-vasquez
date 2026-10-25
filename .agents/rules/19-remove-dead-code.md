# Eliminar o conectar código no utilizado (`mock-data.ts`)

## Alcance
`frontend/src/lib/mock-data.ts` — exporta `mockMovements: FinancialMovement[]` con ~40 movimientos estáticos. **Ningún archivo lo importa**.

## Justificación
El archivo `mock-data.ts` contiene ~80 líneas con datos financieros estáticos de ejemplo, pero:
- `App.tsx` siempre obtiene datos de la API: `fetch("${API_BASE_URL}/api/metrics")`.
- Ningún otro archivo importa `mockMovements`.
- Si los datos se desactualizan respecto a la estructura de `FinancialMovement`, nadie lo notará.
- Es código muerto que aumenta la superficie de mantenimiento sin aportar valor.

## Guía específica
- **Opción A (recomendada)**: Eliminar el archivo.
  ```bash
  rm frontend/src/lib/mock-data.ts
  ```
  Es la opción más limpia. Si alguien necesita datos mock para tests, que los defina en el propio archivo de test (como ya hace `financial-utils.test.ts`).
- **Opción B**: Conectarlo como fallback offline en `App.tsx`:
  ```typescript
  import { mockMovements } from '@/lib/mock-data'

  async function fetchFinancialData(): Promise<FinancialMovement[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/metrics`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response.json();
    } catch {
      return mockMovements; // fallback
    }
  }
  ```
  Si se elige esta opción, mantener los datos sincronizados con la estructura de `FinancialMovement`.
- **Opción C**: Migrar a un archivo de fixtures de test y eliminar del source principal.