import test from "node:test";
import assert from "node:assert/strict";
import { filterByContext, getUnitContexts, getVocabularyItems } from "../src/learningContexts.js";

test("maps unit context tags to context metadata", () => {
  assert.deepEqual(
    getUnitContexts(
      { contextTags: ["it-work", "daily-habits"] },
      [{ id: "it-work", title: "IT work", description: "Technical work" }]
    ),
    [
      { id: "it-work", title: "IT work", description: "Technical work" },
      { id: "daily-habits", title: "daily-habits", description: "" }
    ]
  );
});

test("filters contextual items while keeping untagged shared items", () => {
  assert.deepEqual(
    filterByContext([
      { id: "one", context: "it-work" },
      { id: "two", context: "daily-habits" },
      { id: "shared" }
    ], "it-work"),
    [{ id: "one", context: "it-work" }, { id: "shared" }]
  );
});

test("extracts vocabulary items by selected context", () => {
  const vocabulary = getVocabularyItems({
    sections: [
      { type: "theory", title: "Meaning", body: ["Read"] },
      {
        type: "vocabulary",
        title: "Words",
        vocabulary: [
          { term: "deploy", meaning: "release software", context: "it-work" },
          { term: "usually", meaning: "most of the time", context: "daily-habits" }
        ]
      }
    ]
  }, "it-work");

  assert.deepEqual(vocabulary, [{ term: "deploy", meaning: "release software", context: "it-work", sectionTitle: "Words" }]);
});
