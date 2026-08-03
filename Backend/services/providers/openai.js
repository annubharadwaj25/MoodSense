/**
 * openai.js — OpenAI provider for emotion detection + chat
 * ----------------------------------------------------------------
 * Uses native `fetch` (Node 18+) to call the OpenAI Chat Completions
 * API. No extra npm dependencies required.
 *
 * - detect(): classifies text into one of 9 emotions with confidence.
 * - chat(): generates a warm, context-aware wellness companion reply.
 *
 * Model: gpt-4o-mini (fast, cheap, excellent for this use-case).
 * ----------------------------------------------------------------
 */

const MODEL = "gpt-4o-mini";

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
- Ask a relevant follow-up only when it adds value; do not force one after a complete answer.
- Keep responses concise (2-4 sentences) but never robotic or one-line.
- Never claim to be a therapist or offer medical/psychiatric advice.
- Never diagnose, prescribe, or suggest stopping medication.
- If the user expresses severe distress, gently suggest speaking with a professional.

Style:
- Use the occasional emoji to feel human (😊🌿💙).
- Avoid generic chatbot phrases like "How can I help you today?"
- Do not use stock celebration lines such as "I'm happy for you", "Share this with someone", or "Enjoy this moment" unless they fit the latest message.
- Reference what the user actually said — show that you're listening.
- Be non-judgmental and validating.

The user's current detected emotion context will be provided. Use it to personalize your responses, but always follow the user's actual words as the primary guide.`;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function createCompletion(messages, maxTokens = 512) {
    return fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
            model: MODEL,
            messages,
            max_tokens: maxTokens,
            temperature: 0.6,
        }),
    });
}

async function parseJSONResponse(response) {
    const data = await response.json();

    if (data.error) {
        throw new Error(data.error.message || "OpenAI API error");
    }

    const content = data.choices?.[0]?.message?.content;
    if (!content) {
        throw new Error("Empty response from OpenAI");
    }

    return content.trim();
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Detect emotion from text using OpenAI.
 * @param {string} text
 * @returns {{ emotion: string, confidence: number, timestamp: string }}
 */
async function detect(text) {
    const response = await createCompletion([
        { role: "system", content: DETECT_SYSTEM },
        { role: "user", content: text },
    ], 128);

    const raw = await parseJSONResponse(response);

    // Strip markdown code fences if the model wrapped the JSON.
    let cleaned = raw;
    if (cleaned.startsWith("```")) {
        cleaned = cleaned.replace(/^```(?:json)?\s*/, "").replace(/\s*```$/, "");
    }

    let parsed;
    try {
        parsed = JSON.parse(cleaned);
    } catch {
        throw new Error(`Failed to parse OpenAI response: ${raw}`);
    }

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
 * Generate a wellness companion chat response using OpenAI.
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

    const apiMessages = [
        { role: "system", content: systemContent },
        // Send the last 10 messages for context (avoid hitting token limits)
        ...messages.slice(-10).map((m) => ({
            role: m.role === "ai" ? "assistant" : "user",
            content: m.content,
        })),
    ];

    const response = await createCompletion(apiMessages, 256);
    const reply = await parseJSONResponse(response);

    return { reply, provider: "openai", intent, topic };
}

module.exports = { detect, chat };
