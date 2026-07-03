# SmartTense User Guide

SmartTense helps you study English verb tenses by creating example sentences from a verb, a subject, and a learning level. The app is organized into focused screens so you do not have to see every form at the same time.

## Main Screens

### Home

Home is the starting dashboard. It shows:

- The current verb and learner-language meaning.
- Quick actions for Individual and Complete.
- A current affirmative example with sentence parts and translation when those options are enabled.
- Progress for verbs already viewed in this browser.
- Current level, number of visible tenses, and number of matching verbs.
- A recommended next practice.

Use Home when you want to quickly continue studying without opening the full table.

### Individual

Individual is focused practice. It shows affirmative sentences only.

Use it when you want less visual noise and want to focus on one or more tenses and subjects. You can enable several tense buttons at the same time, and you can enable several subjects at the same time.

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

### Settings

Settings keeps configuration and data tools in one place. It includes:

- General settings for interface language, learner language, translations, sentence parts, and local progress reset.
- Data manager summary with total verbs, schema version, update date, and pattern count.
- Import JSON and Export database for compatible SmartTense verb files.
- Restore default data when you want to return to the demo database for this browser session.
- Add verb to create a new draft entry.
- Data table to search, sort, and review verb rows before editing.
- Single-row Edit for focused changes, with Cancel to leave the row unchanged.
- Pagination controls for large verb lists, including rows-per-page selection.
- Bulk edit when several rows need updates.
- Update and Delete actions ask for confirmation before applying changes.

Settings changes to the verb database are local to the current browser session. The data table opens in review mode first; press Edit on one row for a focused change, Cancel to discard that row edit, or Bulk edit to make the whole filtered page editable. Use Export database when you want to keep a copy or send the updated data to a developer.

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
- Individual keeps affirmative practice compact and grouped by tense.
- Complete switches from a wide table to mobile practice cards.
- Display options are collapsible.

Recommended mobile flow:

1. Start on Home and choose Individual or Complete.
2. Use only the filters you need.
3. Collapse Display options after changing them.
4. In Individual, select only the tense groups and subjects you want to practice now.

## Importing JSON

Use Settings -> Data manager -> Import JSON when you have a compatible verb file. Imported data only affects the current browser session. Refreshing or reopening the app will return to the default data unless the project file itself is changed by a developer.

For safety, SmartTense rejects files that are too large, do not use the `.json` extension, or do not match the expected verb schema.

## Exporting

There are two export options:

- Complete -> CSV or JSON: exports a generated table snapshot from the current filters.
- Settings -> Export database: exports the active verb database so it can be reused or reviewed.

## Progress

Progress is local to the browser and can be reset from Settings. It counts verbs you have viewed on the current device and browser. It is not uploaded to a server and does not require an account.
