import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Trash2 } from "lucide-react";
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
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black bg-opacity-50"
                        onClick={handleClose}
                    />
                        <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto"
                    >
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold text-gray-900">Post a New Job</h2>
                                <button
                                    onClick={handleClose}
                                    className="text-gray-400 hover:text-gray-500"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Job Title */}
                                <div>
                                    <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                                        Job Title
                                    </label>
                                    <input
                                        type="text"
                                        id="title"
                                        value={formData.title}
                                        onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                                        placeholder="e.g., Full Stack Developer Needed for E-commerce Project"
                                    />
                                </div>

                                {/* Job Description */}
                                <div>
                                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                                        Job Description
                                    </label>
                                    <textarea
                                        id="description"
                                        value={formData.description}
                                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                        rows={4}
                                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                                        placeholder="Describe the job requirements, responsibilities, and expectations..."
                                    />
                                </div>

                                {/* Category */}
                                    <div>
                                    <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                                        Category
                                        </label>
                                        <select
                                        id="category"
                                            value={formData.category}
                                            onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                                        >
                                            <option value="">Select a category</option>
                                        {categories.map(category => (
                                            <option key={category.value} value={category.value}>
                                                {category.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                {/* Skills Required */}
                                    <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Required Skills (max 10)
                                        </label>
                                    <div className="mt-2 flex flex-wrap gap-2">
                                        {formData.skillsRequired.map((skill, index) => (
                                            <span
                                                key={index}
                                                className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800"
                                            >
                                                {skill}
                                                <button
                                                    type="button"
                                                    onClick={() => removeSkill(skill)}
                                                    className="ml-2 text-green-600 hover:text-green-700"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                    <div className="mt-2 flex">
                                        <input
                                            type="text"
                                            value={newSkill}
                                            onChange={(e) => setNewSkill(e.target.value)}
                                            className="flex-1 rounded-l-md border border-gray-300 px-3 py-2 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                                            placeholder="Add a required skill"
                                        />
                                        <button
                                            type="button"
                                            onClick={addSkill}
                                            disabled={formData.skillsRequired.length >= 10}
                                            className="inline-flex items-center px-4 py-2 border border-l-0 border-gray-300 rounded-r-md bg-gray-50 text-gray-700 hover:bg-gray-100"
                                        >
                                            <Plus className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>

                                {/* Budget */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Budget Range (USD)
                                    </label>
                                    <div className="mt-1 grid grid-cols-2 gap-4">
                                        <div>
                                            <input
                                                type="number"
                                                value={formData.budget.min}
                                                onChange={(e) => setFormData(prev => ({ 
                                                    ...prev, 
                                                    budget: { ...prev.budget, min: e.target.value }
                                                }))}
                                                className="block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                                                placeholder="Min"
                                            />
                                        </div>
                                        <div>
                                            <input
                                                type="number"
                                                value={formData.budget.max}
                                                onChange={(e) => setFormData(prev => ({ 
                                                    ...prev, 
                                                    budget: { ...prev.budget, max: e.target.value }
                                                }))}
                                                className="block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                                                placeholder="Max"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Budget Type */}
                                        <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Budget Type
                                    </label>
                                    <div className="mt-2 space-x-4">
                                        <label className="inline-flex items-center">
                                            <input
                                                type="radio"
                                                value="fixed"
                                                checked={formData.budgetType === "fixed"}
                                                onChange={(e) => setFormData(prev => ({ ...prev, budgetType: e.target.value }))}
                                                className="form-radio text-green-600"
                                            />
                                            <span className="ml-2">Fixed Price</span>
                                        </label>
                                        <label className="inline-flex items-center">
                                            <input
                                                type="radio"
                                                value="hourly"
                                                checked={formData.budgetType === "hourly"}
                                                onChange={(e) => setFormData(prev => ({ ...prev, budgetType: e.target.value }))}
                                                className="form-radio text-green-600"
                                            />
                                            <span className="ml-2">Hourly Rate</span>
                                        </label>
                                    </div>
                                </div>

                                {/* Timeline */}
                                    <div>
                                    <label htmlFor="timeline" className="block text-sm font-medium text-gray-700">
                                        Project Timeline
                                        </label>
                                        <select
                                        id="timeline"
                                            value={formData.timeline}
                                            onChange={(e) => setFormData(prev => ({ ...prev, timeline: e.target.value }))}
                                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                                        >
                                            <option value="">Select timeline</option>
                                        {timelines.map(timeline => (
                                                <option key={timeline.value} value={timeline.value}>
                                                    {timeline.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                {/* Experience Level */}
                                    <div>
                                    <label htmlFor="experienceLevel" className="block text-sm font-medium text-gray-700">
                                        Required Experience Level
                                        </label>
                                        <select
                                        id="experienceLevel"
                                        value={formData.experienceLevel}
                                        onChange={(e) => setFormData(prev => ({ ...prev, experienceLevel: e.target.value }))}
                                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                                    >
                                        <option value="">Select experience level</option>
                                        {experienceLevels.map(level => (
                                            <option key={level.value} value={level.value}>
                                                {level.label}
                                                </option>
                                            ))}
                                        </select>
                                </div>

                                {/* Location */}
                                <div>
                                    <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                                        Location Type
                                    </label>
                                    <select
                                        id="location"
                                        value={formData.location}
                                        onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                                    >
                                        {locations.map(location => (
                                            <option key={location.value} value={location.value}>
                                                {location.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Submit Button */}
                                <div className="flex justify-end space-x-3">
                                    <button
                                        type="button"
                                        onClick={handleClose}
                                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isCreatingJob}
                                        className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50"
                                    >
                                        {isCreatingJob ? "Posting..." : "Post Job"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default CreateJobModal; 