function DetectSuggestionCard({ suggestion }) {
  if (!suggestion) return null;

  return (
    <div className="detect-suggestion-card detect-fade-in">
      <span className="detect-suggestion-eyebrow">
        🌿 Personalized Guidance
      </span>
      <h3 className="detect-suggestion-title">
        <span className="detect-suggestion-title-emoji" aria-hidden="true">
          {suggestion.emoji}
        </span>
        {suggestion.title}
      </h3>
      <ul className="detect-suggestion-list">
        {suggestion.items.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
      <p className="detect-suggestion-closing">{suggestion.closing}</p>
    </div>
  );
}

export default DetectSuggestionCard;
