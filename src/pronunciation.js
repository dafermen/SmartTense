export const PRONUNCIATION_RATES = Object.freeze({
  slow: 0.72,
  normal: 0.95
});

export function getPronunciationRate(speed) {
  return PRONUNCIATION_RATES[speed] || PRONUNCIATION_RATES.normal;
}

export function selectEnglishVoice(voices = []) {
  const englishVoices = voices.filter((voice) => /^en(?:-|_)/i.test(voice?.lang || ""));
  return englishVoices.find((voice) => voice.localService && /^en-US$/i.test(voice.lang))
    || englishVoices.find((voice) => /^en-US$/i.test(voice.lang))
    || englishVoices.find((voice) => voice.localService)
    || englishVoices[0]
    || null;
}

export function playPronunciation(text, options = {}) {
  const speechSynthesis = options.speechSynthesis || globalThis.speechSynthesis;
  const Utterance = options.SpeechSynthesisUtterance || globalThis.SpeechSynthesisUtterance;
  const spokenText = String(text || "").trim();

  if (!spokenText || !speechSynthesis || typeof speechSynthesis.speak !== "function" || typeof Utterance !== "function") {
    return false;
  }

  const utterance = new Utterance(spokenText);
  const voice = selectEnglishVoice(typeof speechSynthesis.getVoices === "function" ? speechSynthesis.getVoices() : []);
  utterance.lang = voice?.lang || "en-US";
  utterance.rate = getPronunciationRate(options.speed);
  utterance.pitch = 1;
  if (voice) utterance.voice = voice;
  if (typeof options.onStart === "function") utterance.onstart = options.onStart;
  if (typeof options.onEnd === "function") utterance.onend = options.onEnd;
  if (typeof options.onError === "function") utterance.onerror = options.onError;

  if (typeof speechSynthesis.cancel === "function") speechSynthesis.cancel();
  speechSynthesis.speak(utterance);
  return true;
}

export function stopPronunciation(speechSynthesis = globalThis.speechSynthesis) {
  if (speechSynthesis && typeof speechSynthesis.cancel === "function") speechSynthesis.cancel();
}
