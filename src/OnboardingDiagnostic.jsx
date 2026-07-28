import "./onboardingDiagnostic.css";

export default function OnboardingDiagnostic({ checks, answers, result, t, onToggle, onApply, onStartA1 }) {
  return (
    <section className="onboarding-diagnostic" aria-label={t("diagnostic")}>
      <div className="diagnostic-intro"><p>{t("welcomeToSmartTense")}</p><h2>{t("knowYourLevel")}</h2><span>{t("diagnosticOnboardingHelp")}</span></div>
      <div className="diagnostic-level-checks">
        {checks.map((check) => <label key={check.id}><input type="checkbox" checked={Boolean(answers[check.id])} onChange={() => onToggle(check.id)} /><span><strong>{check.cefrLevel} · {t(check.labelKey)}</strong><small>{t(check.descriptionKey)}</small></span></label>)}
      </div>
      {result && <p className="diagnostic-result">{t("diagnosticSuggestedLevel")}: <strong>{result.cefrLevel}</strong></p>}
      <div className="diagnostic-onboarding-actions"><button type="button" disabled={!result} onClick={onApply}>{t("applyRecommendation")}</button><button type="button" className="secondary" onClick={onStartA1}>{t("startFromA1")}</button></div>
    </section>
  );
}
