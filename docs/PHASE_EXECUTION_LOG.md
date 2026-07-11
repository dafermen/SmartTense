# Registro de ejecucion por fases - SmartTense

Fecha base: 11/07/2026.

## Fase actual

- **Fase activa:** Fase 8 - Expansion de unidades de tiempo (en curso).
- **Objetivo de la fase:** agregar una unidad nueva de tiempos y reforzar la navegacion mobile sin romper el core.
- **Estado:** en curso.

## Fase 8 (actual)

- **Estado operativo:** en curso.
- **Checkpoint de ejecucion (11/07/2026):**
  - Se incorporo la unidad `past-future-conditional-foundation` en `public/data/learningUnits.json`.
  - La unidad nueva incluye teoria, estructuras, errores, ejemplos, vocabulario y 5 ejercicios iniciales: fillBlank, transform, chooseTense, correctMistake, translation.
- **Checkpoint de integracion (12/07/2026):**
  - Se habilito el selector de unidad activa en Home para abrir Theory/Practice con la unidad seleccionada.
  - Se persiste la unidad activa en settings locales y se usa para progreso y recomendacion de ruta.
- **Checkpoint de mejora (13/07/2026):**
  - Se añadieron 2 ejercicios de transferencia de tiempos (chooseTense) en `past-future-conditional-foundation` para comparación entre futuros y condicionales.
  - Se añadieron prompts de speaking/writing alineados con la unidad de tiempos pasados/futuros/condicionales (`src/data/productionPrompts.js`).
- **Tareas puntuales:**
  - Diseñar nueva unidad en `public/data/learningUnits.json` (pasado/futuro/condicional). **completada**.
  - Integrar la unidad en Theory y Practice con contexto y filtros.
  - Mantener el flujo Home -> unidad -> teoria -> practica -> acciones de repaso.
  - Verificar rendimiento para listas largas: filtros, orden y paginacion.
- **Criterio de salida definido para cierre de fase:**
  - al menos una unidad adicional completa (teoria + practica + vocabulario contextual) visible en app.
  - `npm test` y `npm run build` verdes con la unidad activa.
  - flujo de Home/Path recomendado para la nueva unidad sin regresion.
  - evidencia de actualizacion documental (roadmap, log, guias).
- **Evidencia ejecutada hoy:**
  - `npm test` OK (48 pruebas, 0 fallos).
  - `npm run build` OK.
  - Validador de contenido y verbos conserva cobertura de escenarios negativos.
  - Home abre Theory/Practice con la unidad activa y Settings resume el estado de la unidad activa.
  - Los nuevos ejercicios de transferencia y prompts de Production se importaron correctamente en los respectivos archivos JSON y JS.

## Seguimiento fase 8 (proximo tramo)

- **Resultado del siguiente paso:** Checkpoint 8a entregado y se habilitó la navegación por unidad activa.
- **Pendiente para cierre completo de Fase 8:**
  - Revisar rendimiento del flujo en movil con multiples contextos.
  - Revisar el comportamiento en mobile con contextos reales y alto volumen de filas.

## Fases 0 a 7 (cierres previos)

- Cierres ejecutados bajo criterio de evidencia:
  - `npm test` green y `npm run build` green en cada hito funcional.
  - validadores de schema y paths de contenido cerrados.
  - Settings y Production con estados locales y progreso por unidad estables.

## Riesgos de implementacion

- Si se amplian el schema de `learningUnits` sin migracion de validador, la fase se bloquea.
- Si se incrementa densidad visual en mobile, el rendimiento UX cae.
- Riesgo mitigacion: priorizar mobile-first y validar con recorrido real en pantalla chica antes de ampliar alcance.

## Referencias actualizadas

- `docs/PROJECT_PHASE_ROADMAP.md`
- `docs/DEVELOPMENT_PHASE_EXECUTION_PLAN.md`
- `docs/PROJECT_PHASE_EXECUTION_PLAN_FROM_DARIO.md`
- `docs/DEVELOPMENT_ROADMAP_INCREMENTAL.md`
- `docs/PHASE_PLAN_DARIO_UNIT1_BY_OPERATIONS.md`
- `docs/SMARTTENSE_PHASE_PLAN_DARIO_INCREMENTAL.md`
