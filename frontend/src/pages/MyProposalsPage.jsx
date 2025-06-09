import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useProposalStore } from "../store/proposalStore";
import { Clock, DollarSign, Calendar, MessageCircle, AlertCircle, RefreshCw } from "lucide-react";
import LoadingSpinner from "../components/LoadingSpinner";
import toast from "react-hot-toast";
import { useAuthStore } from "../store/authStore";
import { motion } from "framer-motion";
import InlineLoading from "../components/InlineLoading";
import styles from './MyProposalsPage.module.css';

const MyProposalsPage = () => {
    const navigate = useNavigate();
    const [selectedProposal, setSelectedProposal] = useState(null);
    const { setActiveTab } = useAuthStore();
    
    const { 
        proposals, 
        getMyProposals,
        isLoading,
        error 
    } = useProposalStore();

    const [isRefreshing, setIsRefreshing] = useState(false);

    useEffect(() => {
        const loadProposals = async () => {
            try {
                await getMyProposals();
            } catch (error) {
                toast.error(error.message || "Failed to load proposals");
            }
        };
        loadProposals();
    }, [getMyProposals]);

    const handleRefresh = async () => {
        setIsRefreshing(true);
        try {
            await getMyProposals();
            toast.success('Proposals refreshed');
        } catch (error) {
            toast.error('Failed to refresh proposals');
        } finally {
            setIsRefreshing(false);
        }
    };

    if (isLoading && proposals.length === 0) {
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

    if (!proposals.length) {
        return (
            <div className={styles.container}>
                <div className={styles.header}>
                    <motion.h1 
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={styles.pageTitle}
                    >
                        My Proposals
                    </motion.h1>
                    <button
                        onClick={handleRefresh}
                        disabled={isLoading || isRefreshing}
                        className={styles.refreshButton}
                    >
                        <RefreshCw className={isRefreshing ? styles.refreshIconSpinning : styles.refreshIcon} />
                    </button>
                </div>
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={styles.emptyStateContainer}
                >
                    <h2 className={styles.emptyStateTitle}>No proposals yet</h2>
                    <p className={styles.emptyStateText}>You haven't submitted any proposals yet. Browse jobs and start applying!</p>
                    <button
                        onClick={() => navigate("/freelancer-dashboard")}
                        className={styles.browseButton}
                    >
                        Browse Jobs
                    </button>
                </motion.div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <motion.h1 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={styles.pageTitle}
                >
                    My Proposals
                </motion.h1>
                <button
                    onClick={handleRefresh}
                    disabled={isLoading || isRefreshing}
                    className={styles.refreshButton}
                >
                    <RefreshCw className={isRefreshing ? styles.refreshIconSpinning : styles.refreshIcon} />
                </button>
            </div>

            {/* Proposals Grid */}
            <div className={styles.proposalsGrid}>
                {/* Proposals List */}
                <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={styles.proposalsList}
                >
                    <h2 className={styles.proposalsListTitle}>All Proposals ({proposals.length})</h2>
                    {isLoading ? (
                        <div className={styles.proposalsLoadingContainer}>
                            <InlineLoading text="Loading proposals..." size="medium" className="justify-center" />
                        </div>
                    ) : (
                        <div className={styles.proposalsContainer}>
                            {proposals.map((proposal) => (
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
                                            <h3 className={styles.proposalTitle}>
                                                {proposal.job.title}
                                            </h3>
                                            <div className={styles.proposalStatusContainer}>
                                                <span className={`${styles.proposalStatus} ${
                                                    proposal.status === 'pending' ? styles.statusPending :
                                                    proposal.status === 'accepted' ? styles.statusAccepted :
                                                    proposal.status === 'declined' ? styles.statusDeclined :
                                                    styles.statusDefault
                                                }`}>
                                                    {proposal.status.charAt(0).toUpperCase() + proposal.status.slice(1)}
                                                </span>
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
                            {/* Job Details Header */}
                            <div className={styles.detailsHeader}>
                                <h2 className={styles.detailsTitle}>
                                    {selectedProposal.job.title}
                                </h2>
                                <div className={styles.detailsMeta}>
                                    <div className={styles.detailsMetaItem}>
                                        <DollarSign className={styles.detailsMetaIcon} />
                                        <span>Your Bid: ${selectedProposal.bidAmount.amount}</span>
                                    </div>
                                    <div className={styles.detailsMetaItem}>
                                        <Clock className={styles.detailsMetaIcon} />
                                        <span>Duration: {selectedProposal.estimatedDuration}</span>
                                    </div>
                                    <div className={styles.detailsMetaItem}>
                                        <Calendar className={styles.detailsMetaIcon} />
                                        <span>Submitted: {new Date(selectedProposal.createdAt).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Status */}
                            <div className={styles.statusSection}>
                                <h3 className={styles.sectionTitle}>Status</h3>
                                <div className={`${styles.proposalStatus} ${
                                    selectedProposal.status === 'pending' ? styles.statusPending :
                                    selectedProposal.status === 'accepted' ? styles.statusAccepted :
                                    selectedProposal.status === 'declined' ? styles.statusDeclined :
                                    styles.statusDefault
                                }`}>
                                    {selectedProposal.status.charAt(0).toUpperCase() + selectedProposal.status.slice(1)}
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

                            {/* Message Button */}
                            <button
                                onClick={() => {
                                    setActiveTab("messages");
                                    navigate("/freelancer-dashboard", {
                                        state: { 
                                            receiverId: selectedProposal.job.client._id,
                                            proposalId: selectedProposal._id,
                                            jobId: selectedProposal.job._id
                                        }
                                    });
                                }}
                                className={styles.messageButton}
                            >
                                <MessageCircle className={styles.messageIcon} />
                                Message Client
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

export default MyProposalsPage; 