/**
 * MemoryManager.js
 * ----------------------------------------------------------------
 * Manages short-term conversation memory, extracts key entities/facts,
 * and maintains context across multiple turns.
 * ----------------------------------------------------------------
 */

class MemoryManager {
    /**
     * Extracts memory context from the conversation history.
     * @param {Array} messages - [{ role: 'user'|'ai', content: string }]
     * @returns {Object} Memory context containing recent history, entities, and message count
     */
    static getMemoryContext(messages = []) {
        const normalizedMessages = (Array.isArray(messages) ? messages : []).filter(
            (m) => m && typeof m.content === "string" && m.content.trim().length > 0
        );

        const userMessages = normalizedMessages
            .filter((m) => m.role === "user")
            .map((m) => m.content.trim());
        
        const aiMessages = normalizedMessages
            .filter((m) => m.role === "ai")
            .map((m) => m.content.trim());

        const entities = this.extractEntities(userMessages);
        const historySummary = this.summarizeHistory(normalizedMessages.slice(-6));

        return {
            totalTurns: normalizedMessages.length,
            userMessageCount: userMessages.length,
            aiMessageCount: aiMessages.length,
            latestUserMessage: userMessages[userMessages.length - 1] || "",
            previousUserMessage: userMessages[userMessages.length - 2] || "",
            recentHistory: normalizedMessages.slice(-8),
            entities,
            historySummary,
        };
    }

    /**
     * Extracts mentioned entities and subjects from recent user messages.
     * @param {Array<string>} userMessages 
     * @returns {Object} Extracted entities by topic area
     */
    static extractEntities(userMessages = []) {
        const text = userMessages.slice(-5).join(" ").toLowerCase();
        const entities = {
            devices: [],
            subjects: [],
            roles: [],
        };

        if (/\b(wifi|wi-fi|router|internet|connection)\b/.test(text)) entities.devices.push("Wi-Fi network");
        if (/\b(phone|mobile|iphone|android)\b/.test(text)) entities.devices.push("mobile phone");
        if (/\b(laptop|computer|pc|desktop)\b/.test(text)) entities.devices.push("computer");

        if (/\b(math|algebra|calculus|exam|test|homework|study|physics|chemistry|essay)\b/.test(text)) {
            entities.subjects.push("academics/studies");
        }
        if (/\b(job|interview|career|resume|salary|promotion|boss|work)\b/.test(text)) {
            entities.subjects.push("career/work");
        }
        if (/\b(partner|boyfriend|girlfriend|husband|wife|friend|relationship)\b/.test(text)) {
            entities.roles.push("interpersonal relationship");
        }

        return entities;
    }

    /**
     * Creates a concise text summary of recent exchanges.
     * @param {Array} recentTurns 
     * @returns {string} Summary string
     */
    static summarizeHistory(recentTurns = []) {
        if (recentTurns.length === 0) return "No previous context.";
        return recentTurns
            .map((m) => `${m.role === "user" ? "User" : "AI"}: "${m.content.slice(0, 80)}"`)
            .join(" | ");
    }
}

module.exports = MemoryManager;
