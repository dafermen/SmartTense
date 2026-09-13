import { useEffect, useMemo, useRef, useState } from "react";
import { buildRows, getTensesByGroup, getVerbSummary, GROUP_LABELS } from "./conjugation.js";
import { DEFAULT_DATA, LEVELS, SUBJECTS, TENSES } from "./data/defaultData.js";
import { validateLearningContent } from "./data/learningContentValidation.js";
import { validateVerbData } from "./data/validation.js";
import { translate } from "./i18n.js";
import { buildLearningContentPayload, cloneLearningContent, getLearningContentSummary } from "./learningContentAdmin.js";
import { ALL_CONTEXTS, getUnitContexts, getVocabularyItems, filterByContext } from "./learningContexts.js";
import { DIAGNOSTIC_CHECKS, getDiagnosticResult, toggleDiagnosticAnswer } from "./learningDiagnostic.js";
import { getLearningUnitsByCefrFilter, getNextLearningStep, getOrderedLearningUnits, getRecommendedLearningUnit, getRecommendedLearningUnitForLevel, getUnitProgress, markUnitProgress, resetUnitProgress } from "./learningPath.js";
import { SUPPORTED_LEARNER_LANGUAGES, getLearnerMeaning, getLearnerObject } from "./learnerLanguages/index.js";
import { getPracticeExercises, scorePracticeAnswer } from "./practice.js";
import { PRODUCTION_PROMPTS, PRODUCTION_STATUSES } from "./data/productionPrompts.js";
import GuidedLessonPage from "./GuidedLessonPage.jsx";
import { getSkillMasterySummary, recordExerciseResult, resetUnitSkillProgress } from "./skillMastery.js";
import AdaptiveReviewPage from "./AdaptiveReviewPage.jsx";
import { CoursePage, MobileHomeFocus, ProgressPage } from "./LearningHubPages.jsx";
import FocusedPracticePage from "./FocusedPracticePage.jsx";
import OnboardingDiagnostic from "./OnboardingDiagnostic.jsx";
import { buildGuidedLessonSteps } from "./guidedLesson.js";
import { getJourneyPercent, getJourneyStatus, getUnitJourney, resetUnitJourney, updateUnitJourney } from "./learningJourney.js";
import { buildProgressBackup, validateProgressBackup } from "./progressBackup.js";
import ManualPage from "./ManualPage.jsx";
import UiIcon from "./UiIcon.jsx";

const INITIAL_ALERT_MS = 6000;
const MOBILE_MENU_QUERY = "(max-width: 880px)";
const MAX_IMPORT_BYTES = 512 * 1024;
import { clearJsonStorage, readJsonStorage, writeJsonStorage } from "./browserStorage.js";

const STORAGE_KEY = "smarttense-progress-v1";
const VERB_PATTERN_FILTERS = ["all", "REGULAR_ED", "AAA", "ABB", "ABC", "ABA", "BE", "MODAL"];
const MENU_ITEMS = ["home", "course", "theory", "manual", "practice", "progress", "individual", "complete", "production", "settings", "documentation", "about"];
const MOBILE_NAV_ITEMS = [
  { page: "home", labelKey: "home", icon: "home", activePages: ["home"] },
  { page: "course", labelKey: "course", icon: "course", activePages: ["course", "theory", "lesson"] },
  { page: "practice", labelKey: "practice", icon: "practice", activePages: ["practice", "review"] },
  { page: "progress", labelKey: "progress", icon: "progress", activePages: ["progress"] }
];
const INDIVIDUAL_TENSE_GROUPS = [
  { id: "past", labelKey: "past", tenseIds: ["simplePast", "pastPerfect", "pastContinuous"] },
  { id: "present", labelKey: "present", tenseIds: ["simplePresent", "presentPerfect", "presentContinuous"] },
  { id: "future", labelKey: "future", tenseIds: ["simpleFuture", "futurePerfect", "futureContinuous"] },
  { id: "conditional", labelKey: "conditional", tenseIds: ["simpleConditional", "perfectConditional", "continuousConditional"] }
];
const INDIVIDUAL_DEFAULT_TENSE_IDS = ["simplePresent"];
const COMPLETE_FORM_COLUMNS = ["affirmative", "negative", "questionPositive", "questionNegative"];
const DATA_MANAGER_FIELDS = ["id", "label", "meaningEs", "base", "third", "past", "participle", "gerund", "object", "objectEs", "type"];
const DATA_TABLE_PAGE_SIZES = [10, 25, 50, 100];
const PRODUCTION_MODES = ["all", "speaking", "writing"];
const PRODUCTION_PROMPT_SCOPES = ["suggested", "all"];
const CEFR_FILTERS = ["all", "A1", "A2", "B1", "B2"];
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

function shuffleArray(values) {
  const list = [...values];
  for (let index = list.length - 1; index > 0; index -= 1) {
    const nextIndex = (index * 31 + 7) % list.length;
    [list[index], list[nextIndex]] = [list[nextIndex], list[index]];
  }
  return list;
}

function capitalizeWord(value) {
  if (!value) return value;
  return `${value[0].toUpperCase()}${value.slice(1)}`;
}

function buildFallbackOptionsForExercise(exercise) {
  if (!exercise || typeof exercise.answer !== "string") return [];

  const rawAnswer = exercise.answer.trim();
  if (!rawAnswer) return [];

  const punctuation = rawAnswer.match(/[?!.]+$/)?.[0] || ".";
  const cleanAnswer = rawAnswer.replace(/[?!.]+$/g, "").trim();
  const tokens = cleanAnswer.split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return [rawAnswer];

  const options = new Set([rawAnswer]);
  const first = tokens[0] ? tokens[0].toLowerCase() : "";
  const rest = tokens.slice(1);

  const addOption = (value) => {
    const option = String(value || "").trim();
    if (!option) return;
    options.add(option);
  };

  const auxMap = {
    are: ["is", "am", "was", "were", "do"],
    is: ["are", "was", "were", "does", "did"],
    am: ["are", "is", "was"],
    do: ["does", "did", "are", "do"],
    does: ["do", "did", "is", "does"],
    did: ["do", "does", "will", "had"],
    have: ["has", "had", "are", "were"],
    has: ["have", "had", "is"],
    had: ["have", "has", "did"],
    will: ["would", "can", "does"],
    would: ["will", "could", "does"],
    can: ["could", "will", "do"],
    could: ["can", "will", "would"],
    should: ["would", "could", "has"],
    must: ["might", "can", "should"],
    may: ["can", "might", "would"]
  };

  const pronounMap = {
    i: ["he", "she", "we", "they"],
    you: ["I", "he", "she", "we", "they"],
    he: ["I", "you", "she", "we"],
    she: ["I", "you", "he", "we"],
    we: ["I", "you", "he", "she", "they"],
    they: ["I", "you", "he", "she"],
    it: ["he", "she", "they", "we"]
  };

  if (rest.length > 0) {
    if (Array.isArray(auxMap[first])) {
      const alternatives = auxMap[first].slice(0, 2);
      for (const aux of alternatives) {
        addOption(`${capitalizeWord(aux)} ${rest.join(' ')}${punctuation}`);
      }
    }

    const pronouns = pronounMap[first] || [];
    for (const pronoun of pronouns.slice(0, 2)) {
      addOption(`${capitalizeWord(pronoun)} ${rest.join(' ')}${punctuation}`);
    }
  }

  const lowerTokens = tokens.map((token) => token.toLowerCase());
  const notIndex = lowerTokens.indexOf("not");
  if (notIndex >= 0) {
    const withoutNot = [...tokens];
    withoutNot.splice(notIndex, 1);
    if (withoutNot.length > 0) {
      addOption(`${capitalizeWord(withoutNot[0])} ${withoutNot.slice(1).join(' ')}${punctuation}`);
    }
  }

  if (tokens.length >= 2) {
    const swapped = [tokens[1], tokens[0], ...tokens.slice(2)];
    addOption(`${capitalizeWord(swapped[0])} ${swapped.slice(1).join(' ')}${punctuation}`);
  }

  while (options.size < 3) {
    const fallbackOption = `${capitalizeWord(tokens[0])} ${tokens.slice(1).join(' ')}${punctuation}`;
    if (options.has(fallbackOption)) {
      addOption(`${capitalizeWord(tokens[0])} ${tokens.slice(1).join(' ')}?`);
      break;
    }
    addOption(fallbackOption);
  }

  return shuffleArray(Array.from(options)).slice(0, 4);
}

export default function App() {
  const [storedSettings] = useState(readStoredSettings);
  // Most state in this component represents visible learner choices. The grammar
  // rules themselves stay in conjugation.js so UI changes do not affect output.
  const [appData, setAppData] = useState(DEFAULT_DATA);
  const [learningContent, setLearningContent] = useState({ schemaVersion: 3, units: [] });
  const [learningContentDraft, setLearningContentDraft] = useState({ schemaVersion: 3, contexts: [], units: [] });
  const [activeLearningUnitId, setActiveLearningUnitId] = useState(storedSettings.activeLearningUnitId || "");
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
  const [completionCelebration, setCompletionCelebration] = useState(null);
  const [interfaceLanguage, setInterfaceLanguage] = useState(storedSettings.interfaceLanguage || storedSettings.language || "en");
  const [learnerLanguage, setLearnerLanguage] = useState(storedSettings.learnerLanguage || "es");
  const [showAllSubjects, setShowAllSubjects] = useState(storedSettings.showAllSubjects ?? false);
  const [showTranslations, setShowTranslations] = useState(storedSettings.showTranslations ?? true);
  const [showSentenceParts, setShowSentenceParts] = useState(storedSettings.showSentenceParts ?? true);
  const [showFormExplanations, setShowFormExplanations] = useState(storedSettings.showFormExplanations ?? true);
  const [completeFormColumns, setCompleteFormColumns] = useState(() => {
    if (Array.isArray(storedSettings.completeFormColumns) && storedSettings.completeFormColumns.length) return storedSettings.completeFormColumns;
    return COMPLETE_FORM_COLUMNS;
  });
  const [visitedVerbIds, setVisitedVerbIds] = useState(storedSettings.visitedVerbIds || []);
  const [unitProgress, setUnitProgress] = useState(storedSettings.unitProgress || {});
  const [skillProgress, setSkillProgress] = useState(storedSettings.skillProgress || {});
  const [journeyProgress, setJourneyProgress] = useState(storedSettings.journeyProgress || {});
  const [diagnosticAnswers, setDiagnosticAnswers] = useState(storedSettings.diagnosticAnswers || {});
  const [diagnosticCompleted, setDiagnosticCompleted] = useState(storedSettings.diagnosticCompleted || false);
  const [cefrFilter, setCefrFilter] = useState(storedSettings.cefrFilter || "all");
  const [selectedContextTag, setSelectedContextTag] = useState(storedSettings.selectedContextTag || ALL_CONTEXTS);
  const [productionDraftPromptId, setProductionDraftPromptId] = useState(storedSettings.productionDraftPromptId || PRODUCTION_PROMPTS[0]?.id || "");
  const [productionPromptScope, setProductionPromptScope] = useState(storedSettings.productionPromptScope || "suggested");
  const [productionModeFilter, setProductionModeFilter] = useState(storedSettings.productionModeFilter || "all");
  const [productionStatusFilter, setProductionStatusFilter] = useState(storedSettings.productionStatusFilter || "all");
  const [productionResponse, setProductionResponse] = useState(storedSettings.productionResponse || "");
  const [productionReview, setProductionReview] = useState(storedSettings.productionReview || "");
  const [productionStatus, setProductionStatus] = useState(storedSettings.productionStatus || "draft");
  const [productionEditingAttemptId, setProductionEditingAttemptId] = useState(null);
  const [productionAttempts, setProductionAttempts] = useState(storedSettings.productionAttempts || {});
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(() => {
    if (typeof window === "undefined") return true;
    return !window.matchMedia(MOBILE_MENU_QUERY).matches;
  });
  const [isHomeNarrow, setIsHomeNarrow] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia(MOBILE_MENU_QUERY).matches;
  });
  const [alert, setAlert] = useState(null);
  const [practiceAnswers, setPracticeAnswers] = useState({});
  const [practiceResults, setPracticeResults] = useState({});
  const fileInputRef = useRef(null);
  const settingsFileInputRef = useRef(null);
  const learningContentFileInputRef = useRef(null);
  const progressFileInputRef = useRef(null);
  const [dataDraft, setDataDraft] = useState(() => cloneVerbData(DEFAULT_DATA));
  const [newVerbForm, setNewVerbForm] = useState(EMPTY_VERB_FORM);
  const [bulkEditSearch, setBulkEditSearch] = useState("");
  const [isBulkEditMode, setIsBulkEditMode] = useState(false);
  const [editingDraftIndex, setEditingDraftIndex] = useState(null);
  const [editingDraftBackup, setEditingDraftBackup] = useState(null);
  const [dataTableSort, setDataTableSort] = useState({ field: "index", direction: "asc" });
  const [dataTablePage, setDataTablePage] = useState(1);
  const [dataTablePageSize, setDataTablePageSize] = useState(25);

  const t = (key) => translate(interfaceLanguage, key);

  useEffect(() => {
    document.documentElement.lang = interfaceLanguage;
  }, [interfaceLanguage]);

  useEffect(() => {
    const mediaQuery = window.matchMedia(MOBILE_MENU_QUERY);
    const syncMenuToViewport = (event) => {
      const isNarrow = event.matches;
      setIsMenuOpen(!isNarrow);
      setIsHomeNarrow(isNarrow);
      if (!isNarrow) setIsFiltersOpen(false);
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
    let isMounted = true;

    async function loadLearningContent() {
      try {
        const response = await fetch("/data/learningUnits.json", { cache: "no-store" });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const payload = validateLearningContent(await response.json());
        if (!isMounted) return;
        setLearningContent(payload);
        setLearningContentDraft(cloneLearningContent(payload));
      } catch (error) {
        console.error(error);
        if (!isMounted) return;
        setLearningContent({ schemaVersion: 3, units: [] });
        setLearningContentDraft({ schemaVersion: 3, contexts: [], units: [] });
        showTimedAlert(t("learningContentFallback"), "error");
      }
    }

    loadLearningContent();

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
    () => appData.verbs.find((verb) => verb.id === verbId) || patternVerbs[0] || appData.verbs[0],
    [appData.verbs, patternVerbs, verbId]
  );

  useEffect(() => {
    if (patternVerbs.length === 0) return;
    if (patternVerbs.some((verb) => verb.id === verbId)) return;
    setVerbId(patternVerbs[0]?.id ?? appData.verbs[0]?.id ?? "");
  }, [appData.verbs, patternVerbs, verbId]);

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
    () => patternVerbs.find((verb) => !visitedVerbIds.includes(verb.id)) || patternVerbs.find((verb) => verb.id !== currentVerb?.id) || currentVerb,
    [currentVerb, patternVerbs, visitedVerbIds]
  );
  const recommendedSummary = useMemo(() => getVerbSummary(recommendedVerb || currentVerb, learnerLanguage), [currentVerb, learnerLanguage, recommendedVerb]);
  const homePreviewRow = useMemo(() => {
    const previewSubject = SUBJECTS.find((subject) => subject.id === subjectId) || SUBJECTS[0];
    const previewTense = TENSES.find((tense) => tense.id === "simplePresent") || tenses[0] || TENSES[0];
    return buildRows(currentVerb, [previewSubject], [previewTense], interfaceLanguage, { learnerLanguage, useContractions })[0];
  }, [currentVerb, interfaceLanguage, learnerLanguage, subjectId, tenses, useContractions]);
  const orderedLearningUnits = useMemo(() => getOrderedLearningUnits(learningContent.units), [learningContent.units]);
  const visibleLearningUnits = useMemo(
    () => getLearningUnitsByCefrFilter(orderedLearningUnits, cefrFilter),
    [cefrFilter, orderedLearningUnits]
  );
  const diagnosticResult = useMemo(() => getDiagnosticResult(diagnosticAnswers), [diagnosticAnswers]);
  const diagnosticRecommendedUnit = useMemo(
    () => getRecommendedLearningUnitForLevel(orderedLearningUnits, unitProgress, diagnosticResult?.cefrLevel),
    [diagnosticResult?.cefrLevel, orderedLearningUnits, unitProgress]
  );
  const cefrRecommendedUnit = useMemo(
    () => cefrFilter === "all" ? null : getRecommendedLearningUnitForLevel(orderedLearningUnits, unitProgress, cefrFilter),
    [cefrFilter, orderedLearningUnits, unitProgress]
  );
  const defaultLearningUnit = useMemo(
    () => cefrRecommendedUnit || diagnosticRecommendedUnit || getRecommendedLearningUnit(visibleLearningUnits, unitProgress) || visibleLearningUnits.find((unit) => unit.tenseIds.includes("simplePresent")) || orderedLearningUnits[0],
    [cefrRecommendedUnit, diagnosticRecommendedUnit, orderedLearningUnits, unitProgress, visibleLearningUnits]
  );
  const primaryLearningUnit = useMemo(
    () => visibleLearningUnits.find((unit) => unit.id === activeLearningUnitId) || defaultLearningUnit,
    [activeLearningUnitId, defaultLearningUnit, visibleLearningUnits]
  );
  useEffect(() => {
    if (!visibleLearningUnits.length) return;
    if (!activeLearningUnitId) {
      setActiveLearningUnitId(defaultLearningUnit?.id || visibleLearningUnits[0].id);
      return;
    }
    if (visibleLearningUnits.some((unit) => unit.id === activeLearningUnitId)) return;
    setActiveLearningUnitId(defaultLearningUnit?.id || visibleLearningUnits[0].id);
  }, [activeLearningUnitId, defaultLearningUnit, visibleLearningUnits]);
  const unitContexts = useMemo(
    () => getUnitContexts(primaryLearningUnit, learningContent.contexts || []),
    [learningContent.contexts, primaryLearningUnit]
  );
  const vocabularyItems = useMemo(
    () => getVocabularyItems(primaryLearningUnit, selectedContextTag),
    [primaryLearningUnit, selectedContextTag]
  );
  const practiceExercises = useMemo(() => getPracticeExercises(primaryLearningUnit, selectedContextTag), [primaryLearningUnit, selectedContextTag]);
  const primaryUnitProgress = useMemo(
    () => getUnitProgress(primaryLearningUnit?.id, unitProgress),
    [primaryLearningUnit?.id, unitProgress]
  );
  const productionPrompts = useMemo(() => PRODUCTION_PROMPTS, []);
  const suggestedProductionPrompts = useMemo(
    () => getSuggestedProductionPrompts(productionPrompts, primaryLearningUnit),
    [primaryLearningUnit, productionPrompts]
  );
  const composerProductionPrompts = useMemo(() => {
    const scopedPrompts = productionPromptScope === "suggested" ? suggestedProductionPrompts : productionPrompts;
    const currentPrompt = productionPrompts.find((prompt) => prompt.id === productionDraftPromptId);
    if (currentPrompt && !scopedPrompts.some((prompt) => prompt.id === currentPrompt.id)) {
      return [currentPrompt, ...scopedPrompts];
    }
    return scopedPrompts;
  }, [productionDraftPromptId, productionPromptScope, productionPrompts, suggestedProductionPrompts]);
  const currentProductionPrompt = useMemo(
    () => composerProductionPrompts.find((prompt) => prompt.id === productionDraftPromptId) || composerProductionPrompts[0] || null,
    [composerProductionPrompts, productionDraftPromptId]
  );
  const productionQueueRows = useMemo(() => {
    const rows = [];
    for (const prompt of productionPrompts) {
      const attempts = productionAttempts[prompt.id] || [];
      for (const attempt of attempts) {
        rows.push({ ...attempt, promptId: prompt.id, promptTitle: prompt.title, promptMode: prompt.mode, promptTenseId: prompt.tenseId, prompt });
      }
    }
    return rows.sort((a, b) => new Date(b.updatedAt || "").valueOf() - new Date(a.updatedAt || "").valueOf());
  }, [productionAttempts, productionPrompts]);
  const filteredProductionRows = useMemo(() => {
    return productionQueueRows.filter((row) => {
      if (productionModeFilter !== "all" && row.promptMode !== productionModeFilter) return false;
      if (productionStatusFilter !== "all" && row.status !== productionStatusFilter) return false;
      return true;
    });
  }, [productionModeFilter, productionQueueRows, productionStatusFilter]);
  const nextLearningStep = useMemo(
    () => getNextLearningStep(primaryLearningUnit, unitProgress),
    [primaryLearningUnit, unitProgress]
  );
  const practiceCorrectCount = useMemo(
    () => Object.values(practiceResults).filter((result) => result.isCorrect).length,
    [practiceResults]
  );

  useEffect(() => {
    if (!currentVerb?.id) return;
    setVisitedVerbIds((current) => current.includes(currentVerb.id) ? current : [...current, currentVerb.id]);
  }, [currentVerb?.id]);

  useEffect(() => {
    if (selectedContextTag === ALL_CONTEXTS) return;
    if (unitContexts.some((context) => context.id === selectedContextTag)) return;
    setSelectedContextTag(ALL_CONTEXTS);
  }, [selectedContextTag, unitContexts]);

  useEffect(() => {
    if (!composerProductionPrompts.length) return;
    if (productionDraftPromptId && composerProductionPrompts.some((prompt) => prompt.id === productionDraftPromptId)) return;
    setProductionDraftPromptId(composerProductionPrompts[0].id);
  }, [composerProductionPrompts, productionDraftPromptId]);

  useEffect(() => {
    if (productionPromptScope !== "suggested" || productionEditingAttemptId) return;
    if (!suggestedProductionPrompts.length) return;
    if (suggestedProductionPrompts.some((prompt) => prompt.id === productionDraftPromptId)) return;
    setProductionDraftPromptId(suggestedProductionPrompts[0].id);
  }, [productionDraftPromptId, productionEditingAttemptId, productionPromptScope, suggestedProductionPrompts]);

  useEffect(() => {
    if (activePage !== "theory" || !primaryLearningUnit?.id) return;
    setUnitProgress((current) => markUnitProgress(current, primaryLearningUnit.id, { theoryViewed: true }));
  }, [activePage, primaryLearningUnit?.id]);

  useEffect(() => {
    if (!primaryLearningUnit?.id || practiceExercises.length === 0) return;
    if (practiceCorrectCount < practiceExercises.length) return;
    setUnitProgress((current) => markUnitProgress(current, primaryLearningUnit.id, { theoryViewed: true, practiceCompleted: true }));
  }, [practiceCorrectCount, practiceExercises.length, primaryLearningUnit?.id]);

  useEffect(() => {
    writeStoredSettings({
      verbId,
      subjectId,
      activeLearningUnitId,
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
      showFormExplanations,
      completeFormColumns,
      visitedVerbIds,
      unitProgress,
      skillProgress,
      journeyProgress,
      diagnosticAnswers,
      diagnosticCompleted,
      cefrFilter,
      selectedContextTag,
      productionDraftPromptId,
      productionPromptScope,
      productionModeFilter,
      productionStatusFilter,
      productionResponse,
      productionReview,
      productionStatus,
      productionEditingAttemptId,
      productionAttempts
    });
  }, [activePage, cefrFilter, completeFormColumns, diagnosticAnswers, diagnosticCompleted, group, individualSubjectIds, individualTenseIds, interfaceLanguage, journeyProgress, learnerLanguage, level, productionDraftPromptId, productionEditingAttemptId, productionModeFilter, productionPromptScope, productionReview, productionResponse, productionStatus, productionStatusFilter, selectedContextTag, showAllSubjects, showFormExplanations, showSentenceParts, showTranslations, skillProgress, subjectId, unitProgress, verbId, verbPattern, verbSearch, visitedVerbIds, productionAttempts]);

  useEffect(() => {
    if (activePage !== "production" || !primaryLearningUnit?.id) return;
    const journey = getUnitJourney(journeyProgress, primaryLearningUnit.id);
    if (journey.productionCompleted) return;
    const unitPromptIds = PRODUCTION_PROMPTS.filter((prompt) => (prompt.unitIds || []).includes(primaryLearningUnit.id)).map((prompt) => prompt.id);
    const hasSavedAttempt = unitPromptIds.some((promptId) => (productionAttempts[promptId] || []).length > 0);
    if (!hasSavedAttempt) return;

    setJourneyProgress((current) => updateUnitJourney(current, primaryLearningUnit.id, { productionCompleted: true }));
    setUnitProgress((current) => markUnitProgress(current, primaryLearningUnit.id, { theoryViewed: true, practiceCompleted: true }));
    const currentIndex = orderedLearningUnits.findIndex((unit) => unit.id === primaryLearningUnit.id);
    const nextUnit = orderedLearningUnits[currentIndex + 1];
    if (nextUnit) {
      setActiveLearningUnitId(nextUnit.id);
      setCefrFilter(nextUnit.cefrLevel);
    }
    setActivePage("home");
    setCompletionCelebration({
      unitTitle: primaryLearningUnit.title,
      nextUnitTitle: nextUnit?.title || ""
    });
  }, [activePage, journeyProgress, orderedLearningUnits, primaryLearningUnit?.id, productionAttempts]);

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

  async function handleImportLearningContentJson(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      validateImportFile(file);
      const payload = validateLearningContent(JSON.parse(await file.text()));
      setLearningContentDraft(cloneLearningContent(payload));
      showTimedAlert(t("learningContentDraftLoaded"));
    } catch (error) {
      console.error(error);
      showTimedAlert(t("invalidLearningContentJson"), "error");
    } finally {
      if (learningContentFileInputRef.current) learningContentFileInputRef.current.value = "";
    }
  }

  function handleExportLearningContentJson() {
    try {
      const payload = validateLearningContent(buildLearningContentPayload(learningContentDraft));
      downloadText(`${JSON.stringify(payload, null, 2)}\n`, "smarttense-learning-content.json", "application/json");
      showTimedAlert(t("learningContentExported"));
    } catch (error) {
      console.error(error);
      showTimedAlert(t("learningContentDraftInvalid"), "error");
    }
  }

  function handleApplyLearningContentDraft() {
    if (!window.confirm(t("applyLearningContentConfirm"))) return;

    try {
      const payload = validateLearningContent(buildLearningContentPayload(learningContentDraft));
      setLearningContent(cloneLearningContent(payload));
      setPracticeAnswers({});
      setPracticeResults({});
      showTimedAlert(t("learningContentApplied"));
    } catch (error) {
      console.error(error);
      showTimedAlert(t("learningContentDraftInvalid"), "error");
    }
  }

  function handleDiscardLearningContentDraft() {
    setLearningContentDraft(cloneLearningContent(learningContent));
    showTimedAlert(t("learningContentDraftDiscarded"));
  }

  function handleSaveDataDraft(shouldConfirm = false) {
    if (shouldConfirm && !window.confirm(t("updateDataConfirm"))) return;

    try {
      const payload = validateVerbData(buildVerbPayload(dataDraft));
      applyVerbData(payload);
      setIsBulkEditMode(false);
      setEditingDraftIndex(null);
      setEditingDraftBackup(null);
      showTimedAlert(t("dataSaved"));
    } catch (error) {
      console.error(error);
      showTimedAlert(t("draftInvalid"), "error");
    }
  }

  function handleDiscardDataDraft() {
    setDataDraft(cloneVerbData(appData));
    setNewVerbForm(EMPTY_VERB_FORM);
    setIsBulkEditMode(false);
    setEditingDraftIndex(null);
    setEditingDraftBackup(null);
    showTimedAlert(t("draftDiscarded"));
  }

  function handleRestoreDefaultData() {
    if (!window.confirm(t("restoreDefaultConfirm"))) return;
    applyVerbData(DEFAULT_DATA);
    setNewVerbForm(EMPTY_VERB_FORM);
    setIsBulkEditMode(false);
    setEditingDraftIndex(null);
    setEditingDraftBackup(null);
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
    if (!window.confirm(t("deleteDataConfirm"))) return;

    setDataDraft((current) => {
      if (current.verbs.length <= 1) return current;
      const next = cloneVerbData(current);
      next.verbs.splice(index, 1);
      return next;
    });
    setEditingDraftIndex(null);
    setEditingDraftBackup(null);
  }

  function handleNewVerbField(field, value) {
    setNewVerbForm((current) => ({ ...current, [field]: value }));
  }

  function handleToggleBulkEditMode() {
    setIsBulkEditMode((current) => !current);
    setEditingDraftIndex(null);
    setEditingDraftBackup(null);
  }

  function handleEditSingleVerb(index) {
    setIsBulkEditMode(false);
    setEditingDraftIndex(index);
    setEditingDraftBackup(cloneVerbData(dataDraft.verbs[index]));
  }

  function handleCancelSingleEdit(index) {
    if (editingDraftBackup) {
      setDataDraft((current) => {
        const next = cloneVerbData(current);
        next.verbs[index] = cloneVerbData(editingDraftBackup);
        return next;
      });
    }
    setEditingDraftIndex(null);
    setEditingDraftBackup(null);
  }

  function handleDataTableSort(field) {
    setDataTableSort((current) => ({
      field,
      direction: current.field === field && current.direction === "asc" ? "desc" : "asc"
    }));
    setDataTablePage(1);
  }

  function handleBulkEditSearch(value) {
    setBulkEditSearch(value);
    setDataTablePage(1);
  }

  function handleDataTablePageSize(value) {
    setDataTablePageSize(Number(value));
    setDataTablePage(1);
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
    setUnitProgress({});
    setSkillProgress({});
    setJourneyProgress({});
    setDiagnosticCompleted(false);
    showTimedAlert(t("progressReset"));
  }

  function handleExportProgress() {
    const payload = buildProgressBackup({ activeLearningUnitId, visitedVerbIds, unitProgress, skillProgress, journeyProgress, diagnosticAnswers, diagnosticCompleted, productionAttempts });
    downloadText(`${JSON.stringify(payload, null, 2)}\n`, "smarttense-progress.json", "application/json");
    showTimedAlert(t("progressExported"));
  }

  async function handleImportProgress(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      validateImportFile(file);
      const payload = validateProgressBackup(JSON.parse(await file.text()));
      if (!window.confirm(t("importProgressConfirm"))) return;
      const progress = payload.progress;
      setActiveLearningUnitId(progress.activeLearningUnitId || "");
      setVisitedVerbIds(progress.visitedVerbIds);
      setUnitProgress(progress.unitProgress);
      setSkillProgress(progress.skillProgress);
      setJourneyProgress(progress.journeyProgress);
      setDiagnosticAnswers(progress.diagnosticAnswers);
      setDiagnosticCompleted(progress.diagnosticCompleted);
      setProductionAttempts(progress.productionAttempts);
      setPracticeAnswers({});
      setPracticeResults({});
      showTimedAlert(t("progressImported"));
    } catch (error) {
      console.error(error);
      showTimedAlert(t("invalidProgressBackup"), "error");
    } finally {
      if (progressFileInputRef.current) progressFileInputRef.current.value = "";
    }
  }

  function handleResetCurrentUnitProgress() {
    if (!primaryLearningUnit?.id || !window.confirm(t("resetUnitProgressConfirm"))) return;

    setUnitProgress((current) => resetUnitProgress(current, primaryLearningUnit.id));
    setSkillProgress((current) => resetUnitSkillProgress(current, primaryLearningUnit.id));
    setJourneyProgress((current) => resetUnitJourney(current, primaryLearningUnit.id));
    setPracticeAnswers({});
    setPracticeResults({});
    showTimedAlert(t("unitProgressReset"));
  }

  function handleToggleDiagnosticAnswer(checkId) {
    setDiagnosticAnswers((current) => toggleDiagnosticAnswer(current, checkId));
  }

  function handleApplyDiagnosticRecommendation() {
    if (!diagnosticRecommendedUnit?.id) return;

    setCefrFilter(diagnosticRecommendedUnit.cefrLevel || "all");
    setActiveLearningUnitId(diagnosticRecommendedUnit.id);
    setActivePage("lesson");
    showTimedAlert(t("diagnosticRecommendationApplied"));
  }

  function handleResetDiagnostic() {
    if (!window.confirm(t("resetDiagnosticConfirm"))) return;

    setDiagnosticAnswers({});
    setDiagnosticCompleted(false);
    showTimedAlert(t("diagnosticReset"));
  }

  function handleCefrFilterChange(nextFilter) {
    setCefrFilter(nextFilter);
    if (nextFilter === "all") {
      const nextUnit = diagnosticRecommendedUnit || getRecommendedLearningUnit(orderedLearningUnits, unitProgress) || orderedLearningUnits[0];
      if (nextUnit?.id) setActiveLearningUnitId(nextUnit.id);
      return;
    }

    const nextUnit = getRecommendedLearningUnitForLevel(orderedLearningUnits, unitProgress, nextFilter);
    if (nextUnit?.id) setActiveLearningUnitId(nextUnit.id);
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

  function buildProductionAttempt(promptId, response, reviewText, status) {
    return {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      promptId,
      response,
      review: reviewText,
      status,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }

  function handleProductionPromptChange(promptId) {
    setProductionDraftPromptId(promptId);
    setProductionEditingAttemptId(null);
    setProductionResponse("");
    setProductionReview("");
    setProductionStatus("draft");
  }

  function handleSaveProductionAttempt() {
    if (!currentProductionPrompt) return;
    if (!productionResponse.trim()) {
      showTimedAlert(t("productionAttemptInvalid"), "error");
      return;
    }

    if (productionEditingAttemptId) {
      if (!window.confirm(t("productionUpdateAttemptConfirm"))) return;
      setProductionAttempts((current) => {
        const next = cloneProductionAttempts(current);
        next[productionDraftPromptId] = (next[productionDraftPromptId] || []).map((attempt) => {
          if (attempt.id !== productionEditingAttemptId) return attempt;
          return {
            ...attempt,
            response: productionResponse.trim(),
            review: productionReview.trim(),
            status: productionStatus,
            updatedAt: new Date().toISOString()
          };
        });
        return next;
      });
      showTimedAlert(t("productionAttemptUpdated"));
    } else {
      if (!window.confirm(t("productionSaveAttemptConfirm"))) return;
      setProductionAttempts((current) => {
        const next = cloneProductionAttempts(current);
        const newAttempt = buildProductionAttempt(
          currentProductionPrompt.id,
          productionResponse.trim(),
          productionReview.trim(),
          productionStatus
        );
        next[currentProductionPrompt.id] = [newAttempt, ...(next[currentProductionPrompt.id] || [])];
        return next;
      });
      showTimedAlert(t("productionAttemptSaved"));
    }

    setProductionEditingAttemptId(null);
    setProductionResponse("");
    setProductionReview("");
    setProductionStatus("draft");
  }

  function handleEditProductionAttempt(promptId, attempt) {
    setProductionPromptScope("all");
    setProductionDraftPromptId(promptId);
    setProductionEditingAttemptId(attempt.id);
    setProductionResponse(attempt.response || "");
    setProductionReview(attempt.review || "");
    setProductionStatus(attempt.status || "draft");
  }

  function handleCancelProductionEdit() {
    setProductionEditingAttemptId(null);
    setProductionResponse("");
    setProductionReview("");
    setProductionStatus("draft");
    showTimedAlert(t("productionEditCanceled"));
  }

  function handleDeleteProductionAttempt(promptId, attemptId) {
    if (!window.confirm(t("productionDeleteAttemptConfirm"))) return;

    setProductionAttempts((current) => {
      const next = cloneProductionAttempts(current);
      const promptAttempts = (next[promptId] || []).filter((attempt) => attempt.id !== attemptId);
      if (promptAttempts.length === 0) {
        delete next[promptId];
      } else {
        next[promptId] = promptAttempts;
      }
      return next;
    });

    if (productionEditingAttemptId === attemptId) {
      setProductionEditingAttemptId(null);
      setProductionResponse("");
      setProductionReview("");
      setProductionStatus("draft");
    }

    showTimedAlert(t("productionAttemptDeleted"));
  }

  function handleUpdateProductionAttemptStatus(promptId, attemptId, nextStatus) {
    if (!window.confirm(t("productionStatusUpdateConfirm"))) return;

    setProductionAttempts((current) => {
      const next = cloneProductionAttempts(current);
      next[promptId] = (next[promptId] || []).map((attempt) => (
        attempt.id !== attemptId ? attempt : { ...attempt, status: nextStatus, updatedAt: new Date().toISOString() }
      ));
      return next;
    });

    showTimedAlert(t("productionStatusUpdated"));
  }

  function cloneProductionAttempts(value) {
    return JSON.parse(JSON.stringify(value || {}));
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
    const unitTitle = primaryLearningUnit?.title || "";
    const skillSummary = getSkillMasterySummary(skillProgress);
    const activeJourneySummary = getJourneySummary(primaryLearningUnit);
    const activeGuidedSteps = buildGuidedLessonSteps(primaryLearningUnit);
    const activeResumeIndex = Math.min(activeJourneySummary.journey.guidedStepIndex || 0, Math.max(0, activeGuidedSteps.length - 1));
    const guidedStepKey = {
      objective: "guidedStepObjective",
      theory: "guidedStepTheory",
      examples: "guidedStepExamples",
      practice: "guidedStepPractice",
      correction: "guidedStepCorrection",
      pronunciation: "guidedStepPronunciation",
      production: "guidedStepProduction",
      summary: "guidedStepSummary"
    }[activeGuidedSteps[activeResumeIndex]?.type] || "guidedStepActivity";
    const activeResumeStep = activeGuidedSteps.length ? `${t("journeyStep")} ${activeResumeIndex + 1} ${t("of")} ${activeGuidedSteps.length} - ${t(guidedStepKey)}` : "";
    const resumePage = !activeJourneySummary.journey.guidedCompleted
      ? "lesson"
      : !activeJourneySummary.journey.practiceCompleted
        ? "practice"
        : "production";
    const levelProgressRows = ["A1", "A2", "B1", "B2"].map((courseLevel) => {
      const levelUnits = orderedLearningUnits.filter((unit) => unit.cefrLevel === courseLevel);
      const completed = levelUnits.filter((unit) => getJourneySummary(unit).status === "completed").length;
      return { level: courseLevel, total: levelUnits.length, completed, percent: levelUnits.length ? Math.round((completed / levelUnits.length) * 100) : 0, active: courseLevel === primaryLearningUnit?.cefrLevel };
    });
    const activeLevelUnits = orderedLearningUnits.filter((unit) => unit.cefrLevel === primaryLearningUnit?.cefrLevel);
    const activeUnitPosition = Math.max(1, activeLevelUnits.findIndex((unit) => unit.id === primaryLearningUnit?.id) + 1);
    const unitLearningPercent = activeJourneySummary.percent;
    const homePrimaryActions = [
      { page: "theory", label: t("openTheory") },
      { page: "practice", label: t("openPractice") },
      { page: "production", label: t("production") }
    ];
    const homeSecondaryActions = [
      { page: "individual", label: t("practiceIndividual") },
      { page: "complete", label: t("viewComplete") }
    ];
    const goToHomePage = (page) => setActivePage(page);
    const isHomeCardOpen = (defaultOpen) => !isHomeNarrow || defaultOpen;

    return (
      <section className={`home-board ${diagnosticCompleted ? "diagnostic-complete" : "diagnostic-pending"}`} aria-label={t("home")}>
        <MobileHomeFocus
          unit={primaryLearningUnit}
          unitPosition={activeUnitPosition}
          unitCount={activeLevelUnits.length}
          unitStatus={activeJourneySummary.status}
          unitPercent={unitLearningPercent}
          resumeStep={activeResumeStep}
          skillSummary={skillSummary}
          levelProgress={levelProgressRows}
          t={t}
          onContinue={() => setActivePage(resumePage)}
          onReview={() => setActivePage("review")}
          onCourse={() => setActivePage("course")}
        />
        {!diagnosticCompleted && (
          <OnboardingDiagnostic
            checks={DIAGNOSTIC_CHECKS}
            answers={diagnosticAnswers}
            result={diagnosticResult}
            t={t}
            onToggle={handleToggleDiagnosticAnswer}
            onApply={() => { setDiagnosticCompleted(true); handleApplyDiagnosticRecommendation(); }}
            onStartA1={() => {
              const firstA1Unit = orderedLearningUnits.find((unit) => unit.cefrLevel === "A1");
              setCefrFilter("A1");
              if (firstA1Unit) setActiveLearningUnitId(firstA1Unit.id);
              setDiagnosticCompleted(true);
              setActivePage("lesson");
            }}
          />
        )}
        <div className="home-hero-grid">
          <article className="home-primary-card">
            <div>
              <p className="eyebrow">{t("workspace")}</p>
              <h3>{t("learningUnit")}</h3>
              <div className="cefr-filter" aria-label={t("levelFilter")}>
                {CEFR_FILTERS.map((filter) => (
                  <button
                    type="button"
                    key={filter}
                    className={cefrFilter === filter ? "active" : ""}
                    aria-pressed={cefrFilter === filter}
                    onClick={() => handleCefrFilterChange(filter)}
                  >
                    {filter === "all" ? t("allLevels") : filter}
                  </button>
                ))}
              </div>
              <SelectField
                label={t("activeLearningUnit")}
                value={primaryLearningUnit?.id || ""}
                onChange={setActiveLearningUnitId}
                variant="light"
              >
                {visibleLearningUnits.map((unit) => (
                  <option key={unit.id} value={unit.id}>
                    {unit.cefrLevel} - {unit.title}
                  </option>
                ))}
              </SelectField>
              <button type="button" className="home-mobile-continue" onClick={() => setActivePage(resumePage)}>
                {t("continueLearning")}
              </button>
              <div className="home-verb-summary">
                <h2>{currentVerb.label}</h2>
                <p>{verbSummary.meaning || t("noLearnerMeaning")} | {verbSummary.object || currentVerb.object || "core form"}</p>
              </div>
            </div>
            <div className="home-action-cluster" aria-label={t("homeActions")}>
              <div className="dashboard-actions compact-home-actions">
                {homePrimaryActions.map((action) => (
                  <button type="button" key={action.page} onClick={() => goToHomePage(action.page)}>
                    {action.label}
                  </button>
                ))}
              </div>
              <details className="home-extra-actions" open={!isHomeNarrow}>
                <summary>{t("homeMoreActions")}</summary>
                <div className="dashboard-actions compact-home-actions">
                  {homeSecondaryActions.map((action) => (
                    <button type="button" key={action.page} onClick={() => goToHomePage(action.page)}>
                      {action.label}
                    </button>
                  ))}
                </div>
              </details>
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
          <article className="home-stat-card"><span>{patternVerbs.length}</span><small>{t("verbs")}</small></article>
        </section>

        <section className="home-content-grid">
          <article className="home-info-card home-profile-card">
            <details className="home-content-section" open={isHomeCardOpen(true)}>
              <summary className="home-card-heading">
                <p className="eyebrow">{t("profileSnapshot")}</p>
                <h3>{currentVerb.label}</h3>
              </summary>
              <dl className="home-content-body home-compact-list">
                <div><dt>{t("learnerMeaning")}</dt><dd>{verbSummary.meaning || t("noLearnerMeaning")}</dd></div>
                <div><dt>{t("baseExample")}</dt><dd>{verbSummary.object || currentVerb.object || "core form"}</dd></div>
                <div><dt>{t("verbType")}</dt><dd>{verbTypeLabel(verbSummary.type, t)}</dd></div>
                <div><dt>{t("verbPattern")}</dt><dd>{verbPatternLabel(verbSummary.pattern, t)}</dd></div>
                <div><dt>{t("keyForms")}</dt><dd>{verbSummary.base} / {verbSummary.past} / {verbSummary.participle} / {verbSummary.gerund}</dd></div>
              </dl>
            </details>
          </article>

          <article className="home-info-card home-recommend-card">
            <details className="home-content-section" open={isHomeCardOpen(false)}>
              <summary className="home-card-heading">
                <p className="eyebrow">{t("recommendedNow")}</p>
                <h3>{unitTitle || nextLearningStep.title || recommendedVerb?.label || currentVerb.label}</h3>
              </summary>
              <div className="home-content-body">
                <dl className="home-compact-list">
                  <div><dt>{t("unitStatus")}</dt><dd>{t(primaryUnitProgress.status)}</dd></div>
                  <div><dt>{t("nextStep")}</dt><dd>{t(nextLearningStep.labelKey)}</dd></div>
                  <div><dt>{t("courseLevel")}</dt><dd>{primaryLearningUnit?.cefrLevel || t("allLevels")}</dd></div>
                  <div><dt>{t("suggestedTense")}</dt><dd>{TENSES.find((tense) => tense.id === "simplePresent")?.[interfaceLanguage]}</dd></div>
                  <div><dt>{t("learnerMeaning")}</dt><dd>{recommendedSummary.meaning || t("noLearnerMeaning")}</dd></div>
                  <div><dt>Skill focus</dt><dd>{skillSummary.priority?.label || "Complete a practice answer"}</dd></div>
                  <div><dt>Skill mastery</dt><dd>{skillSummary.averageMastery}% across {skillSummary.practicedCount} skills</dd></div>
                </dl>
                <button
                  type="button"
                  className="home-recommend-button"
                  onClick={() => {
                    if (recommendedVerb?.id) setVerbId(recommendedVerb.id);
                    setActivePage(nextLearningStep.page);
                  }}
                >
                  {t(nextLearningStep.labelKey)}
                </button>
                <button type="button" className="home-recommend-button" onClick={() => setActivePage("review")}>
                  {t("startAdaptiveReview")}
                </button>
              </div>
            </details>
          </article>

          <article className="home-info-card home-diagnostic-card">
            <details className="home-content-section" open={isHomeCardOpen(false)}>
              <summary className="home-card-heading">
                <p className="eyebrow">{t("diagnostic")}</p>
                <h3>{diagnosticResult?.cefrLevel || t("diagnosticNotTaken")}</h3>
              </summary>
              <div className="home-content-body">
                <p>{t("diagnosticIntro")}</p>
                <div className="diagnostic-check-list">
                  {DIAGNOSTIC_CHECKS.map((check) => (
                      <label className="check-row check-row-light diagnostic-check-row" key={check.id}>
                        <input
                          type="checkbox"
                          checked={Boolean(diagnosticAnswers[check.id])}
                          onChange={() => handleToggleDiagnosticAnswer(check.id)}
                        />
                      <span><strong>{t(check.labelKey)}</strong>{t(check.descriptionKey)}</span>
                    </label>
                  ))}
                </div>
                <dl className="home-compact-list">
                  <div><dt>{t("diagnosticSuggestedLevel")}</dt><dd>{diagnosticResult?.cefrLevel || t("notStarted")}</dd></div>
                  <div><dt>{t("recommendedUnit")}</dt><dd>{diagnosticRecommendedUnit?.title || t("noLearningContent")}</dd></div>
                </dl>
                <div className="diagnostic-actions">
                  <button type="button" onClick={handleApplyDiagnosticRecommendation} disabled={!diagnosticRecommendedUnit}>
                    {t("useDiagnosticRecommendation")}
                  </button>
                  <button type="button" className="secondary-button" onClick={handleResetDiagnostic} disabled={!diagnosticResult}>
                    {t("resetDiagnostic")}
                  </button>
                </div>
              </div>
            </details>
          </article>
        </section>
      </section>
    );
  }

  function getJourneySummary(unit) {
    if (!unit?.id) return { journey: {}, totals: { guidedSteps: 0, practiceExercises: 0 }, percent: 0, status: "notStarted" };
    const journey = getUnitJourney(journeyProgress, unit.id);
    const totals = {
      guidedSteps: buildGuidedLessonSteps(unit).length,
      practiceExercises: getPracticeExercises(unit).length
    };
    const legacyCompleted = getUnitProgress(unit.id, unitProgress).status === "completed" && !journey.updatedAt;
    const status = getJourneyStatus(journey, totals, legacyCompleted);
    return { journey, totals, status, percent: status === "completed" ? 100 : getJourneyPercent(journey, totals) };
  }

  function renderFilterPanel() {
    const isIndividualPage = activePage === "individual";
    const isCompletePage = activePage === "complete";
    return (
      <section className="workspace-filters" aria-label={t("filters")}>
        <div className="filter-primary-grid">
          <VerbCombobox
            label={t("verb")}
            verbs={filteredVerbs}
            selectedVerb={currentVerb}
            query={verbSearch}
            learnerLanguage={learnerLanguage}
            placeholder={t("verbSearchPlaceholder")}
            t={t}
            onQueryChange={setVerbSearch}
            onSelect={(nextVerbId) => {
              setVerbId(nextVerbId);
              setVerbSearch("");
            }}
          />
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
            {isCompletePage && <label className="check-row check-row-light"><input type="checkbox" checked={showFormExplanations} onChange={(event) => setShowFormExplanations(event.target.checked)} /><span>{t("showWhyThisForm")}</span></label>}
            <div className="filter-table-actions" aria-label={t("tableActions")}>{!isIndividualPage && <button type="button" className="compact-action" onClick={handleExportCsv} aria-label={t("exportCsv")}>CSV</button>}{!isIndividualPage && <button type="button" className="compact-action" onClick={handleExportJson} aria-label={t("exportJson")}>JSON</button>}</div>
          </div>
        </details>
      </section>
    );
  }

  function renderSettingsView() {
    const dataSummary = getDataSummary(dataDraft);
    const learningContentSummary = getLearningContentSummary(learningContentDraft);
    const previewUnit = learningContentDraft.units?.[0];
    const previewContexts = learningContentDraft.contexts?.slice(0, 4) || [];
    const filteredDraftVerbs = sortDraftEntries(
      dataDraft.verbs
        .map((verb, index) => ({ verb, index }))
        .filter(({ verb }) => matchesVerbSearch(verb, bulkEditSearch)),
      dataTableSort
    );
    const totalDataTablePages = Math.max(1, Math.ceil(filteredDraftVerbs.length / dataTablePageSize));
    const currentDataTablePage = Math.min(dataTablePage, totalDataTablePages);
    const dataTableStart = (currentDataTablePage - 1) * dataTablePageSize;
    const visibleDraftVerbs = filteredDraftVerbs.slice(dataTableStart, dataTableStart + dataTablePageSize);
    const hasEditableRows = isBulkEditMode || editingDraftIndex !== null;

    return (
      <section className="settings-page" aria-label={t("settings")}>
        <div className="settings-header">
          <div>
            <p className="eyebrow">{t("settings")}</p>
            <h2>{t("settingsTitle")}</h2>
            <p>{t("settingsIntro")}</p>
          </div>
          <div className="settings-actions">
            <button type="button" onClick={() => handleSaveDataDraft(true)}>{t("saveDataChanges")}</button>
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
            <div className="unit-progress-box">
              <p className="eyebrow">{t("progressBackup")}</p>
              <p className="settings-note">{t("progressBackupHelp")}</p>
              <div className="settings-actions settings-actions-wrap">
                <label className="import-button import-button-light">
                  <input ref={progressFileInputRef} type="file" accept="application/json,.json" onChange={handleImportProgress} />
                  {t("importProgress")}
                </label>
                <button type="button" onClick={handleExportProgress}>{t("exportProgress")}</button>
              </div>
            </div>
            <div className="unit-progress-box">
              <p className="eyebrow">{t("learningPath")}</p>
              <dl className="data-summary-grid">
                <div><dt>{t("unitStatus")}</dt><dd>{t(primaryUnitProgress.status)}</dd></div>
                <div><dt>{t("theory")}</dt><dd>{primaryUnitProgress.theoryViewed ? t("completed") : t("notStarted")}</dd></div>
                <div><dt>{t("practice")}</dt><dd>{primaryUnitProgress.practiceCompleted ? t("completed") : t("notStarted")}</dd></div>
                <div><dt>{t("nextStep")}</dt><dd>{t(nextLearningStep.labelKey)}</dd></div>
              </dl>
              <button type="button" className="reset-progress-button" onClick={handleResetCurrentUnitProgress}>{t("resetUnitProgress")}</button>
            </div>
            <div className="unit-progress-box">
              <p className="eyebrow">{t("diagnostic")}</p>
              <dl className="data-summary-grid">
                <div><dt>{t("diagnosticSuggestedLevel")}</dt><dd>{diagnosticResult?.cefrLevel || t("notStarted")}</dd></div>
                <div><dt>{t("recommendedUnit")}</dt><dd>{diagnosticRecommendedUnit?.title || t("noLearningContent")}</dd></div>
                <div><dt>{t("diagnosticAnswered")}</dt><dd>{diagnosticResult ? `${diagnosticResult.completedCount}/${diagnosticResult.totalCount}` : "0/4"}</dd></div>
                <div><dt>{t("storage")}</dt><dd>{t("localBrowser")}</dd></div>
              </dl>
              <button type="button" className="reset-progress-button" onClick={handleResetDiagnostic} disabled={!diagnosticResult}>{t("resetDiagnostic")}</button>
            </div>
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

          <article className="settings-card content-manager-card">
            <p className="eyebrow">{t("learningContentManager")}</p>
            <dl className="data-summary-grid">
              <div><dt>{t("units")}</dt><dd>{learningContentSummary.units}</dd></div>
              <div><dt>{t("contexts")}</dt><dd>{learningContentSummary.contexts}</dd></div>
              <div><dt>{t("vocabulary")}</dt><dd>{learningContentSummary.vocabulary}</dd></div>
              <div><dt>{t("practice")}</dt><dd>{learningContentSummary.exercises}</dd></div>
            </dl>
            <div className="content-preview-box">
              <p className="eyebrow">{t("contentPreview")}</p>
              <strong>{previewUnit?.title || t("noLearningContent")}</strong>
              <span>{previewUnit?.focus || t("learningContentPreviewEmpty")}</span>
              {previewContexts.length > 0 && (
                <div className="theory-pill-row">
                  {previewContexts.map((context) => <span className="pattern-pill" key={context.id}>{context.title}</span>)}
                </div>
              )}
            </div>
            <div className="settings-actions settings-actions-wrap">
              <label className="import-button import-button-light">
                <input ref={learningContentFileInputRef} type="file" accept="application/json,.json" onChange={handleImportLearningContentJson} />
                {t("importLearningContent")}
              </label>
              <button type="button" onClick={handleExportLearningContentJson}>{t("exportLearningContent")}</button>
              <button type="button" onClick={handleApplyLearningContentDraft}>{t("applyLearningContent")}</button>
              <button type="button" onClick={handleDiscardLearningContentDraft}>{t("discardContentDraft")}</button>
            </div>
            <p className="settings-note">{t("learningContentManagerNote")}</p>
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
          <div className="settings-section-heading bulk-edit-heading">
            <div>
              <p className="eyebrow">{t("dataTable")}</p>
              <h3>{t("dataTableTitle")}</h3>
            </div>
            <div className="bulk-edit-controls">
              <TextField label={t("searchDraft")}
                value={bulkEditSearch}
                onChange={handleBulkEditSearch}
                placeholder={t("verbSearchPlaceholder")}
              />
              <div className="settings-actions settings-actions-wrap">
                <button type="button" onClick={handleToggleBulkEditMode} className={isBulkEditMode ? "active" : ""} aria-pressed={isBulkEditMode}>{isBulkEditMode ? t("exitBulkEdit") : t("bulkEdit")}</button>
                {hasEditableRows && <button type="button" onClick={() => handleSaveDataDraft(true)}>{t("updateChanges")}</button>}
              </div>
            </div>
          </div>
          <div className="bulk-edit-wrap">
            <table className={`bulk-edit-table ${hasEditableRows ? "is-editable" : "is-readonly"}`}>
              <thead>
                <tr>
                  <th>
                    <button type="button" className={`table-sort-button ${dataTableSort.field === "index" ? "active" : ""}`} onClick={() => handleDataTableSort("index")} aria-label={`${t("sortBy")} ${t("indexColumn")}`}>
                      {t("indexColumn")} {dataTableSort.field === "index" ? (dataTableSort.direction === "asc" ? "ASC" : "DESC") : ""}
                    </button>
                  </th>
                  {DATA_MANAGER_FIELDS.map((field) => (
                    <th key={field}>
                      <button type="button" className={`table-sort-button ${dataTableSort.field === field ? "active" : ""}`} onClick={() => handleDataTableSort(field)} aria-label={`${t("sortBy")} ${dataFieldLabel(field, t)}`}>
                        {dataFieldLabel(field, t)} {dataTableSort.field === field ? (dataTableSort.direction === "asc" ? "ASC" : "DESC") : ""}
                      </button>
                    </th>
                  ))}
                  <th>
                    <button type="button" className={`table-sort-button ${dataTableSort.field === "pattern" ? "active" : ""}`} onClick={() => handleDataTableSort("pattern")} aria-label={`${t("sortBy")} ${t("pattern")}`}>
                      {t("pattern")} {dataTableSort.field === "pattern" ? (dataTableSort.direction === "asc" ? "ASC" : "DESC") : ""}
                    </button>
                  </th>
                  <th>{t("actions")}</th>
                </tr>
              </thead>
              <tbody>
                {visibleDraftVerbs.map(({ verb, index }, displayIndex) => {
                  const isRowEditable = isBulkEditMode || editingDraftIndex === index;
                  return (
                    <tr key={`${verb.id}-${index}`} className={isRowEditable ? "editing-row" : ""}>
                      <td className="index-cell">{dataTableStart + displayIndex + 1}</td>
                      {DATA_MANAGER_FIELDS.map((field) => (
                        <td key={field}>
                          {isRowEditable ? (
                            field === "type" ? (
                              <select value={verb.type || ""} onChange={(event) => handleBulkVerbChange(index, field, event.target.value)}>
                                <option value="">{t("regularOrIrregular")}</option>
                                <option value="be">{t("beVerb")}</option>
                                <option value="modal">{t("modalVerb")}</option>
                              </select>
                            ) : (
                              <input value={verb[field] || ""} onChange={(event) => handleBulkVerbChange(index, field, event.target.value)} />
                            )
                          ) : (
                            <span className="table-read-value">{field === "type" ? verbTypeLabel(verb.type, t) : verb[field] || "-"}</span>
                          )}
                        </td>
                      ))}
                      <td><span className="pattern-pill">{verbPatternLabel(getVerbSummary(verb).pattern, t)}</span></td>
                      <td>
                        <div className="row-action-group">
                          {isRowEditable ? (
                            <>
                              <button type="button" className="compact-action" onClick={() => handleSaveDataDraft(true)}>{t("updateRecord")}</button>
                              {!isBulkEditMode && <button type="button" className="compact-action" onClick={() => handleCancelSingleEdit(index)}>{t("cancelEdit")}</button>}
                            </>
                          ) : (
                            <button type="button" className="compact-action" onClick={() => handleEditSingleVerb(index)}>{t("editRecord")}</button>
                          )}
                          <button type="button" className="compact-action danger-action" onClick={() => handleDeleteDraftVerb(index)}>{t("deleteVerb")}</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="data-table-pagination" aria-label={t("pagination")}>
            <span>{t("showingRows")} {filteredDraftVerbs.length === 0 ? 0 : dataTableStart + 1}-{Math.min(dataTableStart + visibleDraftVerbs.length, filteredDraftVerbs.length)} {t("of")} {filteredDraftVerbs.length}</span>
            <SelectField label={t("rowsPerPage")} value={String(dataTablePageSize)} onChange={handleDataTablePageSize} variant="light">
              {DATA_TABLE_PAGE_SIZES.map((size) => <option key={size} value={size}>{size}</option>)}
            </SelectField>
            <div className="pagination-buttons">
              <button type="button" className="compact-action" onClick={() => setDataTablePage((page) => Math.max(1, page - 1))} disabled={currentDataTablePage <= 1}>{t("previousPage")}</button>
              <span>{currentDataTablePage} / {totalDataTablePages}</span>
              <button type="button" className="compact-action" onClick={() => setDataTablePage((page) => Math.min(totalDataTablePages, page + 1))} disabled={currentDataTablePage >= totalDataTablePages}>{t("nextPage")}</button>
            </div>
          </div>
          {filteredDraftVerbs.length === 0 && <p className="empty-filter-message">{t("noVerbMatchesHelp")}</p>}
        </section>
      </section>
    );
  }

  function renderProductionView() {
    const modeFilterOptions = PRODUCTION_MODES.map((mode) => (
      <option key={mode} value={mode}>
        {mode === "all" ? t("allModes") : t(mode)}
      </option>
    ));

    const statusFilterOptions = ["all", ...PRODUCTION_STATUSES].map((status) => (
      <option key={status} value={status}>
        {status === "all" ? t("allStatuses") : t(status)}
      </option>
    ));
    const promptScopeOptions = PRODUCTION_PROMPT_SCOPES.map((scope) => (
      <option key={scope} value={scope}>
        {t(scope === "suggested" ? "suggestedPrompts" : "allPrompts")}
      </option>
    ));

    return (
      <section className="settings-page" aria-label={t("production")}>
        <div className="settings-header">
          <div>
            <p className="eyebrow">{t("production")}</p>
            <h2>{t("productionWorkspace")}</h2>
            <p>{t("productionIntro")}</p>
          </div>
          <div className="settings-actions">
            <p className="settings-note">{t("productionDrafts")}: {filteredProductionRows.length}</p>
          </div>
        </div>

        <section className="settings-grid">
          <article className="settings-card">
            <p className="eyebrow">{t("productionComposer")}</p>
            <h3>{t("createNewAttempt")}</h3>
            <div className="unit-progress-box">
              <p className="eyebrow">{t("productionGuidance")}</p>
              <dl className="data-summary-grid">
                <div><dt>{t("activeLearningUnit")}</dt><dd>{primaryLearningUnit?.title || t("noLearningContent")}</dd></div>
                <div><dt>{t("diagnosticSuggestedLevel")}</dt><dd>{primaryLearningUnit?.cefrLevel || t("notStarted")}</dd></div>
                <div><dt>{t("suggestedPrompts")}</dt><dd>{suggestedProductionPrompts.length}</dd></div>
                <div><dt>{t("allPrompts")}</dt><dd>{productionPrompts.length}</dd></div>
              </dl>
            </div>

            {currentProductionPrompt ? (
              <div className="production-composer">
                <SelectField
                  label={t("promptScope")}
                  value={productionPromptScope}
                  onChange={setProductionPromptScope}
                  variant="light"
                >
                  {promptScopeOptions}
                </SelectField>
                <SelectField
                  label={t("productionPrompt")}
                  value={currentProductionPrompt.id}
                  onChange={handleProductionPromptChange}
                  variant="light"
                >
                  {composerProductionPrompts.map((prompt) => (
                    <option key={prompt.id} value={prompt.id}>
                      {prompt.title}
                    </option>
                  ))}
                </SelectField>

                <div className="production-prompt-meta">
                  <span>{t("mode")}: {t(currentProductionPrompt.mode)}</span>
                  <span>{t("tenseCol")}: {tenseLabel(currentProductionPrompt.tenseId, interfaceLanguage)}</span>
                  <span>{t("diagnosticSuggestedLevel")}: {currentProductionPrompt.cefrLevel}</span>
                  <span>{t("durationMinutes")}: {currentProductionPrompt.suggestedTimeMinutes || 1}</span>
                </div>
                <p className="settings-note">
                  {t("promptScopeNote")}: {(currentProductionPrompt.unitIds || []).join(", ") || t("allPrompts")}
                </p>

                <p className="production-prompt-text">{currentProductionPrompt.prompt}</p>

                {currentProductionPrompt.rubric.length > 0 && (
                  <div className="production-rubric">
                    <p>{t("productionRubric")}</p>
                    <ul>
                      {currentProductionPrompt.rubric.map((criterion) => <li key={criterion}>{criterion}</li>)}
                    </ul>
                  </div>
                )}

                <label className="field field-light">
                  <span>{t("productionStatus")}</span>
                  <select value={productionStatus} onChange={(event) => setProductionStatus(event.target.value)}>
                    {PRODUCTION_STATUSES.map((status) => <option key={status} value={status}>{t(status)}</option>)}
                  </select>
                </label>

                <label className="field field-light">
                  <span>{t("productionResponseLabel")}</span>
                  <textarea value={productionResponse} onChange={(event) => setProductionResponse(event.target.value)} rows={6} />
                </label>

                <label className="field field-light">
                  <span>{t("productionReview")}</span>
                  <textarea value={productionReview} onChange={(event) => setProductionReview(event.target.value)} rows={4} />
                </label>

                <div className="settings-actions settings-actions-wrap">
                  <button
                    type="button"
                    onClick={handleSaveProductionAttempt}
                  >
                    {productionEditingAttemptId ? t("productionUpdateAttempt") : t("productionSaveAttempt")}
                  </button>
                  {productionEditingAttemptId && (
                    <button type="button" onClick={handleCancelProductionEdit}>
                      {t("productionCancel")}
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <p className="empty-filter-message">{t("productionPromptsEmpty")}</p>
            )}
          </article>

          <article className="settings-card">
            <p className="eyebrow">{t("productionQueue")}</p>
            <h3>{t("productionAttempts")}</h3>

            <div className="settings-control-grid">
              <SelectField label={t("productionModeFilter")} value={productionModeFilter} onChange={setProductionModeFilter} variant="light">{modeFilterOptions}</SelectField>
              <SelectField label={t("productionStatusFilter")} value={productionStatusFilter} onChange={setProductionStatusFilter} variant="light">{statusFilterOptions}</SelectField>
            </div>

            {filteredProductionRows.length === 0 ? (
              <p className="empty-filter-message">{t("productionQueueEmpty")}</p>
            ) : (
              <div className="production-attempt-list">
                {filteredProductionRows.map((attempt) => (
                  <article className="production-attempt" key={`${attempt.promptId}-${attempt.id}`}>
                    <div className="production-attempt-header">
                      <div>
                        <h4>{attempt.promptTitle}</h4>
                        <p className="eyebrow">{t(attempt.promptMode)} · {tenseLabel(attempt.promptTenseId, interfaceLanguage)} · {t("status")} {t(attempt.status)}</p>
                      </div>
                      <label className="production-attempt-status">
                        <span>{t("status")}</span>
                        <select
                          value={attempt.status}
                          onChange={(event) => handleUpdateProductionAttemptStatus(attempt.promptId, attempt.id, event.target.value)}
                        >
                          {PRODUCTION_STATUSES.map((status) => <option key={status} value={status}>{t(status)}</option>)}
                        </select>
                      </label>
                    </div>
                    <p className="production-attempt-response">{attempt.response}</p>
                    {attempt.review && <p className="production-review-note"><strong>{t("productionReview")}:</strong> {attempt.review}</p>}
                    <p className="production-attempt-time">{new Date(attempt.updatedAt).toLocaleString()}</p>
                    <div className="row-action-group">
                      <button
                        type="button"
                        className="compact-action"
                        onClick={() => handleEditProductionAttempt(attempt.promptId, attempt)}
                      >
                        {t("editRecord")}
                      </button>
                      <button
                        type="button"
                        className="compact-action danger-action"
                        onClick={() => handleDeleteProductionAttempt(attempt.promptId, attempt.id)}
                      >
                        {t("deleteDataConfirm")}
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </article>
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
                <ConjugationRows rows={rows} language={interfaceLanguage} showTranslations={showTranslations} showSentenceParts={showSentenceParts} showFormExplanations={showFormExplanations} visibleColumns={completeFormColumns} t={t} />
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
          <ConjugationCards rows={rows} language={interfaceLanguage} showTranslations={showTranslations} showSentenceParts={showSentenceParts} showFormExplanations={showFormExplanations} t={t} />
        </section>
      </>
    );
  }

  function renderTheoryView() {
    return (
      <TheoryPage
        unit={primaryLearningUnit}
        contexts={unitContexts}
        selectedContext={selectedContextTag}
        vocabularyItems={vocabularyItems}
        t={t}
        language={interfaceLanguage}
        onContextChange={setSelectedContextTag}
        onGuidedLesson={() => setActivePage("lesson")}
        onPractice={() => setActivePage("individual")}
      />
    );
  }

  function renderPracticeView() {
    const journey = getUnitJourney(journeyProgress, primaryLearningUnit?.id);
    return (
      <FocusedPracticePage
        unit={primaryLearningUnit}
        contexts={unitContexts}
        selectedContext={selectedContextTag}
        exercises={practiceExercises}
        totalUnitExercises={getPracticeExercises(primaryLearningUnit).length}
        journey={journey}
        t={t}
        onContextChange={setSelectedContextTag}
        onProgressChange={(patch) => {
          setJourneyProgress((current) => updateUnitJourney(current, primaryLearningUnit.id, patch));
          if (patch.practiceCompleted) {
            setUnitProgress((current) => markUnitProgress(current, primaryLearningUnit.id, { theoryViewed: true, practiceCompleted: true }));
          }
        }}
        onAnswerResult={(exercise, isCorrect) => {
          setSkillProgress((current) => recordExerciseResult(current, primaryLearningUnit, exercise, isCorrect));
        }}
        onContinueProduction={() => setActivePage("production")}
      />
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
                          <ExplanationPanel explanation={row.explanations.affirmative} t={t} />
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
          {MENU_ITEMS.map((item) => item === "documentation" ? (
            <a href="/docs/" key={item} onClick={() => {
              if (window.matchMedia(MOBILE_MENU_QUERY).matches) setIsMenuOpen(false);
            }}>
              {t(item)}
            </a>
          ) : (
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
        {activePage === "home" && completionCelebration && (
          <section className="completion-celebration" role="status">
            <span className="completion-celebration-icon"><UiIcon name="spark" size={24} /></span>
            <div>
              <strong>{t("celebrationTitle")}</strong>
              <span>{completionCelebration.nextUnitTitle
                ? `${completionCelebration.unitTitle}. ${t("celebrationNext")}: ${completionCelebration.nextUnitTitle}`
                : `${completionCelebration.unitTitle}. ${t("celebrationFinal")}`}</span>
            </div>
            <button type="button" aria-label={t("close")} onClick={() => setCompletionCelebration(null)}>
              <UiIcon name="close" size={18} />
            </button>
          </section>
        )}
        {activePage === "home" && renderDashboard()}
        {activePage === "course" && (
          <CoursePage
            units={orderedLearningUnits}
            getUnitStatus={(unit) => getJourneySummary(unit).status}
            activeUnitId={primaryLearningUnit?.id}
            recommendedUnitId={primaryLearningUnit?.id}
            t={t}
            onOpenUnit={(unit) => {
              setCefrFilter(unit.cefrLevel);
              setActiveLearningUnitId(unit.id);
              setActivePage("lesson");
            }}
          />
        )}
        {activePage === "progress" && (
          <ProgressPage
            levelProgress={["A1", "A2", "B1", "B2"].map((courseLevel) => {
              const levelUnits = orderedLearningUnits.filter((unit) => unit.cefrLevel === courseLevel);
              const completed = levelUnits.filter((unit) => getJourneySummary(unit).status === "completed").length;
              return { level: courseLevel, total: levelUnits.length, completed, percent: levelUnits.length ? Math.round((completed / levelUnits.length) * 100) : 0 };
            })}
            skillSummary={getSkillMasterySummary(skillProgress)}
            t={t}
            onReview={() => setActivePage("review")}
            onCourse={() => setActivePage("course")}
          />
        )}
        {activePage === "review" && (
          <AdaptiveReviewPage
            units={visibleLearningUnits}
            skillProgress={skillProgress}
            t={t}
            onAnswerResult={(unit, exercise, isCorrect) => {
              setSkillProgress((current) => recordExerciseResult(current, unit, exercise, isCorrect));
            }}
            onBack={() => setActivePage("home")}
            onPractice={() => setActivePage("practice")}
          />
        )}
        {activePage === "lesson" && (
          <GuidedLessonPage
            key={primaryLearningUnit?.id}
            unit={primaryLearningUnit}
            initialProgress={getUnitJourney(journeyProgress, primaryLearningUnit?.id)}
            t={t}
            onProgressChange={(patch) => {
              setJourneyProgress((current) => updateUnitJourney(current, primaryLearningUnit.id, patch));
              setUnitProgress((current) => markUnitProgress(current, primaryLearningUnit.id, { theoryViewed: true }));
            }}
            onBack={() => setActivePage("theory")}
            onPractice={() => setActivePage("practice")}
            onAnswerResult={(exercise, isCorrect) => {
              setSkillProgress((current) => recordExerciseResult(current, primaryLearningUnit, exercise, isCorrect));
            }}
          />
        )}
        {activePage === "theory" && renderTheoryView()}
        {activePage === "practice" && renderPracticeView()}
        {activePage === "individual" && renderIndividualView()}
        {activePage === "complete" && renderCompleteView()}
        {activePage === "production" && renderProductionView()}
        {activePage === "settings" && renderSettingsView()}
        {activePage === "documentation" && <DocumentationPage t={t} learnerLanguage={learnerLanguage} />}
        {activePage === "manual" && <ManualPage t={t} />}
        {activePage === "about" && <AboutPage t={t} />}
      </main>
      <nav className="mobile-primary-nav" aria-label={t("primaryNavigation")}>
        {MOBILE_NAV_ITEMS.map((item) => (
          <button
            type="button"
            key={item.page}
            className={item.activePages.includes(activePage) ? "active" : ""}
            aria-current={item.activePages.includes(activePage) ? "page" : undefined}
            onClick={() => setActivePage(item.page)}
          >
            <UiIcon name={item.icon} size={19} />
            <span>{t(item.labelKey)}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}

function TheoryPage({ unit, contexts, selectedContext, vocabularyItems, t, language, onContextChange, onGuidedLesson, onPractice }) {
  if (!unit) {
    return (
      <section className="theory-page">
        <div className="theory-header">
          <div>
            <p className="eyebrow">{t("theory")}</p>
            <h2>{t("theoryTitle")}</h2>
            <p>{t("noLearningContent")}</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="theory-page">
      <div className="theory-header">
        <div>
          <p className="eyebrow">{t("theory")}</p>
          <h2>{unit.title}</h2>
          <p>{unit.focus}</p>
        </div>
        <div className="theory-header-actions">
          {unit.productionTask && (
            <button type="button" className="guided-start-button" onClick={onGuidedLesson}>Start guided lesson</button>
          )}
          <button type="button" onClick={onPractice}>{t("practiceIndividual")}</button>
        </div>
      </div>

      <ContextFilter
        contexts={contexts}
        selectedContext={selectedContext}
        t={t}
        onChange={onContextChange}
      />

      <div className="theory-summary-grid">
        <article>
          <p className="eyebrow">{t("learningObjectives")}</p>
          <ul>
            {unit.objectives.map((objective) => <li key={objective}>{objective}</li>)}
          </ul>
        </article>
        <article>
          <p className="eyebrow">{t("linkedTenses")}</p>
          <div className="theory-pill-row">
            {unit.tenseIds.map((tenseId) => (
              <span className="pattern-pill" key={tenseId}>{tenseLabel(tenseId, language)}</span>
            ))}
          </div>
          <p className="theory-muted">{t("focus")}: {unit.contextTags.join(", ")}</p>
        </article>
      </div>

      <div className="theory-section-grid">
        {unit.sections.map((section) => (
          <LearningSection
            key={section.id}
            section={section}
            selectedContext={selectedContext}
            vocabularyItems={vocabularyItems}
            t={t}
          />
        ))}
      </div>
    </section>
  );
}

function LearningSection({ section, selectedContext, vocabularyItems, t }) {
  switch (section.type) {
    case "theory":
      return (
        <article className="theory-card">
          <h3>{section.title}</h3>
          {section.body.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          {section.signalWords && (
            <div className="signal-word-wrap">
              <p className="eyebrow">{t("signalWords")}</p>
              <div className="theory-pill-row">
                {section.signalWords.map((word) => <span className="pattern-pill" key={word}>{word}</span>)}
              </div>
            </div>
          )}
        </article>
      );
    case "structures":
      return (
        <article className="theory-card theory-wide-card">
          <h3>{section.title}</h3>
          <div className="theory-list">
            {section.structures.map((item) => (
              <div className="theory-list-row" key={`${item.form}-${item.pattern}`}>
                <strong>{t(item.form)}</strong>
                <span>{item.pattern}</span>
                <em>{item.example}</em>
              </div>
            ))}
          </div>
        </article>
      );
    case "commonMistakes":
      return (
        <article className="theory-card">
          <h3>{section.title}</h3>
          <div className="mistake-list">
            {section.mistakes.map((item) => (
              <div key={item.wrong}>
                <p><strong>{t("wrong")}:</strong> {item.wrong}</p>
                <p><strong>{t("right")}:</strong> {item.right}</p>
                <p className="theory-muted">{item.why}</p>
              </div>
            ))}
          </div>
        </article>
      );
    case "examples":
      {
        const examples = filterByContext(section.examples, selectedContext);

        if (examples.length === 0) {
          return (
            <article className="theory-card">
              <h3>{section.title}</h3>
              <p className="theory-muted">{t("noContextExamples")}</p>
            </article>
          );
        }

      return (
        <article className="theory-card">
          <h3>{section.title}</h3>
          <div className="example-list">
            {examples.map((item) => (
              <div key={item.sentence}>
                <p className="sentence">{item.sentence}</p>
                <p className="theory-muted">{item.context} | {item.note}</p>
              </div>
            ))}
          </div>
        </article>
      );
      }
    case "exercises":
      return (
        <article className="theory-card theory-wide-card">
          <h3>{section.title}</h3>
          <div className="theory-list">
            {section.exercises.map((item) => (
              <details className="practice-preview" key={item.id}>
                <summary>{item.prompt}</summary>
                <p><strong>{t("answer")}:</strong> {item.answer}</p>
                <p className="theory-muted">{item.explanation}</p>
              </details>
            ))}
          </div>
        </article>
      );
    case "vocabulary":
      if (vocabularyItems.length === 0) {
        return (
          <article className="theory-card">
            <h3>{section.title}</h3>
            <p className="theory-muted">{t("noContextVocabulary")}</p>
          </article>
        );
      }

      return (
        <article className="theory-card">
          <h3>{section.title}</h3>
          <div className="vocabulary-grid">
            {vocabularyItems.map((item) => (
              <div className="vocabulary-card" key={`${item.context}-${item.term}`}>
                <strong>{item.term}</strong>
                <span>{item.meaning}</span>
                {item.example && <em>{item.example}</em>}
              </div>
            ))}
          </div>
        </article>
      );
    default:
      return null;
  }
}

function ContextFilter({ contexts, selectedContext, t, onChange }) {
  if (!contexts?.length) return null;

  return (
    <section className="context-strip" aria-label={t("contextFilter")}>
      <div>
        <p className="eyebrow">{t("contextFilter")}</p>
        <p>{t("contextFilterHint")}</p>
      </div>
      <div className="context-buttons">
        <button
          type="button"
          className={selectedContext === ALL_CONTEXTS ? "active" : ""}
          aria-pressed={selectedContext === ALL_CONTEXTS}
          onClick={() => onChange(ALL_CONTEXTS)}
        >
          {t("allContexts")}
        </button>
        {contexts.map((context) => (
          <button
            type="button"
            className={selectedContext === context.id ? "active" : ""}
            aria-pressed={selectedContext === context.id}
            title={context.description}
            key={context.id}
            onClick={() => onChange(context.id)}
          >
            {context.title}
          </button>
        ))}
      </div>
    </section>
  );
}

function PracticePage({ unit, contexts, selectedContext, exercises, answers, results, t, onContextChange, onAnswerChange, onCheck, onReset }) {
  const correctCount = Object.values(results).filter((result) => result.isCorrect).length;

  return (
    <section className="practice-page">
      <div className="practice-header">
        <div>
          <p className="eyebrow">{t("practice")}</p>
          <h2>{unit?.title || t("practiceTitle")}</h2>
          <p>{t("practiceIntro")}</p>
        </div>
        <div className="practice-score">
          <span>{correctCount}/{exercises.length}</span>
          <small>{t("correctAnswers")}</small>
        </div>
      </div>

      <ContextFilter
        contexts={contexts}
        selectedContext={selectedContext}
        t={t}
        onChange={onContextChange}
      />

      {exercises.length === 0 ? (
        <p className="empty-filter-message">{t("noPracticeExercises")}</p>
      ) : (
        <div className="practice-list">
          {exercises.map((exercise, index) => {
            const result = results[exercise.id];
            const options = Array.isArray(exercise.options) && exercise.options.length > 0 ? exercise.options : buildFallbackOptionsForExercise(exercise);

            return (
              <article className={`practice-card ${result?.isCorrect ? "correct" : result ? "incorrect" : ""}`} key={exercise.id}>
                <div className="practice-card-heading">
                  <div>
                    <p className="eyebrow">{exercise.sectionTitle || t("practice")}</p>
                    <h3>{index + 1}. {exercise.prompt}</h3>
                  </div>
                  <span className="pattern-pill">{exercise.kind}</span>
                </div>
                {options.length > 0 ? (
                  <label className="field field-light">
                    <span>{t("yourAnswer")}</span>
                    <select value={answers[exercise.id] || ""} onChange={(event) => onAnswerChange(exercise.id, event.target.value)}>
                      <option value="" disabled>{t("selectAnswer")}</option>
                      {options.map((option) => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  </label>
                ) : (
                  <label className="field field-light">
                    <span>{t("yourAnswer")}</span>
                    <input value={answers[exercise.id] || ""} onChange={(event) => onAnswerChange(exercise.id, event.target.value)} />
                    <small>{t("practiceNoOptions")}</small>
                  </label>
                )}
                <div className="practice-actions">
                  <button type="button" onClick={() => onCheck(exercise)}>{t("checkAnswer")}</button>
                </div>
                {result && (
                  <div className="practice-feedback">
                    <strong>{result.isCorrect ? t("correct") : t("tryAgain")}</strong>
                    <p>{t("expectedAnswer")}: {result.expectedAnswer}</p>
                    <p>{exercise.explanation}</p>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}

      {exercises.length > 0 && (
        <div className="practice-footer">
          <button type="button" onClick={onReset}>{t("resetPractice")}</button>
        </div>
      )}
    </section>
  );
}

function DocumentationPage({ t, learnerLanguage }) {
  return (
    <section className="info-page">
      <p className="eyebrow">{t("documentation")}</p>
      <h2>{t("documentationTitle")}</h2>
      <a className="documentation-site-link" href="/docs/">{t("openDocumentationSite")}</a>
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

function VerbCombobox({ label, verbs, selectedVerb, query, learnerLanguage, placeholder, t, onQueryChange, onSelect }) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const visibleVerbs = verbs.slice(0, 10);
  const listId = "verb-combobox-results";
  const inputValue = isOpen ? query : selectedVerb?.label || "";

  useEffect(() => {
    setActiveIndex(0);
  }, [query, verbs]);

  function chooseVerb(verb) {
    onSelect(verb.id);
    setIsOpen(false);
  }

  function handleKeyDown(event) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setIsOpen(true);
      setActiveIndex((index) => Math.min(index + 1, Math.max(visibleVerbs.length - 1, 0)));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setIsOpen(true);
      setActiveIndex((index) => Math.max(index - 1, 0));
    } else if (event.key === "Enter" && isOpen && visibleVerbs[activeIndex]) {
      event.preventDefault();
      chooseVerb(visibleVerbs[activeIndex]);
    } else if (event.key === "Escape") {
      setIsOpen(false);
    }
  }

  return (
    <div className="field field-light verb-combobox" onBlur={(event) => {
      if (!event.currentTarget.contains(event.relatedTarget)) setIsOpen(false);
    }}>
      <span>{label}</span>
      <div className="verb-combobox-control">
        <input
          type="text"
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={isOpen}
          aria-controls={listId}
          aria-activedescendant={isOpen && visibleVerbs[activeIndex] ? "verb-option-" + visibleVerbs[activeIndex].id : undefined}
          value={inputValue}
          placeholder={placeholder}
          onFocus={() => setIsOpen(true)}
          onChange={(event) => {
            onQueryChange(event.target.value);
            setIsOpen(true);
          }}
          onKeyDown={handleKeyDown}
        />
        {isOpen && query && (
          <button type="button" className="verb-combobox-clear" aria-label={t("clearVerbSearch")} onClick={() => onQueryChange("")}>
            <span aria-hidden="true">&times;</span>
          </button>
        )}
      </div>
      {isOpen && (
        <div className="verb-combobox-menu" id={listId} role="listbox" aria-label={t("verbSearchResults")}>
          {visibleVerbs.length === 0 ? (
            <div className="verb-combobox-empty">
              <strong>{t("noVerbMatches")}</strong>
              <span>{t("noVerbMatchesHelp")}</span>
            </div>
          ) : visibleVerbs.map((verb, index) => {
            const meaning = learnerLanguage === "es"
              ? verb.meaningEs || verb.meaning?.es || verb.learner?.meaningEs || ""
              : verb.meaningEn || verb.meaning?.en || verb.learner?.meaningEn || "";
            const forms = [verb.base, verb.past, verb.participle, verb.forms?.base, verb.forms?.past, verb.forms?.participle]
              .filter((value, position, values) => value && values.indexOf(value) === position)
              .slice(0, 3)
              .join(" / ");
            return (
              <button
                type="button"
                id={"verb-option-" + verb.id}
                key={verb.id}
                role="option"
                aria-selected={verb.id === selectedVerb?.id}
                className={"verb-combobox-option " + (index === activeIndex ? "active " : "") + (verb.id === selectedVerb?.id ? "selected" : "")}
                onMouseDown={(event) => event.preventDefault()}
                onMouseEnter={() => setActiveIndex(index)}
                onClick={() => chooseVerb(verb)}
              >
                <strong>{verb.label}</strong>
                {meaning && <span>{meaning}</span>}
                {forms && <small>{forms}</small>}
              </button>
            );
          })}
          {verbs.length > visibleVerbs.length && <div className="verb-combobox-more">+{verbs.length - visibleVerbs.length} {t("moreResults")}</div>}
        </div>
      )}
    </div>
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

function ConjugationRows({ rows, language, showTranslations, showSentenceParts, showFormExplanations, visibleColumns = COMPLETE_FORM_COLUMNS, t }) {
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
        showFormExplanations={showFormExplanations}
        visibleColumns={visibleColumns}
        t={t}
      />
    );
  });
}

function FragmentRow({ row, language, showGroup, showTranslations, showSentenceParts, showFormExplanations, visibleColumns, t }) {
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
            explanation={row.explanations[columnId]}
            translation={row.translations[columnId]}
            showTranslations={showTranslations}
            showSentenceParts={showSentenceParts}
            showFormExplanations={showFormExplanations}
            t={t}
          />
        ))}
      </tr>
    </>
  );
}

function SentenceCell({ sentence, parts, explanation, translation, showTranslations, showSentenceParts, showFormExplanations, t }) {
  return (
    <td>
      <span className="sentence">{sentence}</span>
      {showSentenceParts && <SentenceParts parts={parts} />}
      {showFormExplanations && <ExplanationPanel explanation={explanation} t={t} />}
      {showTranslations && <span className="translation">{translation}</span>}
    </td>
  );
}

function ConjugationCards({ rows, language, showTranslations, showSentenceParts, showFormExplanations, t }) {
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
          <CardLine label={t("affirmative")} value={row.affirmative} translation={row.translations.affirmative} parts={row.breakdown.affirmative} explanation={row.explanations.affirmative} showTranslations={showTranslations} showSentenceParts={showSentenceParts} showFormExplanations={showFormExplanations} t={t} defaultOpen />
          <CardLine label={t("negative")} value={row.negative} translation={row.translations.negative} parts={row.breakdown.negative} explanation={row.explanations.negative} showTranslations={showTranslations} showSentenceParts={showSentenceParts} showFormExplanations={showFormExplanations} t={t} />
          <CardLine label={t("questionPositive")} value={row.questionPositive} translation={row.translations.questionPositive} parts={row.breakdown.questionPositive} explanation={row.explanations.questionPositive} showTranslations={showTranslations} showSentenceParts={showSentenceParts} showFormExplanations={showFormExplanations} t={t} />
          <CardLine label={t("questionNegative")} value={row.questionNegative} translation={row.translations.questionNegative} parts={row.breakdown.questionNegative} explanation={row.explanations.questionNegative} showTranslations={showTranslations} showSentenceParts={showSentenceParts} showFormExplanations={showFormExplanations} t={t} />
        </div>
      </article>
    );
  });
}

function CardLine({ label, value, translation, parts, explanation, showTranslations, showSentenceParts, showFormExplanations, t, defaultOpen = false }) {
  return (
    <details className="mobile-form-line" open={defaultOpen}>
      <summary>
        <span className="mobile-form-label">{label}</span>
        <span className="mobile-form-value">{value}</span>
      </summary>
      <div className="mobile-form-detail">
        {showSentenceParts && <SentenceParts parts={parts} />}
        {showFormExplanations && <ExplanationPanel explanation={explanation} t={t} />}
        {showTranslations && <p className="card-translation">{translation}</p>}
      </div>
    </details>
  );
}

function ExplanationPanel({ explanation, t }) {
  if (!explanation) return null;

  return (
    <details className="why-form-panel">
      <summary>{t("whyThisForm")}</summary>
      <dl>
        <div><dt>{t("pattern")}</dt><dd>{explanation.pattern}</dd></div>
        <div><dt>{t("reason")}</dt><dd>{explanation.reason}</dd></div>
        <div><dt>{t("auxiliaryPart")}</dt><dd>{explanation.auxiliary}</dd></div>
        <div><dt>{t("verbForm")}</dt><dd>{explanation.verbForm}</dd></div>
      </dl>
      <p>{explanation.note}</p>
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

function tenseLabel(tenseId, language) {
  const tense = TENSES.find((entry) => entry.id === tenseId);
  return tense?.[language] || tense?.en || tenseId;
}

function getSuggestedProductionPrompts(prompts, unit) {
  if (!unit?.id) return prompts;

  const directMatches = prompts.filter((prompt) => Array.isArray(prompt.unitIds) && prompt.unitIds.includes(unit.id));
  if (directMatches.length > 0) return directMatches;

  const levelMatches = prompts.filter((prompt) => prompt.cefrLevel && prompt.cefrLevel === unit.cefrLevel);
  return levelMatches.length > 0 ? levelMatches : prompts;
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
function sortDraftEntries(entries, sort) {
  const direction = sort.direction === "desc" ? -1 : 1;

  return [...entries].sort((left, right) => {
    const leftValue = getDraftSortValue(left.verb, sort.field, left.index);
    const rightValue = getDraftSortValue(right.verb, sort.field, right.index);

    if (typeof leftValue === "number" && typeof rightValue === "number") {
      return (leftValue - rightValue) * direction;
    }

    return String(leftValue).localeCompare(String(rightValue), undefined, { numeric: true, sensitivity: "base" }) * direction;
  });
}

function getDraftSortValue(verb, field, index) {
  if (field === "index") return index;
  if (field === "pattern") return getVerbSummary(verb).pattern;
  if (field === "type") return verbTypeLabel(verb.type, (key) => key);
  return normalizeSearchText(verb[field] || "");
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
  return readJsonStorage(window.localStorage, STORAGE_KEY);
}

function writeStoredSettings(settings) {
  if (typeof window === "undefined") return;
  writeJsonStorage(window.localStorage, STORAGE_KEY, settings);
}

function clearStoredSettings() {
  if (typeof window === "undefined") return;
  clearJsonStorage(window.localStorage, STORAGE_KEY);
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
