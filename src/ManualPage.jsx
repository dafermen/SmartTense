import UiIcon from "./UiIcon.jsx";
import "./manualPage.css";

export default function ManualPage({ t }) {
  const pdfUrl = `${import.meta.env.BASE_URL}docs/dario-general-english-course.pdf`;

  return (
    <section className="manual-page" aria-labelledby="manual-page-title">
      <header className="manual-hero">
        <div className="manual-hero-copy">
          <p className="manual-eyebrow">{t("manualDocument")}</p>
          <h1 id="manual-page-title">{t("courseManual")}</h1>
          <p>{t("manualIntro")}</p>
          <div className="manual-meta" aria-label={t("courseManual")}>
            <span>{t("manualLevel")}</span>
            <span>{t("manualPages")}</span>
            <span>PDF</span>
          </div>
        </div>
        <div className="manual-actions">
          <a className="manual-primary-action" href={pdfUrl} target="_blank" rel="noreferrer">
            <UiIcon name="manual" />
            <span>{t("openManual")}</span>
          </a>
          <a className="manual-secondary-action" href={pdfUrl} download="Dario-General-English-Course-A2.pdf">
            <span>{t("downloadManual")}</span>
          </a>
        </div>
      </header>

      <div className="manual-mobile-card">
        <UiIcon name="manual" size={34} />
        <div><strong>{t("courseManual")}</strong><p>{t("manualMobileHelp")}</p></div>
        <a href={pdfUrl} target="_blank" rel="noreferrer">{t("openManual")}</a>
      </div>

      <div className="manual-viewer-shell">
        <iframe
          className="manual-viewer"
          src={`${pdfUrl}#view=FitH&toolbar=1&navpanes=1`}
          title={t("manualViewerTitle")}
          loading="lazy"
        />
      </div>
    </section>
  );
}
