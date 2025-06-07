import mongoose from "mongoose";

const proposalSchema = new mongoose.Schema({
    job: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Job',
        required: true
    },
    freelancer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    coverLetter: {
        type: String,
        required: true,
        maxlength: 3000
    },
    bidAmount: {
        amount: {
            type: Number,
            required: true,
            min: 0
        },
        currency: {
            type: String,
            default: "USD",
            enum: ["USD", "EUR", "GBP"]
        }
    },
    estimatedDuration: {
        type: String,
        required: true,
        enum: ["less-than-1-month", "1-3-months", "3-6-months", "more-than-6-months"]
    },
    attachments: [{
        filename: String,
        url: String,
        mimetype: String,
        size: Number
    }],
    status: {
        type: String,
        enum: ["pending", "accepted", "declined", "interviewing"],
        default: "pending"
    },
    clientNotes: {
        type: String,
        maxlength: 1000
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Indexes for better query performance
proposalSchema.index({ job: 1, status: 1 });
proposalSchema.index({ freelancer: 1, status: 1 });
proposalSchema.index({ createdAt: -1 });

export default mongoose.model("Proposal", proposalSchema); 