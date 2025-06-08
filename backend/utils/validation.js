export const validateJobInput = (jobData) => {
    const errors = {};

    // Required fields
    const requiredFields = ['title', 'description', 'category', 'budget', 'budgetType', 'timeline', 'experienceLevel'];
    
    requiredFields.forEach(field => {
        if (!jobData[field]) {
            errors[field] = `${field} is required`;
        }
    });

    // Budget validation
    if (jobData.budget) {
        if (!jobData.budget.min || !jobData.budget.max) {
            errors.budget = 'Both minimum and maximum budget are required';
        } else if (jobData.budget.min < 0 || jobData.budget.max < 0) {
            errors.budget = 'Budget values cannot be negative';
        } else if (jobData.budget.min > jobData.budget.max) {
            errors.budget = 'Minimum budget cannot be greater than maximum budget';
        }
    }

    // Budget type validation
    if (jobData.budgetType && !['fixed', 'hourly'].includes(jobData.budgetType)) {
        errors.budgetType = 'Budget type must be either fixed or hourly';
    }

    // Experience level validation
    if (jobData.experienceLevel && !['beginner', 'intermediate', 'expert'].includes(jobData.experienceLevel)) {
        errors.experienceLevel = 'Invalid experience level';
    }

    // Timeline validation
    if (jobData.timeline && !['urgent', '1-week', '2-weeks', '1-month', '2-months', '3+ months'].includes(jobData.timeline)) {
        errors.timeline = 'Invalid timeline';
    }

    // Category validation
    const validCategories = [
        'web-development',
        'mobile-development',
        'ui-ux-design',
        'graphic-design',
        'content-writing',
        'digital-marketing',
        'data-analysis',
        'video-editing',
        'translation',
        'virtual-assistant',
        'other'
    ];
    
    if (jobData.category && !validCategories.includes(jobData.category)) {
        errors.category = 'Invalid category';
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors
    };
}; 