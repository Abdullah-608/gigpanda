import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useProposalStore } from "../store/proposalStore";
import { useJobStore } from "../store/jobStore";
import { Clock, DollarSign, Calendar, Star, MessageCircle, ThumbsUp, ThumbsDown, PhoneCall, Trash2 } from "lucide-react";
import LoadingSpinner from "../components/LoadingSpinner";
import { useAuthStore } from "../store/authStore";
import { toast } from "react-hot-toast";

const IncomingProposalsPage = () => {
    const { jobId } = useParams();
    const navigate = useNavigate();
    const [selectedProposal, setSelectedProposal] = useState(null);
    const { setActiveTab } = useAuthStore();
    
    const { 
        incomingProposals, 
        getJobProposals, 
        updateProposalStatus,
        deleteProposal,
        isLoading 
    } = useProposalStore();
    
    const { fetchJobById, currentJob } = useJobStore();

    useEffect(() => {
        const loadData = async () => {
            await Promise.all([
                getJobProposals(jobId),
                fetchJobById(jobId)
            ]);
        };
        loadData();
    }, [jobId, getJobProposals, fetchJobById]);

    const handleProposalAction = async (proposalId, status) => {
        try {
            const updatedProposal = await updateProposalStatus(proposalId, status);
            if (status === "accepted") {
                navigate(`/contracts/create/${updatedProposal._id}`);
            }
        } catch (error) {
            console.error("Error updating proposal:", error);
        }
    };

    const handleDeleteProposal = async (proposalId) => {
        if (window.confirm('Are you sure you want to delete this proposal? This action cannot be undone.')) {
            try {
                await deleteProposal(proposalId);
                setSelectedProposal(null);
            } catch (error) {
                toast.error(error.message || 'Failed to delete proposal');
            }
        }
    };

    if (isLoading) return <LoadingSpinner />;

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Job Details Header */}
            {currentJob && (
                <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">{currentJob.title}</h1>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                        <div className="flex items-center">
                            <DollarSign className="w-4 h-4 mr-2" />
                            <span>Budget: ${currentJob.budget.min} - ${currentJob.budget.max}</span>
                        </div>
                        <div className="flex items-center">
                            <Clock className="w-4 h-4 mr-2" />
                            <span>Duration: {currentJob.timeline}</span>
                        </div>
                        <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-2" />
                            <span>Posted: {new Date(currentJob.createdAt).toLocaleDateString()}</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Proposals Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Proposals List */}
                <div className="md:col-span-1 bg-white rounded-lg shadow-md p-4">
                    <h2 className="text-xl font-semibold mb-4">Proposals ({incomingProposals.length})</h2>
                    <div className="space-y-4">
                        {incomingProposals.map((proposal) => (
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
                                            {proposal.freelancer.name}
                                        </h3>
                                        <div className="flex items-center text-sm text-gray-600 mt-1">
                                            <Star className="w-4 h-4 text-yellow-400 mr-1" />
                                            <span>4.8 (120 reviews)</span>
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
                            {/* Freelancer Header */}
                            <div className="flex items-start justify-between mb-6">
                                <div className="flex items-center">
                                    {selectedProposal.freelancer.profile?.pictureUrl ? (
                                        <img
                                            src={selectedProposal.freelancer.profile.pictureUrl}
                                            alt={selectedProposal.freelancer.name}
                                            className="w-16 h-16 rounded-full mr-4 object-cover"
                                        />
                                    ) : (
                                        <div className="w-16 h-16 rounded-full mr-4 bg-gray-200 flex items-center justify-center text-gray-500 text-xl font-semibold">
                                            {selectedProposal.freelancer.name.charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-900">
                                            {selectedProposal.freelancer.name}
                                        </h2>
                                        <p className="text-gray-600">
                                            {selectedProposal.freelancer.profile?.title || "Freelancer"}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-2xl font-bold text-gray-900">
                                        ${selectedProposal.bidAmount.amount}
                                    </div>
                                    <div className="text-gray-600">
                                        {selectedProposal.estimatedDuration}
                                    </div>
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

                            {/* Action Buttons */}
                            {selectedProposal.status === "pending" && (
                                <div className="flex gap-4">
                                    <button
                                        onClick={() => handleProposalAction(selectedProposal._id, "accepted")}
                                        className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center"
                                    >
                                        <ThumbsUp className="w-4 h-4 mr-2" />
                                        Accept Proposal
                                    </button>
                                    <button
                                        onClick={() => handleProposalAction(selectedProposal._id, "interviewing")}
                                        className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
                                    >
                                        <PhoneCall className="w-4 h-4 mr-2" />
                                        Request Interview
                                    </button>
                                    <button
                                        onClick={() => handleProposalAction(selectedProposal._id, "declined")}
                                        className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center"
                                    >
                                        <ThumbsDown className="w-4 h-4 mr-2" />
                                        Decline
                                    </button>
                                </div>
                            )}

                            {/* Delete Button */}
                            <button
                                onClick={() => handleDeleteProposal(selectedProposal._id)}
                                className="mt-4 w-full border-2 border-red-300 text-red-600 px-4 py-2 rounded-lg hover:bg-red-50 transition-colors flex items-center justify-center"
                            >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete Proposal
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
                                className="mt-4 w-full border-2 border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center"
                            >
                                <MessageCircle className="w-4 h-4 mr-2" />
                                Send Message
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

export default IncomingProposalsPage; 