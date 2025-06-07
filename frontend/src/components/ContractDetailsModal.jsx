import { X } from 'lucide-react';
import { format } from 'date-fns';

const ContractDetailsModal = ({ isOpen, onClose, contract }) => {
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
                                <div key={milestone._id} className="border rounded-lg p-4">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <h4 className="font-medium text-gray-900">
                                                Milestone {index + 1}: {milestone.title}
                                            </h4>
                                            <p className="text-sm text-gray-600 mt-1">{milestone.description}</p>
                                        </div>
                                        <div className="text-right">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                milestone.status === 'completed' ? 'bg-green-100 text-green-800' :
                                                milestone.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                                                'bg-gray-100 text-gray-800'
                                            }`}>
                                                {milestone.status}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center mt-2 text-sm text-gray-500">
                                        <span>Amount: ${milestone.amount}</span>
                                        <span>Due: {format(new Date(milestone.dueDate), 'MMM dd, yyyy')}</span>
                                    </div>
                                    {milestone.submission && (
                                        <div className="mt-3 pt-3 border-t border-gray-100">
                                            <p className="text-sm font-medium text-gray-900">Latest Submission</p>
                                            <p className="text-sm text-gray-600 mt-1">{milestone.submission.comments}</p>
                                            {milestone.submission.files && milestone.submission.files.length > 0 && (
                                                <div className="mt-2">
                                                    <p className="text-sm font-medium text-gray-900">Attachments:</p>
                                                    <div className="flex flex-wrap gap-2 mt-1">
                                                        {milestone.submission.files.map((file, fileIndex) => (
                                                            <a
                                                                key={fileIndex}
                                                                href={file.url}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="text-sm text-blue-600 hover:text-blue-800"
                                                            >
                                                                {file.filename}
                                                            </a>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
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