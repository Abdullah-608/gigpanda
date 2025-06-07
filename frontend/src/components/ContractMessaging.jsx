import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { useConnectionStore } from "../store/connectionStore";
import { Send, Paperclip, Download, AlertCircle, Loader } from "lucide-react";
import toast from "react-hot-toast";
import axios from "axios";
import { websocketService } from "../services/websocket";
import FileUploadProgress from "./FileUploadProgress";

const API_URL = import.meta.env.MODE === "development" ? "http://localhost:5000/api/messages" : "/api/messages";
const POLLING_INTERVAL = 5000; // Poll every 5 seconds

const ContractMessaging = () => {
    const { contractId } = useParams();
    const { user } = useAuthStore();
    const { 
        isConnected, 
        isReconnecting, 
        reconnectAttempt, 
        maxReconnectAttempts,
        missedMessages,
        recoveryInProgress,
        contractStatuses,
        getPendingPayment
    } = useConnectionStore();
    const messagesEndRef = useRef(null);
    
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [attachments, setAttachments] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [typingUsers, setTypingUsers] = useState(new Set());
    const [uploadProgress, setUploadProgress] = useState({});
    const typingTimeoutRef = useRef(null);
    const [readMessages, setReadMessages] = useState(new Set());
    const [isVisible, setIsVisible] = useState(true);
    const [isInitialLoading, setIsInitialLoading] = useState(true);
    const [error, setError] = useState(null);
    const [lastMessageId, setLastMessageId] = useState(null);

    const contractStatus = contractStatuses.get(contractId);
    const pendingPayment = getPendingPayment(contractId);

    const fetchMessages = async () => {
        try {
            const response = await axios.get(`${API_URL}/contract/${contractId}`, {
                params: { after: lastMessageId }
            });
            
            if (response.data.messages.length > 0) {
                setMessages(prev => [...prev, ...response.data.messages]);
                setLastMessageId(response.data.messages[response.data.messages.length - 1]._id);
            }
        } catch (error) {
            console.error("Error fetching messages:", error);
            setError("Failed to load messages");
        }
    };

    // Initial load
    useEffect(() => {
        let mounted = true;

        const loadInitialMessages = async () => {
            try {
                setError(null);
                const response = await axios.get(`${API_URL}/contract/${contractId}`);
                if (mounted) {
                    setMessages(response.data.messages);
                    if (response.data.messages.length > 0) {
                        setLastMessageId(response.data.messages[response.data.messages.length - 1]._id);
                    }
                }
            } catch (error) {
                console.error("Error loading messages:", error);
                if (mounted) {
                    setError("Failed to load messages. Please try refreshing the page.");
                    toast.error("Error loading messages. Please try refreshing the page.");
                }
            } finally {
                if (mounted) {
                    setIsInitialLoading(false);
                }
            }
        };

        loadInitialMessages();

        // Set up polling
        const pollInterval = setInterval(fetchMessages, POLLING_INTERVAL);

        return () => {
            mounted = false;
            clearInterval(pollInterval);
        };
    }, [contractId]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Handle visibility change
    useEffect(() => {
        const handleVisibilityChange = () => {
            setIsVisible(!document.hidden);
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, []);

    // Mark messages as read when visible
    useEffect(() => {
        let timeoutId;

        if (isVisible && messages.length > 0) {
            const unreadMessages = messages.filter(
                msg => !readMessages.has(msg._id) && msg.sender._id !== user._id
            );

            if (unreadMessages.length > 0) {
                const newReadMessages = new Set(readMessages);
                unreadMessages.forEach(msg => {
                    newReadMessages.add(msg._id);
                    websocketService.send('message_read', {
                        messageId: msg._id,
                        contractId
                    });
                });
                setReadMessages(newReadMessages);
            }
        }

        return () => {
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
        };
    }, [isVisible, messages, readMessages, user._id, contractId]);

    // Handle missed messages
    useEffect(() => {
        if (missedMessages.length > 0) {
            const contractMessages = missedMessages.filter(msg => msg.contract === contractId);
            if (contractMessages.length > 0) {
                setMessages(prev => [...prev, ...contractMessages]);
            }
        }
    }, [missedMessages, contractId]);

    // Handle typing timeout cleanup
    useEffect(() => {
        return () => {
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }
        };
    }, []);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        setAttachments(prev => [...prev, ...files]);
    };

    const removeAttachment = (index) => {
        setAttachments(prev => prev.filter((_, i) => i !== index));
    };

    const handleTyping = () => {
        if (!isConnected) return;

        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        websocketService.send("typing", {
            contractId,
            userId: user._id
        });

        typingTimeoutRef.current = setTimeout(() => {
            typingTimeoutRef.current = null;
        }, 3000);
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() && attachments.length === 0) return;

        setIsLoading(true);
        try {
            const formData = new FormData();
            formData.append("text", newMessage);
            attachments.forEach(file => {
                formData.append("files", file);
            });

            const response = await axios.post(`${API_URL}/contract/${contractId}`, formData, {
                onUploadProgress: (progressEvent) => {
                    const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    setUploadProgress(prev => ({ ...prev, current: progress }));
                }
            });

            setMessages(prev => [...prev, response.data.message]);
            setLastMessageId(response.data.message._id);
            setNewMessage("");
            setAttachments([]);
            setUploadProgress({});
        } catch (error) {
            console.error("Error sending message:", error);
            toast.error("Failed to send message. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const formatTimestamp = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleString();
    };

    const renderMessage = (message) => {
        const isOwnMessage = message.sender._id === user._id;
        const isRead = readMessages.has(message._id);

        return (
            <div
                key={message._id}
                className={`flex ${isOwnMessage ? "justify-end" : "justify-start"} mb-4`}
            >
                <div
                    className={`max-w-[70%] ${
                        isOwnMessage
                            ? "bg-green-600 text-white"
                            : "bg-gray-100 text-gray-900"
                    } rounded-lg p-3`}
                >
                    {!isOwnMessage && (
                        <div className="text-sm font-medium mb-1">
                            {message.sender.name}
                        </div>
                    )}
                    
                    {message.type === "system" ? (
                        <div className="text-sm italic">
                            {message.content}
                        </div>
                    ) : (
                        <>
                            <div className="whitespace-pre-wrap">{message.content}</div>
                            
                            {message.attachments?.length > 0 && (
                                <div className="mt-2 space-y-1">
                                    {message.attachments.map((attachment, index) => (
                                        <a
                                            key={index}
                                            href={attachment.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className={`flex items-center text-sm ${
                                                isOwnMessage
                                                    ? "text-white hover:text-gray-200"
                                                    : "text-blue-600 hover:text-blue-800"
                                            }`}
                                        >
                                            <Download className="w-4 h-4 mr-1" />
                                            {attachment.filename}
                                        </a>
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                    
                    <div className={`text-xs mt-1 flex items-center justify-between ${
                        isOwnMessage ? "text-green-200" : "text-gray-500"
                    }`}>
                        <span>{formatTimestamp(message.createdAt)}</span>
                        {isOwnMessage && isRead && (
                            <span className="ml-2">✓✓</span>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    // Show contract status banner
    const renderStatusBanner = () => {
        if (!contractStatus) return null;

        let bannerClass = "";
        let message = "";

        switch (contractStatus) {
            case "paused":
                bannerClass = "bg-yellow-50 text-yellow-800";
                message = "This contract is currently paused";
                break;
            case "cancelled":
                bannerClass = "bg-red-50 text-red-800";
                message = "This contract has been cancelled";
                break;
            case "completed":
                bannerClass = "bg-green-50 text-green-800";
                message = "This contract has been completed";
                break;
            case "disputed":
                bannerClass = "bg-red-50 text-red-800";
                message = "This contract is under dispute";
                break;
            default:
                return null;
        }

        return (
            <div className={`p-2 flex items-center justify-center ${bannerClass}`}>
                <AlertCircle className="w-4 h-4 mr-2" />
                <span className="text-sm">{message}</span>
                {pendingPayment > 0 && (
                    <span className="ml-2 text-sm">
                        (Payment of ${pendingPayment} pending)
                    </span>
                )}
            </div>
        );
    };

    if (error) {
        return (
            <div className="bg-white rounded-lg shadow-md h-[600px] flex flex-col items-center justify-center">
                <div className="text-red-600 mb-4">
                    <AlertCircle className="w-8 h-8" />
                </div>
                <p className="text-red-600 text-center">{error}</p>
                <button
                    onClick={() => window.location.reload()}
                    className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                    Refresh Page
                </button>
            </div>
        );
    }

    if (isInitialLoading) {
        return (
            <div className="bg-white rounded-lg shadow-md h-[600px] flex flex-col items-center justify-center">
                <Loader className="w-8 h-8 animate-spin text-green-600 mb-4" />
                <p className="text-gray-600">Loading messages...</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-md h-[600px] flex flex-col">
            {/* Connection Status */}
            {!isConnected && (
                <div className="bg-yellow-50 p-2 flex items-center justify-center text-yellow-800">
                    <AlertCircle className="w-4 h-4 mr-2" />
                    <span className="text-sm">
                        {recoveryInProgress 
                            ? "Recovering missed messages..."
                            : isReconnecting 
                                ? `Reconnecting to server... Attempt ${reconnectAttempt}/${maxReconnectAttempts}`
                                : "Connecting to server..."}
                    </span>
                    <Loader className="w-4 h-4 ml-2 animate-spin" />
                </div>
            )}

            {/* Contract Status */}
            {renderStatusBanner()}

            {/* Messages Header */}
            <div className="p-4 border-b">
                <h2 className="text-xl font-semibold">Messages</h2>
            </div>

            {/* Messages List */}
            <div className="flex-1 overflow-y-auto p-4">
                {messages.map(renderMessage)}
                {typingUsers.size > 0 && (
                    <div className="text-sm text-gray-500 italic">
                        {Array.from(typingUsers).length === 1
                            ? "Someone is typing..."
                            : "Multiple people are typing..."}
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* File Upload Progress */}
            {uploadProgress.current > 0 && uploadProgress.current < 100 && (
                <FileUploadProgress progress={uploadProgress.current} />
            )}

            {/* Message Input */}
            <form onSubmit={handleSendMessage} className="p-4 border-t">
                <div className="flex items-center space-x-2">
                    <label className="cursor-pointer">
                        <input
                            type="file"
                            multiple
                            onChange={handleFileChange}
                            className="hidden"
                        />
                        <Paperclip className="w-6 h-6 text-gray-500 hover:text-emerald-500" />
                    </label>
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => {
                            setNewMessage(e.target.value);
                            handleTyping();
                        }}
                        placeholder={
                            contractStatus === "cancelled" ? "This contract has been cancelled" :
                            contractStatus === "completed" ? "This contract has been completed" :
                            contractStatus === "disputed" ? "This contract is under dispute" :
                            contractStatus === "paused" ? "This contract is paused" :
                            "Type your message..."
                        }
                        className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    <button
                        type="submit"
                        disabled={isLoading || (!newMessage.trim() && attachments.length === 0)}
                        className="p-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <Loader className="w-6 h-6 animate-spin" />
                        ) : (
                            <Send className="w-6 h-6" />
                        )}
                    </button>
                </div>

                {/* Attachment previews */}
                {attachments.length > 0 && (
                    <div className="mt-2 space-y-2">
                        {attachments.map((file, index) => (
                            <div
                                key={index}
                                className="flex items-center justify-between p-2 bg-gray-100 rounded"
                            >
                                <span className="text-sm truncate">{file.name}</span>
                                <button
                                    type="button"
                                    onClick={() => removeAttachment(index)}
                                    className="text-red-500 hover:text-red-700"
                                >
                                    &times;
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </form>
        </div>
    );
};

export default ContractMessaging; 