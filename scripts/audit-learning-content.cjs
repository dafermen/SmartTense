const { readFile } = require("node:fs/promises");
const { resolve } = require("node:path");

async function main() {
  const [{ auditLearningContent, formatContentAudit }, source] = await Promise.all([
    import("../src/data/contentQuality.js"),
    readFile(resolve(__dirname, "../public/data/learningUnits.json"), "utf8")
  ]);
  const content = JSON.parse(source);
  const report = auditLearningContent(content, { levels: ["A1", "A2", "B1", "B2"] });

  console.log(formatContentAudit(report));
  if (report.errors.length > 0) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(`Content audit could not run: ${error.message}`);
  process.exitCode = 1;
});
