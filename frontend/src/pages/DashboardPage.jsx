import { useState, useEffect } from "react";
import { useAuthStore } from "../store/authStore";
import { Navigate } from "react-router-dom";

const DashboardPage = () => {
	const { user } = useAuthStore();
	const [isClient, setIsClient] = useState(true);
	
	useEffect(() => {
		// Check user role and set client state
		const userRole = user?.role;
		setIsClient(userRole !== "freelancer");
	}, [user]);

	// Redirect based on user role
	if (isClient) {
		return <Navigate to="/client-dashboard" replace />;
	} else {
		return <Navigate to="/freelancer-dashboard" replace />;
	}
};

export default DashboardPage;
