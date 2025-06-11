import Job from "../models/job.model.js";
import User from "../models/user.model.js";
import Proposal from "../models/proposal.model.js";
import Contract from "../models/contract.model.js";
import { validateJobInput } from '../utils/validation.js';

// Create a new job posting
export const createJob = async (req, res) => {
    try {
        const {
            title,
            description,
            category,
            skillsRequired,
            budget,
            budgetType,
            timeline,
            experienceLevel,
            location
        } = req.body;

        // Validate job input
        const { isValid, errors } = validateJobInput(req.body);
        if (!isValid) {
            return res.status(400).json({
                success: false,
                message: "Validation failed",
                errors
            });
        }

        // Validate user is a client
        if (req.user.role !== 'client') {
            return res.status(403).json({
                success: false,
                message: "Only clients can post jobs"
            });
        }

        // Create the job
        const job = new Job({
            title,
            description,
            client: req.user._id,
            category,
            skillsRequired: skillsRequired || [],
            budget,
            budgetType,
            timeline,
            experienceLevel,
            location: location || "remote"
        });

        await job.save();

        // Populate client information
        await job.populate('client', 'name email profilePicture');

        res.status(201).json({
            success: true,
            message: "Job posted successfully",
            job
        });

    } catch (error) {
        console.error("Error creating job:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

// Get all jobs (with filters)
export const getJobs = async (req, res) => {
    try {
        const { 
            page = 1, 
            limit = 10, 
            search, 
            category, 
            experienceLevel, 
            budgetMin, 
            budgetMax, 
            budgetType,
            timeline,
            location,
            sortBy = 'newest'
        } = req.query;

        // Build filter
        const filter = { status: 'open' }; // Only show open jobs
        if (search) {
            filter.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { skillsRequired: { $in: [new RegExp(search, 'i')] } }
            ];
        }
        if (category && category !== 'all') {
            filter.category = category;
        }
        if (experienceLevel && experienceLevel !== 'all') {
            filter.experienceLevel = experienceLevel;
        }
        if (location && location !== 'all') {
            filter.location = location;
        }
        if (budgetType && budgetType !== 'all') {
            filter.budgetType = budgetType;
        }
        if (timeline && timeline !== 'all') {
            filter.timeline = timeline;
        }
        // Budget filtering - include jobs whose budget range overlaps with filter range
        if (budgetMin || budgetMax) {
            const budgetFilter = {};
            if (budgetMin) {
                // Job's max budget should be >= filter's min (job is not too cheap)
                budgetFilter['budget.max'] = { $gte: parseInt(budgetMin) };
            }
            if (budgetMax) {
                // Job's min budget should be <= filter's max (job is not too expensive)
                budgetFilter['budget.min'] = { $lte: parseInt(budgetMax) };
            }
            // Combine budget filters with AND
            Object.assign(filter, budgetFilter);
        }

        // Get jobs where the freelancer's proposal hasn't been accepted
        const acceptedProposals = await Proposal.find({
            freelancer: req.user._id,
            status: 'accepted'
        }).select('job');

        const acceptedJobIds = acceptedProposals.map(p => p.job);
        filter._id = { $nin: acceptedJobIds };

        // Build sort object
        let sortObject = {};
        switch (sortBy) {
            case 'newest':
                sortObject = { createdAt: -1 };
                break;
            case 'oldest':
                sortObject = { createdAt: 1 };
                break;
            case 'budget-high':
                sortObject = { 'budget.max': -1 };
                break;
            case 'budget-low':
                sortObject = { 'budget.min': 1 };
                break;
            case 'deadline':
                // Sort by timeline priority (urgent first)
                sortObject = { timeline: 1, createdAt: -1 };
                break;
            default:
                sortObject = { createdAt: -1 };
        }

        // Calculate pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);
        
        // Get jobs
        const jobs = await Job.find(filter)
            .populate('client', 'name email profilePicture')
            .sort(sortObject)
            .skip(skip)
            .limit(parseInt(limit));

        // Get proposal counts for each job
        const jobIds = jobs.map(job => job._id);
        const proposalCounts = await Proposal.aggregate([
            { $match: { job: { $in: jobIds } } },
            { $group: { _id: "$job", count: { $sum: 1 } } }
        ]);

        // Create a map of job ID to proposal count
        const proposalCountMap = proposalCounts.reduce((map, item) => {
            map[item._id.toString()] = item.count;
            return map;
        }, {});

        // Add proposal count to each job
        const jobsWithProposalCount = jobs.map(job => {
            const jobObj = job.toObject();
            jobObj.proposalCount = proposalCountMap[job._id.toString()] || 0;
            return jobObj;
        });

        const totalJobs = await Job.countDocuments(filter);
        const totalPages = Math.ceil(totalJobs / parseInt(limit));

        res.status(200).json({
            success: true,
            jobs: jobsWithProposalCount,
            pagination: {
                currentPage: parseInt(page),
                totalPages,
                totalJobs,
                hasNextPage: parseInt(page) < totalPages,
                hasPrevPage: parseInt(page) > 1
            }
        });

    } catch (error) {
        console.error("Error fetching jobs:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

// Get a single job by ID
export const getJobById = async (req, res) => {
    try {
        const { id } = req.params;

        const job = await Job.findById(id)
            .populate('client', 'name email profilePicture');

        if (!job) {
            return res.status(404).json({
                success: false,
                message: "Job not found"
            });
        }

        // Get proposal count for this job
        const proposalCount = await Proposal.countDocuments({ job: id });

        // Add proposal count to job object
        const jobWithProposalCount = job.toObject();
        jobWithProposalCount.proposalCount = proposalCount;

        res.status(200).json({
            success: true,
            job: jobWithProposalCount
        });

    } catch (error) {
        console.error("Error fetching job:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

// Apply to a job
export const applyToJob = async (req, res) => {
    try {
        const { id } = req.params;
        const { proposalText, proposedBudget, estimatedDuration } = req.body;

        // Validate required fields
        if (!proposalText || !proposedBudget || !estimatedDuration) {
            return res.status(400).json({
                success: false,
                message: "Please provide all required fields"
            });
        }

        // Validate user is a freelancer
        if (req.user.role !== 'freelancer') {
            return res.status(403).json({
                success: false,
                message: "Only freelancers can apply to jobs"
            });
        }

        const job = await Job.findById(id);

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
                message: "This job is no longer accepting applications"
            });
        }

        // Check if user already applied
        const existingApplication = job.applications.find(
            app => app.freelancer.toString() === req.user._id.toString()
        );

        if (existingApplication) {
            return res.status(400).json({
                success: false,
                message: "You have already applied to this job"
            });
        }

        // Add application
        job.applications.push({
            freelancer: req.user._id,
            proposalText,
            proposedBudget: parseFloat(proposedBudget),
            estimatedDuration
        });

        await job.save();

        // Populate the new application
        await job.populate('applications.freelancer', 'name email profilePicture skills');

        const newApplication = job.applications[job.applications.length - 1];

        res.status(200).json({
            success: true,
            message: "Application submitted successfully",
            application: newApplication
        });

    } catch (error) {
        console.error("Error applying to job:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

// Get jobs posted by the current client
export const getMyJobs = async (req, res) => {
    try {
        const { page = 1, limit = 10, status, include_contracts } = req.query;

        // Validate user exists and has a role
        if (!req.user || !req.user.role) {
            return res.status(401).json({
                success: false,
                message: "User authentication required"
            });
        }

        // Validate user is a client
        if (req.user.role !== 'client') {
            return res.status(403).json({
                success: false,
                message: "Access denied - only clients can view their posted jobs"
            });
        }

        // Build filter
        const filter = { client: req.user._id };
        if (status && status !== 'all') {
            filter.status = status;
        }

        // Calculate pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);
        
        // Get jobs with proper error handling
        let jobs;
        try {
            jobs = await Job.find(filter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit));
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: "Error fetching jobs"
            });
        }

        // Get job IDs
        const jobIds = jobs.map(job => job._id);

        // Get proposals for all jobs with error handling
        let proposals;
        try {
            proposals = await Proposal.find({ job: { $in: jobIds } })
                .select('job status freelancer')
                .populate('freelancer', 'name email profile');
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: "Error fetching job proposals"
            });
        }

        // Get contracts if include_contracts is true
        let contracts = [];
        if (include_contracts === 'true') {
            try {
                console.log('Fetching contracts for jobs:', jobIds);
                contracts = await Contract.find({ 
                    job: { $in: jobIds },
                    client: req.user._id
                })
                .populate('freelancer', 'name email profilePicture')
                .select('-clientSignedAt -freelancerSignedAt -terms');
                
                console.log('Contracts fetched:', contracts.length, 'contracts found');
                console.log('Contract details:', contracts.map(c => ({
                    jobId: c.job,
                    contractId: c._id,
                    milestones: c.milestones?.length || 0
                })));
            } catch (error) {
                console.error("Contract fetch error:", error.message);
                return res.status(500).json({
                    success: false,
                    message: "Error fetching contracts"
                });
            }
        } else {
            console.log('Skipping contract fetch - include_contracts not set to true');
        }

        // Create a map of job ID to proposals
        const proposalMap = proposals.reduce((map, proposal) => {
            if (!map[proposal.job.toString()]) {
                map[proposal.job.toString()] = [];
            }
            map[proposal.job.toString()].push(proposal);
            return map;
        }, {});

        // Add proposals and counts to each job
        const jobsWithProposals = jobs.map(job => {
            const jobObj = job.toObject();
            jobObj.proposals = proposalMap[job._id.toString()] || [];
            jobObj.proposalCount = jobObj.proposals.length;
            jobObj.hasAcceptedProposal = jobObj.proposals.some(p => p.status === 'accepted');
            return jobObj;
        });

        const totalJobs = await Job.countDocuments(filter);
        const totalPages = Math.ceil(totalJobs / parseInt(limit));

        const response = {
            success: true,
            jobs: jobsWithProposals,
            pagination: {
                currentPage: parseInt(page),
                totalPages,
                totalJobs,
                hasNextPage: parseInt(page) < totalPages,
                hasPrevPage: parseInt(page) > 1
            }
        };

        // Include contracts in response if requested
        if (include_contracts === 'true') {
            response.contracts = contracts;
        }

        res.status(200).json(response);

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

// Update job status (for job owner)
export const updateJobStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const job = await Job.findById(id);

        if (!job) {
            return res.status(404).json({
                success: false,
                message: "Job not found"
            });
        }

        // Check if user is the job owner
        if (job.client.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: "You can only update your own jobs"
            });
        }

        // Update status
        if (status) {
            job.status = status;
        }

        await job.save();

        res.status(200).json({
            success: true,
            message: "Job updated successfully",
            job
        });

    } catch (error) {
        console.error("Error updating job:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

// Get applications for freelancer (simplified)
export const getMyApplications = async (req, res) => {
    try {
        const { page = 1, limit = 10, status } = req.query;

        // Validate user is a freelancer
        if (req.user.role !== 'freelancer') {
            return res.status(403).json({
                success: false,
                message: "Access denied"
            });
        }

        // Build filter
        const filter = {
            'applications.freelancer': req.user._id
        };

        // Calculate pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);

        // Get jobs where user has applied
        const jobs = await Job.find(filter)
            .populate('client', 'name email profilePicture')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        // Filter to only show the user's applications
        const applications = jobs.map(job => {
            const userApplication = job.applications.find(
                app => app.freelancer.toString() === req.user._id.toString()
            );
            return {
                _id: job._id,
                title: job.title,
                category: job.category,
                budget: job.budget,
                budgetType: job.budgetType,
                timeline: job.timeline,
                status: job.status,
                client: job.client,
                application: userApplication,
                createdAt: job.createdAt
            };
        }).filter(item => item.application);

        const totalApplications = await Job.countDocuments(filter);
        const totalPages = Math.ceil(totalApplications / parseInt(limit));

        res.status(200).json({
            success: true,
            applications,
            pagination: {
                currentPage: parseInt(page),
                totalPages,
                totalApplications,
                hasNextPage: parseInt(page) < totalPages,
                hasPrevPage: parseInt(page) > 1
            }
        });

    } catch (error) {
        console.error("Error fetching applications:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

// Get hot/trending jobs (recent jobs with good application activity)
export const getHotJobs = async (req, res) => {
    try {
        const { limit = 6 } = req.query;

        // Get recent jobs (last 7 days) sorted by creation date
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const hotJobs = await Job.find({
            status: 'open',
            createdAt: { $gte: sevenDaysAgo }
        })
        .populate('client', 'name email')
        .sort({ createdAt: -1 }) // Sort by newest first
        .limit(parseInt(limit))
        .select('title description client category budget budgetType timeline createdAt applications');

        // If we don't have enough recent jobs, fill with older jobs
        if (hotJobs.length < parseInt(limit)) {
            const remainingLimit = parseInt(limit) - hotJobs.length;
            const existingJobIds = hotJobs.map(job => job._id);
            
            const olderJobs = await Job.find({
                status: 'open',
                _id: { $nin: existingJobIds }
            })
            .populate('client', 'name email')
            .sort({ createdAt: -1 })
            .limit(remainingLimit)
            .select('title description client category budget budgetType timeline createdAt applications');
            
            hotJobs.push(...olderJobs);
        }

        // Format the jobs for frontend
        const formattedJobs = hotJobs.map(job => ({
            _id: job._id,
            title: job.title,
            description: job.description,
            client: {
                name: job.client?.name || 'Anonymous Client'
            },
            category: job.category,
            budget: job.budget,
            budgetType: job.budgetType,
            timeline: job.timeline,
            applicationCount: job.applications?.length || 0,
            createdAt: job.createdAt
        }));

        res.status(200).json({
            success: true,
            jobs: formattedJobs
        });

    } catch (error) {
        console.error("Error fetching hot jobs:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
}; 

// Delete a job and all related data
export const deleteJob = async (req, res) => {
    try {
        const { id } = req.params;

        // Find the job
        const job = await Job.findById(id);

        if (!job) {
            return res.status(404).json({
                success: false,
                message: "Job not found"
            });
        }

        // Check if user is the job owner
        if (job.client.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: "You can only delete your own jobs"
            });
        }

        // Delete all related proposals
        await Proposal.deleteMany({ job: id });

        // Delete the job
        await Job.findByIdAndDelete(id);

        res.status(200).json({
            success: true,
            message: "Job and related data deleted successfully"
        });

    } catch (error) {
        console.error("Error deleting job:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
}; 