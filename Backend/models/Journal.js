const mongoose = require("mongoose");

const JournalSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        entry: {
            type: String,
            required: true,
            trim: true,
        },

        // Emotion detected from the entry text.
        // Populated by detectEmotion() on create/update and lazy-backfilled
        // for older documents by the /api/emotions aggregation endpoint.
        // null until first detection; indexed to keep aggregations fast.
        emotion: {
            type: String,
            default: null,
            index: true,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Journal", JournalSchema);