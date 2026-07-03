import { useEffect, useMemo, useRef, useState } from "react";
import { buildRows, getTensesByGroup, getVerbSummary, GROUP_LABELS } from "./conjugation.js";
import { DEFAULT_DATA, LEVELS, SUBJECTS, TENSES } from "./data/defaultData.js";
import { validateVerbData } from "./data/validation.js";
import { translate } from "./i18n.js";
import { SUPPORTED_LEARNER_LANGUAGES, getLearnerMeaning, getLearnerObject } from "./learnerLanguages/index.js";

const INITIAL_ALERT_MS = 6000;
const MOBILE_MENU_QUERY = "(max-width: 880px)";
const MAX_IMPORT_BYTES = 512 * 1024;
const STORAGE_KEY = "smarttense-progress-v1";
const VERB_PATTERN_FILTERS = ["all", "REGULAR_ED", "AAA", "ABB", "ABC", "ABA", "BE", "MODAL"];
const MENU_ITEMS = ["home", "individual", "complete", "settings", "documentation", "about"];
const INDIVIDUAL_TENSE_GROUPS = [
  { id: "past", labelKey: "past", tenseIds: ["simplePast", "pastPerfect", "pastContinuous"] },
  { id: "present", labelKey: "present", tenseIds: ["simplePresent", "presentPerfect", "presentContinuous"] },
  { id: "future", labelKey: "future", tenseIds: ["simpleFuture", "futurePerfect", "futureContinuous"] },
  { id: "conditional", labelKey: "conditional", tenseIds: ["simpleConditional", "perfectConditional", "continuousConditional"] }
];
const INDIVIDUAL_DEFAULT_TENSE_IDS = ["simplePresent"];
const COMPLETE_FORM_COLUMNS = ["affirmative", "negative", "questionPositive", "questionNegative"];
const DATA_MANAGER_FIELDS = ["id", "label", "meaningEs", "base", "third", "past", "participle", "gerund", "object", "objectEs", "type"];
const EMPTY_VERB_FORM = {
  id: "",
  label: "",
  meaningEs: "",
  base: "",
  third: "",
  past: "",
  participle: "",
  gerund: "",
  object: "",
  objectEs: "",
  type: ""
};

export default function App() {
  const [storedSettings] = useState(readStoredSettings);
  // Most state in this component represents visible learner choices. The grammar
  // rules themselves stay in conjugation.js so UI changes do not affect output.
  const [appData, setAppData] = useState(DEFAULT_DATA);
  const [verbId, setVerbId] = useState(storedSettings.verbId || DEFAULT_DATA.verbs[0].id);
  const [subjectId, setSubjectId] = useState(storedSettings.subjectId || SUBJECTS[0].id);
  const [individualTenseIds, setIndividualTenseIds] = useState(() => {
    if (Array.isArray(storedSettings.individualTenseIds) && storedSettings.individualTenseIds.length) return storedSettings.individualTenseIds;
    if (storedSettings.individualTenseId) return [storedSettings.individualTenseId];
    return INDIVIDUAL_DEFAULT_TENSE_IDS;
  });
  const [individualSubjectIds, setIndividualSubjectIds] = useState(() => {
    if (Array.isArray(storedSettings.individualSubjectIds) && storedSettings.individualSubjectIds.length) return storedSettings.individualSubjectIds;
    return [storedSettings.subjectId || SUBJECTS[0].id];
  });
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
  const [completeFormColumns, setCompleteFormColumns] = useState(() => {
    if (Array.isArray(storedSettings.completeFormColumns) && storedSettings.completeFormColumns.length) return storedSettings.completeFormColumns;
    return COMPLETE_FORM_COLUMNS;
  });
  const [visitedVerbIds, setVisitedVerbIds] = useState(storedSettings.visitedVerbIds || []);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(() => {
    if (typeof window === "undefined") return true;
    return !window.matchMedia(MOBILE_MENU_QUERY).matches;
  });
  const [alert, setAlert] = useState(null);
  const fileInputRef = useRef(null);
  const settingsFileInputRef = useRef(null);
  const [dataDraft, setDataDraft] = useState(() => cloneVerbData(DEFAULT_DATA));
  const [newVerbForm, setNewVerbForm] = useState(EMPTY_VERB_FORM);
  const [bulkEditSearch, setBulkEditSearch] = useState("");

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
    setDataDraft(cloneVerbData(appData));
  }, [appData]);

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

  const individualTenses = useMemo(
    () => INDIVIDUAL_TENSE_GROUPS.flatMap((tenseGroup) => tenseGroup.tenseIds.map((tenseId) => TENSES.find((tense) => tense.id === tenseId)).filter(Boolean)),
    []
  );

  const selectedIndividualSubjects = useMemo(
    () => SUBJECTS.filter((subject) => individualSubjectIds.includes(subject.id)),
    [individualSubjectIds]
  );

  const selectedIndividualTenses = useMemo(
    () => individualTenses.filter((tense) => individualTenseIds.includes(tense.id)),
    [individualTenseIds, individualTenses]
  );

  const individualRows = useMemo(
    () => selectedIndividualSubjects.length && selectedIndividualTenses.length ? buildRows(currentVerb, selectedIndividualSubjects, selectedIndividualTenses, interfaceLanguage, { learnerLanguage, useContractions }) : [],
    [currentVerb, selectedIndividualSubjects, selectedIndividualTenses, interfaceLanguage, learnerLanguage, useContractions]
  );

  const verbSummary = useMemo(() => getVerbSummary(currentVerb, learnerLanguage), [currentVerb, learnerLanguage]);
  const progressCount = useMemo(
    () => visitedVerbIds.filter((id) => appData.verbs.some((verb) => verb.id === id)).length,
    [appData.verbs, visitedVerbIds]
  );
  const progressPercent = appData.verbs.length ? Math.round((progressCount / appData.verbs.length) * 100) : 0;
  const recommendedVerb = useMemo(
    () => filteredVerbs.find((verb) => !visitedVerbIds.includes(verb.id)) || filteredVerbs.find((verb) => verb.id !== currentVerb?.id) || currentVerb,
    [currentVerb, filteredVerbs, visitedVerbIds]
  );
  const recommendedSummary = useMemo(() => getVerbSummary(recommendedVerb || currentVerb, learnerLanguage), [currentVerb, learnerLanguage, recommendedVerb]);
  const homePreviewRow = useMemo(() => {
    const previewSubject = SUBJECTS.find((subject) => subject.id === subjectId) || SUBJECTS[0];
    const previewTense = TENSES.find((tense) => tense.id === "simplePresent") || tenses[0] || TENSES[0];
    return buildRows(currentVerb, [previewSubject], [previewTense], interfaceLanguage, { learnerLanguage, useContractions })[0];
  }, [currentVerb, interfaceLanguage, learnerLanguage, subjectId, tenses, useContractions]);

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
      individualTenseIds,
      individualSubjectIds,
      interfaceLanguage,
      learnerLanguage,
      showAllSubjects,
      showTranslations,
      showSentenceParts,
      completeFormColumns,
      visitedVerbIds
    });
  }, [activePage, completeFormColumns, group, individualSubjectIds, individualTenseIds, interfaceLanguage, learnerLanguage, level, showAllSubjects, showSentenceParts, showTranslations, subjectId, verbId, verbPattern, verbSearch, visitedVerbIds]);

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
      const payload = validateVerbData(JSON.parse(await file.text()));
      applyVerbData(payload);
      showTimedAlert(t("imported"));
    } catch (error) {
      console.error(error);
      showTimedAlert(t("invalidJson"), "error");
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
      if (settingsFileInputRef.current) settingsFileInputRef.current.value = "";
    }
  }

  function applyVerbData(payload) {
    const safePayload = cloneVerbData(payload);
    setAppData(safePayload);
    setDataDraft(safePayload);
    setVerbId((current) => safePayload.verbs.some((verb) => verb.id === current) ? current : safePayload.verbs[0]?.id ?? "");
  }

  function handleExportDataJson() {
    try {
      const payload = validateVerbData(buildVerbPayload(dataDraft));
      downloadText(`${JSON.stringify(payload, null, 2)}\n`, "smarttense-verbs.json", "application/json");
      showTimedAlert(t("dataExported"));
    } catch (error) {
      console.error(error);
      showTimedAlert(t("draftInvalid"), "error");
    }
  }

  function handleSaveDataDraft() {
    try {
      const payload = validateVerbData(buildVerbPayload(dataDraft));
      applyVerbData(payload);
      showTimedAlert(t("dataSaved"));
    } catch (error) {
      console.error(error);
      showTimedAlert(t("draftInvalid"), "error");
    }
  }

  function handleDiscardDataDraft() {
    setDataDraft(cloneVerbData(appData));
    setNewVerbForm(EMPTY_VERB_FORM);
    showTimedAlert(t("draftDiscarded"));
  }

  function handleRestoreDefaultData() {
    if (!window.confirm(t("restoreDefaultConfirm"))) return;
    applyVerbData(DEFAULT_DATA);
    setNewVerbForm(EMPTY_VERB_FORM);
    showTimedAlert(t("defaultDataRestored"));
  }

  function handleBulkVerbChange(index, field, value) {
    setDataDraft((current) => {
      const next = cloneVerbData(current);
      const verb = { ...next.verbs[index] };
      if (field === "type" && value === "") {
        delete verb.type;
      } else {
        verb[field] = value;
      }
      next.verbs[index] = verb;
      return next;
    });
  }

  function handleDeleteDraftVerb(index) {
    setDataDraft((current) => {
      if (current.verbs.length <= 1) return current;
      const next = cloneVerbData(current);
      next.verbs.splice(index, 1);
      return next;
    });
  }

  function handleNewVerbField(field, value) {
    setNewVerbForm((current) => ({ ...current, [field]: value }));
  }

  function handleAddDraftVerb(event) {
    event.preventDefault();
    const newVerb = cleanVerbForm(newVerbForm);

    try {
      const payload = validateVerbData(buildVerbPayload({ ...dataDraft, verbs: [...dataDraft.verbs, newVerb] }));
      setDataDraft(payload);
      setNewVerbForm(EMPTY_VERB_FORM);
      setBulkEditSearch(newVerb.id);
      showTimedAlert(t("verbAddedToDraft"));
    } catch (error) {
      console.error(error);
      showTimedAlert(t("draftInvalid"), "error");
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


  function toggleIndividualTense(tenseId) {
    setIndividualTenseIds((current) => toggleSelection(current, tenseId));
  }

  function toggleIndividualSubject(selectedSubjectId) {
    setIndividualSubjectIds((current) => toggleSelection(current, selectedSubjectId));
  }

  function toggleIndividualTenseGroup(tenseIds) {
    setIndividualTenseIds((current) => toggleSelectionGroup(current, tenseIds));
  }

  function toggleAllIndividualSubjects() {
    setIndividualSubjectIds((current) => toggleSelectionGroup(current, SUBJECTS.map((subject) => subject.id)));
  }

  function toggleCompleteFormColumn(columnId) {
    setCompleteFormColumns((current) => {
      if (current.includes(columnId) && current.length === 1) return current;
      return toggleSelection(current, columnId);
    });
  }

  function renderAlert() {
    if (!alert) return null;

    return (
      <section className={`alert ${alert.type === "error" ? "error" : ""}`}>
        {alert.message}
      </section>
    );
  }

  function renderDashboard() {
    const levelLabel = LEVELS.find((entry) => entry.id === level)?.[interfaceLanguage];

    return (
      <section className="home-board" aria-label={t("home")}>
        <div className="home-hero-grid">
          <article className="home-primary-card">
            <div>
              <p className="eyebrow">{t("workspace")}</p>
              <h2>{currentVerb.label}</h2>
              <p>{verbSummary.meaning || t("noLearnerMeaning")} | {verbSummary.object || currentVerb.object || "core form"}</p>
            </div>
            <div className="dashboard-actions compact-home-actions" aria-label={t("homeActions")}>
              <button type="button" onClick={() => setActivePage("individual")}>{t("practiceIndividual")}</button>
              <button type="button" onClick={() => setActivePage("complete")}>{t("viewComplete")}</button>
            </div>
          </article>

          {homePreviewRow && (
            <article className="home-example-card">
              <p className="eyebrow">{t("exampleNow")}</p>
              <h3>{homePreviewRow.affirmative}</h3>
              {showSentenceParts && <SentenceParts parts={homePreviewRow.breakdown.affirmative} />}
              {showTranslations && <p>{homePreviewRow.translations.affirmative}</p>}
            </article>
          )}
        </div>

        <section className="home-stat-grid" aria-label={t("studyProgress")}>
          <article className="home-stat-card home-progress-card">
            <div>
              <span>{progressCount}/{appData.verbs.length}</span>
              <small>{t("verbsPracticed")}</small>
            </div>
            <div className="progress-track" aria-hidden="true"><span style={{ width: `${progressPercent}%` }} /></div>
          </article>
          <article className="home-stat-card"><span>{levelLabel}</span><small>{t("level")}</small></article>
          <article className="home-stat-card"><span>{tenses.length}</span><small>{t("tenses")}</small></article>
          <article className="home-stat-card"><span>{filteredVerbs.length}</span><small>{t("verbs")}</small></article>
        </section>

        <section className="home-content-grid">
          <article className="home-info-card">
            <div className="home-card-heading">
              <p className="eyebrow">{t("profileSnapshot")}</p>
              <h3>{currentVerb.label}</h3>
            </div>
            <dl className="home-compact-list">
              <div><dt>{t("learnerMeaning")}</dt><dd>{verbSummary.meaning || t("noLearnerMeaning")}</dd></div>
              <div><dt>{t("baseExample")}</dt><dd>{verbSummary.object || currentVerb.object || "core form"}</dd></div>
              <div><dt>{t("verbType")}</dt><dd>{verbTypeLabel(verbSummary.type, t)}</dd></div>
              <div><dt>{t("verbPattern")}</dt><dd>{verbPatternLabel(verbSummary.pattern, t)}</dd></div>
              <div><dt>{t("keyForms")}</dt><dd>{verbSummary.base} / {verbSummary.past} / {verbSummary.participle} / {verbSummary.gerund}</dd></div>
            </dl>
          </article>

          <article className="home-info-card home-recommend-card">
            <div className="home-card-heading">
              <p className="eyebrow">{t("recommendedNow")}</p>
              <h3>{recommendedVerb?.label || currentVerb.label}</h3>
            </div>
            <dl className="home-compact-list">
              <div><dt>{t("suggestedVerb")}</dt><dd>{recommendedVerb?.label || currentVerb.label}</dd></div>
              <div><dt>{t("learnerMeaning")}</dt><dd>{recommendedSummary.meaning || t("noLearnerMeaning")}</dd></div>
              <div><dt>{t("suggestedTense")}</dt><dd>{TENSES.find((tense) => tense.id === "simplePresent")?.[interfaceLanguage]}</dd></div>
              <div><dt>{t("suggestedSubject")}</dt><dd>{SUBJECTS.find((subject) => subject.id === subjectId)?.label || SUBJECTS[0].label}</dd></div>
            </dl>
            <button
              type="button"
              className="home-recommend-button"
              onClick={() => {
                if (recommendedVerb?.id) setVerbId(recommendedVerb.id);
                setActivePage("individual");
              }}
            >
              {t("continueLast")}
            </button>
          </article>
        </section>
      </section>
    );
  }

  function renderFilterPanel() {
    const isIndividualPage = activePage === "individual";
    const isCompletePage = activePage === "complete";
    return (
      <section className="workspace-filters" aria-label={t("filters")}>
        <div className="filter-primary-grid">
          <TextField label={t("verbSearch")} value={verbSearch} onChange={setVerbSearch} placeholder={t("verbSearchPlaceholder")} />
          <SelectField label={t("verb")} value={filteredVerbs.length ? verbId : ""} onChange={setVerbId} variant="light" disabled={filteredVerbs.length === 0}>{filteredVerbs.length === 0 ? <option value="">{t("noVerbMatches")}</option> : filteredVerbs.map((verb) => <option key={verb.id} value={verb.id}>{verb.label}</option>)}</SelectField>
          <SelectField label={t("verbPatternFilter")} value={verbPattern} onChange={setVerbPattern} variant="light">{VERB_PATTERN_FILTERS.map((pattern) => <option key={pattern} value={pattern}>{verbPatternFilterLabel(pattern, t)}</option>)}</SelectField>
          <SelectField label={t("level")} value={level} onChange={setLevel} variant="light">{LEVELS.map((entry) => <option key={entry.id} value={entry.id}>{entry[interfaceLanguage]}</option>)}</SelectField>
        </div>
        <details className="more-filters" open={isFiltersOpen} onToggle={(event) => setIsFiltersOpen(event.currentTarget.open)}>
          <summary><span className="more-filters-label">{t("moreFilters")}</span></summary>
          <div className="filter-secondary-grid">
            {!isIndividualPage && <><SelectField label={t("subject")} value={subjectId} onChange={setSubjectId} disabled={showAllSubjects} variant="light">{SUBJECTS.map((subject) => <option key={subject.id} value={subject.id}>{subject.label}</option>)}</SelectField><SelectField label={t("tenseGroup")} value={group} onChange={setGroup} variant="light"><option value="all">{t("allGroups")}</option><option value="present">{t("present")}</option><option value="past">{t("past")}</option><option value="future">{t("future")}</option><option value="conditional">{t("conditional")}</option></SelectField></>}
            <SelectField label={t("interfaceLanguage")} value={interfaceLanguage} onChange={setInterfaceLanguage} variant="light"><option value="en">English</option><option value="es">Espa&ntilde;ol</option></SelectField>
            <SelectField label={t("learnerLanguage")} value={learnerLanguage} onChange={setLearnerLanguage} variant="light">{SUPPORTED_LEARNER_LANGUAGES.map((entry) => <option key={entry.id} value={entry.id}>{entry.label}</option>)}</SelectField>
            {!isIndividualPage && <label className="check-row check-row-light"><input type="checkbox" checked={showAllSubjects} onChange={(event) => setShowAllSubjects(event.target.checked)} /><span>{t("showAllSubjects")}</span></label>}
            {isCompletePage && (
              <div className="column-toggle-panel" aria-label={t("visibleForms")}>
                <span>{t("visibleForms")}</span>
                <div className="column-toggle-buttons">
                  {COMPLETE_FORM_COLUMNS.map((columnId) => (
                    <button
                      type="button"
                      className={completeFormColumns.includes(columnId) ? "active" : ""}
                      key={columnId}
                      aria-pressed={completeFormColumns.includes(columnId)}
                      onClick={() => toggleCompleteFormColumn(columnId)}
                    >
                      {t(columnId)}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <label className="check-row check-row-light"><input type="checkbox" checked={showTranslations} onChange={(event) => setShowTranslations(event.target.checked)} /><span>{t("showTranslations")}</span></label>
            <label className="check-row check-row-light"><input type="checkbox" checked={showSentenceParts} onChange={(event) => setShowSentenceParts(event.target.checked)} /><span>{t("showSentenceParts")}</span></label>
            <div className="filter-table-actions" aria-label={t("tableActions")}>{!isIndividualPage && <button type="button" className="compact-action" onClick={handleExportCsv} aria-label={t("exportCsv")}>CSV</button>}{!isIndividualPage && <button type="button" className="compact-action" onClick={handleExportJson} aria-label={t("exportJson")}>JSON</button>}</div>
          </div>
        </details>
        {filteredVerbs.length === 0 && <p className="empty-filter-message">{t("noVerbMatchesHelp")}</p>}
      </section>
    );
  }

  function renderSettingsView() {
    const draftPayload = buildVerbPayload(dataDraft);
    const dataSummary = getDataSummary(draftPayload);
    const visibleDraftVerbs = dataDraft.verbs
      .map((verb, index) => ({ verb, index }))
      .filter(({ verb }) => matchesVerbSearch(verb, bulkEditSearch));

    return (
      <section className="settings-page" aria-label={t("settings")}>
        <div className="settings-header">
          <div>
            <p className="eyebrow">{t("settings")}</p>
            <h2>{t("settingsTitle")}</h2>
            <p>{t("settingsIntro")}</p>
          </div>
          <div className="settings-actions">
            <button type="button" onClick={handleSaveDataDraft}>{t("saveDataChanges")}</button>
            <button type="button" onClick={handleDiscardDataDraft}>{t("discardDraft")}</button>
          </div>
        </div>

        <section className="settings-grid">
          <article className="settings-card">
            <p className="eyebrow">{t("generalSettings")}</p>
            <div className="settings-control-grid">
              <SelectField label={t("interfaceLanguage")} value={interfaceLanguage} onChange={setInterfaceLanguage} variant="light">
                <option value="en">English</option>
                <option value="es">Espa&ntilde;ol</option>
              </SelectField>
              <SelectField label={t("learnerLanguage")} value={learnerLanguage} onChange={setLearnerLanguage} variant="light">
                {SUPPORTED_LEARNER_LANGUAGES.map((entry) => <option key={entry.id} value={entry.id}>{entry.label}</option>)}
              </SelectField>
              <label className="check-row check-row-light"><input type="checkbox" checked={showTranslations} onChange={(event) => setShowTranslations(event.target.checked)} /><span>{t("showTranslations")}</span></label>
              <label className="check-row check-row-light"><input type="checkbox" checked={showSentenceParts} onChange={(event) => setShowSentenceParts(event.target.checked)} /><span>{t("showSentenceParts")}</span></label>
            </div>
            <button type="button" className="reset-progress-button" onClick={handleResetProgress}>{t("resetProgress")}</button>
          </article>

          <article className="settings-card">
            <p className="eyebrow">{t("dataManager")}</p>
            <dl className="data-summary-grid">
              <div><dt>{t("verbs")}</dt><dd>{dataSummary.total}</dd></div>
              <div><dt>{t("updatedAt")}</dt><dd>{dataSummary.updatedAt}</dd></div>
              <div><dt>{t("schemaVersion")}</dt><dd>{dataSummary.schemaVersion}</dd></div>
              <div><dt>{t("patterns")}</dt><dd>{dataSummary.patterns}</dd></div>
            </dl>
            <div className="settings-actions settings-actions-wrap">
              <label className="import-button import-button-light">
                <input ref={settingsFileInputRef} type="file" accept="application/json,.json" onChange={handleImportJson} />
                {t("importJson")}
              </label>
              <button type="button" onClick={handleExportDataJson}>{t("exportDatabase")}</button>
              <button type="button" onClick={handleRestoreDefaultData}>{t("restoreDefaultData")}</button>
            </div>
            <p className="settings-note">{t("dataManagerNote")}</p>
          </article>
        </section>

        <section className="settings-card add-verb-card">
          <div className="settings-section-heading">
            <div>
              <p className="eyebrow">{t("addVerb")}</p>
              <h3>{t("addVerbTitle")}</h3>
            </div>
          </div>
          <form className="add-verb-grid" onSubmit={handleAddDraftVerb}>
            {DATA_MANAGER_FIELDS.map((field) => (
              field === "type" ? (
                <SelectField key={field} label={dataFieldLabel(field, t)} value={newVerbForm[field]} onChange={(value) => handleNewVerbField(field, value)} variant="light">
                  <option value="">{t("regularOrIrregular")}</option>
                  <option value="be">{t("beVerb")}</option>
                  <option value="modal">{t("modalVerb")}</option>
                </SelectField>
              ) : (
                <TextField key={field} label={dataFieldLabel(field, t)} value={newVerbForm[field]} onChange={(value) => handleNewVerbField(field, value)} placeholder={field === "id" ? "write" : ""} />
              )
            ))}
            <button type="submit" className="add-verb-button">{t("addToDraft")}</button>
          </form>
        </section>

        <section className="settings-card bulk-edit-card">
          <div className="settings-section-heading">
            <div>
              <p className="eyebrow">{t("bulkEdit")}</p>
              <h3>{t("bulkEditTitle")}</h3>
            </div>
            <TextField label={t("searchDraft")}
              value={bulkEditSearch}
              onChange={setBulkEditSearch}
              placeholder={t("verbSearchPlaceholder")}
            />
          </div>
          <div className="bulk-edit-wrap">
            <table className="bulk-edit-table">
              <thead>
                <tr>
                  {DATA_MANAGER_FIELDS.map((field) => <th key={field}>{dataFieldLabel(field, t)}</th>)}
                  <th>{t("actions")}</th>
                </tr>
              </thead>
              <tbody>
                {visibleDraftVerbs.map(({ verb, index }) => (
                  <tr key={`${verb.id}-${index}`}>
                    {DATA_MANAGER_FIELDS.map((field) => (
                      <td key={field}>
                        {field === "type" ? (
                          <select value={verb.type || ""} onChange={(event) => handleBulkVerbChange(index, field, event.target.value)}>
                            <option value="">{t("regularOrIrregular")}</option>
                            <option value="be">{t("beVerb")}</option>
                            <option value="modal">{t("modalVerb")}</option>
                          </select>
                        ) : (
                          <input value={verb[field] || ""} onChange={(event) => handleBulkVerbChange(index, field, event.target.value)} />
                        )}
                      </td>
                    ))}
                    <td><button type="button" className="compact-action" onClick={() => handleDeleteDraftVerb(index)}>{t("deleteVerb")}</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {visibleDraftVerbs.length === 0 && <p className="empty-filter-message">{t("noVerbMatchesHelp")}</p>}
        </section>
      </section>
    );
  }

  function renderCompleteView() {
    return (
      <>
        {renderFilterPanel()}
        <section className="table-card complete-table-card">
          <VerbProfile verb={currentVerb} summary={verbSummary} t={t} />
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th className="sticky-col sticky-subject">{t("subjectCol")}</th>
                  <th className="sticky-col sticky-tense">{t("tenseCol")}</th>
                  {completeFormColumns.map((columnId) => (
                    <th key={columnId}>{t(columnId)}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <ConjugationRows rows={rows} language={interfaceLanguage} showTranslations={showTranslations} showSentenceParts={showSentenceParts} visibleColumns={completeFormColumns} />
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
    );
  }
  function renderIndividualView() {
    const individualRowsByTense = selectedIndividualTenses
      .map((tense) => ({
        tense,
        rows: individualRows.filter((row) => row.tenseId === tense.id)
      }))
      .filter((entry) => entry.rows.length > 0);

    return (
      <>
        {renderFilterPanel()}
        <section className="individual-board">
          <div className="individual-header">
            <div>
              <p className="eyebrow">{t("individual")}</p>
              <h2>{currentVerb.label}</h2>
              <p>{verbSummary.meaning || t("noLearnerMeaning")} | {verbSummary.object || currentVerb.object || "core form"}</p>
            </div>
            <p className="selection-summary">
              {selectedIndividualTenses.length} {t("tensesSelected")} | {selectedIndividualSubjects.length} {t("subjectsSelected")}
            </p>
          </div>

          <div className="choice-panel" aria-label={t("tenseGroup")}>
            <div>
              <p className="choice-label">{t("tenseCol")}</p>
              <div className="individual-tense-groups">
                {INDIVIDUAL_TENSE_GROUPS.map((tenseGroup) => {
                  const isGroupActive = tenseGroup.tenseIds.every((tenseId) => individualTenseIds.includes(tenseId));

                  return (
                    <section className="individual-tense-group" key={tenseGroup.id}>
                      <button
                        type="button"
                        className={`group-toggle ${isGroupActive ? "active" : ""}`}
                        aria-pressed={isGroupActive}
                        onClick={() => toggleIndividualTenseGroup(tenseGroup.tenseIds)}
                      >
                        <span>{t(tenseGroup.labelKey)}</span>
                        <small>{isGroupActive ? t("clearGroup") : t("selectGroup")}</small>
                      </button>
                      <div className="choice-buttons">
                        {tenseGroup.tenseIds.map((tenseId) => {
                          const tense = individualTenses.find((entry) => entry.id === tenseId);
                          if (!tense) return null;

                          return (
                            <button
                              type="button"
                              className={individualTenseIds.includes(tense.id) ? "active" : ""}
                              key={tense.id}
                              aria-pressed={individualTenseIds.includes(tense.id)}
                              onClick={() => toggleIndividualTense(tense.id)}
                            >
                              {individualTenseButtonLabel(tense.id, interfaceLanguage)}
                            </button>
                          );
                        })}
                      </div>
                    </section>
                  );
                })}
              </div>
            </div>

            <div>
              <button
                type="button"
                className={`choice-label choice-label-button ${individualSubjectIds.length === SUBJECTS.length ? "active" : ""}`}
                aria-pressed={individualSubjectIds.length === SUBJECTS.length}
                onClick={toggleAllIndividualSubjects}
              >
                <span>{t("subject")}</span>
                <small>{individualSubjectIds.length === SUBJECTS.length ? t("clearGroup") : t("selectGroup")}</small>
              </button>
              <div className="choice-buttons subject-buttons">
                {SUBJECTS.map((subject) => (
                  <button
                    type="button"
                    className={individualSubjectIds.includes(subject.id) ? "active" : ""}
                    key={subject.id}
                    aria-pressed={individualSubjectIds.includes(subject.id)}
                    onClick={() => toggleIndividualSubject(subject.id)}
                  >
                    {subject.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {individualRows.length === 0 ? (
            <p className="empty-filter-message">{t("individualEmpty")}</p>
          ) : (
            <div className="affirmative-grid">
              {individualRowsByTense.map(({ tense, rows: tenseRows }) => (
                <section className="affirmative-group" key={tense.id}>
                  <h3>{tense[interfaceLanguage]}</h3>
                  <div className="affirmative-group-grid">
                    {tenseRows.map((row) => (
                      <article className="affirmative-card" key={`${row.subject}-${row.tenseId}`}>
                        <div>
                          <p className="eyebrow">{row.tense}</p>
                          <h3>{row.subject}</h3>
                        </div>
                        <div className="affirmative-sentence">
                          <span className="sentence">{row.affirmative}</span>
                          {showSentenceParts && <SentenceParts parts={row.breakdown.affirmative} />}
                          {showTranslations && row.translations.affirmative && <span className="translation">{row.translations.affirmative}</span>}
                          {row.usageNote && <span className="usage-note">{row.usageNote}</span>}
                        </div>
                      </article>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          )}
        </section>
      </>
    );
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
        {renderAlert()}
        {activePage === "home" && renderDashboard()}
        {activePage === "individual" && renderIndividualView()}
        {activePage === "complete" && renderCompleteView()}
        {activePage === "settings" && renderSettingsView()}
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

function ConjugationRows({ rows, language, showTranslations, showSentenceParts, visibleColumns = COMPLETE_FORM_COLUMNS }) {
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
        visibleColumns={visibleColumns}
      />
    );
  });
}

function FragmentRow({ row, language, showGroup, showTranslations, showSentenceParts, visibleColumns }) {
  return (
    <>
      {showGroup && (
        <tr className="group-row">
          <td colSpan={visibleColumns.length + 2}>{GROUP_LABELS[row.group][language]}</td>
        </tr>
      )}
      <tr>
        <td className="subject-cell sticky-col sticky-subject">{row.subject}</td>
        <td className="tense-cell sticky-col sticky-tense">
          <span>{row.tense}</span>
          {row.usageNote && <span className="usage-note">{row.usageNote}</span>}
        </td>
        {visibleColumns.map((columnId) => (
          <SentenceCell
            key={columnId}
            sentence={row[columnId]}
            parts={row.breakdown[columnId]}
            translation={row.translations[columnId]}
            showTranslations={showTranslations}
            showSentenceParts={showSentenceParts}
          />
        ))}
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

function toggleSelectionGroup(current, values) {
  const hasAllValues = values.every((value) => current.includes(value));
  if (hasAllValues) return current.filter((item) => !values.includes(item));
  return [...new Set([...current, ...values])];
}

function toggleSelection(current, value) {
  return current.includes(value) ? current.filter((item) => item !== value) : [...current, value];
}

function individualTenseButtonLabel(tenseId, language) {
  const labels = {
    simplePast: { en: "Simple", es: "Simple" },
    pastPerfect: { en: "Perfect", es: "Perfecto" },
    pastContinuous: { en: "Continuous", es: "Continuo" },
    simplePresent: { en: "Simple", es: "Simple" },
    presentPerfect: { en: "Perfect", es: "Perfecto" },
    presentContinuous: { en: "Continuous", es: "Continuo" },
    simpleFuture: { en: "Simple", es: "Simple" },
    futurePerfect: { en: "Perfect", es: "Perfecto" },
    futureContinuous: { en: "Continuous", es: "Continuo" },
    simpleConditional: { en: "Simple", es: "Simple" },
    perfectConditional: { en: "Perfect", es: "Perfecto" },
    continuousConditional: { en: "Continuous", es: "Continuo" }
  };

  return labels[tenseId]?.[language] || labels[tenseId]?.en || tenseId;
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

function cloneVerbData(data) {
  return JSON.parse(JSON.stringify(data));
}

function buildVerbPayload(data) {
  return {
    schemaVersion: data.schemaVersion || 1,
    updatedAt: new Date().toISOString().slice(0, 10),
    verbs: data.verbs.map(cleanVerbForm)
  };
}

function cleanVerbForm(verb) {
  return Object.fromEntries(
    Object.entries(verb)
      .map(([key, value]) => [key, typeof value === "string" ? value.trim() : value])
      .filter(([, value]) => value !== "" && value !== undefined && value !== null)
  );
}

function getDataSummary(data) {
  const patterns = new Set(data.verbs.map((verb) => getVerbSummary(verb).pattern));
  return {
    total: data.verbs.length,
    updatedAt: data.updatedAt || "local draft",
    schemaVersion: data.schemaVersion || 1,
    patterns: patterns.size
  };
}

function dataFieldLabel(field, t) {
  const labels = {
    id: "ID",
    label: t("verb"),
    meaningEs: t("learnerMeaning"),
    base: "Base",
    third: "3rd",
    past: "Past",
    participle: "Participle",
    gerund: "Gerund",
    object: t("baseExample"),
    objectEs: t("learnerObject"),
    type: t("verbType")
  };

  return labels[field] || field;
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
