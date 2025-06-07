import { useEffect, useState } from "react";
import { websocketService } from "../services/websocket";
import { useAuthStore } from "../store/authStore";

const UnreadMessagesBadge = ({ contractId }) => {
    const [unreadCount, setUnreadCount] = useState(0);
    const { user } = useAuthStore();

    useEffect(() => {
        // Subscribe to new messages
        const unsubscribeNewMessage = websocketService.subscribe("new_message", (message) => {
            if (
                (!contractId || message.contract === contractId) && // If contractId is provided, only count messages for that contract
                message.sender._id !== user._id && // Don't count own messages
                !document.hasFocus() // Only count if window is not focused
            ) {
                setUnreadCount(prev => prev + 1);
            }
        });

        // Reset count when window gains focus
        const handleFocus = () => setUnreadCount(0);
        window.addEventListener("focus", handleFocus);

        // Reset count when navigating to messages
        const handleRouteChange = () => {
            if (window.location.pathname.includes("/messages")) {
                setUnreadCount(0);
            }
        };
        window.addEventListener("popstate", handleRouteChange);

        return () => {
            unsubscribeNewMessage();
            window.removeEventListener("focus", handleFocus);
            window.removeEventListener("popstate", handleRouteChange);
        };
    }, [contractId, user._id]);

    if (unreadCount === 0) return null;

    return (
        <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
        </div>
    );
};

export default UnreadMessagesBadge; 