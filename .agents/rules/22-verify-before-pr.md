# Mantener `verification.md` actualizado antes de cada PR

## Alcance
`verification.md` — tabla de afirmaciones contrastadas contra el código del repositorio.

## Justificación
`verification.md` sirve como fuente de verdad del proyecto, con afirmaciones verificables que cualquier contribuidor o agente puede contrastar. Si el archivo se desactualiza:
- Nuevos contribuidores reciben información incorrecta.
- Agentes de IA toman decisiones basadas en datos obsoletos.
- Se pierde la trazabilidad entre lo que el proyecto dice hacer y lo que realmente hace.

## Guía específica
- Antes de cada PR, revisar `verification.md` y actualizar las filas afectadas por los cambios.
- Cada fila debe tener:
  - **Afirmación**: descripción clara y medible.
  - **Estado**: `✅` (verificado), `❌` (no se cumple), `❓` (no verificado).
  - **Evidencia**: archivo(s) y línea(s) concretas que la respaldan.
- Si se añade una funcionalidad nueva, añadir una nueva fila.
- Si se cambia una funcionalidad existente, actualizar la evidencia de la fila correspondiente.
- Si una funcionalidad se elimina, marcar la fila como `❌` con una nota explicativa.