import { format } from 'date-fns';
import { Eye, Download, FileIcon, CheckCircle, XCircle } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import InlineLoading from './InlineLoading';

const formatSafeDate = (dateString, formatString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid Date';
    return format(date, formatString);
};

const MilestoneReview = ({ 
    milestone, 
    contractId, 
    milestoneId, 
    onPreviewFile,
    onDownloadFile,
    onReviewSubmission
}) => {
    const [isApproving, setIsApproving] = useState(false);
    const [isRejecting, setIsRejecting] = useState(false);
    const [showFeedbackModal, setShowFeedbackModal] = useState(false);
    const [feedback, setFeedback] = useState('');

    const handleDownload = (file) => {
        onDownloadFile(contractId, milestoneId, file);
    };

    const handleApprove = async () => {
        setIsApproving(true);
        try {
            await onReviewSubmission(contractId, milestoneId, 'approved');
            toast.success('Work approved successfully');
        } catch (error) {
            console.error('Error approving work:', error);
            toast.error('Failed to approve work');
        } finally {
            setIsApproving(false);
        }
    };

    const handleReject = async () => {
        if (!feedback.trim()) {
            toast.error('Please provide feedback for improvement');
            return;
        }
        setIsRejecting(true);
        try {
            await onReviewSubmission(contractId, milestoneId, 'changes_requested', feedback);
            toast.success('Changes requested successfully');
            setShowFeedbackModal(false);
            setFeedback('');
        } catch (error) {
            console.error('Error requesting changes:', error);
            toast.error('Failed to request changes');
        } finally {
            setIsRejecting(false);
        }
    };

    return (
        <div className="mt-4 bg-gray-50 p-4 rounded-lg">
            <h5 className="font-medium text-gray-900 mb-2">Review Submission</h5>
            
            {/* Current Submission */}
            {milestone.currentSubmission && (
                <div className="bg-white rounded-lg border p-4 mb-4">
                    <div className="flex justify-between items-start mb-3">
                        <div>
                            <p className="text-sm text-gray-500">
                                Submitted on {formatSafeDate(milestone.currentSubmission.submittedAt, 'MMM dd, yyyy HH:mm')}
                            </p>
                            <p className="text-gray-700 mt-2">{milestone.currentSubmission.comments}</p>
                        </div>
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                            Pending Review
                        </span>
                    </div>
                    {milestone.currentSubmission.files && milestone.currentSubmission.files.length > 0 && (
                        <div className="mt-3">
                            <p className="text-sm font-medium text-gray-700 mb-2">Attachments:</p>
                            <div className="flex flex-wrap gap-2">
                                {milestone.currentSubmission.files.map((file, index) => (
                                    <div key={index} className="flex items-center space-x-2 bg-gray-50 px-3 py-2 rounded-lg">
                                        <FileIcon className="w-4 h-4 text-gray-500" />
                                        <span className="text-sm text-gray-700">{file.filename}</span>
                                        <div className="flex space-x-1">
                                            <button
                                                onClick={() => onPreviewFile(file)}
                                                className="p-1 hover:bg-gray-200 rounded-full"
                                                title="Preview"
                                            >
                                                <Eye className="w-4 h-4 text-gray-600" />
                                            </button>
                                            <button
                                                onClick={() => handleDownload(file)}
                                                className="p-1 hover:bg-gray-200 rounded-full"
                                                title="Download"
                                            >
                                                <Download className="w-4 h-4 text-gray-600" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Review Buttons */}
                    <div className="mt-6 flex gap-3">
                        <button
                            onClick={handleApprove}
                            disabled={isApproving || isRejecting}
                            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                        >
                            {isApproving ? (
                                <InlineLoading text="Approving..." size="small" spinnerColor="text-white" textColor="text-white" className="py-0" />
                            ) : (
                                <>
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                    Accept Work
                                </>
                            )}
                        </button>
                        <button
                            onClick={() => setShowFeedbackModal(true)}
                            disabled={isApproving || isRejecting}
                            className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                        >
                            {isRejecting ? (
                                <InlineLoading text="Rejecting..." size="small" spinnerColor="text-white" textColor="text-white" className="py-0" />
                            ) : (
                                <>
                                    <XCircle className="w-4 h-4 mr-2" />
                                    Request Changes
                                </>
                            )}
                        </button>
                    </div>
                </div>
            )}

            {/* Feedback Modal */}
            {showFeedbackModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-lg">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Request Changes</h3>
                        <textarea
                            value={feedback}
                            onChange={(e) => setFeedback(e.target.value)}
                            placeholder="Please provide detailed feedback for improvement..."
                            className="w-full h-32 p-3 border rounded-lg focus:ring-2 focus:ring-green-500 resize-none"
                        />
                        <div className="flex justify-end gap-3 mt-4">
                            <button
                                onClick={() => {
                                    setShowFeedbackModal(false);
                                    setFeedback('');
                                }}
                                className="px-4 py-2 text-gray-600 hover:text-gray-800"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleReject}
                                disabled={isRejecting || !feedback.trim()}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                            >
                                {isRejecting ? (
                                    <InlineLoading text="Submitting..." size="small" spinnerColor="text-white" textColor="text-white" className="py-0" />
                                ) : (
                                    'Submit Feedback'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Submission History */}
            {milestone.submissionHistory && milestone.submissionHistory.length > 0 && (
                <div className="mt-6">
                    <h4 className="font-medium text-gray-900 mb-3">Previous Submissions</h4>
                    <div className="space-y-4">
                        {milestone.submissionHistory.map((submission, index) => (
                            <div key={index} className="bg-white rounded-lg border p-4">
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <p className="text-sm text-gray-500">
                                            Submitted on {formatSafeDate(submission.submittedAt, 'MMM dd, yyyy HH:mm')}
                                        </p>
                                        <p className="text-gray-700 mt-2">{submission.comments}</p>
                                    </div>
                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                        submission.status === 'approved' ? 'bg-green-100 text-green-800' :
                                        submission.status === 'changes_requested' ? 'bg-yellow-100 text-yellow-800' :
                                        'bg-blue-100 text-blue-800'
                                    }`}>
                                        {submission.status.replace(/_/g, ' ').split(' ').map(word => 
                                            word.charAt(0).toUpperCase() + word.slice(1)
                                        ).join(' ')}
                                    </span>
                                </div>
                                {submission.files && submission.files.length > 0 && (
                                    <div className="mt-3">
                                        <p className="text-sm font-medium text-gray-700 mb-2">Attachments:</p>
                                        <div className="flex flex-wrap gap-2">
                                            {submission.files.map((file, index) => (
                                                <div key={index} className="flex items-center space-x-2 bg-gray-50 px-3 py-2 rounded-lg">
                                                    <FileIcon className="w-4 h-4 text-gray-500" />
                                                    <span className="text-sm text-gray-700">{file.filename}</span>
                                                    <div className="flex space-x-1">
                                                        <button
                                                            onClick={() => onPreviewFile(file)}
                                                            className="p-1 hover:bg-gray-200 rounded-full"
                                                            title="Preview"
                                                        >
                                                            <Eye className="w-4 h-4 text-gray-600" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDownload(file)}
                                                            className="p-1 hover:bg-gray-200 rounded-full"
                                                            title="Download"
                                                        >
                                                            <Download className="w-4 h-4 text-gray-600" />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {submission.clientFeedback && (
                                    <div className="mt-4 pt-3 border-t">
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
    );
};

export default MilestoneReview; 