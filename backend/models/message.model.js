import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    receiver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    content: {
        type: String,
        required: true,
        trim: true
    },
    attachments: [{
        filename: String,
        url: String,
        type: String // e.g., "image", "document", etc.
    }],
    isRead: {
        type: Boolean,
        default: false
    },
    // Reference to the job/proposal if this message is part of a proposal discussion
    job: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Job"
    },
    proposal: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Proposal"
    }
}, {
    timestamps: true
});

// Indexes for better query performance
messageSchema.index({ sender: 1, receiver: 1 });
messageSchema.index({ createdAt: -1 });
messageSchema.index({ job: 1 });
messageSchema.index({ proposal: 1 });

export default mongoose.model("Message", messageSchema); 