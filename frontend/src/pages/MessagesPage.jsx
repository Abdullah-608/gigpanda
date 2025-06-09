import { useState, useEffect, useRef, memo, useMemo, useCallback } from "react";
import { useMessageStore } from "../store/messageStore";
import { useAuthStore } from "../store/authStore";
import { useLocation } from "react-router-dom";
import { Send, Search, ArrowLeft, Loader } from "lucide-react";
import LoadingSpinner from "../components/LoadingSpinner";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import styles from "./MessagesPage.module.css";

// Memoized message component
const Message = memo(({ message, isOwnMessage }) => (
    <div className={`${styles.messageWrapper} ${isOwnMessage ? styles.messageWrapperSent : styles.messageWrapperReceived}`}>
        <div className={`${styles.messageContent} ${isOwnMessage ? styles.messageSent : styles.messageReceived}`}>
            <p>{message.content}</p>
            <div className={styles.messageFooter}>
                <span className={styles.messageTime}>
                    {new Date(message.createdAt).toLocaleTimeString()}
                </span>
                {isOwnMessage && (
                    <span className={styles.messageStatus}>
                        {message.isPending ? (
                            <motion.div
                                className={styles.messageStatusSpinner}
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            />
                        ) : message.isRead ? (
                            <span className={styles.messageStatusRead}>✓✓</span>
                        ) : (
                            <span className={styles.messageStatusSent}>✓</span>
                        )}
                    </span>
                )}
            </div>
        </div>
    </div>
));
Message.displayName = 'Message';

// Memoized message container component
const MessageContainer = memo(({ conversationId, userId }) => {
    const { currentConversation, initializeSSE, cleanupSSE } = useMessageStore();
    const messagesEndRef = useRef(null);

    // Set up SSE connection
    useEffect(() => {
        if (conversationId) {
            initializeSSE(conversationId);
            return () => cleanupSSE();
        }
    }, [conversationId]);

    // Scroll to bottom when messages update
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [currentConversation.messages]);

    if (!currentConversation.messages.length) {
        return (
            <div className={styles.emptyMessages}>
                No messages yet. Start the conversation!
            </div>
        );
    }

    return (
        <div className={styles.messagesContainer}>
            {currentConversation.messages.map((msg) => (
                <Message
                    key={msg._id}
                    message={msg}
                    isOwnMessage={msg.sender._id === userId}
                />
            ))}
            <div ref={messagesEndRef} />
        </div>
    );
});
MessageContainer.displayName = 'MessageContainer';

// Memoized message input component
const MessageInput = memo(({ message, setMessage, handleSendMessage, isLoading }) => (
    <div className={styles.inputContainer}>
        <form onSubmit={handleSendMessage} className={styles.inputForm}>
            <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message..."
                className={styles.textInput}
            />
            <button
                type="submit"
                disabled={!message.trim()}
                className={styles.sendButton}
            >
                {isLoading ? (
                    <Loader className={styles.icon} />
                ) : (
                    <Send className={styles.icon} />
                )}
            </button>
        </form>
    </div>
));
MessageInput.displayName = 'MessageInput';

// Memoized conversation list component
const ConversationList = memo(({ 
    conversations, 
    selectedId, 
    onSelect, 
    searchTerm, 
    setSearchTerm 
}) => {
    // Memoize the filtered conversations
    const filteredConversations = useMemo(() => 
        conversations.filter(conv => 
            conv.name?.toLowerCase().includes(searchTerm.toLowerCase())
        ),
        [conversations, searchTerm]
    );

    return (
        <>
            <div className={styles.searchContainer}>
                <div className={styles.searchInputWrapper}>
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search conversations..."
                        className={styles.searchInput}
                    />
                    <Search className={styles.searchIcon} />
                </div>
            </div>
            <div className={styles.conversationsList}>
                {filteredConversations.map((conversation) => (
                    <div
                        key={conversation._id}
                        onClick={() => onSelect(conversation)}
                        className={`${styles.conversationItem} ${
                            selectedId === conversation._id ? styles.conversationItemSelected : ''
                        }`}
                    >
                        <div className={styles.conversationContent}>
                            <div className={styles.avatarContainer}>
                                {conversation.profile?.pictureUrl ? (
                                    <img
                                        src={conversation.profile.pictureUrl}
                                        alt={conversation.name}
                                        className={styles.avatar}
                                    />
                                ) : (
                                    <div className={styles.defaultAvatar}>
                                        {conversation.name?.charAt(0).toUpperCase()}
                                    </div>
                                )}
                            </div>
                            <div className={styles.conversationDetails}>
                                <p className={styles.conversationName}>
                                    {conversation.name}
                                </p>
                                {conversation.lastMessage && (
                                    <p className={styles.lastMessage}>
                                        {conversation.lastMessage.content}
                                    </p>
                                )}
                            </div>
                            {conversation.unreadCount > 0 && (
                                <div className={styles.unreadBadge}>
                                    {conversation.unreadCount}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </>
    );
});
ConversationList.displayName = 'ConversationList';

const MessagesPage = () => {
    const { user } = useAuthStore();
    const {
        conversations,
        currentConversation,
        isLoading,
        getConversations,
        getConversation,
        sendMessage,
        clearCurrentConversation,
        createOrGetConversation
    } = useMessageStore();
    const location = useLocation();
    const messagesEndRef = useRef(null);

    const [message, setMessage] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedConversation, setSelectedConversation] = useState(null);
    const [isMobileView, setIsMobileView] = useState(false);
    const [showConversation, setShowConversation] = useState(false);
    const [error, setError] = useState(null);
    const [isInitializing, setIsInitializing] = useState(false);
    const [isSending, setIsSending] = useState(false);

    // Handle window resize
    useEffect(() => {
        const handleResize = () => {
            setIsMobileView(window.innerWidth < 768);
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Load conversations on mount
    useEffect(() => {
        const loadConversations = async () => {
            try {
                await getConversations();
            } catch (err) {
                setError(err.message);
            }
        };
        loadConversations();
        return () => clearCurrentConversation();
    }, []);

    // Initialize conversation from location state
    useEffect(() => {
        const initFromState = async () => {
            if (location.state?.receiverId && location.state?.shouldInitChat && !isInitializing) {
                setIsInitializing(true);
                try {
                    // First create/get the conversation
                    const conversation = await createOrGetConversation(
                        location.state.receiverId,
                        location.state.jobId,
                        location.state.proposalId
                    );
                    
                    // Then load the conversation
                    setSelectedConversation(conversation);
                    await getConversation(location.state.receiverId);
                    setShowConversation(true);
                    
                    // Clear the navigation state to prevent re-initialization
                    window.history.replaceState({}, document.title);
                } catch (err) {
                    console.error("Error initializing conversation:", err);
                    toast.error("Failed to initialize conversation. Please try again.");
                    setError(err.message);
                } finally {
                    setIsInitializing(false);
                }
            }
        };
        
        initFromState();
    }, [location.state?.shouldInitChat]);

    // Scroll to bottom when messages update
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [currentConversation.messages]);

    const handleConversationSelect = useCallback(async (conversation) => {
        try {
            setSelectedConversation(conversation);
            await getConversation(conversation._id);
            setShowConversation(true);
        } catch (err) {
            setError(err.message);
            toast.error("Failed to load conversation. Please try again.");
        }
    }, [getConversation]);

    const handleSendMessage = useCallback(async (e) => {
        e.preventDefault();
        if (!message.trim() || !selectedConversation || isSending) return;

        try {
            setIsSending(true);
            await sendMessage(selectedConversation._id, message.trim());
            setMessage("");
        } catch (err) {
            setError(err.message);
            toast.error("Failed to send message. Please try again.");
        } finally {
            setIsSending(false);
        }
    }, [message, selectedConversation, sendMessage, isSending]);

    const handleBack = useCallback(() => {
        setShowConversation(false);
        setSelectedConversation(null);
        clearCurrentConversation();
    }, [clearCurrentConversation]);

    if (error) {
        return (
            <div className={styles.errorContainer}>
                <div className={styles.errorMessage}>
                    Error: {error}. Please try refreshing the page.
                </div>
            </div>
        );
    }

    if (isLoading || isInitializing) {
        return <LoadingSpinner />;
    }

    return (
        <div className={styles.mainContainer}>
            {/* Conversations List */}
            <div className={`${styles.conversationsListContainer} ${isMobileView && showConversation ? styles.conversationsListContainerHidden : ''}`}>
                <ConversationList 
                    conversations={conversations}
                    selectedId={selectedConversation?._id}
                    onSelect={handleConversationSelect}
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                />
            </div>

            {/* Conversation/Messages */}
            <div className={`${styles.messagesSection} ${isMobileView && !showConversation ? styles.messagesSectionHidden : ''}`}>
                {selectedConversation ? (
                    <>
                        <div className={styles.conversationHeader}>
                            {isMobileView && (
                                <button
                                    onClick={handleBack}
                                    className={styles.backButton}
                                >
                                    <ArrowLeft className={styles.icon} />
                                </button>
                            )}
                            <div className={styles.headerContent}>
                                {currentConversation.user?.profile?.pictureUrl ? (
                                    <img
                                        src={currentConversation.user.profile.pictureUrl}
                                        alt={currentConversation.user.name}
                                        className={styles.headerAvatar}
                                    />
                                ) : (
                                    <div className={styles.headerDefaultAvatar}>
                                        {currentConversation.user?.name?.charAt(0).toUpperCase()}
                                    </div>
                                )}
                                <div>
                                    <h2 className={styles.headerName}>
                                        {currentConversation.user?.name}
                                    </h2>
                                </div>
                            </div>
                        </div>

                        {/* Messages */}
                        <MessageContainer 
                            conversationId={selectedConversation._id}
                            userId={user._id}
                        />

                        {/* Input */}
                        <MessageInput
                            message={message}
                            setMessage={setMessage}
                            handleSendMessage={handleSendMessage}
                            isLoading={isSending}
                        />
                    </>
                ) : (
                    <div className={styles.emptyState}>
                        Select a conversation to start messaging
                    </div>
                )}
            </div>
        </div>
    );
};

export default MessagesPage; 