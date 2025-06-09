import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useContractStore } from "../store/contractStore";
import { useAuthStore } from "../store/authStore";
import { DollarSign, CheckCircle, FileUp, AlertCircle, ChevronDown, ChevronUp, Check } from "lucide-react";
import LoadingSpinner from "../components/LoadingSpinner";
import ContractMessaging from "../components/ContractMessaging";
import toast from "react-hot-toast";
import styles from "./ContractDetailsPage.module.css";

const ContractDetailsPage = () => {
    const { contractId } = useParams();
    const { user } = useAuthStore();
    const { 
        getContractById, 
        currentContract, 
        fundEscrow,
        submitWork,
        reviewSubmission,
        releasePayment,
        completeContract,
        isLoading 
    } = useContractStore();

    const [expandedMilestone, setExpandedMilestone] = useState(null);
    const [submissionFiles, setSubmissionFiles] = useState([]);
    const [submissionComment, setSubmissionComment] = useState("");
    const [fundAmount, setFundAmount] = useState(0);
    const [showFundModal, setShowFundModal] = useState(false);

    useEffect(() => {
        const loadContract = async () => {
            await getContractById(contractId);
        };
        loadContract();
    }, [contractId, getContractById]);

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        setSubmissionFiles(files);
    };

    const handleSubmitWork = async (milestoneId) => {
        try {
            const formData = new FormData();
            submissionFiles.forEach(file => {
                formData.append('files', file);
            });
            formData.append('comments', submissionComment);

            await submitWork(contractId, milestoneId, formData);
            await getContractById(contractId); // Refresh contract data

            setSubmissionFiles([]);
            setSubmissionComment("");
            setExpandedMilestone(null);
            
            toast.success("Work submitted successfully");
        } catch (error) {
            console.error("Error submitting work:", error);
            toast.error("Failed to submit work. Please try again.");
        }
    };

    const handleReviewSubmission = async (milestoneId, status, feedback = "") => {
        try {
            await reviewSubmission(contractId, milestoneId, { status, feedback });
            await getContractById(contractId); // Refresh contract data
            toast.success(status === "approved" ? "Work approved successfully!" : "Changes requested successfully!");
        } catch (error) {
            toast.error("Error reviewing submission");
        }
    };

    const handleReleasePayment = async (milestoneId) => {
        try {
            await releasePayment(contractId, milestoneId);
            await getContractById(contractId); // Refresh contract data
            toast.success("Payment released successfully!");
        } catch (error) {
            toast.error("Error releasing payment");
        }
    };

    const handleFundEscrow = async () => {
        try {
            await fundEscrow(contractId, fundAmount);
            await getContractById(contractId); // Refresh contract data
            setShowFundModal(false);
            setFundAmount(0);
            toast.success("Escrow funded successfully!");
        } catch (error) {
            toast.error("Error funding escrow");
        }
    };

    const handleCompleteContract = async () => {
        try {
            await completeContract(contractId);
            await getContractById(contractId); // Refresh contract data
            toast.success("Contract completed successfully!");
        } catch (error) {
            toast.error(error.response?.data?.message || "Error completing contract");
        }
    };

    const getStatusColor = (status) => {
        const colors = {
            draft: styles.statusDraft,
            funded: styles.statusFunded,
            active: styles.statusActive,
            completed: styles.statusCompleted,
            closed: styles.statusClosed,
            cancelled: styles.statusCancelled
        };
        return colors[status] || styles.statusDraft;
    };

    const getMilestoneStatusColor = (status) => {
        const colors = {
            pending: styles.milestonePending,
            funded: styles.milestoneFunded,
            in_progress: styles.milestoneInProgress,
            submitted: styles.milestoneSubmitted,
            completed: styles.milestoneCompleted
        };
        return colors[status] || styles.milestonePending;
    };

    if (isLoading || !currentContract) return <LoadingSpinner />;

    const isClient = user._id === currentContract.client._id;

    // Helper function to check if all milestones are paid
    const areAllMilestonesPaid = () => {
        return currentContract?.milestones?.every(milestone => milestone.status === "paid") || false;
    };

    return (
        <div className={styles.pageContainer}>
            <div className={styles.contentWrapper}>
                {/* Contract Header */}
                <div className={styles.headerCard}>
                    <div className={styles.headerContent}>
                        <div>
                            <h1 className={styles.titleSection}>{currentContract.title}</h1>
                            <div className={styles.statusWrapper}>
                                <span className={`${styles.statusBadge} ${getStatusColor(currentContract.status)}`}>
                                    {currentContract.status.charAt(0).toUpperCase() + currentContract.status.slice(1)}
                                </span>
                            </div>
                        </div>
                        <div className={styles.amountSection}>
                            <div className={styles.totalAmount}>
                                ${currentContract.totalAmount}
                            </div>
                            <div className={styles.escrowBalance}>
                                Escrow Balance: ${currentContract.escrowBalance}
                            </div>
                        </div>
                    </div>

                    <div className={styles.scopeSection}>
                        <h3 className={styles.scopeTitle}>Project Scope</h3>
                        <p className={styles.scopeText}>{currentContract.scope}</p>
                    </div>

                    {/* Complete Contract Button */}
                    {isClient && areAllMilestonesPaid() && currentContract.status !== "completed" && (
                        <div className={styles.buttonWrapper}>
                            <button
                                onClick={handleCompleteContract}
                                className={styles.primaryButton}
                            >
                                <Check className={styles.buttonIcon} />
                                Complete Contract
                            </button>
                        </div>
                    )}

                    {/* Fund Escrow Button (Client Only) */}
                    {isClient && currentContract.status === "draft" && (
                        <div className={styles.buttonWrapper}>
                            <button
                                onClick={() => setShowFundModal(true)}
                                className={styles.primaryButton}
                            >
                                <DollarSign className={styles.buttonIcon} />
                                Fund Escrow
                            </button>
                        </div>
                    )}
                </div>

                {/* Milestones */}
                <div className={styles.milestonesCard}>
                    <h2 className={styles.milestonesTitle}>Milestones</h2>
                    <div className={styles.milestonesList}>
                        {currentContract.milestones.map((milestone, index) => (
                            <div key={index} className={styles.milestoneItem}>
                                {/* Milestone Header */}
                                <div 
                                    className={styles.milestoneHeader}
                                    onClick={() => setExpandedMilestone(expandedMilestone === index ? null : index)}
                                >
                                    <div className={styles.milestoneInfo}>
                                        <div className={styles.milestoneHeaderContent}>
                                            <h3 className={styles.milestoneTitle}>
                                                {milestone.title}
                                            </h3>
                                            <span className={`${styles.milestoneBadge} ${getMilestoneStatusColor(milestone.status)}`}>
                                                {milestone.status.replace("_", " ").charAt(0).toUpperCase() + milestone.status.slice(1)}
                                            </span>
                                        </div>
                                        <div className={styles.milestoneDueDate}>
                                            Due: {new Date(milestone.dueDate).toLocaleDateString()}
                                        </div>
                                        <div className={styles.milestoneAmount}>
                                            ${milestone.amount}
                                        </div>
                                    </div>
                                    {expandedMilestone === index ? (
                                        <ChevronUp className={styles.chevronIcon} />
                                    ) : (
                                        <ChevronDown className={styles.chevronIcon} />
                                    )}
                                </div>

                                {/* Milestone Details */}
                                {expandedMilestone === index && (
                                    <div className={styles.milestoneDetails}>
                                        <p className={styles.milestoneDescription}>
                                            {milestone.description}
                                        </p>

                                        {/* Work Submission (Freelancer Only) */}
                                        {!isClient && milestone.status === "in_progress" && (
                                            <div className={styles.formGroup}>
                                                <div>
                                                    <label className={styles.label}>
                                                        Upload Files
                                                    </label>
                                                    <input
                                                        type="file"
                                                        multiple
                                                        onChange={handleFileChange}
                                                        className={styles.fileInput}
                                                    />
                                                </div>
                                                <div>
                                                    <label className={styles.label}>
                                                        Comments
                                                    </label>
                                                    <textarea
                                                        value={submissionComment}
                                                        onChange={(e) => setSubmissionComment(e.target.value)}
                                                        className={styles.textarea}
                                                        placeholder="Add any comments about your submission..."
                                                    />
                                                </div>
                                                <button
                                                    onClick={() => handleSubmitWork(milestone._id)}
                                                    className={styles.primaryButton}
                                                >
                                                    <FileUp className={styles.buttonIcon} />
                                                    Submit Work
                                                </button>
                                            </div>
                                        )}

                                        {/* Work Review (Client Only) */}
                                        {isClient && milestone.status === "submitted" && (
                                            <div className={styles.formGroup}>
                                                <div className={styles.buttonGroup}>
                                                    <button
                                                        onClick={() => handleReviewSubmission(milestone._id, "approved")}
                                                        className={styles.primaryButton}
                                                    >
                                                        <CheckCircle className={styles.buttonIcon} />
                                                        Approve
                                                    </button>
                                                    <button
                                                        onClick={() => handleReviewSubmission(milestone._id, "changes_requested")}
                                                        className={styles.warningButton}
                                                    >
                                                        <AlertCircle className={styles.buttonIcon} />
                                                        Request Changes
                                                    </button>
                                                </div>
                                            </div>
                                        )}

                                        {/* Release Payment (Client Only) */}
                                        {isClient && milestone.status === "completed" && (
                                            <button
                                                onClick={() => handleReleasePayment(milestone._id)}
                                                className={styles.primaryButton}
                                            >
                                                <DollarSign className={styles.buttonIcon} />
                                                Release Payment
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Messages */}
                <ContractMessaging />
            </div>

            {/* Fund Escrow Modal */}
            {showFundModal && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalContent}>
                        <h3 className={styles.modalTitle}>Fund Escrow</h3>
                        <div className={styles.modalForm}>
                            <label className={styles.label}>
                                Amount to Fund
                            </label>
                            <div className={styles.inputWithIcon}>
                                <DollarSign className={styles.inputIcon} />
                                <input
                                    type="number"
                                    value={fundAmount}
                                    onChange={(e) => setFundAmount(Number(e.target.value))}
                                    className={styles.iconInput}
                                />
                            </div>
                        </div>
                        <div className={styles.modalActions}>
                            <button
                                onClick={handleFundEscrow}
                                className={styles.primaryButton}
                            >
                                Fund
                            </button>
                            <button
                                onClick={() => setShowFundModal(false)}
                                className={styles.secondaryButton}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ContractDetailsPage; 