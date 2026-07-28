const { readFileSync, writeFileSync } = require("node:fs");
const { resolve } = require("node:path");

const contentPath = resolve(__dirname, "../public/data/learningUnits.json");
const content = JSON.parse(readFileSync(contentPath, "utf8"));

const methodology = {
  "past-future-conditional-foundation": {
    learnerContext: ["work deadlines and project changes", "travel plans", "hypothetical decisions"],
    pronunciationDrills: [
      {
        id: "b1-time-sequence-pronunciation",
        text: "By the time the meeting started, we had finished the report.",
        focus: "Stress the two time references",
        note: "Pause lightly after started and keep had unstressed."
      },
      {
        id: "b1-conditional-pronunciation",
        text: "If I had more time, I would improve the documentation.",
        focus: "Use a clear pause between condition and result",
        note: "Stress time and improve."
      }
    ],
    productionTask: {
      prompt: "Explain a completed event, a future plan, and one hypothetical alternative connected to your work or daily life.",
      requiredStructures: ["one past perfect sequence", "one future form", "one conditional sentence"],
      checklist: ["Use a time marker in each idea.", "Check the auxiliary before the main verb.", "Read the three ideas aloud with clear pauses."]
    }
  },
  "b1-narratives-plans-problems": {
    learnerContext: ["telling a personal story", "explaining a work problem", "agreeing on a practical plan"],
    pronunciationDrills: [
      {
        id: "b1-narrative-pronunciation",
        text: "I was checking the system when the connection suddenly failed.",
        focus: "Stress the interrupting event",
        note: "Say was checking smoothly and emphasize suddenly failed."
      },
      {
        id: "b1-plan-pronunciation",
        text: "We are going to review the issue before we make a decision.",
        focus: "Group the plan into two thought units",
        note: "Pause lightly before before."
      }
    ],
    productionTask: {
      prompt: "Tell a short story about a problem, explain what was happening, and describe the plan you made afterward.",
      requiredStructures: ["past simple and past continuous", "at least two sequence connectors", "one future plan"],
      checklist: ["Make the order of events clear.", "Include the result of the problem.", "Speak for about one minute after writing notes."]
    }
  },
  "b2-mixed-tenses-independent-production": {
    learnerContext: ["professional reports", "complex decisions", "summarizing what other people said"],
    pronunciationDrills: [
      {
        id: "b2-reporting-pronunciation",
        text: "She explained that the client had already approved the proposal.",
        focus: "Keep the reporting clause lighter than the key message",
        note: "Stress client, approved, and proposal."
      },
      {
        id: "b2-passive-pronunciation",
        text: "The final decision will be announced after the review has been completed.",
        focus: "Maintain rhythm across two passive verb groups",
        note: "Repeat will be announced and has been completed separately first."
      }
    ],
    productionTask: {
      prompt: "Write or record a concise professional update that reports prior information, describes a result, and recommends a next step.",
      requiredStructures: ["one reported statement", "one passive structure", "accurate contrast between at least three tenses"],
      checklist: ["Use connectors to show cause and sequence.", "Check tense consistency across the whole response.", "Revise one sentence for clarity before finishing."]
    }
  }
};

for (const [unitId, fields] of Object.entries(methodology)) {
  const unit = content.units.find((entry) => entry.id === unitId);
  if (!unit) throw new Error(`Missing unit: ${unitId}`);
  Object.assign(unit, fields);
}

writeFileSync(contentPath, `${JSON.stringify(content, null, 2)}\r\n`, "utf8");
console.log("B1 and B2 Guided Lesson methodology was activated.");
