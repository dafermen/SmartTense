import { scorePracticeAnswer } from "./practice.js";
import "./focusedPractice.css";

export default function FocusedPracticePage({ unit, contexts, selectedContext, exercises, totalUnitExercises, journey, t, onContextChange, onProgressChange, onAnswerResult, onContinueProduction }) {
  if (!unit || exercises.length === 0) {
    return <section className="focused-practice empty"><h2>{t("noPracticeExercises")}</h2></section>;
  }

  const answers = journey.practiceAnswers || {};
  const results = journey.practiceResults || {};
  const safeIndex = Math.min(journey.practiceCurrentIndex || 0, exercises.length - 1);
  const sessionComplete = Boolean(journey.practiceSessionComplete);
  const exercise = exercises[safeIndex];
  const exerciseKindKey = {
    fillBlank: "exerciseKindFillBlank",
    transform: "exerciseKindTransform",
    chooseTense: "exerciseKindChooseTense",
    correctMistake: "exerciseKindCorrectMistake",
    translation: "exerciseKindTranslation"
  }[exercise.kind] || "exerciseKindPractice";
  const answer = answers[exercise.id] || "";
  const result = results[exercise.id] || null;
  const answeredUnitCount = Object.keys(results).length;
  const unitComplete = answeredUnitCount >= totalUnitExercises;
  const progress = Math.round(((safeIndex + 1) / exercises.length) * 100);

  function changeAnswer(value) {
    const nextAnswers = { ...answers, [exercise.id]: value };
    const nextResults = { ...results };
    delete nextResults[exercise.id];
    onProgressChange({ practiceAnswers: nextAnswers, practiceResults: nextResults, practiceSessionComplete: false });
  }

  function checkAnswer() {
    if (!answer || result) return;
    const nextResult = scorePracticeAnswer(exercise.answer, answer);
    onProgressChange({ practiceResults: { ...results, [exercise.id]: nextResult } });
    onAnswerResult(exercise, nextResult.isCorrect);
  }

  function retryQuestion() {
    const nextAnswers = { ...answers, [exercise.id]: "" };
    const nextResults = { ...results };
    delete nextResults[exercise.id];
    onProgressChange({ practiceAnswers: nextAnswers, practiceResults: nextResults, practiceSessionComplete: false });
  }

  function nextQuestion() {
    if (safeIndex === exercises.length - 1) {
      onProgressChange({ practiceSessionComplete: true });
      return;
    }
    onProgressChange({ practiceCurrentIndex: safeIndex + 1 });
  }

  function changeContext(contextId) {
    onProgressChange({ practiceCurrentIndex: 0, practiceSessionComplete: false });
    onContextChange(contextId);
  }

  if (sessionComplete) {
    const correct = exercises.filter((item) => results[item.id]?.isCorrect).length;
    return (
      <section className="focused-practice practice-session-summary">
        <p className="practice-kicker">{unitComplete ? t("practiceCompleted") : t("contextCompleted")}</p>
        <div className="practice-session-score"><strong>{correct}/{exercises.length}</strong><span>{t("correctAnswers")}</span></div>
        <h2>{unitComplete ? t("continueToProduction") : t("continueFullPractice")}</h2>
        <p>{unitComplete ? t("practiceFlowProductionHelp") : t("contextPracticeHelp")}</p>
        {unitComplete ? (
          <button type="button" onClick={() => { onProgressChange({ practiceCompleted: true }); onContinueProduction(); }}>{t("continueToProduction")}</button>
        ) : (
          <button type="button" onClick={() => changeContext("all")}>{t("allContexts")}</button>
        )}
      </section>
    );
  }

  return (
    <section className="focused-practice">
      <header className="focused-practice-header">
        <div><p className="practice-kicker">{t("practice")}</p><h2>{unit.title}</h2></div>
        <span>{safeIndex + 1}/{exercises.length}</span>
      </header>
      <div className="focused-practice-progress"><span style={{ width: `${progress}%` }} /></div>
      <details className="practice-context-picker">
        <summary>{t("contextFilter")}: {contexts.find((context) => context.id === selectedContext)?.title || t("allContexts")}</summary>
        <div>
          <button type="button" className={selectedContext === "all" ? "active" : ""} onClick={() => changeContext("all")}>{t("allContexts")}</button>
          {contexts.map((context) => <button type="button" className={selectedContext === context.id ? "active" : ""} key={context.id} onClick={() => changeContext(context.id)}>{context.title}</button>)}
        </div>
      </details>
      <article className="focused-question-card">
        <div className="focused-question-meta"><span>{t(exerciseKindKey)}</span><span>{exercise.sectionTitle}</span></div>
        <h3>{exercise.prompt}</h3>
        <label><span>{t("yourAnswer")}</span><select value={answer} disabled={Boolean(result)} onChange={(event) => changeAnswer(event.target.value)}><option value="">{t("selectAnswer")}</option>{exercise.options.map((option) => <option value={option} key={option}>{option}</option>)}</select></label>
        {!result ? <button type="button" disabled={!answer} onClick={checkAnswer}>{t("checkAnswer")}</button> : (
          <>
            <div className={`focused-feedback ${result.isCorrect ? "correct" : "incorrect"}`} role="status">
              <strong>{result.isCorrect ? t("correct") : `${t("expectedAnswer")}: ${exercise.answer}`}</strong>
              <p>{exercise.explanation}</p>
              {!result.isCorrect && <small>{t("savedForReview")}</small>}
            </div>
            <div className="practice-answer-actions">
              {!result.isCorrect && <button type="button" className="secondary" onClick={retryQuestion}>{t("tryAgain")}</button>}
              <button type="button" onClick={nextQuestion}>{safeIndex === exercises.length - 1 ? t("seeResults") : t("nextQuestion")}</button>
            </div>
          </>
        )}
      </article>
    </section>
  );
}
