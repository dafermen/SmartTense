import { useEffect, useMemo, useState } from "react";
import { buildGuidedLessonSteps, isGuidedAnswerCorrect } from "./guidedLesson.js";
import { playPronunciation, stopPronunciation } from "./pronunciation.js";
import "./guidedLesson.css";

export default function GuidedLessonPage({ unit, initialProgress, t, onProgressChange, onBack, onPractice, onAnswerResult }) {
  const steps = useMemo(() => buildGuidedLessonSteps(unit), [unit]);
  const [stepIndex, setStepIndex] = useState(() => Math.min(initialProgress?.guidedStepIndex || 0, Math.max(0, steps.length - 1)));
  const [answers, setAnswers] = useState(initialProgress?.guidedAnswers || {});
  const [checkedAnswers, setCheckedAnswers] = useState(initialProgress?.guidedCheckedAnswers || {});
  const [completedStepIds, setCompletedStepIds] = useState(initialProgress?.guidedCompletedStepIds || []);
  const [productionDraft, setProductionDraft] = useState(initialProgress?.guidedProductionDraft || "");
  const [pronunciationSpeed, setPronunciationSpeed] = useState("normal");
  const [practicedDrillIds, setPracticedDrillIds] = useState(initialProgress?.guidedPracticedDrillIds || []);
  const [speechStatus, setSpeechStatus] = useState("");
  const speechAvailable = typeof window !== "undefined"
    && typeof window.speechSynthesis !== "undefined"
    && typeof window.SpeechSynthesisUtterance === "function";

  useEffect(() => () => stopPronunciation(), [stepIndex]);

  if (!unit || steps.length === 0) {
    return (
      <section className="guided-lesson guided-empty">
        <h2>{t("guidedUnavailable")}</h2>
        <button type="button" onClick={onBack}>{t("backToTheory")}</button>
      </section>
    );
  }

  const step = steps[stepIndex];
  const progress = Math.round(((stepIndex + 1) / steps.length) * 100);
  const selectedAnswer = step.type === "practice" ? answers[step.exercise.id] || "" : "";
  const wasChecked = step.type === "practice" ? Boolean(checkedAnswers[step.exercise.id]) : false;
  const isCorrect = step.type === "practice"
    ? isGuidedAnswerCorrect(selectedAnswer, step.exercise.answer)
    : false;
  const canContinue = step.type !== "practice" || wasChecked;

  function checkPracticeAnswer() {
    if (step.type !== "practice" || wasChecked || !selectedAnswer) return;
    const correct = isGuidedAnswerCorrect(selectedAnswer, step.exercise.answer);
    const nextCheckedAnswers = { ...checkedAnswers, [step.exercise.id]: true };
    setCheckedAnswers(nextCheckedAnswers);
    onProgressChange?.({ guidedCheckedAnswers: nextCheckedAnswers });
    onAnswerResult?.(step.exercise, correct);
  }

  function moveToStep(nextIndex) {
    const stepId = `${step.type}-${stepIndex}`;
    const nextCompletedStepIds = completedStepIds.includes(stepId) ? completedStepIds : [...completedStepIds, stepId];
    const boundedIndex = Math.max(0, Math.min(steps.length - 1, nextIndex));
    const guidedCompleted = steps[boundedIndex]?.type === "summary";
    setCompletedStepIds(nextCompletedStepIds);
    setStepIndex(boundedIndex);
    onProgressChange?.({ guidedStepIndex: boundedIndex, guidedCompletedStepIds: nextCompletedStepIds, guidedCompleted });
  }

  function speak(text) {
    const started = playPronunciation(text, {
      speed: pronunciationSpeed,
      onStart: () => setSpeechStatus(t("pronunciationPlaying")),
      onEnd: () => setSpeechStatus(""),
      onError: () => setSpeechStatus(t("pronunciationUnavailable"))
    });
    if (!started) setSpeechStatus(t("pronunciationUnavailable"));
  }

  function togglePracticedDrill(drillId) {
    const nextIds = practicedDrillIds.includes(drillId)
      ? practicedDrillIds.filter((id) => id !== drillId)
      : [...practicedDrillIds, drillId];
    setPracticedDrillIds(nextIds);
    onProgressChange?.({ guidedPracticedDrillIds: nextIds });
  }

  function renderStep() {
    switch (step.type) {
      case "objective":
        return (
          <div className="guided-step-card">
            <p className="guided-kicker">{t("guidedYourGoal")}</p>
            <h2>{t("guidedGoalTitle")}</h2>
            <ul className="guided-check-list">
              {step.objectives.map((objective) => <li key={objective}>{objective}</li>)}
            </ul>
          </div>
        );
      case "theory":
        return (
          <div className="guided-step-card">
            <p className="guided-kicker">{t("guidedLearn")}</p>
            <h2>{step.section?.title || unit.title}</h2>
            {step.section?.body?.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
            {step.section?.signalWords?.length > 0 && (
              <div className="guided-chip-row">
                {step.section.signalWords.map((word) => <span key={word}>{word}</span>)}
              </div>
            )}
          </div>
        );
      case "examples":
        return (
          <div className="guided-step-card">
            <p className="guided-kicker">{t("guidedContext")}</p>
            <h2>{t("guidedPattern")}</h2>
            <div className="guided-example-list">
              {step.items.map((item) => (
                <article key={item.sentence}>
                  <strong>{item.sentence}</strong>
                  <p>{item.note}</p>
                </article>
              ))}
            </div>
          </div>
        );
      case "practice":
        return (
          <div className="guided-step-card">
            <p className="guided-kicker">{t("guidedPractice")}</p>
            <h2>{step.exercise.prompt}</h2>
            <label className="guided-answer-field">
              <span>{t("chooseOneAnswer")}</span>
              <select
                value={selectedAnswer}
                onChange={(event) => {
                  const value = event.target.value;
                  const nextAnswers = { ...answers, [step.exercise.id]: value };
                  const nextCheckedAnswers = { ...checkedAnswers, [step.exercise.id]: false };
                  setAnswers(nextAnswers);
                  setCheckedAnswers(nextCheckedAnswers);
                  onProgressChange?.({ guidedAnswers: nextAnswers, guidedCheckedAnswers: nextCheckedAnswers });
                }}
              >
                <option value="">{t("selectAnswer")}</option>
                {step.exercise.options.map((option) => <option value={option} key={option}>{option}</option>)}
              </select>
            </label>
            <button
              type="button"
              className="guided-check-button"
              disabled={!selectedAnswer}
              onClick={checkPracticeAnswer}
            >
              {t("checkAnswer")}
            </button>
            {wasChecked && (
              <div className={`guided-feedback ${isCorrect ? "correct" : "incorrect"}`} role="status">
                <strong>{isCorrect ? t("correct") : `${t("expectedAnswer")}: ${step.exercise.answer}`}</strong>
                <p>{step.exercise.explanation}</p>
              </div>
            )}
          </div>
        );
      case "correction":
        return (
          <div className="guided-step-card">
            <p className="guided-kicker">{t("guidedFixMistake")}</p>
            <h2>{t("guidedCompare")}</h2>
            <div className="guided-correction wrong"><span>{t("guidedNotThis")}</span><strong>{step.item.wrong}</strong></div>
            <div className="guided-correction right"><span>{t("guidedUseThis")}</span><strong>{step.item.right}</strong></div>
            <p>{step.item.why}</p>
          </div>
        );
      case "pronunciation":
        return (
          <div className="guided-step-card">
            <p className="guided-kicker">{t("guidedSayAloud")}</p>
            <h2>{t("guidedRepeat")}</h2>
            <div className="guided-pronunciation-toolbar">
              <label>
                <span>{t("pronunciationSpeed")}</span>
                <select value={pronunciationSpeed} onChange={(event) => setPronunciationSpeed(event.target.value)}>
                  <option value="slow">{t("pronunciationSlow")}</option>
                  <option value="normal">{t("pronunciationNormal")}</option>
                </select>
              </label>
              <button
                type="button"
                className="secondary"
                disabled={!speechAvailable}
                onClick={() => speak(step.drills.map((drill) => drill.text).join(" "))}
              >
                {t("pronunciationListenAll")}
              </button>
            </div>
            {!speechAvailable && <p className="guided-pronunciation-note">{t("pronunciationUnavailable")}</p>}
            <p className="guided-pronunciation-status" role="status" aria-live="polite">{speechStatus}</p>
            <div className="guided-drill-list">
              {step.drills.map((drill) => {
                const practiced = practicedDrillIds.includes(drill.id);
                return (
                <article key={drill.id} className={practiced ? "is-practiced" : ""}>
                  <strong>{drill.text}</strong>
                  <p>{drill.focus}. {drill.note}</p>
                  <div className="guided-drill-actions">
                    <button type="button" disabled={!speechAvailable} onClick={() => speak(drill.text)}>
                      {t("pronunciationListen")}
                    </button>
                    <button
                      type="button"
                      className="secondary"
                      aria-pressed={practiced}
                      onClick={() => togglePracticedDrill(drill.id)}
                    >
                      {practiced ? t("pronunciationPracticed") : t("pronunciationMarkPracticed")}
                    </button>
                  </div>
                </article>
                );
              })}
            </div>
            <p className="guided-pronunciation-count">
              {t("pronunciationProgress")}: {practicedDrillIds.filter((id) => step.drills.some((drill) => drill.id === id)).length}/{step.drills.length}
            </p>
          </div>
        );
      case "production":
        return (
          <div className="guided-step-card">
            <p className="guided-kicker">{t("guidedUseYourself")}</p>
            <h2>{step.task.prompt}</h2>
            <textarea
              rows="5"
              value={productionDraft}
              placeholder={t("guidedProductionPlaceholder")}
              onChange={(event) => {
                setProductionDraft(event.target.value);
                onProgressChange?.({ guidedProductionDraft: event.target.value });
              }}
            />
            <ul className="guided-check-list compact">
              {step.task.checklist?.map((item) => <li key={item}>{item}</li>)}
            </ul>
          </div>
        );
      case "summary":
        return (
          <div className="guided-step-card guided-summary">
            <p className="guided-kicker">{t("guidedComplete")}</p>
            <h2>{t("guidedFinished")} {unit.title}</h2>
            <p>{t("guidedFinishedHelp")}</p>
            <div className="guided-summary-actions">
              <button type="button" onClick={() => { onProgressChange?.({ guidedCompleted: true }); onPractice(); }}>{t("continueToPractice")}</button>
              <button type="button" className="secondary" onClick={onBack}>{t("backToTheory")}</button>
            </div>
          </div>
        );
      default:
        return null;
    }
  }

  return (
    <section className="guided-lesson">
      <header className="guided-header">
        <button type="button" className="guided-back" onClick={onBack}>{t("back")}</button>
        <div>
          <p className="guided-kicker">{unit.cefrLevel} {t("guidedLessonLabel")}</p>
          <h1>{unit.title}</h1>
        </div>
        <span>{stepIndex + 1}/{steps.length}</span>
      </header>

      <div className="guided-progress" aria-label={`${progress}% complete`}>
        <span style={{ width: `${progress}%` }} />
      </div>

      <div className="guided-stage">{renderStep()}</div>

      {step.type !== "summary" && (
        <footer className="guided-controls">
          <button
            type="button"
            className="secondary"
            disabled={stepIndex === 0}
            onClick={() => moveToStep(stepIndex - 1)}
          >
            {t("previousPage")}
          </button>
          <button
            type="button"
            disabled={!canContinue}
            onClick={() => moveToStep(stepIndex + 1)}
          >
            {t("continue")}
          </button>
        </footer>
      )}
    </section>
  );
}
