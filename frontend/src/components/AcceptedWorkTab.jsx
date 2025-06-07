import { useState, useEffect } from 'react';
import { useContractStore } from '../store/contractStore';
import { Upload, FileText, ChevronDown, ChevronUp, Eye } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import ContractDetailsModal from './ContractDetailsModal';

const AcceptedWorkTab = () => {
    const { contracts, getMyContracts, submitWork } = useContractStore();
    const [expandedContract, setExpandedContract] = useState(null);
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [submissionComment, setSubmissionComment] = useState('');
    const [activeMilestone, setActiveMilestone] = useState(null);
    const [selectedContract, setSelectedContract] = useState(null);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

    useEffect(() => {
        getMyContracts();
    }, [getMyContracts]);

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        setSelectedFiles(files);
    };

    const handleSubmit = async (contractId, milestoneId) => {
        if (!submissionComment.trim()) {
            toast.error('Please add a comment describing your work');
            return;
        }

        if (selectedFiles.length === 0) {
            toast.error('Please attach at least one file');
            return;
        }

        try {
            const formData = new FormData();
            
            // Add files to form data
            selectedFiles.forEach(file => {
                formData.append('files', file);
            });
            
            // Add comment to form data
            formData.append('comments', submissionComment);

            await submitWork(contractId, milestoneId, formData);
            
            // Reset form
            setSelectedFiles([]);
            setSubmissionComment('');
            setActiveMilestone(null);
            toast.success('Work submitted successfully!');
        } catch (error) {
            toast.error(error.message || 'Failed to submit work');
        }
    };

    const getStatusColor = (status) => {
        const colors = {
            pending: 'bg-yellow-100 text-yellow-800',
            submitted: 'bg-blue-100 text-blue-800',
            completed: 'bg-green-100 text-green-800',
            paid: 'bg-purple-100 text-purple-800',
            changes_requested: 'bg-red-100 text-red-800'
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    const formatSafeDate = (dateString, formatString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return 'Invalid Date';
        return format(date, formatString);
    };

    const handleViewDetails = (contract) => {
        setSelectedContract(contract);
        setIsDetailsModalOpen(true);
    };

    return (
        <div className="max-w-6xl mx-auto px-4 py-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Accepted Contracts</h2>
            
            <div className="space-y-6">
                {contracts.map(contract => (
                    <div key={contract._id} className="bg-white rounded-lg shadow-md overflow-hidden">
                        {/* Contract Header */}
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h3 className="text-xl font-semibold text-gray-900">{contract.title}</h3>
                                    <p className="text-gray-600 mt-1">{contract.scope}</p>
                                </div>
                                <div className="flex items-center space-x-4">
                                    <span className="text-2xl font-bold text-green-600">
                                        ${contract.totalAmount}
                                    </span>
                                    <button
                                        onClick={() => handleViewDetails(contract)}
                                        className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                                    >
                                        <Eye className="w-4 h-4 mr-2" />
                                        View Details
                                    </button>
                                    <button
                                        onClick={() => setExpandedContract(expandedContract === contract._id ? null : contract._id)}
                                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                                    >
                                        {expandedContract === contract._id ? <ChevronUp /> : <ChevronDown />}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Expanded Contract Details */}
                        {expandedContract === contract._id && (
                            <div className="border-t border-gray-200 p-6">
                                {/* Milestones */}
                                <div className="space-y-4">
                                    {contract.milestones.map(milestone => (
                                        <div key={milestone._id} className="border rounded-lg p-4">
                                            <div className="flex justify-between items-start mb-4">
                                                <div>
                                                    <h4 className="font-semibold text-gray-900">{milestone.title}</h4>
                                                    <p className="text-gray-600 mt-1">{milestone.description}</p>
                                                </div>
                                                <div className="text-right">
                                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(milestone.status)}`}>
                                                        {milestone.status}
                                                    </span>
                                                    <p className="text-gray-600 mt-1">
                                                        Due: {format(new Date(milestone.dueDate), 'MMM dd, yyyy')}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Show submission form for pending or changes_requested milestones */}
                                            {(milestone.status === 'pending' || milestone.status === 'changes_requested' || milestone.status === 'submitted') && (
                                                <div className="mt-4">
                                                    {/* Show client feedback if changes were requested */}
                                                    {milestone.status === 'changes_requested' && milestone.submissionHistory && milestone.submissionHistory.length > 0 && (
                                                        <div className="mb-4 p-4 bg-red-50 rounded-lg border border-red-100">
                                                            <h6 className="font-medium text-red-800 mb-2">Changes Requested</h6>
                                                            <p className="text-red-700">{milestone.submissionHistory[milestone.submissionHistory.length - 1].clientFeedback}</p>
                                                            <p className="text-sm text-red-600 mt-1">
                                                                Feedback provided on {formatSafeDate(milestone.submissionHistory[milestone.submissionHistory.length - 1].feedbackAt, 'MMM dd, yyyy HH:mm')}
                                                            </p>
                                                        </div>
                                                    )}

                                                    {/* Only show the submission form if the status is pending or changes_requested */}
                                                    {(milestone.status === 'pending' || milestone.status === 'changes_requested') && (
                                                        <>
                                                            {activeMilestone === milestone._id ? (
                                                                <div className="space-y-4">
                                                                    <div>
                                                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                                                            Work Description
                                                                        </label>
                                                                        <textarea
                                                                            value={submissionComment}
                                                                            onChange={(e) => setSubmissionComment(e.target.value)}
                                                                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                                                            rows="4"
                                                                            placeholder="Describe the work you're submitting..."
                                                                        />
                                                                    </div>
                                                                    
                                                                    <div>
                                                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                                                            Attachments
                                                                        </label>
                                                                        <input
                                                                            type="file"
                                                                            multiple
                                                                            onChange={handleFileChange}
                                                                            className="block w-full text-sm text-gray-500
                                                                                file:mr-4 file:py-2 file:px-4
                                                                                file:rounded-full file:border-0
                                                                                file:text-sm file:font-semibold
                                                                                file:bg-green-50 file:text-green-700
                                                                                hover:file:bg-green-100"
                                                                        />
                                                                    </div>

                                                                    <div className="flex justify-end gap-3">
                                                                        <button
                                                                            onClick={() => setActiveMilestone(null)}
                                                                            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                                                                        >
                                                                            Cancel
                                                                        </button>
                                                                        <button
                                                                            onClick={() => handleSubmit(contract._id, milestone._id)}
                                                                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                                                                        >
                                                                            Submit Work
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <button
                                                                    onClick={() => setActiveMilestone(milestone._id)}
                                                                    className="flex items-center text-green-600 hover:text-green-700"
                                                                >
                                                                    <Upload className="w-4 h-4 mr-2" />
                                                                    Submit Work
                                                                </button>
                                                            )}
                                                        </>
                                                    )}
                                                </div>
                                            )}

                                            {/* Show submission history */}
                                            {milestone.submissionHistory && milestone.submissionHistory.length > 0 && (
                                                <div className="mt-4 bg-gray-50 p-4 rounded-lg">
                                                    <h5 className="font-medium text-gray-900 mb-2">Submission History</h5>
                                                    <div className="space-y-4">
                                                        {milestone.submissionHistory.map((submission, index) => (
                                                            <div key={index} className="border-t pt-4 first:border-t-0 first:pt-0">
                                                                <div className="flex justify-between items-start">
                                                                    <div>
                                                                        <p className="text-sm text-gray-500">
                                                                            Submitted on {formatSafeDate(submission.submittedAt, 'MMM dd, yyyy HH:mm')}
                                                                        </p>
                                                                        <p className="text-gray-700 mt-2">{submission.comments}</p>
                                                                    </div>
                                                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(submission.status)}`}>
                                                                        {submission.status === 'changes_requested' ? 'Changes Requested' : 
                                                                         submission.status === 'approved' ? 'Approved' :
                                                                         submission.status === 'pending' ? 'Pending Review' :
                                                                         submission.status.replace('_', ' ')}
                                                                    </span>
                                                                </div>

                                                                {/* Show files */}
                                                                <div className="flex flex-wrap gap-2 mt-3">
                                                                    {submission.files.map((file, fileIndex) => (
                                                                        <div key={fileIndex} className="flex items-center space-x-2 px-3 py-2 bg-white rounded-lg border">
                                                                            <FileText className="w-4 h-4 text-gray-500" />
                                                                            <span className="text-sm text-gray-700">{file.filename}</span>
                                                                        </div>
                                                                    ))}
                                                                </div>

                                                                {/* Show client feedback if any */}
                                                                {submission.clientFeedback && (
                                                                    <div className="mt-3 pt-3 border-t">
                                                                        <p className="text-sm font-medium text-gray-900">Client Feedback:</p>
                                                                        <p className="text-sm text-gray-700 mt-1">{submission.clientFeedback}</p>
                                                                        <p className="text-xs text-gray-500 mt-1">
                                                                            Feedback provided on {formatSafeDate(submission.feedbackAt, 'MMM dd, yyyy HH:mm')}
                                                                        </p>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Contract Details Modal */}
            <ContractDetailsModal
                isOpen={isDetailsModalOpen}
                onClose={() => {
                    setIsDetailsModalOpen(false);
                    setSelectedContract(null);
                }}
                contract={selectedContract}
            />
        </div>
    );
};

export default AcceptedWorkTab; 