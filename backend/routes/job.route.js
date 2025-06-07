import express from "express";
import {
    createJob,
    getJobs,
    getJobById,
    applyToJob,
    getMyJobs,
    updateJobStatus,
    getMyApplications,
    getHotJobs,
    deleteJob
} from "../controllers/job.controller.js";
import { protectRoute } from "../middleware/protectRoute.js";

const router = express.Router();

// Public routes (with optional auth for view tracking)
router.get("/", protectRoute, getJobs);
router.get("/hot", protectRoute, getHotJobs); // Public route for hot jobs - MUST come before /:id
router.get("/:id", protectRoute, getJobById);

// Protected routes - for authenticated users only
router.post("/", protectRoute, createJob);
router.post("/:id/apply", protectRoute, applyToJob);
router.get("/my/jobs", protectRoute, getMyJobs);
router.get("/my/applications", protectRoute, getMyApplications);
router.patch("/:id/status", protectRoute, updateJobStatus);
router.delete("/:id", protectRoute, deleteJob);

export default router; 