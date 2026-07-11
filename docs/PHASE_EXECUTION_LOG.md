# Registro de ejecucion por fases - SmartTense

Fecha base: 11/07/2026.

## Fase actual

- **Fase activa:** Fase 10 - Reorganizacion documental y guia curricular (cerrada).
- **Objetivo de la fase:** consolidar la documentacion activa, eliminar fuentes redundantes de roadmap y crear una guia curricular A1-B2 con fases ejecutivas y tareas operativas.
- **Estado:** cerrada. La siguiente fase de producto sugerida es Fase 11 - Revision del modelo de contenido.

## Fase 10 (actual)

- **Estado operativo:** cerrada.
- **Checkpoint F10a - Consolidacion documental (11/07/2026):**
  - Se creo `docs/INDEX.md` como punto de entrada oficial para la documentacion.
  - Se creo `docs/CURRICULUM_PHASE_PLAN.md` como plan oficial para expansion curricular A1, A2, B1 y B2.
  - Se consolida la informacion util de los planes anteriores en un unico plan con fases ejecutivas, tareas operativas, criterios de salida y Gantt interno.
  - Se eliminan referencias activas a documentos redundantes para evitar interpretaciones contradictorias.
- **Tareas puntuales:**
  - Crear indice documental. **completada**.
  - Crear guia curricular por niveles. **completada**.
  - Migrar informacion util de planes anteriores. **completada**.
  - Eliminar documentos redundantes. **completada**.
  - Actualizar README y guias por rol. **completada**.
  - Ejecutar `npm run release:check`. **completada**.
- **Criterio de salida definido para cierre de fase:**
  - `docs/INDEX.md` lista documentos activos y consolidados.
  - `docs/CURRICULUM_PHASE_PLAN.md` define fases A1-B2 con tareas operativas verificables.
  - No quedan referencias activas a planes historicos eliminados.
  - `npm run release:check` verde.
- **Evidencia ejecutada hoy:**
  - `rg` confirmo que los documentos historicos solo aparecen en `docs/INDEX.md` como documentos consolidados.
  - `git diff --check` OK con avisos esperados de LF/CRLF en Windows.
  - `node --check scripts/mobile-smoke.cjs` OK.
  - `npm test` OK (50 pruebas, 0 fallos).
  - `npm run build` OK.
  - `npm run test:e2e:mobile` OK.
  - Viewport validado: `390x844`.
  - Volumen validado: 500 verbos sinteticos.
  - Pantallas validadas: Home, Theory, Practice, Individual, Complete, Production, Settings.
  - Metricas observadas en E2E: Home `628ms`, Settings `172ms`, 25 filas visibles, quality gates `passed: true`.
  - Accesibilidad basica en E2E: `hasMain`, `hasNamedNavigation`, `hasDocumentLanguage`, `unnamedButtons: []`, `unlabeledFields: []`.

## Fase 9 (cerrada)

- **Estado operativo:** cerrada.
- **Checkpoint F9a - E2E mobile repetible (11/07/2026):**
  - Se agrego `scripts/mobile-smoke.cjs`.
  - Se agrego el comando `npm run test:e2e:mobile`.
  - El script levanta Vite, abre Chrome headless con viewport `390x844`, intercepta `public/data/verbs.json` y usa 500 verbos sinteticos.
  - El recorrido valida Home, Theory, Practice, Individual, Complete, Production y Settings.
  - Settings valida paginacion de `Showing 1-25 of 500` a `Showing 26-50 of 500`.
  - El script no agrega dependencias nuevas y mantiene la verificacion local/simple para MVP.
- **Checkpoint F9b - Metricas y umbrales internos (11/07/2026):**
  - Se agregaron quality gates al smoke mobile para que el comando falle ante regresiones visibles.
  - Umbrales internos: Home listo <= `5000ms`, Settings listo <= `2000ms`, 500 verbos sinteticos, viewport `390x844`, 25 filas visibles en Settings, maximo 140 botones activos y minimo 1200 caracteres renderizados.
  - Los umbrales de tiempo y densidad ajustables usan variables `SMARTTENSE_QA_*` documentadas en la guia de desarrollador.
- **Checkpoint F9c - Accesibilidad y release checklist (11/07/2026):**
  - Se agregaron verificaciones automaticas de accesibilidad basica al smoke mobile: `main`, navegacion con nombre, idioma del documento, botones visibles con nombre y campos visibles con etiqueta.
  - Se creo `docs/RELEASE_CHECKLIST.md` con comandos obligatorios, gates del smoke mobile, checklist por pantalla y checklist documental.
  - README, guias de usuario/desarrollador/junior y guia de GitHub Pages enlazan el checklist.
- **Checkpoint F9d - Evaluacion de optimizacion (11/07/2026):**
  - No se agrega virtualizacion en este hito porque `src/data/validation.js` limita la base a 500 verbos y el smoke mobile valida ese maximo con paginacion de 25 filas.
  - Criterio futuro: reconsiderar virtualizacion solo si `MAX_VERBS` aumenta o si `npm run test:e2e:mobile` falla por rendimiento/densidad.
- **Tareas puntuales:**
  - Convertir recorridos mobile CDP en prueba E2E repetible. **completada**.
  - Definir metricas de experiencia y umbrales internos. **completada**.
  - Revisar accesibilidad y textos de pantallas criticas. **completada**.
  - Preparar checklist de release interna por pantalla. **completada**.
  - Evaluar optimizacion adicional para alto volumen. **completada sin cambio de codigo**.
- **Criterio de salida definido para cierre de fase:**
  - E2E mobile repetible disponible desde npm.
  - `npm test`, `npm run build` y `npm run test:e2e:mobile` verdes.
  - Evidencia documentada con pantallas cubiertas, volumen usado y metricas basicas.
  - Siguiente bloque de calidad definido sin introducir features fuera del MVP.
- **Evidencia ejecutada hoy:**
  - `git diff --check` OK.
  - `node --check scripts/mobile-smoke.cjs` OK.
  - `npm test` OK (50 pruebas, 0 fallos).
  - `npm run build` OK.
  - `npm run test:e2e:mobile` OK.
  - Viewport validado: `390x844`.
  - Volumen validado: 500 verbos sinteticos.
  - Pantallas validadas: Home, Theory, Practice, Individual, Complete, Production, Settings.
  - Metricas observadas en E2E: Home `748ms`, Settings `154ms`, 25 filas visibles en tabla, quality gates `passed: true`.
  - Accesibilidad basica en E2E: `hasMain`, `hasNamedNavigation`, `hasDocumentLanguage`, `unnamedButtons: []`, `unlabeledFields: []`.

## Fase 8 (cerrada)

- **Estado operativo:** cerrada.
- **Checkpoint de ejecucion (11/07/2026):**
  - Se incorporo la unidad `past-future-conditional-foundation` en `public/data/learningUnits.json`.
  - La unidad nueva incluye teoria, estructuras, errores, ejemplos, vocabulario y 5 ejercicios iniciales: fillBlank, transform, chooseTense, correctMistake, translation.
- **Checkpoint de integracion (12/07/2026):**
  - Se habilito el selector de unidad activa en Home para abrir Theory/Practice con la unidad seleccionada.
  - Se persiste la unidad activa en settings locales y se usa para progreso y recomendacion de ruta.
- **Checkpoint de mejora (13/07/2026):**
  - Se añadieron 2 ejercicios de transferencia de tiempos (chooseTense) en `past-future-conditional-foundation` para comparación entre futuros y condicionales.
  - Se añadieron prompts de speaking/writing alineados con la unidad de tiempos pasados/futuros/condicionales (`src/data/productionPrompts.js`).
- **Checkpoint de QA mobile (14/07/2026):**
  - Se ejecuto smoke test headless con Chrome DevTools Protocol en viewport movil `390x844`.
  - Home renderizo navegacion y acceso a Production.
  - Production renderizo el composer, multiples prompts y el prompt de transferencia `Past-Future-Conditional comparison`.
  - Practice renderizo contexto, ejercicios y contador de respuestas correctas en mobile.
- **Checkpoint de QA alto volumen (11/07/2026):**
  - Se ejecuto smoke test headless con Chrome DevTools Protocol en viewport movil `390x844`.
  - Se intercepto `public/data/verbs.json` en navegador y se cargo un dataset sintetico de 500 verbos, el maximo permitido por el validador.
  - Home renderizo el total de 500 verbos sin error de consola de aplicacion.
  - Settings renderizo la tabla de datos, pagino de `1-25` a `26-50` y mantuvo controles operativos en mobile.
  - Complete abrio correctamente usando el dataset sintetico.
- **Tareas puntuales:**
  - Diseñar nueva unidad en `public/data/learningUnits.json` (pasado/futuro/condicional). **completada**.
  - Integrar la unidad en Theory y Practice con contexto y filtros. **completada**.
  - Mantener el flujo Home -> unidad -> teoria -> practica -> acciones de repaso. **completada**.
  - Verificar rendimiento para listas largas: filtros, orden y paginacion. **completada**.
- **Criterio de salida definido para cierre de fase:**
  - al menos una unidad adicional completa (teoria + practica + vocabulario contextual) visible en app.
  - `npm test` y `npm run build` verdes con la unidad activa.
  - flujo de Home/Path recomendado para la nueva unidad sin regresion.
  - evidencia de actualizacion documental (roadmap, log, guias).
- **Evidencia ejecutada hoy:**
  - `npm test` OK (50 pruebas, 0 fallos).
  - `npm run build` OK.
  - Smoke test mobile CDP OK (`390x844`: Home, Production y Practice).
  - Smoke test mobile CDP con alto volumen OK (`390x844`, 500 verbos sinteticos, Settings y Complete).
  - Validador de contenido y verbos conserva cobertura de escenarios negativos.
  - Home abre Theory/Practice con la unidad activa y Settings resume el estado de la unidad activa.
  - Los nuevos ejercicios de transferencia y prompts de Production se importaron correctamente en los respectivos archivos JSON y JS.

## Seguimiento fase 8 (cierre)

- **Resultado del siguiente paso:** Fase 8 cerrada con unidad adicional, Production alineado, smoke mobile y prueba de alto volumen.
## Seguimiento fase 9 (cierre)

- **Resultado:** Fase 9 cerrada con smoke E2E mobile repetible, quality gates, accesibilidad basica automatizada, checklist de release y criterio explicito para no agregar virtualizacion prematura.
- **Ajuste operativo post-cierre:** se agrego `npm run release:check` para ejecutar el checklist local completo sin abrir una nueva fase tecnica.
- **Evidencia del ajuste operativo:** `npm run release:check` OK; incluye `git diff --check`, `node --check scripts/mobile-smoke.cjs`, `npm test`, `npm run build` y `npm run test:e2e:mobile`.
- **Metricas del ajuste operativo:** Home `571ms`, Settings `145ms`, 25 filas visibles, accesibilidad basica OK y quality gates `passed: true`.
- **Siguiente fase:** pendiente de definicion de producto. No se abre una Fase 10 tecnica sin nuevo alcance MVP.

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

- `docs/INDEX.md`
- `docs/CURRICULUM_PHASE_PLAN.md`
- `docs/PROJECT_PHASE_ROADMAP.md`
- `docs/RELEASE_CHECKLIST.md`
