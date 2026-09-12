const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
require("dotenv").config();

const Journal = require("./models/Journal");
const User = require("./models/User");
const Conversation = require("./models/Conversation");
const aiService = require("./services/aiService");

const app = express();
const PORT = process.env.PORT || 5000;
const isProduction = process.env.NODE_ENV === "production";
const JWT_SECRET = process.env.JWT_SECRET;
const frontendOrigins = (process.env.FRONTEND_URL || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

if (!JWT_SECRET) {
    throw new Error("JWT_SECRET must be configured before starting the server.");
}

if (isProduction && frontendOrigins.length === 0) {
    throw new Error("FRONTEND_URL must be configured in production.");
}

const allowedOrigins = isProduction
    ? frontendOrigins
    : [...new Set([...frontendOrigins, "http://localhost:5173"])];

const createRateLimiter = ({ windowMs, max, message }) => {
    const requests = new Map();

    return (req, res, next) => {
        const now = Date.now();
        const key = req.ip;
        const current = requests.get(key);
        const active = current && current.resetAt > now ? current : { count: 0, resetAt: now + windowMs };
        active.count += 1;
        requests.set(key, active);

        if (active.count > max) {
            res.set("Retry-After", Math.ceil((active.resetAt - now) / 1000));
            return res.status(429).json({ message });
        }

        return next();
    };
};

const authRateLimit = createRateLimiter({
    windowMs: 15 * 60 * 1000,
    max: 20,
    message: "Too many authentication attempts. Please try again later.",
});
const aiRateLimit = createRateLimiter({
    windowMs: 15 * 60 * 1000,
    max: 30,
    message: "Too many AI requests. Please wait a moment and try again.",
});

// Middleware
app.set("trust proxy", 1);
app.use(cors({
    origin(origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
        return callback(new Error("Origin is not allowed by CORS"));
    },
    allowedHeaders: ["Content-Type", "Authorization"],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
}));
app.use(express.json({ limit: "100kb" }));

// Serve static files for profile pictures
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
}

// Configure multer for image uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'profile-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|webp/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (extname && mimetype) {
            return cb(null, true);
        } else {
            cb(new Error('Only image files are allowed (jpeg, jpg, png, gif, webp)'));
        }
    }
});

// MongoDB Connection - wait for connection before starting server
mongoose
    .connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/moodsense")
    .then(() => {
        console.log("✅ MongoDB Connected");
        
        // Only start listening after MongoDB is connected
        app.listen(PORT, '0.0.0.0', () => {
            console.log(`🚀 Server Running on Port ${PORT}`);
            console.log(`🌐 Server accessible at http://localhost:${PORT}`);
            // Load the emotion model in the background so Journal/Reflect
            // requests do not wait on first-time Transformers.js init.
            aiService.warmup().catch((err) => {
                console.warn("⚠️  Emotion model warmup failed:", err.message);
            });
        });
    })
    .catch((err) => {
        console.log("❌ MongoDB Connection Error:", err);
        process.exit(1);
    });


// ================= AUTH MIDDLEWARE =================

const authMiddleware = (req, res, next) => {
    const token = req.header("Authorization");

    if (!token) {
        return res.status(401).json({
            message: "Access Denied. No token provided.",
        });
    }

    try {
        const verified = jwt.verify(
            token.replace("Bearer ", ""),
            JWT_SECRET
        );
        req.user = verified;
        next();
    } catch (err) {
        res.status(401).json({
            message: "Invalid or expired token.",
        });
    }
};


// ================= VALIDATION HELPERS =================

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const validateRegister = (body) => {
    const { username, email, password } = body;
    const errors = [];

    if (!username || typeof username !== "string") {
        errors.push("Username is required");
    } else if (username.trim().length < 3) {
        errors.push("Username must be at least 3 characters");
    } else if (username.trim().length > 30) {
        errors.push("Username must be less than 30 characters");
    }

    if (!email || !EMAIL_REGEX.test(email)) {
        errors.push("A valid email is required");
    }

    if (!password || typeof password !== "string") {
        errors.push("Password is required");
    } else if (password.length < 6) {
        errors.push("Password must be at least 6 characters");
    }

    return errors;
};

const validateLogin = (body) => {
    const { email, password } = body;
    const errors = [];

    if (!email || !EMAIL_REGEX.test(email)) {
        errors.push("A valid email is required");
    }

    if (!password) {
        errors.push("Password is required");
    }

    return errors;
};

// Builds the authenticated user's emotion distribution. Older journal records
// are classified once before aggregation so all dashboard statistics agree.
const getEmotionDistribution = async (userId) => {
    const untagged = await Journal.find({ userId, emotion: null }).select({ entry: 1 });

    for (const journal of untagged) {
        const result = await aiService.detectEmotion(journal.entry);
        journal.emotion = result.emotion;
        await journal.save();
    }

    const distribution = await Journal.aggregate([
        { $match: { userId: new mongoose.Types.ObjectId(userId) } },
        { $group: { _id: "$emotion", count: { $sum: 1 } } },
        { $project: { _id: 0, emotion: "$_id", count: 1 } },
        { $sort: { count: -1 } },
    ]);

    // Always return an array, even if aggregation fails or returns null
    return Array.isArray(distribution) ? distribution : [];
};

const validateJournal = (body) => {
    const { userId, entry } = body;
    const errors = [];

    if (!userId) {
        errors.push("User ID is required");
    }

    if (!entry || typeof entry !== "string") {
        errors.push("Entry is required");
    } else if (entry.trim().length === 0) {
        errors.push("Entry cannot be empty");
    } else if (entry.length > 5000) {
        errors.push("Entry must be less than 5000 characters");
    }

    return errors;
};


// ================= REGISTER =================

app.post("/api/auth/register", authRateLimit, async (req, res) => {
    try {
        const errors = validateRegister(req.body);
        if (errors.length > 0) {
            return res.status(400).json({
                message: "Validation failed",
                errors,
            });
        }

        const { username, email, password } = req.body;

        let user = await User.findOne({ email });

        if (user) {
            return res.status(400).json({
                message: "User already exists",
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        user = new User({
            username: username.trim(),
            email: email.toLowerCase().trim(),
            password: hashedPassword,
        });

        await user.save();

        res.status(201).json({
            message: "User Registered Successfully",
        });

    } catch (err) {
        console.log(err);

        res.status(500).json({
            message: "Server Error",
        });
    }
});


// ================= LOGIN =================

app.post("/api/auth/login", authRateLimit, async (req, res) => {
    try {
        const errors = validateLogin(req.body);
        if (errors.length > 0) {
            return res.status(400).json({
                message: "Validation failed",
                errors,
            });
        }

        const { email, password } = req.body;

        const user = await User.findOne({
            email: email.toLowerCase().trim(),
        });

        if (!user) {
            return res.status(400).json({
                message: "Invalid Credentials",
            });
        }

        const match = await bcrypt.compare(password, user.password);

        if (!match) {
            return res.status(400).json({
                message: "Invalid Credentials",
            });
        }

        const token = jwt.sign(
            {
                id: user._id,
            },
            JWT_SECRET,
            {
                expiresIn: "1d",
            }
        );

        res.json({
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                profilePicture: user.profilePicture,
            },
        });

    } catch (err) {
        console.log(err);

        res.status(500).json({
            message: "Server Error",
        });
    }
});


// ================= UPDATE USER PROFILE =================

app.put("/api/user/profile", authMiddleware, async (req, res) => {
    try {
        const { username, email } = req.body;
        const errors = [];

        // Validate username
        if (username !== undefined) {
            if (typeof username !== "string") {
                errors.push("Username must be a string");
            } else if (username.trim().length < 3) {
                errors.push("Username must be at least 3 characters");
            } else if (username.trim().length > 30) {
                errors.push("Username must be less than 30 characters");
            }
        }

        // Validate email
        if (email !== undefined) {
            if (!EMAIL_REGEX.test(email)) {
                errors.push("A valid email is required");
            }
        }

        if (errors.length > 0) {
            return res.status(400).json({
                message: "Validation failed",
                errors,
            });
        }

        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({
                message: "User not found",
            });
        }

        // Check if email is already taken by another user
        if (email && email.toLowerCase() !== user.email.toLowerCase()) {
            const existingUser = await User.findOne({ email: email.toLowerCase() });
            if (existingUser) {
                return res.status(400).json({
                    message: "Email already in use",
                });
            }
        }

        // Update fields
        if (username) user.username = username.trim();
        if (email) user.email = email.toLowerCase().trim();

        await user.save();

        res.json({
            message: "Profile updated successfully",
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                profilePicture: user.profilePicture,
            },
        });
    } catch (err) {
        res.status(500).json({
            message: "Server Error",
        });
    }
});

// ================= UPLOAD PROFILE PICTURE =================

app.post("/api/user/profile-picture", authMiddleware, upload.single('profilePicture'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                message: "No file uploaded",
            });
        }

        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({
                message: "User not found",
            });
        }

        // Delete old profile picture if exists
        if (user.profilePicture) {
            const oldPath = path.join(__dirname, user.profilePicture);
            if (fs.existsSync(oldPath)) {
                fs.unlinkSync(oldPath);
            }
        }

        // Update user with new profile picture path
        user.profilePicture = `/uploads/${req.file.filename}`;
        await user.save();

        res.json({
            message: "Profile picture updated successfully",
            profilePicture: user.profilePicture,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                profilePicture: user.profilePicture,
            },
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({
            message: "Server Error",
        });
    }
});


// ================= SAVE JOURNAL =================
// ================= GET USER JOURNALS =================
// ================= GET SINGLE JOURNAL =================

app.get("/api/journal/view/:id", authMiddleware, async (req, res) => {

    try {

        const journal = await Journal.findById(req.params.id);

        if (!journal) {

            return res.status(404).json({
                message: "Journal not found",
            });

        }

        // Ownership check: user can only view their own journal
        if (journal.userId.toString() !== req.user.id) {
            return res.status(403).json({
                message: "Not authorized to view this journal",
            });
        }

        res.json(journal);

    } catch (err) {

        console.log(err);

        res.status(500).json({
            message: "Server Error",
        });

    }

});
// ================= UPDATE JOURNAL =================

app.put("/api/journal/:id", authMiddleware, async (req, res) => {

    try {

        // Validate entry content
        const { entry } = req.body;
        if (!entry || typeof entry !== "string" || entry.trim().length === 0) {
            return res.status(400).json({
                message: "Journal entry cannot be empty",
            });
        }
        if (entry.length > 5000) {
            return res.status(400).json({
                message: "Entry must be less than 5000 characters",
            });
        }

        const existingJournal = await Journal.findById(req.params.id);

        if (!existingJournal) {
            return res.status(404).json({
                message: "Journal not found",
            });
        }

        // Ownership check: user can only update their own journal
        if (existingJournal.userId.toString() !== req.user.id) {
            return res.status(403).json({
                message: "Not authorized to update this journal",
            });
        }

        const trimmedEntry = entry.trim();
        const updatedJournal = await Journal.findByIdAndUpdate(
            req.params.id,
            {
                entry: trimmedEntry,
                // Reset emotion; background job will populate it
                emotion: null,
            },
            {
                new: true,
            }
        );

        res.json({
            message: "Journal Updated Successfully",
            journal: updatedJournal,
        });

        // Background emotion detection
        aiService.detectEmotion(trimmedEntry).then(async (detectionResult) => {
            const latestJournal = await Journal.findById(updatedJournal._id);
            // Verify entry hasn't changed since this background task started
            if (latestJournal && latestJournal.entry === trimmedEntry) {
                latestJournal.emotion = detectionResult.emotion;
                await latestJournal.save();
            }
        }).catch((err) => {
            console.error("❌ Background emotion detection failed for updated journal:", err);
        });

    } catch (err) {

        console.log(err);

        res.status(500).json({
            message: "Server Error",
        });

    }

});
// ================= EMOTION DISTRIBUTION =================
// Returns the user's emotion counts, aggregated from their journals.
// Shape: [ { emotion: "Happy", count: 12 }, { emotion: "Sad", count: 5 } ]
// Lazily backfills any older journals that have no emotion field yet.

app.get("/api/emotions/:userId", authMiddleware, async (req, res) => {

    try {

        const { userId } = req.params;

        // Ownership check: users can only read their own distribution
        if (userId !== req.user.id) {
            return res.status(403).json({
                message: "Not authorized to view these emotions",
            });
        }

        const distribution = await getEmotionDistribution(userId);

        res.json(distribution);

    } catch (err) {

        console.log(err);

        res.status(500).json({
            message: "Server Error",
        });

    }

});

// ================= DASHBOARD STATISTICS =================
// Fetches only the aggregate data needed by the authenticated user's dashboard.
app.get("/api/dashboard", authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const now = new Date();
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const sevenDaysAgo = new Date(todayStart);
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const [journalCount, emotionDistribution, conversationCount, latestJournal, weeklyJournals] = await Promise.all([
            Journal.countDocuments({ userId }),
            getEmotionDistribution(userId),
            Conversation.countDocuments({ userId, saved: true }),
            Journal.findOne({ userId }).sort({ createdAt: -1 }),
            Journal.find({
                userId,
                createdAt: { $gte: sevenDaysAgo }
            }).sort({ createdAt: 1 })
        ]);

        // Calculate reflection streak
        let streak = 0;
        const allJournals = await Journal.find({ userId }).sort({ createdAt: -1 });
        if (allJournals.length > 0) {
            const checkDate = new Date(todayStart);
            streak = 0;
            
            for (let i = 0; i < 365; i++) { // Check up to a year back
                const hasJournal = allJournals.some(j => {
                    const journalDate = new Date(j.createdAt);
                    return journalDate.toDateString() === checkDate.toDateString();
                });
                
                if (hasJournal) {
                    streak++;
                    checkDate.setDate(checkDate.getDate() - 1);
                } else if (i === 0) {
                    // If no journal today, check yesterday
                    checkDate.setDate(checkDate.getDate() - 1);
                } else {
                    break;
                }
            }
        }

        // Calculate weekly mood trend
        const weeklyTrend = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date(todayStart);
            date.setDate(date.getDate() - i);
            const dateStr = date.toLocaleDateString('en-US', { weekday: 'short' });
            
            const dayJournals = weeklyJournals.filter(j => {
                const journalDate = new Date(j.createdAt);
                return journalDate.toDateString() === date.toDateString();
            });
            
            if (dayJournals.length > 0) {
                // Get the most common emotion for this day
                const emotionCounts = {};
                dayJournals.forEach(j => {
                    if (j.emotion) {
                        emotionCounts[j.emotion] = (emotionCounts[j.emotion] || 0) + 1;
                    }
                });
                const dominantEmotion = Object.entries(emotionCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Neutral';
                weeklyTrend.push({ date: dateStr, emotion: dominantEmotion });
            } else {
                weeklyTrend.push({ date: dateStr, emotion: null });
            }
        }

        // Check if there's a reflection today
        const todayJournal = await Journal.findOne({
            userId,
            createdAt: { $gte: todayStart }
        });

        res.json({
            journalCount,
            emotionDistribution,
            conversationCount,
            latestJournal,
            streak,
            weeklyTrend,
            hasTodayReflection: !!todayJournal,
            todayMood: todayJournal?.emotion || null
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Unable to load dashboard statistics" });
    }
});

app.get("/api/journal/:userId", authMiddleware, async (req, res) => {

    try {

        const { userId } = req.params;

        // Ownership check: user can only fetch their own journals
        if (userId !== req.user.id) {
            return res.status(403).json({
                message: "Not authorized to view these journals",
            });
        }

        const journals = await Journal.find({
            userId,
        }).sort({
            createdAt: -1,
        });

        // Always return an array, even if find returns null or undefined
        res.json(Array.isArray(journals) ? journals : []);

    } catch (err) {

        console.log(err);

        res.status(500).json({
            message: "Server Error",
        });

    }

});
// ================= DELETE JOURNAL =================

app.delete("/api/journal/:id", authMiddleware, async (req, res) => {

    try {

        const journal = await Journal.findById(req.params.id);

        if (!journal) {
            return res.status(404).json({
                message: "Journal not found",
            });
        }

        // Ownership check: user can only delete their own journal
        if (journal.userId.toString() !== req.user.id) {
            return res.status(403).json({
                message: "Not authorized to delete this journal",
            });
        }

        await Journal.findByIdAndDelete(req.params.id);

        res.json({
            message: "Journal Deleted Successfully",
        });

    } catch (err) {

        console.log(err);

        res.status(500).json({
            message: "Server Error",
        });

    }

});
app.post("/api/journal", authMiddleware, async (req, res) => {

    try {

        const errors = validateJournal(req.body);
        if (errors.length > 0) {
            return res.status(400).json({
                message: "Validation failed",
                errors,
            });
        }

        const { userId, entry } = req.body;

        // Ownership check: user can only create journals for themselves
        if (userId !== req.user.id) {
            return res.status(403).json({
                message: "Not authorized to create journals for other users",
            });
        }

        const trimmedEntry = entry.trim();
        const saveStarted = Date.now();
        const journal = new Journal({
            userId,
            entry: trimmedEntry,
            emotion: null,
        });

        await journal.save();
        console.log(`[journal] save ${Date.now() - saveStarted}ms`);

        res.status(201).json({
            message: "Journal Saved Successfully",
            journal,
        });

        // Background emotion detection
        aiService.detectEmotion(trimmedEntry).then(async (detectionResult) => {
            const latestJournal = await Journal.findById(journal._id);
            // Verify entry hasn't changed since this background task started
            if (latestJournal && latestJournal.entry === trimmedEntry) {
                latestJournal.emotion = detectionResult.emotion;
                await latestJournal.save();
            }
        }).catch((err) => {
            console.error("❌ Background emotion detection failed for new journal:", err);
        });

    } catch (err) {

        console.log(err);

        res.status(500).json({
            message: "Server Error",
        });

    }

});
// ================= EMOTION DETECTION =================
// Analyzes free text with the active AI provider and returns the
// predicted emotion + confidence score. Used by the Detect Emotion page.

app.post("/api/detect", authMiddleware, aiRateLimit, async (req, res) => {

    try {

        const { text } = req.body;

        if (!text || typeof text !== "string" || text.trim().length === 0) {
            return res.status(400).json({
                message: "Please provide some text to analyze",
            });
        }

        if (text.length > 5000) {
            return res.status(400).json({
                message: "Text must be less than 5000 characters",
            });
        }

        const detectStarted = Date.now();
        const result = await aiService.detectEmotion(text.trim());
        console.log(`[detect] ${Date.now() - detectStarted}ms`);

        res.json({
            emotion: result.emotion,
            confidence: result.confidence,
            timestamp: result.timestamp,
            provider: aiService.getProviderName(),
        });

    } catch (err) {

        console.log(err);

        res.status(500).json({
            message: "We couldn't analyze your emotion right now. Please try again.",
        });

    }

});


// ================= MOOD COMPANION CHAT =================
// Generates a supportive, context-aware reply from the wellness
// companion AI. The full conversation history is sent so the AI
// stays context-aware across the session.

app.post("/api/chat", authMiddleware, aiRateLimit, async (req, res) => {

    try {

        const { messages, emotion, originalText, userName, isGreeting } = req.body;

        if (!Array.isArray(messages) || messages.length === 0) {
            return res.status(400).json({
                message: "Conversation history is required",
            });
        }

        if (messages.length > 20 || messages.some((message) =>
            !message ||
            !["user", "ai"].includes(message.role) ||
            typeof message.content !== "string" ||
            message.content.trim().length === 0 ||
            message.content.length > 5000
        )) {
            return res.status(400).json({
                message: "Conversation messages must contain valid text and stay within the supported limits.",
            });
        }

        const safeEmotion = typeof emotion === "string" ? emotion : "Neutral";
        const safeOriginal =
            typeof originalText === "string" ? originalText.slice(0, 5000) : "";
        const safeUserName = typeof userName === "string" ? userName : "friend";
        const safeGreeting = typeof isGreeting === "boolean" ? isGreeting : false;

        const result = await aiService.chat(messages, safeEmotion, safeOriginal, safeUserName, safeGreeting);

        res.json({
            reply: result.reply,
            provider: result.provider,
            intent: result.intent,
            topic: result.topic,
        });

    } catch (err) {

        console.error("❌ /api/chat error:", err.message || err);
        if (err.status) console.error("   Status:", err.status, err.statusText);

        const status = err.status === 429 ? 429 : 500;
        res.status(status).json({
            message: err.status === 429
                ? "The AI is receiving too many requests. Please wait a moment and try again."
                : "The companion couldn't respond right now. Please try again.",
        });

    }

});

// ================= MOOD COMPANION CHAT STREAM =================
app.post("/api/chat/stream", authMiddleware, aiRateLimit, async (req, res) => {
    try {
        const { messages, emotion, originalText, userName, isGreeting } = req.body;

        if (!Array.isArray(messages) || messages.length === 0) {
            return res.status(400).json({ message: "Conversation history is required" });
        }

        if (messages.length > 20 || messages.some((message) =>
            !message ||
            !["user", "ai"].includes(message.role) ||
            typeof message.content !== "string" ||
            message.content.trim().length === 0 ||
            message.content.length > 5000
        )) {
            return res.status(400).json({
                message: "Conversation messages must contain valid text and stay within the supported limits.",
            });
        }

        const safeEmotion = typeof emotion === "string" ? emotion : "Neutral";
        const safeOriginal = typeof originalText === "string" ? originalText.slice(0, 5000) : "";
        const safeUserName = typeof userName === "string" ? userName : "friend";
        const safeGreeting = typeof isGreeting === "boolean" ? isGreeting : false;

        res.setHeader("Content-Type", "text/event-stream");
        res.setHeader("Cache-Control", "no-cache");
        res.setHeader("Connection", "keep-alive");
        res.flushHeaders();

        // Render buffer workaround: Send initial comment to flush proxies
        res.write(": \n\n");

        let streamFinished = false;
        req.on("close", () => {
            streamFinished = true;
        });

        const stream = aiService.chatStream(messages, safeEmotion, safeOriginal, safeUserName, safeGreeting);

        for await (const chunk of stream) {
            if (streamFinished) break;
            res.write(`data: ${JSON.stringify(chunk)}\n\n`);
        }

        res.end();
    } catch (err) {
        console.error("❌ /api/chat/stream error:", err.message || err);
        if (!res.headersSent) {
            const status = err.status === 429 ? 429 : 500;
            return res.status(status).json({
                message: err.status === 429
                    ? "The AI is receiving too many requests. Please wait a moment and try again."
                    : "The companion couldn't respond right now. Please try again.",
            });
        } else {
            res.write(`data: ${JSON.stringify({ error: true, text: " [Connection error, please try again]" })}\n\n`);
            res.end();
        }
    }
});


// ================= SAVE CONVERSATION =================
// Persists a finished (or in-progress) conversation session so it can
// be reviewed later from the History page.

app.post("/api/conversations/save", authMiddleware, async (req, res) => {

    try {

        const { emotion, messages } = req.body;

        if (!Array.isArray(messages) || messages.length === 0) {
            return res.status(400).json({
                message: "Cannot save an empty conversation",
            });
        }

        if (messages.length > 100 || messages.some((message) =>
            !message ||
            !["user", "ai"].includes(message.role) ||
            typeof message.content !== "string" ||
            message.content.trim().length === 0 ||
            message.content.length > 5000
        )) {
            return res.status(400).json({
                message: "Conversation messages must contain valid text and stay within the supported limits.",
            });
        }

        const conversation = new Conversation({
            userId: req.user.id,
            emotion: typeof emotion === "string" ? emotion : null,
            messages: messages.map((m) => ({
                role: m.role === "ai" ? "ai" : "user",
                content: String(m.content).slice(0, 5000),
            })),
            saved: true,
        });

        await conversation.save();

        res.status(201).json({
            message: "Conversation Saved Successfully",
            conversation,
        });

    } catch (err) {

        console.log(err);

        res.status(500).json({
            message: "Server Error",
        });

    }

});


// ================= LIST CONVERSATIONS =================
// Returns all of the user's saved conversations (newest first).
// Each includes the detected emotion, message count, and date.

app.get("/api/conversations", authMiddleware, async (req, res) => {

    try {

        const conversations = await Conversation.find({
            userId: req.user.id,
            saved: true,
        })
            .sort({ createdAt: -1 })
            .select({ messages: 0 }); // omit the full transcript for the list view

        // Always return an array, even if find returns null or undefined
        res.json(Array.isArray(conversations) ? conversations : []);

    } catch (err) {

        console.log(err);

        res.status(500).json({
            message: "Server Error",
        });

    }

});

app.get("/api/health", (req, res) => {
    res.json({
        status: "ok",
    });
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    console.error('❌ Unhandled Promise Rejection:', err);
    process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    console.error('❌ Uncaught Exception:', err);
    process.exit(1);
});
