import { useState, useEffect, useRef, memo, useMemo, useCallback } from "react";
import { useMessageStore } from "../store/messageStore";
import { useAuthStore } from "../store/authStore";
import { useLocation } from "react-router-dom";
import { Send, Search, ArrowLeft, Loader } from "lucide-react";
import LoadingSpinner from "../components/LoadingSpinner";
import toast from "react-hot-toast";
import { motion } from "framer-motion";

// Memoized message component
const Message = memo(({ message, isOwnMessage }) => (
    <div
        className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
    >
        <div
            className={`max-w-[70%] rounded-lg p-3 ${
                isOwnMessage
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200 text-gray-900'
            }`}
        >
            <p>{message.content}</p>
            <div className="flex items-center justify-between text-xs mt-1">
                <span className="opacity-75">
                    {new Date(message.createdAt).toLocaleTimeString()}
                </span>
                {isOwnMessage && (
                    <span className="ml-2">
                        {message.isPending ? (
                            <motion.div
                                className="w-3 h-3 border-2 border-t-2 border-t-white border-white rounded-full inline-block"
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            />
                        ) : message.isRead ? (
                            <span className="text-white">✓✓</span>
                        ) : (
                            <span className="text-green-200">✓</span>
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
            <div className="flex-1 flex items-center justify-center text-gray-500">
                No messages yet. Start the conversation!
            </div>
        );
        }

    return (
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
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

// Memoized message list component
const MessageList = memo(({ messages, userId, messagesEndRef, isLoading }) => (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {isLoading ? (
            <div className="h-full flex items-center justify-center">
                <motion.div
                    className='w-10 h-10 border-4 border-t-4 border-t-green-500 border-green-200 rounded-full'
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
                                </div>
        ) : (
                        <>
                {messages.map((msg) => (
                    <Message
                                            key={msg._id}
                        message={msg}
                        isOwnMessage={msg.sender._id === userId}
                    />
                                    ))}
                                    <div ref={messagesEndRef} />
            </>
        )}
                                </div>
));
MessageList.displayName = 'MessageList';

// Memoized message input component
const MessageInput = memo(({ message, setMessage, handleSendMessage, isLoading }) => (
                            <div className="p-4 bg-white border-t border-gray-200">
                                <form onSubmit={handleSendMessage} className="flex items-center space-x-4">
                                    <input
                                        type="text"
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        placeholder="Type your message..."
                                        className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    />
                                    <button
                                        type="submit"
                                        disabled={!message.trim()}
                                        className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isLoading ? (
                                            <Loader className="h-5 w-5 animate-spin" />
                                        ) : (
                                            <Send className="h-5 w-5" />
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
            <div className="p-4 border-b">
                <div className="relative">
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search conversations..."
                        className="w-full p-2 pl-8 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                    <Search className="absolute left-2 top-2.5 h-5 w-5 text-gray-400" />
                </div>
            </div>
            <div className="overflow-y-auto h-[calc(100vh-5rem)]">
                {filteredConversations.map((conversation) => (
                    <div
                        key={conversation._id}
                        onClick={() => onSelect(conversation)}
                        className={`p-4 border-b hover:bg-gray-50 cursor-pointer ${
                            selectedId === conversation._id ? 'bg-gray-50' : ''
                        }`}
                    >
                        <div className="flex items-center space-x-3">
                            <div className="flex-shrink-0">
                                {conversation.profile?.pictureUrl ? (
                                    <img
                                        src={conversation.profile.pictureUrl}
                                        alt={conversation.name}
                                        className="h-10 w-10 rounded-full"
                                    />
                                ) : (
                                    <div className="h-10 w-10 rounded-full bg-green-500 flex items-center justify-center text-white">
                                        {conversation.name?.charAt(0).toUpperCase()}
                                    </div>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                    {conversation.name}
                                </p>
                                {conversation.lastMessage && (
                                    <p className="text-sm text-gray-500 truncate">
                                        {conversation.lastMessage.content}
                                    </p>
                                )}
                            </div>
                            {conversation.unreadCount > 0 && (
                                <div className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-green-500 rounded-full">
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
            <div className="flex items-center justify-center h-screen">
                <div className="text-red-500">
                    Error: {error}. Please try refreshing the page.
                </div>
            </div>
        );
    }

    if (isLoading || isInitializing) {
        return <LoadingSpinner />;
    }

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Conversations List */}
            <div className={`bg-white w-full md:w-1/3 border-r ${isMobileView && showConversation ? 'hidden' : ''}`}>
                <ConversationList 
                    conversations={conversations}
                    selectedId={selectedConversation?._id}
                    onSelect={handleConversationSelect}
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                />
            </div>

            {/* Conversation/Messages */}
            <div className={`flex-1 flex flex-col ${isMobileView && !showConversation ? 'hidden' : ''}`}>
                {selectedConversation ? (
                    <>
                        <div className="p-4 bg-white border-b border-gray-200 flex items-center">
                            {isMobileView && (
                                <button
                                    onClick={handleBack}
                                    className="mr-4 text-gray-600 hover:text-gray-900"
                                >
                                    <ArrowLeft className="h-6 w-6" />
                                </button>
                            )}
                            <div className="flex items-center space-x-3">
                                {currentConversation.user?.profile?.pictureUrl ? (
                                    <img
                                        src={currentConversation.user.profile.pictureUrl}
                                        alt={currentConversation.user.name}
                                        className="h-10 w-10 rounded-full"
                                    />
                                ) : (
                                    <div className="h-10 w-10 rounded-full bg-green-500 flex items-center justify-center text-white">
                                        {currentConversation.user?.name?.charAt(0).toUpperCase()}
                                    </div>
                                )}
                                <div>
                                    <h2 className="text-lg font-semibold">
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
                        <div className="flex-1 flex items-center justify-center text-gray-500">
                            Select a conversation to start messaging
                        </div>
                    )}
            </div>
        </div>
    );
};

export default MessagesPage; 