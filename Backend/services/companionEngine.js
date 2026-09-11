/**
 * companionEngine.js — Refactored Companion Engine
 * ----------------------------------------------------------------
 * Delegates chat processing to the new modular Conversation Architecture.
 *
 * IMPORTANT: A fresh ConversationManager is created per generateReply()
 * call so that phrase history from one conversation never leaks into
 * another. The frontend sends the full message array each time, so
 * statefulness lives in that array — not in a server-side singleton.
 * ----------------------------------------------------------------
 */

const ConversationManager = require("./conversation/ConversationManager");
const { IntentClassifier, INTENTS } = require("./conversation/IntentClassifier");
const { TopicTracker } = require("./conversation/TopicTracker");
const MemoryManager = require("./conversation/MemoryManager");

function getLastUserMessage(messages = []) {
    const memoryContext = MemoryManager.getMemoryContext(messages);
    return memoryContext.latestUserMessage;
}

function detectTopic(text) {
    return TopicTracker.detectTopic(text);
}

function detectIntent(text) {
    return IntentClassifier.classify(text);
}

function generateReply({ messages = [], emotion = "Neutral", userName = "friend", isGreeting = false }) {
    // Fresh manager per call — no cross-conversation state leakage
    const manager = new ConversationManager();

    const result = manager.processTurn({ messages, emotion, userName, isGreeting });

    return result;
}

module.exports = {
    INTENTS,
    detectIntent,
    detectTopic,
    generateReply,
    getLastUserMessage,
    ConversationManager,
};
