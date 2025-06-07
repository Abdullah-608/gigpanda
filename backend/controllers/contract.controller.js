import Contract from "../models/contract.model.js";
import Proposal from "../models/proposal.model.js";
import Job from "../models/job.model.js";

// Create a new contract from a proposal
export const createContract = async (req, res) => {
    try {
        const { proposalId } = req.params;
        const { title, scope, totalAmount, terms, milestones } = req.body;

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

        // Create the contract
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
                ...milestone,
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
        const { files, comments } = req.body;
        const contract = await Contract.findById(req.params.contractId);

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

        milestone.submission = {
            files,
            comments,
            submittedAt: new Date(),
            status: "pending"
        };
        milestone.status = "submitted";

        await contract.save();

        res.status(200).json({
            success: true,
            message: "Work submitted successfully",
            contract
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

        milestone.submission.status = status;
        milestone.submission.clientFeedback = feedback;

        if (status === "approved") {
            milestone.status = "completed";
        }

        await contract.save();

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