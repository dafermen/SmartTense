const SUBJECT_ORDER = ["i", "you", "he", "she", "it", "we", "they"];

const FRENCH_SUBJECTS = {
  i: "je",
  you: "tu / vous",
  he: "il",
  she: "elle",
  it: "ce",
  we: "nous",
  they: "ils / elles"
};

const FRENCH_MEANINGS = {
  be: "être",
  do: "faire",
  have: "avoir",
  write: "écrire",
  go: "aller",
  take: "prendre",
  make: "faire",
  get: "obtenir / recevoir",
  give: "donner",
  think: "penser",
  know: "savoir / connaître",
  say: "dire",
  tell: "dire / raconter",
  speak: "parler",
  want: "vouloir",
  see: "voir",
  look: "regarder",
  eat: "manger",
  drink: "boire",
  sing: "chanter",
  read: "lire",
  buy: "acheter",
  find: "trouver",
  study: "étudier",
  learn: "apprendre",
  can: "pouvoir",
  should: "devoir"
};

const FRENCH_OBJECTS = {
  be: "prudent / prudente",
  write: "un message",
  do: "les devoirs",
  have: "un plan",
  speak: "anglais",
  can: "parler anglais",
  should: "étudier aujourd'hui",
  study: "l'anglais",
  learn: "de nouveaux mots"
};

const FRENCH_PRESENT_FORMS = {
  write: ["écris", "écris", "écrit", "écrit", "est", "écrivons", "écrivent"],
  do: ["fais", "fais", "fait", "fait", "fait", "faisons", "font"],
  have: ["ai", "as", "a", "a", "a", "avons", "ont"],
  go: ["vais", "vas", "va", "va", "va", "allons", "vont"],
  speak: ["parle", "parles", "parle", "parle", "parle", "parlons", "parlent"],
  study: ["étudie", "étudies", "étudie", "étudie", "étudie", "étudions", "étudient"],
  learn: ["apprends", "apprends", "apprend", "apprend", "apprend", "apprenons", "apprennent"]
};

const FRENCH_BE = {
  present: ["suis", "es", "est", "est", "est", "sommes", "sont"],
  past: ["étais", "étais", "était", "était", "était", "étions", "étaient"],
  future: ["serai", "seras", "sera", "sera", "sera", "serons", "seront"],
  conditional: ["serais", "serais", "serait", "serait", "serait", "serions", "seraient"],
  perfect: ["ai été", "as été", "a été", "a été", "a été", "avons été", "ont été"],
  pastPerfect: ["avais été", "avais été", "avait été", "avait été", "avait été", "avions été", "avaient été"],
  futurePerfect: ["aurai été", "auras été", "aura été", "aura été", "aura été", "aurons été", "auront été"],
  conditionalPerfect: ["aurais été", "aurais été", "aurait été", "aurait été", "aurait été", "aurions été", "auraient été"]
};

export const frenchLearnerLanguage = {
  id: "fr",
  getMeaning: (verb) => localizedValue(verb, "meanings", "fr") || FRENCH_MEANINGS[verb.id] || verb.base,
  getObject: (verb) => localizedValue(verb, "objects", "fr") || FRENCH_OBJECTS[verb.id] || verb.object || "",
  getUsageNote,
  translateSentence
};

function translateSentence(verb, subject, tenseId, form) {
  if (verb.type === "be") return translateBeSentence(verb, subject, tenseId, form);
  if (verb.type === "modal") return translateModalSentence(verb, subject, tenseId, form);
  return translateVerbSentence(verb, subject, tenseId, form);
}

function getUsageNote(verb, tenseId) {
  const uncommonBePerfectContinuous = new Set([
    "presentPerfectContinuous",
    "pastPerfectContinuous",
    "futurePerfectContinuous",
    "perfectContinuousConditional"
  ]);

  if (verb.type !== "be" || !uncommonBePerfectContinuous.has(tenseId)) return "";
  return "Peu courant avec to be; la forme parfaite ou un verbe d'action semble généralement plus naturel.";
}

function translateBeSentence(verb, subject, tenseId, form) {
  const subjectFr = frenchSubject(subject);
  const phrase = `${bePhrase(subject.id, tenseId)} ${frenchLearnerLanguage.getObject(verb)}`;
  return finishFrenchSentence(subjectFr, phrase, form);
}

function translateModalSentence(verb, subject, tenseId, form) {
  const subjectFr = frenchSubject(subject);
  const action = frenchLearnerLanguage.getObject(verb);
  const modal = verb.id === "can" ? frenchCan(subject.id, tenseId) : frenchShould(subject.id, tenseId);
  return finishFrenchSentence(subjectFr, joinFrenchPhrase(modal, action), form);
}

function translateVerbSentence(verb, subject, tenseId, form) {
  const subjectFr = frenchSubject(subject);
  const phrase = verbPhrase(verb, subject.id, tenseId);
  return finishFrenchSentence(subjectFr, phrase, form);
}

function verbPhrase(verb, subjectId, tenseId) {
  const object = frenchLearnerLanguage.getObject(verb);
  const infinitive = frenchLearnerLanguage.getMeaning(verb).split(" / ")[0];
  const index = subjectIndex(subjectId);
  const normalizedTense = tenseId.toLowerCase();
  const present = FRENCH_PRESENT_FORMS[verb.id]?.[index] || infinitive;

  if (normalizedTense.includes("perfect")) return joinFrenchPhrase("ai déjà", infinitive, object);
  if (normalizedTense.includes("continuous")) return joinFrenchPhrase(bePhrase(subjectId, "simplePresent"), "en train de", infinitive, object);
  if (normalizedTense.startsWith("past")) return joinFrenchPhrase("ai", infinitive, object);
  if (normalizedTense.startsWith("future")) return joinFrenchPhrase("vais", infinitive, object);
  if (normalizedTense.includes("conditional")) return joinFrenchPhrase("voudrais", infinitive, object);
  return joinFrenchPhrase(present, object);
}

function finishFrenchSentence(subjectFr, phrase, form) {
  if (form === "negative") return sentenceWithPunctuation(`${subjectFr.display} ne ${phrase} pas`, ".");
  if (form === "questionPositive") return sentenceWithPunctuation(`Est-ce que ${subjectFr.label} ${phrase}`, "?");
  if (form === "questionNegative") return sentenceWithPunctuation(`Est-ce que ${subjectFr.label} ne ${phrase} pas`, "?");
  return sentenceWithPunctuation(`${subjectFr.display} ${phrase}`, ".");
}

function bePhrase(subjectId, tenseId) {
  const normalizedTense = tenseId.toLowerCase();
  const index = subjectIndex(subjectId);

  if (normalizedTense.includes("perfect") && normalizedTense.startsWith("past")) return FRENCH_BE.pastPerfect[index];
  if (normalizedTense.includes("perfect") && normalizedTense.startsWith("future")) return FRENCH_BE.futurePerfect[index];
  if (normalizedTense.includes("perfect") && normalizedTense.includes("conditional")) return FRENCH_BE.conditionalPerfect[index];
  if (normalizedTense.includes("perfect")) return FRENCH_BE.perfect[index];
  if (normalizedTense.startsWith("past")) return FRENCH_BE.past[index];
  if (normalizedTense.startsWith("future")) return FRENCH_BE.future[index];
  if (normalizedTense.includes("conditional")) return FRENCH_BE.conditional[index];
  return FRENCH_BE.present[index];
}

function frenchCan(subjectId, tenseId) {
  const forms = ["peux", "peux", "peut", "peut", "peut", "pouvons", "peuvent"];
  if (tenseId.toLowerCase().startsWith("past")) return "pouvais";
  return forms[subjectIndex(subjectId)];
}

function frenchShould(subjectId, tenseId) {
  const forms = ["dois", "dois", "doit", "doit", "doit", "devons", "doivent"];
  if (tenseId.toLowerCase().includes("conditional")) return "devrais";
  return forms[subjectIndex(subjectId)];
}

function frenchSubject(subject) {
  const label = FRENCH_SUBJECTS[subject.id] || subject.label.toLowerCase();
  return { label, display: capitalize(label.split("/")[0].trim()) };
}

function subjectIndex(subjectId) {
  const index = SUBJECT_ORDER.indexOf(subjectId);
  return index >= 0 ? index : 0;
}

function localizedValue(verb, mapKey, languageId) {
  return verb[mapKey]?.[languageId] || "";
}

function joinFrenchPhrase(...parts) {
  return parts.filter(Boolean).join(" ").replace(/\s+/g, " ").trim();
}

function sentenceWithPunctuation(text, punctuation) {
  return `${text.replace(/\s+/g, " ").trim()}${punctuation}`;
}

function capitalize(value) {
  return `${value.charAt(0).toUpperCase()}${value.slice(1)}`;
}
