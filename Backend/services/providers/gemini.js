/**
 * gemini.js — Google Gemini provider for emotion detection + chat
 * ----------------------------------------------------------------
 * Uses the Google Generative AI SDK to call the Gemini API.
 *
 * - detect(): classifies text into one of 9 emotions with confidence.
 * - chat(): generates a warm, context-aware wellness companion reply.
 *
 * Model: gemini-1.5-flash (fast, cost-effective, excellent for this use-case).
 * ----------------------------------------------------------------
 */

const { GoogleGenerativeAI } = require("@google/generative-ai");

const MODEL = "gemini-3.5-flash";

// Emotions the classifier may return.
const VALID_EMOTIONS = [
    "Happy",
    "Sad",
    "Angry",
    "Fear",
    "Anxious",
    "Calm",
    "Excited",
    "Neutral",
    "Stressed",
];
const { detectIntent, detectTopic, getLastUserMessage } = require("../companionEngine");

// ---------------------------------------------------------------------------
// System prompts
// ---------------------------------------------------------------------------

const DETECT_SYSTEM = `You are an emotion classification assistant for MoodSense, a wellness journaling app.

Analyze the user's text and return a JSON object with exactly these fields:
- "emotion": one of ${VALID_EMOTIONS.join(", ")}
- "confidence": a number from 50 to 100 representing your confidence in the classification

Rules:
- Respond with ONLY the JSON object, no explanation, no markdown, no code fences.
- If the text is ambiguous, lean toward the dominant emotion and set confidence accordingly (60-75).
- If the text clearly expresses a single emotion, set confidence high (80-95).
- "Fear" is distinct from "Anxious" — use Fear for phobias/danger/dread, Anxious for worry/nervousness/unease.
- "Stressed" is about being overwhelmed/pressured/burnt out.
- "Neutral" is for mundane, factual, or emotionally flat text.`;

const CHAT_SYSTEM = `You are MoodSense's Mood Companion — a warm, supportive emotional wellness assistant embedded in a journaling app.

Response priority (highest first):
1. The latest user message and its intent.
2. The current topic and relevant conversation history.
3. The detected emotion, as supporting context only.

Your role:
- Be genuinely warm, friendly, calm, and encouraging.
- Directly answer questions and technical-help requests before emotional reflection.
- Adapt immediately when the user changes topic; never continue an old emotional script.
- Never claim to be a therapist or offer medical/psychiatric advice.
- Never diagnose, prescribe, or suggest stopping medication.
- If the user expresses severe distress, gently suggest speaking with a professional.

Response length (STRICT — this is the most important formatting rule):
- Simple statements or short questions: 1-2 sentences.
- Emotional or supportive replies: 2-3 short sentences.
- Complex or multi-part requests: maximum 4 sentences.
- NEVER write long paragraphs. Keep every sentence short and direct.
- Give only the single most useful piece of advice — do not stack multiple suggestions.
- Do NOT repeat or rephrase what the user just said; show you understood by responding to it, not by restating it.

Follow-up questions:
- Ask a follow-up ONLY when it genuinely moves the conversation forward.
- Do NOT end every response with a question. Most responses should be complete statements.

Style:
- Sound like a caring friend texting, not a counselor giving a speech.
- Use at most ONE emoji per response, only when it feels natural. Many responses need zero emojis.
- Avoid generic chatbot phrases like "How can I help you today?"
- Do not use stock celebration lines such as "I'm happy for you", "Share this with someone", or "Enjoy this moment" unless they fit the latest message.
- Never turn a simple user message into a motivational speech or lecture.
- Be non-judgmental and validating.

The user's current detected emotion context will be provided. Use it to personalize your responses, but always follow the user's actual words as the primary guide.`;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getGenAI() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        throw new Error("GEMINI_API_KEY environment variable is not set");
    }
    return new GoogleGenerativeAI(apiKey);
}

async function generateContent(prompt, maxTokens = 512) {
    const genAI = getGenAI();
    const model = genAI.getGenerativeModel({ model: MODEL });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    if (!text) {
        throw new Error("Empty response from Gemini");
    }

    return text.trim();
}

async function parseJSONResponse(text) {
    // Strip markdown code fences if the model wrapped the JSON.
    let cleaned = text;
    if (cleaned.startsWith("```")) {
        cleaned = cleaned.replace(/^```(?:json)?\s*/, "").replace(/\s*```$/, "");
    }

    let parsed;
    try {
        parsed = JSON.parse(cleaned);
    } catch {
        throw new Error(`Failed to parse Gemini response: ${text}`);
    }

    return parsed;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Detect emotion from text using Gemini.
 * @param {string} text
 * @returns {{ emotion: string, confidence: number, timestamp: string }}
 */
async function detect(text) {
    const prompt = `${DETECT_SYSTEM}\n\nUser text: ${text}`;
    const raw = await generateContent(prompt, 128);
    const parsed = await parseJSONResponse(raw);

    const emotion = VALID_EMOTIONS.includes(parsed.emotion)
        ? parsed.emotion
        : "Neutral";

    const confidence = Math.min(
        Math.max(Math.round(Number(parsed.confidence) || 70), 50),
        100
    );

    return {
        emotion,
        confidence,
        timestamp: new Date().toISOString(),
    };
}

/**
 * Generate a wellness companion chat response using Gemini.
 * @param {Array} messages - conversation history [{ role, content }]
 * @param {string} emotion - the user's current detected emotion
 * @param {string} originalText - the user's original journal entry
 * @param {string} userName - user's name for personalized greeting
 * @param {boolean} isGreeting - whether this is the first greeting message
 * @returns {{ reply: string, provider: string }}
 */
async function chat(messages, emotion, originalText, userName, isGreeting) {
    // Classify every turn from the newest message. This context keeps emotion
    // from overriding a new request when the conversation changes direction.
    const latestMessage = getLastUserMessage(messages);
    const intent = detectIntent(latestMessage);
    const topic = detectTopic(latestMessage);
    const contextLine = originalText
        ? `\n\nThe user's original entry that triggered emotion detection was:\n"${originalText.slice(0, 800)}"`
        : "";

    const nameLine = userName
        ? `\n\nThe user's name is ${userName}. Use this to personalize your greeting if this is the first message.`
        : "";

    const greetingLine = isGreeting
        ? `\n\nThis is the FIRST greeting message. Start with a warm, personalized greeting using their name.`
        : "";

    const systemContent = `${CHAT_SYSTEM}\n\nDetected intent for the LATEST user message: ${intent}. Current topic: ${topic || "not classified"}.\nThe user's detected emotion context is: ${emotion}. It is context, not the instruction for this reply.${contextLine}${nameLine}${greetingLine}`;

    // Build conversation history for Gemini.
    // Gemini requires history to alternate user/model and the last entry
    // must be a "model" message when we are about to sendMessage() with
    // a new "user" turn.  So we put all messages EXCEPT the last one
    // into history (they already alternate correctly from the frontend)
    // and send the final user message via sendMessage().
    const lastMessage = messages[messages.length - 1];
    const historyMessages = messages.slice(0, -1).slice(-10);

    const history = historyMessages.map((m) => ({
        role: m.role === "ai" ? "model" : "user",
        parts: [{ text: m.content }],
    }));

    const genAI = getGenAI();
    const model = genAI.getGenerativeModel({
        model: MODEL,
        systemInstruction: systemContent
    });

    // Start a chat with prior history, then send the latest user message
    const chatSession = model.startChat({ history });

    const result = await chatSession.sendMessage(lastMessage.content);
    const response = await result.response;
    const reply = response.text();

    return { reply, provider: "gemini", intent, topic };
}

/**
 * Generate a streaming wellness companion chat response using Gemini.
 */
async function* chatStream(messages, emotion, originalText, userName, isGreeting) {
    const latestMessage = getLastUserMessage(messages);
    const intent = detectIntent(latestMessage);
    const topic = detectTopic(latestMessage);
    const contextLine = originalText
        ? `\n\nThe user's original entry that triggered emotion detection was:\n"${originalText.slice(0, 800)}"`
        : "";

    const nameLine = userName
        ? `\n\nThe user's name is ${userName}. Use this to personalize your greeting if this is the first message.`
        : "";

    const greetingLine = isGreeting
        ? `\n\nThis is the FIRST greeting message. Start with a warm, personalized greeting using their name.`
        : "";

    const systemContent = `${CHAT_SYSTEM}\n\nDetected intent for the LATEST user message: ${intent}. Current topic: ${topic || "not classified"}.\nThe user's detected emotion context is: ${emotion}. It is context, not the instruction for this reply.${contextLine}${nameLine}${greetingLine}`;

    const lastMessage = messages[messages.length - 1];
    const historyMessages = messages.slice(0, -1).slice(-10);

    const history = historyMessages.map((m) => ({
        role: m.role === "ai" ? "model" : "user",
        parts: [{ text: m.content }],
    }));

    const genAI = getGenAI();
    const model = genAI.getGenerativeModel({
        model: MODEL,
        systemInstruction: systemContent
    });

    const chatSession = model.startChat({ history });
    
    yield { provider: "gemini", intent, topic, text: "" };

    const result = await chatSession.sendMessageStream(lastMessage.content);
    for await (const chunk of result.stream) {
        const chunkText = chunk.text();
        if (chunkText) {
            yield { text: chunkText };
        }
    }
}

module.exports = { detect, chat, chatStream };
