/* ----------------------------------------------------------------
   TypingIndicator
   Three animated bouncing dots shown while the AI is composing
   a reply. Styled to match the AI chat bubble.
---------------------------------------------------------------- */

export default function TypingIndicator() {
  return (
    <div className="chat-bubble-row is-ai">
      <div className="chat-bubble-avatar" aria-hidden="true">
        🌿
      </div>
      <div className="chat-bubble chat-bubble-ai chat-typing">
        <span className="chat-typing-dot" />
        <span className="chat-typing-dot" />
        <span className="chat-typing-dot" />
      </div>
    </div>
  );
}
