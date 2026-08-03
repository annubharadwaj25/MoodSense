const mongoose = require("mongoose");

const ConversationSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },

        // The first emotion detected in this conversation session.
        emotion: {
            type: String,
        },

        // Ordered list of messages exchanged during the session.
        messages: [
            {
                role: {
                    type: String,
                    enum: ["user", "ai"],
                    required: true,
                },
                content: {
                    type: String,
                    required: true,
                },
                timestamp: {
                    type: Date,
                    default: Date.now,
                },
            },
        ],

        // Whether the user explicitly saved this conversation.
        saved: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Conversation", ConversationSchema);
