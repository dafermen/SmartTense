# SmartTense - Indice De Documentacion

Fecha de reorganizacion: 2026-07-11.

Este indice es el punto de entrada oficial para ubicarse en el proyecto. Si dos documentos parecen contradecirse, usar este orden de prioridad:

1. `PHASE_EXECUTION_LOG.md` para estado real, fase activa y evidencia ejecutada.
2. `CURRICULUM_PHASE_PLAN.md` para nuevas fases ejecutivas y tareas operativas.
3. `PROJECT_PHASE_ROADMAP.md` para historial del producto y fases cerradas.
4. Guias por rol para detalles de uso, desarrollo, datos y publicacion.

## Leer Primero

| Necesidad | Documento |
| --- | --- |
| Saber que fase esta activa | `PHASE_EXECUTION_LOG.md` |
| Planear el siguiente nivel curricular A1-B2 | `CURRICULUM_PHASE_PLAN.md` |
| Entender que ya se construyo | `PROJECT_PHASE_ROADMAP.md` |
| Ejecutar validacion antes de publicar | `RELEASE_CHECKLIST.md` |
| Trabajar como desarrollador | `DEVELOPER_GUIDE.md` |
| Empezar como desarrollador junior | `JUNIOR_DEVELOPER_GUIDE.md` |
| Usar la app como estudiante | `USER_GUIDE.md` |

## Documentos Activos

### Producto, fases y evidencia

- `CURRICULUM_PHASE_PLAN.md`: guia oficial para convertir el documento de Dario en una ruta por niveles A1, A2, B1 y B2, con fases ejecutivas, tareas operativas, criterios de salida y Gantt interno.
- `PHASE_EXECUTION_LOG.md`: bitacora de ejecucion. Registra fase activa, tareas, evidencia, riesgos y cierre.
- `PROJECT_PHASE_ROADMAP.md`: roadmap historico del producto, con fases ya cerradas y contexto ejecutivo.
- `RELEASE_CHECKLIST.md`: checklist obligatorio para cambios de fase, UI, datos, Settings, contenido o Production.

### Guias tecnicas

- `DEVELOPER_GUIDE.md`: arquitectura, archivos principales, scripts, validacion y flujo de desarrollo.
- `JUNIOR_DEVELOPER_GUIDE.md`: pasos seguros para contribuir sin romper flujos existentes.
- `DATA_SCHEMA.md`: formato aceptado para la base de verbos.
- `LEARNING_CONTENT_SCHEMA.md`: formato aceptado para unidades de aprendizaje, contextos, vocabulario, ejemplos y ejercicios.

### Uso, publicacion y seguridad

- `USER_GUIDE.md`: guia para estudiantes y usuarios no tecnicos.
- `GITHUB_PAGES.md`: publicacion con GitHub Pages y flujo local de release.
- `SECURITY.md`: modelo de seguridad para app estatica, limites de JSON e importaciones.

## Documentos Consolidados

Estos documentos historicos fueron reemplazados por `CURRICULUM_PHASE_PLAN.md` y ya no deben usarse como fuente activa:

- `DEVELOPMENT_PHASE_EXECUTION_PLAN.md`
- `DEVELOPMENT_ROADMAP_INCREMENTAL.md`
- `PHASE_PLAN_DARIO_UNIT1_BY_OPERATIONS.md`
- `PROJECT_PHASE_EXECUTION_PLAN_FROM_DARIO.md`
- `SMARTTENSE_PHASE_PLAN_DARIO_INCREMENTAL.md`

La informacion util de esos planes se migro a:

- `CURRICULUM_PHASE_PLAN.md`: fases nuevas, tareas operativas, criterios de salida y Gantt.
- `PROJECT_PHASE_ROADMAP.md`: contexto historico del producto.
- `PHASE_EXECUTION_LOG.md`: estado real y evidencia.

## Comandos De Validacion

Antes de cerrar una fase o publicar cambios:

```bash
npm run release:check
```

Ese comando ejecuta:

```bash
git diff --check
node --check scripts/mobile-smoke.cjs
npm test
npm run build
npm run test:e2e:mobile
```

Si el cambio afecta solo documentacion, el release check sigue siendo el criterio preferido porque protege referencias, build, pruebas y smoke mobile antes de empujar a GitHub.

## Regla De Trabajo

No abrir una fase nueva de desarrollo sin:

1. objetivo ejecutivo claro;
2. tareas operativas detalladas;
3. criterio de salida verificable;
4. evidencia esperada;
5. actualizacion de `PHASE_EXECUTION_LOG.md`.
