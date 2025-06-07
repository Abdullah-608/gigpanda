import { create } from "zustand";
import axios from "axios";
import toast from "react-hot-toast";

const API_URL = import.meta.env.MODE === "development" ? "http://localhost:5000/api/proposals" : "/api/proposals";

// Configure axios to send credentials
axios.defaults.withCredentials = true;

export const useProposalStore = create((set, get) => ({
    proposals: [],
    incomingProposals: [],
    currentProposal: null,
    isLoading: false,
    error: null,

    // Create a new proposal
    submitProposal: async (jobId, proposalData) => {
        set({ isLoading: true, error: null });
        try {
            const response = await axios.post(`${API_URL}/${jobId}`, proposalData);
            set(state => ({
                proposals: [...state.proposals, response.data.proposal],
                isLoading: false
            }));
            toast.success("Proposal submitted successfully!");
            return response.data.proposal;
        } catch (error) {
            set({ 
                error: error.response?.data?.message || "Error submitting proposal", 
                isLoading: false 
            });
            toast.error(error.response?.data?.message || "Error submitting proposal");
            throw error;
        }
    },

    // Get proposals for a specific job (client view)
    getJobProposals: async (jobId) => {
        set({ isLoading: true, error: null });
        try {
            const response = await axios.get(`${API_URL}/job/${jobId}`);
            set({ 
                incomingProposals: response.data.proposals,
                isLoading: false 
            });
            return response.data.proposals;
        } catch (error) {
            set({ 
                error: error.response?.data?.message || "Error fetching proposals",
                isLoading: false 
            });
            throw error;
        }
    },

    // Get proposals submitted by the freelancer
    getMyProposals: async () => {
        set({ isLoading: true, error: null });
        try {
            const response = await axios.get(`${API_URL}/my-proposals`);
            set({ 
                proposals: response.data.proposals,
                isLoading: false 
            });
            return response.data.proposals;
        } catch (error) {
            set({ 
                error: error.response?.data?.message || "Error fetching your proposals",
                isLoading: false 
            });
            throw error;
        }
    },

    // Get a single proposal by ID
    getProposalById: async (proposalId) => {
        set({ isLoading: true, error: null });
        try {
            const response = await axios.get(`${API_URL}/${proposalId}`);
            set({ 
                currentProposal: response.data.proposal,
                isLoading: false 
            });
            return response.data.proposal;
        } catch (error) {
            set({ 
                error: error.response?.data?.message || "Error fetching proposal",
                isLoading: false 
            });
            throw error;
        }
    },

    // Update proposal status (accept/decline/interview)
    updateProposalStatus: async (proposalId, status, notes = "") => {
        set({ isLoading: true, error: null });
        try {
            const response = await axios.patch(`${API_URL}/${proposalId}/status`, {
                status,
                clientNotes: notes
            });
            
            // Update proposals list with new status
            set(state => ({
                incomingProposals: state.incomingProposals.map(prop =>
                    prop._id === proposalId ? response.data.proposal : prop
                ),
                currentProposal: response.data.proposal,
                isLoading: false
            }));

            const actionMap = {
                accepted: "Proposal accepted",
                declined: "Proposal declined",
                interviewing: "Interview requested"
            };
            toast.success(actionMap[status] || "Proposal status updated");
            
            return response.data.proposal;
        } catch (error) {
            set({ 
                error: error.response?.data?.message || "Error updating proposal status",
                isLoading: false 
            });
            toast.error(error.response?.data?.message || "Error updating proposal status");
            throw error;
        }
    },

    // Delete a proposal (client view)
    deleteProposal: async (proposalId) => {
        set({ isLoading: true, error: null });
        try {
            const response = await axios.delete(`${API_URL}/${proposalId}`);
            
            // Remove the proposal from incomingProposals array
            set(state => ({
                incomingProposals: state.incomingProposals.filter(prop => prop._id !== proposalId),
                isLoading: false
            }));
            
            toast.success("Proposal deleted successfully");
            return response.data;
        } catch (error) {
            set({ 
                error: error.response?.data?.message || "Error deleting proposal",
                isLoading: false 
            });
            toast.error(error.response?.data?.message || "Error deleting proposal");
            throw error;
        }
    },

    // Clear current proposal
    clearCurrentProposal: () => {
        set({ currentProposal: null });
    }
})); 