import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useProposalStore } from "../store/proposalStore";
import { useContractStore } from "../store/contractStore";
import { DollarSign, Plus, Trash2 } from "lucide-react";
import LoadingSpinner from "../components/LoadingSpinner";
import toast from "react-hot-toast";

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

        const totalMilestoneAmount = formData.milestones.reduce((sum, m) => sum + Number(m.amount), 0);
        if (totalMilestoneAmount !== Number(formData.totalAmount)) {
            toast.error("Total milestone amounts must equal the contract total");
            return;
        }

        try {
            const contract = await createContract(proposalId, formData);
            toast.success("Contract created successfully!");
            navigate(`/contracts/${contract._id}`);
        } catch (error) {
            toast.error(error.message || "Error creating contract");
        }
    };

    if (isLoading || !currentProposal) return <LoadingSpinner />;

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">Create Contract</h1>

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Contract Details */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h2 className="text-xl font-semibold mb-4">Contract Details</h2>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Contract Title
                                </label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    placeholder="e.g., Website Development Project"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Project Scope
                                </label>
                                <textarea
                                    value={formData.scope}
                                    onChange={(e) => setFormData(prev => ({ ...prev, scope: e.target.value }))}
                                    className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                                    placeholder="Describe the project deliverables and scope..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Contract Terms
                                </label>
                                <textarea
                                    value={formData.terms}
                                    onChange={(e) => setFormData(prev => ({ ...prev, terms: e.target.value }))}
                                    className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                                    placeholder="Specify any additional terms and conditions..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Total Amount
                                </label>
                                <div className="relative">
                                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                                    <input
                                        type="number"
                                        value={formData.totalAmount}
                                        onChange={(e) => setFormData(prev => ({ ...prev, totalAmount: Number(e.target.value) }))}
                                        className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Milestones */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-semibold">Milestones</h2>
                            <button
                                type="button"
                                onClick={addMilestone}
                                className="flex items-center text-green-600 hover:text-green-700"
                            >
                                <Plus className="w-4 h-4 mr-1" />
                                Add Milestone
                            </button>
                        </div>

                        <div className="space-y-6">
                            {formData.milestones.map((milestone, index) => (
                                <div key={index} className="p-4 bg-gray-50 rounded-lg">
                                    <div className="flex justify-between items-start mb-4">
                                        <h3 className="font-medium">Milestone {index + 1}</h3>
                                        {index > 0 && (
                                            <button
                                                type="button"
                                                onClick={() => removeMilestone(index)}
                                                className="text-red-600 hover:text-red-700"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Title
                                            </label>
                                            <input
                                                type="text"
                                                value={milestone.title}
                                                onChange={(e) => updateMilestone(index, "title", e.target.value)}
                                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                                placeholder="e.g., Initial Design"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Amount
                                            </label>
                                            <div className="relative">
                                                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                                                <input
                                                    type="number"
                                                    value={milestone.amount}
                                                    onChange={(e) => updateMilestone(index, "amount", Number(e.target.value))}
                                                    className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                                />
                                            </div>
                                        </div>

                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Description
                                            </label>
                                            <textarea
                                                value={milestone.description}
                                                onChange={(e) => updateMilestone(index, "description", e.target.value)}
                                                className="w-full h-24 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                                                placeholder="Describe the deliverables for this milestone..."
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Due Date
                                            </label>
                                            <input
                                                type="date"
                                                value={milestone.dueDate}
                                                onChange={(e) => updateMilestone(index, "dueDate", e.target.value)}
                                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-end">
                        <button
                            type="submit"
                            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
                        >
                            Create Contract
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateContractPage; 