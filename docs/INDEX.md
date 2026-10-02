# SmartTense - Indice De Documentacion

Fecha de reorganizacion: 2026-07-11.

Este indice es el punto de entrada oficial para ubicarse en el proyecto. Si dos documentos parecen contradecirse, usar este orden de prioridad:

1. `PHASE_EXECUTION_LOG.md` para estado real, fase activa y evidencia ejecutada.
2. `CURRICULUM_PHASE_PLAN.md` para nuevas fases ejecutivas y tareas operativas.
3. `SOFTWARE_REQUIREMENTS.md` para requerimientos funcionales, no funcionales, historias de usuario y criterios de aceptacion.
4. `PROJECT_PHASE_ROADMAP.md` para historial del producto y fases cerradas.
5. Guias por rol para detalles de uso, desarrollo, datos y publicacion.

## Leer Primero

| Necesidad | Documento |
| --- | --- |
| Saber que fase esta activa | `PHASE_EXECUTION_LOG.md` |
| Planear el siguiente nivel curricular A1-B2 | `CURRICULUM_PHASE_PLAN.md` |
| Ver requerimientos, historias y criterios | `SOFTWARE_REQUIREMENTS.md` |
| Entender que ya se construyo | `PROJECT_PHASE_ROADMAP.md` |
| Ejecutar validacion antes de publicar | `RELEASE_CHECKLIST.md` |
| Trabajar como desarrollador | `DEVELOPER_GUIDE.md` |
| Empezar como desarrollador junior | `JUNIOR_DEVELOPER_GUIDE.md` |
| Usar la app como estudiante | `USER_GUIDE.md` |

## Documentos Activos

### Producto, fases y evidencia

- `CURRICULUM_PHASE_PLAN.md`: guia oficial para convertir el documento de Dario en una ruta por niveles A1, A2, B1 y B2, con fases ejecutivas, tareas operativas, criterios de salida y Gantt interno.
- `SOFTWARE_REQUIREMENTS.md`: requerimientos funcionales, no funcionales, historias de usuario, criterios de aceptacion y backlog operativo inmediato.
- `PHASE_EXECUTION_LOG.md`: bitacora de ejecucion. Registra fase activa, tareas, evidencia, riesgos y cierre.
- `PROJECT_PHASE_ROADMAP.md`: roadmap historico del producto, con fases ya cerradas y contexto ejecutivo.
- `CONTENT_GAPS_A1_A2.md`: auditoria de cobertura, calidad editorial y backlog priorizado para A1/A2.
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
npm run audit:content
npm run audit:translations
npm test
npm run test:mutation
npm run test:fuzz
npm run build
npm run check:bundle
npm run test:e2e:mobile
```

Si el cambio afecta solo documentacion, el release check sigue siendo el criterio preferido porque protege referencias, build, pruebas y smoke mobile antes de empujar a GitHub.

## Regla De Trabajo

No abrir una fase nueva de desarrollo sin:

1. objetivo ejecutivo claro;
2. tareas operativas detalladas;
3. requerimientos funcionales/no funcionales relacionados;
4. criterio de salida verificable;
5. evidencia esperada;
6. actualizacion de `PHASE_EXECUTION_LOG.md`.

## Continuidad Entre Sesiones

- `../AGENTS.md`: instrucciones breves para cualquier agente que trabaje en el repositorio.
- `../CURRENT_STATUS.md`: estado operativo actual, ultima fase implementada, validacion pendiente y siguientes pasos.

Lea estos dos archivos antes del roadmap cuando retome trabajo iniciado por otra sesion.

## Canonical Engineering Documentation

- [Architecture](ARCHITECTURE.md)
- [API](API.md)
- [Development](DEVELOPMENT.md)
- [Testing](TESTING.md)
- [Deployment](DEPLOYMENT.md)
- [Operations](OPERATIONS.md)
- [Security](SECURITY.md)
- [Troubleshooting](TROUBLESHOOTING.md)
- [ADRs](adr/README.md)
- [Current Status](../CURRENT_STATUS.md)
- [Changelog](../CHANGELOG.md)
- [Contributing](../CONTRIBUTING.md)

## DOC-STD-20261002 — Canonical sources

Documentation standard v1.0 · reviewed 2026-10-02. Primary language: English.

Local-first language learning web application with mobile shells.

The root CURRENT_STATUS is canonical; docs/CURRENT_STATUS is already a compatibility pointer, not a competing status source. Preserve that pointer. Curriculum data belongs in public/data and learner progress stays local. Do not infer custom-domain readiness from the GitHub Pages build.

| Need | Authoritative source |
| --- | --- |
| Presentation | [README.md](../README.md) |
| Current state | [CURRENT_STATUS.md](../CURRENT_STATUS.md) |
| Development | [docs/DEVELOPMENT.md](DEVELOPMENT.md) |
| Architecture | [docs/ARCHITECTURE.md](ARCHITECTURE.md) |
| Usage | [docs/USER_GUIDE.md](USER_GUIDE.md) |
| API / contracts | [docs/API.md](API.md) |
| Testing | [docs/TESTING.md](TESTING.md) |
| Security | [docs/SECURITY.md](SECURITY.md) |
| Deployment | [docs/DEPLOYMENT.md](DEPLOYMENT.md) |
| Operations | [docs/OPERATIONS.md](OPERATIONS.md) |
| Troubleshooting | [docs/TROUBLESHOOTING.md](TROUBLESHOOTING.md) |
| Curriculum | [docs/CURRICULUM_PHASE_PLAN.md](CURRICULUM_PHASE_PLAN.md) |
| Execution history | [docs/PHASE_EXECUTION_LOG.md](PHASE_EXECUTION_LOG.md) |
| Data schema | [docs/LEARNING_CONTENT_SCHEMA.md](LEARNING_CONTENT_SCHEMA.md) |
| History | [CHANGELOG.md](../CHANGELOG.md) |
| Decisions | [docs/adr/README.md](adr/README.md) |

Start with the presentation and current state, then read the user guide to try the product, development/architecture to contribute, or deployment/operations to maintain it. The existing detailed index remains valid.

### Evidence and updates

Keep current state, change history and decisions separate. Existing dated test results remain historical evidence. Adding this map does not rerun every documented command or complete pending product acceptance. Record actual checks, their environment and unresolved limits before publication.

Update the source guide whenever commands, configuration, behavior, permissions or deployment change. Keep existing links and portal routes stable. Use real screenshots with synthetic data; never publish env values, access keys, user data or operational logs. A local commit, a remote commit and a deployed artifact are separate states.
