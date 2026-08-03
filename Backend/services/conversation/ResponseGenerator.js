/**
 * ResponseGenerator.js
 * ----------------------------------------------------------------
 * Generates rich, contextual, non-repetitive responses based on the Response Plan.
 * Emotion provides supporting tone/warmth, while user intent and topic determine the core content.
 * Natural topic switching and phrase variety are strictly enforced.
 * ----------------------------------------------------------------
 */

class ResponseGenerator {
    /**
     * Generates a complete response given a plan and phrase history manager.
     * @param {Object} plan 
     * @param {Object} phraseHistoryManager 
     * @returns {string} Generated response string
     */
    static generate(plan, phraseHistoryManager) {
        const { strategy, tone, latestUserMessage, hasSwitchedTopic, topic, intent } = plan;

        let pivotPrefix = "";
        if (hasSwitchedTopic) {
            const pivotPhrases = [
                "Shifting focus to your question — ",
                "Changing topics — ",
                "Let's switch over to that — ",
                "Turning to what you just asked — ",
                "Regarding your new topic — ",
            ];
            pivotPrefix = phraseHistoryManager.selectUnique(pivotPhrases);
        }

        switch (strategy) {
            case "DIRECT_TECHNICAL_ANSWER":
                return this.generateTechnicalReply(latestUserMessage, pivotPrefix, tone, phraseHistoryManager);

            case "CAREER_ADVICE_PLAN":
                return this.generateCareerReply(latestUserMessage, pivotPrefix, tone, phraseHistoryManager);

            case "FACTUAL_EXPLANATION":
                return this.generateFactualReply(latestUserMessage, pivotPrefix, tone, phraseHistoryManager);

            case "STUDY_SUPPORT":
                return this.generateStudyReply(latestUserMessage, pivotPrefix, tone, phraseHistoryManager);

            case "RELATIONSHIP_LISTENING":
                return this.generateRelationshipReply(latestUserMessage, pivotPrefix, tone, phraseHistoryManager);

            case "CELEBRATION_CONGRATS":
                return this.generateCelebrationReply(latestUserMessage, pivotPrefix, tone, phraseHistoryManager);

            case "EMPATHETIC_REFLECTION":
                return this.generateEmpatheticReply(latestUserMessage, pivotPrefix, tone, phraseHistoryManager);

            case "TOPIC_PIVOT_AND_ANSWER":
                return this.generatePivotReply(latestUserMessage, topic, intent, tone, phraseHistoryManager);

            case "GRATITUDE_RESPONSE":
                const gratitudeOptions = [
                    "You're very welcome! I'm glad I could help.",
                    "Happy to help! Let me know if anything else comes up.",
                    "Anytime! I'm always here if you want to talk or ask questions.",
                ];
                return phraseHistoryManager.selectUnique(gratitudeOptions);

            default:
                return this.generateCasualReply(latestUserMessage, pivotPrefix, tone, phraseHistoryManager);
        }
    }

    static generateTechnicalReply(text, pivotPrefix, tone, phraseHistoryManager) {
        const val = text.toLowerCase();
        let content = "";

        if (/\b(lost my phone|lost phone|stolen phone|misplaced phone)\b/.test(val)) {
            content = "I'm so sorry — losing your phone is really stressful! Here are quick steps to take right now: 1) Try calling it or use 'Find My' (iCloud for iPhone or Google Find My Device for Android) from another device to locate or ring it, 2) Use Find My to mark it as lost or lock it remotely, and 3) Contact your mobile carrier to temporarily suspend your SIM if needed.";
        } else if (/\b(iphone)\b/.test(val) && /\b(use|setup|set up|new|how|start|guide)\b/.test(val)) {
            content = "Congratulations on your new iPhone! Here are a few essential tips to get started: 1) Power it on and bring it near your old phone to use 'Quick Start' for automatic data transfer, 2) Follow the on-screen prompts to set up Face ID / Touch ID and a passcode, 3) Swipe down from the top-right corner to open Control Center, and 4) Open the App Store to download your essential apps.";
        } else if (/\b(wifi|wi-fi|router|internet|connection)\b/.test(val)) {
            const openers = [
                "To reset your Wi-Fi router, unplug its power cable, wait 10–15 seconds, and plug it back in. If you need a factory reset, hold the tiny Reset button on the back with a pin for 10 seconds until the lights flash.",
                "For Wi-Fi issues, a quick power cycle usually works: turn off the router for 15 seconds and turn it back on. If your device won't connect, try 'Forget Network' in your device settings and re-enter your Wi-Fi password.",
            ];
            content = phraseHistoryManager.selectUnique(openers);
        } else if (/\b(password|login|log in)\b/.test(val)) {
            const openers = [
                "To change or reset your password, open your account or device Settings and select 'Security & Password'. If locked out, click 'Forgot Password' to receive a reset link via email.",
                "If you need to change your password, go to account settings or click 'Forgot Password' on the login screen to verify your email and set a new passcode.",
            ];
            content = phraseHistoryManager.selectUnique(openers);
        } else if (/\b(phone|mobile|screen|app|setup|set up)\b/.test(val)) {
            const openers = [
                "To set up or adjust your phone settings, open the main Settings app. From there you can manage Wi-Fi, Display, Passwords, and App Notifications.",
                "For phone or mobile setup, start by navigating to the Settings app where you can configure connectivity, security passcodes, and app permissions.",
            ];
            content = phraseHistoryManager.selectUnique(openers);
        } else {
            content = `Here are the steps to troubleshoot: verify your device settings, restart the app or hardware, and ensure all software is updated. Let me know if you get an exact error message!`;
        }

        const ToneSuffixes = {
            encouraging_upbeat: " Hope this gets everything running smoothly for you!",
            gentle_supportive: " Take your time with the steps, and let me know if you need any more help.",
            calm_composed: " Let me know if you encounter any specific error codes.",
            reassuring_grounded: " Don't worry, step-by-step troubleshooting will get this sorted out.",
            friendly_warm: " Let me know if you need any further assistance with it!",
        };

        return (pivotPrefix + content + (ToneSuffixes[tone] || "")).trim();
    }

    static generateCareerReply(text, pivotPrefix, tone, phraseHistoryManager) {
        const val = text.toLowerCase();
        let content = "";

        if (/\b(interview)\b/.test(val)) {
            const options = [
                "For job interview prep, focus on three key things: 1) Research the company thoroughly, 2) Practice the STAR method (Situation, Task, Action, Result) for behavioral questions, and 3) Prepare 2–3 thoughtful questions to ask the interviewer.",
                "Preparing for an interview goes best when you review the job description key skills, prepare clear examples of past achievements using the STAR framework, and practice your intro out loud.",
            ];
            content = phraseHistoryManager.selectUnique(options);
        } else if (/\b(resume|cv)\b/.test(val)) {
            const options = [
                "To polish your resume, highlight quantifiable achievements (e.g. 'improved efficiency by 20%'), tailor bullet points to match the target job description keywords, and keep formatting clean.",
                "For resume updates, keep bullet points focused on results and metrics rather than just duties. Tailor your key skills section to match the job role you are targeting.",
            ];
            content = phraseHistoryManager.selectUnique(options);
        } else {
            const options = [
                "Navigating career decisions is about clarifying your core priorities. Break down your next steps into manageable goals: update your professional profile, outline key strengths, and reach out to relevant industry contacts.",
                "For career growth or work challenges, taking a structured approach helps. Identify what is within your control right now and focus on small, impactful actions step by step.",
            ];
            content = phraseHistoryManager.selectUnique(options);
        }

        const TonePrefixes = {
            gentle_supportive: "I know work matters can feel stressful, but you've got this. ",
            encouraging_upbeat: "This is a great opportunity to showcase your strengths! ",
            calm_composed: "Here is a structured approach to tackle your career question: ",
            reassuring_grounded: "Take a deep breath — breaking this down will make it much easier. ",
            friendly_warm: "Here are some practical career steps to consider: ",
        };

        return (pivotPrefix + (TonePrefixes[tone] || "") + content).trim();
    }

    static generateFactualReply(text, pivotPrefix, tone, phraseHistoryManager) {
        const val = text.toLowerCase();
        let content = "";

        if (/\bphotosynthesis\b/.test(val)) {
            content = "Photosynthesis is the biological process by which green plants, algae, and some bacteria convert light energy (sunlight) into chemical energy (glucose), absorbing carbon dioxide and releasing oxygen as a byproduct.";
        } else if (/\b(sky blue|why is the sky blue)\b/.test(val)) {
            content = "The sky appears blue due to Rayleigh scattering: gases in Earth's atmosphere scatter sunlight in all directions, and short blue wavelengths of light scatter much more efficiently than other colors.";
        } else if (/\b(moon|distance to moon|how far is the moon)\b/.test(val)) {
            content = "The average distance from Earth to the Moon is about 384,400 kilometers (approx 238,855 miles).";
        } else {
            content = `To answer your question about "${text.replace(/[?.]/g, "")}": it is best understood by looking at the core facts and underlying principles involved.`;
        }

        return (pivotPrefix + content).trim();
    }

    static generateStudyReply(text, pivotPrefix, tone, phraseHistoryManager) {
        const val = text.toLowerCase();
        let content = "";

        if (/\b(exam|test)\b/.test(val) && /\b(badly|poorly|failed|sad|upset|fail)\b/.test(val)) {
            content = "I'm really sorry to hear that. It's completely natural to feel disappointed when exams don't go as planned after putting in effort. Remember that one test doesn't define your intelligence or potential. Take some time to recharge today, and when you're ready, we can talk about strategies to rebuild your momentum.";
        } else if (/\b(math|calculus|algebra)\b/.test(val)) {
            const options = [
                "For studying math, the most effective technique is active problem-solving: work through practice problems step-by-step, test formula applications, and review any mistakes right away.",
                "Math exam preparation works best when you focus on solving practice problems without looking at solutions first, then double-check steps to solidify concept understanding.",
            ];
            content = phraseHistoryManager.selectUnique(options);
        } else {
            const options = [
                "For effective exam prep, try active recall and spaced repetition: quiz yourself with flashcards or practice questions, study in focused 25-minute blocks (Pomodoro technique), and take short breaks.",
                "To study efficiently, break the material down into key topics, summarize main concepts in your own words, and test yourself with practice questions.",
            ];
            content = phraseHistoryManager.selectUnique(options);
        }

        const TonePrefixes = {
            encouraging_upbeat: "You're going to do great with your studies! ",
            gentle_supportive: "Study pressure can feel heavy, so take it one topic at a time. ",
            calm_composed: "Here is a clean study strategy: ",
            reassuring_grounded: "Stay steady and don't overwhelm yourself. ",
            friendly_warm: "Here are helpful study tips: ",
        };

        return (pivotPrefix + (TonePrefixes[tone] || "") + content).trim();
    }

    static generateRelationshipReply(text, pivotPrefix, tone, phraseHistoryManager) {
        const options = [
            "Relationships take patience and clear communication. Expressing your feelings honestly using 'I' statements and listening actively can help resolve misunderstandings.",
            "Interpersonal situations can be emotional to navigate. Giving yourself space to process while staying open to honest, calm communication is usually a good way forward.",
        ];
        const content = phraseHistoryManager.selectUnique(options);
        return (pivotPrefix + content).trim();
    }

    static generateCelebrationReply(text, pivotPrefix, tone, phraseHistoryManager) {
        const options = [
            "That is fantastic news! Huge congratulations on your achievement — take time to celebrate and enjoy this moment!",
            "That's awesome! Hard work pays off, and you deserve to feel really proud of this milestone!",
        ];
        const content = phraseHistoryManager.selectUnique(options);
        return (pivotPrefix + content).trim();
    }

    static generateEmpatheticReply(text, pivotPrefix, tone, phraseHistoryManager) {
        const val = text.toLowerCase();

        if (/\b(exam|exams|test|grades)\b/.test(val)) {
            return (pivotPrefix + "I'm really sorry to hear about your exams. It is completely valid to feel sad when things don't go as hoped after your effort. Please be kind to yourself — one exam outcome does not define your future or your worth.").trim();
        }

        if (tone === "encouraging_upbeat") {
            const positiveOptions = [
                "That's wonderful to hear! I'm so glad you're having such a fantastic and positive day! What made today special?",
                "That is great news! Embracing good moments and positive energy is wonderful. What's been the highlight of your day?",
            ];
            return (pivotPrefix + phraseHistoryManager.selectUnique(positiveOptions)).trim();
        }

        const options = [
            "Thank you for sharing that with me. It's completely valid to feel this way, and I'm right here with you.",
            "I hear you, and it's okay to feel whatever is coming up for you right now. Take things one step at a time.",
        ];
        const content = phraseHistoryManager.selectUnique(options);
        return (pivotPrefix + content).trim();
    }

    static generatePivotReply(text, topic, intent, tone, phraseHistoryManager) {
        if (topic === "technology" || intent === "TECHNICAL_QUERY") {
            return this.generateTechnicalReply(text, "Pivoting to your technical question — ", tone, phraseHistoryManager);
        }
        if (topic === "career" || intent === "CAREER_ADVICE") {
            return this.generateCareerReply(text, "Switching over to your career question — ", tone, phraseHistoryManager);
        }
        if (topic === "studies" || intent === "STUDY_DISCUSSION") {
            return this.generateStudyReply(text, "Turning to your study topic — ", tone, phraseHistoryManager);
        }
        if (topic === "relationship" || intent === "RELATIONSHIP_DISCUSSION") {
            return this.generateRelationshipReply(text, "Turning to your relationship topic — ", tone, phraseHistoryManager);
        }
        if (intent === "FACTUAL_QUERY") {
            return this.generateFactualReply(text, "Shifting to your question — ", tone, phraseHistoryManager);
        }
        return this.generateCasualReply(text, "Switching topics — ", tone, phraseHistoryManager);
    }

    static generateCasualReply(text, pivotPrefix, tone, phraseHistoryManager) {
        const options = [
            "A fun way to relax is spending time outdoors, watching a lighthearted movie, enjoying good food, or trying a casual creative activity like drawing or listening to music.",
            "I'm here and happy to chat! What would you like to explore or talk about next?",
        ];
        const content = phraseHistoryManager.selectUnique(options);
        return (pivotPrefix + content).trim();
    }
}

module.exports = ResponseGenerator;
