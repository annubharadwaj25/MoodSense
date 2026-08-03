import { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import api from "../../services/api";
import ChatBubble from "./ChatBubble";
import TypingIndicator from "./TypingIndicator";
import QuickReplies from "./QuickReplies";

/* ----------------------------------------------------------------
   MoodCompanion
   Interactive emotional-wellness chat that unlocks after the
   first emotion detection. Sends the full conversation history to
   the backend so the AI stays context-aware.

   Props:
     initialEmotion   — the emotion detected from the original text
     originalText     — the user's first journal-style entry
     userName         — user's name for personalized greeting
---------------------------------------------------------------- */

export default function MoodCompanion({ initialEmotion, originalText, userName }) {
  const [messages, setMessages] = useState([]); // [{ role, content }]
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [saved, setSaved] = useState(false);

  const scrollRef = useRef(null);
  const inputRef = useRef(null);

  const emotion = initialEmotion || "Neutral";
  const name = userName || "friend";

  // ---- Kick off the conversation with a personalized greeting ----
  useEffect(() => {
    let cancelled = false;

    async function open() {
      setIsTyping(true);
      try {
        const res = await api.post("/api/chat", {
          messages: [
            {
              role: "user",
              content: originalText || "Hi, I'd like to talk about how I'm feeling.",
            },
          ],
          emotion,
          userName: name,
          isGreeting: true,
        });

        if (cancelled) return;

        setMessages([
          { role: "user", content: originalText },
          { role: "ai", content: res.data.reply },
        ]);
      } catch {
        if (!cancelled) {
          toast.error("The companion couldn't start the conversation.");
        }
      } finally {
        if (!cancelled) setIsTyping(false);
      }
    }

    open();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---- Auto-scroll to the latest message ----
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  // ---- Send a message (from input box or a quick-reply chip) ----
  const send = async (text) => {
    const content = (text ?? input).trim();
    if (!content || isTyping) return;

    const userMsg = { role: "user", content };
    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setInput("");
    setIsTyping(true);

    try {
      const res = await api.post("/api/chat", {
        messages: nextMessages.map((m) => ({ role: m.role, content: m.content })),
        emotion,
        userName: name,
        isGreeting: false,
      });
      setMessages((prev) => [...prev, { role: "ai", content: res.data.reply }]);
    } catch {
      toast.error("The companion couldn't respond right now.");
    } finally {
      setIsTyping(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e) => {
    // Enter to send, Shift+Enter for a newline.
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  // ---- Persist the conversation to MongoDB ----
  const saveConversation = async () => {
    if (saved || messages.length === 0) return;
    try {
      await api.post("/api/conversations/save", {
        emotion,
        messages: messages.map((m) => ({ role: m.role, content: m.content })),
      });
      setSaved(true);
      toast.success("Conversation saved to your history 📔");
    } catch {
      toast.error("Couldn't save the conversation.");
    }
  };

  const lastMessage = messages[messages.length - 1];
  const showQuickReplies = !isTyping && lastMessage?.role === "ai";

  return (
    <section className="companion">
      <header className="companion-head">
        <div>
          <span className="companion-eyebrow">Reflection Assistant</span>
          <h2 className="companion-title">🌿 Mood Companion</h2>
          <p className="companion-subtitle">
            A calm space to talk through what you're feeling. I'm here to listen.
          </p>
        </div>
      </header>

      <div className="companion-window">
        <div className="companion-messages" ref={scrollRef}>
          {messages.map((m, i) => (
            <ChatBubble key={i} role={m.role} content={m.content} />
          ))}
          {isTyping && <TypingIndicator />}
        </div>

        {showQuickReplies && (
          <QuickReplies onSend={send} onSave={saveConversation} />
        )}

        <div className="companion-input">
          <textarea
            ref={inputRef}
            className="companion-input-field"
            placeholder="Share what's on your mind..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
          />
          <button
            type="button"
            className="companion-send"
            onClick={() => send()}
            disabled={isTyping || !input.trim()}
            aria-label="Send message"
          >
            ➤
          </button>
        </div>

        {saved && (
          <p className="companion-saved-note">
            ✨ Thank you for sharing your thoughts today. Every emotion is a
            step toward understanding yourself.
          </p>
        )}
      </div>
    </section>
  );
}
