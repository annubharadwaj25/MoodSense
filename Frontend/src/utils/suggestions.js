/* ----------------------------------------------------------------
   suggestions.js — emotion → wellness suggestion map
   Each entry powers the Personalized Suggestion card on the
   Detect Emotion page. Pure data, no side effects.
---------------------------------------------------------------- */

export const SUGGESTIONS = {
  Happy: {
    emoji: "😊",
    title: "Keep Shining",
    items: [
      "Keep spreading positivity wherever you go.",
      "Write down three things you're grateful for today.",
      "Celebrate today's small wins, no matter how tiny.",
    ],
    closing: "Your happiness is contagious — let it light up your day. ✨",
  },

  Sad: {
    emoji: "💙",
    title: "Be Gentle With Yourself",
    items: [
      "Take a short walk outside, even just for a few minutes.",
      "Listen to calming, comforting music.",
      "Talk with someone you trust about how you feel.",
      "Write your thoughts down in your journal.",
    ],
    closing: "It's okay to feel this way. This moment will pass. 💙",
  },

  Angry: {
    emoji: "🌿",
    title: "Find Your Center",
    items: [
      "Practice slow, deep breathing for one minute.",
      "Step away from the situation for five minutes.",
      "Avoid reacting immediately — give it time.",
      "Drink some water and let your shoulders relax.",
    ],
    closing: "Your feelings are valid. Choose calm over reaction. 🌿",
  },

  Anxious: {
    emoji: "🤍",
    title: "Ground Yourself",
    items: [
      "Try the 4-7-8 breathing technique (inhale 4, hold 7, exhale 8).",
      "Focus on just one small task at a time.",
      "Notice and name your worry, then gently let it pass.",
      "Write down what's on your mind to release it.",
    ],
    closing: "You are safe in this moment, one breath at a time. 🤍",
  },

  Calm: {
    emoji: "🍃",
    title: "Savor The Peace",
    items: [
      "Maintain today's peaceful mindset for the rest of the day.",
      "Continue your healthy routine with intention.",
      "Reflect on today's positive moments before bed.",
    ],
    closing: "This calm is yours — carry it gently forward. 🍃",
  },

  Excited: {
    emoji: "🎉",
    title: "Channel The Energy",
    items: [
      "Channel your energy into something creative you love.",
      "Record today's achievements and what sparked this excitement.",
      "Share your happiness with someone who'd love to hear it.",
    ],
    closing: "Your enthusiasm is a gift — ride this wave! 🎉",
  },

  Stressed: {
    emoji: "🌙",
    title: "Release The Pressure",
    items: [
      "Take a short break — even five minutes counts.",
      "Stretch your body and release the tension you're holding.",
      "Reduce screen time for the next hour.",
      "Practice mindful breathing to slow your thoughts.",
    ],
    closing: "You don't have to carry it all at once. One step at a time. 🌙",
  },

  Fear: {
    emoji: "💪",
    title: "You Are Brave",
    items: [
      "Name what you're afraid of — saying it aloud shrinks it.",
      "Remind yourself of a time you overcame something hard.",
      "Focus on what's within your control right now.",
      "Take one small, safe action toward what scares you.",
    ],
    closing: "Courage isn't the absence of fear — it's moving forward anyway. 💪",
  },

  Neutral: {
    emoji: "🌤️",
    title: "A Quiet Moment",
    items: [
      "Check in with yourself — how does your body feel right now?",
      "Do one small thing that brings you comfort.",
      "Take three slow breaths and notice the present moment.",
    ],
    closing: "Even neutral days are worth noticing. 🌤️",
  },
};

const DEFAULT_SUGGESTION = SUGGESTIONS.Neutral;

/**
 * Look up the suggestion object for a given emotion string.
 * Falls back gracefully to Neutral for unexpected values.
 * @param {string} emotion
 */
export function getSuggestion(emotion) {
  return SUGGESTIONS[emotion] || DEFAULT_SUGGESTION;
}
