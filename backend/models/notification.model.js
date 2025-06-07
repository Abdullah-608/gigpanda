import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        enum: [
            'NEW_PROPOSAL',
            'PROPOSAL_ACCEPTED',
            'PROPOSAL_REJECTED',
            'NEW_MESSAGE',
            'CONTRACT_CREATED',
            'CONTRACT_FUNDED',
            'CONTRACT_ACTIVATED',
            'MILESTONE_SUBMITTED',
            'MILESTONE_APPROVED',
            'MILESTONE_CHANGES_REQUESTED',
            'PAYMENT_RELEASED',
            'CONTRACT_COMPLETED'
        ],
        required: true
    },
    job: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Job'
    },
    proposal: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Proposal'
    },
    message: {
        type: String
    },
    read: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Index for faster queries
notificationSchema.index({ recipient: 1, read: 1, createdAt: -1 });

export default mongoose.model('Notification', notificationSchema); 