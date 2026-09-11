function DetectErrorCard({ message, onRetry }) {
  return (
    <div className="detect-error-card detect-fade-in" role="alert">
      <div className="detect-error-emoji" aria-hidden="true">
        😔
      </div>
      <h3>We couldn&apos;t analyze your emotion right now.</h3>
      <p>{message || "Please try again."}</p>
      {onRetry ? (
        <button type="button" className="detect-retry-btn" onClick={onRetry}>
          Try again
        </button>
      ) : null}
    </div>
  );
}

export default DetectErrorCard;
