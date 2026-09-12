import { useState, useEffect, useRef, useCallback } from "react";
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
  const [isStreaming, setIsStreaming] = useState(false);

  const [initError, setInitError] = useState(false);

  const scrollRef = useRef(null);
  const inputRef = useRef(null);
  const abortControllerRef = useRef(null);

  const emotion = initialEmotion || "Neutral";
  const name = userName || "friend";

  // ---- Kick off the conversation with a personalized greeting ----
  const openConversation = useCallback(async () => {
    if (isStreaming) return;
    setIsTyping(true);
    setIsStreaming(true);
    setInitError(false);
    
    abortControllerRef.current = new AbortController();
    
    try {
      const response = await fetch(`${api.defaults.baseURL}/api/chat/stream`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          messages: [
            {
              role: "user",
              content: originalText || "Hi, I'd like to talk about how I'm feeling.",
            },
          ],
          emotion,
          originalText,
          userName: name,
          isGreeting: true,
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error("Stream request failed");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      
      setMessages([{ role: "user", content: originalText }]);
      
      let aiMessage = { role: "ai", content: "" };
      setMessages((prev) => [...prev, aiMessage]);

      let buffer = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        buffer += decoder.decode(value, { stream: true });
        // Normalize line endings and split
        const lines = buffer.replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n");
        
        // Keep the last line if it's incomplete (might be a partial data line)
        buffer = lines.pop() || "";
        
        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.error) {
                throw new Error(data.text);
              }
              if (data.text) {
                aiMessage = { ...aiMessage, content: aiMessage.content + data.text };
                setMessages((prev) => {
                  const updated = [...prev];
                  updated[updated.length - 1] = aiMessage;
                  return updated;
                });
              }
            } catch (e) {
              // Skip invalid JSON
            }
          }
        }
      }
    } catch (err) {
      if (err.name !== "AbortError") {
        setInitError(true);
        toast.error("The companion couldn't start the conversation.");
      }
    } finally {
      setIsTyping(false);
      setIsStreaming(false);
      abortControllerRef.current = null;
    }
  }, [emotion, name, originalText, isStreaming]);

  useEffect(() => {
    const startConversation = setTimeout(openConversation, 0);
    return () => clearTimeout(startConversation);
  }, [openConversation]);

  // ---- Auto-scroll to the latest message ----
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  // ---- Send a message (from input box or a quick-reply chip) ----
  const send = async (text) => {
    const content = (text ?? input).trim();
    if (!content || isTyping || isStreaming) return;

    const userMsg = { role: "user", content };
    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setInput("");
    setIsTyping(true);
    setIsStreaming(true);

    abortControllerRef.current = new AbortController();

    try {
      const response = await fetch(`${api.defaults.baseURL}/api/chat/stream`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          messages: nextMessages.map((m) => ({ role: m.role, content: m.content })),
          emotion,
          originalText,
          userName: name,
          isGreeting: false,
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error("Stream request failed");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      
      let aiMessage = { role: "ai", content: "" };
      setMessages((prev) => [...prev, aiMessage]);

      let buffer = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        buffer += decoder.decode(value, { stream: true });
        // Normalize line endings and split
        const lines = buffer.replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n");
        
        // Keep the last line if it's incomplete (might be a partial data line)
        buffer = lines.pop() || "";
        
        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.error) {
                throw new Error(data.text);
              }
              if (data.text) {
                aiMessage = { ...aiMessage, content: aiMessage.content + data.text };
                setMessages((prev) => {
                  const updated = [...prev];
                  updated[updated.length - 1] = aiMessage;
                  return updated;
                });
              }
            } catch (e) {
              // Skip invalid JSON
            }
          }
        }
      }
    } catch (err) {
      if (err.name !== "AbortError") {
        toast.error("The companion couldn't respond right now.");
        // Remove the empty AI message on error
        setMessages((prev) => prev.slice(0, -1));
      }
    } finally {
      setIsTyping(false);
      setIsStreaming(false);
      abortControllerRef.current = null;
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
          {initError && messages.length === 0 && (
            <div className="companion-error-fallback" style={{
              display: "flex", flexDirection: "column", alignItems: "center",
              justifyContent: "center", padding: "2rem", textAlign: "center",
              color: "var(--text-secondary, #8a8580)", gap: "1rem", height: "100%"
            }}>
              <p>😔 The companion couldn't connect right now.</p>
              <button
                type="button"
                className="detect-btn"
                onClick={openConversation}
                style={{ fontSize: "0.9rem", padding: "0.5rem 1.5rem" }}
              >
                🔄 Try Again
              </button>
            </div>
          )}
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
            disabled={isTyping || isStreaming || !input.trim()}
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
