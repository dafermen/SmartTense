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

const SPANISH_CONTEXTUAL_TRANSLATIONS = {
  ask: { meaning: "hacer" },
  answer: { object: "al correo" },
  catch: { meaning: "alcanzar" },
  decide: { meaning: "decidir sobre" },
  eat: { meaning: "desayunar", object: "" },
  feel: { meaning: "sentirse" },
  give: { meaning: "brindar" },
  grow: { meaning: "cultivar" },
  hold: { meaning: "realizar" },
  leave: { object: "de la casa" },
  make: { meaning: "tomar" },
  meet: { object: "a un amigo" },
  move: { meaning: "mudarse" },
  order: { meaning: "pedir" },
  spend: { meaning: "pasar" },
  stand: { object: "en la fila" }
};

const SPANISH_OVERRIDE_SPECS = {
  abrir: { participle: "abierto" },
  caer: { present: "caigo|caes|cae|cae|cae|caemos|caen", past: "caí|caíste|cayó|cayó|cayó|caímos|cayeron", gerund: "cayendo", participle: "caído" },
  cerrar: { present: "cierro|cierras|cierra|cierra|cierra|cerramos|cierran" },
  conducir: { present: "conduzco|conduces|conduce|conduce|conduce|conducimos|conducen", past: "conduje|condujiste|condujo|condujo|condujo|condujimos|condujeron" },
  conocer: { present: "conozco|conoces|conoce|conoce|conoce|conocemos|conocen" },
  construir: { present: "construyo|construyes|construye|construye|construye|construimos|construyen", past: "construí|construiste|construyó|construyó|construyó|construimos|construyeron", gerund: "construyendo" },
  convertir: { present: "convierto|conviertes|convierte|convierte|convierte|convertimos|convierten", past: "convertí|convertiste|convirtió|convirtió|convirtió|convertimos|convirtieron", gerund: "convirtiendo" },
  crecer: { present: "crezco|creces|crece|crece|crece|crecemos|crecen" },
  creer: { past: "creí|creíste|creyó|creyó|creyó|creímos|creyeron", gerund: "creyendo", participle: "creído" },
  dormir: { present: "duermo|duermes|duerme|duerme|duerme|dormimos|duermen", past: "dormí|dormiste|durmió|durmió|durmió|dormimos|durmieron", gerund: "durmiendo" },
  elegir: { present: "elijo|eliges|elige|elige|elige|elegimos|eligen", past: "elegí|elegiste|eligió|eligió|eligió|elegimos|eligieron", gerund: "eligiendo" },
  empezar: { present: "empiezo|empiezas|empieza|empieza|empieza|empezamos|empiezan" },
  estar: { present: "estoy|estás|está|está|está|estamos|están", past: "estuve|estuviste|estuvo|estuvo|estuvo|estuvimos|estuvieron", gerund: "estando", participle: "estado" },
  jugar: { present: "juego|juegas|juega|juega|juega|jugamos|juegan" },
  mantener: { present: "mantengo|mantienes|mantiene|mantiene|mantiene|mantenemos|mantienen", past: "mantuve|mantuviste|mantuvo|mantuvo|mantuvo|mantuvimos|mantuvieron", futureStem: "mantendr" },
  mostrar: { present: "muestro|muestras|muestra|muestra|muestra|mostramos|muestran" },
  mover: { present: "muevo|mueves|mueve|mueve|mueve|movemos|mueven" },
  oír: { present: "oigo|oyes|oye|oye|oye|oímos|oyen", past: "oí|oíste|oyó|oyó|oyó|oímos|oyeron", futureStem: "oir", gerund: "oyendo", participle: "oído" },
  ofrecer: { present: "ofrezco|ofreces|ofrece|ofrece|ofrece|ofrecemos|ofrecen" },
  pedir: { present: "pido|pides|pide|pide|pide|pedimos|piden", past: "pedí|pediste|pidió|pidió|pidió|pedimos|pidieron", gerund: "pidiendo" },
  perder: { present: "pierdo|pierdes|pierde|pierde|pierde|perdemos|pierden" },
  poner: { present: "pongo|pones|pone|pone|pone|ponemos|ponen", past: "puse|pusiste|puso|puso|puso|pusimos|pusieron", futureStem: "pondr", gerund: "poniendo", participle: "puesto" },
  recordar: { present: "recuerdo|recuerdas|recuerda|recuerda|recuerda|recordamos|recuerdan" },
  romper: { participle: "roto" },
  salir: { present: "salgo|sales|sale|sale|sale|salimos|salen", futureStem: "saldr" },
  seguir: { present: "sigo|sigues|sigue|sigue|sigue|seguimos|siguen", past: "seguí|seguiste|siguió|siguió|siguió|seguimos|siguieron", gerund: "siguiendo" },
  sentar: { present: "siento|sientas|sienta|sienta|sienta|sentamos|sientan" },
  sentir: { present: "siento|sientes|siente|siente|siente|sentimos|sienten", past: "sentí|sentiste|sintió|sintió|sintió|sentimos|sintieron", gerund: "sintiendo" },
  sostener: { present: "sostengo|sostienes|sostiene|sostiene|sostiene|sostenemos|sostienen", past: "sostuve|sostuviste|sostuvo|sostuvo|sostuvo|sostuvimos|sostuvieron", futureStem: "sostendr" },
  traer: { present: "traigo|traes|trae|trae|trae|traemos|traen", past: "traje|trajiste|trajo|trajo|trajo|trajimos|trajeron", gerund: "trayendo", participle: "traído" },
  venir: { present: "vengo|vienes|viene|viene|viene|venimos|vienen", past: "vine|viniste|vino|vino|vino|vinimos|vinieron", futureStem: "vendr", gerund: "viniendo" }
};

const SPANISH_REFLEXIVE_PRONOUNS = ["me", "te", "se", "se", "se", "nos", "se"];
const SPANISH_FUTURE_ENDINGS = ["é", "ás", "á", "á", "á", "emos", "án"];
const SPANISH_CONDITIONAL_ENDINGS = ["ía", "ías", "ía", "ía", "ía", "íamos", "ían"];

function buildSpanishFormsFromVerb(verb) {
  const meaning = (SPANISH_CONTEXTUAL_TRANSLATIONS[verb.id]?.meaning || spanishLearnerLanguage.getMeaning(verb)).split("/")[0].trim();
  const parts = meaning.split(/\s+/);
  const rawInfinitive = parts.shift() || "";
  const reflexive = rawInfinitive.endsWith("se");
  const infinitive = reflexive ? rawInfinitive.slice(0, -2) : rawInfinitive;
  if (!/(ar|er|ir|ír)$/.test(infinitive)) return null;
  const forms = buildRegularSpanishForms(infinitive);
  const spec = SPANISH_OVERRIDE_SPECS[infinitive] || {};
  for (const key of ["present", "past"]) if (spec[key]) forms[key] = spec[key].split("|");
  for (const key of ["gerund", "participle"]) if (spec[key]) forms[key] = spec[key];
  const futureStem = spec.futureStem || infinitive;
  forms.future = SPANISH_FUTURE_ENDINGS.map((ending) => futureStem + ending);
  forms.conditional = SPANISH_CONDITIONAL_ENDINGS.map((ending) => futureStem + ending);
  forms.reflexive = reflexive;
  forms.suffix = parts.join(" ");
  return forms;
}

function buildRegularSpanishForms(infinitive) {
  const ending = infinitive.endsWith("ír") ? "ir" : infinitive.slice(-2);
  const stem = infinitive.slice(0, -2);
  const presentEndings = ending === "ar" ? ["o", "as", "a", "a", "a", "amos", "an"] : ending === "er" ? ["o", "es", "e", "e", "e", "emos", "en"] : ["o", "es", "e", "e", "e", "imos", "en"];
  const pastEndings = ending === "ar" ? ["é", "aste", "ó", "ó", "ó", "amos", "aron"] : ["í", "iste", "ió", "ió", "ió", "imos", "ieron"];
  const past = pastEndings.map((value) => stem + value);
  if (ending === "ar" && infinitive.endsWith("car")) past[0] = stem.slice(0, -1) + "qué";
  if (ending === "ar" && infinitive.endsWith("gar")) past[0] = stem + "ué";
  if (ending === "ar" && infinitive.endsWith("zar")) past[0] = stem.slice(0, -1) + "cé";
  return {
    present: presentEndings.map((value) => stem + value),
    past,
    future: SPANISH_FUTURE_ENDINGS.map((value) => infinitive + value),
    conditional: SPANISH_CONDITIONAL_ENDINGS.map((value) => infinitive + value),
    gerund: stem + (ending === "ar" ? "ando" : "iendo"),
    participle: stem + (ending === "ar" ? "ado" : "ido")
  };
}

function reflexiveGerund(gerund, pronoun) {
  if (gerund.endsWith("ando")) return gerund.slice(0, -4) + "ándo" + pronoun;
  if (gerund.endsWith("iendo")) return gerund.slice(0, -5) + "iéndo" + pronoun;
  return gerund + pronoun;
}

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
  const context = SPANISH_CONTEXTUAL_TRANSLATIONS[verb.id] || {};
  const data = context.meaning ? buildSpanishFormsFromVerb(verb) : SPANISH_VERB_FORMS[verb.id] || buildSpanishFormsFromVerb(verb);
  if (!data) return [spanishLearnerLanguage.getMeaning(verb), spanishLearnerLanguage.getObject(verb) || verb.object].filter(Boolean).join(" ");
  const object = Object.prototype.hasOwnProperty.call(context, "object") ? context.object : spanishLearnerLanguage.getObject(verb) || verb.object || "";
  const index = subjectIndex(subjectId);
  const normalizedTense = tenseId.toLowerCase();
  const pronoun = data.reflexive ? SPANISH_REFLEXIVE_PRONOUNS[index] : "";
  const simplePhrase = (tense) => joinSpanishPhrase(pronoun, data[tense][index], data.suffix, object);
  const continuousPhrase = (tense) => joinSpanishPhrase(SPANISH_AUXILIARIES.estar[tense][index], data.reflexive ? reflexiveGerund(data.gerund, pronoun) : data.gerund, data.suffix, object);
  const perfectPhrase = (tense) => joinSpanishPhrase(pronoun, SPANISH_AUXILIARIES.haber[tense][index], data.participle, data.suffix, object);
  const perfectContinuousPhrase = (tense) => joinSpanishPhrase(pronoun, SPANISH_AUXILIARIES.haber[tense][index], "estado", data.gerund, data.suffix, object);
  if (normalizedTense.includes("perfect") && normalizedTense.includes("continuous") && normalizedTense.includes("past")) return perfectContinuousPhrase("past");
  if (normalizedTense.includes("perfect") && normalizedTense.includes("continuous") && normalizedTense.includes("future")) return perfectContinuousPhrase("future");
  if (normalizedTense.includes("perfect") && normalizedTense.includes("continuous") && normalizedTense.includes("conditional")) return perfectContinuousPhrase("conditional");
  if (normalizedTense.includes("perfect") && normalizedTense.includes("continuous")) return perfectContinuousPhrase("present");
  if (normalizedTense.includes("perfect") && normalizedTense.includes("past")) return perfectPhrase("past");
  if (normalizedTense.includes("perfect") && normalizedTense.includes("future")) return perfectPhrase("future");
  if (normalizedTense.includes("perfect") && normalizedTense.includes("conditional")) return perfectPhrase("conditional");
  if (normalizedTense.includes("perfect")) return perfectPhrase("present");
  if (normalizedTense.includes("continuous") && normalizedTense.includes("past")) return continuousPhrase("past");
  if (normalizedTense.includes("continuous") && normalizedTense.includes("future")) return continuousPhrase("future");
  if (normalizedTense.includes("continuous") && normalizedTense.includes("conditional")) return continuousPhrase("conditional");
  if (normalizedTense.includes("continuous")) return continuousPhrase("present");
  if (normalizedTense.includes("past")) return simplePhrase("past");
  if (normalizedTense.includes("future")) return simplePhrase("future");
  if (normalizedTense.includes("conditional")) return simplePhrase("conditional");
  return simplePhrase("present");
}

function spanishModalPhrase(data, subjectId, tenseId, action) {
  const index = subjectIndex(subjectId);
  const normalizedTense = tenseId.toLowerCase();
  const simplePhrase = (tense) => joinSpanishPhrase(data[tense][index], action);
  const perfectPhrase = (tense) => joinSpanishPhrase(`${SPANISH_AUXILIARIES.haber[tense][index]} ${data.participle}`, action);

  if (normalizedTense.includes("perfect") && normalizedTense.includes("past")) return perfectPhrase("past");
  if (normalizedTense.includes("perfect") && normalizedTense.includes("future")) return perfectPhrase("future");
  if (normalizedTense.includes("perfect") && normalizedTense.includes("conditional")) return perfectPhrase("conditional");
  if (normalizedTense.includes("perfect")) return perfectPhrase("present");
  if (normalizedTense.includes("past")) return simplePhrase("past");
  if (normalizedTense.includes("future")) return simplePhrase("future");
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

  if (normalizedTense.includes("perfect") && normalizedTense.includes("continuous") && normalizedTense.includes("past")) return perfectContinuous("past");
  if (normalizedTense.includes("perfect") && normalizedTense.includes("continuous") && normalizedTense.includes("future")) return perfectContinuous("future");
  if (normalizedTense.includes("perfect") && normalizedTense.includes("continuous") && normalizedTense.includes("conditional")) return perfectContinuous("conditional");
  if (normalizedTense.includes("perfect") && normalizedTense.includes("continuous")) return perfectContinuous("present");
  if (normalizedTense.includes("perfect") && normalizedTense.includes("past")) return forms.pastPerfect;
  if (normalizedTense.includes("perfect") && normalizedTense.includes("future")) return forms.futurePerfect;
  if (normalizedTense.includes("perfect") && normalizedTense.includes("conditional")) return forms.conditionalPerfect;
  if (normalizedTense.includes("perfect")) return forms.perfect;
  if (normalizedTense.includes("past")) return forms.past;
  if (normalizedTense.includes("future")) return forms.future;
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
