import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useProposalStore } from "../store/proposalStore";
import { useJobStore } from "../store/jobStore";
import { Clock, DollarSign, Calendar, Star, MessageCircle, ThumbsUp, ThumbsDown, PhoneCall, Trash2, AlertCircle } from "lucide-react";
import LoadingSpinner from "../components/LoadingSpinner";
import { useAuthStore } from "../store/authStore";
import { toast } from "react-hot-toast";
import { motion } from "framer-motion";
import InlineLoading from "../components/InlineLoading";
import styles from './IncomingProposalsPage.module.css';

const IncomingProposalsPage = () => {
    const { jobId } = useParams();
    const navigate = useNavigate();
    const [selectedProposal, setSelectedProposal] = useState(null);
    const { setActiveTab } = useAuthStore();
    const [actionLoading, setActionLoading] = useState({ id: null, action: null });
    
    const { 
        incomingProposals, 
        getJobProposals, 
        updateProposalStatus,
        deleteProposal,
        isLoading,
        error 
    } = useProposalStore();
    
    const { fetchJobById, currentJob } = useJobStore();

    useEffect(() => {
        const loadData = async () => {
            try {
                await Promise.all([
                    getJobProposals(jobId),
                    fetchJobById(jobId)
                ]);
            } catch (error) {
                toast.error(error.message || "Failed to load proposals");
            }
        };
        loadData();
    }, [jobId, getJobProposals, fetchJobById]);

    const handleProposalAction = async (proposalId, status) => {
        try {
            setActionLoading({ id: proposalId, action: status });
            const updatedProposal = await updateProposalStatus(proposalId, status);
            if (status === "accepted") {
                navigate(`/contracts/create/${updatedProposal._id}`);
            }
            toast.success(`Proposal ${status} successfully`);
        } catch (error) {
            toast.error(error.message || "Failed to update proposal status");
        } finally {
            setActionLoading({ id: null, action: null });
        }
    };

    const handleDeleteProposal = async (proposalId) => {
        if (window.confirm('Are you sure you want to delete this proposal? This action cannot be undone.')) {
            try {
                setActionLoading({ id: proposalId, action: 'delete' });
                await deleteProposal(proposalId);
                setSelectedProposal(null);
                toast.success("Proposal deleted successfully");
            } catch (error) {
                toast.error(error.message || 'Failed to delete proposal');
            } finally {
                setActionLoading({ id: null, action: null });
            }
        }
    };

    if (isLoading && !currentJob && incomingProposals.length === 0) {
        return <LoadingSpinner />;
    }

    if (error) {
        return (
            <div className={styles.container}>
                <div className={styles.errorContainer}>
                    <AlertCircle className={styles.errorIcon} />
                    <span>{error}</span>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            {/* Job Details Header */}
            {currentJob && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={styles.jobHeader}
                >
                    <h1 className={styles.jobTitle}>{currentJob.title}</h1>
                    <div className={styles.jobMeta}>
                        <div className={styles.jobMetaItem}>
                            <DollarSign className={styles.jobMetaIcon} />
                            <span>Budget: ${currentJob.budget.min} - ${currentJob.budget.max}</span>
                        </div>
                        <div className={styles.jobMetaItem}>
                            <Clock className={styles.jobMetaIcon} />
                            <span>Duration: {currentJob.timeline}</span>
                        </div>
                        <div className={styles.jobMetaItem}>
                            <Calendar className={styles.jobMetaIcon} />
                            <span>Posted: {new Date(currentJob.createdAt).toLocaleDateString()}</span>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Proposals Grid */}
            <div className={styles.proposalsGrid}>
                {/* Proposals List */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={styles.proposalsList}
                >
                    <h2 className={styles.proposalsListTitle}>Proposals ({incomingProposals.length})</h2>
                    {isLoading && incomingProposals.length === 0 ? (
                        <div className={styles.proposalsLoadingContainer}>
                            <InlineLoading text="Loading proposals..." size="medium" className="justify-center" />
                        </div>
                    ) : incomingProposals.length === 0 ? (
                        <div className={styles.noProposalsMessage}>
                            No proposals received yet
                        </div>
                    ) : (
                        <div className={styles.proposalsContainer}>
                            {incomingProposals.map((proposal) => (
                                <div
                                    key={proposal._id}
                                    className={`${styles.proposalCard} ${
                                        selectedProposal?._id === proposal._id
                                            ? styles.proposalCardSelected
                                            : styles.proposalCardUnselected
                                    }`}
                                    onClick={() => setSelectedProposal(proposal)}
                                >
                                    <div className={styles.proposalCardContent}>
                                        <div className={styles.proposalInfo}>
                                            <h3 className={styles.proposalFreelancerName}>
                                                {proposal.freelancer.name}
                                            </h3>
                                            <div className={styles.proposalRating}>
                                                <Star className={styles.ratingIcon} />
                                                <span>4.8 (120 reviews)</span>
                                            </div>
                                        </div>
                                        <div className={styles.proposalMeta}>
                                            <div className={styles.proposalAmount}>
                                                ${proposal.bidAmount.amount}
                                            </div>
                                            <div className={styles.proposalDuration}>
                                                {proposal.estimatedDuration}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </motion.div>

                {/* Proposal Details */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={styles.detailsContainer}
                >
                    {selectedProposal ? (
                        <div className={styles.detailsCard}>
                            {/* Freelancer Details */}
                            <div className={styles.freelancerHeader}>
                                <div className={styles.freelancerInfo}>
                                    <h2 className={styles.freelancerName}>
                                        {selectedProposal.freelancer.name}
                                    </h2>
                                    <div className={styles.freelancerRating}>
                                        <Star className={styles.ratingIcon} />
                                        <span>4.8 (120 reviews)</span>
                                    </div>
                                </div>
                                <div className={styles.freelancerMeta}>
                                    <div className={styles.freelancerAmount}>
                                        ${selectedProposal.bidAmount.amount}
                                    </div>
                                    <div className={styles.freelancerDuration}>
                                        {selectedProposal.estimatedDuration}
                                    </div>
                                </div>
                            </div>

                            {/* Cover Letter */}
                            <div className={styles.coverLetterSection}>
                                <h3 className={styles.sectionTitle}>Cover Letter</h3>
                                <p className={styles.coverLetterText}>
                                    {selectedProposal.coverLetter}
                                </p>
                            </div>

                            {/* Attachments */}
                            {selectedProposal.attachments?.length > 0 && (
                                <div className={styles.attachmentsSection}>
                                    <h3 className={styles.sectionTitle}>Attachments</h3>
                                    <div className={styles.attachmentsList}>
                                        {selectedProposal.attachments.map((attachment, index) => (
                                            <div
                                                key={index}
                                                className={styles.attachmentItem}
                                            >
                                                <span className={styles.attachmentName}>
                                                    {attachment.filename}
                                                </span>
                                                <a
                                                    href={attachment.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className={styles.attachmentLink}
                                                >
                                                    Download
                                                </a>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Action Buttons */}
                            {selectedProposal.status === "pending" && (
                                <div className={styles.actionButtons}>
                                    <button
                                        onClick={() => handleProposalAction(selectedProposal._id, "accepted")}
                                        disabled={actionLoading.id === selectedProposal._id}
                                        className={`${styles.actionButton} ${styles.acceptButton}`}
                                    >
                                        {actionLoading.id === selectedProposal._id && actionLoading.action === "accepted" ? (
                                            <InlineLoading 
                                                text="Accepting..." 
                                                size="small"
                                                textColor="text-white"
                                                spinnerColor="text-white"
                                            />
                                        ) : (
                                            <>
                                                <ThumbsUp className={styles.buttonIcon} />
                                                Accept Proposal
                                            </>
                                        )}
                                    </button>
                                    <button
                                        onClick={() => handleProposalAction(selectedProposal._id, "interviewing")}
                                        disabled={actionLoading.id === selectedProposal._id}
                                        className={`${styles.actionButton} ${styles.interviewButton}`}
                                    >
                                        {actionLoading.id === selectedProposal._id && actionLoading.action === "interviewing" ? (
                                            <InlineLoading 
                                                text="Requesting..." 
                                                size="small"
                                                textColor="text-white"
                                                spinnerColor="text-white"
                                            />
                                        ) : (
                                            <>
                                                <PhoneCall className={styles.buttonIcon} />
                                                Request Interview
                                            </>
                                        )}
                                    </button>
                                    <button
                                        onClick={() => handleProposalAction(selectedProposal._id, "declined")}
                                        disabled={actionLoading.id === selectedProposal._id}
                                        className={`${styles.actionButton} ${styles.declineButton}`}
                                    >
                                        {actionLoading.id === selectedProposal._id && actionLoading.action === "declined" ? (
                                            <InlineLoading 
                                                text="Declining..." 
                                                size="small"
                                                textColor="text-white"
                                                spinnerColor="text-white"
                                            />
                                        ) : (
                                            <>
                                                <ThumbsDown className={styles.buttonIcon} />
                                                Decline
                                            </>
                                        )}
                                    </button>
                                </div>
                            )}

                            {/* Delete Button */}
                            <button
                                onClick={() => handleDeleteProposal(selectedProposal._id)}
                                disabled={actionLoading.id === selectedProposal._id}
                                className={styles.deleteButton}
                            >
                                {actionLoading.id === selectedProposal._id && actionLoading.action === "delete" ? (
                                    <InlineLoading 
                                        text="Deleting..." 
                                        size="small"
                                        textColor="text-red-600"
                                        spinnerColor="text-red-600"
                                    />
                                ) : (
                                    <>
                                        <Trash2 className={styles.buttonIcon} />
                                        Delete Proposal
                                    </>
                                )}
                            </button>

                            {/* Message Button */}
                            <button
                                onClick={() => {
                                    if (selectedProposal?.freelancer) {
                                        setActiveTab("messages");
                                        navigate("/client-dashboard", {
                                            state: { 
                                                receiverId: selectedProposal.freelancer._id,
                                                proposalId: selectedProposal._id,
                                                jobId: selectedProposal.job._id
                                            }
                                        });
                                    }
                                }}
                                disabled={actionLoading.id === selectedProposal._id}
                                className={styles.messageButton}
                            >
                                <MessageCircle className={styles.buttonIcon} />
                                Send Message
                            </button>
                        </div>
                    ) : (
                        <div className={styles.emptyDetails}>
                            Select a proposal to view details
                        </div>
                    )}
                </motion.div>
            </div>
        </div>
    );
};

export default IncomingProposalsPage; 