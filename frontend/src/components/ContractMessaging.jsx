import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { Send, Paperclip, Download } from "lucide-react";
import toast from "react-hot-toast";
import axios from "axios";
import FileUploadProgress from "./FileUploadProgress";

const API_URL = import.meta.env.MODE === "development" ? "http://localhost:5000/api/messages" : "/api/messages";

const ContractMessaging = () => {
    const { contractId } = useParams();
    const { user } = useAuthStore();
    const messagesEndRef = useRef(null);
    
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [attachments, setAttachments] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState({});

    useEffect(() => {
        loadMessages();
    }, [contractId]);

    const loadMessages = async () => {
        try {
            const response = await axios.get(`${API_URL}/contract/${contractId}`);
            setMessages(response.data.messages);
            scrollToBottom();
        } catch (error) {
            console.error('Error loading messages:', error);
            toast.error('Failed to load messages');
        }
    };

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

            await axios.post(`${API_URL}/contract/${contractId}`, formData, {
                onUploadProgress: (progressEvent) => {
                    const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    setUploadProgress(prev => ({ ...prev, current: progress }));
                }
            });

            setNewMessage("");
            setAttachments([]);
            setUploadProgress({});
            await loadMessages(); // Refresh messages
            toast.success("Message sent successfully");
        } catch (error) {
            console.error('Error sending message:', error);
            toast.error('Failed to send message');
        } finally {
            setIsLoading(false);
        }
    };

    const formatTimestamp = (date) => {
        return new Date(date).toLocaleString();
    };

    return (
        <div className="bg-white rounded-lg shadow-md">
            <div className="p-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold">Messages</h2>
            </div>

            {/* Messages */}
            <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
                {messages.map((message) => (
                    <div
                        key={message._id}
                        className={`flex ${message.sender._id === user._id ? 'justify-end' : 'justify-start'}`}
                    >
                        <div
                            className={`max-w-[70%] rounded-lg p-3 ${
                                message.sender._id === user._id
                                    ? 'bg-green-500 text-white'
                                    : 'bg-gray-100 text-gray-900'
                            }`}
                        >
                            <div className="text-sm mb-1">
                                {message.sender._id !== user._id && (
                                    <span className="font-semibold">{message.sender.name}</span>
                                )}
                            </div>
                            <div>{message.content}</div>
                            {message.attachments?.length > 0 && (
                                <div className="mt-2 space-y-1">
                                    {message.attachments.map((attachment, index) => (
                                        <a
                                            key={index}
                                            href={attachment.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className={`flex items-center text-sm ${
                                                message.sender._id === user._id
                                                    ? 'text-white hover:text-gray-200'
                                                    : 'text-blue-600 hover:text-blue-800'
                                            }`}
                                        >
                                            <Download className="w-4 h-4 mr-1" />
                                            {attachment.filename}
                                        </a>
                                    ))}
                                </div>
                            )}
                            <div className={`text-xs mt-1 ${
                                message.sender._id === user._id ? 'text-green-200' : 'text-gray-500'
                            }`}>
                                {formatTimestamp(message.createdAt)}
                            </div>
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

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
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type your message..."
                        className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    <button
                        type="submit"
                        disabled={isLoading || (!newMessage.trim() && attachments.length === 0)}
                        className="p-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Send className="w-6 h-6" />
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

                {/* Upload Progress */}
                {uploadProgress.current > 0 && uploadProgress.current < 100 && (
                    <FileUploadProgress progress={uploadProgress.current} />
                )}
            </form>
        </div>
    );
};

export default ContractMessaging; 