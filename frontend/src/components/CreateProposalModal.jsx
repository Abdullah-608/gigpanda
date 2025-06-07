import { useState } from "react";
import { X, DollarSign, Clock } from "lucide-react";
import { useProposalStore } from "../store/proposalStore";
import toast from "react-hot-toast";

const CreateProposalModal = ({ isOpen, onClose, job }) => {
    const { submitProposal, isLoading } = useProposalStore();
    const [formData, setFormData] = useState({
        coverLetter: "",
        bidAmount: "",
        estimatedDuration: "less-than-1-month",
        attachments: []
    });

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            await submitProposal(job._id, {
                coverLetter: formData.coverLetter,
                bidAmount: {
                    amount: parseFloat(formData.bidAmount),
                    currency: "USD"
                },
                estimatedDuration: formData.estimatedDuration,
                attachments: formData.attachments
            });
            
            onClose();
            setFormData({
                coverLetter: "",
                bidAmount: "",
                estimatedDuration: "less-than-1-month",
                attachments: []
            });
            toast.success("Proposal submitted successfully!");
        } catch (error) {
            toast.error(error.message || "Failed to submit proposal");
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-gray-900">Submit Proposal</h2>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-500"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Job Details Summary */}
                    <div className="bg-gray-50 p-4 rounded-lg mb-6">
                        <h3 className="font-semibold text-gray-900 mb-2">{job.title}</h3>
                        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                            <div className="flex items-center">
                                <DollarSign className="w-4 h-4 mr-1" />
                                <span>Budget: ${job.budget.min} - ${job.budget.max}</span>
                            </div>
                            <div className="flex items-center">
                                <Clock className="w-4 h-4 mr-1" />
                                <span>Timeline: {job.timeline}</span>
                            </div>
                        </div>
                    </div>

                    {/* Proposal Form */}
                    <form onSubmit={handleSubmit}>
                        {/* Bid Amount */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Your Bid (USD)
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <DollarSign className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="number"
                                    required
                                    min={job.budget.min}
                                    max={job.budget.max}
                                    value={formData.bidAmount}
                                    onChange={(e) => setFormData({ ...formData, bidAmount: e.target.value })}
                                    className="pl-10 block w-full rounded-lg border border-gray-300 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    placeholder="Enter your bid amount"
                                />
                            </div>
                            <p className="mt-1 text-sm text-gray-500">
                                Client's budget: ${job.budget.min} - ${job.budget.max}
                            </p>
                        </div>

                        {/* Estimated Duration */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Estimated Duration
                            </label>
                            <select
                                required
                                value={formData.estimatedDuration}
                                onChange={(e) => setFormData({ ...formData, estimatedDuration: e.target.value })}
                                className="block w-full rounded-lg border border-gray-300 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            >
                                <option value="less-than-1-month">Less than 1 month</option>
                                <option value="1-3-months">1-3 months</option>
                                <option value="3-6-months">3-6 months</option>
                                <option value="more-than-6-months">More than 6 months</option>
                            </select>
                        </div>

                        {/* Cover Letter */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Cover Letter
                            </label>
                            <textarea
                                required
                                value={formData.coverLetter}
                                onChange={(e) => setFormData({ ...formData, coverLetter: e.target.value })}
                                rows={6}
                                className="block w-full rounded-lg border border-gray-300 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                placeholder="Introduce yourself and explain why you're the best fit for this job..."
                            />
                            <p className="mt-1 text-sm text-gray-500">
                                Write a compelling cover letter that highlights your relevant skills and experience.
                            </p>
                        </div>

                        {/* Submit Button */}
                        <div className="flex justify-end gap-4">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? "Submitting..." : "Submit Proposal"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CreateProposalModal; 