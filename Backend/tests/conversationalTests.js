/**
 * conversationalTests.js
 * ----------------------------------------------------------------
 * Comprehensive Conversational Scenario Test Suite for Mood Companion Backend.
 * Tests 6 scenarios:
 * 1. Happy → asks technical question
 * 2. Sad → asks career advice
 * 3. Angry → asks factual question
 * 4. Relationship → changes to study discussion
 * 5. Celebration → casual conversation
 * 6. Multiple topic switches
 * ----------------------------------------------------------------
 */

const ConversationManager = require("../services/conversation/ConversationManager");

function runScenario(title, emotion, turns) {
    console.log(`\n=== SCENARIO: ${title} ===`);
    const manager = new ConversationManager();
    const messages = [];

    turns.forEach((turnText, index) => {
        messages.push({ role: "user", content: turnText });
        const result = manager.processTurn({
            messages,
            emotion,
            userName: "Alex",
        });
        messages.push({ role: "ai", content: result.reply });

        console.log(`\nTurn ${index + 1}:`);
        console.log(`User (${emotion}): "${turnText}"`);
        console.log(`AI [Intent: ${result.intent} | Topic: ${result.topic} | State: ${result.dialogueState}]:`);
        console.log(`"${result.reply}"`);
    });
}

function runAllTests() {
    console.log("=================================================");
    console.log("   MOOD COMPANION CONVERSATIONAL TEST SUITE");
    console.log("=================================================");

    // Test 1: Happy → technical question
    runScenario("1. Happy → Technical Question", "Happy", [
        "I am having such a fantastic and joyful day today!",
        "How do I reset my Wi-Fi router?",
    ]);

    // Test 2: Sad → career advice
    runScenario("2. Sad → Career Advice", "Sad", [
        "I am feeling really down, sad, and lonely today.",
        "What should I do to prepare for my job interview tomorrow?",
    ]);

    // Test 3: Angry → factual question
    runScenario("3. Angry → Factual Question", "Angry", [
        "I am furious and mad about everything right now!",
        "What is photosynthesis?",
    ]);

    // Test 4: Relationship → changes to study discussion
    runScenario("4. Relationship → Study Discussion", "Anxious", [
        "My boyfriend and I had a huge argument and I feel upset.",
        "Anyway, how should I study for my math exam?",
    ]);

    // Test 5: Celebration → casual conversation
    runScenario("5. Celebration → Casual Conversation", "Excited", [
        "I just passed my final university exam! Yay!",
        "What do you think is a fun way to relax this weekend?",
    ]);

    // Test 6: Multiple topic switches
    runScenario("6. Multiple Topic Switches", "Neutral", [
        "How do I change my phone password?",
        "My best friend is really upset with me.",
        "Should I update my resume for a new job?",
        "Why is the sky blue?",
    ]);

    console.log("\n=================================================");
    console.log("   ALL CONVERSATIONAL TESTS COMPLETED SUCCESSFULLY");
    console.log("=================================================\n");
}

runAllTests();
