const fs = require("fs");
const path = require("path");
const { pathToFileURL } = require("url");

const EXPECTED = {
  ask: "Ella hace una pregunta.",
  catch: "Ella alcanza el bus.",
  decide: "Ella decide sobre una soluci\u00f3n.",
  feel: "Ella se siente mejor.",
  grow: "Ella cultiva vegetales.",
  hold: "Ella realiza una reuni\u00f3n.",
  make: "Ella toma una decisi\u00f3n.",
  order: "Ella pide el almuerzo.",
  spend: "Ella pasa tiempo con la familia.",
  work: "Ella trabaja desde casa."
};

(async () => {
  const project = path.resolve(__dirname, "..");
  const { buildRows } = await import(pathToFileURL(path.join(project, "src", "conjugation.js")).href);
  const { SUBJECTS, TENSES } = await import(pathToFileURL(path.join(project, "src", "data", "defaultData.js")).href);
  const data = JSON.parse(fs.readFileSync(path.join(project, "public", "data", "verbs.json"), "utf8"));
  const subject = SUBJECTS.find((item) => item.id === "she");
  const tenseIds = ["simplePresent", "simplePast", "simpleFuture"];
  const tenses = tenseIds.map((id) => TENSES.find((item) => item.id === id));
  const failures = [];

  for (const verb of data.verbs) {
    const rows = buildRows(verb, [subject], tenses, "en", { learnerLanguage: "es", useContractions: false });
    for (const row of rows) {
      for (const [form, translation] of Object.entries(row.translations)) {
        if (!translation || !/[.?]$/.test(translation)) failures.push(verb.id + "." + row.tenseId + "." + form + ": invalid punctuation");
        if (!translation.toLocaleLowerCase("es").includes("ella")) failures.push(verb.id + "." + row.tenseId + "." + form + ": missing learner subject");
      }
    }
    if (verb.type !== "modal" && new Set(rows.map((row) => row.translations.affirmative)).size !== rows.length) failures.push(verb.id + ": present, past and future translations must differ");
    if (EXPECTED[verb.id] && rows[0].translations.affirmative !== EXPECTED[verb.id]) failures.push(verb.id + ': expected "' + EXPECTED[verb.id] + '" but received "' + rows[0].translations.affirmative + '"');
  }

  if (failures.length) {
    console.error("Spanish learner guide audit failed with " + failures.length + " issue(s):");
    failures.forEach((failure) => console.error("- " + failure));
    process.exitCode = 1;
    return;
  }
  console.log("Spanish learner guide audit passed: " + data.verbs.length + " verbs, " + (data.verbs.length * tenses.length * 4) + " translated forms.");
})();

