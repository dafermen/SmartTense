import { useEffect, useMemo, useRef, useState } from "react";
import { buildRows, getTensesByGroup, getVerbSummary, GROUP_LABELS } from "./conjugation.js";
import { DEFAULT_DATA, LEVELS, SUBJECTS } from "./data/defaultData.js";
import { validateVerbData } from "./data/validation.js";
import { translate } from "./i18n.js";
import { SUPPORTED_LEARNER_LANGUAGES, getLearnerMeaning, getLearnerObject } from "./learnerLanguages/index.js";

const INITIAL_ALERT_MS = 6000;
const MOBILE_MENU_QUERY = "(max-width: 880px)";
const MAX_IMPORT_BYTES = 512 * 1024;
const STORAGE_KEY = "smarttense-progress-v1";
const VERB_PATTERN_FILTERS = ["all", "REGULAR_ED", "AAA", "ABB", "ABC", "ABA", "BE", "MODAL"];
const MENU_ITEMS = ["home", "documentation", "about"];

export default function App() {
  const [storedSettings] = useState(readStoredSettings);
  // Most state in this component represents visible learner choices. The grammar
  // rules themselves stay in conjugation.js so UI changes do not affect output.
  const [appData, setAppData] = useState(DEFAULT_DATA);
  const [verbId, setVerbId] = useState(storedSettings.verbId || DEFAULT_DATA.verbs[0].id);
  const [subjectId, setSubjectId] = useState(storedSettings.subjectId || SUBJECTS[0].id);
  const [group, setGroup] = useState(storedSettings.group || "all");
  const [level, setLevel] = useState(storedSettings.level || "basic");
  const [verbPattern, setVerbPattern] = useState(storedSettings.verbPattern || "all");
  const [verbSearch, setVerbSearch] = useState(storedSettings.verbSearch || "");
  const [activePage, setActivePage] = useState(storedSettings.activePage || "home");
  const [interfaceLanguage, setInterfaceLanguage] = useState(storedSettings.interfaceLanguage || storedSettings.language || "en");
  const [learnerLanguage, setLearnerLanguage] = useState(storedSettings.learnerLanguage || "es");
  const [showAllSubjects, setShowAllSubjects] = useState(storedSettings.showAllSubjects ?? false);
  const [showTranslations, setShowTranslations] = useState(storedSettings.showTranslations ?? true);
  const [showSentenceParts, setShowSentenceParts] = useState(storedSettings.showSentenceParts ?? true);
  const [visitedVerbIds, setVisitedVerbIds] = useState(storedSettings.visitedVerbIds || []);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(() => {
    if (typeof window === "undefined") return true;
    return !window.matchMedia(MOBILE_MENU_QUERY).matches;
  });
  const [alert, setAlert] = useState(null);
  const fileInputRef = useRef(null);

  const t = (key) => translate(interfaceLanguage, key);

  useEffect(() => {
    document.documentElement.lang = interfaceLanguage;
  }, [interfaceLanguage]);

  useEffect(() => {
    const mediaQuery = window.matchMedia(MOBILE_MENU_QUERY);
    const syncMenuToViewport = (event) => {
      setIsMenuOpen(!event.matches);
      if (!event.matches) setIsFiltersOpen(false);
    };

    syncMenuToViewport(mediaQuery);
    mediaQuery.addEventListener("change", syncMenuToViewport);
    return () => mediaQuery.removeEventListener("change", syncMenuToViewport);
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function loadVerbData() {
      try {
        // public/data/verbs.json is the editable data source. DEFAULT_DATA is only
        // a fallback so the app still works when the JSON file cannot be fetched.
        const response = await fetch("/data/verbs.json", { cache: "no-store" });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const payload = validateVerbData(await response.json());
        if (!isMounted) return;
        setAppData(payload);
        setVerbId((current) => payload.verbs.some((verb) => verb.id === current) ? current : payload.verbs[0]?.id ?? DEFAULT_DATA.verbs[0].id);
      } catch {
        if (!isMounted) return;
        setAppData(DEFAULT_DATA);
        showTimedAlert(t("fallback"));
      }
    }

    loadVerbData();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!alert) return undefined;
    const timer = window.setTimeout(() => setAlert(null), INITIAL_ALERT_MS);
    return () => window.clearTimeout(timer);
  }, [alert]);

  const patternVerbs = useMemo(
    () => appData.verbs.filter((verb) => verbPattern === "all" || getVerbSummary(verb).pattern === verbPattern),
    [appData.verbs, verbPattern]
  );

  const filteredVerbs = useMemo(
    () => patternVerbs.filter((verb) => matchesVerbSearch(verb, verbSearch)),
    [patternVerbs, verbSearch]
  );

  const currentVerb = useMemo(
    () => filteredVerbs.find((verb) => verb.id === verbId) || filteredVerbs[0] || appData.verbs.find((verb) => verb.id === verbId) || appData.verbs[0],
    [appData.verbs, filteredVerbs, verbId]
  );

  useEffect(() => {
    if (filteredVerbs.length === 0) return;
    if (filteredVerbs.some((verb) => verb.id === verbId)) return;
    setVerbId(filteredVerbs[0]?.id ?? appData.verbs[0]?.id ?? "");
  }, [appData.verbs, filteredVerbs, verbId]);

  const subjects = useMemo(() => {
    if (showAllSubjects) return SUBJECTS;
    return SUBJECTS.filter((subject) => subject.id === subjectId);
  }, [showAllSubjects, subjectId]);

  const tenses = useMemo(() => getTensesByGroup(group, level), [group, level]);
  // Beginners see expanded NOT forms. Higher levels can practice common contractions.
  const useContractions = level !== "basic";

  const rows = useMemo(
    () => buildRows(currentVerb, subjects, tenses, interfaceLanguage, { learnerLanguage, useContractions }),
    [currentVerb, subjects, tenses, interfaceLanguage, learnerLanguage, useContractions]
  );

  const verbSummary = useMemo(() => getVerbSummary(currentVerb, learnerLanguage), [currentVerb, learnerLanguage]);
  const progressCount = useMemo(
    () => visitedVerbIds.filter((id) => appData.verbs.some((verb) => verb.id === id)).length,
    [appData.verbs, visitedVerbIds]
  );

  useEffect(() => {
    if (!currentVerb?.id) return;
    setVisitedVerbIds((current) => current.includes(currentVerb.id) ? current : [...current, currentVerb.id]);
  }, [currentVerb?.id]);

  useEffect(() => {
    writeStoredSettings({
      verbId,
      subjectId,
      group,
      level,
      verbPattern,
      verbSearch,
      activePage,
      interfaceLanguage,
      learnerLanguage,
      showAllSubjects,
      showTranslations,
      showSentenceParts,
      visitedVerbIds
    });
  }, [activePage, group, interfaceLanguage, learnerLanguage, level, showAllSubjects, showSentenceParts, showTranslations, subjectId, verbId, verbPattern, verbSearch, visitedVerbIds]);

  function showTimedAlert(message, type = "success") {
    setAlert({ message, type });
  }

  function handleExportCsv() {
    const headers = [
      t("subjectCol"),
      t("tenseCol"),
      t("affirmative"),
      t("negative"),
      t("questionPositive"),
      t("questionNegative")
    ];
    const lines = [
      headers,
      ...rows.map((row) => [
        row.subject,
        row.tense,
        row.affirmative,
        row.negative,
        row.questionPositive,
        row.questionNegative
      ])
    ];
    downloadText(toCsv(lines), `smarttense-${currentVerb.id}.csv`, "text/csv");
  }

  function handleExportJson() {
    // Export generated rows, not the original verb catalog. This makes the file
    // useful as a snapshot of the learner's current filtered table.
    const payload = {
      exportedAt: new Date().toISOString(),
      verb: currentVerb.label,
      interfaceLanguage,
      learnerLanguage,
      filters: {
        subject: showAllSubjects ? "all" : subjectId,
        verbSearch,
        verbPattern,
        tenseGroup: group,
        learningLevel: level
      },
      rows
    };

    downloadText(`${JSON.stringify(payload, null, 2)}\n`, `smarttense-${currentVerb.id}.json`, "application/json");
  }

  async function handleImportJson(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      validateImportFile(file);
      // Imported data is kept in React state only; it never overwrites local files.
      const payload = validateVerbData(JSON.parse(await file.text()));
      setAppData(payload);
      setVerbId(payload.verbs[0]?.id ?? "");
      showTimedAlert(t("imported"));
    } catch (error) {
      console.error(error);
      showTimedAlert(t("invalidJson"), "error");
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  function validateImportFile(file) {
    const hasJsonExtension = file.name.toLowerCase().endsWith(".json");
    const hasJsonMime = file.type === "" || file.type === "application/json" || file.type === "text/json";

    if (!hasJsonExtension || !hasJsonMime) {
      throw new Error("Invalid file type");
    }

    if (file.size > MAX_IMPORT_BYTES) {
      throw new Error("Imported file is too large");
    }
  }

  function handleResetProgress() {
    if (!window.confirm(t("resetProgressConfirm"))) return;

    clearStoredSettings();
    setVisitedVerbIds([]);
    showTimedAlert(t("progressReset"));
  }

  return (
    <div className={`app-shell ${isMenuOpen ? "menu-open" : "menu-collapsed"}`}>
      <button
        type="button"
        className="menu-button"
        aria-label={isMenuOpen ? t("hideMenu") : t("showMenu")}
        aria-expanded={isMenuOpen}
        aria-controls="smarttense-menu"
        onClick={() => setIsMenuOpen((current) => !current)}
      >
        <span aria-hidden="true"></span>
        <span aria-hidden="true"></span>
        <span aria-hidden="true"></span>
      </button>

      {isMenuOpen && (
        <button
          type="button"
          className="menu-backdrop"
          aria-label={t("hideMenu")}
          onClick={() => setIsMenuOpen(false)}
        />
      )}

      <aside id="smarttense-menu" className="side-panel" aria-label={t("mainMenu")}>
        <div className="brand">
          <img src="/assets/smarttense-mark.svg" alt="SmartTense mark" />
          <div>
            <h1>SmartTense</h1>
            <p>{t("subtitle")}</p>
          </div>
        </div>

        <nav className="side-nav" aria-label={t("mainMenu")}>
          {MENU_ITEMS.map((item) => (
            <button
              type="button"
              className={activePage === item ? "active" : ""}
              key={item}
              onClick={() => {
                setActivePage(item);
                if (window.matchMedia(MOBILE_MENU_QUERY).matches) setIsMenuOpen(false);
              }}
            >
              {t(item)}
            </button>
          ))}
        </nav>

        <section className="note-panel">
          <h2>{t("dataNoteTitle")}</h2>
          <p>{t("dataNote")}</p>
        </section>
      </aside>

      <main className="content">
        {activePage === "home" && (
          <>
        <section className="top-strip">
          <div>
            <p className="eyebrow">{t("workspace")}</p>
            <h2>{currentVerb.label}</h2>
            <p>{verbSummary.meaning || t("noLearnerMeaning")} | {currentVerb.object || "core form"}</p>
          </div>
          <div className="stats" aria-label="Current table summary">
            <div>
              <span>{LEVELS.find((entry) => entry.id === level)?.[interfaceLanguage]}</span>
              <small>{t("level")}</small>
            </div>
            <div>
              <span>{tenses.length}</span>
              <small>{t("tenses")}</small>
            </div>
            <div>
              <span>{subjects.length}</span>
              <small>{t("subjects")}</small>
            </div>
            <div>
              <span>{progressCount}/{appData.verbs.length}</span>
              <small>{t("progress")}</small>
            </div>
          </div>
        </section>

        {alert && (
          <section className={`alert ${alert.type === "error" ? "error" : ""}`}>
            {alert.message}
          </section>
        )}

        <section className="workspace-filters" aria-label={t("filters")}> 
          <div className="filter-primary-grid">
            <TextField label={t("verbSearch")} value={verbSearch} onChange={setVerbSearch} placeholder={t("verbSearchPlaceholder")} />

            <SelectField label={t("verb")} value={filteredVerbs.length ? verbId : ""} onChange={setVerbId} variant="light" disabled={filteredVerbs.length === 0}>
              {filteredVerbs.length === 0 ? (
                <option value="">{t("noVerbMatches")}</option>
              ) : (
                filteredVerbs.map((verb) => (
                  <option key={verb.id} value={verb.id}>
                    {verb.label}
                  </option>
                ))
              )}
            </SelectField>

            <SelectField label={t("verbPatternFilter")} value={verbPattern} onChange={setVerbPattern} variant="light">
              {VERB_PATTERN_FILTERS.map((pattern) => (
                <option key={pattern} value={pattern}>
                  {verbPatternFilterLabel(pattern, t)}
                </option>
              ))}
            </SelectField>

            <SelectField label={t("level")} value={level} onChange={setLevel} variant="light">
              {LEVELS.map((entry) => (
                <option key={entry.id} value={entry.id}>
                  {entry[interfaceLanguage]}
                </option>
              ))}
            </SelectField>
          </div>

          <details className="more-filters" open={isFiltersOpen} onToggle={(event) => setIsFiltersOpen(event.currentTarget.open)}>
            <summary>
              <span className="more-filters-label">{t("moreFilters")}</span>
              <span className="filter-summary-metrics">
                <span>{filteredVerbs.length} {t("verbs")}</span>
                <span>{t("progress")}: {progressCount}/{appData.verbs.length}</span>
              </span>
            </summary>
            <div className="filter-secondary-grid">
              <SelectField label={t("subject")} value={subjectId} onChange={setSubjectId} disabled={showAllSubjects} variant="light">
                {SUBJECTS.map((subject) => (
                  <option key={subject.id} value={subject.id}>
                    {subject.label}
                  </option>
                ))}
              </SelectField>

              <SelectField label={t("tenseGroup")} value={group} onChange={setGroup} variant="light">
                <option value="all">{t("allGroups")}</option>
                <option value="present">{t("present")}</option>
                <option value="past">{t("past")}</option>
                <option value="future">{t("future")}</option>
                <option value="conditional">{t("conditional")}</option>
              </SelectField>

              <SelectField label={t("interfaceLanguage")} value={interfaceLanguage} onChange={setInterfaceLanguage} variant="light">
                <option value="en">English</option>
                <option value="es">Español</option>
              </SelectField>

              <SelectField label={t("learnerLanguage")} value={learnerLanguage} onChange={setLearnerLanguage} variant="light">
                {SUPPORTED_LEARNER_LANGUAGES.map((entry) => (
                  <option key={entry.id} value={entry.id}>
                    {entry.label}
                  </option>
                ))}
              </SelectField>

              <label className="check-row check-row-light">
                <input
                  type="checkbox"
                  checked={showAllSubjects}
                  onChange={(event) => setShowAllSubjects(event.target.checked)}
                />
                <span>{t("showAllSubjects")}</span>
              </label>

              <label className="check-row check-row-light">
                <input
                  type="checkbox"
                  checked={showTranslations}
                  onChange={(event) => setShowTranslations(event.target.checked)}
                />
                <span>{t("showTranslations")}</span>
              </label>

              <label className="check-row check-row-light">
                <input
                  type="checkbox"
                  checked={showSentenceParts}
                  onChange={(event) => setShowSentenceParts(event.target.checked)}
                />
                <span>{t("showSentenceParts")}</span>
              </label>

              <button type="button" className="reset-progress-button" onClick={handleResetProgress}>
                {t("resetProgress")}
              </button>

              <div className="filter-table-actions" aria-label={t("tableActions")}>
                <button type="button" className="compact-action" onClick={handleExportCsv} aria-label={t("exportCsv")}>CSV</button>
                <button type="button" className="compact-action" onClick={handleExportJson} aria-label={t("exportJson")}>JSON</button>
                <label className="import-button import-button-light compact-action" aria-label={t("importJson")}>
                  <input ref={fileInputRef} type="file" accept="application/json,.json" onChange={handleImportJson} />
                  <span>{t("importShort")}</span>
                </label>
              </div>
            </div>
          </details>
          {filteredVerbs.length === 0 && <p className="empty-filter-message">{t("noVerbMatchesHelp")}</p>}
        </section>

        <section className="table-card">
          <VerbProfile verb={currentVerb} summary={verbSummary} t={t} />
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>{t("subjectCol")}</th>
                  <th>{t("tenseCol")}</th>
                  <th>{t("affirmative")}</th>
                  <th>{t("negative")}</th>
                  <th>{t("questionPositive")}</th>
                  <th>{t("questionNegative")}</th>
                </tr>
              </thead>
              <tbody>
                <ConjugationRows rows={rows} language={interfaceLanguage} showTranslations={showTranslations} showSentenceParts={showSentenceParts} />
              </tbody>
            </table>
          </div>
        </section>

        <section className="mobile-card-list" aria-label={t("mobileCardsTitle")}> 
          <div className="mobile-card-header">
            <div>
              <h3>{t("mobileCardsTitle")}</h3>
              <p>{t("caption")}</p>
            </div>
          </div>
          <ConjugationCards rows={rows} language={interfaceLanguage} showTranslations={showTranslations} showSentenceParts={showSentenceParts} t={t} />
        </section>
          </>
        )}

        {activePage === "documentation" && <DocumentationPage t={t} learnerLanguage={learnerLanguage} />}
        {activePage === "about" && <AboutPage t={t} />}
      </main>
    </div>
  );
}

function DocumentationPage({ t, learnerLanguage }) {
  return (
    <section className="info-page">
      <p className="eyebrow">{t("documentation")}</p>
      <h2>{t("documentationTitle")}</h2>
      <div className="info-grid">
        <article>
          <h3>{t("docStudyTitle")}</h3>
          <p>{t("docStudyText")}</p>
        </article>
        <article>
          <h3>{t("docLanguageTitle")}</h3>
          <p>{t("docLanguageText")}</p>
          <p className="inline-note">{t("currentLearnerLanguage")}: {learnerLanguage.toUpperCase()}</p>
        </article>
        <article>
          <h3>{t("docDataTitle")}</h3>
          <p>{t("docDataText")}</p>
        </article>
      </div>
    </section>
  );
}

function AboutPage({ t }) {
  return (
    <section className="info-page">
      <p className="eyebrow">{t("about")}</p>
      <h2>{t("aboutTitle")}</h2>
      <div className="info-grid">
        <article>
          <h3>{t("aboutMissionTitle")}</h3>
          <p>{t("aboutMissionText")}</p>
        </article>
        <article>
          <h3>{t("aboutPlatformTitle")}</h3>
          <p>{t("aboutPlatformText")}</p>
        </article>
      </div>
    </section>
  );
}

function SelectField({ label, value, onChange, children, disabled = false, variant = "dark" }) {
  return (
    <label className={`field ${variant === "light" ? "field-light" : ""}`}>
      <span>{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)} disabled={disabled}>
        {children}
      </select>
    </label>
  );
}

function TextField({ label, value, onChange, placeholder = "" }) {
  return (
    <label className="field field-light">
      <span>{label}</span>
      <input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} />
    </label>
  );
}

function VerbProfile({ verb, summary, t }) {
  return (
    <section className="verb-profile" aria-label={t("verbProfile")}>
      <div className="verb-profile-title">
        <p className="eyebrow">{t("verbProfile")}</p>
        <h3>{verb.label}</h3>
      </div>
      <dl>
        <div>
          <dt>{t("learnerMeaning")}</dt>
          <dd>{summary.meaning}</dd>
        </div>
        <div>
          <dt>{t("baseExample")}</dt>
          <dd>{summary.object || summary.base}</dd>
        </div>
        <div>
          <dt>{t("verbType")}</dt>
          <dd>{verbTypeLabel(summary.type, t)}</dd>
        </div>
        <div>
          <dt>{t("verbPattern")}</dt>
          <dd>{verbPatternLabel(summary.pattern, t)}</dd>
        </div>
        <div>
          <dt>{t("keyForms")}</dt>
          <dd>{[summary.base, summary.past, summary.participle, summary.gerund].join(" / ")}</dd>
        </div>
      </dl>
    </section>
  );
}

function ConjugationRows({ rows, language, showTranslations, showSentenceParts }) {
  let activeGroup = "";

  return rows.map((row) => {
    // Rows are already sorted by tense order. This marker inserts one group label
    // before the first row of each present/past/future/conditional section.
    const shouldRenderGroup = row.group !== activeGroup;
    activeGroup = row.group;

    return (
      <FragmentRow
        key={`${row.subject}-${row.tenseId}`}
        row={row}
        language={language}
        showGroup={shouldRenderGroup}
        showTranslations={showTranslations}
        showSentenceParts={showSentenceParts}
      />
    );
  });
}

function FragmentRow({ row, language, showGroup, showTranslations, showSentenceParts }) {
  return (
    <>
      {showGroup && (
        <tr className="group-row">
          <td colSpan="6">{GROUP_LABELS[row.group][language]}</td>
        </tr>
      )}
      <tr>
        <td className="subject-cell">{row.subject}</td>
        <td className="tense-cell">
          <span>{row.tense}</span>
          {row.usageNote && <span className="usage-note">{row.usageNote}</span>}
        </td>
        <SentenceCell sentence={row.affirmative} parts={row.breakdown.affirmative} translation={row.translations.affirmative} showTranslations={showTranslations} showSentenceParts={showSentenceParts} />
        <SentenceCell sentence={row.negative} parts={row.breakdown.negative} translation={row.translations.negative} showTranslations={showTranslations} showSentenceParts={showSentenceParts} />
        <SentenceCell sentence={row.questionPositive} parts={row.breakdown.questionPositive} translation={row.translations.questionPositive} showTranslations={showTranslations} showSentenceParts={showSentenceParts} />
        <SentenceCell sentence={row.questionNegative} parts={row.breakdown.questionNegative} translation={row.translations.questionNegative} showTranslations={showTranslations} showSentenceParts={showSentenceParts} />
      </tr>
    </>
  );
}

function SentenceCell({ sentence, parts, translation, showTranslations, showSentenceParts }) {
  return (
    <td>
      <span className="sentence">{sentence}</span>
      {showSentenceParts && <SentenceParts parts={parts} />}
      {showTranslations && <span className="translation">{translation}</span>}
    </td>
  );
}

function ConjugationCards({ rows, language, showTranslations, showSentenceParts, t }) {
  let activeGroup = "";

  return rows.map((row) => {
    const shouldRenderGroup = row.group !== activeGroup;
    activeGroup = row.group;

    return (
      <article className="tense-card" key={`${row.subject}-${row.tenseId}`}>
        {shouldRenderGroup && <p className="card-group-label">{GROUP_LABELS[row.group][language]}</p>}
        <div className="tense-card-title">
          <span>{row.subject}</span>
          <div>
            <strong>{row.tense}</strong>
            {row.usageNote && <p className="card-usage-note">{row.usageNote}</p>}
          </div>
        </div>
        <div className="mobile-form-list">
          <CardLine label={t("affirmative")} value={row.affirmative} translation={row.translations.affirmative} parts={row.breakdown.affirmative} showTranslations={showTranslations} showSentenceParts={showSentenceParts} defaultOpen />
          <CardLine label={t("negative")} value={row.negative} translation={row.translations.negative} parts={row.breakdown.negative} showTranslations={showTranslations} showSentenceParts={showSentenceParts} />
          <CardLine label={t("questionPositive")} value={row.questionPositive} translation={row.translations.questionPositive} parts={row.breakdown.questionPositive} showTranslations={showTranslations} showSentenceParts={showSentenceParts} />
          <CardLine label={t("questionNegative")} value={row.questionNegative} translation={row.translations.questionNegative} parts={row.breakdown.questionNegative} showTranslations={showTranslations} showSentenceParts={showSentenceParts} />
        </div>
      </article>
    );
  });
}

function CardLine({ label, value, translation, parts, showTranslations, showSentenceParts, defaultOpen = false }) {
  return (
    <details className="mobile-form-line" open={defaultOpen}>
      <summary>
        <span className="mobile-form-label">{label}</span>
        <span className="mobile-form-value">{value}</span>
      </summary>
      <div className="mobile-form-detail">
        {showSentenceParts && <SentenceParts parts={parts} />}
        {showTranslations && <p className="card-translation">{translation}</p>}
      </div>
    </details>
  );
}

function SentenceParts({ parts }) {
  return (
    <span className="sentence-parts" aria-hidden="true">
      {parts.map((part, index) => (
        <span className={`part part-${part.role}`} key={`${part.text}-${index}`}>
          {part.text}
        </span>
      ))}
    </span>
  );
}

function verbTypeLabel(type, t) {
  if (type === "be") return t("beVerb");
  if (type === "modal") return t("modalVerb");
  if (type === "regular") return t("regularVerb");
  return t("irregularVerb");
}

function verbPatternLabel(pattern, t) {
  if (pattern === "REGULAR_ED") return t("regularPattern");
  if (pattern === "MODAL") return t("modalPattern");
  if (pattern === "BE") return t("bePattern");
  return pattern;
}

function verbPatternFilterLabel(pattern, t) {
  if (pattern === "all") return t("allVerbPatterns");
  return verbPatternLabel(pattern, t);
}

function matchesVerbSearch(verb, query) {
  const normalizedQuery = normalizeSearchText(query);
  if (!normalizedQuery) return true;

  const summary = getVerbSummary(verb);
  const learnerMeaning = getLearnerMeaning(verb);
  const learnerObject = getLearnerObject(verb);
  const searchableText = [
    verb.id,
    verb.label,
    verb.meaningEs,
    learnerMeaning,
    verb.base,
    verb.third,
    verb.past,
    verb.participle,
    verb.gerund,
    verb.object,
    verb.objectEs,
    learnerObject,
    summary.pattern
  ]
    .filter(Boolean)
    .join(" ");

  return normalizeSearchText(searchableText).includes(normalizedQuery);
}

function normalizeSearchText(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function readStoredSettings() {
  if (typeof window === "undefined") return {};

  try {
    const parsed = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "{}");
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function writeStoredSettings(settings) {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // Browsers can deny storage in private or restricted modes. The app should
    // continue to work; it simply will not remember progress in that case.
  }
}

function clearStoredSettings() {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore storage errors for the same reason as writeStoredSettings.
  }
}

function downloadText(text, filename, type) {
  const blob = new Blob([text], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function toCsv(rows) {
  return `${rows.map((row) => row.map(csvCell).join(",")).join("\n")}\n`;
}

function csvCell(value) {
  const text = String(value ?? "");
  return `"${text.replaceAll('"', '""')}"`;
}
