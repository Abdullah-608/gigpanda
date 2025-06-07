import { X, DollarSign } from "lucide-react";
import { format } from 'date-fns';
import { useAuthStore } from "../store/authStore";
import { useContractStore } from "../store/contractStore";
import toast from "react-hot-toast";

const ContractDetailsModal = ({ isOpen, onClose, contract }) => {
    const { user } = useAuthStore();
    const { releasePayment } = useContractStore();
    const isClient = user._id === contract?.client._id;

    const handleReleasePayment = async (milestoneId) => {
        try {
            await releasePayment(contract._id, milestoneId);
            toast.success("Payment released successfully!");
        } catch (error) {
            toast.error("Error releasing payment");
        }
    };

    if (!isOpen || !contract) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                {/* Modal Header */}
                <div className="flex justify-between items-center p-6 border-b border-gray-200">
                    <h2 className="text-2xl font-bold text-gray-900">{contract.title}</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-500 transition-colors"
                    >
                        <X className="h-6 w-6" />
                    </button>
                </div>

                {/* Modal Content */}
                <div className="p-6">
                    {/* Contract Overview */}
                    <div className="mb-8">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Contract Overview</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-gray-500">Status</p>
                                <p className="text-base font-medium text-gray-900">{contract.status}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Total Amount</p>
                                <p className="text-base font-medium text-green-600">${contract.totalAmount}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Escrow Balance</p>
                                <p className="text-base font-medium text-blue-600">${contract.escrowBalance}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Created On</p>
                                <p className="text-base font-medium text-gray-900">
                                    {format(new Date(contract.createdAt), 'MMM dd, yyyy')}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Client</p>
                                <p className="text-base font-medium text-gray-900">{contract.client?.name}</p>
                            </div>
                        </div>
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
                                            onClick={() => handleReleasePayment(milestone._id)}
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