import Contract from "../models/contract.model.js";
import Proposal from "../models/proposal.model.js";
import Job from "../models/job.model.js";
import Notification from "../models/notification.model.js";
import { getFileFromStorage, saveFileToStorage } from "../utils/fileStorage.js";
import multer from 'multer';

// Configure multer for memory storage
const upload = multer({ storage: multer.memoryStorage() });

// Create a new contract from a proposal
export const createContract = async (req, res) => {
    try {
        const { proposalId } = req.params;
        const { title, scope, totalAmount, terms, milestones } = req.body;

        // Validate required fields
        if (!title || !scope || !terms || !milestones || !Array.isArray(milestones)) {
            return res.status(400).json({
                success: false,
                message: "Missing required fields"
            });
        }

        // Validate each milestone
        for (const milestone of milestones) {
            if (!milestone.title || !milestone.description || !milestone.amount || !milestone.dueDate) {
                return res.status(400).json({
                    success: false,
                    message: "Each milestone must have a title, description, amount, and due date"
                });
            }
        }

        // Find the proposal
        const proposal = await Proposal.findById(proposalId).populate('job');
        if (!proposal) {
            return res.status(404).json({
                success: false,
                message: "Proposal not found"
            });
        }

        // Verify the client is the one creating the contract
        if (proposal.job.client.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: "Only the client can create a contract"
            });
        }

        // Create the contract with validated milestone data
        const contract = new Contract({
            job: proposal.job._id,
            proposal: proposalId,
            client: req.user._id,
            freelancer: proposal.freelancer,
            title,
            scope,
            totalAmount,
            terms,
            milestones: milestones.map(milestone => ({
                title: milestone.title,
                description: milestone.description,
                amount: Number(milestone.amount),
                dueDate: new Date(milestone.dueDate),
                status: "pending"
            }))
        });

        await contract.save();

        // Update proposal status
        proposal.status = "accepted";
        await proposal.save();

        // Update job status
        await Job.findByIdAndUpdate(proposal.job._id, { status: "in-progress" });

        res.status(201).json({
            success: true,
            message: "Contract created successfully",
            contract
        });

    } catch (error) {
        console.error("Error in createContract:", error);
        res.status(500).json({
            success: false,
            message: "Error creating contract",
            error: error.message
        });
    }
};

// Get contract by ID
export const getContractById = async (req, res) => {
    try {
        const contract = await Contract.findById(req.params.contractId)
            .populate('job')
            .populate('client', '-password')
            .populate('freelancer', '-password');

        if (!contract) {
            return res.status(404).json({
                success: false,
                message: "Contract not found"
            });
        }

        // Verify user has access to this contract
        if (contract.client._id.toString() !== req.user._id.toString() &&
            contract.freelancer._id.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: "Access denied"
            });
        }

        res.status(200).json({
            success: true,
            contract
        });

    } catch (error) {
        console.error("Error in getContractById:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching contract",
            error: error.message
        });
    }
};

// Get user's contracts
export const getMyContracts = async (req, res) => {
    try {
        const contracts = await Contract.find({
            $or: [
                { client: req.user._id },
                { freelancer: req.user._id }
            ]
        })
        .populate('job')
        .populate('client', '-password')
        .populate('freelancer', '-password')
        .sort('-createdAt');

        res.status(200).json({
            success: true,
            contracts
        });

    } catch (error) {
        console.error("Error in getMyContracts:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching contracts",
            error: error.message
        });
    }
};

// Fund contract escrow
export const fundEscrow = async (req, res) => {
    try {
        const { amount } = req.body;
        const contract = await Contract.findById(req.params.contractId);

        if (!contract) {
            return res.status(404).json({
                success: false,
                message: "Contract not found"
            });
        }

        if (contract.client.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: "Only the client can fund the escrow"
            });
        }

        contract.escrowBalance = amount;
        contract.status = "funded";
        await contract.save();

        res.status(200).json({
            success: true,
            message: "Escrow funded successfully",
            contract
        });

    } catch (error) {
        console.error("Error in fundEscrow:", error);
        res.status(500).json({
            success: false,
            message: "Error funding escrow",
            error: error.message
        });
    }
};

// Activate contract
export const activateContract = async (req, res) => {
    try {
        const contract = await Contract.findById(req.params.contractId);

        if (!contract) {
            return res.status(404).json({
                success: false,
                message: "Contract not found"
            });
        }

        if (contract.client.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: "Only the client can activate the contract"
            });
        }

        if (contract.status !== "funded") {
            return res.status(400).json({
                success: false,
                message: "Contract must be funded before activation"
            });
        }

        contract.status = "active";
        contract.startDate = new Date();
        await contract.save();

        res.status(200).json({
            success: true,
            message: "Contract activated successfully",
            contract
        });

    } catch (error) {
        console.error("Error in activateContract:", error);
        res.status(500).json({
            success: false,
            message: "Error activating contract",
            error: error.message
        });
    }
};

// Add milestone
export const addMilestone = async (req, res) => {
    try {
        const { title, description, amount, dueDate } = req.body;
        const contract = await Contract.findById(req.params.contractId);

        if (!contract) {
            return res.status(404).json({
                success: false,
                message: "Contract not found"
            });
        }

        if (contract.client.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: "Only the client can add milestones"
            });
        }

        contract.milestones.push({
            title,
            description,
            amount,
            dueDate,
            status: "pending"
        });

        await contract.save();

        res.status(200).json({
            success: true,
            message: "Milestone added successfully",
            contract
        });

    } catch (error) {
        console.error("Error in addMilestone:", error);
        res.status(500).json({
            success: false,
            message: "Error adding milestone",
            error: error.message
        });
    }
};

// Submit work for milestone
export const submitWork = async (req, res) => {
    try {
        // Handle file uploads
        upload.array('files')(req, res, async (err) => {
            if (err) {
                return res.status(400).json({
                    success: false,
                    message: "Error uploading files",
                    error: err.message
                });
            }

            const { comments } = req.body;
            const contract = await Contract.findById(req.params.contractId)
                .populate('job', 'title');

            if (!contract) {
                return res.status(404).json({
                    success: false,
                    message: "Contract not found"
                });
            }

            if (contract.freelancer.toString() !== req.user._id.toString()) {
                return res.status(403).json({
                    success: false,
                    message: "Only the freelancer can submit work"
                });
            }

            const milestone = contract.milestones.id(req.params.milestoneId);
            if (!milestone) {
                return res.status(404).json({
                    success: false,
                    message: "Milestone not found"
                });
            }

            // Process and save files
            const savedFiles = [];
            if (req.files && req.files.length > 0) {
                for (const file of req.files) {
                    try {
                        const fileUrl = await saveFileToStorage(file);
                        savedFiles.push({
                            filename: file.originalname,
                            url: fileUrl,
                            mimetype: file.mimetype,
                            size: file.size
                        });
                    } catch (error) {
                        console.error('Error saving file:', error);
                        // Continue with other files if one fails
                    }
                }
            }

            const now = new Date();

            // If there's a current submission, move it to history
            if (milestone.currentSubmission) {
                if (!milestone.submissionHistory) {
                    milestone.submissionHistory = [];
                }

                const submissionToMove = {
                    ...milestone.currentSubmission.toObject(),
                    submittedAt: milestone.currentSubmission.submittedAt || now,
                    status: milestone.currentSubmission.status || 'pending'
                };

                milestone.submissionHistory.push(submissionToMove);
            }

            // Create new submission
            milestone.currentSubmission = {
                files: savedFiles,
                comments: comments || '',
                submittedAt: now,
                status: 'pending',
                clientFeedback: '',
                feedbackAt: null
            };

            // Update milestone status
            milestone.status = "submitted";

            try {
                await contract.save();
            } catch (error) {
                console.error('Error saving contract:', error);
                return res.status(500).json({
                    success: false,
                    message: "Error saving submission",
                    error: error.message
                });
            }

            // Create notification for the client
            const notification = new Notification({
                recipient: contract.client,
                sender: req.user._id,
                type: 'MILESTONE_SUBMITTED',
                job: contract.job._id,
                message: `New submission received for milestone "${milestone.title}" in project "${contract.job.title}"`
            });

            await notification.save();

            res.status(200).json({
                success: true,
                message: "Work submitted successfully",
                contract
            });
        });
    } catch (error) {
        console.error("Error in submitWork:", error);
        res.status(500).json({
            success: false,
            message: "Error submitting work",
            error: error.message
        });
    }
};

// Review milestone submission
export const reviewSubmission = async (req, res) => {
    try {
        const { status, feedback } = req.body;
        const contract = await Contract.findById(req.params.contractId)
            .populate('job', 'title');

        if (!contract) {
            return res.status(404).json({
                success: false,
                message: "Contract not found"
            });
        }

        if (contract.client.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: "Only the client can review submissions"
            });
        }

        const milestone = contract.milestones.id(req.params.milestoneId);
        if (!milestone) {
            return res.status(404).json({
                success: false,
                message: "Milestone not found"
            });
        }

        if (!milestone.currentSubmission) {
            return res.status(404).json({
                success: false,
                message: "No submission found to review"
            });
        }

        // Update current submission with feedback
        milestone.currentSubmission.status = status;
        if (feedback) {
            milestone.currentSubmission.clientFeedback = feedback;
            milestone.currentSubmission.feedbackAt = new Date();
        }

        // Update milestone status based on review
        if (status === "approved") {
            milestone.status = "completed";
            // Move to history
            if (!milestone.submissionHistory) {
                milestone.submissionHistory = [];
            }
            milestone.submissionHistory.push(milestone.currentSubmission);
            milestone.currentSubmission = null;
        } else if (status === "changes_requested") {
            milestone.status = "changes_requested";
            // Move to history and clear current submission
            if (!milestone.submissionHistory) {
                milestone.submissionHistory = [];
            }
            milestone.submissionHistory.push(milestone.currentSubmission);
            milestone.currentSubmission = null;
        }

        await contract.save();

        // Create notification for the freelancer
        const notificationType = status === "approved" ? "MILESTONE_APPROVED" : "MILESTONE_CHANGES_REQUESTED";
        const notificationMessage = status === "approved" 
            ? `Your submission for milestone "${milestone.title}" in project "${contract.job.title}" has been approved`
            : `Changes requested for milestone "${milestone.title}" in project "${contract.job.title}"`;

        const notification = new Notification({
            recipient: contract.freelancer,
            sender: req.user._id,
            type: notificationType,
            job: contract.job._id,
            message: notificationMessage
        });

        await notification.save();

        res.status(200).json({
            success: true,
            message: "Submission reviewed successfully",
            contract
        });

    } catch (error) {
        console.error("Error in reviewSubmission:", error);
        res.status(500).json({
            success: false,
            message: "Error reviewing submission",
            error: error.message
        });
    }
};

// Release payment for milestone
export const releasePayment = async (req, res) => {
    try {
        const contract = await Contract.findById(req.params.contractId);

        if (!contract) {
            return res.status(404).json({
                success: false,
                message: "Contract not found"
            });
        }

        if (contract.client.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: "Only the client can release payments"
            });
        }

        const milestone = contract.milestones.id(req.params.milestoneId);
        if (!milestone) {
            return res.status(404).json({
                success: false,
                message: "Milestone not found"
            });
        }

        if (milestone.status !== "completed") {
            return res.status(400).json({
                success: false,
                message: "Milestone must be completed before releasing payment"
            });
        }

        // Update escrow balance
        contract.escrowBalance -= milestone.amount;
        milestone.status = "paid";

        await contract.save();

        res.status(200).json({
            success: true,
            message: "Payment released successfully",
            contract
        });

    } catch (error) {
        console.error("Error in releasePayment:", error);
        res.status(500).json({
            success: false,
            message: "Error releasing payment",
            error: error.message
        });
    }
};

// Complete contract
export const completeContract = async (req, res) => {
    try {
        const contract = await Contract.findById(req.params.contractId);

        if (!contract) {
            return res.status(404).json({
                success: false,
                message: "Contract not found"
            });
        }

        if (contract.client.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: "Only the client can complete the contract"
            });
        }

        // Verify all milestones are completed and paid
        const allMilestonesCompleted = contract.milestones.every(
            milestone => milestone.status === "paid"
        );

        if (!allMilestonesCompleted) {
            return res.status(400).json({
                success: false,
                message: "All milestones must be completed and paid before completing the contract"
            });
        }

        contract.status = "completed";
        contract.endDate = new Date();
        await contract.save();

        // Update job status
        await Job.findByIdAndUpdate(contract.job, { status: "completed" });

        res.status(200).json({
            success: true,
            message: "Contract completed successfully",
            contract
        });

    } catch (error) {
        console.error("Error in completeContract:", error);
        res.status(500).json({
            success: false,
            message: "Error completing contract",
            error: error.message
        });
    }
};

// Download submission file
export const downloadSubmissionFile = async (req, res) => {
    try {
        const { contractId, milestoneId, fileId } = req.params;

        // Find the contract
        const contract = await Contract.findById(contractId);
        if (!contract) {
            return res.status(404).json({
                success: false,
                message: "Contract not found"
            });
        }

        // Verify user has access to this contract
        if (contract.client.toString() !== req.user._id.toString() &&
            contract.freelancer.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: "Access denied"
            });
        }

        // Find the milestone
        const milestone = contract.milestones.id(milestoneId);
        if (!milestone) {
            return res.status(404).json({
                success: false,
                message: "Milestone not found"
            });
        }

        // Find the file
        const file = milestone.submission?.files?.find(f => f._id.toString() === fileId);
        if (!file) {
            return res.status(404).json({
                success: false,
                message: "File not found"
            });
        }

        try {
            // Get the file stream
            const fileStream = await getFileFromStorage(file.url);
            
            // Set response headers
            res.setHeader('Content-Type', file.mimetype);
            res.setHeader('Content-Disposition', `attachment; filename="${file.filename}"`);
            
            // Pipe the file stream to response
            fileStream.pipe(res);
            
            // Handle errors during streaming
            fileStream.on('error', (error) => {
                console.error('Error streaming file:', error);
                if (!res.headersSent) {
                    res.status(500).json({
                        success: false,
                        message: "Error streaming file"
                    });
                }
            });
        } catch (error) {
            console.error('Error getting file stream:', error);
            return res.status(404).json({
                success: false,
                message: "File not found in storage"
            });
        }

    } catch (error) {
        console.error("Error in downloadSubmissionFile:", error);
        if (!res.headersSent) {
            res.status(500).json({
                success: false,
                message: "Error downloading file",
                error: error.message
            });
        }
    }
}; 