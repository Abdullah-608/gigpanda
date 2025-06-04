import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Image as ImageIcon, Hash, Briefcase, FileText, Award, Eye, Loader, Plus, Trash2 } from "lucide-react";
import { usePostStore } from "../store/postStore";
import toast from "react-hot-toast";

// Helper function to convert file to base64
const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = (error) => reject(error);
    });
};

const CreatePostModal = ({ isOpen, onClose }) => {
    const { createPost, isCreatingPost } = usePostStore();
    
    const [formData, setFormData] = useState({
        content: "",
        postType: "general",
        tags: [],
        images: [],
        isAvailableForWork: false
    });
    
    const [newTag, setNewTag] = useState("");
    const [newImageUrl, setNewImageUrl] = useState("");
    const [newImageCaption, setNewImageCaption] = useState("");
    const [isProcessingImage, setIsProcessingImage] = useState(false);

    const postTypes = [
        { value: "general", label: "General", icon: FileText, color: "bg-gray-100 text-gray-700" },
        { value: "portfolio", label: "Portfolio", icon: Award, color: "bg-purple-100 text-purple-700" },
        { value: "availability", label: "Available for Work", icon: Briefcase, color: "bg-green-100 text-green-700" },
        { value: "article", label: "Article", icon: FileText, color: "bg-blue-100 text-blue-700" },
        { value: "project-showcase", label: "Project Showcase", icon: Eye, color: "bg-orange-100 text-orange-700" }
    ];

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.content.trim()) {
            toast.error("Content is required");
            return;
        }

        if (formData.content.length > 2000) {
            toast.error("Content must be less than 2000 characters");
            return;
        }

        try {
            await createPost(formData);
            toast.success("Post created successfully!");
            handleClose();
        } catch (error) {
            toast.error(error.message || "Failed to create post");
        }
    };

    const handleClose = () => {
        setFormData({
            content: "",
            postType: "general",
            tags: [],
            images: [],
            isAvailableForWork: false
        });
        setNewTag("");
        setNewImageUrl("");
        setNewImageCaption("");
        onClose();
    };

    const addTag = (e) => {
        e.preventDefault();
        if (newTag.trim() && !formData.tags.includes(newTag.trim().toLowerCase()) && formData.tags.length < 10) {
            setFormData(prev => ({
                ...prev,
                tags: [...prev.tags, newTag.trim().toLowerCase()]
            }));
            setNewTag("");
        }
    };

    const removeTag = (tagToRemove) => {
        setFormData(prev => ({
            ...prev,
            tags: prev.tags.filter(tag => tag !== tagToRemove)
        }));
    };

    const addImage = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0 || formData.images.length >= 5) return;
    
        setIsProcessingImage(true);
        
        try {
            for (const file of files) {
                if (formData.images.length >= 5) break;
                
                // Validate file type
                if (!file.type.startsWith('image/')) {
                    toast.error(`${file.name} is not an image file`);
                    continue;
                }
                
                // Validate file size (max 5MB)
                if (file.size > 5 * 1024 * 1024) {
                    toast.error(`${file.name} is too large (max 5MB)`);
                    continue;
                }
                
                // Convert to base64
                const base64 = await fileToBase64(file);
                
                setFormData(prev => ({
                    ...prev,
                    images: [...prev.images, {
                        data: base64,
                        filename: file.name,
                        mimetype: file.type,
                        size: file.size,
                        alt: "",
                        caption: newImageCaption.trim()
                    }]
                }));
            }
            setNewImageCaption("");
        } catch (error) {
            toast.error("Failed to process image");
        } finally {
            setIsProcessingImage(false);
        }
    };

    const removeImage = (indexToRemove) => {
        setFormData(prev => ({
            ...prev,
            images: prev.images.filter((_, index) => index !== indexToRemove)
        }));
    };

    const selectedPostType = postTypes.find(type => type.value === formData.postType);

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
                        onClick={handleClose}
                    >
                        {/* Modal */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between p-6 border-b border-gray-200">
                                <h2 className="text-xl font-bold text-gray-900">Create New Post</h2>
                                <button
                                    onClick={handleClose}
                                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    <X className="h-5 w-5 text-gray-500" />
                                </button>
                            </div>

                            {/* Content */}
                            <form onSubmit={handleSubmit} className="flex flex-col h-full">
                                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                                    {/* Post Type Selection */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-3">
                                            Post Type
                                        </label>
                                        <div className="grid grid-cols-2 gap-3">
                                            {postTypes.map((type) => {
                                                const Icon = type.icon;
                                                return (
                                                    <button
                                                        key={type.value}
                                                        type="button"
                                                        onClick={() => setFormData(prev => ({ ...prev, postType: type.value }))}
                                                        className={`p-3 rounded-lg border-2 transition-all ${
                                                            formData.postType === type.value
                                                                ? 'border-green-500 bg-green-50'
                                                                : 'border-gray-200 hover:border-gray-300'
                                                        }`}
                                                    >
                                                        <div className="flex items-center space-x-2">
                                                            <div className={`p-2 rounded-lg ${type.color}`}>
                                                                <Icon className="h-4 w-4" />
                                                            </div>
                                                            <span className="text-sm font-medium text-gray-900">
                                                                {type.label}
                                                            </span>
                                                        </div>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Content <span className="text-red-500">*</span>
                                        </label>
                                        <textarea
                                            value={formData.content}
                                            onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                                            placeholder="What's on your mind? Share your thoughts, projects, or availability..."
                                            className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                                            required
                                        />
                                        <div className="mt-1 text-right text-xs text-gray-500">
                                            {formData.content.length}/2000
                                        </div>
                                    </div>

                                    {/* Available for Work Toggle */}
                                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                        <div>
                                            <h3 className="text-sm font-medium text-gray-900">Available for Work</h3>
                                            <p className="text-xs text-gray-500">Let clients know you're available for new projects</p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setFormData(prev => ({ ...prev, isAvailableForWork: !prev.isAvailableForWork }))}
                                            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 ${
                                                formData.isAvailableForWork ? 'bg-green-600' : 'bg-gray-200'
                                            }`}
                                        >
                                            <span
                                                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                                    formData.isAvailableForWork ? 'translate-x-5' : 'translate-x-0'
                                                }`}
                                            />
                                        </button>
                                    </div>

                                    {/* Tags */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Tags (Max 10)
                                        </label>
                                        <div className="flex flex-wrap gap-2 mb-3">
                                            {formData.tags.map((tag, index) => (
                                                <span
                                                    key={index}
                                                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                                                >
                                                    #{tag}
                                                    <button
                                                        type="button"
                                                        onClick={() => removeTag(tag)}
                                                        className="ml-1 hover:text-blue-600"
                                                    >
                                                        <X className="h-3 w-3" />
                                                    </button>
                                                </span>
                                            ))}
                                        </div>
                                        {formData.tags.length < 10 && (
                                            <div className="flex space-x-2">
                                                <div className="flex-1 relative">
                                                    <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                                    <input
                                                        type="text"
                                                        value={newTag}
                                                        onChange={(e) => setNewTag(e.target.value)}
                                                        onKeyPress={(e) => e.key === 'Enter' && addTag(e)}
                                                        placeholder="Add a tag"
                                                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                                        maxLength={50}
                                                    />
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={addTag}
                                                    className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                                                >
                                                    <Plus className="h-4 w-4" />
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    {/* Images */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Images (Max 5)
                                        </label>
                                        {formData.images.length > 0 && (
                                            <div className="grid grid-cols-2 gap-3 mb-3">
                                                {formData.images.map((image, index) => (
                                                    <div key={index} className="relative border border-gray-200 rounded-lg overflow-hidden">
                                                        <img
    src={image.data}
    alt={image.alt || `Image ${index + 1}`}
    className="w-full h-24 object-cover"
/>
                                                        <button
                                                            type="button"
                                                            onClick={() => removeImage(index)}
                                                            className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                                                        >
                                                            <Trash2 className="h-3 w-3" />
                                                        </button>
                                                        {image.caption && (
                                                            <div className="p-2 bg-gray-50 text-xs text-gray-600 truncate">
                                                                {image.caption}
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                                                                {formData.images.length < 5 && (
                                            <div className="space-y-3">
                                                <div className="flex items-center justify-center w-full">
                                                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                                                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                            <ImageIcon className="w-8 h-8 mb-4 text-gray-500" />
                                                            <p className="mb-2 text-sm text-gray-500">
                                                                <span className="font-semibold">Click to upload</span> or drag and drop
                                                            </p>
                                                            <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB each</p>
                                                        </div>
                                                        <input
                                                            type="file"
                                                            className="hidden"
                                                            multiple
                                                            accept="image/*"
                                                            onChange={addImage}
                                                        />
                                                    </label>
                                                </div>
                                                
                                                <input
                                                    type="text"
                                                    value={newImageCaption}
                                                    onChange={(e) => setNewImageCaption(e.target.value)}
                                                    placeholder="Caption for next uploaded image (optional)"
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                                                    maxLength={100}
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Footer */}
                                <div className="p-6 border-t border-gray-200 bg-gray-50">
                                    <div className="flex items-center justify-between">
                                        <div className="text-sm text-gray-500">
                                            Creating as {selectedPostType?.label}
                                        </div>
                                        <div className="flex space-x-3">
                                            <button
                                                type="button"
                                                onClick={handleClose}
                                                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={isCreatingPost || !formData.content.trim()}
                                                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                                            >
                                                {isCreatingPost ? (
                                                    <>
                                                        <Loader className="h-4 w-4 animate-spin" />
                                                        <span>Creating...</span>
                                                    </>
                                                ) : (
                                                    <span>Create Post</span>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default CreatePostModal; 