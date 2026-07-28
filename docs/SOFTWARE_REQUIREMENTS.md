# SmartTense - Requerimientos De Software

Fecha base: 2026-07-11.

Este documento traduce el plan curricular en requerimientos funcionales, no funcionales, historias de usuario, criterios de aceptacion y tareas verificables. Es el documento operativo para saber que construir exactamente antes de tocar codigo.

## Relacion Con Otros Documentos

| Documento | Rol |
| --- | --- |
| `INDEX.md` | Dice donde esta cada documento y cual leer primero |
| `CURRICULUM_PHASE_PLAN.md` | Define fases ejecutivas, orden de trabajo y alcance curricular A1-B2 |
| `SOFTWARE_REQUIREMENTS.md` | Define que debe hacer el software y como aceptar cada entrega |
| `PHASE_EXECUTION_LOG.md` | Registra que se ejecuto, que se valido y que quedo cerrado |
| `DEVELOPER_GUIDE.md` | Explica arquitectura, archivos, scripts y reglas tecnicas |

## Estados Permitidos

| Estado | Significado |
| --- | --- |
| Proposed | Requerimiento definido pero aun no aprobado para construir |
| Ready | Listo para desarrollo en la fase activa |
| In Progress | En implementacion local |
| Done | Implementado, probado y documentado |
| Deferred | Valido, pero fuera del alcance actual |
| Blocked | No se puede avanzar sin decision o cambio previo |

## Trazabilidad Por Fase

| Fase | Documento ejecutivo | Requerimientos principales | Estado |
| --- | --- | --- | --- |
| Fase 11 - Revision del modelo de contenido | `CURRICULUM_PHASE_PLAN.md` | FR-001, FR-002, FR-003, NFR-003, NFR-008 | Done |
| Fase 12 - A1 Foundation MVP | `CURRICULUM_PHASE_PLAN.md` | FR-004, FR-005, FR-006, FR-009 | Done |
| Fase 13 - A2 Expansion Dario | `CURRICULUM_PHASE_PLAN.md` | FR-004, FR-005, FR-006, FR-010 | Done |
| Fase 14 - B1 Functional Communication | `CURRICULUM_PHASE_PLAN.md` | FR-005, FR-006, FR-011 | Done |
| Fase 15 - B2 Independent Production | `CURRICULUM_PHASE_PLAN.md` | FR-006, FR-012, NFR-001, NFR-006 | Done |
| Fase 16 - Diagnostico y ruta recomendada | `CURRICULUM_PHASE_PLAN.md` | FR-003, FR-007, FR-008, FR-009 | Done |
| Fase 17 - Production por unidad y revision guiada | `CURRICULUM_PHASE_PLAN.md` | FR-006, FR-009, NFR-001, NFR-008 | Done |
| Fase 18 - Pulido UX mobile MVP | `CURRICULUM_PHASE_PLAN.md` | NFR-001, NFR-006, NFR-010 | Done |
| Fase 19 - Revision de contenido y gaps A1-A2 | `CURRICULUM_PHASE_PLAN.md` | FR-004, FR-005, FR-006, NFR-010 | Ready |

## Requerimientos Funcionales

### FR-001 - Metadata Curricular Por Nivel

**Estado:** Done.

El sistema debe poder representar unidades por nivel CEFR sin romper unidades existentes.

**Alcance minimo:**

- identificar nivel objetivo: A1, A2, B1 o B2;
- definir orden recomendado de unidades;
- declarar prerequisitos cuando una unidad depende de otra;
- mantener compatibilidad con unidades actuales.

**Criterios de aceptacion:**

- `public/data/learningUnits.json` puede expresar nivel, orden y prerequisitos o se documenta la brecha exacta;
- el validador acepta casos validos y rechaza casos invalidos;
- `LEARNING_CONTENT_SCHEMA.md` explica los campos que se agreguen o confirme que no hacen falta.

### FR-002 - Validacion De Contenido Curricular

**Estado:** Done.

Todo contenido editable o importable debe validarse antes de llegar al estado de la app.

**Alcance minimo:**

- validar IDs seguros y unicos;
- validar referencias entre unidades, contextos, ejercicios y tense IDs;
- rechazar campos desconocidos cuando el schema lo exija;
- rechazar strings peligrosos, demasiado largos o con markup.

**Criterios de aceptacion:**

- pruebas cubren contenido valido e invalido;
- Settings no aplica contenido invalido;
- los mensajes de error ayudan a corregir el JSON.

### FR-003 - Ruta De Aprendizaje Por Unidad

**Estado:** Done.

Home debe recomendar el siguiente paso segun unidad activa, teoria vista y practica completada.

**Alcance minimo:**

- conservar progreso local por unidad;
- recomendar Theory, Practice o siguiente unidad;
- permitir reset desde Settings;
- no requerir servidor ni cuenta.

**Criterios de aceptacion:**

- Home muestra recomendacion coherente;
- progreso se mantiene en el navegador actual;
- reset no borra datos de verbos ni contenido importado, salvo accion explicita.

### FR-004 - Theory Por Nivel Y Unidad

**Estado:** Done.

Theory debe mostrar contenido curricular de una unidad de forma clara y apta para mobile.

**Alcance minimo:**

- objetivos;
- explicacion breve;
- estructuras;
- ejemplos;
- errores comunes;
- vocabulario contextual;
- filtros de contexto cuando existan.

**Criterios de aceptacion:**

- una unidad A1/A2 abre sin overflow critico en mobile;
- textos largos no rompen botones, tablas ni tarjetas;
- contenido se renderiza desde JSON, no hardcodeado en componentes.

### FR-005 - Practice Por Nivel Y Unidad

**Estado:** Done.

Practice debe ejecutar ejercicios asociados a la unidad activa.

**Alcance minimo:**

- soportar los tipos actuales: `fillBlank`, `transform`, `chooseTense`, `correctMistake`, `translation`;
- filtrar por contexto cuando aplique;
- mostrar feedback inmediato;
- mantener scoring local por sesion o unidad segun comportamiento existente.

**Criterios de aceptacion:**

- cada unidad nueva tiene ejercicios validos;
- las respuestas se normalizan para evitar falsos negativos obvios;
- pruebas cubren extraccion, filtro y scoring.

### FR-006 - Production Speaking/Writing

**Estado:** Done.

Production debe ofrecer prompts alineados con la unidad activa y permitir revisar intentos locales.

**Alcance minimo:**

- prompts por modo: speaking y writing;
- estado de intento: draft, done, needs review, approved;
- editar, cancelar edicion y eliminar con confirmacion;
- filtros por modo y estado.

**Criterios de aceptacion:**

- prompts nuevos tienen tense IDs validos;
- la cola se puede filtrar sin perder intentos;
- mobile smoke cubre Production sin campos sin etiqueta.

### FR-007 - Diagnostico MVP

**Estado:** Done.

El sistema debe ofrecer un diagnostico simple para sugerir nivel inicial.

**Alcance minimo:**

- preguntas cortas por nivel;
- resultado local: A1, A2, B1 o B2 sugerido;
- opcion de reset;
- sin servidor, login ni analitica externa.

**Criterios de aceptacion:**

- el diagnostico no bloquea el uso manual de la app;
- Home puede usar la recomendacion local;
- `USER_GUIDE.md` explica privacidad y reset.

### FR-008 - Configuracion Local

**Estado:** Proposed.

Settings debe concentrar configuracion y administracion local sin mezclar flujos de estudio.

**Alcance minimo:**

- reset de progreso;
- importar/exportar verbos;
- importar/exportar learning content;
- administrar datos con busqueda, orden, paginacion, edicion individual y modo bulk opcional.

**Criterios de aceptacion:**

- acciones destructivas piden confirmacion;
- tablas grandes usan paginacion;
- exportaciones son JSON validos.

### FR-009 - Privacidad Y Persistencia Local

**Estado:** Done.

El proyecto debe funcionar como app estatica sin subir progreso ni contenido del usuario.

**Alcance minimo:**

- progreso en localStorage;
- intentos de Production locales;
- importaciones locales por sesion/navegador;
- documentacion clara para usuario final.

**Criterios de aceptacion:**

- no se agregan llamadas de red para progreso;
- `SECURITY.md` y `USER_GUIDE.md` siguen alineados si cambia persistencia.

### FR-010 - Expansion A2 Desde Documento Dario

**Estado:** Done.

El contenido A2 del documento de Dario debe convertirse en unidades pequenas y navegables.

**Alcance minimo:**

- Present Simple;
- Present Continuous;
- Present Perfect Simple;
- Present Perfect Continuous;
- Prepositions;
- Daily Habits;
- speaking/writing.

**Criterios de aceptacion:**

- no se crea una unidad gigante dificil de usar en mobile;
- cada unidad tiene objetivos, teoria, ejercicios y prompts;
- contenido queda trazado a Fase 13.

### FR-011 - Transferencia Entre Tiempos B1

**Estado:** Done.

Practice debe ayudar a elegir entre tiempos segun contexto, no solo llenar formas aisladas.

**Alcance minimo:**

- ejercicios de decision de tiempo;
- contraste entre pasado, futuro y condicional;
- ejemplos de trabajo, viajes, reuniones y problemas cotidianos.

**Criterios de aceptacion:**

- feedback explica por que un tiempo es correcto;
- Production tiene prompts de narracion y resolucion de problemas.

### FR-012 - Produccion Independiente B2

**Estado:** Done.

B2 debe enfocarse en produccion extendida, precision y coherencia.

**Alcance minimo:**

- prompts largos;
- rubricas mas exigentes;
- conectores y registro;
- correccion avanzada de errores.

**Criterios de aceptacion:**

- la UI no se vuelve pesada en mobile;
- rubricas son claras y accionables;
- ejercicios no dependen de evaluacion automatica no implementada.

## Requerimientos No Funcionales

| ID | Requerimiento | Criterio de aceptacion |
| --- | --- | --- |
| NFR-001 | Mobile-first | `npm run test:e2e:mobile` verde en `390x844` |
| NFR-002 | App estatica | No se agrega backend para fases A1-B2 MVP |
| NFR-003 | Seguridad de importacion | JSON invalido, grande o peligroso se rechaza antes de aplicar |
| NFR-004 | Rendimiento | Settings mantiene paginacion y smoke mobile valida 500 verbos sinteticos |
| NFR-005 | Accesibilidad basica | Main landmark, navegacion con nombre, botones con nombre y campos con label |
| NFR-006 | Legibilidad | Textos no deben desbordar contenedores en mobile |
| NFR-007 | Mantenibilidad | Contenido curricular vive en datos; UI solo renderiza/filtra/guia |
| NFR-008 | Testabilidad | Cambios de schema, Practice, Production o Settings agregan pruebas |
| NFR-009 | Compatibilidad | Unidades existentes siguen funcionando despues de ampliar schema |
| NFR-010 | Documentacion | Cada fase actualiza indice, requerimientos, guia afectada y log de evidencia |

## Historias De Usuario

### HU-001 - Autor De Contenido Define Una Unidad

Como autor de contenido, quiero definir una unidad con nivel, objetivos, teoria, ejemplos, vocabulario y ejercicios, para que la app pueda mostrarla sin cambiar codigo.

**Aceptacion:**

- la unidad valida contra el schema;
- Theory y Practice la pueden renderizar;
- los errores de validacion son claros.

### HU-002 - Estudiante Sigue Una Ruta Recomendada

Como estudiante, quiero que Home me diga cual es el siguiente paso, para no perderme entre Theory, Practice, Individual, Production y Complete.

**Aceptacion:**

- Home muestra una recomendacion basada en progreso local;
- puedo abrir la accion recomendada;
- puedo cambiar de unidad manualmente.

### HU-003 - Estudiante Practica Segun Su Nivel

Como estudiante, quiero practicar ejercicios de mi unidad actual, para reforzar lo que acabo de leer.

**Aceptacion:**

- Practice carga ejercicios de la unidad activa;
- recibo feedback inmediato;
- el contador de aciertos no se rompe al filtrar por contexto.

### HU-004 - Estudiante Produce Speaking/Writing

Como estudiante, quiero responder prompts de speaking o writing, para practicar comunicacion real y revisar mis intentos.

**Aceptacion:**

- puedo crear, editar, cancelar edicion y eliminar intentos;
- puedo filtrar por modo y estado;
- las acciones destructivas piden confirmacion.

### HU-005 - Administrador Local Actualiza Datos

Como administrador local, quiero importar, exportar, buscar, ordenar, paginar y editar datos, para mantener la base sin tocar codigo cuando sea posible.

**Aceptacion:**

- la tabla es paginada;
- editar un registro tiene opcion clara de cancelar;
- bulk edit es opcional y no se activa por accidente.

### HU-006 - Estudiante Recibe Nivel Sugerido

Como estudiante, quiero hacer un diagnostico corto, para saber si debo empezar en A1, A2, B1 o B2.

**Aceptacion:**

- puedo saltar el diagnostico;
- el resultado se guarda localmente;
- puedo reiniciar el diagnostico desde Settings.

## Backlog Operativo Inmediato

### Fase 11 - Revision Del Modelo De Contenido

1. Revisar si `learningUnits` soporta `level`, `order`, `prerequisites` y agrupacion por ruta. **Done**: schema v3 agrega `cefrLevel`, `unitOrder` y `prerequisiteUnitIds`.
2. Revisar si el validador actual permite esos campos o los rechazaria. **Done**: el validador acepta los campos nuevos y mantiene compatibilidad con schema v1/v2.
3. Decidir si el cambio requiere schema nuevo o solo convencion documental. **Done**: se uso schema v3 porque agrega contrato curricular verificable.
4. Agregar pruebas de validacion para nivel, orden y prerequisitos si se implementan. **Done**: pruebas cubren metadata, CEFR invalido, prerequisito desconocido y orden duplicado.
5. Actualizar `LEARNING_CONTENT_SCHEMA.md`. **Done**.
6. Actualizar `DEVELOPER_GUIDE.md` con reglas para autores/desarrolladores. **Done**.
7. Ejecutar `npm run release:check`. **Done**.
8. Registrar evidencia en `PHASE_EXECUTION_LOG.md`. **Done**.

### Fase 12 - A1 Foundation MVP

1. Crear primera unidad A1 antes de Present Simple. **Done**: `be-have-foundation` cubre `be`, `have` y `there is/are`.
2. Ajustar ruta A1 inicial. **Done**: Present Simple queda en orden 2 y depende de `be-have-foundation`.
3. Agregar ejercicios iniciales A1. **Done**: fillBlank, transform, correctMistake y chooseTense.
4. Agregar Production prompt A1. **Done**: `a1-personal-introduction`.
5. Crear 1 a 3 unidades A1 adicionales. **Done**: `personal-information-questions` completa el MVP minimo de 3 unidades A1.
6. Revisar si Production debe filtrar prompts por unidad activa. **Done**: se mantiene global por ahora; hay prompts A1 disponibles sin nuevo filtro.
7. Ejecutar `npm run release:check` para cierre de fase. **Done**.
8. Registrar evidencia final de Fase 12 en `PHASE_EXECUTION_LOG.md`. **Done**.

### Fase 13 - A2 Expansion Dario

1. Dividir el contenido A2 del documento de Dario en unidades pequenas. **Done**: se agregaron 4 unidades A2.
2. Migrar teoria y estructuras A2 a `learningUnits`. **Done**.
3. Migrar ejercicios A2 al formato validado. **Done**.
4. Agregar vocabulario/contextos A2. **Done**.
5. Agregar prompts de Production A2. **Done**.
6. Ejecutar `npm run release:check`. **Done**.
7. Registrar evidencia final de Fase 13 en `PHASE_EXECUTION_LOG.md`. **Done**.

### Fase 14 - B1 Functional Communication

1. Revisar la unidad B1 existente `past-future-conditional-foundation`. **Done**.
2. Separar o ampliar B1 si la unidad actual queda demasiado densa. **Done**: se agrego `b1-narratives-plans-problems` como segunda unidad B1.
3. Agregar ejercicios de transferencia entre tiempos. **Done**: B1 incluye decision de tiempo, transformacion y correccion contextual.
4. Agregar prompts de Production B1. **Done**: `b1-problem-story` y `b1-plan-solution`.

### Fase 15 - B2 Independent Production

1. Definir unidad B2 inicial para produccion independiente. **Done**: `b2-mixed-tenses-independent-production`.
2. Agregar teoria de mixed tenses, pasiva, reported speech, conectores y condicional pasado. **Done**.
3. Agregar ejercicios B2 de transformacion, correccion, eleccion de estructura y traduccion. **Done**.
4. Agregar prompts B2 con rubrica mas exigente. **Done**: `b2-independent-summary` y `b2-mixed-speaking`.
5. Validar que A1 -> A2 -> B1 -> B2 mantenga prerequisitos claros. **Done**.

### Fase 16 - Diagnostico Y Ruta Recomendada

1. Definir diagnostico MVP por nivel CEFR. **Done**: autoevaluacion de 4 checks A1, A2, B1 y B2.
2. Guardar resultado local y permitir reset. **Done**: respuestas persistidas en settings locales y reset desde Home/Settings.
3. Conectar Home con recomendacion de nivel sugerido. **Done**: Home muestra nivel/unidad sugerida y puede aplicar la recomendacion.
4. Documentar privacidad y flujo de diagnostico. **Done**.

### Fase 17 - Production Por Unidad Y Revision Guiada

1. Definir si los prompts deben filtrarse por unidad activa o por CEFR. **Done**: se usan `unitIds` y `cefrLevel`.
2. Mantener Production global como fallback. **Done**: el composer permite Suggested prompts o All prompts.
3. Mostrar prompts sugeridos segun ruta sin perder intentos existentes. **Done**: la cola de intentos queda global.
4. Actualizar pruebas y smoke mobile si cambia la UI de Production. **Done**.

### Fase 18 - Pulido UX Mobile MVP

1. Revisar densidad visual de Home y Production tras diagnostico y prompts sugeridos. **Done**.
2. Reducir texto/controles si el smoke o revision manual muestra congestion. **Done**: Home agrega filtro segmentado compacto `All/A1/A2/B1/B2`.
3. Mantener comportamiento funcional sin nuevas features. **Done**.
4. Ejecutar `npm run release:check`. **Pending**.

### Fase 19 - Revision De Contenido Y Gaps A1-A2

1. Revisar si A1 y A2 necesitan mas unidades o ejercicios antes de enriquecer B1/B2. **Ready**.
2. Identificar gaps pedagogicos por nivel sin implementar cambios aun. **Pending**.
3. Priorizar mejoras pequenas de contenido sobre nuevas pantallas. **Pending**.
4. Mantener la ruta actual estable. **Pending**.

## Plantilla Para Nuevos Requerimientos

```text
### FR-XXX - Nombre

Estado:
Fase:
Usuario principal:

Descripcion:

Alcance minimo:
- 

Fuera de alcance:
- 

Criterios de aceptacion:
- 

Pruebas esperadas:
- 

Documentacion a actualizar:
- 
```

## Regla De Cierre

Ninguna tarea de fase debe considerarse completa si no tiene:

- requerimiento relacionado;
- criterio de aceptacion;
- prueba o validacion manual definida;
- documentacion actualizada;
- evidencia registrada en `PHASE_EXECUTION_LOG.md`.

### Fase 20 - Experiencia De Estudio Y Continuidad

1. Mantener visible el feedback antes de cerrar Practice. **Done localmente**.
2. Permitir reintentar respuestas incorrectas. **Done localmente**.
3. Conservar errores recientes dentro del progreso local existente. **Done localmente**.
4. Priorizar esos errores en Adaptive Review. **Done localmente**.
5. Abrir el siguiente paso real desde Home. **Done localmente**.
6. Documentar continuidad para futuras sesiones de Codex. **Done localmente**.
7. Ejecutar pruebas, build y smoke mobile. **Pending**.
