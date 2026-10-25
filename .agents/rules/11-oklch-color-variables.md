# Definir colores en espacio Oklch con doble capa de variables CSS

## Alcance
`frontend/src/index.css`:
- Capa 1 (semántica, líneas ~6-75): `--primary: oklch(0.55 0.2 255)`, etc.
- Capa 2 (compatibilidad Tailwind, líneas ~81+): `--color-primary: var(--primary)`, etc.

## Justificación
Tailwind CSS v4 usa internamente variables con prefijo `--color-*`. El proyecto define colores en dos capas:
1. **Variables semánticas** (`--primary`, `--card`, `--income-badge`) con nombres legibles y valores en espacio Oklch (moderno, más perceptualmente uniforme que HSL).
2. **Alias `--color-*`** que referencian a las variables semánticas, necesarios para que Tailwind v4 pueda aplicar sus utilidades (`bg-primary`, `text-card`, etc.).

Además define variantes `:root` (tema claro) y `.dark` (tema oscuro) para los mismos nombres de variable.

## Guía específica
- Para añadir un nuevo color:
  1. Definir la variable semántica en `:root` y en `.dark` con valores Oklch:
     ```css
     :root {
       --mi-color: oklch(L C H);
     }
     .dark {
       --mi-color: oklch(L' C' H');
     }
     ```
  2. Crear el alias para Tailwind:
     ```css
     --color-mi-color: var(--mi-color);
     ```
- Usar `oklch(L C H)` donde `L` (0-1 luminosidad), `C` (0-~0.5 croma), `H` (0-360 tono). Herramienta útil: https://oklch.com.
- No añadir colores en hexadecimal, RGB, HSL u Oklab dentro de `index.css`. Todo debe ser Oklch.
- Los colores de gráficos adicionales (`--chart-4`, `--chart-5`, etc.) pueden usarse para nuevas series sin modificar la estructura.