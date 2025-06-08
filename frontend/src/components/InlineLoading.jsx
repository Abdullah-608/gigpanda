import { Loader } from 'lucide-react';

const InlineLoading = ({ 
    text = "Loading...", 
    size = "small", 
    textColor = "text-gray-600",
    spinnerColor = "text-green-600",
    className = ""
}) => {
    const spinnerSize = {
        small: "w-4 h-4",
        medium: "w-6 h-6",
        large: "w-8 h-8"
    };

    return (
        <div className={`flex items-center ${className}`}>
            <Loader className={`${spinnerSize[size]} mr-2 animate-spin ${spinnerColor}`} />
            <span className={`${textColor}`}>{text}</span>
        </div>
    );
};

export default InlineLoading; 