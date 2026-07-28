# SmartTense User Guide

SmartTense helps you study English verb tenses by creating example sentences from a verb, a subject, and a learning level. The app is organized into focused screens so you do not have to see every form at the same time.

## Main Screens

### Home

Home is the starting dashboard. It shows:

- The current verb and learner-language meaning.
- Quick actions for Theory, Individual, and Complete.
- A course-level selector: All, A1, A2, B1, and B2.
- A current affirmative example with sentence parts and translation when those options are enabled.
- Progress for verbs already viewed in this browser.
- Current level, number of visible tenses, and number of matching verbs.
- A recommended next practice.
- The recommended next learning step for the current unit.
- A short level diagnostic for A1, A2, B1, and B2.

Use Home when you want to quickly continue studying without opening the full table.

Use the course-level selector when you want to focus the learning unit list. For example, choose `A1` to see only A1 units or `A2` to continue the A2 path. `All` shows the full route.

### Level Diagnostic

The level diagnostic is a short local self-check. Mark what you can already do, and SmartTense suggests a starting CEFR level and a recommended unit.

Use `Use recommendation` to open the suggested unit in Theory. You can reset the diagnostic from Home or Settings. The result stays only in the current browser.

### Theory

Theory shows a short lesson before practice. The current path starts with A1 Be and Have, continues through A2 daily communication, then moves into B1 functional communication and an initial B2 mixed-tenses unit.

Theory includes:

- learning objectives;
- linked tenses and context tags;
- meaning and signal words;
- grammar structures;
- common mistakes;
- contextual examples;
- vocabulary cards by context;
- starter practice preview with expandable answers.

Use the Context row to show all content or focus on one situation, such as IT work, meetings, family routines, travel, daily habits, or prepositions.

Use Theory when you want to understand the rule before opening Individual or Complete.

For any A2 unit, press `Start guided lesson`. SmartTense then shows one activity at a time: goals, a short explanation, examples, three questions, error correction, pronunciation, a short production task, and a final summary. Use Back to return to the full Theory page or Practice more after the final step.

### Practice

Practice shows starter exercises from the current learning unit in dropdown lists. A1 and A2 use curated options with one valid answer and distractors based on common mistakes. Press Check answer to get immediate feedback.

Use the Context row in Practice when you want exercises for one situation only. For example, choose IT work to practice software examples, or Daily habits to practice routine examples.

The first Practice MVP supports:

- fill-in-the-blank style answers;
- sentence transformation answers;
- context-filtered exercises;
- local scoring in this browser session;
- reset for the current practice draft.

Practice is a starter workflow. It saves only local unit progress in this browser.

Completing all starter exercises marks the current unit's Practice step as complete in this browser.

### Production

Production is the speaking and writing workspace. Use it to practice prompts and review progress:

- Start with prompts suggested for the current learning unit.
- Switch Prompt scope to All prompts when you want the full prompt library.
- Select a Speaking or Writing prompt.
- Write your response in the answer area.
- Add a quick self-review note (optional).
- Save as:
  - Draft
  - Done
  - Needs review
  - Approved
- Use filters to show only the attempts you need.
- Edit, update, or delete an attempt and cancel editing when needed.

The attempt queue is local to this browser session. This keeps your study data private and removes the need for logins.

Prompt suggestions follow the active unit shown on Home. The attempt queue remains global, so saved attempts are still visible through the mode and status filters.

### Individual

Individual is focused practice. It shows affirmative sentences only.

Use it when you want less visual noise and want to focus on one or more tenses and subjects. You can enable several tense buttons at the same time, and you can enable several subjects at the same time.

Each generated sentence can show a compact `Why this form?` panel. Open it to see the pattern, reason, auxiliary, and verb form behind the sentence.

Tense groups in Individual:

- Past: Simple, Perfect, Continuous.
- Present: Simple, Perfect, Continuous.
- Future: Simple, Perfect, Continuous.
- Conditional: Simple, Perfect, Continuous.

You can select or clear a whole tense group by pressing the group label. You can also select or clear all subjects from the subject header.

### Complete

Complete shows the full conjugation table. Each row can include:

- Affirmative form: `He writes a message.`
- Negative form: `He does not write a message.`
- Interrogative form: `Does he write a message?`
- Negative interrogative form: `Does he not write a message?`

Use Display options to choose which forms are visible. For example, you can hide negative and interrogative forms when you only want to compare subjects and tenses.

On desktop, Subject and Tense stay visible while you scroll horizontally. On mobile, the app uses compact practice cards instead of a wide table.

Use `Why this form?` inside any generated form when you want a short grammar explanation without leaving the table.

### Settings

Settings keeps configuration and data tools in one place. It includes:

- General settings for interface language, learner language, translations, sentence parts, and local progress reset.
- Learning path status for the current unit and a reset option for that unit.
- Level diagnostic summary and reset.
- Data manager summary with total verbs, schema version, update date, and pattern count.
- Import JSON and Export database for compatible SmartTense verb files.
- Learning content manager for importing, previewing, applying, and exporting units, contexts, vocabulary, and exercises.
- Restore default data when you want to return to the demo database for this browser session.
- Add verb to create a new draft entry.
- Data table to search, sort, and review verb rows before editing.
- Single-row Edit for focused changes, with Cancel to leave the row unchanged.
- Pagination controls for large verb lists, including rows-per-page selection.
- Bulk edit when several rows need updates.
- Update and Delete actions ask for confirmation before applying changes.

Settings changes to the verb database are local to the current browser session. The data table opens in review mode first; press Edit on one row for a focused change, Cancel to discard that row edit, or Bulk edit to make the whole filtered page editable. Use Export database when you want to keep a copy or send the updated data to a developer.

Learning content changes are also local to the current browser session. Import content JSON to load a draft, review the preview summary, then press Apply content when it is ready to use in Theory and Practice. Use Export content when the project file should be updated by a developer.

## Languages

SmartTense has two language settings:

- Interface language: controls app labels and navigation.
- Learner language: controls meanings, translations, and usage notes.

The interface currently supports English and Spanish. The learner guide currently supports Spanish and French.

## Learning Levels

SmartTense separates tenses into levels so beginners do not have to see everything at once.

- Basic: common starting tenses such as Simple Present, Present Continuous, Simple Past, and Simple Future.
- Intermediate: adds more tenses, including Present Perfect, Past Continuous, Future Continuous, and Simple Conditional.
- Advanced: shows the full tense set, including perfect continuous and advanced conditional forms.

## Search And Filters

Use the filter panel to choose:

- Search text for a verb, learner-language meaning, or form such as `wrote`.
- Verb.
- Verb pattern, such as `ABC` or `Regular -ED`.
- Learning level.
- Subject and tense group in Complete.
- Interface language and learner language.
- Display options such as translations and sentence parts.

The verb pattern filter is useful when you want to practice one irregular family at a time. For example, `ABC` shows verbs like `sing / sang / sung`, while `ABB` shows verbs like `buy / bought / bought`.

## Mobile Use

SmartTense is designed to save space on phones:

- Home uses compact cards and two-column sections when the screen is wide enough.
- The A1/A2/B1/B2 selector stays in one compact row and can scroll horizontally if needed.
- Theory and Practice use a compact Context row instead of a large filter panel.
- Individual keeps affirmative practice compact and grouped by tense.
- Complete switches from a wide table to mobile practice cards.
- Explanations stay collapsed until you open `Why this form?`, which keeps the screen compact.
- Display options are collapsible.

Recommended mobile flow:

1. Start on Home, choose A2, select one of the four A2 units, open Theory, and use `Start guided lesson`.
2. Use only the filters you need.
3. Collapse Display options after changing them.
4. In Individual, select only the tense groups and subjects you want to practice now.

## Importing JSON

Use Settings -> Data manager -> Import JSON when you have a compatible verb file. Imported data only affects the current browser session. Refreshing or reopening the app will return to the default data unless the project file itself is changed by a developer.

For safety, SmartTense rejects files that are too large, do not use the `.json` extension, or do not match the expected verb schema.

Use Settings -> Learning content manager -> Import content when you have compatible learning-content JSON. SmartTense validates units, contexts, vocabulary, examples, and exercises before the draft can be applied.

## Exporting

There are two export options:

- Complete -> CSV or JSON: exports a generated table snapshot from the current filters.
- Settings -> Export database: exports the active verb database so it can be reused or reviewed.
- Settings -> Export content: exports the active learning-content draft so it can be reviewed or committed to the project.

## Progress

Progress is local to the browser and can be reset from Settings. It counts verbs you have viewed on the current device and browser. It is not uploaded to a server and does not require an account.

Learning path progress is also local. SmartTense tracks whether you have opened Theory and completed Practice for the active unit. Settings can reset all local progress or only the current unit.

The level diagnostic is local too. It stores only your checked self-assessment items and suggested level in this browser.

## Learning Content Roadmap

SmartTense now includes structured Theory and Practice screens powered by learning-content JSON. The A1 MVP includes Be and Have, Present Simple, and Personal Information and Basic Questions. The A2 path adds Present Continuous, Present Perfect, Present Perfect Continuous, and Prepositions/Daily Habits. B1 adds functional communication for past, future, conditional, narratives, plans, and problem solving. B2 starts with mixed tenses, passive-style meaning, reported speech, connectors, and independent production. Each unit includes objectives, theory, structures, common mistakes, examples, vocabulary, contexts, and starter exercises.

The current visible learning flow is Home -> Theory -> Practice -> Individual -> Production -> Complete -> Settings. Home recommends the next step based on your local unit progress.

Home can also use the level diagnostic to suggest whether to start at A1, A2, B1, or B2.

The current release checks include a mobile smoke test at `390x844` that opens Home, Course, Theory, Manual, Guided Lesson, Adaptive Review, Practice, Progress, Individual, Complete, Production, and Settings with a simulated high-volume verb database. It also checks basic readiness, Guided Lesson overflow, and table-density gates so the main learner flow stays stable on small screens as the content grows.
Internal release notes and screen checks live in `docs/RELEASE_CHECKLIST.md`.

### Upcoming roadmap (Dario-based)

If you want to follow the pedagogic extension of the app, this roadmap is the reference:

- `docs/INDEX.md`: documentation map and reading order.
- `docs/CURRICULUM_PHASE_PLAN.md`: official A1-B2 curriculum plan with executive phases, operational tasks, and internal Gantt.
- `docs/PHASE_EXECUTION_LOG.md`: latest status and validation evidence.

Suggested sequence for you as a learner:

1. Complete Be and Have in Theory and Practice.
2. Continue with Present Simple.
3. Practice Personal Information and Basic Questions.
4. Continue through the A2 units: Present Continuous, Present Perfect, Present Perfect Continuous, and Prepositions/Daily Habits.
5. Continue with B1 Past/Future/Conditional and B1 Narratives, Plans and Problems.
6. Try the B2 Mixed Tenses and Independent Production unit when you can write and speak in longer connected ideas.
7. Do Production prompts and compare with previous attempts.
8. Use Individual for targeted affirmatives when you want extra form practice.

## Guided Lesson

Every A1, A2, B1, and B2 unit has a Guided Lesson. Choose a level and unit on Home, open Theory, then press `Start guided lesson`.

The lesson presents one main activity at a time:

1. Understand the objective.
2. Read a short explanation.
3. Notice contextual examples.
4. Answer guided practice.
5. Correct a common mistake.
6. Repeat pronunciation sentences aloud.
7. Complete a short speaking or writing task.

Your checked practice answers update local skill progress. The lesson does not upload recordings or written drafts.

## Adaptive Review And Skill Progress

Use `Review` from the mobile navigation or `Start adaptive review` on Home for a short session of up to eight questions. SmartTense prioritizes new skills, low-mastery skills, and skills whose review date has arrived. It shows why each question was selected and updates the next focus after every answer.

Home shows the current skill focus and average mastery across practiced skills. Skill progress includes attempts, correct answers, streak, mastery, and the next suggested review time. This information stays in the current browser. Reset all progress from Settings, or reset only the active unit.

## Simplified Mobile Navigation

On a phone, the fixed bottom navigation contains four primary destinations:

- Home: choose the level and learning unit, then continue the lesson.
- Theory: review objectives, structures, examples, and vocabulary.
- Practice: complete the full contextual exercise set for the unit.
- Review: work through a short adaptive session.

Use the menu button at the top for Individual, Complete, Production, Settings, Documentation, and About. These tools remain available but no longer compete with the main learning flow on Home.

## Action-Oriented Home

On a phone, Home no longer asks you to configure the whole application before studying. It shows:

- Continue lesson: opens the Guided Lesson for the recommended active unit.
- Next review: starts a short adaptive practice session.
- Your course: shows completed units and total units in A1, A2, B1, and B2.

Use Course when you intentionally want to change level or unit. Use Progress when you want to inspect mastery and completed units. The mobile navigation is now Home, Course, Practice, and Progress.

The same action-oriented Home is used on desktop. The current lesson is always the strongest visual element, Adaptive Review is secondary, and the A1-B2 route shows which level is completed, active, or not started. The level diagnostic appears only while it is still pending.

## Resuming And Completing A Unit

SmartTense now saves the exact Guided Lesson step, selected answers, checked answers, and production draft for every unit. `Continue lesson` returns to that saved step after navigating away or reopening the app.

Unit progress is calculated from the complete learning journey:

- Guided Lesson: 60%.
- Focused Practice: 30%.
- Production: 10%.

Practice displays one question at a time. After checking an answer, read the explanation and press `Next question`. Completing the full unit practice opens Production. Saving the first Production attempt completes the unit, returns to Home, and prepares the next available unit.

Course marks units as Completed, In progress, Recommended, or Requires previous unit. A locked unit becomes available after its prerequisite unit is completed.

On the first visit, choose statements in the level check and apply the suggested level, or press `Start from A1`. The onboarding panel disappears after either choice and can be restored by resetting the diagnostic in Settings.

## Language And Visual Accessibility

The main learning journey now keeps interface controls consistent when you switch between English and Spanish. Lesson content remains in English because it is the material being learned, while instructions, actions, feedback labels, and navigation follow the selected interface language.

SmartTense uses Atkinson Hyperlegible for clear reading on small screens. Navigation icons reinforce their text labels, secondary text has stronger contrast, and short transitions help show when a new activity appears. If your device requests reduced motion, these transitions are disabled automatically.

After completing Production, Home displays a small completion message with the finished unit and the next unit in the course path.


## Selector de verbos con busqueda

El campo **Verb** combina la seleccion y la busqueda en un solo control. Permite buscar por verbo, significado o forma verbal y elegir un resultado con toque, clic o teclado. Las flechas recorren los resultados, **Enter** selecciona y **Escape** cierra la lista. El filtro **Verb pattern** limita los resultados disponibles sin alterar las estadisticas por una busqueda temporal.

## Error Review And Smart Resume

Practice now keeps the final question feedback visible before showing the session summary. When an answer is incorrect, SmartTense explains the expected answer, saves that exercise for review, and offers **Try again**. Correcting the exercise removes it from the pending mistake list.

Adaptive Review places recent mistakes before general scheduled practice. Home and Progress show when mistakes are waiting. **Continue learning** opens the actual pending step for the active unit instead of always restarting Guided Lesson.

## A2 Course Manual

Open **Manual** from the main menu to read the original 57-page A2 course document inside SmartTense. The document covers verb tenses, daily habits, IT work, family routines, prepositions, pronunciation, and guided production.

Desktop browsers display the PDF inside the application. On phones, use **Open manual** to read it in the device PDF viewer or **Download PDF** to keep a local copy. The manual is bundled with SmartTense and does not require an external website.
