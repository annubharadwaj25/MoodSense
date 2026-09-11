const detectEmotion = require("../../utils/detectEmotion");
const { generateReply } = require("../companionEngine");

function estimateConfidence(text, emotion) {
    if (!text) return 55;
    const words = text.split(/\s+/).length;
    const base = Math.min(55 + Math.floor(words / 8), 75);
    return Math.min(base + (emotion !== "Neutral" ? 12 : 0), 92);
}

async function detect(text) {
    const emotion = detectEmotion(text);
    return {
        emotion,
        confidence: estimateConfidence(text, emotion),
        timestamp: new Date().toISOString(),
    };
}

async function chat(messages, emotion, originalText, userName, isGreeting) {
    const result = generateReply({ messages, emotion, originalText, userName, isGreeting });
    return { ...result, provider: "keyword" };
}

module.exports = { detect, chat };
