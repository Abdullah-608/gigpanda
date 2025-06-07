import { Link, useLocation } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { MessageSquare, Briefcase, FileText, LogOut } from "lucide-react";
import UnreadMessagesBadge from "./UnreadMessagesBadge";

const Navigation = () => {
    const location = useLocation();
    const { user, logout } = useAuthStore();

    const isActive = (path) => location.pathname.startsWith(path);

    return (
        <nav className="bg-white shadow-md">
            <div className="container mx-auto px-4">
                <div className="flex justify-between items-center h-16">
                    <Link to="/" className="text-xl font-bold text-green-600">
                        GigPanda
                    </Link>

                    {user && (
                        <div className="flex items-center space-x-6">
                            <Link
                                to="/contracts"
                                className={`flex items-center ${
                                    isActive("/contracts") ? "text-green-600" : "text-gray-600 hover:text-green-600"
                                }`}
                            >
                                <Briefcase className="w-5 h-5 mr-1" />
                                <span>Contracts</span>
                            </Link>

                            {user.role === 'freelancer' ? (
                                <Link
                                    to="/my-proposals"
                                    className={`flex items-center ${
                                        isActive("/my-proposals") ? "text-green-600" : "text-gray-600 hover:text-green-600"
                                    }`}
                                >
                                    <FileText className="w-5 h-5 mr-1" />
                                    <span>My Proposals</span>
                                </Link>
                            ) : (
                                <Link
                                    to="/proposals"
                                    className={`flex items-center ${
                                        isActive("/proposals") ? "text-green-600" : "text-gray-600 hover:text-green-600"
                                    }`}
                                >
                                    <FileText className="w-5 h-5 mr-1" />
                                    <span>Proposals</span>
                                </Link>
                            )}

                            <Link
                                to="/messages"
                                className={`flex items-center relative ${
                                    isActive("/messages") ? "text-green-600" : "text-gray-600 hover:text-green-600"
                                }`}
                            >
                                <MessageSquare className="w-5 h-5 mr-1" />
                                <span>Messages</span>
                                <UnreadMessagesBadge />
                            </Link>

                            <button
                                onClick={logout}
                                className="flex items-center text-gray-600 hover:text-red-600"
                            >
                                <LogOut className="w-5 h-5 mr-1" />
                                <span>Logout</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navigation; 