import express from "express";
import { protectRoute } from "../middleware/protectRoute.js";
import { 
    createContract,
    getContractById,
    getMyContracts,
    fundEscrow,
    activateContract,
    addMilestone,
    submitWork,
    reviewSubmission,
    releasePayment,
    completeContract,
    downloadSubmissionFile
} from "../controllers/contract.controller.js";

const router = express.Router();

// Apply protection to all routes
router.use(protectRoute);

// Create contract from proposal
router.post("/proposal/:proposalId", createContract);

// Get user's contracts
router.get("/my/contracts", getMyContracts);

// Get contract by ID
router.get("/:contractId", getContractById);

// Download submission file
router.get("/:contractId/milestones/:milestoneId/files/:fileId/download", downloadSubmissionFile);

// Fund contract escrow
router.post("/:contractId/fund", fundEscrow);

// Activate contract
router.post("/:contractId/activate", activateContract);

// Add milestone
router.post("/:contractId/milestones", addMilestone);

// Submit work for milestone
router.post("/:contractId/milestones/:milestoneId/submit", submitWork);

// Review milestone submission
router.post("/:contractId/milestones/:milestoneId/review", reviewSubmission);

// Release payment for milestone
router.post("/:contractId/milestones/:milestoneId/release", releasePayment);

// Complete contract
router.post("/:contractId/complete", completeContract);

export default router; 