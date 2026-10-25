# Los agentes deben consultar `AGENTS.md` y los directorios de reglas antes de actuar

## Alcance
`AGENTS.md` (raíz del proyecto) — especifica la ubicación de rules, skills y memory-bank.

## Justificación
`AGENTS.md` establece el protocolo para agentes de IA que trabajen en el proyecto:
```
Agents working on this project must:
- Look for work instructions and rules in:  ./.agents/rules
- Look for available agent skills in:       ./.agents/skills
- Look for the project memory bank in:      ./memory-bank (if it exists)
```
Si un agente ignora estas instrucciones, puede violar convenciones del proyecto, reintroducir patrones riesgosos ya documentados, o duplicar trabajo.

## Guía específica
- **Siempre** que un agente comience a trabajar en este proyecto, debe:
  1. Leer `AGENTS.md`.
  2. Listar el contenido de `./.agents/rules/` y leer los archivos relevantes a la tarea.
  3. Listar el contenido de `./.agents/skills/` si existe.
  4. Verificar si `./memory-bank/` existe y leer su contenido.
- Si un archivo de reglas no existe para el tema de la tarea, el agente puede crearlo siguiendo el formato: nombre, alcance, justificación y guía específica.
- Las reglas no son estáticas: un agente puede proponer modificaciones si encuentra nueva evidencia en el código.
- Los skills en `./.agents/skills/` son opcionales: si no existen, el agente puede trabajar sin ellos.