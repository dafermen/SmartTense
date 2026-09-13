# Registro de ejecucion por fases - SmartTense

Fecha base: 11/07/2026.

## Fase actual

- **Fase activa:** Fase 20 - Adaptar modelo de unidades.
- **Objetivo de la fase:** adaptar el modelo de unidad para la metodología Dario con campos opcionales y sin romper el contrato vigente.
- **Estado:** en ejecución local. Fase 19 quedó cerrada con el mapeo de brechas; listo para migrar contenido A2 en fases siguientes.

## Fase 19 (cerrada localmente)

- **Estado operativo:** cerrada localmente.
- **Checkpoint F19a - Mapeo de metodología Dario (12/07/2026):**
  - Se creó `docs/METHODOLOGY_DARIO_A2.md`.
  - Se extrajo el blueprint por bloques del PDF.
  - Se identificaron brechas reales entre JSON actual y metodología.
  - Se definió una propuesta de campos opcionales para migración sin ruptura.
- **Criterio de salida aplicado:**
  - Se dispone de un documento único con mapeo, gaps y propuesta de campos.
  - No se rompen rutas de carga ni render actual de contenido.
- **Tareas cerradas:**
  - Priorizar Fase 20 antes de reconstruir A2.
  - Confirmar estructura objetivo y alcance de bloques Dario.

## Fase 20 (en ejecución)

- **Estado operativo:** en ejecución local.
- **Objetivo ejecutivo:** revisar y ampliar mínimo el schema para soportar bloques de metodología (`learnerContext`, `grammarBlocks`, `controlledPractice`, `contrastPractice`, `mistakeCorrection`, `translationPractice`, `pronunciationDrills`, `productionTask`) sin romper schema v3.
- **Tareas ejecutadas:**
  - `src/data/learningContentValidation.js`: se agregan campos opcionales y validación estricta para el nuevo modelo.
  - `tests/learningContentValidation.test.js`: se agregan tests de validación positiva de metodología y rechazo de payload inválido.
  - `docs/LEARNING_CONTENT_SCHEMA.md`: se documentan los campos opcionales y formato de `productionTask`.
- **Pendiente para cierre:**
  - Verificar contenido A2 migrado con estos campos en dataset real.
  - Cerrar la fase con evidencia de `npm run release:check` cuando se valide la migración.

## Fase 18 (cerrada localmente)

- **Estado operativo:** cerrada localmente.
- **Checkpoint F18a - Filtro CEFR visible (12/07/2026):**
  - Home ahora muestra botones segmentados `All`, `A1`, `A2`, `B1` y `B2`.
  - El selector de unidad activa se filtra por el nivel CEFR seleccionado.
  - Al cambiar de nivel, la app cambia a la unidad recomendada de ese nivel.
  - Al aplicar el diagnostico, Home tambien ajusta el filtro al nivel sugerido.
  - Production sigue usando la unidad activa para prompts sugeridos.
- **Checkpoint F18b - Correccion responsive del filtro CEFR (12/07/2026):**
  - Se ajusto el contenedor de Home para permitir que el bloque izquierdo encoja correctamente en mobile.
  - Se compactaron los botones CEFR en pantallas pequenas.
  - El smoke mobile ahora valida overflow horizontal de Home, visibilidad del filtro CEFR y botones dentro de la tarjeta.
  - Validacion adicional ejecutada en `360x844`: Home horizontal overflow `0`, CEFR overflow `0`, botones fuera de tarjeta `0`.
- **Checkpoint F18c - Correccion de botones montados en Home (12/07/2026):**
  - Se cambio la tarjeta principal de Home de layout horizontal flexible a layout vertical estable.
  - Las acciones de Home ahora usan grid responsive y ya no se montan sobre el selector de unidad activa.
  - El smoke mobile valida que los botones de Home no se solapen con el campo de unidad ni salgan de la tarjeta.
  - Validacion adicional ejecutada en `1250x480`: Home action overlaps `0`, acciones fuera de tarjeta `0`.
- **Tareas puntuales:**
  - Hacer visible el nivel A1/A2/B1/B2 en la interfaz. **completada**.
  - Usar botones segmentados en lugar de checkboxes para evitar seleccion multiple confusa. **completada**.
  - Mantener el flujo manual con `All`. **completada**.
  - Agregar prueba del helper de filtro CEFR. **completada**.
  - Actualizar documentacion. **completada**.
- **Criterio de salida definido para cierre de fase:**
  - El usuario puede identificar y filtrar unidades por A1, A2, B1 o B2.
  - El filtro no rompe diagnostico, Theory, Practice ni Production.
  - Tests, build y documentacion quedan actualizados.
- **Evidencia ejecutada hoy:**
  - `npm test` OK (66 pruebas, 0 fallos).
  - `npm run release:check` OK.
  - `npm run build` OK.
  - `npm run test:e2e:mobile` OK.
  - Viewport validado: `390x844`.
  - Viewport adicional validado: `360x844`.
  - Viewport adicional validado: `1250x480`.
  - Volumen validado: 500 verbos sinteticos.
  - Pantallas validadas: Home, Theory, Practice, Individual, Complete, Production, Settings.
  - Metricas observadas en E2E: Home `284ms`, Settings `110ms`, 25 filas visibles, Home overflow `0`, CEFR overflow `0`, action overlaps `0`, quality gates `passed: true`.

## Fase 17 (cerrada localmente)

- **Estado operativo:** cerrada localmente.
- **Checkpoint F17a - Production guiado por unidad (12/07/2026):**
  - Se agregaron `cefrLevel` y `unitIds` a los prompts de `src/data/productionPrompts.js`.
  - Production muestra conteo de prompts sugeridos para la unidad activa.
  - El composer permite cambiar entre `Suggested prompts` y `All prompts`.
  - Al cambiar de unidad, el composer prioriza prompts sugeridos si no se esta editando un intento existente.
  - La cola de intentos se mantiene global y conserva filtros por modo y estado.
- **Tareas puntuales:**
  - Definir metadata de prompt por unidad/nivel. **completada**.
  - Mostrar prompts sugeridos segun unidad activa. **completada**.
  - Mantener fallback global de prompts. **completada**.
  - Evitar que los intentos existentes desaparezcan por el filtro sugerido. **completada**.
  - Actualizar pruebas y documentacion. **completada**.
- **Criterio de salida definido para cierre de fase:**
  - Production ayuda al estudiante con prompts relevantes por unidad.
  - El usuario puede volver a ver todos los prompts.
  - Los intentos guardados siguen visibles en la cola global.
  - Tests, build y documentacion quedan actualizados.
- **Evidencia ejecutada hoy:**
  - `npm test` OK (65 pruebas, 0 fallos).
  - `npm run release:check` OK.
  - `npm run build` OK.
  - `npm run test:e2e:mobile` OK.
  - Viewport validado: `390x844`.
  - Volumen validado: 500 verbos sinteticos.
  - Pantallas validadas: Home, Theory, Practice, Individual, Complete, Production, Settings.
  - Metricas observadas en E2E: Home `296ms`, Settings `99ms`, 25 filas visibles, quality gates `passed: true`.

## Fase 16 (cerrada localmente)

- **Estado operativo:** cerrada localmente.
- **Checkpoint F16a - Diagnostico CEFR local (12/07/2026):**
  - Se agrego `src/learningDiagnostic.js` con 4 checks de autoevaluacion A1, A2, B1 y B2.
  - Home muestra el diagnostico, el nivel sugerido y la unidad recomendada.
  - Home puede aplicar la recomendacion y abrir Theory con la unidad sugerida.
  - Settings muestra resumen del diagnostico y permite reiniciarlo.
  - Las respuestas quedan guardadas en settings locales del navegador junto con el progreso existente.
- **Tareas puntuales:**
  - Definir diagnostico MVP por nivel CEFR. **completada**.
  - Guardar resultado local y permitir reset. **completada**.
  - Conectar Home con recomendacion de nivel sugerido. **completada**.
  - Documentar experiencia de usuario, privacidad local y flujo tecnico. **completada**.
- **Criterio de salida definido para cierre de fase:**
  - Diagnostico no bloquea uso manual de la app.
  - Home sugiere A1, A2, B1 o B2 segun respuestas locales.
  - Settings permite reset del diagnostico.
  - Tests, build y documentacion quedan actualizados.
- **Evidencia ejecutada hoy:**
  - `npm test` OK (64 pruebas, 0 fallos).
  - `npm run release:check` OK.
  - `npm run build` OK.
  - `npm run test:e2e:mobile` OK.
  - Viewport validado: `390x844`.
  - Volumen validado: 500 verbos sinteticos.
  - Pantallas validadas: Home, Theory, Practice, Individual, Complete, Production, Settings.
  - Metricas observadas en E2E: Home `295ms`, Settings `102ms`, 25 filas visibles, quality gates `passed: true`.

## Fase 15 (cerrada localmente)

- **Estado operativo:** cerrada localmente.
- **Checkpoint F15a - B2 Independent Production inicial (12/07/2026):**
  - Se agrego `b2-mixed-tenses-independent-production` como primera unidad B2 (`cefrLevel: B2`, `unitOrder: 1`).
  - La unidad depende de `b1-narratives-plans-problems` para mantener la ruta A1 -> A2 -> B1 -> B2.
  - La unidad cubre mixed tenses, passive-style meaning, reported speech, connectors y unreal past conditionals.
  - Incluye teoria, estructuras, errores comunes, ejemplos, vocabulario y ejercicios de transformacion, correccion, chooseTense y traduccion.
  - Se agregaron prompts `b2-independent-summary` y `b2-mixed-speaking` en Production.
- **Tareas puntuales:**
  - Definir unidad B2 inicial. **completada**.
  - Agregar teoria y estructuras B2. **completada**.
  - Agregar ejercicios B2. **completada**.
  - Agregar prompts de speaking/writing B2. **completada**.
  - Validar prerequisito B1 -> B2. **completada**.
- **Criterio de salida definido para cierre de fase:**
  - B2 tiene una unidad inicial navegable desde Home, Theory y Practice.
  - Production tiene prompts B2 disponibles.
  - Ruta A1 -> A2 -> B1 -> B2 valida sin errores.
  - Tests y documentacion quedan actualizados.
- **Evidencia ejecutada hoy:**
  - `npm test` OK (60 pruebas, 0 fallos).
  - `npm run release:check` OK.
  - `npm run build` OK.
  - `npm run test:e2e:mobile` OK.
  - Viewport validado: `390x844`.
  - Volumen validado: 500 verbos sinteticos.
  - Pantallas validadas: Home, Theory, Practice, Individual, Complete, Production, Settings.
  - Metricas observadas en E2E: Home `291ms`, Settings `98ms`, 25 filas visibles, quality gates `passed: true`.

## Fase 14 (cerrada localmente)

- **Estado operativo:** cerrada localmente.
- **Checkpoint F14a - B1 Functional Communication (12/07/2026):**
  - Se reviso `past-future-conditional-foundation` como primera unidad B1.
  - Se agrego `b1-narratives-plans-problems` como segunda unidad B1 (`cefrLevel: B1`, `unitOrder: 2`).
  - La nueva unidad depende de `past-future-conditional-foundation`.
  - La unidad cubre narraciones cortas, planes futuros, problemas cotidianos y soluciones con conditional.
  - Incluye teoria, estructuras, errores comunes, ejemplos, vocabulario y ejercicios de fillBlank, transform, chooseTense y correctMistake.
  - Se agregaron prompts `b1-problem-story` y `b1-plan-solution` en Production.
- **Tareas puntuales:**
  - Revisar la unidad B1 existente. **completada**.
  - Agregar segunda unidad B1 para evitar sobrecargar una sola unidad. **completada**.
  - Agregar ejercicios de transferencia entre tiempos. **completada**.
  - Agregar prompts de Production B1. **completada**.
- **Criterio de salida definido para cierre de fase:**
  - B1 tiene una ruta inicial de dos unidades.
  - Practice permite razonamiento contextual entre pasado, futuro y condicional.
  - Production tiene prompts B1 disponibles.
  - Tests y documentacion quedan actualizados.
- **Evidencia ejecutada hoy:**
  - `npm test` OK (60 pruebas, 0 fallos).
  - `npm run release:check` OK.
  - `npm run build` OK.
  - `npm run test:e2e:mobile` OK.
  - Viewport validado: `390x844`.
  - Volumen validado: 500 verbos sinteticos.
  - Pantallas validadas: Home, Theory, Practice, Individual, Complete, Production, Settings.
  - Metricas observadas en E2E: Home `291ms`, Settings `98ms`, 25 filas visibles, quality gates `passed: true`.

## Fase 13 (cerrada localmente)

- **Estado operativo:** cerrada localmente.
- **Checkpoint F13a - Expansion A2 desde documento Dario (11/07/2026):**
  - Se agrego `a2-present-continuous-actions` para acciones en progreso, situaciones temporales y planes actuales.
  - Se agrego `a2-present-perfect-experiences` para experiencias y resultados conectados con ahora.
  - Se agrego `a2-present-perfect-continuous-duration` para duracion con `for`, `since` y acciones conectadas con ahora.
  - Se agrego `a2-prepositions-daily-habits` para preposiciones de tiempo, lugar, direccion y movimiento.
  - `past-future-conditional-foundation` ahora depende de `a2-prepositions-daily-habits` para mantener la ruta A1 -> A2 -> B1.
  - Se agregaron prompts A2 de Production para Present Continuous, Present Perfect, Present Perfect Continuous y Prepositions.
- **Tareas puntuales:**
  - Dividir contenido A2 en unidades pequenas. **completada**.
  - Migrar teoria y estructuras A2. **completada**.
  - Migrar ejercicios A2. **completada**.
  - Agregar vocabulario y contextos A2. **completada**.
  - Agregar prompts de speaking/writing A2. **completada**.
- **Criterio de salida definido para cierre de fase:**
  - Unidades A2 navegables desde Home, Theory, Practice y Production.
  - Ruta A2 ordenada con prerequisitos claros.
  - Validacion de contenido y tests verdes.
  - `npm run release:check` verde.
- **Evidencia ejecutada hoy:**
  - `npm test` OK (59 pruebas, 0 fallos).
  - `npm run release:check` OK.
  - `npm run build` OK.
  - `npm run test:e2e:mobile` OK.
  - Viewport validado: `390x844`.
  - Volumen validado: 500 verbos sinteticos.
  - Pantallas validadas: Home, Theory, Practice, Individual, Complete, Production, Settings.
  - Metricas observadas en E2E: Home `545ms`, Settings `90ms`, 25 filas visibles, quality gates `passed: true`.

## Fase 12 (cerrada localmente)

- **Estado operativo:** cerrada localmente.
- **Checkpoint F12a - Primera unidad A1 (11/07/2026):**
  - Se agrego `be-have-foundation` como primera unidad A1 (`cefrLevel: A1`, `unitOrder: 1`).
  - La unidad cubre `be`, `have` y `there is/are`.
  - Incluye teoria, estructuras, errores comunes, ejemplos, vocabulario y 5 ejercicios iniciales.
  - `present-simple-foundation` pasa a `unitOrder: 2` y depende de `be-have-foundation`.
  - Se agrego el prompt `a1-personal-introduction` en Production.
- **Checkpoint F12b - Cierre MVP A1 minimo (11/07/2026):**
  - Se agrego `personal-information-questions` como tercera unidad A1 (`cefrLevel: A1`, `unitOrder: 3`).
  - La unidad cubre preguntas basicas de informacion personal con `be`, `do`, `does`, `have` y respuestas cortas.
  - Incluye teoria, estructuras, errores comunes, ejemplos, vocabulario y 5 ejercicios iniciales.
  - `past-future-conditional-foundation` se mantuvo temporalmente despues de A1 hasta abrir Fase 13.
  - Se agrego el prompt `a1-basic-questions` en Production.
- **Tareas puntuales:**
  - Crear primera unidad A1 antes de Present Simple. **completada**.
  - Ajustar ruta A1 inicial con prerequisito. **completada**.
  - Agregar ejercicios A1 iniciales. **completada**.
  - Agregar prompt A1 de Production. **completada**.
  - Crear unidades A1 adicionales para completar MVP. **completada**.
  - Evaluar filtro de Production por unidad activa. **completada sin cambio de UI**; Production queda global con prompts A1 disponibles.
- **Criterio de salida definido para cierre de fase:**
  - 3 a 5 unidades A1 navegables desde Home, Theory, Practice y Production.
  - Ruta A1 ordenada con prerequisitos claros.
  - Validacion de contenido y tests verdes.
  - `npm run release:check` verde.
- **Evidencia ejecutada hoy:**
  - `npm test` OK (58 pruebas, 0 fallos).
  - `npm run release:check` OK.
  - `npm run build` OK.
  - `npm run test:e2e:mobile` OK.
  - Viewport validado: `390x844`.
  - Volumen validado: 500 verbos sinteticos.
  - Pantallas validadas: Home, Theory, Practice, Individual, Complete, Production, Settings.
  - Metricas observadas en E2E: Home `309ms`, Settings `115ms`, 25 filas visibles, quality gates `passed: true`.
  - Observacion: el smoke reporto un aviso no bloqueante al borrar el perfil temporal de Chrome; el comando termino con codigo 0.
  - Nota operativa: Fase 13 queda lista para iniciar; no se implementa en este cierre.

## Fase 11 (cerrada localmente)

- **Estado operativo:** cerrada localmente.
- **Checkpoint F11a - Schema curricular v3 (11/07/2026):**
  - `public/data/learningUnits.json` sube a `schemaVersion: 3`.
  - Cada unidad incluida declara `cefrLevel`, `unitOrder` y `prerequisiteUnitIds`.
  - `level` se conserva como dificultad interna (`basic`, `intermediate`, `advanced`) para no romper filtros existentes.
  - `cefrLevel` se usa para ruta curricular A1-B2.
- **Checkpoint F11b - Validacion y ruta (11/07/2026):**
  - `src/data/learningContentValidation.js` acepta schema v3 y conserva compatibilidad con v1/v2.
  - El validador rechaza CEFR invalido, metadata faltante en schema v3, prerequisitos desconocidos, prerequisitos contra la misma unidad y orden duplicado dentro del mismo CEFR.
  - `src/learningPath.js` agrega ordenamiento curricular y recomendacion por prerequisitos.
  - Home usa las unidades ordenadas y la recomendacion curricular como default.
- **Tareas puntuales:**
  - Agregar metadata curricular a `learningUnits`. **completada**.
  - Validar nivel CEFR, orden y prerequisitos. **completada**.
  - Mantener compatibilidad con schema anterior. **completada**.
  - Agregar pruebas de validacion y ruta. **completada**.
  - Actualizar documentacion de schema y requerimientos. **completada**.
  - Ejecutar `npm run release:check`. **completada**.
- **Criterio de salida definido para cierre de fase:**
  - `learningUnits` expresa nivel CEFR, orden y prerequisitos.
  - El validador cubre casos validos e invalidos.
  - Home y learning path consumen el orden curricular sin romper pantallas existentes.
  - `LEARNING_CONTENT_SCHEMA.md`, `SOFTWARE_REQUIREMENTS.md` y este log quedan actualizados.
  - `npm run release:check` verde.
- **Evidencia ejecutada hoy:**
  - `npm test` OK (57 pruebas, 0 fallos).
  - `npm run release:check` OK.
  - `npm run build` OK.
  - `npm run test:e2e:mobile` OK.
  - Viewport validado: `390x844`.
  - Volumen validado: 500 verbos sinteticos.
  - Pantallas validadas: Home, Theory, Practice, Individual, Complete, Production, Settings.
  - Quality gates `passed: true`.

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

## Fases 25-29 (cerradas)

- **Estado operativo:** cerradas el 2026-07-21.
- **Fase 25 - dominio por habilidades:**
  - Se agrego `src/skillMastery.js` con 23 habilidades A1-B2 y reglas explicables de dominio y revision.
  - Practice y Guided Lesson actualizan intentos, aciertos, racha, dominio y fechas de practica.
  - Home muestra habilidad prioritaria y promedio; los resets respetan alcance global o por unidad.
- **Fase 26 - revision adaptativa:**
  - Se agregaron `src/adaptiveReview.js` y `src/AdaptiveReviewPage.jsx`.
  - La cola reutiliza preguntas existentes, prioriza dominio bajo o revision vencida y alterna habilidades.
  - La sesion muestra una pregunta por pantalla, feedback inmediato y resumen final.
- **Fase 27 - Guided Lesson B1/B2:**
  - Las dos unidades B1 y la unidad B2 activan contexto, pronunciacion y produccion final.
  - Las habilidades avanzadas cubren secuencia pasada, futuros, condicionales, narracion, planes, pasiva, reported speech y precision mixta.
  - Guided Lesson queda disponible en 10/10 unidades A1-B2.
- **Fase 28 - simplificacion mobile:**
  - Home movil prioriza unidad, continuar leccion, progreso y recomendacion.
  - La barra inferior ofrece Home, Theory, Practice y Review.
  - El menu lateral conserva Individual, Complete, Production, Settings, Documentation y About.
- **Fase 29 - cierre integral:**
  - La auditoria oficial se amplia a A1-B2.
  - Se actualizan plan curricular, log, guia de usuario, guia de desarrollo y README.
  - Evidencia final: auditoria A1-B2 con 10 unidades, 213 ejercicios, 0 errores, 0 warnings, 0 gaps y 10/10 unidades metodologicas.
  - Evidencia final: `npm test` 90/90, `npm run build` 37 modulos y E2E mobile verde.
  - E2E: viewport `390x844`, 500 verbos sinteticos, 25 filas visibles, 0 overflow en Home/navegacion/Guided Lesson y 10/10 unidades guiadas.
  - Accesibilidad E2E: main y navegacion nombrada presentes; 0 botones sin nombre y 0 campos sin etiqueta.

## Fase 30 (cerrada)

- **Estado operativo:** cerrada el 2026-07-21.
- **Problema resuelto:** Home movil mezclaba seleccion de curso, datos verbales, estadisticas, diagnostico y multiples acciones sin una jerarquia clara.
- **Home nuevo:** muestra `Continue lesson`, siguiente repaso adaptativo y progreso A1-B2.
- **Course:** agrupa las 10 unidades por nivel, muestra estado y abre directamente Guided Lesson.
- **Progress:** muestra dominio promedio, habilidades practicadas, foco prioritario y avance por nivel.
- **Navegacion mobile:** Home, Course, Practice y Progress; Review se abre desde Home, Progress o Practice, y las herramientas avanzadas permanecen en el menu lateral.
- **Compatibilidad:** el dashboard anterior se conserva para escritorio y no se modifica la base curricular ni el schema.
- **Archivos principales:** `src/LearningHubPages.jsx`, `src/learningHub.css`, `src/App.jsx` y `src/i18n.js`.
- **Auditoria final:** 10 unidades, 213 ejercicios, 0 errores, 0 warnings y 0 gaps.
- **Pruebas finales:** 90/90 y build Vite con 39 modulos.
- **E2E mobile:** Home, Course, Theory, Guided Lesson, Adaptive Review, Practice, Progress, Individual, Complete, Production y Settings en `390x844`.
- **Metricas mobile:** Home `291ms`, 4/4 destinos primarios, 0 overflow horizontal y Guided Lesson 10/10.
- **Accesibilidad E2E:** 0 botones sin nombre y 0 campos sin etiqueta.

## Fase 31 (cerrada)

- **Estado operativo:** cerrada el 2026-07-21.
- **Home unificado:** el learning hub de Fase 30 reemplaza el dashboard anterior tanto en mobile como en desktop.
- **Jerarquia:** Continue Lesson es la tarjeta dominante; Adaptive Review y Course Progress quedan como acciones secundarias.
- **Ruta visual:** A1-B2 usa estados Completed, In progress y Not started con continuidad vertical.
- **Direccion grafica:** verde profundo, terracota, crema y dorado con titulares editoriales y cuerpo altamente legible.
- **Diagnostico:** se conserva debajo del learning hub solo cuando no existe resultado diagnostico.
- **Compatibilidad:** Course, Progress, Practice, Guided Lesson y las herramientas avanzadas no cambian su modelo de datos.
- **QA:** el smoke comprueba Home en `390x844` y `1280x900`, ausencia del hero anterior y overflow horizontal.
- **Auditoria final:** 10 unidades, 213 ejercicios, 0 errores, 0 warnings y 0 gaps.
- **Pruebas finales:** 90/90 y build Vite con 39 modulos.
- **Responsive final:** Home mobile `342ms`, 4/4 destinos, 0 overflow; Home desktop visible, hero anterior oculto y 0 overflow.
- **Accesibilidad E2E:** 0 botones sin nombre y 0 campos sin etiqueta.

## Fase 32 (cerrada)

- **Estado operativo:** cerrada el 2026-07-21.
- **Persistencia:** `journeyProgress` guarda paso Guided, respuestas, checks, borrador, indice Practice, resultados y cierre de Production por unidad.
- **Progreso:** 60% Guided Lesson, 30% Practice y 10% Production; Home muestra paso exacto y porcentaje real.
- **Flujo:** Guided Lesson -> Practice -> Production -> unidad completada -> siguiente unidad en Home.
- **Practice:** `FocusedPracticePage` presenta una pregunta, feedback y Next question por pantalla.
- **Course:** estados Completed, In progress, Recommended y Requires previous unit con bloqueo real de prerrequisitos.
- **Onboarding:** primera visita permite level check de dos minutos o Start from A1; desaparece al finalizar.
- **Resets:** reset global y reset de unidad eliminan tambien el journey correspondiente.
- **Pruebas:** 93/93 y build Vite con 44 modulos.
- **E2E:** reanudacion paso 2 confirmada, 1 question card visible, 9 unidades bloqueadas para learner nuevo y 10/10 Guided Lessons.
- **Responsive:** `390x844` y `1280x900`, 0 overflow horizontal y accesibilidad basica verde.

## Riesgos de implementacion

- Si se amplian el schema de `learningUnits` sin migracion de validador, la fase se bloquea.
- Si se incrementa densidad visual en mobile, el rendimiento UX cae.
- Riesgo mitigacion: priorizar mobile-first y validar con recorrido real en pantalla chica antes de ampliar alcance.

## Referencias actualizadas

- `docs/INDEX.md`
- `docs/CURRICULUM_PHASE_PLAN.md`
- `docs/SOFTWARE_REQUIREMENTS.md`
- `docs/PROJECT_PHASE_ROADMAP.md`
- `docs/RELEASE_CHECKLIST.md`

## Fase 19 (cerrada)

- **Estado operativo:** cerrada el 2026-07-21.
- **Objetivo:** revisar cobertura y gaps A1/A2 antes de ampliar la experiencia de aprendizaje.
- **Contenido revisado:** 7 unidades y 112 ejercicios A1/A2.
- **Entrega tecnica:** `src/data/contentQuality.js` agrega una auditoria reutilizable de secciones, IDs, opciones, respuestas, tipos de practica, contextos y bloques metodologicos.
- **Comando:** `npm run audit:content` ejecuta la auditoria y bloquea opciones ambiguas, duplicadas o sin respuesta valida.
- **Pruebas:** `tests/contentQuality.test.js` cubre la base real y escenarios negativos de seleccion.
- **Documento:** `docs/CONTENT_GAPS_A1_A2.md` registra gaps editoriales, contextuales y metodologicos por prioridad.
- **Decision:** los gaps de cobertura y metodologia son warnings accionables; no se duplica contenido para simular el blueprint.
- **Evidencia de auditoria:** 7 unidades, 112 ejercicios, 0 errores, 52 warnings, 5 gaps contextuales y 0/7 unidades con metodologia activa.
- **Evidencia de pruebas:** `npm test` OK, 72 pruebas y 0 fallos.
- **Evidencia de build:** `npm run build` OK, 30 modulos transformados.
- **Evidencia mobile:** `npm run test:e2e:mobile` OK en `390x844`, 7 pantallas cubiertas, 500 verbos sinteticos, accesibilidad basica y quality gates verdes.
- **Siguiente fase:** Fase 20 - Modelo de leccion guiada y piloto A2.

## Fase 20 (cerrada)

- **Estado operativo:** cerrada el 2026-07-21.
- **Piloto:** `a2-present-continuous-actions`.
- **Experiencia visible:** Theory muestra `Start guided lesson` y abre un recorrido de una actividad por pantalla.
- **Secuencia:** objetivos, teoria, ejemplos, 3 practicas, correccion, pronunciacion, produccion y resumen.
- **Metodologia activa:** `learnerContext`, 2 `pronunciationDrills` y `productionTask` con estructuras requeridas y checklist.
- **Compatibilidad:** Theory, Practice y el menu principal conservan su comportamiento; Guided Lesson no agrega otro item al menu.
- **Evidencia de auditoria:** 112 ejercicios A1/A2, 0 errores, 51 warnings, 5 gaps contextuales y 1/7 unidades con metodologia activa.
- **Evidencia de pruebas:** `npm test` OK, 74 pruebas y 0 fallos.
- **Evidencia de build:** `npm run build` OK, 33 modulos transformados.
- **Evidencia mobile:** `npm run test:e2e:mobile` OK en `390x844`, Guided Lesson incluida entre 8 pantallas y 0 px de overflow horizontal.
- **Siguiente fase:** Fase 21 - Opciones curadas y cobertura contextual A1-A2.

## Fase 21 (cerrada)

- **Estado operativo:** cerrada el 2026-07-21.
- **Opciones curadas:** todos los ejercicios A1/A2 tienen opciones guardadas; Practice ya no necesita generarlas para esos niveles.
- **Contenido nuevo:** 19 ejercicios contextuales agregados; el total A1/A2 pasa de 112 a 131.
- **Cobertura cerrada:** Meetings y Family Routines alcanzan 5 ejercicios en cada unidad donde se muestran.
- **Metadata corregida:** los contextos usados por ejercicios quedan declarados en `contextTags`.
- **Migracion reproducible:** `scripts/curate-a1-a2-content.cjs` aplica opciones, contextos y ejercicios sin duplicar IDs.
- **Evidencia de auditoria:** 7 unidades, 131 ejercicios, 0 errores, 12 warnings, 0 gaps contextuales y 0 opciones generadas.
- **Evidencia de pruebas:** `npm test` OK, 76 pruebas y 0 fallos.
- **Evidencia de build:** `npm run build` OK, 33 modulos transformados.
- **Evidencia mobile:** `npm run test:e2e:mobile` OK en `390x844`, 8 pantallas, accesibilidad basica y quality gates verdes.
- **Siguiente fase:** Fase 22 - Extender Guided Lesson a todo A2.

## Fase 22 (cerrada)

- **Estado operativo:** cerrada el 2026-07-21.
- **Metodologia A2:** 4/4 unidades definen `learnerContext`, `pronunciationDrills` y `productionTask`.
- **Produccion:** cada unidad tiene un prompt final, estructuras requeridas y checklist propio.
- **Pronunciacion:** se agregaron drills para Present Perfect, duracion con for/since y preposiciones de tiempo/movimiento.
- **Reutilizacion:** `buildGuidedLessonSteps` construye el recorrido de las cuatro unidades sin duplicar ejercicios.
- **Evidencia de auditoria:** 131 ejercicios, 0 errores, 9 warnings, 0 gaps contextuales y 4/7 unidades A1/A2 con metodologia activa.
- **Evidencia de pruebas:** `npm test` OK, 76 pruebas y 0 fallos.
- **Evidencia de build:** `npm run build` OK, 33 modulos transformados.
- **Evidencia mobile:** `npm run test:e2e:mobile` abre las 4 Guided Lessons A2 en `390x844`, con 0 px de overflow y quality gates verdes.
- **Siguiente fase:** Fase 23 - Completar tipos de practica A2.

## Fase 23 (cerrada)

- **Estado operativo:** cerrada el 2026-07-21.
- **Contenido nuevo:** 6 ejercicios A2 con distractores curados.
- **Cobertura:** cada unidad A2 contiene `fillBlank`, `transform`, `chooseTense`, `correctMistake` y `translation`.
- **Migracion reproducible:** `scripts/complete-a2-practice.cjs` agrega los ejercicios sin duplicar IDs.
- **Evidencia de auditoria:** 137 ejercicios A1/A2, 0 errores, 5 warnings, 0 gaps contextuales y ningun tipo faltante en A2.
- **Evidencia de pruebas:** `npm test` OK, 78 pruebas y 0 fallos.
- **Evidencia de build:** `npm run build` OK, 33 modulos transformados.
- **Evidencia mobile:** `npm run test:e2e:mobile` OK en `390x844`, 4 Guided Lessons A2, 0 px de overflow y quality gates verdes.
- **Siguiente fase:** Fase 24 - Guided Lesson A1 simplificada.

## Fase 24 (cerrada)

- **Estado operativo:** cerrada el 2026-07-21.
- **Metodologia A1/A2:** 7/7 unidades definen contexto, pronunciacion y produccion.
- **Practica A1:** se agrega `be-have-translation-1` con opciones curadas.
- **Metadata:** `present-simple-fill-all-1` queda clasificado como `it-work`.
- **Migracion reproducible:** `scripts/activate-a1-guided.cjs` activa la metodologia sin duplicar contenido.
- **Evidencia de auditoria:** 138 ejercicios, 0 errores, 0 warnings, 0 gaps y 7/7 unidades listas.
- **Evidencia de pruebas:** `npm test` OK, 80 pruebas y 0 fallos.
- **Evidencia de build:** `npm run build` OK, 33 modulos transformados.
- **Evidencia mobile:** `npm run test:e2e:mobile` abre 7 Guided Lessons A1/A2 en `390x844`, con 0 px de overflow.
- **Siguiente fase:** Fase 25 - Dominio por habilidades.

## Fase 33 (cerrada)

- **Estado operativo:** cerrada el 2026-07-21.
- **Consistencia bilingue:** Guided Lesson, Adaptive Review, Practice, nombres de pasos y acceso al repaso usan el diccionario de interfaz ingles/espanol.
- **Etiquetas pedagogicas:** Practice muestra nombres comprensibles en lugar de valores tecnicos como `fillBlank` o `correctMistake`.
- **Tipografia:** `@fontsource/atkinson-hyperlegible` sirve Atkinson Hyperlegible localmente, sin depender de una red externa.
- **Iconografia:** `src/UiIcon.jsx` centraliza iconos SVG para navegacion y acciones primarias.
- **Accesibilidad visual:** se reducen mayusculas sostenidas, mejora el contraste secundario y se conserva el foco en una accion principal.
- **Movimiento:** Home, Course, Guided Lesson, Practice y Adaptive Review usan entradas breves con alternativa `prefers-reduced-motion`.
- **Progreso:** completar Production muestra una celebracion discreta con la unidad terminada y la siguiente disponible.
- **Prueba agregada:** `tests/uiLocalization.test.js` protege la cobertura bilingue del flujo principal.
- **Evidencia de pruebas:** `npm test` OK, 94 pruebas y 0 fallos.
- **Evidencia de auditoria:** 10 unidades, 213 ejercicios, 0 errores, 0 warnings y 10/10 unidades con metodologia.
- **Evidencia de build:** `npm run build` OK, 45 modulos transformados y fuentes locales incluidas en `dist`.
- **Evidencia mobile:** `npm run test:e2e:mobile` OK en `390x844`, 11 pantallas, 0 px de overflow en Home y Guided Lesson, navegacion de 4 destinos y controles accesibles.

## Fase 20 - Experiencia De Estudio Y Continuidad

**Estado:** Validacion automatizada cerrada.

- Practice conserva el feedback de la ultima pregunta hasta que el estudiante decide continuar.
- Las respuestas incorrectas ofrecen reintento y quedan registradas por ejercicio en `skillProgress`.
- Adaptive Review prioriza errores recientes y los elimina de pendientes cuando se corrigen.
- Home abre el paso realmente pendiente de la unidad mediante `nextLearningStep.page`.
- Home y Progress muestran la existencia de errores pendientes.
- Se agregan `AGENTS.md` y `docs/CURRENT_STATUS.md` para continuidad entre sesiones.
- No se modifico contenido curricular ni la base de ejercicios.
- Evidencia de cierre: 95 pruebas, build de produccion y smoke mobile `390x844` superados.

## Fase 21 - Manual Del Curso A2

**Estado:** Validacion automatizada cerrada; revision en dispositivo fisico opcional.

- El PDF original de 57 paginas se conserva sin modificaciones dentro de `public/docs/`.
- La nueva pagina Manual ofrece visor integrado para escritorio.
- En telefonos se priorizan las acciones Abrir manual y Descargar PDF.
- Manual se agrega al menu completo sin aumentar la navegacion primaria movil.
- Se actualizan textos ingles/espanol y la guia de usuario.
- Evidencia: 95 pruebas unitarias, build de produccion y smoke mobile `390x844` superados.
- Durante el smoke se corrigio Smart Resume para no saltar una Guided Lesson incompleta.
- El smoke oficial abre Manual y valida tarjeta mobile, enlace PDF local, visor oculto y ausencia de overflow.
- Manual aparece entre las 12 pantallas del reporte.
- Revision en telefono fisico: recomendada, no bloqueante.

## Fase 22 - Documentation And Pre-Deployment Quality Governance

**Estado:** Implementada localmente; workflow pendiente de validacion.

- Estructura canonica, ADR, plantillas, CI y archivos de gobierno creados.
- `CURRENT_STATUS.md` pasa a la raiz con enlace compatible en `docs/`.
- Las 13 categorias se revisan antes de desplegar.
- CI y Pages ejecutan release gate y auditoria.
- LICENSE queda pendiente de decision legal del propietario.

## Pronunciation Practice Block - 2026-07-31

Status: Implemented and locally validated on 2026-07-31.

- Reuses every unit's existing pronunciationDrills.
- Adds device-voice playback for one sentence or the full drill set.
- Adds slow and normal playback speeds.
- Persists practiced drill IDs in the existing unit journey.
- Falls back to manual read-and-repeat when speech synthesis is unavailable.
- Adds isolated unit coverage for speech configuration without requiring a browser or network.
- Validation evidence: 98/98 tests, production build and 12-screen mobile smoke journey passed.
## Progress Backup And Restore - 2026-07-31

Status: Implemented and locally validated.

- Adds a dedicated, versioned progress data channel separate from verbs and learning content.
- Exports and restores pedagogical history without replacing device display preferences.
- Requires user confirmation before restoration and rejects incompatible, oversized, deeply nested or unsafe payloads.
- Validation evidence: 101/101 tests, production build and 12-screen mobile smoke journey passed.
## Installable And Offline PWA - 2026-07-31

Status: Implemented and locally validated; published-device confirmation pending deployment.

- Adds a standalone web-app manifest and standard/maskable icons.
- Registers offline support only in production and removes stale registrations during local development.
- Pre-caches curriculum, verbs and the application shell, with controlled runtime cache updates.
- Adds no third-party runtime dependency.
- Validation evidence: 104/104 tests, production build and 12-screen mobile smoke journey passed.
## Documentation Recovery And Navigation - 2026-09-09

Status: Implemented and locally validated except for the final mobile smoke.

- Restored the root-level governance and continuity documents to their canonical locations.
- Preserved `docs/CURRENT_STATUS.md` as a compatibility link for older references.
- Corrected the static documentation Markdown parser to guarantee forward progress.
- Generated 31 documentation pages with no broken local Markdown links and no duplicated nested documentation routes.
- Confirmed the normal `npm run dev -- --port <port> --host` flow builds documentation and starts Vite.
- Validation evidence: content and translation audits passed, 107/107 tests passed, and the production build passed.
- Remaining evidence: repeat the mobile smoke when Chrome can complete the 12-screen journey; no application assertion failed in this run.
## Property And Invariant Test Baseline - 2026-09-09

Status: Implemented and locally validated.

- Exercises every bundled verb across every subject and tense, covering 11,200 generated sentence rows.
- Verifies complete forms, punctuation, translations, spacing, and absence of undefined output.
- Verifies cumulative tense visibility across Basic, Intermediate, and Advanced levels.
- Verifies normalization idempotence and scoring invariance for case, spacing, accents, and terminal punctuation.
- Verifies deterministic progress-backup round trips, duplicate removal, and detached restored objects.
- Focused evidence: 5/5 property and invariant tests passed.
## Mutation Testing Baseline - 2026-09-09

Status: Implemented and locally validated.

- Installed the official StrykerJS core as a development-only dependency.
- Uses the native Node test runner through Stryker's command runner; no test-framework migration was required.
- Mutates `src/practice.js` against focused unit and property tests.
- The first run scored 83.72% and exposed 7 surviving mutants.
- Tests were strengthened for absent units, empty values, typographic apostrophes, internal punctuation, and repeated terminal punctuation.
- Final evidence: 43/43 mutants killed, 0 survived, 0 timed out, mutation score 100%.
- The release gate now includes mutation testing with a 90% blocking threshold.
- Dependency note: npm originally reported 7 transitive alerts after installation; all were remediated with compatible updates during Phase 23.

## Deterministic JSON Fuzzing Baseline - 2026-09-09

Status: Implemented and locally validated.

- Added `scripts/fuzz-json-validation.js` with a reproducible pseudo-random seed.
- Exercises invalid roots, malicious or oversized verb records, malformed learning units, and unsafe progress backups.
- Baseline evidence: 1,130/1,130 generated unsafe payloads rejected in 159 ms with seed `1397571922`.
- Added `npm run test:fuzz` to the pre-deployment release gate.

## Browser Persistence And Mobile Bundle Guard - 2026-09-09

Status: Implemented and locally validated.

- Centralized browser-storage reads, writes, and deletion behind a bounded, failure-tolerant adapter.
- Rejects malformed JSON, unsafe keys, non-record roots, excessive depth and size, cycles, and non-finite numbers.
- Preserves application availability when storage access, quota, or deletion is denied.
- Added four integration tests; full evidence: 117/117 tests passed and the production build passed.
- Added a post-build budget of 500 kB for the largest JavaScript asset and 100 kB for combined CSS.

## Phase 23 - Visual Documentation And GitHub Pages Release - 2026-09-13

Status: Repository and GitHub Pages workflow published; DNS cutover pending.

- Added an isolated Chrome capture command and four real application screenshots.
- Added the screenshots to README and the generated learner documentation.
- Added `public/CNAME` for `smarttense.innovalogic.tech` and documented `PAGES_BASE_PATH=/`.
- Documented that Docker is not required for the static Pages deployment and that private-server delivery is a separate future migration.
- Updated safe transitive versions for XML, pattern expansion, NanoID, PostCSS, TAR, and QS; no forced or breaking npm fix was used.
- Security evidence: `npm audit` reports 0 vulnerabilities.
- Release evidence: 117/117 tests passed; mutation score 100% (43/43); 1,130/1,130 unsafe fuzz payloads rejected; 31 documentation pages generated with 0 broken links; production build and bundle budgets passed.
- Mobile evidence: all 12 screens passed at 390x844, 0 horizontal overflow, 0 unnamed buttons, and 0 unlabeled fields.
- Published commits `df04b76` and `6882d1c`; CI and Pages workflows completed successfully after aligning the runners with Node.js 22.
- GitHub Pages reports `built`, an approved certificate, and `https_enforced: true` for `smarttense.innovalogic.tech`.
- External verification is blocked by DNS: the subdomain has an A record to an Ubuntu/Nginx server and no CNAME to `dafermen.github.io`.
- No SSH key was read and no private-server deployment was performed because the requested current target is GitHub Pages.
