# Metodología Dario para SmartTense (Fase 19+)

**Fecha base:** 2026-07-19  
**Ámbito:** Retomar y formalizar el enfoque del PDF de Dario como *metodología de curso*, no como “más JSON”.
**Estado:** Fase 22 cerrada con Guided Lesson activa en las cuatro unidades A2.

## Resultado Implementado

- Las cuatro unidades A2 activan `learnerContext`, `pronunciationDrills` y `productionTask`.
- Theory abre una Guided Lesson mobile-first sin agregar otro item al menu.
- La secuencia reutiliza los ejercicios existentes y evita mantener copias en colecciones paralelas.
- La prueba mobile abre las cuatro Guided Lessons en `390x844` y verifica ausencia de overflow horizontal.
- Cada unidad A2 contiene practica controlada de completar, transformar, elegir, corregir y traducir.

## Objetivo de esta fase

- Documentar el blueprint pedagógico de Dario y convertirlo en una estructura de implementación para SmartTense.
- Comparar ese blueprint con el estado actual del contenido A2.
- Proponer un cambio mínimo de modelo que preserve el contrato actual y permita escalar a A1/B1/B2 sin romper la app.

## Estructura objetivo por unidad (sugerida)

```json
{
  "level": "A2",
  "unit": "Present Tenses and Daily Habits",
  "learnerContext": "daily life, family, IT work",
  "objectives": [],
  "theory": [],
  "grammarBlocks": [],
  "examples": [],
  "controlledPractice": [],
  "contrastPractice": [],
  "mistakeCorrection": [],
  "translationPractice": [],
  "vocabulary": [],
  "pronunciationDrills": [],
  "productionTask": {
    "prompt": "",
    "requiredStructures": [],
    "checklist": []
  }
}
```

## Lo que hoy ya existe en el JSON actual (mapa A2 real)

- Unidades A2 existentes:
  - `a2-present-continuous-actions`
  - `a2-present-perfect-experiences`
  - `a2-present-perfect-continuous-duration`
  - `a2-prepositions-daily-habits`
- Cobertura fuerte ya presente:
  - `objectives`
  - teoría y señalización de usos mediante sección `theory`
  - `structures` por forma (affirmative/negative/questionPositive)  
  - `examples`
  - `vocabulary`
  - ejercicios controlados por tipos `fillBlank`, `transform`, `chooseTense`, `correctMistake`, `translation`
  - sección de errores (`commonMistakes`)
- Falta de soporte explícito de metodología del documento:
  - no hay `learnerContext` normalizado como campo de unidad
  - no hay bloques explícitos `grammarBlocks` (se usan `sections -> structures`)
  - no hay `pronunciationDrills`
  - no hay `productionTask` estructurado en la unidad (solo prompts en archivo separado)
  - no hay bloque explícito `contrastPractice` por unidad (sí hay `chooseTense`, pero sin separación semántica)

## Diferencia entre propuesta del PDF y estado actual de SmartTense

1. El PDF propone una secuencia A2 de mayor detalle:
   - Present Tenses overview
   - Present Simple en hábitos
   - Present Continuous
   - Present Perfect Simple
   - Present Perfect Continuous
   - Consolidación de presentes
   - Preposiciones de tiempo/lugar y movimiento
   - Producción diaria guiada
2. Hoy A2 está concentrado en 4 unidades y funciona, pero no está dividido por “overview + consolidación + producción guiada” como flujo de curso.
3. La parte de habla/escritura existe en Production, pero no está trazada como parte explícita del objeto de cada unidad.

## Fase 19 - Mapeo de metodología (propuesta de ejecución)

### Entregables

- Documento técnico `docs/METHODOLOGY_DARIO_A2.md` actualizado con:
  - mapa de componentes del PDF
  - mapeo de brechas en A2
  - propuesta de campos mínimos para extender schema
  - inventario de cambios por unidad
- Evidencia de “estado base A2” (línea base antes de cambios).

### Criterios de salida

- Lista de brechas verificable y priorizada.
- Decisión de diseño para campos nuevos (sin romper v3 existente).
- Definición de backlog de migración para Fase 20.

## Fase 20 - Adaptar modelo de unidades (próximo bloque)

Propuesta mínima de extensión del schema (opcional si no queremos rediseñar todo):

- Añadir campos opcionales y nullables en `unit`:
  - `learnerContext?: string | string[]`
  - `grammarBlocks?: array` (mapeable desde secciones `structures` mientras no haya cambios UI mayores)
  - `productionTask?: object` con `prompt`, `requiredStructures[]`, `checklist[]`
  - `pronunciationDrills?: array`
  - `controlledPractice?: array` (alias semántico para ejercicios principales)
  - `contrastPractice?: array` (subset de ejercicios tipo `chooseTense`)
  - `translationPractice?: array` (subset de ejercicios tipo `translation`)
- Mantener compatibilidad con schema v3: los campos nuevos deben ser opcionales.
- No cambiar render de app en esta fase; solo soportar import/validación y normalización interna.

## Fase 21 - Reconstrucción A2 como piloto (propuesta operacional)

- Mantener como base: `a2-present-continuous-actions`, `a2-present-perfect-experiences`, `a2-present-perfect-continuous-duration`, `a2-prepositions-daily-habits`.
- Reordenar/particionar por bloques pedagógicos propuestos (9 unidades) para cumplir mejor el blueprint Dario.
- Priorizar primero:
  1. Unit 1: Present Tenses Overview
  2. Unit 2: Present Simple - Daily Habits
  3. Unit 3: Present Continuous - Current Actions
  4. Unit 4: Present Perfect - Experiences and Result
  5. Unit 5: Present Perfect Continuous - Duration
  6. Unit 6: Present Tenses Consolidation
  7. Unit 7: Prepositions of Time and Place
  8. Unit 8: Movement Prepositions
  9. Unit 9: Daily Routine Production

## Fase 22 - Mejorar experiencia sin rediseño completo

- Orden visual del flujo de unidad:  
  1) Objetivo 2) Teoría 3) Ejemplos 4) Práctica controlada 5) Errores 6) Traducción 7) Producción
- Esta fase debe usar componentes existentes con labels más claros (sin cambiar motor ni rutas principales).

## Fase 23 - Aplicación a A1 / B1 / B2

- A1: versión reducida del blueprint, más repetición y menos contraste.
- A2: versión completa del blueprint (foco de esta fase).
- B1/B2: enriquecer `contrastPractice`, `productionTask` y `pronunciationDrills`, manteniendo metodología uniforme.
