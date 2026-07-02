import { frenchLearnerLanguage } from "./fr.js";
import { spanishLearnerLanguage } from "./es.js";

export const SUPPORTED_LEARNER_LANGUAGES = [
  { id: "es", label: "Español", guideLabel: { en: "Spanish guide", es: "Guía en español" } },
  { id: "fr", label: "Français", guideLabel: { en: "French guide", es: "Guía en francés" } }
];

const LEARNER_LANGUAGES = {
  es: spanishLearnerLanguage,
  fr: frenchLearnerLanguage
};

export function getLearnerLanguage(languageId = "es") {
  return LEARNER_LANGUAGES[languageId] || LEARNER_LANGUAGES.es;
}

export function getLearnerMeaning(verb, learnerLanguage = "es") {
  const language = getLearnerLanguage(learnerLanguage);
  return language.getMeaning(verb);
}

export function getLearnerObject(verb, learnerLanguage = "es") {
  const language = getLearnerLanguage(learnerLanguage);
  return language.getObject(verb);
}

export function translateLearnerSentence(verb, subject, tenseId, form, learnerLanguage = "es") {
  const language = getLearnerLanguage(learnerLanguage);
  return language.translateSentence(verb, subject, tenseId, form);
}

export function getLearnerUsageNote(verb, tenseId, learnerLanguage = "es") {
  const language = getLearnerLanguage(learnerLanguage);
  return language.getUsageNote(verb, tenseId);
}
