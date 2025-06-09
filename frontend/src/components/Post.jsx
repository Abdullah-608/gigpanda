import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Calendar, Eye, Smile } from 'lucide-react';
import { usePostStore } from '../store/postStore';
import { useAuthStore } from '../store/authStore';
import EmojiPicker from 'emoji-picker-react';
import styles from './Post.module.css';

const Post = ({ post, index = 0 }) => {
    const [showComments, setShowComments] = useState(false);
    const [newComment, setNewComment] = useState('');
    const [isSubmittingComment, setIsSubmittingComment] = useState(false);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const emojiPickerRef = useRef(null);
    
    const { addReaction, addComment } = usePostStore();
    const { user } = useAuthStore();

    // Close emoji picker when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
                setShowEmojiPicker(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const formatTimeAgo = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);
        
        if (diffInSeconds < 60) return 'Just now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
        if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
        
        return date.toLocaleDateString();
    };

    const getPostTypeDisplay = (type) => {
        const types = {
            'general': 'General',
            'portfolio': 'Portfolio',
            'availability': 'Available for Work',
            'article': 'Article',
            'project-showcase': 'Project Showcase'
        };
        return types[type] || 'General';
    };

    const getPostTypeColor = (type) => {
        const colors = {
            'general': 'bg-gray-100 text-gray-800',
            'portfolio': 'bg-blue-100 text-blue-800',
            'availability': 'bg-green-100 text-green-800',
            'article': 'bg-purple-100 text-purple-800',
            'project-showcase': 'bg-yellow-100 text-yellow-800'
        };
        return colors[type] || 'bg-gray-100 text-gray-800';
    };

    const handleEmojiClick = async (emojiData) => {
        if (!user) return;
        
        try {
            await addReaction(post.id, emojiData.emoji);
            setShowEmojiPicker(false);
        } catch (error) {
            console.error('Failed to add reaction:', error);
        }
    };

    const handleAddComment = async (e) => {
        e.preventDefault();
        if (!user || !newComment.trim()) return;
        
        setIsSubmittingComment(true);
        try {
            await addComment(post.id, newComment.trim());
            setNewComment('');
        } catch (error) {
            console.error('Failed to add comment:', error);
        } finally {
            setIsSubmittingComment(false);
        }
    };

    const getAuthorInitials = (name) => {
        return name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U';
    };

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={styles.postContainer}
        >
            {/* Post Header */}
            <div className={styles.header}>
                <div className={styles.avatarContainer}>
                    {post.author.avatar ? (
                        <img 
                            src={post.author.avatar} 
                            alt={post.author.name}
                            className={styles.avatar}
                        />
                    ) : (
                        <div className={styles.avatarFallback}>
                            {getAuthorInitials(post.author.name)}
                        </div>
                    )}
                </div>
                <div className={styles.contentContainer}>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-900">
                                {post.author.name}
                                {post.postType !== 'general' && (
                                    <span className="text-sm font-normal text-gray-500 ml-1">
                                        • {getPostTypeDisplay(post.postType)}
                                    </span>
                                )}
                            </p>
                            <div className="flex items-center space-x-2 text-xs text-gray-500">
                                <span>{post.author.role}</span>
                                <span>•</span>
                                <span className="flex items-center">
                                    <Calendar className="h-3 w-3 mr-1" />
                                    {formatTimeAgo(post.createdAt)}
                                </span>
                                {post.views > 0 && (
                                    <>
                                        <span>•</span>
                                        <span className="flex items-center">
                                            <Eye className="h-3 w-3 mr-1" />
                                            {post.views} views
                                        </span>
                                    </>
                                )}
                            </div>
                        </div>
                        <div className="flex items-center space-x-2">
                            <span className={`text-xs px-2 py-1 rounded-full ${getPostTypeColor(post.postType)}`}>
                                {getPostTypeDisplay(post.postType)}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Post Content */}
            <div className={styles.postContent}>
                <p className={styles.postText}>{post.content}</p>
            </div>

            {/* Images */}
            {post.images && post.images.length > 0 && (
                <div className={styles.imageContainer}>
                    {post.images.length === 1 ? (
                        <img 
                            src={post.images[0].data} 
                            alt={post.images[0].alt || 'Post image'}
                            className={styles.singleImage}
                        />
                    ) : (
                        <div className={styles.imageGrid}>
                            {post.images.slice(0, 4).map((image, idx) => (
                                <div key={idx} className={styles.imageGridItem}>
                                    <img 
                                        src={image.data} 
                                        alt={image.alt || `Post image ${idx + 1}`}
                                        className={styles.gridImage}
                                    />
                                    {idx === 3 && post.images.length > 4 && (
                                        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-md">
                                            <span className="text-white font-medium">
                                                +{post.images.length - 4} more
                                            </span>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
                <div className={styles.tagsContainer}>
                    {post.tags.map((tag, idx) => (
                        <span key={idx} className={styles.tag}>
                            #{tag}
                        </span>
                    ))}
                </div>
            )}

            {/* Availability Banner */}
            {post.isAvailableForWork && (
                <div className="mb-3 p-2 bg-green-50 border border-green-200 rounded-md">
                    <p className="text-sm text-green-800 font-medium">
                        🟢 Available for new projects
                    </p>
                </div>
            )}

            {/* Action Buttons */}
            <div className={styles.actionsContainer}>
                <div className={styles.actionButtons}>
                    <div className="relative" ref={emojiPickerRef}>
                        <button
                            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                            className={styles.emojiButton}
                        >
                            <Smile className="h-4 w-4" />
                            <span>React</span>
                        </button>
                        {showEmojiPicker && (
                            <div className={styles.emojiPickerContainer}>
                                <EmojiPicker
                                    onEmojiClick={handleEmojiClick}
                                    disableAutoFocus={true}
                                    searchPlaceholder="Search emojis..."
                                    preload={true}
                                />
                            </div>
                        )}
                    </div>
                    {post.reactions && post.reactions.length > 0 && (
                        <div className={styles.emojiList}>
                            {Object.entries(
                                post.reactions.reduce((acc, reaction) => {
                                    acc[reaction.emoji] = (acc[reaction.emoji] || 0) + 1;
                                    return acc;
                                }, {})
                            ).map(([emoji, count]) => (
                                <div
                                    key={emoji}
                                    className={`${styles.emojiReaction} ${
                                        post.reactions.some(r => r.emoji === emoji && r.userId === user?._id)
                                            ? styles.emojiReactionActive
                                            : ''
                                    }`}
                                >
                                    <span>{emoji}</span>
                                    <span>{count}</span>
                                </div>
                            ))}
                        </div>
                    )}
                    <button
                        onClick={() => setShowComments(!showComments)}
                        className={styles.actionButton}
                    >
                        <MessageSquare className="h-4 w-4" />
                        <span>{post.commentCount}</span>
                    </button>
                </div>
            </div>

            {/* Comments Section */}
            {showComments && (
                <div className={styles.commentsContainer}>
                    {/* Existing Comments */}
                    {post.comments && post.comments.length > 0 && (
                        <div className={styles.commentsList}>
                            {post.comments.map((comment) => (
                                <div key={comment.id} className={styles.commentItem}>
                                    <div className={styles.avatarContainer}>
                                        {comment.author.avatar ? (
                                            <img 
                                                src={comment.author.avatar} 
                                                alt={comment.author.name}
                                                className={styles.commentAvatar}
                                            />
                                        ) : (
                                            <div className={styles.commentAvatarFallback}>
                                                {getAuthorInitials(comment.author.name)}
                                            </div>
                                        )}
                                    </div>
                                    <div className={styles.commentContent}>
                                        <div className={styles.commentBubble}>
                                            <p className={styles.commentAuthor}>{comment.author.name}</p>
                                            <p className={styles.commentText}>{comment.content}</p>
                                        </div>
                                        <p className={styles.commentTime}>{formatTimeAgo(comment.createdAt)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Add Comment Form */}
                    {user && (
                        <form onSubmit={handleAddComment} className={styles.commentForm}>
                            <div className={styles.avatarContainer}>
                                {user.profile?.pictureUrl ? (
                                    <img 
                                        src={user.profile.pictureUrl} 
                                        alt={user.name}
                                        className={styles.commentAvatar}
                                    />
                                ) : (
                                    <div className={styles.commentAvatarFallback}>
                                        {getAuthorInitials(user.name)}
                                    </div>
                                )}
                            </div>
                            <div className="flex-1">
                                <input
                                    type="text"
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    placeholder="Write a comment..."
                                    className={styles.commentInput}
                                    disabled={isSubmittingComment}
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={!newComment.trim() || isSubmittingComment}
                                className={styles.commentSubmitButton}
                            >
                                {isSubmittingComment ? 'Posting...' : 'Post'}
                            </button>
                        </form>
                    )}
                </div>
            )}
        </motion.div>
    );
};

export default Post; 