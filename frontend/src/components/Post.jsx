import { useState } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Heart, Calendar, Eye } from 'lucide-react';
import { usePostStore } from '../store/postStore';
import { useAuthStore } from '../store/authStore';

const Post = ({ post, index = 0 }) => {
    const [showComments, setShowComments] = useState(false);
    const [newComment, setNewComment] = useState('');
    const [isSubmittingComment, setIsSubmittingComment] = useState(false);
    
    const { toggleLike, addComment } = usePostStore();
    const { user } = useAuthStore();

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

    const handleLike = async () => {
        if (!user) {
            return;
        }
        try {
            await toggleLike(post.id);
        } catch (error) {
            console.error('Failed to toggle like:', error);
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
            className="bg-white border border-gray-100 rounded-lg hover:shadow-md transition-shadow p-4 mb-4"
        >
            {/* Post Header */}
            <div className="flex items-start space-x-3 mb-3">
                <div className="flex-shrink-0">
                    {post.author.avatar ? (
                        <img 
                            src={post.author.avatar} 
                            alt={post.author.name}
                            className="h-12 w-12 rounded-full object-cover"
                        />
                    ) : (
                        <div className="h-12 w-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                            {getAuthorInitials(post.author.name)}
                        </div>
                    )}
                </div>
                <div className="flex-1 min-w-0">
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
            <div className="mb-3">
                <p className="text-gray-800 whitespace-pre-wrap">{post.content}</p>
            </div>

            {/* Images */}
            {post.images && post.images.length > 0 && (
                <div className="mb-3">
                    {post.images.length === 1 ? (
                        <img 
                            src={post.images[0].data} 
                            alt={post.images[0].alt || 'Post image'}
                            className="w-full max-h-96 object-cover rounded-md"
                        />
                    ) : (
                        <div className="grid grid-cols-2 gap-2">
                            {post.images.slice(0, 4).map((image, idx) => (
                                <div key={idx} className="relative">
                                    <img 
                                        src={image.data} 
                                        alt={image.alt || `Post image ${idx + 1}`}
                                        className="w-full h-48 object-cover rounded-md"
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
                <div className="mb-3 flex flex-wrap gap-1">
                    {post.tags.map((tag, idx) => (
                        <span key={idx} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
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
            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <div className="flex items-center space-x-4">
                    <button
                        onClick={handleLike}
                        className={`flex items-center space-x-1 text-sm transition-colors ${
                            post.isLiked 
                                ? 'text-red-600 hover:text-red-700' 
                                : 'text-gray-500 hover:text-red-600'
                        }`}
                    >
                        <Heart className={`h-4 w-4 ${post.isLiked ? 'fill-current' : ''}`} />
                        <span>{post.likeCount}</span>
                    </button>
                    <button
                        onClick={() => setShowComments(!showComments)}
                        className="flex items-center space-x-1 text-sm text-gray-500 hover:text-blue-600 transition-colors"
                    >
                        <MessageSquare className="h-4 w-4" />
                        <span>{post.commentCount}</span>
                    </button>
                </div>
            </div>

            {/* Comments Section */}
            {showComments && (
                <div className="mt-4 pt-3 border-t border-gray-100">
                    {/* Existing Comments */}
                    {post.comments && post.comments.length > 0 && (
                        <div className="space-y-3 mb-4">
                            {post.comments.map((comment) => (
                                <div key={comment.id} className="flex space-x-2">
                                    <div className="flex-shrink-0">
                                        {comment.author.avatar ? (
                                            <img 
                                                src={comment.author.avatar} 
                                                alt={comment.author.name}
                                                className="h-8 w-8 rounded-full object-cover"
                                            />
                                        ) : (
                                            <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center text-xs text-white font-medium">
                                                {getAuthorInitials(comment.author.name)}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <div className="bg-gray-50 rounded-lg px-3 py-2">
                                            <p className="text-xs font-medium text-gray-900">{comment.author.name}</p>
                                            <p className="text-sm text-gray-800">{comment.content}</p>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1">{formatTimeAgo(comment.createdAt)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Add Comment Form */}
                    {user && (
                        <form onSubmit={handleAddComment} className="flex space-x-2">
                            <div className="flex-shrink-0">
                                {user.profile?.pictureUrl ? (
                                    <img 
                                        src={user.profile.pictureUrl} 
                                        alt={user.name}
                                        className="h-8 w-8 rounded-full object-cover"
                                    />
                                ) : (
                                    <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center text-xs text-white font-medium">
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
                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    disabled={isSubmittingComment}
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={!newComment.trim() || isSubmittingComment}
                                className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
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