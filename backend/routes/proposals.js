const express = require('express');
const router = express.Router();
const Proposal = require('../models/Proposal');
const Job = require('../models/Job');
const auth = require('../middleware/auth');
const { createNotification } = require('./notifications');

// Submit a proposal
router.post('/', auth, async (req, res) => {
    try {
        const { jobId, coverLetter, budget } = req.body;
        const freelancerId = req.user._id;

        // Check if job exists
        const job = await Job.findById(jobId);
        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }

        // Create proposal
        const proposal = new Proposal({
            job: jobId,
            freelancer: freelancerId,
            client: job.client,
            coverLetter,
            budget
        });

        const savedProposal = await proposal.save();

        // Create notification for client
        await createNotification({
            recipient: job.client,
            sender: freelancerId,
            type: 'NEW_PROPOSAL',
            job: jobId,
            proposal: savedProposal._id
        });

        res.status(201).json({ data: savedProposal });
    } catch (error) {
        console.error('Error submitting proposal:', error);
        res.status(500).json({ message: 'Error submitting proposal' });
    }
});

// Accept/Reject proposal
router.patch('/:id/status', auth, async (req, res) => {
    try {
        const { status } = req.body;
        const proposal = await Proposal.findById(req.params.id)
            .populate('job', 'title client');

        if (!proposal) {
            return res.status(404).json({ message: 'Proposal not found' });
        }

        // Check if user is the client of the job
        if (proposal.job.client.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        proposal.status = status;
        await proposal.save();

        // Create notification for freelancer
        await createNotification({
            recipient: proposal.freelancer,
            sender: req.user._id,
            type: status === 'accepted' ? 'PROPOSAL_ACCEPTED' : 'PROPOSAL_REJECTED',
            job: proposal.job._id,
            proposal: proposal._id
        });

        res.json({ data: proposal });
    } catch (error) {
        console.error('Error updating proposal status:', error);
        res.status(500).json({ message: 'Error updating proposal status' });
    }
});

// Get proposals for a job
router.get('/job/:jobId', auth, async (req, res) => {
    try {
        const proposals = await Proposal.find({ job: req.params.jobId })
            .populate('freelancer', 'name profile')
            .sort('-createdAt');
        res.json({ data: proposals });
    } catch (error) {
        console.error('Error fetching proposals:', error);
        res.status(500).json({ message: 'Error fetching proposals' });
    }
});

// Get proposals by freelancer
router.get('/freelancer', auth, async (req, res) => {
    try {
        const proposals = await Proposal.find({ freelancer: req.user._id })
            .populate('job', 'title budget status')
            .populate('client', 'name profile')
            .sort('-createdAt');
        res.json({ data: proposals });
    } catch (error) {
        console.error('Error fetching proposals:', error);
        res.status(500).json({ message: 'Error fetching proposals' });
    }
});

module.exports = router; 