import { useState, useEffect } from 'react';
import { useContractStore } from '../store/contractStore';
import { Upload, FileText, ChevronDown, ChevronUp, Eye, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import ContractDetailsModal from './ContractDetailsModal';
import InlineLoading from './InlineLoading';

const AcceptedWorkTab = () => {
    const { contracts, getMyContracts, submitWork, isLoading } = useContractStore();
    const [expandedContract, setExpandedContract] = useState(null);
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [submissionComment, setSubmissionComment] = useState('');
    const [activeMilestone, setActiveMilestone] = useState(null);
    const [selectedContract, setSelectedContract] = useState(null);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('ongoing');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);

    useEffect(() => {
        getMyContracts();
    }, [getMyContracts]);

    const handleRefresh = async () => {
        setIsRefreshing(true);
        try {
            await getMyContracts();
            toast.success('Contracts refreshed');
        } catch (error) {
            toast.error('Failed to refresh contracts');
        } finally {
            setIsRefreshing(false);
        }
    };

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

        setIsSubmitting(true);
        try {
            const formData = new FormData();
            selectedFiles.forEach(file => {
                formData.append('files', file);
            });
            formData.append('comments', submissionComment);

            await submitWork(contractId, milestoneId, formData);
            
            setSelectedFiles([]);
            setSubmissionComment('');
            setActiveMilestone(null);
            toast.success('Work submitted successfully!');
        } catch (error) {
            toast.error(error.message || 'Failed to submit work');
        } finally {
            setIsSubmitting(false);
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

    // Filter contracts based on status
    const ongoingContracts = contracts.filter(contract => contract.status !== 'completed');
    const completedContracts = contracts.filter(contract => contract.status === 'completed');

    return (
        <div className="p-6">
            {/* Tabs and Refresh Button */}
            <div className="flex justify-between items-center mb-6">
                <div className="flex space-x-4">
                    <button
                        onClick={() => setActiveTab('ongoing')}
                        className={`px-4 py-2 rounded-lg font-medium ${
                            activeTab === 'ongoing'
                                ? 'bg-green-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <InlineLoading 
                                text="Loading..." 
                                size="small"
                                textColor={activeTab === 'ongoing' ? 'text-white' : 'text-gray-600'}
                                spinnerColor={activeTab === 'ongoing' ? 'text-white' : 'text-green-600'}
                            />
                        ) : (
                            `Ongoing Contracts (${ongoingContracts.length})`
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab('completed')}
                        className={`px-4 py-2 rounded-lg font-medium ${
                            activeTab === 'completed'
                                ? 'bg-green-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <InlineLoading 
                                text="Loading..." 
                                size="small"
                                textColor={activeTab === 'completed' ? 'text-white' : 'text-gray-600'}
                                spinnerColor={activeTab === 'completed' ? 'text-white' : 'text-green-600'}
                            />
                        ) : (
                            `Completed Contracts (${completedContracts.length})`
                        )}
                    </button>
                </div>
                <button
                    onClick={handleRefresh}
                    disabled={isLoading || isRefreshing}
                    className="p-2 text-gray-600 hover:text-gray-900 transition-colors disabled:opacity-50"
                >
                    <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
                </button>
            </div>

            {/* Contract List */}
            <div className="space-y-6">
                {isLoading ? (
                    <div className="bg-white rounded-lg shadow-md p-8">
                        <InlineLoading 
                            text="Loading contracts..." 
                            size="medium"
                            className="justify-center"
                        />
                    </div>
                ) : (activeTab === 'ongoing' ? ongoingContracts : completedContracts).length === 0 ? (
                    <div className="bg-white rounded-lg shadow-md p-8">
                        <p className="text-center text-gray-600">
                            No {activeTab === 'ongoing' ? 'ongoing' : 'completed'} contracts found.
                        </p>
                    </div>
                ) : (
                    (activeTab === 'ongoing' ? ongoingContracts : completedContracts).map(contract => (
                    <div key={contract._id} className="bg-white rounded-lg shadow-md overflow-hidden">
                            <div className="p-6">
                                <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="text-xl font-semibold text-gray-900">{contract.title}</h3>
                                        <div className="mt-2 space-y-2">
                                            <p className="text-sm text-gray-600">
                                                Created on {formatSafeDate(contract.createdAt, 'MMM dd, yyyy')}
                                            </p>
                                            {contract.endDate && (
                                                <p className="text-sm text-gray-600">
                                                    Completed on {formatSafeDate(contract.endDate, 'MMM dd, yyyy')}
                                                </p>
                                            )}
                                            <div className="flex items-center space-x-2">
                                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(contract.status)}`}>
                                                    {contract.status.charAt(0).toUpperCase() + contract.status.slice(1)}
                                                </span>
                                            </div>
                                        </div>
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

                        {/* Expanded Contract Details */}
                        {expandedContract === contract._id && (
                                    <div className="mt-6 border-t border-gray-200 pt-6">
                                        <div className="space-y-6">
                                {/* Milestones */}
                                            <div>
                                                <h4 className="text-lg font-medium text-gray-900 mb-4">Milestones</h4>
                                <div className="space-y-4">
                                                    {contract.milestones.map((milestone, index) => (
                                                        <div key={index} className="border border-gray-200 rounded-lg p-4">
                                                            <div className="flex justify-between items-start">
                                                <div>
                                                                    <h5 className="font-medium text-gray-900">{milestone.title}</h5>
                                                                    <p className="text-sm text-gray-600 mt-1">{milestone.description}</p>
                                                                    <p className="text-sm text-gray-600 mt-1">
                                                                        Due: {formatSafeDate(milestone.dueDate, 'MMM dd, yyyy')}
                                                                    </p>
                                                                    <p className="text-sm font-medium text-green-600 mt-1">
                                                                        ${milestone.amount}
                                                    </p>
                                                </div>
                                                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(milestone.status)}`}>
                                                                    {milestone.status.replace('_', ' ').charAt(0).toUpperCase() + milestone.status.slice(1)}
                                                                </span>
                                            </div>

                                                            {/* Submit Work Form */}
                                                            {activeMilestone === milestone._id && milestone.status !== 'completed' && milestone.status !== 'paid' && (
                                                                <div className="mt-4 space-y-4">
                                                            <div>
                                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                                    Work Description
                                                                </label>
                                                                <textarea
                                                                    value={submissionComment}
                                                                    onChange={(e) => setSubmissionComment(e.target.value)}
                                                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                                                    rows="4"
                                                                            placeholder="Describe the work you've completed..."
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                                            Attach Files
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
                                                                        {selectedFiles.length > 0 && (
                                                                            <div className="mt-2">
                                                                                <p className="text-sm text-gray-600">
                                                                                    {selectedFiles.length} file(s) selected
                                                                                </p>
                                                                            </div>
                                                                        )}
                                                            </div>
                                                                    <div className="flex justify-end space-x-2">
                                                                <button
                                                                    onClick={() => setActiveMilestone(null)}
                                                                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                                                                            disabled={isSubmitting}
                                                                >
                                                                    Cancel
                                                                </button>
                                                                <button
                                                                    onClick={() => handleSubmit(contract._id, milestone._id)}
                                                                            className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 flex items-center"
                                                                            disabled={isSubmitting}
                                                                        >
                                                                            {isSubmitting ? (
                                                                                <InlineLoading 
                                                                                    text="Submitting..." 
                                                                                    size="small"
                                                                                    textColor="text-white"
                                                                                    spinnerColor="text-white"
                                                                                />
                                                                            ) : (
                                                                                <>
                                                                                    <Upload className="w-4 h-4 mr-2" />
                                                                    Submit Work
                                                                                </>
                                                                            )}
                                                                </button>
                                                            </div>
                                                        </div>
                                                            )}

                                                            {/* Submit Work Button */}
                                                            {activeMilestone !== milestone._id && 
                                                            milestone.status !== 'completed' && 
                                                            milestone.status !== 'paid' && 
                                                            milestone.status !== 'submitted' && (
                                                        <button
                                                            onClick={() => setActiveMilestone(milestone._id)}
                                                                    className="mt-4 w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center"
                                                        >
                                                            <Upload className="w-4 h-4 mr-2" />
                                                            Submit Work
                                                        </button>
                                                    )}

                                                            {/* Submission History */}
                                                            {(milestone.submissionHistory?.length > 0 || milestone.currentSubmission) && (
                                                                <div className="mt-4 pt-4 border-t border-gray-200">
                                                                    <h6 className="font-medium text-gray-900 mb-2">Submission History</h6>
                                                                    
                                                                    {/* Current Submission */}
                                                                    {milestone.currentSubmission && (
                                                                        <div className="mb-4 p-3 bg-blue-50 border border-blue-100 rounded-lg">
                                                                            <div className="flex justify-between items-start">
                                                                                <div>
                                                                                    <span className="text-sm font-medium text-blue-800">Current Submission</span>
                                                                                    <p className="text-sm text-gray-600 mt-1">
                                                                                        Submitted on {formatSafeDate(milestone.currentSubmission.submittedAt, 'MMM dd, yyyy HH:mm')}
                                                                                    </p>
                                                                                </div>
                                                                                <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                                                                                    Pending Review
                                                                                </span>
                                                </div>
                                                                            <p className="mt-2 text-sm text-gray-700">{milestone.currentSubmission.comments}</p>
                                                                            {milestone.currentSubmission.files && milestone.currentSubmission.files.length > 0 && (
                                                                                <div className="mt-2">
                                                                                    <p className="text-sm font-medium text-gray-700">Attachments:</p>
                                                                                    <div className="flex flex-wrap gap-2 mt-1">
                                                                                        {milestone.currentSubmission.files.map((file, fileIndex) => (
                                                            <a
                                                                                                key={fileIndex}
                                                                href={file.url}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                                                className="flex items-center px-3 py-1 bg-white rounded-lg hover:bg-gray-50"
                                                            >
                                                                <FileText className="w-4 h-4 mr-2" />
                                                                {file.filename}
                                                            </a>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                                                    )}
                                                                    
                                                                    {/* Previous Submissions */}
                                                                    {milestone.submissionHistory?.map((submission, subIndex) => (
                                                                        <div key={subIndex} className="mb-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                                                                            <div className="flex justify-between items-start">
                                                                                <p className="text-sm text-gray-600">
                                                                                    Submitted on {formatSafeDate(submission.submittedAt, 'MMM dd, yyyy HH:mm')}
                                                                                </p>
                                                                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                                                                    submission.status === 'approved' ? 'bg-green-100 text-green-800' :
                                                                                    submission.status === 'changes_requested' ? 'bg-yellow-100 text-yellow-800' :
                                                                                    'bg-gray-100 text-gray-800'
                                                                                }`}>
                                                                                    {submission.status.replace('_', ' ')}
                                                                                </span>
                                                                            </div>
                                                                            <p className="mt-2 text-sm text-gray-700">{submission.comments}</p>
                                                                            {submission.files && submission.files.length > 0 && (
                                                                                <div className="mt-2">
                                                                                    <p className="text-sm font-medium text-gray-700">Attachments:</p>
                                                                                    <div className="flex flex-wrap gap-2 mt-1">
                                                                                        {submission.files.map((file, fileIndex) => (
                                                                                            <a
                                                                                                key={fileIndex}
                                                                                                href={file.url}
                                                                                                target="_blank"
                                                                                                rel="noopener noreferrer"
                                                                                                className="flex items-center px-3 py-1 bg-white rounded-lg hover:bg-gray-50"
                                                                                            >
                                                                                                <FileText className="w-4 h-4 mr-2" />
                                                                                                {file.filename}
                                                                                            </a>
                                    ))}
                                </div>
                                                                                </div>
                                                                            )}
                                                                            {/* Show client feedback if any */}
                                                                            {submission.clientFeedback && (
                                                                                <div className="mt-3 pt-3 border-t border-gray-200">
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
                        )}
                    </div>
                ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                )}
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