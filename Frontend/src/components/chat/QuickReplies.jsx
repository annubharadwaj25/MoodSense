/* ----------------------------------------------------------------
   QuickReplies
   Optional chip buttons shown below the latest AI message.
   Clicking a chip sends its label as the next user message.
   Special handling for "Save this conversation" (calls onSave).
---------------------------------------------------------------- */

const DEFAULT_CHIPS = [
  "💭 Tell me more",
  "📝 Help me reflect",
  "🌿 Give me a calming exercise",
  "🎵 Suggest relaxing music",
  "😊 I'm feeling better",
];

export default function QuickReplies({ onSend, onSave }) {
  return (
    <div className="chat-quick-replies">
      {DEFAULT_CHIPS.map((chip) => (
        <button
          key={chip}
          type="button"
          className="chat-chip"
          onClick={() => onSend(chip)}
        >
          {chip}
        </button>
      ))}
      {onSave && (
        <button
          type="button"
          className="chat-chip chat-chip-save"
          onClick={onSave}
        >
          📔 Save this conversation
        </button>
      )}
    </div>
  );
}
