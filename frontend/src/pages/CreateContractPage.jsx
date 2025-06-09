import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useProposalStore } from "../store/proposalStore";
import { useContractStore } from "../store/contractStore";
import { DollarSign, Plus, Trash2, Loader } from "lucide-react";
import LoadingSpinner from "../components/LoadingSpinner";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import styles from "./CreateContractPage.module.css";

const CreateContractPage = () => {
    const { proposalId } = useParams();
    const navigate = useNavigate();
    const { getProposalById, currentProposal } = useProposalStore();
    const { createContract, isLoading } = useContractStore();

    const [formData, setFormData] = useState({
        title: "",
        scope: "",
        totalAmount: 0,
        terms: "",
        milestones: [
            {
                title: "Initial Payment",
                description: "Project kickoff and initial requirements",
                amount: 0,
                dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
            }
        ]
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const loadProposal = async () => {
            try {
                await getProposalById(proposalId);
            } catch (error) {
                console.error("Error loading proposal:", error);
                toast.error("Failed to load proposal details");
                navigate("/dashboard");
            }
        };
        loadProposal();
    }, [proposalId, getProposalById, navigate]);

    useEffect(() => {
        if (currentProposal?.job?.title && currentProposal?.bidAmount?.amount) {
            setFormData(prev => ({
                ...prev,
                title: currentProposal.job.title || "",
                totalAmount: currentProposal.bidAmount.amount || 0,
                milestones: [
                    {
                        title: "Initial Payment",
                        description: "Project kickoff and initial requirements",
                        amount: (currentProposal.bidAmount.amount * 0.25) || 0,
                        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
                    }
                ]
            }));
        }
    }, [currentProposal]);

    const addMilestone = () => {
        setFormData(prev => ({
            ...prev,
            milestones: [
                ...prev.milestones,
                {
                    title: "",
                    description: "",
                    amount: 0,
                    dueDate: ""
                }
            ]
        }));
    };

    const removeMilestone = (index) => {
        setFormData(prev => ({
            ...prev,
            milestones: prev.milestones.filter((_, i) => i !== index)
        }));
    };

    const updateMilestone = (index, field, value) => {
        setFormData(prev => ({
            ...prev,
            milestones: prev.milestones.map((milestone, i) =>
                i === index ? { ...milestone, [field]: value } : milestone
            )
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        if (!formData.title.trim()) {
            toast.error("Contract title is required");
            return;
        }

        if (!formData.scope.trim()) {
            toast.error("Project scope is required");
            return;
        }

        if (!formData.terms.trim()) {
            toast.error("Contract terms are required");
            return;
        }

        // Validate all milestones
        for (const milestone of formData.milestones) {
            if (!milestone.title.trim()) {
                toast.error("All milestones must have a title");
                return;
            }
            if (!milestone.description.trim()) {
                toast.error("All milestones must have a description");
                return;
            }
            if (!milestone.amount || milestone.amount <= 0) {
                toast.error("All milestones must have a valid amount");
                return;
            }
            if (!milestone.dueDate) {
                toast.error("All milestones must have a due date");
                return;
            }
        }

        const totalMilestoneAmount = formData.milestones.reduce((sum, m) => sum + Number(m.amount), 0);
        if (Math.abs(totalMilestoneAmount - Number(formData.totalAmount)) > 0.01) {
            toast.error("Total milestone amounts must equal the contract total");
            return;
        }

        // Format the data
        const contractData = {
            ...formData,
            totalAmount: Number(formData.totalAmount),
            milestones: formData.milestones.map(milestone => ({
                ...milestone,
                amount: Number(milestone.amount),
                dueDate: new Date(milestone.dueDate).toISOString()
            }))
        };

        setIsSubmitting(true);
        try {
            await createContract(proposalId, contractData);
            toast.success("Contract created successfully!");
            navigate('/client-dashboard', { state: { activeTab: 'myjobs' } });
        } catch (error) {
            toast.error(error.response?.data?.message || "Error creating contract. Please try again.");
            console.error("Contract creation error:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading || !currentProposal) return <LoadingSpinner />;

    return (
        <div className={styles.pageContainer}>
            <div className={styles.contentWrapper}>
                <motion.h1 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={styles.pageTitle}
                >
                    Create Contract
                </motion.h1>

                <form onSubmit={handleSubmit} className={styles.form}>
                    {/* Contract Details */}
                    <div className={styles.section}>
                        <h2 className={styles.sectionTitle}>Contract Details</h2>
                        
                        <div className={styles.inputGroup}>
                            <div>
                                <label className={styles.label}>
                                    Contract Title
                                </label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                    className={styles.input}
                                    placeholder="e.g., Website Development Project"
                                />
                            </div>

                            <div>
                                <label className={styles.label}>
                                    Project Scope
                                </label>
                                <textarea
                                    value={formData.scope}
                                    onChange={(e) => setFormData(prev => ({ ...prev, scope: e.target.value }))}
                                    className={styles.textarea}
                                    placeholder="Describe the project deliverables and scope..."
                                />
                            </div>

                            <div>
                                <label className={styles.label}>
                                    Contract Terms
                                </label>
                                <textarea
                                    value={formData.terms}
                                    onChange={(e) => setFormData(prev => ({ ...prev, terms: e.target.value }))}
                                    className={styles.textarea}
                                    placeholder="Specify any additional terms and conditions..."
                                />
                            </div>

                            <div>
                                <label className={styles.label}>
                                    Total Amount
                                </label>
                                <div className={styles.inputWithIcon}>
                                    <DollarSign className={styles.inputIcon} />
                                    <input
                                        type="number"
                                        value={formData.totalAmount}
                                        onChange={(e) => setFormData(prev => ({ ...prev, totalAmount: Number(e.target.value) }))}
                                        className={styles.iconInput}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Milestones */}
                    <div className={styles.section}>
                        <div className={styles.milestonesHeader}>
                            <h2 className={styles.sectionTitle}>Milestones</h2>
                            <button
                                type="button"
                                onClick={addMilestone}
                                className={styles.addMilestoneButton}
                            >
                                <Plus className={styles.addMilestoneIcon} />
                                Add Milestone
                            </button>
                        </div>

                        <div className={styles.milestonesList}>
                            {formData.milestones.map((milestone, index) => (
                                <div key={index} className={styles.milestoneCard}>
                                    <div className={styles.milestoneHeader}>
                                        <h3 className={styles.milestoneTitle}>Milestone {index + 1}</h3>
                                        {index > 0 && (
                                            <button
                                                type="button"
                                                onClick={() => removeMilestone(index)}
                                                className={styles.deleteButton}
                                            >
                                                <Trash2 className={styles.deleteIcon} />
                                            </button>
                                        )}
                                    </div>

                                    <div className={styles.milestoneGrid}>
                                        <div>
                                            <label className={styles.label}>
                                                Title
                                            </label>
                                            <input
                                                type="text"
                                                value={milestone.title}
                                                onChange={(e) => updateMilestone(index, "title", e.target.value)}
                                                className={styles.input}
                                                placeholder="e.g., Initial Design"
                                            />
                                        </div>

                                        <div>
                                            <label className={styles.label}>
                                                Amount
                                            </label>
                                            <div className={styles.inputWithIcon}>
                                                <DollarSign className={styles.inputIcon} />
                                                <input
                                                    type="number"
                                                    value={milestone.amount}
                                                    onChange={(e) => updateMilestone(index, "amount", Number(e.target.value))}
                                                    className={styles.iconInput}
                                                />
                                            </div>
                                        </div>

                                        <div className={styles.milestoneDescription}>
                                            <label className={styles.label}>
                                                Description
                                            </label>
                                            <textarea
                                                value={milestone.description}
                                                onChange={(e) => updateMilestone(index, "description", e.target.value)}
                                                className={styles.milestoneTextarea}
                                                placeholder="Describe the deliverables for this milestone..."
                                            />
                                        </div>

                                        <div>
                                            <label className={styles.label}>
                                                Due Date
                                            </label>
                                            <input
                                                type="date"
                                                value={milestone.dueDate}
                                                onChange={(e) => updateMilestone(index, "dueDate", e.target.value)}
                                                className={styles.input}
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className={styles.submitWrapper}>
                        <motion.button
                            type="submit"
                            disabled={isSubmitting}
                            className={styles.submitButton}
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader className={styles.loadingIcon} />
                                    <span>Creating...</span>
                                </>
                            ) : (
                                <span>Create Contract</span>
                            )}
                        </motion.button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateContractPage; 