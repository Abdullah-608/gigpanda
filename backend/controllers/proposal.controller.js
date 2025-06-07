import Proposal from "../models/proposal.model.js";
import Job from "../models/job.model.js";
import Notification from "../models/notification.model.js";

// Create a new proposal
export const createProposal = async (req, res) => {
    try {
        const { jobId } = req.params;
        const { coverLetter, bidAmount, estimatedDuration, attachments = [] } = req.body;

        // Validate required fields
        if (!coverLetter || !bidAmount || !estimatedDuration) {
            return res.status(400).json({
                success: false,
                message: "Please provide all required fields"
            });
        }

        // Validate user is a freelancer
        if (req.user.role !== 'freelancer') {
            return res.status(403).json({
                success: false,
                message: "Only freelancers can submit proposals"
            });
        }

        // Check if job exists
        const job = await Job.findById(jobId);
        if (!job) {
            return res.status(404).json({
                success: false,
                message: "Job not found"
            });
        }

        // Check if job is still open
        if (job.status !== 'open') {
            return res.status(400).json({
                success: false,
                message: "This job is no longer accepting proposals"
            });
        }

        // Check if user already submitted a proposal
        const existingProposal = await Proposal.findOne({
            job: jobId,
            freelancer: req.user._id
        });

        if (existingProposal) {
            return res.status(400).json({
                success: false,
                message: "You have already submitted a proposal for this job"
            });
        }

        // Create proposal
        const proposal = new Proposal({
            job: jobId,
            freelancer: req.user._id,
            coverLetter,
            bidAmount,
            estimatedDuration,
            attachments
        });

        await proposal.save();

        // Create notification for the job owner
        const notification = new Notification({
            recipient: job.client,
            sender: req.user._id,
            type: 'NEW_PROPOSAL',
            job: jobId,
            proposal: proposal._id,
            message: `New proposal received for "${job.title}"`
        });

        await notification.save();

        // Populate freelancer info
        await proposal.populate('freelancer', 'name email profile');

        res.status(201).json({
            success: true,
            message: "Proposal submitted successfully",
            proposal
        });

    } catch (error) {
        console.error("Error creating proposal:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

// Get proposals for a specific job (client view)
export const getJobProposals = async (req, res) => {
    try {
        const { jobId } = req.params;

        // Validate user is the job owner
        const job = await Job.findById(jobId);
        if (!job) {
            return res.status(404).json({
                success: false,
                message: "Job not found"
            });
        }

        if (job.client.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: "You can only view proposals for your own jobs"
            });
        }

        const proposals = await Proposal.find({ job: jobId })
            .populate('freelancer', 'name email profile')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            proposals
        });

    } catch (error) {
        console.error("Error fetching job proposals:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

// Get proposals submitted by the freelancer
export const getMyProposals = async (req, res) => {
    try {
        // Validate user is a freelancer
        if (req.user.role !== 'freelancer') {
            return res.status(403).json({
                success: false,
                message: "Access denied"
            });
        }

        const proposals = await Proposal.find({ freelancer: req.user._id })
            .populate({
                path: 'job',
                select: 'title budget timeline status client category experienceLevel location',
                populate: {
                    path: 'client',
                    select: 'name email profilePicture'
                }
            })
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            proposals
        });

    } catch (error) {
        console.error("Error fetching my proposals:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

// Get a single proposal by ID
export const getProposalById = async (req, res) => {
    try {
        const { id } = req.params;

        const proposal = await Proposal.findById(id)
            .populate('freelancer', 'name email profile')
            .populate({
                path: 'job',
                select: 'title budget timeline status client',
                populate: {
                    path: 'client',
                    select: 'name email profile'
                }
            });

        if (!proposal) {
            return res.status(404).json({
                success: false,
                message: "Proposal not found"
            });
        }

        // Check if user has access to view this proposal
        if (proposal.freelancer._id.toString() !== req.user._id.toString() && 
            proposal.job.client._id.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: "You don't have permission to view this proposal"
            });
        }

        res.status(200).json({
            success: true,
            proposal
        });

    } catch (error) {
        console.error("Error fetching proposal:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

// Update proposal status
export const updateProposalStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, clientNotes } = req.body;

        const proposal = await Proposal.findById(id)
            .populate('job', 'client');

        if (!proposal) {
            return res.status(404).json({
                success: false,
                message: "Proposal not found"
            });
        }

        // Check if user is the job owner
        if (proposal.job.client.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: "You can only update status for proposals on your own jobs"
            });
        }

        // Update status
        proposal.status = status;
        if (clientNotes) {
            proposal.clientNotes = clientNotes;
        }

        await proposal.save();

        // Create notification for the freelancer
        const job = await Job.findById(proposal.job._id);
        const notification = new Notification({
            recipient: proposal.freelancer,
            sender: req.user._id,
            type: status === 'accepted' ? 'PROPOSAL_ACCEPTED' : status === 'declined' ? 'PROPOSAL_REJECTED' : 'PROPOSAL_STATUS_UPDATED',
            job: proposal.job._id,
            proposal: proposal._id,
            message: `Your proposal for "${job.title}" has been ${status}`
        });

        await notification.save();

        // Populate freelancer info for response
        await proposal.populate('freelancer', 'name email profile');

        res.status(200).json({
            success: true,
            message: "Proposal status updated successfully",
            proposal
        });

    } catch (error) {
        console.error("Error updating proposal status:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

// Delete a proposal (client view)
export const deleteProposal = async (req, res) => {
    try {
        const { id } = req.params;

        // Find the proposal
        const proposal = await Proposal.findById(id).populate('job');

        if (!proposal) {
            return res.status(404).json({
                success: false,
                message: "Proposal not found"
            });
        }

        // Check if user is the job owner
        if (proposal.job.client.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: "You can only delete proposals for your own jobs"
            });
        }

        // Delete the proposal
        await Proposal.findByIdAndDelete(id);

        res.status(200).json({
            success: true,
            message: "Proposal deleted successfully"
        });

    } catch (error) {
        console.error("Error deleting proposal:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
}; 