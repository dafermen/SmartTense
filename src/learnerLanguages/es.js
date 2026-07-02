const SUBJECT_ORDER = ["i", "you", "he", "she", "it", "we", "they"];

const SPANISH_AUXILIARIES = {
  estar: {
    present: ["estoy", "estás", "está", "está", "está", "estamos", "están"],
    past: ["estaba", "estabas", "estaba", "estaba", "estaba", "estábamos", "estaban"],
    future: ["estaré", "estarás", "estará", "estará", "estará", "estaremos", "estarán"],
    conditional: ["estaría", "estarías", "estaría", "estaría", "estaría", "estaríamos", "estarían"]
  },
  haber: {
    present: ["he", "has", "ha", "ha", "ha", "hemos", "han"],
    past: ["había", "habías", "había", "había", "había", "habíamos", "habían"],
    future: ["habré", "habrás", "habrá", "habrá", "habrá", "habremos", "habrán"],
    conditional: ["habría", "habrías", "habría", "habría", "habría", "habríamos", "habrían"]
  }
};

const SPANISH_VERB_FORMS = {
  do: spanishForms(["hago", "haces", "hace", "hace", "hace", "hacemos", "hacen"], ["hice", "hiciste", "hizo", "hizo", "hizo", "hicimos", "hicieron"], ["haré", "harás", "hará", "hará", "hará", "haremos", "harán"], ["haría", "harías", "haría", "haría", "haría", "haríamos", "harían"], "haciendo", "hecho"),
  have: spanishForms(["tengo", "tienes", "tiene", "tiene", "tiene", "tenemos", "tienen"], ["tuve", "tuviste", "tuvo", "tuvo", "tuvo", "tuvimos", "tuvieron"], ["tendré", "tendrás", "tendrá", "tendrá", "tendrá", "tendremos", "tendrán"], ["tendría", "tendrías", "tendría", "tendría", "tendría", "tendríamos", "tendrían"], "teniendo", "tenido"),
  write: spanishForms(["escribo", "escribes", "escribe", "escribe", "escribe", "escribimos", "escriben"], ["escribí", "escribiste", "escribió", "escribió", "escribió", "escribimos", "escribieron"], ["escribiré", "escribirás", "escribirá", "escribirá", "escribirá", "escribiremos", "escribirán"], ["escribiría", "escribirías", "escribiría", "escribiría", "escribiría", "escribiríamos", "escribirían"], "escribiendo", "escrito"),
  go: spanishForms(["voy", "vas", "va", "va", "va", "vamos", "van"], ["fui", "fuiste", "fue", "fue", "fue", "fuimos", "fueron"], ["iré", "irás", "irá", "irá", "irá", "iremos", "irán"], ["iría", "irías", "iría", "iría", "iría", "iríamos", "irían"], "yendo", "ido"),
  take: spanishForms(["tomo", "tomas", "toma", "toma", "toma", "tomamos", "toman"], ["tomé", "tomaste", "tomó", "tomó", "tomó", "tomamos", "tomaron"], ["tomaré", "tomarás", "tomará", "tomará", "tomará", "tomaremos", "tomarán"], ["tomaría", "tomarías", "tomaría", "tomaría", "tomaría", "tomaríamos", "tomarían"], "tomando", "tomado"),
  make: spanishForms(["hago", "haces", "hace", "hace", "hace", "hacemos", "hacen"], ["hice", "hiciste", "hizo", "hizo", "hizo", "hicimos", "hicieron"], ["haré", "harás", "hará", "hará", "hará", "haremos", "harán"], ["haría", "harías", "haría", "haría", "haría", "haríamos", "harían"], "haciendo", "hecho"),
  get: spanishForms(["obtengo", "obtienes", "obtiene", "obtiene", "obtiene", "obtenemos", "obtienen"], ["obtuve", "obtuviste", "obtuvo", "obtuvo", "obtuvo", "obtuvimos", "obtuvieron"], ["obtendré", "obtendrás", "obtendrá", "obtendrá", "obtendrá", "obtendremos", "obtendrán"], ["obtendría", "obtendrías", "obtendría", "obtendría", "obtendría", "obtendríamos", "obtendrían"], "obteniendo", "obtenido"),
  give: spanishForms(["doy", "das", "da", "da", "da", "damos", "dan"], ["di", "diste", "dio", "dio", "dio", "dimos", "dieron"], ["daré", "darás", "dará", "dará", "dará", "daremos", "darán"], ["daría", "darías", "daría", "daría", "daría", "daríamos", "darían"], "dando", "dado"),
  think: spanishForms(["pienso", "piensas", "piensa", "piensa", "piensa", "pensamos", "piensan"], ["pensé", "pensaste", "pensó", "pensó", "pensó", "pensamos", "pensaron"], ["pensaré", "pensarás", "pensará", "pensará", "pensará", "pensaremos", "pensarán"], ["pensaría", "pensarías", "pensaría", "pensaría", "pensaría", "pensaríamos", "pensarían"], "pensando", "pensado"),
  know: spanishForms(["sé", "sabes", "sabe", "sabe", "sabe", "sabemos", "saben"], ["supe", "supiste", "supo", "supo", "supo", "supimos", "supieron"], ["sabré", "sabrás", "sabrá", "sabrá", "sabrá", "sabremos", "sabrán"], ["sabría", "sabrías", "sabría", "sabría", "sabría", "sabríamos", "sabrían"], "sabiendo", "sabido"),
  say: spanishForms(["digo", "dices", "dice", "dice", "dice", "decimos", "dicen"], ["dije", "dijiste", "dijo", "dijo", "dijo", "dijimos", "dijeron"], ["diré", "dirás", "dirá", "dirá", "dirá", "diremos", "dirán"], ["diría", "dirías", "diría", "diría", "diría", "diríamos", "dirían"], "diciendo", "dicho"),
  tell: spanishForms(["cuento", "cuentas", "cuenta", "cuenta", "cuenta", "contamos", "cuentan"], ["conté", "contaste", "contó", "contó", "contó", "contamos", "contaron"], ["contaré", "contarás", "contará", "contará", "contará", "contaremos", "contarán"], ["contaría", "contarías", "contaría", "contaría", "contaría", "contaríamos", "contarían"], "contando", "contado"),
  speak: spanishForms(["hablo", "hablas", "habla", "habla", "habla", "hablamos", "hablan"], ["hablé", "hablaste", "habló", "habló", "habló", "hablamos", "hablaron"], ["hablaré", "hablarás", "hablará", "hablará", "hablará", "hablaremos", "hablarán"], ["hablaría", "hablarías", "hablaría", "hablaría", "hablaría", "hablaríamos", "hablarían"], "hablando", "hablado"),
  want: spanishForms(["quiero", "quieres", "quiere", "quiere", "quiere", "queremos", "quieren"], ["quise", "quisiste", "quiso", "quiso", "quiso", "quisimos", "quisieron"], ["querré", "querrás", "querrá", "querrá", "querrá", "querremos", "querrán"], ["querría", "querrías", "querría", "querría", "querría", "querríamos", "querrían"], "queriendo", "querido"),
  see: spanishForms(["veo", "ves", "ve", "ve", "ve", "vemos", "ven"], ["vi", "viste", "vio", "vio", "vio", "vimos", "vieron"], ["veré", "verás", "verá", "verá", "verá", "veremos", "verán"], ["vería", "verías", "vería", "vería", "vería", "veríamos", "verían"], "viendo", "visto"),
  eat: spanishForms(["como", "comes", "come", "come", "come", "comemos", "comen"], ["comí", "comiste", "comió", "comió", "comió", "comimos", "comieron"], ["comeré", "comerás", "comerá", "comerá", "comerá", "comeremos", "comerán"], ["comería", "comerías", "comería", "comería", "comería", "comeríamos", "comerían"], "comiendo", "comido"),
  drink: spanishForms(["bebo", "bebes", "bebe", "bebe", "bebe", "bebemos", "beben"], ["bebí", "bebiste", "bebió", "bebió", "bebió", "bebimos", "bebieron"], ["beberé", "beberás", "beberá", "beberá", "beberá", "beberemos", "beberán"], ["bebería", "beberías", "bebería", "bebería", "bebería", "beberíamos", "beberían"], "bebiendo", "bebido"),
  sing: spanishForms(["canto", "cantas", "canta", "canta", "canta", "cantamos", "cantan"], ["canté", "cantaste", "cantó", "cantó", "cantó", "cantamos", "cantaron"], ["cantaré", "cantarás", "cantará", "cantará", "cantará", "cantaremos", "cantarán"], ["cantaría", "cantarías", "cantaría", "cantaría", "cantaría", "cantaríamos", "cantarían"], "cantando", "cantado"),
  read: spanishForms(["leo", "lees", "lee", "lee", "lee", "leemos", "leen"], ["leí", "leíste", "leyó", "leyó", "leyó", "leímos", "leyeron"], ["leeré", "leerás", "leerá", "leerá", "leerá", "leeremos", "leerán"], ["leería", "leerías", "leería", "leería", "leería", "leeríamos", "leerían"], "leyendo", "leído"),
  buy: spanishForms(["compro", "compras", "compra", "compra", "compra", "compramos", "compran"], ["compré", "compraste", "compró", "compró", "compró", "compramos", "compraron"], ["compraré", "comprarás", "comprará", "comprará", "comprará", "compraremos", "comprarán"], ["compraría", "comprarías", "compraría", "compraría", "compraría", "compraríamos", "comprarían"], "comprando", "comprado"),
  find: spanishForms(["encuentro", "encuentras", "encuentra", "encuentra", "encuentra", "encontramos", "encuentran"], ["encontré", "encontraste", "encontró", "encontró", "encontró", "encontramos", "encontraron"], ["encontraré", "encontrarás", "encontrará", "encontrará", "encontrará", "encontraremos", "encontrarán"], ["encontraría", "encontrarías", "encontraría", "encontraría", "encontraría", "encontraríamos", "encontrarían"], "encontrando", "encontrado"),
  understand: spanishForms(["entiendo", "entiendes", "entiende", "entiende", "entiende", "entendemos", "entienden"], ["entendí", "entendiste", "entendió", "entendió", "entendió", "entendimos", "entendieron"], ["entenderé", "entenderás", "entenderá", "entenderá", "entenderá", "entenderemos", "entenderán"], ["entendería", "entenderías", "entendería", "entendería", "entendería", "entenderíamos", "entenderían"], "entendiendo", "entendido"),
  study: spanishForms(["estudio", "estudias", "estudia", "estudia", "estudia", "estudiamos", "estudian"], ["estudié", "estudiaste", "estudió", "estudió", "estudió", "estudiamos", "estudiaron"], ["estudiaré", "estudiarás", "estudiará", "estudiará", "estudiará", "estudiaremos", "estudiarán"], ["estudiaría", "estudiarías", "estudiaría", "estudiaría", "estudiaría", "estudiaríamos", "estudiarían"], "estudiando", "estudiado"),
  learn: spanishForms(["aprendo", "aprendes", "aprende", "aprende", "aprende", "aprendemos", "aprenden"], ["aprendí", "aprendiste", "aprendió", "aprendió", "aprendió", "aprendimos", "aprendieron"], ["aprenderé", "aprenderás", "aprenderá", "aprenderá", "aprenderá", "aprenderemos", "aprenderán"], ["aprendería", "aprenderías", "aprendería", "aprendería", "aprendería", "aprenderíamos", "aprenderían"], "aprendiendo", "aprendido")
};

const SPANISH_VERB_ALIASES = {
  look: "see",
  put: "do",
  cut: "do",
  bring: "give",
  teach: "speak",
  feel: "have",
  leave: "go",
  come: "go",
  run: "go",
  begin: "do",
  break: "do",
  choose: "do",
  drive: "go",
  fall: "go",
  forget: "do",
  meet: "see",
  pay: "give",
  sit: "be",
  sleep: "be",
  stand: "be",
  watch: "see",
  play: "do",
  work: "do"
};

export const spanishLearnerLanguage = {
  id: "es",
  getMeaning: (verb) => localizedValue(verb, "meanings", "meaningEs") || verb.base,
  getObject: (verb) => localizedValue(verb, "objects", "objectEs") || "",
  getUsageNote,
  translateSentence
};

function translateSentence(verb, subject, tenseId, form) {
  if (verb.type === "be") return translateBeSentence(verb, subject, tenseId, form);
  if (verb.type === "modal") return translateModalSentence(verb, subject, tenseId, form);
  return translateSpanishVerbSentence(verb, subject, tenseId, form);
}

function getUsageNote(verb, tenseId) {
  const uncommonBePerfectContinuous = new Set([
    "presentPerfectContinuous",
    "pastPerfectContinuous",
    "futurePerfectContinuous",
    "perfectContinuousConditional"
  ]);

  if (verb.type !== "be" || !uncommonBePerfectContinuous.has(tenseId)) return "";
  return "Poco común con to be; suele sonar más natural usar el perfecto o un verbo de acción.";
}

function translateBeSentence(verb, subject, tenseId, form) {
  const subjectEs = spanishSubject(subject);
  const complement = spanishLearnerLanguage.getObject(verb) || verb.object || "";
  const be = spanishBe(subject.id, tenseId);

  if (form === "negative") return sentenceWithPunctuation(`${subjectEs.display} no ${be} ${complement}`, ".");
  if (form === "questionPositive") return sentenceWithPunctuation(`¿${capitalize(be)} ${subjectEs.label} ${complement}`, "?");
  if (form === "questionNegative") return sentenceWithPunctuation(`¿${subjectEs.display} no ${be} ${complement}`, "?");
  return sentenceWithPunctuation(`${subjectEs.display} ${be} ${complement}`, ".");
}

function translateModalSentence(verb, subject, tenseId, form) {
  const subjectEs = spanishSubject(subject);
  const action = spanishLearnerLanguage.getObject(verb) || verb.object || getActionBase(verb);
  const modalForms = {
    can: {
      present: ["puedo", "puedes", "puede", "puede", "puede", "podemos", "pueden"],
      past: ["pude", "pudiste", "pudo", "pudo", "pudo", "pudimos", "pudieron"],
      future: ["podré", "podrás", "podrá", "podrá", "podrá", "podremos", "podrán"],
      conditional: ["podría", "podrías", "podría", "podría", "podría", "podríamos", "podrían"],
      participle: "podido"
    },
    should: {
      present: ["debo", "debes", "debe", "debe", "debe", "debemos", "deben"],
      past: ["debí", "debiste", "debió", "debió", "debió", "debimos", "debieron"],
      future: ["deberé", "deberás", "deberá", "deberá", "deberá", "deberemos", "deberán"],
      conditional: ["debería", "deberías", "debería", "debería", "debería", "deberíamos", "deberían"],
      participle: "debido"
    }
  };
  const data = modalForms[verb.id] || modalForms.should;
  return finishSpanishSentence(subjectEs, spanishModalPhrase(data, subject.id, tenseId, action), form);
}

function translateSpanishVerbSentence(verb, subject, tenseId, form) {
  const subjectEs = spanishSubject(subject);
  const phrase = spanishVerbPhrase(verb, subject.id, tenseId);
  return finishSpanishSentence(subjectEs, phrase, form);
}

function translateApproximateSentence(verb, subject, form) {
  const subjectEs = spanishSubject(subject);
  const action = [spanishLearnerLanguage.getMeaning(verb), spanishLearnerLanguage.getObject(verb) || verb.object].filter(Boolean).join(" ");

  if (form === "negative") return sentenceWithPunctuation(`${subjectEs.display} no ${action}`, ".");
  if (form === "questionPositive") return sentenceWithPunctuation(`¿${subjectEs.display} ${action}`, "?");
  if (form === "questionNegative") return sentenceWithPunctuation(`¿${subjectEs.display} no ${action}`, "?");
  return sentenceWithPunctuation(`${subjectEs.display} ${action}`, ".");
}

function finishSpanishSentence(subjectEs, phrase, form) {
  if (!phrase) return translateApproximateSentence({ base: "", meaningEs: "" }, { es: subjectEs.label, label: subjectEs.display }, form);
  if (form === "negative") return sentenceWithPunctuation(`${subjectEs.display} no ${phrase}`, ".");
  if (form === "questionPositive") return sentenceWithPunctuation(`¿${subjectEs.display} ${phrase}`, "?");
  if (form === "questionNegative") return sentenceWithPunctuation(`¿${subjectEs.display} no ${phrase}`, "?");
  return sentenceWithPunctuation(`${subjectEs.display} ${phrase}`, ".");
}

function spanishVerbPhrase(verb, subjectId, tenseId) {
  const data = SPANISH_VERB_FORMS[verb.id] || SPANISH_VERB_FORMS[SPANISH_VERB_ALIASES[verb.id]];
  if (!data) return [spanishLearnerLanguage.getMeaning(verb), spanishLearnerLanguage.getObject(verb) || verb.object].filter(Boolean).join(" ");

  const object = spanishLearnerLanguage.getObject(verb) || verb.object || "";
  const index = subjectIndex(subjectId);
  const normalizedTense = tenseId.toLowerCase();
  const simplePhrase = (tense) => joinSpanishPhrase(data[tense][index], object);
  const continuousPhrase = (tense) => joinSpanishPhrase(`${SPANISH_AUXILIARIES.estar[tense][index]} ${data.gerund}`, object);
  const perfectPhrase = (tense) => joinSpanishPhrase(`${SPANISH_AUXILIARIES.haber[tense][index]} ${data.participle}`, object);
  const perfectContinuousPhrase = (tense) => joinSpanishPhrase(`${SPANISH_AUXILIARIES.haber[tense][index]} estado ${data.gerund}`, object);

  if (normalizedTense.includes("perfect") && normalizedTense.includes("continuous") && normalizedTense.startsWith("past")) return perfectContinuousPhrase("past");
  if (normalizedTense.includes("perfect") && normalizedTense.includes("continuous") && normalizedTense.startsWith("future")) return perfectContinuousPhrase("future");
  if (normalizedTense.includes("perfect") && normalizedTense.includes("continuous") && normalizedTense.includes("conditional")) return perfectContinuousPhrase("conditional");
  if (normalizedTense.includes("perfect") && normalizedTense.includes("continuous")) return perfectContinuousPhrase("present");
  if (normalizedTense.includes("perfect") && normalizedTense.startsWith("past")) return perfectPhrase("past");
  if (normalizedTense.includes("perfect") && normalizedTense.startsWith("future")) return perfectPhrase("future");
  if (normalizedTense.includes("perfect") && normalizedTense.includes("conditional")) return perfectPhrase("conditional");
  if (normalizedTense.includes("perfect")) return perfectPhrase("present");
  if (normalizedTense.includes("continuous") && normalizedTense.startsWith("past")) return continuousPhrase("past");
  if (normalizedTense.includes("continuous") && normalizedTense.startsWith("future")) return continuousPhrase("future");
  if (normalizedTense.includes("continuous") && normalizedTense.includes("conditional")) return continuousPhrase("conditional");
  if (normalizedTense.includes("continuous")) return continuousPhrase("present");
  if (normalizedTense.startsWith("past")) return simplePhrase("past");
  if (normalizedTense.startsWith("future")) return simplePhrase("future");
  if (normalizedTense.includes("conditional")) return simplePhrase("conditional");
  return simplePhrase("present");
}

function spanishModalPhrase(data, subjectId, tenseId, action) {
  const index = subjectIndex(subjectId);
  const normalizedTense = tenseId.toLowerCase();
  const simplePhrase = (tense) => joinSpanishPhrase(data[tense][index], action);
  const perfectPhrase = (tense) => joinSpanishPhrase(`${SPANISH_AUXILIARIES.haber[tense][index]} ${data.participle}`, action);

  if (normalizedTense.includes("perfect") && normalizedTense.startsWith("past")) return perfectPhrase("past");
  if (normalizedTense.includes("perfect") && normalizedTense.startsWith("future")) return perfectPhrase("future");
  if (normalizedTense.includes("perfect") && normalizedTense.includes("conditional")) return perfectPhrase("conditional");
  if (normalizedTense.includes("perfect")) return perfectPhrase("present");
  if (normalizedTense.startsWith("past")) return simplePhrase("past");
  if (normalizedTense.startsWith("future")) return simplePhrase("future");
  if (normalizedTense.includes("conditional")) return simplePhrase("conditional");
  return simplePhrase("present");
}

function spanishForms(present, past, future, conditional, gerund, participle) {
  return { present, past, future, conditional, gerund, participle };
}

function subjectIndex(subjectId) {
  const index = SUBJECT_ORDER.indexOf(subjectId);
  return index >= 0 ? index : 0;
}

function joinSpanishPhrase(...parts) {
  return parts.filter(Boolean).join(" ").replace(/\s+/g, " ").trim();
}

function spanishSubject(subject) {
  const label = (subject.es || subject.label).split("/")[0].trim();
  return { label, display: capitalize(label) };
}

function spanishBe(subjectId, tenseId) {
  const formsBySubject = {
    i: { present: "soy/estoy", past: "fui/estuve", future: "seré/estaré", conditional: "sería/estaría", perfect: "he sido/estado", pastPerfect: "había sido/estado", futurePerfect: "habré sido/estado", conditionalPerfect: "habría sido/estado" },
    you: { present: "eres/estás", past: "fuiste/estuviste", future: "serás/estarás", conditional: "serías/estarías", perfect: "has sido/estado", pastPerfect: "habías sido/estado", futurePerfect: "habrás sido/estado", conditionalPerfect: "habrías sido/estado" },
    he: { present: "es/está", past: "fue/estuvo", future: "será/estará", conditional: "sería/estaría", perfect: "ha sido/estado", pastPerfect: "había sido/estado", futurePerfect: "habrá sido/estado", conditionalPerfect: "habría sido/estado" },
    she: { present: "es/está", past: "fue/estuvo", future: "será/estará", conditional: "sería/estaría", perfect: "ha sido/estado", pastPerfect: "había sido/estado", futurePerfect: "habrá sido/estado", conditionalPerfect: "habría sido/estado" },
    it: { present: "es/está", past: "fue/estuvo", future: "será/estará", conditional: "sería/estaría", perfect: "ha sido/estado", pastPerfect: "había sido/estado", futurePerfect: "habrá sido/estado", conditionalPerfect: "habría sido/estado" },
    we: { present: "somos/estamos", past: "fuimos/estuvimos", future: "seremos/estaremos", conditional: "seríamos/estaríamos", perfect: "hemos sido/estado", pastPerfect: "habíamos sido/estado", futurePerfect: "habremos sido/estado", conditionalPerfect: "habríamos sido/estado" },
    they: { present: "son/están", past: "fueron/estuvieron", future: "serán/estarán", conditional: "serían/estarían", perfect: "han sido/estado", pastPerfect: "habían sido/estado", futurePerfect: "habrán sido/estado", conditionalPerfect: "habrían sido/estado" }
  };
  const forms = formsBySubject[subjectId] || formsBySubject.i;
  const normalizedTense = tenseId.toLowerCase();
  const perfectContinuous = (tense) => `${SPANISH_AUXILIARIES.haber[tense][subjectIndex(subjectId)]} estado siendo`;

  if (normalizedTense.includes("perfect") && normalizedTense.includes("continuous") && normalizedTense.startsWith("past")) return perfectContinuous("past");
  if (normalizedTense.includes("perfect") && normalizedTense.includes("continuous") && normalizedTense.startsWith("future")) return perfectContinuous("future");
  if (normalizedTense.includes("perfect") && normalizedTense.includes("continuous") && normalizedTense.includes("conditional")) return perfectContinuous("conditional");
  if (normalizedTense.includes("perfect") && normalizedTense.includes("continuous")) return perfectContinuous("present");
  if (normalizedTense.includes("perfect") && normalizedTense.startsWith("past")) return forms.pastPerfect;
  if (normalizedTense.includes("perfect") && normalizedTense.startsWith("future")) return forms.futurePerfect;
  if (normalizedTense.includes("perfect") && normalizedTense.includes("conditional")) return forms.conditionalPerfect;
  if (normalizedTense.includes("perfect")) return forms.perfect;
  if (normalizedTense.startsWith("past")) return forms.past;
  if (normalizedTense.startsWith("future")) return forms.future;
  if (normalizedTense.includes("conditional")) return forms.conditional;
  return forms.present;
}

function localizedValue(verb, mapKey, legacyKey) {
  return verb[mapKey]?.es || verb[legacyKey] || "";
}

function sentenceWithPunctuation(text, punctuation) {
  return `${text.replace(/\s+/g, " ").trim()}${punctuation}`;
}

function getActionBase(verb) {
  return verb.actionBase || verb.object || verb.base;
}

function capitalize(value) {
  return `${value.charAt(0).toUpperCase()}${value.slice(1)}`;
}
