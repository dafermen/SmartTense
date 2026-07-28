# SmartTense - Auditoria De Contenido A1-A2

Fecha: 2026-07-21.

## Objetivo

Cerrar la Fase 19 con una revision reproducible del contenido A1/A2 y un backlog limitado antes de modificar la experiencia de leccion.

## Linea Base

- 7 unidades objetivo: 3 A1 y 4 A2.
- 112 ejercicios: 44 A1 y 68 A2.
- Auditoria base: 0 errores bloqueantes, 52 warnings y 5 brechas de cobertura contextual.
- Cobertura pendiente: Present Simple tiene gaps en Meetings y Family Routines; tres unidades A2 tienen gap en Family Routines.
- Auditoria base: 0 errores bloqueantes, 52 warnings y 5 brechas de cobertura contextual.
- Cobertura pendiente: Present Simple tiene gaps en Meetings y Family Routines; tres unidades A2 tienen gap en Family Routines.
- Cada unidad conserva teoria, estructuras, errores comunes, ejemplos, vocabulario y ejercicios.
- El schema ya acepta `learnerContext`, `pronunciationDrills` y `productionTask`, pero las unidades activas todavia no usan esos bloques.
- Practice puede generar opciones como fallback, pero el contenido editorial debe guardar distractores propios siempre que sea posible.

## Hallazgos Prioritarios

### P0 - Integridad Del Contenido

- Mantener una sola respuesta valida dentro de `options`.
- Evitar opciones duplicadas despues de normalizar mayusculas y espacios.
- Mantener IDs de ejercicios unicos.
- Ejecutar `npm run audit:content` antes de cerrar cambios curriculares.

### P1 - Cobertura Contextual

- Completar los contextos que tienen menos de 5 ejercicios en una unidad.
- Priorizar Family Routines en Present Perfect, Present Perfect Continuous y Prepositions A2.
- Revisar los ejercicios sin contexto y asignarlos solo cuando exista una relacion pedagogica real.
- No interpretar `All contexts` como una categoria de contenido: es una opcion de visualizacion.

### P1 - Metodologia Dario

- Activar `learnerContext` en el piloto A2.
- Agregar drills de pronunciacion con foco en `-s`, `-ing`, `-ed` y auxiliares.
- Integrar una tarea final de speaking/writing con estructuras requeridas y checklist.
- Evitar duplicar ejercicios entre `sections.exercises` y colecciones metodologicas opcionales.

### P1 - Revision Editorial Del Documento Fuente

El documento fuente se usa como blueprint, no como contenido listo para importar. Antes de migrar frases se deben corregir:

- pronombres inconsistentes dentro del mismo ejemplo;
- interrogativas negativas incorrectas como `isn't I`;
- expresiones de tiempo incompatibles, por ejemplo `last week` cuando la estructura requiere `since last week`;
- articulos y preposiciones omitidos, por ejemplo `arrives at school`;
- errores tipograficos como `projhect`, `Struture` y palabras incompletas.

## Puerta Automatica De Calidad

El comando `npm run audit:content` revisa A1/A2 y clasifica resultados:

- `error`: bloquea el cierre porque puede producir respuestas ambiguas o contenido estructuralmente invalido;
- `warning`: identifica deuda curricular, cobertura insuficiente o metodologia aun no activada.

Los warnings forman el backlog de contenido. No bloquean esta fase porque su objetivo es identificarlos y priorizarlos.

## Decision Para La Siguiente Fase

La Fase 20 implementara una unidad piloto A2 con recorrido guiado y mobile-first. Reutilizara los ejercicios existentes por ID y activara los campos metodologicos sin crear copias del mismo contenido.

## Resultado Posterior - Fase 21

- El banco A1/A2 contiene 131 ejercicios.
- Todos los ejercicios A1/A2 tienen opciones curadas.
- La auditoria reporta 0 errores y 0 gaps contextuales.
- Los warnings bajaron de 52 a 12 y ahora se concentran en metodologia, tipos de practica pendientes y un ejercicio compartido sin contexto.

## Resultado Posterior - Fase 22

- Las cuatro unidades A2 estan listas para Guided Lesson.
- Cada unidad A2 incluye contexto, pronunciacion y produccion final.
- La auditoria mantiene 0 errores y 0 gaps; los warnings bajan a 9.
- Los warnings A2 restantes corresponden exclusivamente a tipos de practica pendientes para la Fase 23.

## Resultado Posterior - Fase 23

- El banco A1/A2 contiene 137 ejercicios.
- Cada unidad A2 cubre los cinco tipos de practica requeridos.
- La auditoria mantiene 0 errores y 0 gaps; los warnings bajan a 5.
- Los warnings restantes corresponden a metodologia A1, una traduccion A1 pendiente y un ejercicio compartido sin contexto deliberado.

## Resultado Posterior - Fase 24

- El banco A1/A2 contiene 138 ejercicios.
- Las siete unidades A1/A2 estan listas para Guided Lesson.
- La auditoria queda en 0 errores, 0 warnings y 0 gaps contextuales.
