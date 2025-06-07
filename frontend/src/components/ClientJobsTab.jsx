import { useState, useEffect } from 'react';
import { useJobStore } from '../store/jobStore';
import { useContractStore } from '../store/contractStore';
import { DollarSign, User, Clock, Eye, Trash2, FileText, ChevronDown, ChevronUp, XCircle, FileIcon, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import ContractDetailsModal from './ContractDetailsModal';
import MilestoneReview from './MilestoneReview';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

const formatSafeDate = (dateString, formatString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid Date';
    return format(date, formatString);
};

const ClientJobsTab = () => {
    const { myJobs, fetchMyJobs, deleteJob } = useJobStore();
    const { contracts, getMyContracts, fundEscrow, reviewSubmission } = useContractStore();
    const { user } = useAuthStore();
    const [activeTab, setActiveTab] = useState('open');
    const [selectedContract, setSelectedContract] = useState(null);
    const [isContractModalOpen, setIsContractModalOpen] = useState(false);
    const [escrowAmount, setEscrowAmount] = useState('');
    const [expandedJobs, setExpandedJobs] = useState(new Set());
    const [selectedFile, setSelectedFile] = useState(null);
    const navigate = useNavigate();

    const isClient = user?.role === 'client';

    useEffect(() => {
        const loadData = async () => {
            console.log('Loading data...');
            await fetchMyJobs();
            await getMyContracts();
        };
        loadData();
    }, [fetchMyJobs, getMyContracts]);

    useEffect(() => {
        console.log('Current contracts:', contracts);
        console.log('Current jobs:', myJobs);
    }, [contracts, myJobs]);

    // Filter jobs based on whether they have an accepted proposal
    const openJobs = myJobs.filter(job => !job.proposals?.some(proposal => proposal.status === 'accepted'));
    const assignedJobs = myJobs.filter(job => job.proposals?.some(proposal => proposal.status === 'accepted'));

    const handleViewContract = (job) => {
        console.log('Viewing contract for job:', job);
        const matchingContract = contracts.find(c => c.job?._id === job._id);
        console.log('Found matching contract:', matchingContract);
        if (matchingContract) {
            setSelectedContract(matchingContract);
            setIsContractModalOpen(true);
        } else {
            toast.error('Contract not found');
        }
    };

    const handleFundEscrow = async (contractId) => {
        if (!escrowAmount || isNaN(escrowAmount) || parseFloat(escrowAmount) <= 0) {
            toast.error('Please enter a valid amount');
            return;
        }

        try {
            await fundEscrow(contractId, parseFloat(escrowAmount));
            setEscrowAmount('');
            toast.success('Escrow funded successfully');
        } catch (error) {
            toast.error(error.message || 'Failed to fund escrow');
        }
    };

    const handleReviewSubmission = async (contractId, milestoneId, status, feedback = '') => {
        try {
            await reviewSubmission(contractId, milestoneId, status, feedback);
            toast.success(status === 'approved' ? 'Work approved successfully' : 'Changes requested successfully');
            await getMyContracts(); // Refresh contracts after review
        } catch (error) {
            toast.error(error.message || 'Failed to review submission');
        }
    };

    const handleDeleteJob = async (jobId) => {
        if (window.confirm('Are you sure you want to delete this job? This action cannot be undone.')) {
            try {
                await deleteJob(jobId);
                toast.success('Job deleted successfully');
                fetchMyJobs(); // Refresh the jobs list
            } catch (error) {
                toast.error(error.message || 'Failed to delete job');
            }
        }
    };

    const handleViewProposals = (jobId) => {
        navigate(`/proposals/job/${jobId}`);
    };

    const toggleJobDetails = (jobId) => {
        console.log('Toggling job details for:', jobId);
        setExpandedJobs(prev => {
            const newSet = new Set(prev);
            if (newSet.has(jobId)) {
                newSet.delete(jobId);
            } else {
                newSet.add(jobId);
            }
            return newSet;
        });
    };

    const formatBudget = (budget, budgetType) => {
        if (budgetType === 'hourly') {
            return `$${budget.min} - $${budget.max}/hr`;
        } else {
            return `$${budget.min} - $${budget.max}`;
        }
    };

    const handlePreviewFile = (file) => {
        setSelectedFile(file);
    };

    const handleDownloadFile = async (contractId, milestoneId, file) => {
        try {
            const response = await fetch(`/api/contracts/${contractId}/milestones/${milestoneId}/files/${file._id}/download`);
            if (!response.ok) throw new Error('Download failed');
            
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = file.filename;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            
            toast.success('File download started');
        } catch (error) {
            console.error('Error downloading file:', error);
            toast.error('Failed to download file');
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 py-6">
            {/* Tab Navigation */}
            <div className="flex space-x-4 mb-6">
                <button
                    onClick={() => setActiveTab('open')}
                    className={`px-4 py-2 rounded-lg font-medium ${
                        activeTab === 'open'
                            ? 'bg-green-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                >
                    Open Jobs ({openJobs.length})
                </button>
                <button
                    onClick={() => setActiveTab('assigned')}
                    className={`px-4 py-2 rounded-lg font-medium ${
                        activeTab === 'assigned'
                            ? 'bg-green-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                >
                    Assigned Jobs ({assignedJobs.length})
                </button>
            </div>

            {/* Open Jobs Section */}
            {activeTab === 'open' && (
                <div className="space-y-6">
                    {openJobs.map(job => (
                        <div key={job._id} className="bg-white rounded-lg shadow-md overflow-hidden">
                            <div className="p-6">
                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        <h3 className="text-xl font-semibold text-gray-900">{job.title}</h3>
                                        <div className="flex items-center space-x-4 text-sm text-gray-500 mt-2">
                                            <span className="flex items-center">
                                                <DollarSign className="h-4 w-4 mr-1" />
                                                {formatBudget(job.budget, job.budgetType)}
                                            </span>
                                            <span className="flex items-center">
                                                <Clock className="h-4 w-4 mr-1" />
                                                {job.timeline}
                                            </span>
                                        </div>
                                        <p className="text-gray-600 mt-4">{job.description}</p>
                                        
                                        <div className="flex flex-wrap gap-2 mt-4">
                                            {job.skillsRequired?.map((skill, index) => (
                                                <span
                                                    key={index}
                                                    className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                                                >
                                                    {skill}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="bg-gray-50 px-6 py-4">
                                <div className="flex justify-between items-center">
                                    <div className="text-sm text-gray-500">
                                        Posted {formatSafeDate(job.createdAt, 'MMM dd, yyyy')}
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <span className="text-sm text-gray-600">
                                            {job.proposalCount || 0} proposals
                                        </span>
                                        <button
                                            onClick={() => handleViewProposals(job._id)}
                                            className="flex items-center px-3 py-1.5 text-sm font-medium text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100"
                                        >
                                            <FileText className="h-4 w-4 mr-1.5" />
                                            View Proposals
                                        </button>
                                        <button
                                            onClick={() => handleDeleteJob(job._id)}
                                            className="flex items-center px-3 py-1.5 text-sm font-medium text-red-700 bg-red-50 rounded-lg hover:bg-red-100"
                                        >
                                            <Trash2 className="h-4 w-4 mr-1.5" />
                                            Delete Job
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Assigned Jobs Section */}
            {activeTab === 'assigned' && (
                <div className="space-y-6">
                    {assignedJobs.map(job => {
                        const contract = contracts.find(c => c.job?._id === job._id);
                        const isExpanded = expandedJobs.has(job._id);
                        
                        console.log('Rendering assigned job:', job._id);
                        console.log('Found contract:', contract);
                        console.log('Is expanded:', isExpanded);
                        
                        return (
                            <div key={job._id} className="bg-white rounded-lg shadow-md overflow-hidden">
                                <div className="p-6 border-b border-gray-200">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="text-xl font-semibold text-gray-900">{job.title}</h3>
                                            <div className="flex items-center space-x-4 text-sm text-gray-500 mt-2">
                                                <span className="flex items-center">
                                                    <User className="h-4 w-4 mr-1" />
                                                    {contract?.freelancer?.name || 'Assigned Freelancer'}
                                                </span>
                                                <span className="flex items-center">
                                                    <DollarSign className="h-4 w-4 mr-1" />
                                                    ${contract?.totalAmount || job.budget.max}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex space-x-3">
                                            <button
                                                onClick={() => handleViewContract(job)}
                                                className="flex items-center px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100"
                                            >
                                                <Eye className="w-4 h-4 mr-2" />
                                                View Contract
                                            </button>
                                            <button
                                                onClick={() => toggleJobDetails(job._id)}
                                                className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                                            >
                                                {isExpanded ? (
                                                    <>
                                                        <ChevronUp className="w-4 h-4 mr-2" />
                                                        Hide Details
                                                    </>
                                                ) : (
                                                    <>
                                                        <ChevronDown className="w-4 h-4 mr-2" />
                                                        View Details
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Contract Management Section - Only shown when expanded */}
                                {isExpanded && contract && (
                                    <div className="p-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {/* Financial Management */}
                                            <div className="space-y-4">
                                                <h4 className="text-lg font-semibold text-gray-900">Financial Management</h4>
                                                
                                                {/* Escrow Funding */}
                                                <div className="bg-gray-50 p-4 rounded-lg">
                                                    <h5 className="font-medium text-gray-900 mb-2">Fund Escrow</h5>
                                                    <div className="flex space-x-2">
                                                        <input
                                                            type="number"
                                                            value={escrowAmount}
                                                            onChange={(e) => setEscrowAmount(e.target.value)}
                                                            placeholder="Enter amount"
                                                            className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                                                        />
                                                        <button
                                                            onClick={() => handleFundEscrow(contract._id)}
                                                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                                                        >
                                                            Fund
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* Payment History */}
                                                <div className="bg-gray-50 p-4 rounded-lg">
                                                    <h5 className="font-medium text-gray-900 mb-2">Payment History</h5>
                                                    <div className="space-y-2">
                                                        {contract?.milestones?.map((milestone, index) => (
                                                            <div key={index} className="flex justify-between items-center">
                                                                <span className="text-sm text-gray-600">
                                                                    Milestone {index + 1}: {milestone.title}
                                                                </span>
                                                                <span className={`text-sm font-medium ${
                                                                    milestone.status === 'completed' ? 'text-green-600' : 'text-gray-500'
                                                                }`}>
                                                                    ${milestone.amount}
                                                                </span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Project Management */}
                                            <div className="space-y-4">
                                                <h4 className="text-lg font-semibold text-gray-900">Project Management</h4>
                                                
                                                {/* Milestone Review */}
                                                <div className="bg-gray-50 p-4 rounded-lg">
                                                    <h5 className="font-medium text-gray-900 mb-2">Milestone Review</h5>
                                                    <div className="space-y-4">
                                                        {contract?.milestones?.map((milestone, index) => (
                                                            <div key={index} className="border-b border-gray-200 pb-4 last:border-0 last:pb-0">
                                                                <div className="flex justify-between items-start mb-2">
                                                                    <div>
                                                                        <h6 className="font-medium text-gray-900">
                                                                            {milestone.title}
                                                                        </h6>
                                                                        <p className="text-sm text-gray-600">
                                                                            Due: {formatSafeDate(milestone.dueDate, 'MMM dd, yyyy')}
                                                                        </p>
                                                                    </div>
                                                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                                                        milestone.status === 'completed' ? 'bg-green-100 text-green-800' :
                                                                        milestone.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                                                                        'bg-gray-100 text-gray-800'
                                                                    }`}>
                                                                        {milestone.status}
                                                                    </span>
                                                                </div>

                                                                {/* Work Review (Client Only) */}
                                                                {isClient && milestone.status === "submitted" && (
                                                                    <MilestoneReview
                                                                        milestone={milestone}
                                                                        contractId={contract._id}
                                                                        milestoneId={milestone._id}
                                                                        onReviewSubmission={handleReviewSubmission}
                                                                        onPreviewFile={handlePreviewFile}
                                                                        onDownloadFile={handleDownloadFile}
                                                                    />
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* File Preview Modal */}
            {selectedFile && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center p-4 border-b">
                            <h3 className="text-lg font-semibold">{selectedFile.filename}</h3>
                            <button onClick={() => setSelectedFile(null)} className="text-gray-500 hover:text-gray-700">
                                <XCircle className="w-6 h-6" />
                            </button>
                        </div>
                        <div className="p-4">
                            {selectedFile.mimetype?.startsWith('image/') ? (
                                <img src={selectedFile.url} alt={selectedFile.filename} className="max-w-full h-auto" />
                            ) : selectedFile.mimetype === 'application/pdf' ? (
                                <iframe src={selectedFile.url} className="w-full h-[70vh]" title={selectedFile.filename} />
                            ) : (
                                <div className="text-center py-8">
                                    <FileIcon className="w-16 h-16 mx-auto text-gray-400" />
                                    <p className="mt-4 text-gray-600">This file type cannot be previewed.</p>
                                    <a 
                                        href={selectedFile.url} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="mt-4 inline-flex items-center text-blue-600 hover:text-blue-800"
                                    >
                                        Download File
                                        <ExternalLink className="w-4 h-4 ml-2" />
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Contract Details Modal */}
            {selectedContract && (
                <ContractDetailsModal
                    isOpen={isContractModalOpen}
                    onClose={() => {
                        setIsContractModalOpen(false);
                        setSelectedContract(null);
                    }}
                    contract={selectedContract}
                />
            )}
        </div>
    );
};

export default ClientJobsTab; 