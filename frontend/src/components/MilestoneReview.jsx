import { useState } from 'react';
import { format } from 'date-fns';
import { CheckCircle, AlertCircle, Eye, Download, FileIcon } from 'lucide-react';
import toast from 'react-hot-toast';

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
    onReviewSubmission, 
    onPreviewFile,
    onDownloadFile
}) => {
    console.log('MilestoneReview - milestone data:', milestone);
    console.log('MilestoneReview - submission history:', milestone.submissionHistory);
    
    const [feedbackComment, setFeedbackComment] = useState('');
    const [showFeedbackForm, setShowFeedbackForm] = useState(false);

    const handleRequestChanges = async () => {
        if (!feedbackComment.trim()) {
            toast.error('Please provide feedback for the changes needed');
            return;
        }

        try {
            await onReviewSubmission(contractId, milestoneId, "changes_requested", feedbackComment);
            setFeedbackComment('');
            setShowFeedbackForm(false);
            toast.success('Feedback sent successfully');
        } catch (error) {
            toast.error('Failed to send feedback');
        }
    };

    const handleDownload = (file) => {
        onDownloadFile(contractId, milestoneId, file);
    };

    return (
        <div className="mt-4 bg-gray-50 p-4 rounded-lg">
            <h5 className="font-medium text-gray-900 mb-2">Review Submission</h5>
            
            {/* Current Submission Details */}
            {milestone.currentSubmission && (
                <>
                    <p className="text-gray-600 mb-2">{milestone.currentSubmission.comments}</p>
                    <div className="flex flex-wrap gap-2">
                        {milestone.currentSubmission.files.map((file, index) => (
                            <div 
                                key={index}
                                className="flex items-center justify-between p-2 bg-white border rounded-lg w-full md:w-auto"
                            >
                                <div className="flex items-center space-x-2">
                                    <FileIcon className="w-4 h-4 text-gray-500" />
                                    <span className="text-sm text-gray-700 truncate max-w-[150px]">{file.filename}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <button
                                        onClick={() => onPreviewFile(file)}
                                        className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
                                    >
                                        <Eye className="w-4 h-4 mr-1" />
                                        Preview
                                    </button>
                                    <button
                                        onClick={() => handleDownload(file)}
                                        className="text-sm text-gray-600 hover:text-gray-800 flex items-center"
                                    >
                                        <Download className="w-4 h-4 mr-1" />
                                        Download
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Review Actions */}
                    <div className="flex items-center space-x-3 mt-4">
                        <button
                            onClick={() => onReviewSubmission(contractId, milestoneId, "approved")}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center"
                        >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Approve Work
                        </button>
                        <button
                            onClick={() => setShowFeedbackForm(true)}
                            className="px-4 py-2 bg-yellow-100 text-yellow-800 rounded-lg hover:bg-yellow-200 flex items-center"
                        >
                            <AlertCircle className="w-4 h-4 mr-2" />
                            Request Changes
                        </button>
                    </div>

                    {/* Feedback Form */}
                    {showFeedbackForm && (
                        <div className="mt-4 p-4 bg-white rounded-lg border">
                            <h5 className="font-medium text-gray-900 mb-2">Provide Feedback</h5>
                            <textarea
                                value={feedbackComment}
                                onChange={(e) => setFeedbackComment(e.target.value)}
                                placeholder="Describe what changes are needed..."
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                                rows="4"
                            />
                            <div className="flex justify-end space-x-3 mt-3">
                                <button
                                    onClick={() => {
                                        setShowFeedbackForm(false);
                                        setFeedbackComment('');
                                    }}
                                    className="px-3 py-2 text-gray-600 hover:text-gray-800"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleRequestChanges}
                                    className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
                                >
                                    Send Feedback
                                </button>
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* Submission History */}
            {milestone.submissionHistory && milestone.submissionHistory.length > 0 && (
                <div className="mt-6">
                    <h4 className="font-medium text-gray-900 mb-3">Previous Submissions</h4>
                    <div className="space-y-4">
                        {milestone.submissionHistory.map((submission, index) => (
                            <div key={index} className="p-4 bg-white rounded-lg border">
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
                                        {submission.status}
                                    </span>
                                </div>

                                {/* Submission Files */}
                                <div className="flex flex-wrap gap-2 mb-3">
                                    {submission.files.map((file, fileIndex) => (
                                        <div 
                                            key={fileIndex}
                                            className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                                        >
                                            <div className="flex items-center space-x-2">
                                                <FileIcon className="w-4 h-4 text-gray-500" />
                                                <span className="text-sm text-gray-700">{file.filename}</span>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <button
                                                    onClick={() => onPreviewFile(file)}
                                                    className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
                                                >
                                                    <Eye className="w-4 h-4 mr-1" />
                                                    Preview
                                                </button>
                                                <button
                                                    onClick={() => handleDownload(file)}
                                                    className="text-sm text-gray-600 hover:text-gray-800 flex items-center"
                                                >
                                                    <Download className="w-4 h-4 mr-1" />
                                                    Download
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Client Feedback */}
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
    );
};

export default MilestoneReview; 