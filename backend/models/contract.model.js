import mongoose from "mongoose";

const submissionSchema = new mongoose.Schema({
    files: [{
        filename: {
            type: String,
            required: true
        },
        url: {
            type: String,
            required: true
        },
        mimetype: {
            type: String,
            required: true
        },
        size: {
            type: Number,
            required: true
        }
    }, { _id: true }],
    comments: {
        type: String,
        default: ''
    },
    submittedAt: {
        type: Date,
        required: true,
        default: Date.now
    },
    status: {
        type: String,
        enum: ["pending", "approved", "changes_requested"],
        default: "pending"
    },
    clientFeedback: {
        type: String,
        default: ''
    },
    feedbackAt: Date
}, { _id: false });

const milestoneSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    amount: {
        type: Number,
        required: true,
        min: 0
    },
    dueDate: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ["pending", "funded", "in_progress", "submitted", "changes_requested", "completed", "paid"],
        default: "pending"
    },
    escrowFunded: {
        type: Boolean,
        default: false
    },
    submissionHistory: {
        type: [submissionSchema],
        default: [],
        get: function(submissions) {
            // Sort by submittedAt in descending order
            return submissions.sort((a, b) => b.submittedAt - a.submittedAt);
        }
    },
    currentSubmission: submissionSchema
}, {
    timestamps: true,
    toJSON: { getters: true }, // Enable getters when converting to JSON
    toObject: { getters: true } // Enable getters when converting to Object
});

const contractSchema = new mongoose.Schema({
    job: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Job',
        required: true
    },
    proposal: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Proposal',
        required: true
    },
    client: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    freelancer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: true
    },
    scope: {
        type: String,
        required: true
    },
    totalAmount: {
        type: Number,
        required: true,
        min: 0
    },
    status: {
        type: String,
        enum: ["draft", "funded", "active", "completed", "closed", "cancelled"],
        default: "draft"
    },
    escrowBalance: {
        type: Number,
        default: 0,
        min: 0
    },
    milestones: [milestoneSchema],
    startDate: Date,
    endDate: Date,
    terms: {
        type: String,
        required: true
    },
    clientSignedAt: Date,
    freelancerSignedAt: Date
}, {
    timestamps: true
});

// Indexes for better query performance
contractSchema.index({ client: 1, status: 1 });
contractSchema.index({ freelancer: 1, status: 1 });
contractSchema.index({ job: 1 });
contractSchema.index({ createdAt: -1 });

export default mongoose.model("Contract", contractSchema); 