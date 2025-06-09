import Post from "../models/post.model.js";
import User from '../models/user.model.js';
import mongoose from 'mongoose';
import { createNotification } from '../utils/notification.utils.js';

// Create a new post
export const createPost = async (req, res) => {
    try {
        const { content, postType, images, tags, isAvailableForWork } = req.body;
        const userId = req.user._id;

        // Validation
        if (!content || content.trim().length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Content is required'
            });
        }

        if (content.trim().length > 2000) {
            return res.status(400).json({
                success: false,
                message: 'Content must be less than 2000 characters'
            });
        }

        // Validate postType
        const validPostTypes = ['general', 'portfolio', 'availability', 'article', 'project-showcase'];
        if (postType && !validPostTypes.includes(postType)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid post type'
            });
        }

        // Process tags (remove duplicates, limit to 10, sanitize)
        let processedTags = [];
        if (tags && Array.isArray(tags)) {
            processedTags = [...new Set(tags
                .map(tag => tag.trim().toLowerCase())
                .filter(tag => tag.length > 0 && tag.length <= 50)
            )].slice(0, 10);
        }

        // Process images (validate base64 and file info)
        let processedImages = [];
        if (images && Array.isArray(images)) {
            processedImages = images
                .filter(img => {
                    // Validate required fields
                    if (!img.data || !img.filename || !img.mimetype || !img.size) {
                        return false;
                    }
                    
                    // Validate mime type (only allow common image formats)
                    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
                    if (!allowedTypes.includes(img.mimetype.toLowerCase())) {
                        return false;
                    }
                    
                    // Validate file size (max 5MB per image)
                    if (img.size > 5 * 1024 * 1024) {
                        return false;
                    }
                    
                    // Validate base64 format
                    if (!img.data.startsWith('data:image/')) {
                        return false;
                    }
                    
                    return true;
                })
                .slice(0, 5) // Limit to 5 images
                .map(img => ({
                    data: img.data,
                    filename: img.filename.trim(),
                    mimetype: img.mimetype.toLowerCase(),
                    size: img.size,
                    alt: img.alt ? img.alt.trim() : '',
                    caption: img.caption ? img.caption.trim() : ''
                }));
        }

        // Create the post
        const newPost = new Post({
            author: userId,
            content: content.trim(),
            postType: postType || 'general',
            images: processedImages,
            tags: processedTags,
            isAvailableForWork: Boolean(isAvailableForWork)
        });

        await newPost.save();

        // Populate author details
        await newPost.populate({
            path: 'author',
            select: 'name email profile.pictureUrl role profile.skills'
        });

        // Format response
        const formattedPost = {
            id: newPost._id,
            author: {
                id: newPost.author._id,
                name: newPost.author.name,
                email: newPost.author.email,
                avatar: newPost.author.profile?.pictureUrl || null,
                role: newPost.author.role,
                skills: newPost.author.profile?.skills || []
            },
            content: newPost.content,
            postType: newPost.postType,
            images: newPost.images || [],
            tags: newPost.tags || [],
            likeCount: 0,
            commentCount: 0,
            views: 0,
            isAvailableForWork: newPost.isAvailableForWork,
            createdAt: newPost.createdAt,
            updatedAt: newPost.updatedAt,
            isLiked: false,
            reactions: [],
            userReaction: null,
            comments: []
        };

        res.status(201).json({
            success: true,
            message: 'Post created successfully',
            post: formattedPost
        });
    } catch (error) {
        console.error('Error creating post:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create post',
            error: error.message
        });
    }
};

// Get all posts for the feed (paginated)
export const getPosts = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const postType = req.query.type; // optional filter by post type

        // Build query
        let query = {};

        if (postType && postType !== 'all') {
            query.postType = postType;
        }

        // Get posts with author details
        const posts = await Post.find(query)
            .populate({
                path: 'author',
                select: 'name email profile.pictureUrl role profile.skills'
            })
            .populate({
                path: 'comments.user',
                select: 'name profile.pictureUrl'
            })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean();

        // Get total count for pagination
        const totalPosts = await Post.countDocuments(query);
        const totalPages = Math.ceil(totalPosts / limit);

        // Format posts for frontend
        const formattedPosts = posts.map(post => ({
            id: post._id,
            author: {
                id: post.author._id,
                name: post.author.name,
                email: post.author.email,
                avatar: post.author.profile?.pictureUrl || null,
                role: post.author.role,
                skills: post.author.profile?.skills || []
            },
            content: post.content,
            postType: post.postType,
            images: post.images || [],
            tags: post.tags || [],
            likeCount: post.likes?.length || 0,
            commentCount: post.comments?.length || 0,
            views: post.views || 0,
            isAvailableForWork: post.isAvailableForWork,
            createdAt: post.createdAt,
            updatedAt: post.updatedAt,
            isLiked: req.user ? post.likes?.some(like => like.user.toString() === req.user._id.toString()) : false,
            reactions: post.reactions?.map(reaction => ({
                emoji: reaction.emoji,
                userId: reaction.user.toString()
            })) || [],
            userReaction: req.user 
                ? (post.reactions?.find(reaction => reaction.user.toString() === req.user._id.toString())?.emoji || null)
                : null,
            comments: post.comments?.slice(0, 3).map(comment => ({
                id: comment._id,
                content: comment.content,
                author: {
                    id: comment.user._id,
                    name: comment.user.name,
                    avatar: comment.user.profile?.pictureUrl || null
                },
                createdAt: comment.createdAt
            })) || []
        }));

        res.status(200).json({
            success: true,
            posts: formattedPosts,
            pagination: {
                currentPage: page,
                totalPages,
                totalPosts,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1
            }
        });
    } catch (error) {
        console.error('Error fetching posts:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch posts',
            error: error.message
        });
    }
};

// Get a single post by ID
export const getPostById = async (req, res) => {
    try {
        const { postId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(postId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid post ID'
            });
        }

        const post = await Post.findById(postId)
            .populate({
                path: 'author',
                select: 'name email profile.pictureUrl role profile.skills'
            })
            .populate({
                path: 'comments.user',
                select: 'name profile.pictureUrl'
            });

        if (!post) {
            return res.status(404).json({
                success: false,
                message: 'Post not found'
            });
        }

        // Increment view count
        await Post.findByIdAndUpdate(postId, { $inc: { views: 1 } });

        // Format post for frontend
        const formattedPost = {
            id: post._id,
            author: {
                id: post.author._id,
                name: post.author.name,
                email: post.author.email,
                avatar: post.author.profile?.pictureUrl || null,
                role: post.author.role,
                skills: post.author.profile?.skills || []
            },
            content: post.content,
            postType: post.postType,
            images: post.images || [],
            tags: post.tags || [],
            likeCount: post.likes?.length || 0,
            commentCount: post.comments?.length || 0,
            views: post.views + 1,
            isAvailableForWork: post.isAvailableForWork,
            createdAt: post.createdAt,
            updatedAt: post.updatedAt,
            // Check if current user liked this post
            isLiked: req.user ? post.likes?.some(like => like.user.toString() === req.user._id.toString()) : false,
            // Include reactions
            reactions: post.reactions?.map(reaction => ({
                emoji: reaction.emoji,
                userId: reaction.user.toString()
            })) || [],
            // Get user's own reaction if they have one
            userReaction: req.user 
                ? (post.reactions?.find(reaction => reaction.user.toString() === req.user._id.toString())?.emoji || null)
                : null,
            comments: post.comments?.map(comment => ({
                id: comment._id,
                content: comment.content,
                author: {
                    id: comment.user._id,
                    name: comment.user.name,
                    avatar: comment.user.profile?.pictureUrl || null
                },
                createdAt: comment.createdAt
            })) || []
        };

        res.status(200).json({
            success: true,
            post: formattedPost
        });
    } catch (error) {
        console.error('Error fetching post:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch post',
            error: error.message
        });
    }
};

// Like/Unlike a post
export const toggleLikePost = async (req, res) => {
    try {
        const { postId } = req.params;
        const userId = req.user._id;

        if (!mongoose.Types.ObjectId.isValid(postId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid post ID'
            });
        }

        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({
                success: false,
                message: 'Post not found'
            });
        }

        // Check if user already liked the post
        const existingLikeIndex = post.likes.findIndex(like => like.user.toString() === userId.toString());

        if (existingLikeIndex > -1) {
            // Unlike the post
            post.likes.splice(existingLikeIndex, 1);
        } else {
            // Like the post
            post.likes.push({ user: userId });
            
            // Create notification for the post author if it's not their own post
            if (post.author.toString() !== userId.toString()) {
                await createNotification({
                    recipient: post.author,
                    sender: userId,
                    type: 'POST_LIKED',
                    post: postId,
                    message: 'liked your post'
                });
            }
        }

        await post.save();

        res.status(200).json({
            success: true,
            message: existingLikeIndex > -1 ? 'Post unliked' : 'Post liked',
            likeCount: post.likes.length,
            isLiked: existingLikeIndex === -1
        });
    } catch (error) {
        console.error('Error toggling like:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to toggle like',
            error: error.message
        });
    }
};

// Add a comment to a post
export const addComment = async (req, res) => {
    try {
        const { postId } = req.params;
        const { content } = req.body;
        const userId = req.user._id;

        if (!mongoose.Types.ObjectId.isValid(postId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid post ID'
            });
        }

        if (!content || content.trim().length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Comment content is required'
            });
        }

        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({
                success: false,
                message: 'Post not found'
            });
        }

        // Add comment
        const newComment = {
            user: userId,
            content: content.trim()
        };

        post.comments.push(newComment);
        await post.save();

        // Create notification for the post author if it's not their own comment
        if (post.author.toString() !== userId.toString()) {
            await createNotification({
                recipient: post.author,
                sender: userId,
                type: 'POST_COMMENTED',
                post: postId,
                message: 'commented on your post'
            });
        }

        // Populate the new comment with user details
        await post.populate({
            path: 'comments.user',
            select: 'name profile.pictureUrl'
        });

        const addedComment = post.comments[post.comments.length - 1];

        res.status(201).json({
            success: true,
            message: 'Comment added successfully',
            comment: {
                id: addedComment._id,
                content: addedComment.content,
                author: {
                    id: addedComment.user._id,
                    name: addedComment.user.name,
                    avatar: addedComment.user.profile?.pictureUrl || null
                },
                createdAt: addedComment.createdAt
            },
            commentCount: post.comments.length
        });
    } catch (error) {
        console.error('Error adding comment:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to add comment',
            error: error.message
        });
    }
};

// Add a reaction to a post
export const addReaction = async (req, res) => {
    try {
        const { postId } = req.params;
        const { emoji } = req.body;
        const userId = req.user._id;

        if (!emoji) {
            return res.status(400).json({
                success: false,
                message: 'Emoji is required'
            });
        }

        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({
                success: false,
                message: 'Post not found'
            });
        }

        // Remove any existing reaction from this user
        post.reactions = post.reactions.filter(
            reaction => reaction.user.toString() !== userId.toString()
        );

        // Add the new reaction
        post.reactions.push({
            emoji,
            user: userId
        });

        await post.save();

        // Create notification for the post author if it's not their own post
        if (post.author.toString() !== userId.toString()) {
            await createNotification({
                recipient: post.author,
                sender: userId,
                type: 'POST_REACTION',
                post: post._id,
                message: emoji
            });
        }

        // Get all reactions for the post
        const reactions = post.reactions.map(reaction => ({
            emoji: reaction.emoji,
            userId: reaction.user.toString()
        }));

        res.json({
            success: true,
            message: 'Reaction added successfully',
            reactions
        });

    } catch (error) {
        console.error('Error adding reaction:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to add reaction',
            error: error.message
        });
    }
}; 