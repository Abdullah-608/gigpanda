import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useContractStore } from "../store/contractStore";
import { useAuthStore } from "../store/authStore";
import { DollarSign, CheckCircle, FileUp, AlertCircle, ChevronDown, ChevronUp } from "lucide-react";
import LoadingSpinner from "../components/LoadingSpinner";
import ContractMessaging from "../components/ContractMessaging";
import { websocketService } from "../services/websocket";
import toast from "react-hot-toast";

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

        // Set up polling for contract updates
        const pollInterval = setInterval(loadContract, 5000); // Poll every 5 seconds

        return () => {
            clearInterval(pollInterval);
        };
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
            
            // Notify through WebSocket
            websocketService.send(
                status === "approved" ? "milestone_approved" : "milestone_changes_requested",
                {
                    contractId,
                    milestoneId
                }
            );
        } catch (error) {
            toast.error("Error reviewing submission");
        }
    };

    const handleReleasePayment = async (milestoneId) => {
        try {
            await releasePayment(contractId, milestoneId);
            
            // Notify through WebSocket
            websocketService.send("payment_released", {
                contractId,
                milestoneId
            });
        } catch (error) {
            toast.error("Error releasing payment");
        }
    };

    const handleFundEscrow = async () => {
        try {
            await fundEscrow(contractId, fundAmount);
            
            // Notify through WebSocket
            websocketService.send("escrow_funded", {
                contractId,
                amount: fundAmount
            });

            setShowFundModal(false);
            setFundAmount(0);
        } catch (error) {
            toast.error("Error funding escrow");
        }
    };

    const getStatusColor = (status) => {
        const colors = {
            draft: "bg-gray-100 text-gray-800",
            funded: "bg-blue-100 text-blue-800",
            active: "bg-green-100 text-green-800",
            completed: "bg-purple-100 text-purple-800",
            closed: "bg-gray-100 text-gray-800",
            cancelled: "bg-red-100 text-red-800"
        };
        return colors[status] || "bg-gray-100 text-gray-800";
    };

    const getMilestoneStatusColor = (status) => {
        const colors = {
            pending: "bg-gray-100 text-gray-800",
            funded: "bg-blue-100 text-blue-800",
            in_progress: "bg-yellow-100 text-yellow-800",
            submitted: "bg-purple-100 text-purple-800",
            completed: "bg-green-100 text-green-800"
        };
        return colors[status] || "bg-gray-100 text-gray-800";
    };

    if (isLoading || !currentContract) return <LoadingSpinner />;

    const isClient = user._id === currentContract.client._id;

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-4xl mx-auto space-y-8">
                {/* Contract Header */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">{currentContract.title}</h1>
                            <div className="mt-2">
                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(currentContract.status)}`}>
                                    {currentContract.status.charAt(0).toUpperCase() + currentContract.status.slice(1)}
                                </span>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-2xl font-bold text-gray-900">
                                ${currentContract.totalAmount}
                            </div>
                            <div className="text-sm text-gray-600">
                                Escrow Balance: ${currentContract.escrowBalance}
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-gray-200 pt-4 mt-4">
                        <h3 className="text-lg font-semibold mb-2">Project Scope</h3>
                        <p className="text-gray-700 whitespace-pre-wrap">{currentContract.scope}</p>
                    </div>

                    {/* Fund Escrow Button (Client Only) */}
                    {isClient && currentContract.status === "draft" && (
                        <div className="mt-6">
                            <button
                                onClick={() => setShowFundModal(true)}
                                className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center"
                            >
                                <DollarSign className="w-4 h-4 mr-2" />
                                Fund Escrow
                            </button>
                        </div>
                    )}
                </div>

                {/* Milestones */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-xl font-semibold mb-6">Milestones</h2>
                    <div className="space-y-4">
                        {currentContract.milestones.map((milestone, index) => (
                            <div key={index} className="border border-gray-200 rounded-lg">
                                {/* Milestone Header */}
                                <div 
                                    className="p-4 cursor-pointer hover:bg-gray-50 flex items-center justify-between"
                                    onClick={() => setExpandedMilestone(expandedMilestone === index ? null : index)}
                                >
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between">
                                            <h3 className="font-medium text-gray-900">
                                                {milestone.title}
                                            </h3>
                                            <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getMilestoneStatusColor(milestone.status)}`}>
                                                {milestone.status.replace("_", " ").charAt(0).toUpperCase() + milestone.status.slice(1)}
                                            </span>
                                        </div>
                                        <div className="mt-1 text-sm text-gray-600">
                                            Due: {new Date(milestone.dueDate).toLocaleDateString()}
                                        </div>
                                        <div className="mt-1 text-sm font-medium text-gray-900">
                                            ${milestone.amount}
                                        </div>
                                    </div>
                                    {expandedMilestone === index ? (
                                        <ChevronUp className="w-5 h-5 text-gray-500" />
                                    ) : (
                                        <ChevronDown className="w-5 h-5 text-gray-500" />
                                    )}
                                </div>

                                {/* Milestone Details */}
                                {expandedMilestone === index && (
                                    <div className="border-t border-gray-200 p-4">
                                        <p className="text-gray-700 mb-4">
                                            {milestone.description}
                                        </p>

                                        {/* Work Submission (Freelancer Only) */}
                                        {!isClient && milestone.status === "in_progress" && (
                                            <div className="space-y-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Upload Files
                                                    </label>
                                                    <input
                                                        type="file"
                                                        multiple
                                                        onChange={handleFileChange}
                                                        className="w-full"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Comments
                                                    </label>
                                                    <textarea
                                                        value={submissionComment}
                                                        onChange={(e) => setSubmissionComment(e.target.value)}
                                                        className="w-full h-24 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                                                        placeholder="Add any comments about your submission..."
                                                    />
                                                </div>
                                                <button
                                                    onClick={() => handleSubmitWork(milestone._id)}
                                                    className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center"
                                                >
                                                    <FileUp className="w-4 h-4 mr-2" />
                                                    Submit Work
                                                </button>
                                            </div>
                                        )}

                                        {/* Work Review (Client Only) */}
                                        {isClient && milestone.status === "submitted" && (
                                            <div className="space-y-4">
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleReviewSubmission(milestone._id, "approved")}
                                                        className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center"
                                                    >
                                                        <CheckCircle className="w-4 h-4 mr-2" />
                                                        Approve
                                                    </button>
                                                    <button
                                                        onClick={() => handleReviewSubmission(milestone._id, "changes_requested")}
                                                        className="flex-1 bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors flex items-center justify-center"
                                                    >
                                                        <AlertCircle className="w-4 h-4 mr-2" />
                                                        Request Changes
                                                    </button>
                                                </div>
                                            </div>
                                        )}

                                        {/* Release Payment (Client Only) */}
                                        {isClient && milestone.status === "completed" && !milestone.paymentReleased && (
                                            <button
                                                onClick={() => handleReleasePayment(milestone._id)}
                                                className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center"
                                            >
                                                <DollarSign className="w-4 h-4 mr-2" />
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
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full">
                        <h3 className="text-lg font-semibold mb-4">Fund Escrow</h3>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Amount to Fund
                            </label>
                            <div className="relative">
                                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                                <input
                                    type="number"
                                    value={fundAmount}
                                    onChange={(e) => setFundAmount(Number(e.target.value))}
                                    className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                />
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <button
                                onClick={handleFundEscrow}
                                className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                            >
                                Fund
                            </button>
                            <button
                                onClick={() => setShowFundModal(false)}
                                className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
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