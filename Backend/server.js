const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const Journal = require("./models/Journal");
const User = require("./models/User");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose
    .connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/moodsense")
    .then(() => console.log("✅ MongoDB Connected"))
    .catch((err) => console.log(err));


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
            process.env.JWT_SECRET || "secret123"
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

app.post("/api/auth/register", async (req, res) => {
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

app.post("/api/auth/login", async (req, res) => {
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
            process.env.JWT_SECRET || "secret123",
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

        const updatedJournal = await Journal.findByIdAndUpdate(
            req.params.id,
            {
                entry: entry.trim(),
            },
            {
                new: true,
            }
        );

        res.json({
            message: "Journal Updated Successfully",
            journal: updatedJournal,
        });

    } catch (err) {

        console.log(err);

        res.status(500).json({
            message: "Server Error",
        });

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

        res.json(journals);

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
app.post("/api/test", (req, res) => {
    console.log("TEST ROUTE HIT");
    res.json({ message: "Working" });
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

        const journal = new Journal({
            userId,
            entry: entry.trim(),
        });

        await journal.save();

        res.status(201).json({
            message: "Journal Saved Successfully",
            journal,
        });

    } catch (err) {

        console.log(err);

        res.status(500).json({
            message: "Server Error",
        });

    }

});
app.get("/api/check", (req, res) => {
    res.json({
        message: "Journal backend file is running"
    });
});


app.listen(PORT, () => {
    console.log(`🚀 Server Running on Port ${PORT}`);
});