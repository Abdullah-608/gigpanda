import express from "express";
import { protectRoute } from "../middleware/protectRoute.js";
import {
    createProposal,
    getJobProposals,
    getMyProposals,
    getProposalById,
    updateProposalStatus,
    deleteProposal
} from "../controllers/proposal.controller.js";

const router = express.Router();

// Create a new proposal
router.post("/:jobId", protectRoute, createProposal);

// Get proposals for a specific job (client view)
router.get("/job/:jobId", protectRoute, getJobProposals);

// Get proposals submitted by the freelancer
router.get("/my-proposals", protectRoute, getMyProposals);

// Get a single proposal by ID
router.get("/:id", protectRoute, getProposalById);

// Update proposal status
router.patch("/:id/status", protectRoute, updateProposalStatus);

// Delete a proposal
router.delete("/:id", protectRoute, deleteProposal);

export default router; 