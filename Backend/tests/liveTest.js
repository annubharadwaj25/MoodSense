/**
 * liveTest.js — Test the RUNNING backend via HTTP requests
 * Registers/logs in a test user, then sends the 4 required chat scenarios.
 */

const BASE = "http://localhost:5000";

async function post(path, body, token) {
    const headers = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;
    const res = await fetch(`${BASE}${path}`, {
        method: "POST",
        headers,
        body: JSON.stringify(body),
    });
    return res.json();
}

async function getToken() {
    const email = `testuser_${Date.now()}@test.com`;
    const password = "testpass123";
    const username = "TestUser";

    // Register
    await post("/api/auth/register", { username, email, password });
    // Login
    const loginRes = await post("/api/auth/login", { email, password });
    if (!loginRes.token) {
        throw new Error("Login failed: " + JSON.stringify(loginRes));
    }
    return loginRes.token;
}

async function testChat(token, scenario, messages, emotion) {
    console.log(`\n========== SCENARIO: ${scenario} ==========`);
    const res = await post("/api/chat", {
        messages,
        emotion,
        userName: "Alex",
        isGreeting: false,
    }, token);

    console.log(`Emotion Context: ${emotion}`);
    console.log(`User Message: "${messages[messages.length - 1].content}"`);
    console.log(`AI Reply: "${res.reply}"`);
    console.log(`Intent: ${res.intent || "N/A"}`);
    console.log(`Topic: ${res.topic || "N/A"}`);
    console.log(`Provider: ${res.provider || "N/A"}`);
    console.log(`==========================================\n`);
    return res;
}

async function main() {
    console.log("=== LIVE BACKEND CONVERSATIONAL TEST ===\n");

    const token = await getToken();
    console.log("✅ Auth token obtained\n");

    // Scenario 1: "I am happy"
    await testChat(token, "1. I am happy", [
        { role: "user", content: "I am happy" }
    ], "Happy");

    // Scenario 2: "I lost my phone"
    await testChat(token, "2. I lost my phone", [
        { role: "user", content: "I lost my phone" }
    ], "Sad");

    // Scenario 3: "How do I use my new iPhone?"
    await testChat(token, "3. How do I use my new iPhone?", [
        { role: "user", content: "How do I use my new iPhone?" }
    ], "Neutral");

    // Scenario 4: "I am sad because my exams went badly."
    await testChat(token, "4. I am sad because my exams went badly.", [
        { role: "user", content: "I am sad because my exams went badly." }
    ], "Sad");

    console.log("=== ALL LIVE TESTS COMPLETED ===\n");
}

main().catch(console.error);
