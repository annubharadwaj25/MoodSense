/* ----------------------------------------------------------------
   ChatBubble
   A single conversation message.
   - User messages: right-aligned, sage-tinted.
   - AI messages: left-aligned, white surface with a small avatar.
---------------------------------------------------------------- */

export default function ChatBubble({ role, content }) {
  const isUser = role === "user";

  return (
    <div className={`chat-bubble-row ${isUser ? "is-user" : "is-ai"}`}>
      {!isUser && (
        <div className="chat-bubble-avatar" aria-hidden="true">
          🌿
        </div>
      )}
      <div className={`chat-bubble ${isUser ? "chat-bubble-user" : "chat-bubble-ai"}`}>
        <p>{content}</p>
      </div>
    </div>
  );
}
