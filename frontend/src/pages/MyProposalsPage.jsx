import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useProposalStore } from "../store/proposalStore";
import { Clock, DollarSign, Calendar, MessageCircle, AlertCircle } from "lucide-react";
import LoadingSpinner from "../components/LoadingSpinner";
import toast from "react-hot-toast";
import { useAuthStore } from "../store/authStore";

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

    if (isLoading) return <LoadingSpinner />;

    if (error) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="bg-red-50 p-4 rounded-lg flex items-center justify-center text-red-700">
                    <AlertCircle className="w-5 h-5 mr-2" />
                    <span>{error}</span>
                </div>
            </div>
        );
    }

    if (!proposals.length) {
        return (
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-2xl font-bold text-gray-900 mb-8">My Proposals</h1>
                <div className="bg-white rounded-lg shadow-md p-8 text-center">
                    <h2 className="text-xl text-gray-600 mb-4">No proposals yet</h2>
                    <p className="text-gray-500 mb-6">You haven't submitted any proposals yet. Browse jobs and start applying!</p>
                    <button
                        onClick={() => navigate("/freelancer-dashboard")}
                        className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
                    >
                        Browse Jobs
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-8">My Proposals</h1>

            {/* Proposals Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Proposals List */}
                <div className="md:col-span-1 bg-white rounded-lg shadow-md p-4">
                    <h2 className="text-xl font-semibold mb-4">All Proposals ({proposals.length})</h2>
                    <div className="space-y-4">
                        {proposals.map((proposal) => (
                            <div
                                key={proposal._id}
                                className={`cursor-pointer p-4 rounded-lg transition-colors ${
                                    selectedProposal?._id === proposal._id
                                        ? "bg-green-50 border-2 border-green-500"
                                        : "bg-gray-50 hover:bg-gray-100"
                                }`}
                                onClick={() => setSelectedProposal(proposal)}
                            >
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h3 className="font-medium text-gray-900">
                                            {proposal.job.title}
                                        </h3>
                                        <div className="flex items-center text-sm text-gray-600 mt-1">
                                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                                proposal.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                proposal.status === 'accepted' ? 'bg-green-100 text-green-800' :
                                                proposal.status === 'declined' ? 'bg-red-100 text-red-800' :
                                                'bg-blue-100 text-blue-800'
                                            }`}>
                                                {proposal.status.charAt(0).toUpperCase() + proposal.status.slice(1)}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-medium text-gray-900">
                                            ${proposal.bidAmount.amount}
                                        </div>
                                        <div className="text-sm text-gray-600">
                                            {proposal.estimatedDuration}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Proposal Details */}
                <div className="md:col-span-2">
                    {selectedProposal ? (
                        <div className="bg-white rounded-lg shadow-md p-6">
                            {/* Job Details Header */}
                            <div className="mb-6">
                                <h2 className="text-xl font-bold text-gray-900 mb-2">
                                    {selectedProposal.job.title}
                                </h2>
                                <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                                    <div className="flex items-center">
                                        <DollarSign className="w-4 h-4 mr-2" />
                                        <span>Your Bid: ${selectedProposal.bidAmount.amount}</span>
                                    </div>
                                    <div className="flex items-center">
                                        <Clock className="w-4 h-4 mr-2" />
                                        <span>Duration: {selectedProposal.estimatedDuration}</span>
                                    </div>
                                    <div className="flex items-center">
                                        <Calendar className="w-4 h-4 mr-2" />
                                        <span>Submitted: {new Date(selectedProposal.createdAt).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Status */}
                            <div className="mb-6">
                                <h3 className="text-lg font-semibold mb-2">Status</h3>
                                <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                                    selectedProposal.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                    selectedProposal.status === 'accepted' ? 'bg-green-100 text-green-800' :
                                    selectedProposal.status === 'declined' ? 'bg-red-100 text-red-800' :
                                    'bg-blue-100 text-blue-800'
                                }`}>
                                    {selectedProposal.status.charAt(0).toUpperCase() + selectedProposal.status.slice(1)}
                                </div>
                            </div>

                            {/* Cover Letter */}
                            <div className="mb-6">
                                <h3 className="text-lg font-semibold mb-2">Cover Letter</h3>
                                <p className="text-gray-700 whitespace-pre-wrap">
                                    {selectedProposal.coverLetter}
                                </p>
                            </div>

                            {/* Attachments */}
                            {selectedProposal.attachments?.length > 0 && (
                                <div className="mb-6">
                                    <h3 className="text-lg font-semibold mb-2">Attachments</h3>
                                    <div className="space-y-2">
                                        {selectedProposal.attachments.map((attachment, index) => (
                                            <div
                                                key={index}
                                                className="flex items-center p-2 bg-gray-50 rounded"
                                            >
                                                <span className="text-gray-700">
                                                    {attachment.filename}
                                                </span>
                                                <a
                                                    href={attachment.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="ml-auto text-green-600 hover:text-green-700"
                                                >
                                                    Download
                                                </a>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Client Notes */}
                            {selectedProposal.clientNotes && (
                                <div className="mb-6">
                                    <h3 className="text-lg font-semibold mb-2">Client Notes</h3>
                                    <p className="text-gray-700 whitespace-pre-wrap">
                                        {selectedProposal.clientNotes}
                                    </p>
                                </div>
                            )}

                            {/* Message Button */}
                            <button
                                onClick={async () => {
                                    if (selectedProposal?.job?.client) {
                                        try {
                                            // First set the active tab
                                            setActiveTab("messages");
                                            
                                            // Then navigate with the state
                                            navigate("/freelancer-dashboard", {
                                                state: { 
                                                    receiverId: selectedProposal.job.client._id,
                                                    proposalId: selectedProposal._id,
                                                    jobId: selectedProposal.job._id,
                                                    shouldInitChat: true
                                                }
                                            });
                                        } catch (err) {
                                            toast.error("Failed to switch to messages. Please try again.");
                                            console.error("Error switching to messages:", err);
                                        }
                                    }
                                }}
                                className="w-full border-2 border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center"
                            >
                                <MessageCircle className="w-4 h-4 mr-2" />
                                Message Client
                            </button>
                        </div>
                    ) : (
                        <div className="bg-white rounded-lg shadow-md p-6 flex items-center justify-center text-gray-500">
                            Select a proposal to view details
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MyProposalsPage; 