import { useState, useEffect } from "react";
import { useBookmarkStore } from "../store/bookmarkStore";
import { motion } from "framer-motion";
import { Loader, BookmarkIcon, User, DollarSign, Clock, Briefcase } from "lucide-react";
import styles from "./FreelancerDashboardPage.module.css";

const BookmarksPage = () => {
  const { 
    bookmarks, 
    isLoading, 
    error, 
    fetchBookmarks, 
    removeBookmark 
  } = useBookmarkStore();

  useEffect(() => {
    fetchBookmarks();
  }, [fetchBookmarks]);

  const formatBudget = (budget, budgetType) => {
    if (budgetType === 'hourly') {
      return `$${budget.min} - $${budget.max}/hr`;
    } else {
      return `$${budget.min} - $${budget.max}`;
    }
  };

  const getTimeAgo = (date) => {
    const now = new Date();
    const posted = new Date(date);
    const diffInHours = Math.floor((now - posted) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours === 1) return '1 hour ago';
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return '1 day ago';
    return `${diffInDays} days ago`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Bookmarked Jobs</h1>
      </div>

      {isLoading && bookmarks.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16">
          <Loader className="h-10 w-10 animate-spin text-green-500 mb-4" />
          <p className="text-gray-500">Loading your bookmarked jobs...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6">
          <p>{error}</p>
          <button 
            onClick={() => fetchBookmarks()}
            className="mt-2 text-sm font-medium text-red-700 hover:text-red-800"
          >
            Try again
          </button>
        </div>
      )}

      {!isLoading && !error && bookmarks.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <BookmarkIcon className="h-16 w-16 mx-auto text-gray-400 mb-4" />
          <h2 className="text-xl font-semibold text-gray-700 mb-2">No bookmarked jobs yet</h2>
          <p className="text-gray-500 mb-6">Jobs you bookmark will appear here for easy access.</p>
          <button 
            onClick={() => window.history.back()}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
          >
            Browse Jobs
          </button>
        </div>
      )}

      {bookmarks.length > 0 && (
        <div className="grid grid-cols-1 gap-6">
          {bookmarks.map((job, index) => (
            <motion.div
              key={job._id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 * index }}
              className={styles.jobCard}
            >
              <div className={styles.jobHeader}>
                <div className={styles.jobContent}>
                  <h3 className={styles.jobTitle}>{job.title}</h3>
                  <div className={styles.jobMeta}>
                    <span className={styles.jobMetaItem}>
                      <User className={styles.jobMetaIcon} />
                      {job.client?.name || 'Anonymous Client'}
                    </span>
                    <span className={styles.jobMetaItem}>
                      <DollarSign className={styles.jobMetaIcon} />
                      {formatBudget(job.budget, job.budgetType)}
                    </span>
                    <span className={styles.jobMetaItem}>
                      <Clock className={styles.jobMetaIcon} />
                      {job.timeline}
                    </span>
                  </div>

                  <p className={styles.jobDescription}>
                    {job.description}
                  </p>

                  <div className={styles.skillsList}>
                    {job.skillsRequired?.map((skill, skillIndex) => (
                      <span
                        key={skillIndex}
                        className={styles.skillTag}
                      >
                        {skill}
                      </span>
                    ))}
                  </div>

                  <div className={styles.jobDetails}>
                    <span className={styles.jobDetailTag}>
                      {job.category.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </span>
                    <span className={styles.jobDetailTag}>
                      {job.experienceLevel.charAt(0).toUpperCase() + job.experienceLevel.slice(1)}
                    </span>
                    <span className={styles.jobDetailTag}>
                      {job.location.charAt(0).toUpperCase() + job.location.slice(1)}
                    </span>
                  </div>

                  <div className={styles.jobFooter}>
                    <div className={styles.jobStats}>
                      <span>{getTimeAgo(job.createdAt)}</span>
                      <span>{job.proposalCount || 0} proposals</span>
                      <span className="text-green-600 font-medium">Bookmarked {getTimeAgo(job.bookmarked_at)}</span>
                    </div>
                    <div className={styles.jobActions}>
                      <button 
                        onClick={() => removeBookmark(job._id)}
                        className={`${styles.bookmarkButton} text-green-600`}
                        title="Remove bookmark"
                      >
                        <BookmarkIcon className="h-4 w-4 fill-current" />
                      </button>
                      <button 
                        onClick={() => {/* Handle apply */}}
                        className={styles.proposalButton}
                      >
                        Send Proposal
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BookmarksPage;