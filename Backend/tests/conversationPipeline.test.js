/**
 * conversationPipeline.test.js
 * Automated unit test suite verifying:
 * 1. Clean session start (no cross-session state leakage)
 * 2. Scenario 1: "I am happy" → Cheerful supportive reply
 * 3. Scenario 2: "I lost my phone" → Empathy + practical steps
 * 4. Scenario 3: "How do I use my new iPhone?" → Actual phone guidance
 * 5. Scenario 4: "I am sad because my exams went badly." → Emotional support
 */

const { generateReply } = require("../services/companionEngine");

function assert(condition, message) {
    if (!condition) {
        throw new Error(`❌ ASSERTION FAILED: ${message}`);
    }
}

console.log("=== RUNNING CONVERSATION PIPELINE UNIT TESTS ===\n");

// 1. Verify Clean Session Start
console.log("Test 1: Clean Session Start");
const session1 = generateReply({
    messages: [{ role: "user", content: "I am sad" }],
    emotion: "Sad",
    userName: "User1",
});
const session2 = generateReply({
    messages: [{ role: "user", content: "I am happy" }],
    emotion: "Happy",
    userName: "User2",
});

assert(session1.intent === "EMOTIONAL_SHARING", "Session 1 intent should be EMOTIONAL_SHARING");
assert(session2.intent === "EMOTIONAL_SHARING", "Session 2 intent should be EMOTIONAL_SHARING");
assert(session2.reply.includes("wonderful") || session2.reply.includes("glad") || session2.reply.includes("great"), "Session 2 should receive happy response");
console.log("✅ Test 1 Passed: Clean state maintained between independent turns.\n");

// 2. Scenario 1: "I am happy"
console.log("Test 2: Scenario 1 - 'I am happy'");
const r1 = generateReply({
    messages: [{ role: "user", content: "I am happy" }],
    emotion: "Happy",
});
assert(r1.intent === "EMOTIONAL_SHARING", "Intent must be EMOTIONAL_SHARING");
assert(r1.topic === "wellness", "Topic must be wellness");
assert(!r1.reply.includes("device") && !r1.reply.includes("app"), "Should not contain tech device templates");
console.log("✅ Test 2 Passed: 'I am happy' gets a warm, cheerful reply.\n");

// 3. Scenario 2: "I lost my phone"
console.log("Test 3: Scenario 2 - 'I lost my phone'");
const r2 = generateReply({
    messages: [{ role: "user", content: "I lost my phone" }],
    emotion: "Sad",
});
assert(r2.intent === "TECHNICAL_QUERY", "Intent must be TECHNICAL_QUERY");
assert(r2.topic === "technology", "Topic must be technology");
assert(r2.reply.includes("Find My") || r2.reply.includes("calling"), "Reply must include practical steps like Find My");
console.log("✅ Test 3 Passed: 'I lost my phone' gets empathy + practical advice.\n");

// 4. Scenario 3: "How do I use my new iPhone?"
console.log("Test 4: Scenario 3 - 'How do I use my new iPhone?'");
const r3 = generateReply({
    messages: [{ role: "user", content: "How do I use my new iPhone?" }],
    emotion: "Neutral",
});
assert(r3.intent === "TECHNICAL_QUERY", "Intent must be TECHNICAL_QUERY");
assert(r3.topic === "technology", "Topic must be technology");
assert(r3.reply.includes("iPhone") || r3.reply.includes("Quick Start"), "Reply must give actual iPhone setup guidance");
console.log("✅ Test 4 Passed: 'How do I use my new iPhone?' gives actual phone guidance.\n");

// 5. Scenario 4: "I am sad because my exams went badly."
console.log("Test 5: Scenario 4 - 'I am sad because my exams went badly.'");
const r4 = generateReply({
    messages: [{ role: "user", content: "I am sad because my exams went badly." }],
    emotion: "Sad",
});
assert(r4.intent === "EMOTIONAL_SHARING", "Intent must be EMOTIONAL_SHARING");
assert(r4.reply.includes("exams") || r4.reply.includes("effort") || r4.reply.includes("valid"), "Reply must offer genuine emotional support");
console.log("✅ Test 5 Passed: Exam sadness gets genuine emotional support.\n");

console.log("=== ALL 5 UNIT TESTS PASSED SUCCESSFULLY! 🎉 ===");
