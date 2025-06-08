import { useState } from 'react';
import { useJobStore } from '../store/jobStore';
import { useContractStore } from '../store/contractStore';
import { useAuthStore } from '../store/authStore';
import { DollarSign, User, Clock, Eye, Trash2, FileText, ChevronDown, ChevronUp, Calendar, Briefcase, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import ContractDetailsModal from './ContractDetailsModal';
import InlineLoading from './InlineLoading';
import MilestoneReview from './MilestoneReview';

const formatSafeDate = (dateString, formatString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid Date';
    return format(date, formatString);
};

const ClientJobsTab = () => {
    const { myJobs, fetchMyJobs, deleteJob, isLoading } = useJobStore();
    const { contracts, getMyContracts, fundEscrow, reviewSubmission } = useContractStore();
    const { user } = useAuthStore();
    const [activeTab, setActiveTab] = useState('open');
    const [selectedContract, setSelectedContract] = useState(null);
    const [isContractModalOpen, setIsContractModalOpen] = useState(false);
    const [escrowAmount, setEscrowAmount] = useState('');
    const [expandedJobs, setExpandedJobs] = useState(new Set());
    const [isDeletingJob, setIsDeletingJob] = useState(null);
    const [isFundingEscrow, setIsFundingEscrow] = useState(null);
    const [isTogglingDetails, setIsTogglingDetails] = useState(null);
    const [isViewingContract, setIsViewingContract] = useState(null);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const navigate = useNavigate();

    const isClient = user?.role === 'client';

    const handleRefresh = async () => {
        setIsRefreshing(true);
        try {
            await Promise.all([
                fetchMyJobs(),
                getMyContracts()
            ]);
        } catch (error) {
            console.error('Error refreshing data:', error);
            toast.error('Failed to refresh data');
        } finally {
            setIsRefreshing(false);
        }
    };

    // Filter jobs based on their status
    const openJobs = myJobs.filter(job => !job.proposals?.some(proposal => proposal.status === 'accepted'));
    const assignedJobs = myJobs.filter(job => {
        const contract = contracts.find(c => c.job?._id === job._id);
        return job.proposals?.some(proposal => proposal.status === 'accepted') && contract?.status !== 'completed';
    });
    const completedJobs = myJobs.filter(job => {
        const contract = contracts.find(c => c.job?._id === job._id);
        return contract?.status === 'completed';
    });

    const handleViewContract = async (job) => {
        console.log('Viewing contract for job:', job);
        setIsViewingContract(job._id);
        try {
            // Fetch latest contracts
            const freshContracts = await getMyContracts();
            
            // Find the matching contract from the fresh data
            const matchingContract = freshContracts?.find(c => c.job?._id === job._id);
            
        console.log('Found matching contract:', matchingContract);
            
        if (matchingContract) {
            setSelectedContract(matchingContract);
            setIsContractModalOpen(true);
        } else {
            toast.error('Contract not found');
            }
        } catch (error) {
            console.error('Error loading contract:', error);
            toast.error('Error loading contract details');
        } finally {
            setIsViewingContract(null);
        }
    };

    const handleFundEscrow = async (contractId) => {
        if (!escrowAmount || isNaN(escrowAmount) || parseFloat(escrowAmount) <= 0) {
            toast.error('Please enter a valid amount');
            return;
        }

        try {
            setIsFundingEscrow(contractId);
            await fundEscrow(contractId, parseFloat(escrowAmount));
            setEscrowAmount('');
            toast.success('Escrow funded successfully');
        } catch (error) {
            toast.error(error.message || 'Failed to fund escrow');
        } finally {
            setIsFundingEscrow(null);
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
                setIsDeletingJob(jobId);
                await deleteJob(jobId);
                toast.success('Job deleted successfully');
                await fetchMyJobs();
            } catch (error) {
                toast.error(error.message || 'Failed to delete job');
            } finally {
                setIsDeletingJob(null);
            }
        }
    };

    const handleViewProposals = (jobId) => {
        navigate(`/proposals/job/${jobId}`);
    };

    const toggleJobDetails = (jobId) => {
        console.log('Toggling job details for:', jobId);
        setIsTogglingDetails(jobId);
        
        // Update the expanded jobs state
        setExpandedJobs(prev => {
            const newSet = new Set(prev);
            if (newSet.has(jobId)) {
                newSet.delete(jobId);
            } else {
                newSet.add(jobId);
            }
            return newSet;
        });
        
        // Clear the loading state immediately
        setIsTogglingDetails(null);
    };

    const formatBudget = (budget, budgetType) => {
        if (budgetType === 'hourly') {
            return `$${budget.min} - $${budget.max}/hr`;
        } else {
            return `$${budget.min} - $${budget.max}`;
        }
    };

    const handleDownloadFile = async (contractId, milestoneId, file) => {
        try {
            const response = await fetch(`/api/contracts/${contractId}/milestones/${milestoneId}/files/${file._id}/download`, {
                method: 'GET',
                headers: {
                    'Accept': '*/*'  // Accept any content type
                }
            });

            if (!response.ok) {
                throw new Error('Download failed');
            }

            // Get the filename from the Content-Disposition header or use the original filename
            const contentDisposition = response.headers.get('Content-Disposition');
            const filename = contentDisposition
                ? decodeURIComponent(contentDisposition.split('filename=')[1].replace(/"/g, ''))
                : file.filename;

            // Create blob with the correct type from response headers
            const blob = await response.blob();
            const blobWithType = new Blob([blob], { 
                type: response.headers.get('Content-Type') || 'application/octet-stream' 
            });

            // Create download link and trigger download
            const downloadUrl = window.URL.createObjectURL(blobWithType);
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            
            // Cleanup
            document.body.removeChild(link);
            setTimeout(() => {
                window.URL.revokeObjectURL(downloadUrl);
            }, 100);

            toast.success('File download started');
        } catch (error) {
            console.error('Error downloading file:', error);
            toast.error('Failed to download file');
        }
    };

    const getStatusBadgeClass = (status) => {
        switch (status) {
            case 'completed':
                return 'bg-green-100 text-green-800';
            case 'in_progress':
                return 'bg-blue-100 text-blue-800';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'review needed':
                return 'bg-purple-100 text-purple-800';
            case 'changes requested':
                return 'bg-red-100 text-red-800';
            case 'submitted':
                return 'bg-blue-100 text-blue-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getJobStatus = (job, contract) => {
        if (contract?.status === 'completed') return 'completed';
        if (contract) {
            const hasSubmittedMilestone = contract.milestones.some(m => m.status === 'submitted');
            const hasChangesRequested = contract.milestones.some(m => m.status === 'changes_requested');
            const hasInProgress = contract.milestones.some(m => m.status === 'in_progress');
            
            if (hasSubmittedMilestone) return 'review needed';
            if (hasChangesRequested) return 'changes requested';
            if (hasInProgress) return 'in progress';
            return 'pending';
        }
        return 'open';
    };

    return (
        <div className="max-w-7xl mx-auto px-4 py-6">
            {/* Tab Navigation with Refresh Button */}
            <div className="flex justify-between items-center mb-6">
                <div className="flex space-x-4">
                <button
                    onClick={() => setActiveTab('open')}
                        disabled={isLoading}
                    className={`px-4 py-2 rounded-lg font-medium ${
                        activeTab === 'open'
                            ? 'bg-green-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        {isLoading ? (
                            <InlineLoading text="Loading..." size="small" className="py-0" />
                        ) : (
                            `Open Jobs (${openJobs.length})`
                        )}
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
                    <button
                        onClick={() => setActiveTab('completed')}
                        className={`px-4 py-2 rounded-lg font-medium ${
                            activeTab === 'completed'
                                ? 'bg-green-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                    >
                        Completed Jobs ({completedJobs.length})
                    </button>
                </div>
                <button
                    onClick={handleRefresh}
                    disabled={isRefreshing}
                    className="flex items-center px-3 py-2 text-gray-600 hover:text-gray-900 transition-colors"
                >
                    <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
                </button>
            </div>

            {/* Loading state for the entire section */}
            {isLoading && myJobs.length === 0 && (
                <div className="bg-white rounded-lg shadow-md p-6">
                    <InlineLoading text="Loading jobs..." size="medium" className="justify-center" />
                </div>
            )}

            {/* Empty state */}
            {!isLoading && myJobs.length === 0 && (
                <div className="bg-white rounded-lg shadow-md p-8 text-center">
                    <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs found</h3>
                    <p className="text-gray-500">You haven't posted any jobs yet.</p>
                </div>
            )}

            {/* Open Jobs Section */}
            {activeTab === 'open' && (
                <div className="space-y-6">
                    {openJobs.map(job => (
                        <div key={job._id} className="bg-white rounded-lg shadow-md overflow-hidden">
                            <div className="p-6">
                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3">
                                        <h3 className="text-xl font-semibold text-gray-900">{job.title}</h3>
                                            <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
                                                Open
                                            </span>
                                        </div>
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
                                            disabled={isLoading}
                                            className="flex items-center px-3 py-1.5 text-sm font-medium text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100 disabled:opacity-50"
                                        >
                                            <FileText className="h-4 w-4 mr-1.5" />
                                            View Proposals
                                        </button>
                                        <button
                                            onClick={() => handleDeleteJob(job._id)}
                                            disabled={isDeletingJob === job._id}
                                            className="flex items-center px-3 py-1.5 text-sm font-medium text-red-700 bg-red-50 rounded-lg hover:bg-red-100 disabled:opacity-50"
                                        >
                                            {isDeletingJob === job._id ? (
                                                <InlineLoading text="Deleting..." size="small" spinnerColor="text-red-600" textColor="text-red-700" className="py-0" />
                                            ) : (
                                                <>
                                            <Trash2 className="h-4 w-4 mr-1.5" />
                                            Delete Job
                                                </>
                                            )}
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
                        const status = getJobStatus(job, contract);
                        
                        console.log('Rendering assigned job:', job._id);
                        console.log('Found contract:', contract);
                        console.log('Is expanded:', isExpanded);
                        
                        return (
                            <div key={job._id} className="bg-white rounded-lg shadow-md overflow-hidden">
                                <div className="p-6 border-b border-gray-200">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <div className="flex items-center gap-3">
                                            <h3 className="text-xl font-semibold text-gray-900">{job.title}</h3>
                                                <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${getStatusBadgeClass(status)}`}>
                                                    {status.charAt(0).toUpperCase() + status.slice(1)}
                                                </span>
                                            </div>
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
                                                disabled={isViewingContract === job._id}
                                                className="flex items-center px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100 disabled:opacity-50"
                                            >
                                                {isViewingContract === job._id ? (
                                                    <InlineLoading text="Loading..." size="small" spinnerColor="text-blue-600" textColor="text-blue-700" className="py-0" />
                                                ) : (
                                                    <>
                                                <Eye className="w-4 h-4 mr-2" />
                                                View Contract
                                                    </>
                                                )}
                                            </button>
                                            <button
                                                onClick={() => toggleJobDetails(job._id)}
                                                disabled={isTogglingDetails === job._id}
                                                className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50"
                                            >
                                                {isTogglingDetails === job._id ? (
                                                    <InlineLoading text="Loading..." size="small" spinnerColor="text-gray-600" textColor="text-gray-700" className="py-0" />
                                                ) : isExpanded ? (
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
                                            <button
                                                onClick={() => handleDeleteJob(job._id)}
                                                disabled={isDeletingJob === job._id}
                                                className="flex items-center px-3 py-1.5 text-sm font-medium text-red-700 bg-red-50 rounded-lg hover:bg-red-100 disabled:opacity-50"
                                            >
                                                {isDeletingJob === job._id ? (
                                                    <InlineLoading text="Deleting..." size="small" spinnerColor="text-red-600" textColor="text-red-700" className="py-0" />
                                                ) : (
                                                    <>
                                                        <Trash2 className="h-4 w-4 mr-1.5" />
                                                        Delete Job
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
                                                            disabled={isFundingEscrow === contract._id}
                                                            className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 disabled:opacity-50"
                                                        />
                                                        <button
                                                            onClick={() => handleFundEscrow(contract._id)}
                                                            disabled={isFundingEscrow === contract._id}
                                                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                                                        >
                                                            {isFundingEscrow === contract._id ? (
                                                                <InlineLoading text="Funding..." size="small" spinnerColor="text-white" textColor="text-white" className="py-0" />
                                                            ) : (
                                                                'Fund'
                                                            )}
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
                                                                        milestone.status === 'submitted' ? 'bg-purple-100 text-purple-800' :
                                                                        milestone.status === 'changes_requested' ? 'bg-red-100 text-red-800' :
                                                                        'bg-gray-100 text-gray-800'
                                                                    }`}>
                                                                        {milestone.status.replace(/_/g, ' ').split(' ').map(word => 
                                                                            word.charAt(0).toUpperCase() + word.slice(1)
                                                                        ).join(' ')}
                                                                    </span>
                                                                </div>

                                                                {/* Work Review (Client Only) */}
                                                                {isClient && milestone.status === "submitted" && (
                                                                    <MilestoneReview
                                                                        milestone={milestone}
                                                                        contractId={contract._id}
                                                                        milestoneId={milestone._id}
                                                                        onReviewSubmission={handleReviewSubmission}
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

            {/* Completed Jobs Section */}
            {activeTab === 'completed' && (
                <div className="space-y-6">
                    {completedJobs.map(job => {
                        const contract = contracts.find(c => c.job?._id === job._id);
                        const isExpanded = expandedJobs.has(job._id);
                        
                        return (
                            <div key={job._id} className="bg-white rounded-lg shadow-md overflow-hidden">
                                <div className="p-6 border-b border-gray-200">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <div className="flex items-center gap-3">
                                                <h3 className="text-xl font-semibold text-gray-900">{job.title}</h3>
                                                <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                                                    Completed
                                                </span>
                                            </div>
                                            <div className="flex items-center space-x-4 text-sm text-gray-500 mt-2">
                                                <span className="flex items-center">
                                                    <User className="h-4 w-4 mr-1" />
                                                    {contract?.freelancer?.name || 'Assigned Freelancer'}
                                                </span>
                                                <span className="flex items-center">
                                                    <DollarSign className="h-4 w-4 mr-1" />
                                                    ${contract?.totalAmount || job.budget.max}
                                                </span>
                                                <span className="flex items-center">
                                                    <Calendar className="h-4 w-4 mr-1" />
                                                    Completed: {formatSafeDate(contract?.endDate, 'MMM dd, yyyy')}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-3">
                                            <button
                                                onClick={() => handleViewContract(job)}
                                                disabled={isViewingContract === job._id}
                                                className="flex items-center px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100 disabled:opacity-50"
                                            >
                                                {isViewingContract === job._id ? (
                                                    <InlineLoading text="Loading..." size="small" spinnerColor="text-blue-600" textColor="text-blue-700" className="py-0" />
                                                ) : (
                                                    <>
                                                        <Eye className="w-4 h-4 mr-2" />
                                                        View Contract
                                                    </>
                                                )}
                                            </button>
                                            <button
                                                onClick={() => handleDeleteJob(job._id)}
                                                disabled={isDeletingJob === job._id}
                                                className="flex items-center px-3 py-1.5 text-sm font-medium text-red-700 bg-red-50 rounded-lg hover:bg-red-100 disabled:opacity-50"
                                            >
                                                {isDeletingJob === job._id ? (
                                                    <InlineLoading text="Deleting..." size="small" spinnerColor="text-red-600" textColor="text-red-700" className="py-0" />
                                                ) : (
                                                    <>
                                                        <Trash2 className="h-4 w-4 mr-1.5" />
                                                        Delete Job
                                                    </>
                                                )}
                                            </button>
                                            <button
                                                onClick={() => toggleJobDetails(job._id)}
                                                disabled={isTogglingDetails === job._id}
                                                className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50"
                                            >
                                                {isTogglingDetails === job._id ? (
                                                    <InlineLoading text="Loading..." size="small" spinnerColor="text-gray-600" textColor="text-gray-700" className="py-0" />
                                                ) : isExpanded ? (
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

                                {/* Contract Details Section - Only shown when expanded */}
                                {isExpanded && contract && (
                                    <div className="p-6">
                                        <div className="space-y-4">
                                            <div className="bg-gray-50 p-4 rounded-lg">
                                                <h4 className="font-medium text-gray-900 mb-2">Project Summary</h4>
                                                <p className="text-gray-600">{job.description}</p>
                                            </div>

                                            <div className="bg-gray-50 p-4 rounded-lg">
                                                <h4 className="font-medium text-gray-900 mb-2">Milestones</h4>
                                                <div className="space-y-4">
                                                    {contract.milestones.map((milestone, index) => (
                                                        <div key={index} className="border-b border-gray-200 pb-4 last:border-0 last:pb-0">
                                                            <div className="flex justify-between items-start mb-2">
                                                                <div>
                                                                    <h5 className="font-medium text-gray-900">{milestone.title}</h5>
                                                                    <p className="text-sm text-gray-600 mt-1">
                                                                        Due: {formatSafeDate(milestone.dueDate, 'MMM dd, yyyy')}
                                                                    </p>
                                                                    <p className="text-sm font-medium text-green-600 mt-1">
                                                                        ${milestone.amount}
                                                                    </p>
                                                                </div>
                                                                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                                                                    Completed
                                                                </span>
                                                            </div>

                                                            {/* Submission History */}
                                                            {(milestone.submissionHistory?.length > 0) && (
                                                                <div className="mt-4">
                                                                    <h6 className="text-sm font-medium text-gray-900 mb-2">Submission History</h6>
                                                                    <div className="space-y-3">
                                                                        {milestone.submissionHistory.map((submission, subIndex) => (
                                                                            <div key={subIndex} className="bg-white p-3 rounded-lg border border-gray-200">
                                                                                <div className="flex justify-between items-start mb-2">
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
                                                                                <p className="text-sm text-gray-700 mb-2">{submission.comments}</p>

                                                                                {/* Submission Files */}
                                                                                {submission.files && submission.files.length > 0 && (
                                                                                    <div className="mt-2">
                                                                                        <p className="text-sm font-medium text-gray-700 mb-1">Files:</p>
                                                                                        <div className="flex flex-wrap gap-2">
                                                                                            {submission.files.map((file, fileIndex) => (
                                                                                                <button
                                                                                                    key={fileIndex}
                                                                                                    onClick={() => handleDownloadFile(contract._id, milestone._id, file)}
                                                                                                    className="flex items-center px-3 py-1 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                                                                                                >
                                                                                                    <FileText className="w-4 h-4 mr-2" />
                                                                                                    {file.filename}
                                                                                                </button>
                                                                                            ))}
                                                                                        </div>
                                                                                    </div>
                                                                                )}

                                                                                {/* Client Feedback */}
                                                                                {submission.clientFeedback && (
                                                                                    <div className="mt-3 pt-3 border-t border-gray-200">
                                                                                        <p className="text-sm font-medium text-gray-900">Your Feedback:</p>
                                                                                        <p className="text-sm text-gray-700 mt-1">{submission.clientFeedback}</p>
                                                                                        <p className="text-xs text-gray-500 mt-1">
                                                                                            Provided on {formatSafeDate(submission.feedbackAt, 'MMM dd, yyyy HH:mm')}
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
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
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