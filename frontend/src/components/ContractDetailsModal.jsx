import { X, DollarSign, Check, MessageCircle, AlertCircle } from "lucide-react";
import { useAuthStore } from "../store/authStore";
import { useContractStore } from "../store/contractStore";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const ContractDetailsModal = ({ isOpen, onClose, contract }) => {
    const { user, setActiveTab } = useAuthStore();
    const { releasePayment, completeContract } = useContractStore();
    const navigate = useNavigate();
    const isClient = user._id === contract?.client._id;

    const handleReleasePayment = async (milestoneId, amount) => {
        // Check if escrow balance is sufficient
        const escrowBalance = contract.escrowBalance || 0;
        if (escrowBalance < amount) {
            toast.error(`Insufficient escrow balance. Please add funds to release payment. Required: $${amount}, Available: $${escrowBalance}`);
            return;
        }

        try {
            await releasePayment(contract._id, milestoneId);
            toast.success("Payment released successfully!");
        } catch (error) {
            toast.error("Error releasing payment");
        }
    };

    const handleCompleteContract = async () => {
        try {
            await completeContract(contract._id);
            toast.success("Contract marked as completed!");
            onClose();
        } catch (error) {
            toast.error("Error completing contract");
        }
    };

    const handleMessage = async () => {
        try {
            const receiverId = isClient ? contract.freelancer._id : contract.client._id;
            setActiveTab("messages");
            navigate(isClient ? "/client-dashboard" : "/freelancer-dashboard", {
                state: { 
                    receiverId,
                    contractId: contract._id,
                    shouldInitChat: true
                }
            });
            onClose();
        } catch (err) {
            toast.error("Failed to open messages. Please try again.");
            console.error("Error opening messages:", err);
        }
    };

    if (!isOpen || !contract) return null;

    const areAllMilestonesPaid = () => {
        return contract.milestones.every(milestone => milestone.status === "paid");
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-gray-900">Contract Details</h2>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-500"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Contract Overview */}
                    <div className="mb-6">
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">{contract.title}</h3>
                        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                            <div className="flex items-center">
                                <DollarSign className="w-4 h-4 mr-2" />
                                <span>Total Amount: ${contract.totalAmount}</span>
                            </div>
                            {isClient && (
                                <div className="flex items-center">
                                    <AlertCircle className="w-4 h-4 mr-2" />
                                    <span>Escrow Balance: ${contract.escrowBalance || 0}</span>
                                </div>
                            )}
                            <div>
                                Status: <span className="font-medium">{contract.status}</span>
                            </div>
                        </div>
                        
                        {/* Message Button */}
                        <button
                            onClick={handleMessage}
                            className="mt-4 w-full border-2 border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center"
                        >
                            <MessageCircle className="w-4 h-4 mr-2" />
                            Message {!isClient ? "Client" : "Freelancer"}
                        </button>

                        {/* Complete Contract Button (for client only) */}
                        {isClient && areAllMilestonesPaid() && contract.status !== "completed" && (
                            <button
                                onClick={handleCompleteContract}
                                className="mt-4 w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center"
                            >
                                <Check className="w-4 h-4 mr-2" />
                                Complete Contract
                            </button>
                        )}
                    </div>

                    {/* Contract Description */}
                    <div className="mb-8">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Description</h3>
                        <p className="text-gray-600">{contract.description || contract.scope}</p>
                    </div>

                    {/* Milestones */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Milestones</h3>
                        <div className="space-y-4">
                            {contract.milestones.map((milestone, index) => (
                                <div key={index} className="border border-gray-200 rounded-lg p-4">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <h4 className="font-medium text-gray-900">
                                                Milestone {index + 1}: {milestone.title}
                                            </h4>
                                            <p className="text-sm text-gray-600 mt-1">{milestone.description}</p>
                                            <p className="text-sm text-gray-600 mt-1">Due: {new Date(milestone.dueDate).toLocaleDateString()}</p>
                                            <p className="text-sm font-medium text-green-600 mt-1">${milestone.amount}</p>
                                        </div>
                                        <div>
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                milestone.status === "completed" ? "bg-green-100 text-green-800" :
                                                milestone.status === "in_progress" ? "bg-yellow-100 text-yellow-800" :
                                                milestone.status === "paid" ? "bg-purple-100 text-purple-800" :
                                                "bg-gray-100 text-gray-800"
                                            }`}>
                                                {milestone.status.replace("_", " ").charAt(0).toUpperCase() + milestone.status.slice(1)}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Release Payment Button */}
                                    {isClient && milestone.status === "completed" && (
                                        <button
                                            onClick={() => handleReleasePayment(milestone._id, milestone.amount)}
                                            className="mt-4 w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center"
                                        >
                                            <DollarSign className="w-4 h-4 mr-2" />
                                            Release Payment
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Modal Footer */}
                <div className="flex justify-end p-6 border-t border-gray-200">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ContractDetailsModal; 