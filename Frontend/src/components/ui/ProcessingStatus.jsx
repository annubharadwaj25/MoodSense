import "./ProcessingStatus.css";

function ProcessingStatus({
  headline,
  detail,
  steps,
  success = false,
  liveMessage,
}) {
  const announced =
    liveMessage ||
    (success ? headline : detail || headline || steps?.find((s) => s.state === "active")?.label || "");

  return (
    <div
      className={`ms-process${success ? " ms-process--success" : ""}`}
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      <span className="ms-process-live">{announced}</span>

      {steps ? (
        <ol className="ms-process-steps">
          {steps.map((step) => (
            <li
              key={step.id}
              className={`ms-process-step${
                step.state === "active" ? " is-active" : ""
              }${step.state === "done" ? " is-done" : ""}`}
            >
              <span className="ms-process-marker" aria-hidden="true" />
              <span>{step.label}</span>
            </li>
          ))}
        </ol>
      ) : (
        <>
          <div className="ms-process-headline">
            {success ? (
              <span className="ms-process-check" aria-hidden="true" />
            ) : (
              <span className="ms-process-pulse" aria-hidden="true" />
            )}
            <span>{headline}</span>
          </div>
          {detail ? <p className="ms-process-detail">{detail}</p> : null}
        </>
      )}
    </div>
  );
}

export default ProcessingStatus;

function waitForPaint() {
  return new Promise((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(resolve);
    });
  });
}

export { waitForPaint };
