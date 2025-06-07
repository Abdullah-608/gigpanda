import { useState, useEffect } from 'react';
import { useJobStore } from '../store/jobStore';
import { useContractStore } from '../store/contractStore';
import { DollarSign, User, Clock, Eye, CheckCircle, XCircle, Trash2, FileText, ChevronDown, ChevronUp } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import ContractDetailsModal from './ContractDetailsModal';
import { useNavigate } from 'react-router-dom';

const ClientJobsTab = () => {
    const { myJobs, fetchMyJobs, deleteJob } = useJobStore();
    const { contracts, getMyContracts, fundEscrow, releasePayment, reviewSubmission } = useContractStore();
    const [activeTab, setActiveTab] = useState('open');
    const [selectedContract, setSelectedContract] = useState(null);
    const [isContractModalOpen, setIsContractModalOpen] = useState(false);
    const [escrowAmount, setEscrowAmount] = useState('');
    const [expandedJobs, setExpandedJobs] = useState(new Set());
    const navigate = useNavigate();

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
            await reviewSubmission(contractId, milestoneId, { status, feedback });
            toast.success(status === 'approved' ? 'Work approved successfully' : 'Changes requested successfully');
        } catch (error) {
            toast.error(error.message || 'Failed to review submission');
        }
    };

    const handleReleasePayment = async (contractId, milestoneId) => {
        try {
            await releasePayment(contractId, milestoneId);
            toast.success('Payment released successfully');
        } catch (error) {
            toast.error(error.message || 'Failed to release payment');
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
                                        Posted {format(new Date(job.createdAt), 'MMM dd, yyyy')}
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
                                                                            Due: {format(new Date(milestone.dueDate), 'MMM dd, yyyy')}
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

                                                                {milestone.submission && (
                                                                    <div className="mt-2 space-y-2">
                                                                        <p className="text-sm text-gray-600">
                                                                            {milestone.submission.comments}
                                                                        </p>
                                                                        
                                                                        {milestone.status === 'submitted' && (
                                                                            <div className="flex space-x-2">
                                                                                <button
                                                                                    onClick={() => handleReviewSubmission(contract._id, milestone._id, 'approved')}
                                                                                    className="flex items-center px-3 py-1 text-sm text-green-700 bg-green-100 rounded-lg hover:bg-green-200"
                                                                                >
                                                                                    <CheckCircle className="w-4 h-4 mr-1" />
                                                                                    Approve
                                                                                </button>
                                                                                <button
                                                                                    onClick={() => handleReviewSubmission(contract._id, milestone._id, 'changes_requested')}
                                                                                    className="flex items-center px-3 py-1 text-sm text-red-700 bg-red-100 rounded-lg hover:bg-red-200"
                                                                                >
                                                                                    <XCircle className="w-4 h-4 mr-1" />
                                                                                    Request Changes
                                                                                </button>
                                                                            </div>
                                                                        )}

                                                                        {milestone.status === 'approved' && (
                                                                            <button
                                                                                onClick={() => handleReleasePayment(contract._id, milestone._id)}
                                                                                className="flex items-center px-3 py-1 text-sm text-purple-700 bg-purple-100 rounded-lg hover:bg-purple-200"
                                                                            >
                                                                                <DollarSign className="w-4 h-4 mr-1" />
                                                                                Release Payment
                                                                            </button>
                                                                        )}
                                                                    </div>
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