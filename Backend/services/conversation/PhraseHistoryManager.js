/**
 * PhraseHistoryManager.js
 * ----------------------------------------------------------------
 * Tracks recent opening phrases, transitions, and question styles
 * across a conversation session to enforce variety and eliminate repetition.
 * ----------------------------------------------------------------
 */

class PhraseHistoryManager {
    constructor() {
        this.usedOpeners = new Set();
        this.usedTransitions = new Set();
        this.usedFollowups = new Set();
    }

    /**
     * Extracts signature phrases from text and checks if any were recently used.
     * @param {string} text 
     * @returns {boolean} True if text contains a repeated phrase
     */
    isRepetitive(text = "") {
        const lower = text.toLowerCase().trim();
        return (
            this.usedOpeners.has(lower) ||
            Array.from(this.usedOpeners).some((op) => lower.startsWith(op.slice(0, 20)))
        );
    }

    /**
     * Records used phrases into phrase memory.
     * @param {string} opener 
     * @param {string} transition 
     * @param {string} followup 
     */
    record(opener = "", transition = "", followup = "") {
        if (opener) this.usedOpeners.add(opener.toLowerCase().trim());
        if (transition) this.usedTransitions.add(transition.toLowerCase().trim());
        if (followup) this.usedFollowups.add(followup.toLowerCase().trim());

        // Keep set size manageable (max 15 items)
        if (this.usedOpeners.size > 15) {
            const first = Array.from(this.usedOpeners)[0];
            this.usedOpeners.delete(first);
        }
    }

    /**
     * Pick a non-repetitive phrase option from an array of choices.
     * @param {Array<string>} choices 
     * @returns {string} Selected unique choice
     */
    selectUnique(choices = []) {
        if (!Array.isArray(choices) || choices.length === 0) return "";
        
        for (const choice of choices) {
            const lower = choice.toLowerCase().trim();
            if (!this.usedOpeners.has(lower)) {
                this.record(choice);
                return choice;
            }
        }
        
        // Fallback if all choices were used: return the first and reset
        const selected = choices[0];
        this.record(selected);
        return selected;
    }
}

module.exports = PhraseHistoryManager;
