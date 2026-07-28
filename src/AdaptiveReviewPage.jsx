import { useMemo, useState } from "react";
import { buildAdaptiveReviewQueue, getAdaptiveReviewReason } from "./adaptiveReview.js";
import { scorePracticeAnswer } from "./practice.js";
import "./adaptiveReview.css";

export default function AdaptiveReviewPage({ units, skillProgress, t, onAnswerResult, onBack, onPractice }) {
  const queue = useMemo(
    () => buildAdaptiveReviewQueue(units, skillProgress, { limit: 8 }),
    [skillProgress, units]
  );
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [result, setResult] = useState(null);
  const [correctCount, setCorrectCount] = useState(0);

  if (queue.length === 0) {
    return (
      <section className="adaptive-review adaptive-review-empty">
        <p className="adaptive-kicker">{t("adaptiveReview")}</p>
        <h1>{t("noReviewQuestions")}</h1>
        <p>{t("noReviewHelp")}</p>
        <button type="button" onClick={onPractice}>{t("openPractice")}</button>
      </section>
    );
  }

  if (questionIndex >= queue.length) {
    const percentage = Math.round((correctCount / queue.length) * 100);
    return (
      <section className="adaptive-review adaptive-review-summary">
        <p className="adaptive-kicker">{t("reviewComplete")}</p>
        <div className="adaptive-score-ring"><strong>{percentage}%</strong><span>{correctCount}/{queue.length} {t("correctAnswers")}</span></div>
        <h1>{t("reviewFocusedTitle")}</h1>
        <p>{t("reviewFocusedHelp")}</p>
        <div className="adaptive-actions">
          <button type="button" onClick={onBack}>{t("backHome")}</button>
          <button type="button" className="secondary" onClick={onPractice}>{t("fullUnitPractice")}</button>
        </div>
      </section>
    );
  }

  const item = queue[questionIndex];
  const progress = Math.round(((questionIndex + 1) / queue.length) * 100);

  function checkAnswer() {
    if (!answer || result) return;
    const nextResult = scorePracticeAnswer(item.exercise.answer, answer);
    setResult(nextResult);
    if (nextResult.isCorrect) setCorrectCount((count) => count + 1);
    onAnswerResult(item.unit, item.exercise, nextResult.isCorrect);
  }

  function retryQuestion() {
    setAnswer("");
    setResult(null);
  }

  function continueReview() {
    setQuestionIndex((index) => index + 1);
    setAnswer("");
    setResult(null);
  }

  return (
    <section className="adaptive-review">
      <header className="adaptive-header">
        <button type="button" className="adaptive-back" onClick={onBack}>{t("back")}</button>
        <div>
          <p className="adaptive-kicker">{t("adaptiveReview")}</p>
          <h1>{item.skillLabel}</h1>
        </div>
        <span>{questionIndex + 1}/{queue.length}</span>
      </header>

      <div className="adaptive-progress" aria-label={`${progress}% complete`}><span style={{ width: `${progress}%` }} /></div>

      <article className="adaptive-question-card">
        <div className="adaptive-meta">
          <span>{item.unit.cefrLevel}</span>
          <span>{t({ "Recent mistake": "reviewReasonMistake", "New skill": "reviewReasonNew", "Needs reinforcement": "reviewReasonReinforce", "Keep practicing": "reviewReasonPractice", "Scheduled review": "reviewReasonScheduled" }[getAdaptiveReviewReason(item)])}</span>
        </div>
        <p className="adaptive-unit">{item.unit.title}</p>
        <h2>{item.exercise.prompt}</h2>
        <label className="adaptive-answer-field">
          <span>{t("chooseOneAnswer")}</span>
          <select value={answer} disabled={Boolean(result)} onChange={(event) => setAnswer(event.target.value)}>
            <option value="">{t("selectAnswer")}</option>
            {item.exercise.options.map((option) => <option key={option} value={option}>{option}</option>)}
          </select>
        </label>

        {!result ? (
          <button type="button" className="adaptive-primary" disabled={!answer} onClick={checkAnswer}>{t("checkAnswer")}</button>
        ) : (
          <>
            <div className={`adaptive-feedback ${result.isCorrect ? "correct" : "incorrect"}`} role="status">
              <strong>{result.isCorrect ? t("correct") : `${t("expectedAnswer")}: ${item.exercise.answer}`}</strong>
              <p>{item.exercise.explanation}</p>
              {!result.isCorrect && <small>{t("savedForReview")}</small>}
            </div>
            <div className="adaptive-answer-actions">
              {!result.isCorrect && <button type="button" className="adaptive-secondary" onClick={retryQuestion}>{t("tryAgain")}</button>}
              <button type="button" className="adaptive-primary" onClick={continueReview}>
                {questionIndex === queue.length - 1 ? t("seeResults") : t("nextQuestion")}
              </button>
            </div>
          </>
        )}
      </article>
    </section>
  );
}
