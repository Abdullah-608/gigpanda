import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Briefcase, DollarSign, Clock, Users, MapPin, Plus, Trash2 } from "lucide-react";
import { useJobStore } from "../store/jobStore";
import toast from "react-hot-toast";

const CreateJobModal = ({ isOpen, onClose }) => {
    const { createJob, isCreatingJob } = useJobStore();
    
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        category: "",
        skillsRequired: [],
        budget: {
            min: "",
            max: "",
            currency: "USD"
        },
        budgetType: "fixed",
        timeline: "",
        experienceLevel: "",
        location: "remote"
    });
    
    const [newSkill, setNewSkill] = useState("");

    const categories = [
        { value: "web-development", label: "Web Development" },
        { value: "mobile-development", label: "Mobile Development" },
        { value: "ui-ux-design", label: "UI/UX Design" },
        { value: "graphic-design", label: "Graphic Design" },
        { value: "content-writing", label: "Content Writing" },
        { value: "digital-marketing", label: "Digital Marketing" },
        { value: "data-analysis", label: "Data Analysis" },
        { value: "video-editing", label: "Video Editing" },
        { value: "translation", label: "Translation" },
        { value: "virtual-assistant", label: "Virtual Assistant" },
        { value: "other", label: "Other" }
    ];

    const timelines = [
        { value: "urgent", label: "Urgent (less than 1 week)" },
        { value: "1-week", label: "1 Week" },
        { value: "2-weeks", label: "2 Weeks" },
        { value: "1-month", label: "1 Month" },
        { value: "2-months", label: "2 Months" },
        { value: "3+ months", label: "3+ Months" }
    ];

    const experienceLevels = [
        { value: "beginner", label: "Beginner" },
        { value: "intermediate", label: "Intermediate" },
        { value: "expert", label: "Expert" }
    ];

    const locations = [
        { value: "remote", label: "Remote" },
        { value: "on-site", label: "On-site" },
        { value: "hybrid", label: "Hybrid" }
    ];

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validation
        if (!formData.title.trim()) {
            toast.error("Job title is required");
            return;
        }

        if (!formData.description.trim()) {
            toast.error("Job description is required");
            return;
        }

        if (!formData.category) {
            toast.error("Please select a category");
            return;
        }

        if (!formData.budget.min || !formData.budget.max) {
            toast.error("Please specify budget range");
            return;
        }

        if (parseFloat(formData.budget.min) >= parseFloat(formData.budget.max)) {
            toast.error("Maximum budget must be greater than minimum budget");
            return;
        }

        if (!formData.timeline) {
            toast.error("Please select a timeline");
            return;
        }

        if (!formData.experienceLevel) {
            toast.error("Please select required experience level");
            return;
        }

        try {
            const jobData = {
                ...formData,
                budget: {
                    min: parseFloat(formData.budget.min),
                    max: parseFloat(formData.budget.max),
                    currency: formData.budget.currency
                }
            };

            await createJob(jobData);
            toast.success("Job posted successfully!");
            handleClose();
        } catch (error) {
            toast.error(error.message || "Failed to post job");
        }
    };

    const handleClose = () => {
        setFormData({
            title: "",
            description: "",
            category: "",
            skillsRequired: [],
            budget: {
                min: "",
                max: "",
                currency: "USD"
            },
            budgetType: "fixed",
            timeline: "",
            experienceLevel: "",
            location: "remote"
        });
        setNewSkill("");
        onClose();
    };

    const addSkill = (e) => {
        e.preventDefault();
        if (newSkill.trim() && !formData.skillsRequired.includes(newSkill.trim()) && formData.skillsRequired.length < 10) {
            setFormData(prev => ({
                ...prev,
                skillsRequired: [...prev.skillsRequired, newSkill.trim()]
            }));
            setNewSkill("");
        }
    };

    const removeSkill = (skillToRemove) => {
        setFormData(prev => ({
            ...prev,
            skillsRequired: prev.skillsRequired.filter(skill => skill !== skillToRemove)
        }));
    };

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
                            className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between p-6 border-b border-gray-200">
                                <h2 className="text-xl font-bold text-gray-900 flex items-center">
                                    <Briefcase className="h-6 w-6 mr-2 text-green-600" />
                                    Post a New Job
                                </h2>
                                <button
                                    onClick={handleClose}
                                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    <X className="h-5 w-5 text-gray-500" />
                                </button>
                            </div>

                            {/* Content */}
                            <form onSubmit={handleSubmit} className="p-6 space-y-6">
                                {/* Job Title */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Job Title <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.title}
                                        onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                        placeholder="e.g., Full-Stack Developer for E-commerce Platform"
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                        maxLength={100}
                                        required
                                    />
                                </div>

                                {/* Job Description */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Job Description <span className="text-red-500">*</span>
                                    </label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                        placeholder="Describe the project requirements, deliverables, and what you're looking for in a freelancer..."
                                        className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                                        maxLength={3000}
                                        required
                                    />
                                    <div className="mt-1 text-right text-xs text-gray-500">
                                        {formData.description.length}/3000
                                    </div>
                                </div>

                                {/* Category and Experience Level */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Category <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            value={formData.category}
                                            onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                            required
                                        >
                                            <option value="">Select a category</option>
                                            {categories.map((cat) => (
                                                <option key={cat.value} value={cat.value}>
                                                    {cat.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Experience Level <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            value={formData.experienceLevel}
                                            onChange={(e) => setFormData(prev => ({ ...prev, experienceLevel: e.target.value }))}
                                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                            required
                                        >
                                            <option value="">Select experience level</option>
                                            {experienceLevels.map((level) => (
                                                <option key={level.value} value={level.value}>
                                                    {level.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {/* Budget */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Budget <span className="text-red-500">*</span>
                                    </label>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-xs text-gray-500 mb-1">Minimum ($)</label>
                                            <input
                                                type="number"
                                                value={formData.budget.min}
                                                onChange={(e) => setFormData(prev => ({ 
                                                    ...prev, 
                                                    budget: { ...prev.budget, min: e.target.value }
                                                }))}
                                                placeholder="500"
                                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                                min="0"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs text-gray-500 mb-1">Maximum ($)</label>
                                            <input
                                                type="number"
                                                value={formData.budget.max}
                                                onChange={(e) => setFormData(prev => ({ 
                                                    ...prev, 
                                                    budget: { ...prev.budget, max: e.target.value }
                                                }))}
                                                placeholder="2000"
                                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                                min="0"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs text-gray-500 mb-1">Budget Type</label>
                                            <select
                                                value={formData.budgetType}
                                                onChange={(e) => setFormData(prev => ({ ...prev, budgetType: e.target.value }))}
                                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                            >
                                                <option value="fixed">Fixed Price</option>
                                                <option value="hourly">Hourly Rate</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                {/* Timeline and Location */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Timeline <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            value={formData.timeline}
                                            onChange={(e) => setFormData(prev => ({ ...prev, timeline: e.target.value }))}
                                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                            required
                                        >
                                            <option value="">Select timeline</option>
                                            {timelines.map((timeline) => (
                                                <option key={timeline.value} value={timeline.value}>
                                                    {timeline.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Work Type
                                        </label>
                                        <select
                                            value={formData.location}
                                            onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                        >
                                            {locations.map((location) => (
                                                <option key={location.value} value={location.value}>
                                                    {location.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {/* Skills Required */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Skills Required (Max 10)
                                    </label>
                                    <div className="flex flex-wrap gap-2 mb-3">
                                        {formData.skillsRequired.map((skill, index) => (
                                            <span
                                                key={index}
                                                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"
                                            >
                                                {skill}
                                                <button
                                                    type="button"
                                                    onClick={() => removeSkill(skill)}
                                                    className="ml-1 hover:text-green-600"
                                                >
                                                    <X className="h-3 w-3" />
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                    {formData.skillsRequired.length < 10 && (
                                        <div className="flex space-x-2">
                                            <input
                                                type="text"
                                                value={newSkill}
                                                onChange={(e) => setNewSkill(e.target.value)}
                                                onKeyPress={(e) => e.key === 'Enter' && addSkill(e)}
                                                placeholder="Add a skill (e.g., React, Python, Figma)"
                                                className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                                maxLength={50}
                                            />
                                            <button
                                                type="button"
                                                onClick={addSkill}
                                                className="px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                                            >
                                                <Plus className="h-4 w-4" />
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {/* Submit Buttons */}
                                <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
                                    <button
                                        type="button"
                                        onClick={handleClose}
                                        className="px-6 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isCreatingJob}
                                        className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                                    >
                                        {isCreatingJob ? (
                                            <>
                                                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                <span>Posting...</span>
                                            </>
                                        ) : (
                                            <>
                                                <Briefcase className="h-4 w-4" />
                                                <span>Post Job</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default CreateJobModal; 