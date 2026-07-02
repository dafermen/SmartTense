import { LEVELS, TENSES } from "./data/defaultData.js";
import { getLearnerMeaning, getLearnerObject, getLearnerUsageNote, translateLearnerSentence } from "./learnerLanguages/index.js";

export const GROUP_LABELS = {
  present: { en: "Present tenses", es: "Tiempos presentes" },
  past: { en: "Past tenses", es: "Tiempos pasados" },
  future: { en: "Future tenses", es: "Tiempos futuros" },
  conditional: { en: "Conditional tenses", es: "Tiempos condicionales" }
};

// Public API used by the UI and tests. It converts selected verbs, subjects,
// and tenses into display-ready rows for both the desktop table and mobile cards.
export function buildRows(verb, subjects, tenses, interfaceLanguage, options = {}) {
  const useContractions = options.useContractions ?? true;
  const learnerLanguage = options.learnerLanguage || "es";

  return subjects.flatMap((subject) =>
    tenses.map((tense) => {
      const forms = useContractions ? conjugate(verb, subject, tense.id) : expandContractions(conjugate(verb, subject, tense.id));

      const displayForms = {
        affirmative: sentenceCase(forms.affirmative),
        negative: sentenceCase(forms.negative),
        questionPositive: sentenceCase(forms.questionPositive),
        questionNegative: sentenceCase(forms.questionNegative)
      };

      return {
        subject: subject.label,
        group: tense.group,
        tense: tense[interfaceLanguage],
        tenseId: tense.id,
        usageNote: buildUsageNote(verb, tense.id, learnerLanguage),
        ...displayForms,
        translations: buildSentenceTranslations(displayForms, verb, subject, tense, learnerLanguage),
        breakdown: {
          affirmative: buildSentenceParts(forms.affirmative, subject, "statement"),
          negative: buildSentenceParts(forms.negative, subject, "statement"),
          questionPositive: buildSentenceParts(forms.questionPositive, subject, "question"),
          questionNegative: buildSentenceParts(forms.questionNegative, subject, "question")
        }
      };
    })
  );
}

export function getVerbSummary(verb, learnerLanguage = "es") {
  const base = verb.actionBase || verb.base;
  const past = verb.past || `${verb.base}ed`;
  const participle = verb.actionParticiple || verb.participle || past;
  const gerund = verb.actionGerund || verb.gerund || `${verb.base}ing`;
  const expectedRegularPast = regularPastForm(verb.base);
  const type = verb.type || (past === expectedRegularPast ? "regular" : "irregular");
  const pattern = classifyVerbPattern(verb, { base, past, participle, type });

  return {
    type,
    pattern,
    base,
    past,
    participle,
    gerund,
    meaning: getLearnerMeaning(verb, learnerLanguage),
    object: verb.object || "",
    learnerObject: getLearnerObject(verb, learnerLanguage)
  };
}

export function classifyVerbPattern(verb, forms = {}) {
  if (verb.type === "be") return "BE";
  if (verb.type === "modal") return "MODAL";

  const base = normalizePrincipalPart(forms.base || verb.base);
  const past = normalizePrincipalPart(forms.past || verb.past || `${verb.base}ed`);
  const participle = normalizePrincipalPart(forms.participle || verb.participle || past);
  const expectedRegularPast = normalizePrincipalPart(regularPastForm(verb.base));

  if (past === expectedRegularPast && participle === expectedRegularPast) return "REGULAR_ED";
  if (base === past && past === participle) return "AAA";
  if (base === past && past !== participle) return "AAB";
  if (base === participle && base !== past) return "ABA";
  if (past === participle && base !== past) return "ABB";
  return "ABC";
}

// Levels are cumulative: intermediate includes basic, and advanced includes all.
export function getTensesByGroup(group, level = "advanced") {
  const maxRank = LEVELS.find((entry) => entry.id === level)?.rank ?? LEVELS.at(-1).rank;

  return TENSES.filter((tense) => {
    const levelRank = LEVELS.find((entry) => entry.id === tense.level)?.rank ?? LEVELS.at(-1).rank;
    const matchesGroup = group === "all" || tense.group === group;
    return matchesGroup && levelRank <= maxRank;
  });
}

function conjugate(verb, subject, tenseId) {
  // Some English verbs need their own path because normal do/does/did rules do
  // not produce natural examples for "be" or modal verbs like "can".
  if (verb.type === "be") return conjugateBe(verb, subject, tenseId);
  if (verb.type === "modal") return conjugateModal(verb, subject, tenseId);
  return conjugateRegular(verb, subject, tenseId);
}

function conjugateRegular(verb, subject, tenseId) {
  const object = appendObject(verb.object);
  const base = verb.base;
  const third = verb.third || `${base}s`;
  const past = verb.past || `${base}ed`;
  const participle = verb.participle || past;
  const gerund = verb.gerund || `${base}ing`;
  const have = subject.have;
  const hasDo = subject.third;
  const doAux = hasDo ? "does" : "do";
  const doNeg = hasDo ? "doesn't" : "don't";

  // Each template returns the four forms shown in the app: affirmative,
  // negative, interrogative, and negative interrogative.
  const templates = {
    simplePresent: forms(`${subject.label} ${hasDo ? third : base}${object}.`, `${subject.label} ${doNeg} ${base}${object}.`, `${doAux} ${subject.question} ${base}${object}?`, `${capitalize(doNeg)} ${subject.question} ${base}${object}?`),
    presentContinuous: forms(`${subject.label} ${subject.bePresent} ${gerund}${object}.`, `${subject.label} ${subject.bePresent} not ${gerund}${object}.`, `${subject.bePresent} ${subject.question} ${gerund}${object}?`, `${subject.bePresent} ${subject.question} not ${gerund}${object}?`),
    presentPerfect: forms(`${subject.label} ${have} ${participle}${object}.`, `${subject.label} ${have} not ${participle}${object}.`, `${have} ${subject.question} ${participle}${object}?`, `${have} ${subject.question} not ${participle}${object}?`),
    presentPerfectContinuous: forms(`${subject.label} ${have} been ${gerund}${object}.`, `${subject.label} ${have} not been ${gerund}${object}.`, `${have} ${subject.question} been ${gerund}${object}?`, `${have} ${subject.question} not been ${gerund}${object}?`),
    simplePast: forms(`${subject.label} ${past}${object}.`, `${subject.label} didn't ${base}${object}.`, `did ${subject.question} ${base}${object}?`, `didn't ${subject.question} ${base}${object}?`),
    pastContinuous: forms(`${subject.label} ${subject.bePast} ${gerund}${object}.`, `${subject.label} ${subject.bePast} not ${gerund}${object}.`, `${subject.bePast} ${subject.question} ${gerund}${object}?`, `${subject.bePast} ${subject.question} not ${gerund}${object}?`),
    pastPerfect: forms(`${subject.label} had ${participle}${object}.`, `${subject.label} had not ${participle}${object}.`, `had ${subject.question} ${participle}${object}?`, `hadn't ${subject.question} ${participle}${object}?`),
    pastPerfectContinuous: forms(`${subject.label} had been ${gerund}${object}.`, `${subject.label} had not been ${gerund}${object}.`, `had ${subject.question} been ${gerund}${object}?`, `hadn't ${subject.question} been ${gerund}${object}?`),
    simpleFuture: forms(`${subject.label} will ${base}${object}.`, `${subject.label} will not ${base}${object}.`, `will ${subject.question} ${base}${object}?`, `won't ${subject.question} ${base}${object}?`),
    futureContinuous: forms(`${subject.label} will be ${gerund}${object}.`, `${subject.label} will not be ${gerund}${object}.`, `will ${subject.question} be ${gerund}${object}?`, `won't ${subject.question} be ${gerund}${object}?`),
    futurePerfect: forms(`${subject.label} will have ${participle}${object}.`, `${subject.label} will not have ${participle}${object}.`, `will ${subject.question} have ${participle}${object}?`, `won't ${subject.question} have ${participle}${object}?`),
    futurePerfectContinuous: forms(`${subject.label} will have been ${gerund}${object}.`, `${subject.label} will not have been ${gerund}${object}.`, `will ${subject.question} have been ${gerund}${object}?`, `won't ${subject.question} have been ${gerund}${object}?`),
    simpleConditional: forms(`${subject.label} would ${base}${object}.`, `${subject.label} would not ${base}${object}.`, `would ${subject.question} ${base}${object}?`, `wouldn't ${subject.question} ${base}${object}?`),
    continuousConditional: forms(`${subject.label} would be ${gerund}${object}.`, `${subject.label} would not be ${gerund}${object}.`, `would ${subject.question} be ${gerund}${object}?`, `wouldn't ${subject.question} be ${gerund}${object}?`),
    perfectConditional: forms(`${subject.label} would have ${participle}${object}.`, `${subject.label} would not have ${participle}${object}.`, `would ${subject.question} have ${participle}${object}?`, `wouldn't ${subject.question} have ${participle}${object}?`),
    perfectContinuousConditional: forms(`${subject.label} would have been ${gerund}${object}.`, `${subject.label} would not have been ${gerund}${object}.`, `would ${subject.question} have been ${gerund}${object}?`, `wouldn't ${subject.question} have been ${gerund}${object}?`)
  };

  return templates[tenseId];
}

function conjugateBe(verb, subject, tenseId) {
  const complement = appendObject(verb.object);
  const have = subject.have;
  // "Be" is intentionally separate: it forms questions by inversion and does
  // not use do/does/did as auxiliary verbs.
  const templates = {
    simplePresent: forms(`${subject.label} ${subject.bePresent}${complement}.`, `${subject.label} ${subject.bePresent} not${complement}.`, `${subject.bePresent} ${subject.question}${complement}?`, `${subject.bePresent} ${subject.question} not${complement}?`),
    presentContinuous: forms(`${subject.label} ${subject.bePresent} being${complement}.`, `${subject.label} ${subject.bePresent} not being${complement}.`, `${subject.bePresent} ${subject.question} being${complement}?`, `${subject.bePresent} ${subject.question} not being${complement}?`),
    presentPerfect: forms(`${subject.label} ${have} been${complement}.`, `${subject.label} ${have} not been${complement}.`, `${have} ${subject.question} been${complement}?`, `${have} ${subject.question} not been${complement}?`),
    presentPerfectContinuous: forms(`${subject.label} ${have} been being${complement}.`, `${subject.label} ${have} not been being${complement}.`, `${have} ${subject.question} been being${complement}?`, `${have} ${subject.question} not been being${complement}?`),
    simplePast: forms(`${subject.label} ${subject.bePast}${complement}.`, `${subject.label} ${subject.bePast} not${complement}.`, `${subject.bePast} ${subject.question}${complement}?`, `${subject.bePast} ${subject.question} not${complement}?`),
    pastContinuous: forms(`${subject.label} ${subject.bePast} being${complement}.`, `${subject.label} ${subject.bePast} not being${complement}.`, `${subject.bePast} ${subject.question} being${complement}?`, `${subject.bePast} ${subject.question} not being${complement}?`),
    pastPerfect: forms(`${subject.label} had been${complement}.`, `${subject.label} had not been${complement}.`, `had ${subject.question} been${complement}?`, `hadn't ${subject.question} been${complement}?`),
    pastPerfectContinuous: forms(`${subject.label} had been being${complement}.`, `${subject.label} had not been being${complement}.`, `had ${subject.question} been being${complement}?`, `hadn't ${subject.question} been being${complement}?`),
    simpleFuture: forms(`${subject.label} will be${complement}.`, `${subject.label} will not be${complement}.`, `will ${subject.question} be${complement}?`, `won't ${subject.question} be${complement}?`),
    futureContinuous: forms(`${subject.label} will be${complement}.`, `${subject.label} will not be${complement}.`, `will ${subject.question} be${complement}?`, `won't ${subject.question} be${complement}?`),
    futurePerfect: forms(`${subject.label} will have been${complement}.`, `${subject.label} will not have been${complement}.`, `will ${subject.question} have been${complement}?`, `won't ${subject.question} have been${complement}?`),
    futurePerfectContinuous: forms(`${subject.label} will have been being${complement}.`, `${subject.label} will not have been being${complement}.`, `will ${subject.question} have been being${complement}?`, `won't ${subject.question} have been being${complement}?`),
    simpleConditional: forms(`${subject.label} would be${complement}.`, `${subject.label} would not be${complement}.`, `would ${subject.question} be${complement}?`, `wouldn't ${subject.question} be${complement}?`),
    continuousConditional: forms(`${subject.label} would be${complement}.`, `${subject.label} would not be${complement}.`, `would ${subject.question} be${complement}?`, `wouldn't ${subject.question} be${complement}?`),
    perfectConditional: forms(`${subject.label} would have been${complement}.`, `${subject.label} would not have been${complement}.`, `would ${subject.question} have been${complement}?`, `wouldn't ${subject.question} have been${complement}?`),
    perfectContinuousConditional: forms(`${subject.label} would have been being${complement}.`, `${subject.label} would not have been being${complement}.`, `would ${subject.question} have been being${complement}?`, `wouldn't ${subject.question} have been being${complement}?`)
  };

  return templates[tenseId];
}

function conjugateModal(verb, subject, tenseId) {
  // can and should need more natural paraphrases in some tenses, so they get
  // dedicated handlers before the generic modal fallback is used.
  if (verb.id === "can") return conjugateCan(verb, subject, tenseId);
  if (verb.id === "should") return conjugateShould(verb, subject, tenseId);

  const action = appendObject(getActionBase(verb));
  const modal = verb.base;

  const templates = {
    simplePresent: forms(`${subject.label} ${modal}${action}.`, `${subject.label} ${modalNot(modal)}${action}.`, `${modal} ${subject.question}${action}?`, `${modalNegativeQuestion(modal)} ${subject.question}${action}?`),
    presentContinuous: forms(`${subject.label} ${modal} be ${getActionGerund(verb)}.`, `${subject.label} ${modalNot(modal)} be ${getActionGerund(verb)}.`, `${modal} ${subject.question} be ${getActionGerund(verb)}?`, `${modalNegativeQuestion(modal)} ${subject.question} be ${getActionGerund(verb)}?`),
    presentPerfect: forms(`${subject.label} ${modal} have ${getActionParticiple(verb)}.`, `${subject.label} ${modalNot(modal)} have ${getActionParticiple(verb)}.`, `${modal} ${subject.question} have ${getActionParticiple(verb)}?`, `${modalNegativeQuestion(modal)} ${subject.question} have ${getActionParticiple(verb)}?`),
    presentPerfectContinuous: forms(`${subject.label} ${modal} have been ${getActionGerund(verb)}.`, `${subject.label} ${modalNot(modal)} have been ${getActionGerund(verb)}.`, `${modal} ${subject.question} have been ${getActionGerund(verb)}?`, `${modalNegativeQuestion(modal)} ${subject.question} have been ${getActionGerund(verb)}?`),
    simplePast: forms(`${subject.label} ${verb.past || modal}${action}.`, `${subject.label} ${verb.past || modal} not${action}.`, `${verb.past || modal} ${subject.question}${action}?`, `${verb.past || modal}n't ${subject.question}${action}?`),
    pastContinuous: forms(`${subject.label} ${verb.past || modal} be ${getActionGerund(verb)}.`, `${subject.label} ${verb.past || modal} not be ${getActionGerund(verb)}.`, `${verb.past || modal} ${subject.question} be ${getActionGerund(verb)}?`, `${verb.past || modal}n't ${subject.question} be ${getActionGerund(verb)}?`),
    pastPerfect: forms(`${subject.label} ${verb.past || modal} have ${getActionParticiple(verb)}.`, `${subject.label} ${verb.past || modal} not have ${getActionParticiple(verb)}.`, `${verb.past || modal} ${subject.question} have ${getActionParticiple(verb)}?`, `${verb.past || modal}n't ${subject.question} have ${getActionParticiple(verb)}?`),
    pastPerfectContinuous: forms(`${subject.label} ${verb.past || modal} have been ${getActionGerund(verb)}.`, `${subject.label} ${verb.past || modal} not have been ${getActionGerund(verb)}.`, `${verb.past || modal} ${subject.question} have been ${getActionGerund(verb)}?`, `${verb.past || modal}n't ${subject.question} have been ${getActionGerund(verb)}?`),
    simpleFuture: forms(`${subject.label} will ${getActionBase(verb)}.`, `${subject.label} will not ${getActionBase(verb)}.`, `will ${subject.question} ${getActionBase(verb)}?`, `won't ${subject.question} ${getActionBase(verb)}?`),
    futureContinuous: forms(`${subject.label} will be ${getActionGerund(verb)}.`, `${subject.label} will not be ${getActionGerund(verb)}.`, `will ${subject.question} be ${getActionGerund(verb)}?`, `won't ${subject.question} be ${getActionGerund(verb)}?`),
    futurePerfect: forms(`${subject.label} will have ${getActionParticiple(verb)}.`, `${subject.label} will not have ${getActionParticiple(verb)}.`, `will ${subject.question} have ${getActionParticiple(verb)}?`, `won't ${subject.question} have ${getActionParticiple(verb)}?`),
    futurePerfectContinuous: forms(`${subject.label} will have been ${getActionGerund(verb)}.`, `${subject.label} will not have been ${getActionGerund(verb)}.`, `will ${subject.question} have been ${getActionGerund(verb)}?`, `won't ${subject.question} have been ${getActionGerund(verb)}?`),
    simpleConditional: forms(`${subject.label} would ${getActionBase(verb)}.`, `${subject.label} would not ${getActionBase(verb)}.`, `would ${subject.question} ${getActionBase(verb)}?`, `wouldn't ${subject.question} ${getActionBase(verb)}?`),
    continuousConditional: forms(`${subject.label} would be ${getActionGerund(verb)}.`, `${subject.label} would not be ${getActionGerund(verb)}.`, `would ${subject.question} be ${getActionGerund(verb)}?`, `wouldn't ${subject.question} be ${getActionGerund(verb)}?`),
    perfectConditional: forms(`${subject.label} would have ${getActionParticiple(verb)}.`, `${subject.label} would not have ${getActionParticiple(verb)}.`, `would ${subject.question} have ${getActionParticiple(verb)}?`, `wouldn't ${subject.question} have ${getActionParticiple(verb)}?`),
    perfectContinuousConditional: forms(`${subject.label} would have been ${getActionGerund(verb)}.`, `${subject.label} would not have been ${getActionGerund(verb)}.`, `would ${subject.question} have been ${getActionGerund(verb)}?`, `wouldn't ${subject.question} have been ${getActionGerund(verb)}?`)
  };

  return templates[tenseId];
}

function conjugateCan(verb, subject, tenseId) {
  const action = getActionBase(verb);
  const able = `able to ${action}`;
  const beenAble = `been ${able}`;
  const templates = {
    simplePresent: forms(`${subject.label} can ${action}.`, `${subject.label} cannot ${action}.`, `can ${subject.question} ${action}?`, `can't ${subject.question} ${action}?`),
    presentContinuous: forms(`${subject.label} ${subject.bePresent} ${able}.`, `${subject.label} ${subject.bePresent} not ${able}.`, `${subject.bePresent} ${subject.question} ${able}?`, `${subject.bePresent} ${subject.question} not ${able}?`),
    presentPerfect: forms(`${subject.label} ${subject.have} ${beenAble}.`, `${subject.label} ${subject.have} not ${beenAble}.`, `${subject.have} ${subject.question} ${beenAble}?`, `${subject.have} ${subject.question} not ${beenAble}?`),
    presentPerfectContinuous: forms(`${subject.label} ${subject.have} ${beenAble}.`, `${subject.label} ${subject.have} not ${beenAble}.`, `${subject.have} ${subject.question} ${beenAble}?`, `${subject.have} ${subject.question} not ${beenAble}?`),
    simplePast: forms(`${subject.label} could ${action}.`, `${subject.label} could not ${action}.`, `could ${subject.question} ${action}?`, `couldn't ${subject.question} ${action}?`),
    pastContinuous: forms(`${subject.label} ${subject.bePast} ${able}.`, `${subject.label} ${subject.bePast} not ${able}.`, `${subject.bePast} ${subject.question} ${able}?`, `${subject.bePast} ${subject.question} not ${able}?`),
    pastPerfect: forms(`${subject.label} had ${beenAble}.`, `${subject.label} had not ${beenAble}.`, `had ${subject.question} ${beenAble}?`, `hadn't ${subject.question} ${beenAble}?`),
    pastPerfectContinuous: forms(`${subject.label} had ${beenAble}.`, `${subject.label} had not ${beenAble}.`, `had ${subject.question} ${beenAble}?`, `hadn't ${subject.question} ${beenAble}?`),
    simpleFuture: forms(`${subject.label} will be ${able}.`, `${subject.label} will not be ${able}.`, `will ${subject.question} be ${able}?`, `won't ${subject.question} be ${able}?`),
    futureContinuous: forms(`${subject.label} will be ${able}.`, `${subject.label} will not be ${able}.`, `will ${subject.question} be ${able}?`, `won't ${subject.question} be ${able}?`),
    futurePerfect: forms(`${subject.label} will have ${beenAble}.`, `${subject.label} will not have ${beenAble}.`, `will ${subject.question} have ${beenAble}?`, `won't ${subject.question} have ${beenAble}?`),
    futurePerfectContinuous: forms(`${subject.label} will have ${beenAble}.`, `${subject.label} will not have ${beenAble}.`, `will ${subject.question} have ${beenAble}?`, `won't ${subject.question} have ${beenAble}?`),
    simpleConditional: forms(`${subject.label} would be ${able}.`, `${subject.label} would not be ${able}.`, `would ${subject.question} be ${able}?`, `wouldn't ${subject.question} be ${able}?`),
    continuousConditional: forms(`${subject.label} would be ${able}.`, `${subject.label} would not be ${able}.`, `would ${subject.question} be ${able}?`, `wouldn't ${subject.question} be ${able}?`),
    perfectConditional: forms(`${subject.label} would have ${beenAble}.`, `${subject.label} would not have ${beenAble}.`, `would ${subject.question} have ${beenAble}?`, `wouldn't ${subject.question} have ${beenAble}?`),
    perfectContinuousConditional: forms(`${subject.label} would have ${beenAble}.`, `${subject.label} would not have ${beenAble}.`, `would ${subject.question} have ${beenAble}?`, `wouldn't ${subject.question} have ${beenAble}?`)
  };

  return templates[tenseId];
}

function conjugateShould(verb, subject, tenseId) {
  const action = getActionBase(verb);
  const gerund = getActionGerund(verb);
  const participle = getActionParticiple(verb);
  const expected = `expected to ${action}`;
  const templates = {
    simplePresent: forms(`${subject.label} should ${action}.`, `${subject.label} should not ${action}.`, `should ${subject.question} ${action}?`, `shouldn't ${subject.question} ${action}?`),
    presentContinuous: forms(`${subject.label} should be ${gerund}.`, `${subject.label} should not be ${gerund}.`, `should ${subject.question} be ${gerund}?`, `shouldn't ${subject.question} be ${gerund}?`),
    presentPerfect: forms(`${subject.label} should have ${participle}.`, `${subject.label} should not have ${participle}.`, `should ${subject.question} have ${participle}?`, `shouldn't ${subject.question} have ${participle}?`),
    presentPerfectContinuous: forms(`${subject.label} should have been ${gerund}.`, `${subject.label} should not have been ${gerund}.`, `should ${subject.question} have been ${gerund}?`, `shouldn't ${subject.question} have been ${gerund}?`),
    simplePast: forms(`${subject.label} ${subject.bePast} ${expected}.`, `${subject.label} ${subject.bePast} not ${expected}.`, `${subject.bePast} ${subject.question} ${expected}?`, `${subject.bePast} ${subject.question} not ${expected}?`),
    pastContinuous: forms(`${subject.label} ${subject.bePast} ${gerund} as expected.`, `${subject.label} ${subject.bePast} not ${gerund} as expected.`, `${subject.bePast} ${subject.question} ${gerund} as expected?`, `${subject.bePast} ${subject.question} not ${gerund} as expected?`),
    pastPerfect: forms(`${subject.label} had been ${expected}.`, `${subject.label} had not been ${expected}.`, `had ${subject.question} been ${expected}?`, `hadn't ${subject.question} been ${expected}?`),
    pastPerfectContinuous: forms(`${subject.label} had been ${gerund} as expected.`, `${subject.label} had not been ${gerund} as expected.`, `had ${subject.question} been ${gerund} as expected?`, `hadn't ${subject.question} been ${gerund} as expected?`),
    simpleFuture: forms(`${subject.label} will be ${expected}.`, `${subject.label} will not be ${expected}.`, `will ${subject.question} be ${expected}?`, `won't ${subject.question} be ${expected}?`),
    futureContinuous: forms(`${subject.label} will be ${gerund} as expected.`, `${subject.label} will not be ${gerund} as expected.`, `will ${subject.question} be ${gerund} as expected?`, `won't ${subject.question} be ${gerund} as expected?`),
    futurePerfect: forms(`${subject.label} will have been ${expected}.`, `${subject.label} will not have been ${expected}.`, `will ${subject.question} have been ${expected}?`, `won't ${subject.question} have been ${expected}?`),
    futurePerfectContinuous: forms(`${subject.label} will have been ${gerund} as expected.`, `${subject.label} will not have been ${gerund} as expected.`, `will ${subject.question} have been ${gerund} as expected?`, `won't ${subject.question} have been ${gerund} as expected?`),
    simpleConditional: forms(`${subject.label} would need to ${action}.`, `${subject.label} would not need to ${action}.`, `would ${subject.question} need to ${action}?`, `wouldn't ${subject.question} need to ${action}?`),
    continuousConditional: forms(`${subject.label} would need to be ${gerund}.`, `${subject.label} would not need to be ${gerund}.`, `would ${subject.question} need to be ${gerund}?`, `wouldn't ${subject.question} need to be ${gerund}?`),
    perfectConditional: forms(`${subject.label} would have needed to ${action}.`, `${subject.label} would not have needed to ${action}.`, `would ${subject.question} have needed to ${action}?`, `wouldn't ${subject.question} have needed to ${action}?`),
    perfectContinuousConditional: forms(`${subject.label} would have needed to be ${gerund}.`, `${subject.label} would not have needed to be ${gerund}.`, `would ${subject.question} have needed to be ${gerund}?`, `wouldn't ${subject.question} have needed to be ${gerund}?`)
  };

  return templates[tenseId];
}

function forms(affirmative, negative, questionPositive, questionNegative) {
  return { affirmative, negative, questionPositive, questionNegative };
}

function buildUsageNote(verb, tenseId, learnerLanguage) {
  return getLearnerUsageNote(verb, tenseId, learnerLanguage);
}

function expandContractions(formSet) {
  // Used for the Basic level, where explicit "not" is easier to understand.
  return {
    affirmative: formSet.affirmative,
    negative: expandNegativeStatement(formSet.negative),
    questionPositive: formSet.questionPositive,
    questionNegative: expandNegativeQuestion(formSet.questionNegative)
  };
}

function expandNegativeStatement(text) {
  return text
    .replace(/\bdoesn't\b/gi, "does not")
    .replace(/\bdon't\b/gi, "do not")
    .replace(/\bdidn't\b/gi, "did not")
    .replace(/\bwon't\b/gi, "will not")
    .replace(/\bcan't\b/gi, "cannot")
    .replace(/\bcouldn't\b/gi, "could not")
    .replace(/\bshouldn't\b/gi, "should not")
    .replace(/\bwouldn't\b/gi, "would not")
    .replace(/\bhadn't\b/gi, "had not");
}

function expandNegativeQuestion(text) {
  return text.replace(
    /^(doesn't|don't|didn't|won't|can't|couldn't|shouldn't|wouldn't|hadn't)\s+(\S+)/i,
    (_, contraction, subject) => `${expandedQuestionAux(contraction)} ${subject} not`
  );
}

function expandedQuestionAux(contraction) {
  const auxiliaries = {
    "doesn't": "does",
    "don't": "do",
    "didn't": "did",
    "won't": "will",
    "can't": "can",
    "couldn't": "could",
    "shouldn't": "should",
    "wouldn't": "would",
    "hadn't": "had"
  };

  return auxiliaries[contraction.toLowerCase()] || contraction;
}

function buildSentenceTranslations(_forms, verb, subject, tense, learnerLanguage) {
  return {
    affirmative: buildSentenceTranslation(verb, subject, tense, "affirmative", learnerLanguage),
    negative: buildSentenceTranslation(verb, subject, tense, "negative", learnerLanguage),
    questionPositive: buildSentenceTranslation(verb, subject, tense, "questionPositive", learnerLanguage),
    questionNegative: buildSentenceTranslation(verb, subject, tense, "questionNegative", learnerLanguage)
  };
}

function buildSentenceTranslation(verb, subject, tense, form, learnerLanguage) {
  return translateLearnerSentence(verb, subject, tense.id, form, learnerLanguage);
}

function buildSentenceParts(text, subject, sentenceKind) {
  const cleaned = text.replace(/[.?]$/g, "");
  const tokens = cleaned.split(/\s+/).filter(Boolean);
  const subjectIndex = sentenceKind === "question" ? findQuestionSubjectIndex(tokens, subject) : 0;

  return tokens.map((token, index) => ({
    text: token,
    role: sentencePartRole(token, index, subjectIndex)
  }));
}

function findQuestionSubjectIndex(tokens, subject) {
  const target = subject.question.toLowerCase();
  const index = tokens.findIndex((token) => token.toLowerCase() === target);
  return index >= 0 ? index : 1;
}

function sentencePartRole(token, index, subjectIndex) {
  const normalized = token.toLowerCase();
  const auxiliaries = new Set([
    "am",
    "are",
    "is",
    "was",
    "were",
    "be",
    "being",
    "been",
    "do",
    "does",
    "did",
    "have",
    "has",
    "had",
    "will",
    "would",
    "can",
    "could",
    "should",
    "cannot",
    "don't",
    "doesn't",
    "didn't",
    "won't",
    "wouldn't",
    "can't",
    "couldn't",
    "shouldn't",
    "hadn't"
  ]);

  if (index === subjectIndex) return "subject";
  if (normalized === "not") return "not";
  if (auxiliaries.has(normalized)) return "auxiliary";
  if (index > subjectIndex && !auxiliaries.has(normalized)) return "verb";
  return "complement";
}

function appendObject(object) {
  return object ? ` ${object}` : "";
}

function normalizePrincipalPart(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z]/g, "")
    .trim();
}

function regularPastForm(base) {
  if (base.endsWith("e")) return `${base}d`;
  if (/[bcdfghjklmnpqrstvwxyz]y$/i.test(base)) return `${base.slice(0, -1)}ied`;
  return `${base}ed`;
}

function getActionBase(verb) {
  // Modal entries can define action* fields so phrases like "can speak English"
  // become "have been able to speak English" instead of awkward raw modal forms.
  return verb.actionBase || verb.object || verb.base;
}

function getActionParticiple(verb) {
  return verb.actionParticiple || verb.participle || getActionBase(verb);
}

function getActionGerund(verb) {
  return verb.actionGerund || verb.gerund || getActionBase(verb);
}

function modalNot(modal) {
  return modal === "can" ? "cannot" : `${modal} not`;
}

function modalNegativeQuestion(modal) {
  return modal === "can" ? "can't" : `${modal}n't`;
}

function sentenceCase(text) {
  const compact = text.replace(/\s+/g, " ").trim();
  return compact.charAt(0).toUpperCase() + compact.slice(1);
}

function capitalize(text) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}
