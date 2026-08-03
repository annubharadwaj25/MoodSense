/**
 * keyword.js — Keyword-based emotion provider (fallback)
 * ----------------------------------------------------------------
 * Wraps the existing detectEmotion utility for emotion classification
 * and adds a lightweight confidence estimation based on match density.
 *
 * Used when no AI API key is configured.
 * Chat returns a pre-written supportive response (not real AI).
 * ----------------------------------------------------------------
 */

const detectEmotion = require("../../utils/detectEmotion");
const { generateReply } = require("../companionEngine");

// Emotion emoji mapping for consistent frontend display.
const EMOJI_MAP = {
    Happy: "😊",
    Sad: "😔",
    Calm: "😌",
    Angry: "😠",
    Anxious: "😟",
    Excited: "🤩",
    Neutral: "😐",
    Stressed: "😣",
    Fear: "😨",
};

// Supportive responses per emotion (legacy fallback — prefer companionEngine).
const CHAT_RESPONSES = {
    Happy:
        "That's wonderful to hear! 😊 What's been bringing you this joy today? I'd love to hear more about what made you smile.",
    Sad:
        "I hear you, and it's okay to feel this way. 💙 Sometimes acknowledging our sadness is the first step toward healing. Would you like to tell me more about what's on your mind?",
    Calm:
        "It sounds like you're in a peaceful place right now. 🌿 That's a beautiful state to be in. What's helping you maintain this sense of calm?",
    Angry:
        "Feeling angry is completely natural — it often tells us that something important to us has been crossed. 🔥 Would you like to explore what triggered this feeling?",
    Anxious:
        "Anxiety can feel overwhelming, but you're doing the right thing by expressing it. 🤝 What's been weighing on your mind the most lately?",
    Excited:
        "That energy sounds contagious! 🎉 What are you most looking forward to? I'd love to help you channel that excitement.",
    Neutral:
        "Sometimes a quiet, neutral day is exactly what we need. 🌤️ Is there anything you'd like to reflect on, or anything that stood out to you today?",
    Stressed:
        "It sounds like you're carrying a lot right now. Remember, you don't have to handle everything alone. 🌿 What part of your day feels the heaviest?",
    Fear:
        "Fear can be powerful, but facing it — even by writing about it — takes real courage. 💪 Would you like to tell me more about what's causing this feeling?",
};

/**
 * Estimate confidence from text length and keyword density.
 * Returns 55–92 (never 100 since keyword matching is approximate).
 */
function estimateConfidence(text, emotion) {
    if (!text) return 55;
    const words = text.split(/\s+/).length;
    // Longer texts with more emotional words → higher confidence
    const base = Math.min(55 + Math.floor(words / 8), 75);
    // Boost slightly if the emotion isn't Neutral (Neutral is a fallback)
    const boost = emotion !== "Neutral" ? 12 : 0;
    return Math.min(base + boost, 92);
}

/**
 * Detect emotion using keyword matching.
 * @param {string} text
 * @returns {{ emotion: string, confidence: number, timestamp: string }}
 */
async function detect(text) {
    const emotion = detectEmotion(text);
    const confidence = estimateConfidence(text, emotion);
    return {
        emotion,
        confidence,
        timestamp: new Date().toISOString(),
    };
}

/**
 * Generate a chat response using the companion engine for context-aware replies.
 * @param {Array} messages - [{ role: "user"|"ai", content: string }]
 * @param {string} emotion - the user's current detected emotion
 * @param {string} originalText - the user's original journal entry
 * @param {string} userName - user's name for personalized greeting
 * @param {boolean} isGreeting - whether this is the first greeting message
 * @returns {{ reply: string, provider: string }}
 */
async function chat(messages, emotion, originalText, userName, isGreeting) {
    console.log("[KEYWORD PROVIDER] chat() called — delegating to companionEngine.generateReply");
    console.log("[KEYWORD PROVIDER] emotion received:", emotion);
    console.log("[KEYWORD PROVIDER] message count:", messages?.length);
    const result = generateReply({ messages, emotion, originalText, userName, isGreeting });
    console.log("[KEYWORD PROVIDER] final provider tag: keyword");
    return { ...result, provider: "keyword" };
}

module.exports = { detect, chat };
