import "./learningHub.css";
import UiIcon from "./UiIcon.jsx";

export function MobileHomeFocus({ unit, unitPosition, unitCount, unitStatus, unitPercent, resumeStep, skillSummary, levelProgress, t, onContinue, onReview, onCourse }) {
  return (
    <section className="home-mobile-focus" aria-label={t("learningPlan")}>
      <header className="learning-focus-header">
        <p>{t("learningPlan")}</p>
        <h2>{t("readyNextStep")}</h2>
      </header>

      <article className="continue-learning-card">
        <div className="learning-card-meta"><span>{unit?.cefrLevel || "A1"}</span><span>{t("unitOf")} {unitPosition}/{unitCount}</span></div>
        <p className="learning-card-label">{t("continueLearning")}</p>
        <h3>{unit?.title || t("noLearningContent")}</h3>
        {resumeStep && <p className="learning-resume-step">{resumeStep}</p>}
        {unit?.focus && <p className="learning-unit-focus">{unit.focus}</p>}
        <div className="learning-unit-progress" aria-label={`${unitPercent}%`}><span style={{ width: `${unitPercent}%` }} /></div>
        <div className="learning-progress-copy"><span>{t(unitStatus)}</span><strong>{unitPercent}%</strong></div>
        <button type="button" className="icon-action" onClick={onContinue}><UiIcon name="play" /> <span>{t("continueLearning")}</span></button>
      </article>

      <article className="next-review-card">
        <div>
          <p className="learning-card-label">{t("nextReview")}</p>
          <h3>{skillSummary.mistakeCount ? t("reviewMistakes") : skillSummary.priority?.label || t("reviewNewSkills")}</h3>
          <p>{skillSummary.mistakeCount ? `${skillSummary.mistakeCount} ${t("mistakesToReview")}` : skillSummary.priority ? t("reviewReady") : t("reviewFirstSession")}</p>
        </div>
        <div className="review-duration"><strong>5</strong><span>min</span></div>
        <button type="button" className="icon-action" onClick={onReview}><UiIcon name="review" /> <span>{t("startAdaptiveReview")}</span></button>
      </article>

      <section className="course-progress-preview">
        <header><div><p className="learning-card-label">{t("yourCourse")}</p><h3>{t("courseProgress")}</h3></div><button type="button" className="icon-action" onClick={onCourse}><span>{t("viewCourse")}</span><UiIcon name="arrow" size={17} /></button></header>
        <LevelProgressRows rows={levelProgress} t={t} />
      </section>
    </section>
  );
}

function LevelProgressRows({ rows, t }) {
  return (
    <div className="level-progress-list">
      {rows.map((entry) => (
        <div className={`level-progress-row ${entry.percent === 100 ? "complete" : entry.active ? "current" : "upcoming"}`} key={entry.level}>
          <strong>{entry.level}</strong>
          <div className="level-progress-copy"><span>{entry.percent === 100 ? t("completed") : entry.active ? t("inProgress") : t("notStarted")}</span><small>{entry.completed}/{entry.total} {t("unitsCompleted")}</small></div>
          <div className="level-progress-track"><span style={{ width: `${entry.percent}%` }} /></div>
        </div>
      ))}
    </div>
  );
}

export function CoursePage({ units, getUnitStatus, activeUnitId, recommendedUnitId, t, onOpenUnit }) {
  return (
    <section className="learning-hub-page" aria-label={t("course")}>
      <header className="learning-hub-header"><p>{t("learningPlan")}</p><h2>{t("completeCourse")}</h2><span>{t("courseIntro")}</span></header>
      <div className="course-level-list">
        {["A1", "A2", "B1", "B2"].map((level) => {
          const levelUnits = units.filter((unit) => unit.cefrLevel === level);
          if (!levelUnits.length) return null;
          const completed = levelUnits.filter((unit) => getUnitStatus(unit) === "completed").length;
          return (
            <section className="course-level-card" key={level}>
              <header><div><strong>{level}</strong><span>{completed}/{levelUnits.length} {t("unitsCompleted")}</span></div><div className="course-level-track"><span style={{ width: `${Math.round((completed / levelUnits.length) * 100)}%` }} /></div></header>
              <div className="course-unit-list">
                {levelUnits.map((unit, index) => {
                  const locked = (unit.prerequisiteUnitIds || []).some((prerequisiteId) => {
                    const prerequisite = units.find((entry) => entry.id === prerequisiteId);
                    return prerequisite && getUnitStatus(prerequisite) !== "completed";
                  });
                  const status = locked ? "requiresPreviousUnit" : getUnitStatus(unit);
                  return (
                    <button type="button" disabled={locked} className={`course-unit-row ${activeUnitId === unit.id ? "active" : ""}`} key={unit.id} onClick={() => onOpenUnit(unit)}>
                      <span className="course-unit-number">{index + 1}</span><span><strong>{unit.title}</strong><small>{recommendedUnitId === unit.id && !locked ? `${t("recommended")} · ` : ""}{t(status)}</small></span><span className="course-unit-action">{locked ? t("locked") : t("openUnit")}</span>
                    </button>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </section>
  );
}

export function ProgressPage({ levelProgress, skillSummary, t, onReview, onCourse }) {
  const prioritySkills = [...skillSummary.entries].sort((a, b) => a.mastery - b.mastery).slice(0, 6);
  return (
    <section className="learning-hub-page" aria-label={t("progress")}>
      <header className="learning-hub-header"><p>{t("yourProgress")}</p><h2>{t("progressTitle")}</h2><span>{t("progressIntro")}</span></header>
      <section className="mastery-overview-card">
        <div className="mastery-score"><strong>{skillSummary.averageMastery}%</strong><span>{t("averageMastery")}</span></div>
        <dl><div><dt>{t("skillsPracticed")}</dt><dd>{skillSummary.practicedCount}</dd></div><div><dt>{t("prioritySkill")}</dt><dd>{skillSummary.priority?.label || t("noSkillData")}</dd></div></dl>
        <button type="button" onClick={onReview}>{skillSummary.mistakeCount ? t("reviewMistakes") : t("startAdaptiveReview")}</button>
      </section>
      <section className="progress-section-card">
        <header><h3>{t("courseProgress")}</h3><button type="button" onClick={onCourse}>{t("viewCourse")}</button></header>
        <div className="progress-level-grid">{levelProgress.map((entry) => <article key={entry.level}><strong>{entry.level}</strong><span>{entry.percent}%</span><div><span style={{ width: `${entry.percent}%` }} /></div><small>{entry.completed}/{entry.total} {t("unitsCompleted")}</small></article>)}</div>
      </section>
      <section className="progress-section-card">
        <header><h3>{t("skillProgress")}</h3></header>
        {prioritySkills.length ? <div className="skill-progress-list">{prioritySkills.map((skill) => <div key={skill.id}><span>{skill.label}</span><div><span style={{ width: `${skill.mastery}%` }} /></div><strong>{skill.mastery}%</strong></div>)}</div> : <p>{t("noSkillDataHelp")}</p>}
      </section>
    </section>
  );
}
