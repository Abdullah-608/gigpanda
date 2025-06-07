import { X } from "lucide-react";

const FileUploadProgress = ({ files, progress, onRemove }) => {
    return (
        <div className="space-y-2">
            {files.map((file, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center">
                            <span className="text-sm font-medium text-gray-700 truncate max-w-[200px]">
                                {file.name}
                            </span>
                            <span className="ml-2 text-xs text-gray-500">
                                {(file.size / 1024 / 1024).toFixed(2)} MB
                            </span>
                        </div>
                        {onRemove && (
                            <button
                                onClick={() => onRemove(index)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                    
                    {/* Progress Bar */}
                    {progress && progress[index] !== undefined && (
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                            <div
                                className="bg-green-600 h-1.5 rounded-full transition-all duration-300"
                                style={{ width: `${progress[index]}%` }}
                            />
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};

export default FileUploadProgress; 