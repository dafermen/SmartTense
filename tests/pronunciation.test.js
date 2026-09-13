import test from "node:test";
import assert from "node:assert/strict";
import { getPronunciationRate, playPronunciation, selectEnglishVoice, stopPronunciation } from "../src/pronunciation.js";

test("pronunciation speed uses safe learner-friendly rates", () => {
  assert.equal(getPronunciationRate("slow"), 0.72);
  assert.equal(getPronunciationRate("normal"), 0.95);
  assert.equal(getPronunciationRate("unknown"), 0.95);
});

test("English voice selection prefers a local US voice", () => {
  const voices = [
    { name: "Remote US", lang: "en-US", localService: false },
    { name: "Local GB", lang: "en-GB", localService: true },
    { name: "Local US", lang: "en-US", localService: true }
  ];
  assert.equal(selectEnglishVoice(voices)?.name, "Local US");
});

test("pronunciation playback configures and sends one English utterance", () => {
  class FakeUtterance {
    constructor(text) {
      this.text = text;
    }
  }
  const speechSynthesis = {
    canceled: 0,
    spoken: null,
    cancel() { this.canceled += 1; },
    getVoices() { return [{ name: "English", lang: "en-US", localService: true }]; },
    speak(utterance) { this.spoken = utterance; }
  };

  assert.equal(playPronunciation("She works from home.", {
    speed: "slow",
    speechSynthesis,
    SpeechSynthesisUtterance: FakeUtterance
  }), true);
  assert.equal(speechSynthesis.canceled, 1);
  assert.equal(speechSynthesis.spoken.text, "She works from home.");
  assert.equal(speechSynthesis.spoken.lang, "en-US");
  assert.equal(speechSynthesis.spoken.rate, 0.72);

  stopPronunciation(speechSynthesis);
  assert.equal(speechSynthesis.canceled, 2);
});
