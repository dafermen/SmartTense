# SmartTense - Roadmap De Desarrollo Por Fases

Este documento convierte las ideas del curso de ingles revisado en un plan incremental para SmartTense. La direccion del producto es clara: evolucionar de una tabla inteligente de conjugaciones hacia una experiencia guiada de aprendizaje, con teoria, explicaciones, ejemplos, ejercicios, vocabulario y practica oral/escrita.

La intencion no es copiar el curso dentro de la app, sino usar su estructura pedagogica para disenar el siguiente nivel del producto.

## Estado Ejecutivo De Fases

| Fase | Estado | Entregable actual | Evidencia |
| --- | --- | --- | --- |
| Fase 0 - Arquitectura de contenido | Cerrada | `public/data/learningUnits.json`, validador, pruebas y esquema documentado | `npm test` con validacion de contenido |
| Fase 1 - Theory | Cerrada | Pagina Theory renderizada desde JSON, enlazada desde Home y menu | `npm test`, `npm run build`; navegador interno no disponible para captura automatizada |
| Fase 2 - Explicaciones inteligentes | Cerrada | Panel compacto `Why this form?` con patron, razon, auxiliar y forma verbal | `npm test`, `npm run build` |
| Fase 3 - Motor de practica | Cerrada | Pagina Practice con ejercicios iniciales, scoring local y feedback inmediato | `npm test`, `npm run build` |
| Fase 4 - Ruta de aprendizaje | Cerrada | Progreso local por unidad y Home recomienda el siguiente paso | `npm test`, `npm run build` |
| Fase 5 - Vocabulario y contextos | Pendiente | Ejemplos y practica por contexto | No iniciada |
| Fase 6 - Administracion de contenido | Pendiente | Authoring tools para unidades y vocabulario | No iniciada |
| Fase 7 - Speaking, writing y revision | Pendiente | Prompts y cola de revision | No iniciada |

## Lectura Ejecutiva Del Documento Fuente

El documento revisado trabaja un nivel A2 y combina:

- Objetivos claros por unidad.
- Teoria gramatical por tiempo verbal.
- Estructuras afirmativas, negativas, interrogativas e interrogativas negativas.
- Respuestas cortas, reglas ortograficas, palabras senal y errores comunes.
- Ejemplos contextualizados en trabajo de IT, familia, rutinas, escuela/trabajo, vacaciones y movimiento.
- Ejercicios de completar, transformar, elegir tiempo correcto, corregir errores, traducir de espanol a ingles y practicar speaking.
- Temas de soporte que amplian el valor de SmartTense: preposiciones, vocabulario diario y tareas guiadas de speaking/writing.

La oportunidad principal es que SmartTense ya genera estructuras. El siguiente paso es explicar por que funcionan y convertirlas en practica guiada.

## Direccion Del Producto

SmartTense deberia evolucionar hacia un espacio de aprendizaje estructurado:

- `Home`: progreso, recomendaciones y siguiente actividad.
- `Theory`: teoria corta, reglas, ejemplos y errores comunes.
- `Individual`: practica enfocada, inicialmente afirmativa.
- `Complete`: comparacion completa de formas.
- `Practice`: ejercicios interactivos generados desde datos.
- `Settings`: configuracion y administracion de datos/contenido.

Principio clave: cada nueva capacidad debe apoyarse en el motor gramatical y el modelo de datos existente. Evitar crear un visor estatico de curso separado de SmartTense.

## Fases Ejecutivas Y Tareas Operativas

### Fase 0 - Arquitectura De Contenido

Objetivo ejecutivo:

Crear la base para que SmartTense pueda manejar teoria, ejemplos, ejercicios, vocabulario y unidades de aprendizaje como datos estructurados.

Tareas operativas:

- Disenar un esquema JSON para `learningUnits`.
- Definir entidades: unidad, seccion, objetivo, nota gramatical, estructura, ejemplo, ejercicio, vocabulario y contexto.
- Conectar el contenido con `tenseIds`, idioma de interfaz e idioma del estudiante.
- Crear validacion similar a `src/data/validation.js`.
- Crear contenido minimo para Present Simple.
- Agregar pruebas de validacion.
- Documentar el esquema en `docs/LEARNING_CONTENT_SCHEMA.md`.

Entregable:

- SmartTense puede cargar una unidad de aprendizaje desde JSON y rechazar contenido invalido.

Estado:

- Cerrada. Existe una unidad `present-simple-foundation`, un validador dedicado, pruebas automatizadas y documentacion del esquema.

### Fase 1 - Seccion Theory

Objetivo ejecutivo:

Permitir que el usuario lea teoria breve antes de practicar.

Tareas operativas:

- Agregar seccion o pagina `Theory`.
- Crear componentes reutilizables: objetivos, explicacion del tiempo verbal, estructuras, palabras senal, errores comunes y ejemplos.
- Renderizar contenido desde JSON, no hard-coded.
- Conectar teoria con grupos de tiempos existentes.
- Agregar textos de interfaz en ingles/espanol.
- Disenar layout responsive para movil.
- Actualizar documentacion.

Entregable:

- Present Simple tiene una vista de teoria navegable desde la app.

Estado:

- Cerrada. Theory carga `public/data/learningUnits.json`, valida el contenido, renderiza la unidad Present Simple y muestra objetivos, teoria, estructuras, palabras senal, errores comunes, ejemplos y vista previa de ejercicios.

### Fase 2 - Explicaciones Inteligentes

Objetivo ejecutivo:

Hacer que SmartTense explique como se construye una oracion, no solo mostrarla.

Tareas operativas:

- Extender las filas generadas con metadatos explicativos: sujeto, auxiliar, forma verbal, complemento, motivo del tiempo verbal y tipo de forma.
- Agregar panel `Why this form?`.
- Explicar errores comunes como `He doesn't works`.
- Agregar explicaciones en el idioma del estudiante cuando existan.
- Agregar pruebas para helpers de explicacion.

Entregable:

- El usuario puede abrir una oracion y ver una explicacion clara de su estructura.

Estado:

- Cerrada. Las filas generadas incluyen `explanations` por forma, y la UI muestra un panel desplegable `Why this form?` en Complete, tarjetas moviles e Individual.

### Fase 3 - Motor De Practica

Objetivo ejecutivo:

Convertir SmartTense en una herramienta activa de practica.

Tareas operativas:

- Crear pagina `Practice`.
- Implementar ejercicios de completar espacios, escoger tiempo correcto, corregir errores, transformar formas, traducir espanol -> ingles y respuestas cortas.
- Crear normalizacion de respuestas.
- Agregar feedback inmediato.
- Guardar progreso local.
- Generar ejercicios desde verbos, sujetos, tiempos y plantillas.
- Agregar pruebas para scoring y validacion de respuestas.

Entregable:

- Present Simple tiene al menos tres tipos de ejercicios funcionales con feedback.

Estado:

- Cerrada para MVP. Practice renderiza ejercicios desde `learningUnits`, permite escribir respuestas, normaliza/scoring localmente y muestra feedback inmediato. El contenido inicial incluye completar y transformar; mas tipos quedan para iteraciones posteriores de Practice.

### Fase 4 - Ruta De Aprendizaje

Objetivo ejecutivo:

Organizar el aprendizaje en una secuencia guiada.

Tareas operativas:

- Agregar estado de unidad: no iniciada, en progreso, completada.
- Agregar flujo: teoria -> ejemplos -> practica -> revision.
- Actualizar Home para recomendar la siguiente actividad.
- Crear unidades iniciales para presente, pasado, futuro/condicional, preposiciones y speaking/writing.
- Agregar criterios locales de completitud.
- Agregar reset de progreso por unidad en Settings.

Entregable:

- Home puede recomendar el siguiente paso del usuario dentro de una unidad.

Estado:

- Cerrada para MVP. La app guarda progreso local por unidad, marca Theory como visto, marca Practice como completado al responder correctamente todos los ejercicios, recomienda el siguiente paso en Home y permite resetear la unidad desde Settings.

### Fase 5 - Vocabulario Y Contextos

Objetivo ejecutivo:

Hacer que SmartTense genere ejemplos mas cercanos a la vida real del estudiante.

Tareas operativas:

- Crear paquetes de vocabulario: IT work, daily habits, family routines, meetings, travel/vacation y prepositions.
- Conectar vocabulario con complementos y ejercicios.
- Agregar filtros por contexto.
- Agregar tarjetas simples de vocabulario.
- Permitir import/export de vocabulary packs desde Settings.
- Agregar validaciones y pruebas.

Entregable:

- El usuario puede escoger un contexto y ver ejemplos/practicas adaptadas a ese contexto.

### Fase 6 - Administracion De Contenido

Objetivo ejecutivo:

Permitir crecer el contenido sin editar archivos JSON manualmente todo el tiempo.

Tareas operativas:

- Extender Settings para administrar verbos, unidades, teoria, ejercicios y vocabulario.
- Agregar import/export por tipo de contenido.
- Agregar vista previa antes de guardar.
- Agregar validacion con resumen de errores.
- Agregar bulk edit para metadatos de contenido.
- Crear documentacion para autores de contenido.

Entregable:

- Un administrador puede editar contenido de aprendizaje, validarlo y exportarlo como JSON.

### Fase 7 - Speaking, Writing Y Revision

Objetivo ejecutivo:

Soportar practica de produccion, que es donde el estudiante realmente gana fluidez.

Tareas operativas:

- Crear tarjetas de speaking prompts.
- Crear tarjetas de writing prompts.
- Agregar rubricas simples de autoevaluacion.
- Agregar drills con temporizador.
- Guardar intentos localmente.
- Agregar notas del estudiante o profesor.
- Crear cola de revision para errores frecuentes.

Entregable:

- El usuario puede completar una tarea corta de speaking/writing y guardarla para revision.

## Gantt Interno

Fechas internas de referencia. Se pueden ajustar segun prioridad, tiempo disponible y feedback del usuario.

```mermaid
gantt
    title Roadmap SmartTense - Evolucion A Plataforma De Aprendizaje
    dateFormat  YYYY-MM-DD
    axisFormat  %b %d

    section Fundacion
    Fase 0 - Arquitectura de contenido      :done, p0, 2026-07-11, 1d
    Esquema y validacion                    :done, p0a, 2026-07-11, 1d
    Contenido Present Simple                :done, p0b, 2026-07-11, 1d

    section Teoria
    Fase 1 - Theory                         :done, p1, 2026-07-11, 1d
    Componentes de teoria                   :done, p1a, 2026-07-11, 1d
    Vista responsive                        :done, p1b, 2026-07-11, 1d

    section Explicaciones
    Fase 2 - Smart explanations             :done, p2, 2026-07-11, 1d
    Metadatos explicativos                  :done, p2a, 2026-07-11, 1d
    Panel Why this form                     :done, p2b, 2026-07-11, 1d

    section Practica
    Fase 3 - Practice engine                :done, p3, 2026-07-11, 1d
    Modelo de ejercicios                    :done, p3a, 2026-07-11, 1d
    Feedback y scoring                      :done, p3b, 2026-07-11, 1d

    section Ruta
    Fase 4 - Learning path                  :done, p4, 2026-07-11, 1d
    Modelo de progreso                      :done, p4a, 2026-07-11, 1d
    Recomendaciones en Home                 :done, p4b, 2026-07-11, 1d

    section Expansion
    Fase 5 - Vocabulario y contextos        :p5, 2026-07-12, 12d
    Modelo de contextos                     :p5a, 2026-07-12, 5d
    Ejemplos por contexto                   :p5b, after p5a, 7d

    section Administracion
    Fase 6 - Authoring tools                :p6, after p5, 14d
    Import export de contenido              :p6a, after p5, 7d
    Preview y validacion                    :p6b, after p6a, 7d

    section Produccion
    Fase 7 - Speaking y writing             :p7, after p6, 12d
    Prompts y rubricas                      :p7a, after p6, 6d
    Cola de revision                        :p7b, after p7a, 6d
```

## Releases Sugeridos

### Release 1 - Theory MVP

- Fase 0 completa.
- Fase 1 solo con Present Simple.
- Sin motor de practica todavia.

### Release 2 - Explain The Sentence

- Fase 2 para Present Simple, Present Continuous y Present Perfect Simple.
- Explicaciones visibles desde Individual y Complete.

### Release 3 - Practice MVP

- Fase 3 con completar espacios, transformar oracion y elegir tiempo correcto.
- Scoring local.

### Release 4 - Course Mode

- Fase 4 con flujo de Unidad 1.
- Home recomienda la siguiente actividad.

### Release 5 - Content Scale

- Bases de Fase 5 y Fase 6.
- Vocabulario por contexto e import/export de contenido.

## Siguiente Implementacion Recomendada

Continuar con Fase 5:

1. Crear paquetes de vocabulario por contexto.
2. Conectar contextos con ejemplos y ejercicios.
3. Agregar filtro de contexto.
4. Mantener import/export de vocabulario para una fase posterior si aumenta el alcance.
5. Agregar validacion y pruebas del modelo de contexto.

Este paso debe hacer que ejemplos y practica sean mas cercanos al estudiante sin crear todavia herramientas completas de authoring.
