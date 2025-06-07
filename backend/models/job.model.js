import mongoose from "mongoose";

const jobSchema = new mongoose.Schema({
    // Basic job information
    title: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100
    },
    description: {
        type: String,
        required: true,
        trim: true,
        maxlength: 3000
    },
    
    // Client who posted the job
    client: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    
    // Job details
    category: {
        type: String,
        required: true,
        enum: [
            "web-development",
            "mobile-development", 
            "ui-ux-design",
            "graphic-design",
            "content-writing",
            "digital-marketing",
            "data-analysis",
            "video-editing",
            "translation",
            "virtual-assistant",
            "other"
        ]
    },
    
    skillsRequired: [{
        type: String,
        trim: true,
        maxlength: 50
    }],
    
    // Budget and timeline
    budget: {
        min: {
            type: Number,
            required: true,
            min: 0
        },
        max: {
            type: Number,
            required: true,
            min: 0
        },
        currency: {
            type: String,
            default: "USD",
            enum: ["USD", "EUR", "GBP", "INR", "CAD", "AUD"]
        }
    },
    
    budgetType: {
        type: String,
        required: true,
        enum: ["fixed", "hourly"]
    },
    
    timeline: {
        type: String,
        required: true,
        enum: ["urgent", "1-week", "2-weeks", "1-month", "2-months", "3+ months"]
    },
    
    // Experience level required
    experienceLevel: {
        type: String,
        required: true,
        enum: ["beginner", "intermediate", "expert"]
    },
    
    // Job status
    status: {
        type: String,
        default: "open",
        enum: ["open", "in-progress", "completed", "cancelled", "closed"]
    },
    
    // Location type
    location: {
        type: String,
        enum: ["remote", "on-site", "hybrid"],
        default: "remote"
    },
    
    country: {
        type: String,
        trim: true
    }
    
}, {
    timestamps: true
});

// Indexes for better query performance
jobSchema.index({ client: 1 });
jobSchema.index({ category: 1 });
jobSchema.index({ status: 1 });
jobSchema.index({ createdAt: -1 });

export default mongoose.model("Job", jobSchema); 