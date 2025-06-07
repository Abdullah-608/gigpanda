import { create } from "zustand";
import axios from "axios";
import toast from "react-hot-toast";

const API_URL = import.meta.env.MODE === "development" ? "http://localhost:5000/api/contracts" : "/api/contracts";

export const useContractStore = create((set) => ({
    contracts: [],
    currentContract: null,
    isLoading: false,
    error: null,

    // Create a new contract from accepted proposal
    createContract: async (proposalId, contractData) => {
        set({ isLoading: true, error: null });
        try {
            const response = await axios.post(`${API_URL}/proposal/${proposalId}`, contractData);
            set(state => ({
                contracts: [...state.contracts, response.data.contract],
                currentContract: response.data.contract,
                isLoading: false
            }));
            toast.success("Contract created successfully!");
            return response.data.contract;
        } catch (error) {
            set({ 
                error: error.response?.data?.message || "Error creating contract",
                isLoading: false 
            });
            toast.error(error.response?.data?.message || "Error creating contract");
            throw error;
        }
    },

    // Fund contract escrow
    fundEscrow: async (contractId, amount) => {
        set({ isLoading: true, error: null });
        try {
            const response = await axios.post(`${API_URL}/${contractId}/fund`, { amount });
            
            // After funding, automatically activate the contract and first milestone
            if (response.data.contract.status === 'funded') {
                const activateResponse = await axios.post(`${API_URL}/${contractId}/activate`);
                set(state => ({
                    contracts: state.contracts.map(contract =>
                        contract._id === contractId ? activateResponse.data.contract : contract
                    ),
                    currentContract: activateResponse.data.contract,
                    isLoading: false
                }));
                toast.success("Contract activated successfully!");
                return activateResponse.data.contract;
            }

            set(state => ({
                contracts: state.contracts.map(contract =>
                    contract._id === contractId ? response.data.contract : contract
                ),
                currentContract: response.data.contract,
                isLoading: false
            }));
            toast.success("Escrow funded successfully!");
            return response.data.contract;
        } catch (error) {
            set({ 
                error: error.response?.data?.message || "Error funding escrow",
                isLoading: false 
            });
            toast.error(error.response?.data?.message || "Error funding escrow");
            throw error;
        }
    },

    // Add milestone to contract
    addMilestone: async (contractId, milestoneData) => {
        set({ isLoading: true, error: null });
        try {
            const response = await axios.post(`${API_URL}/${contractId}/milestones`, milestoneData);
            set(state => ({
                contracts: state.contracts.map(contract =>
                    contract._id === contractId ? response.data.contract : contract
                ),
                currentContract: response.data.contract,
                isLoading: false
            }));
            toast.success("Milestone added successfully!");
            return response.data.contract;
        } catch (error) {
            set({ 
                error: error.response?.data?.message || "Error adding milestone",
                isLoading: false 
            });
            toast.error(error.response?.data?.message || "Error adding milestone");
            throw error;
        }
    },

    // Submit work for milestone
    submitWork: async (contractId, milestoneId, submissionData) => {
        set({ isLoading: true, error: null });
        try {
            const response = await axios.post(
                `${API_URL}/${contractId}/milestones/${milestoneId}/submit`,
                submissionData
            );
            set(state => ({
                contracts: state.contracts.map(contract =>
                    contract._id === contractId ? response.data.contract : contract
                ),
                currentContract: response.data.contract,
                isLoading: false
            }));
            toast.success("Work submitted successfully!");
            return response.data.contract;
        } catch (error) {
            set({ 
                error: error.response?.data?.message || "Error submitting work",
                isLoading: false 
            });
            toast.error(error.response?.data?.message || "Error submitting work");
            throw error;
        }
    },

    // Review milestone submission
    reviewSubmission: async (contractId, milestoneId, review) => {
        set({ isLoading: true, error: null });
        try {
            const response = await axios.post(
                `${API_URL}/${contractId}/milestones/${milestoneId}/review`,
                review
            );
            set(state => ({
                contracts: state.contracts.map(contract =>
                    contract._id === contractId ? response.data.contract : contract
                ),
                currentContract: response.data.contract,
                isLoading: false
            }));
            const message = review.status === "approved" 
                ? "Work approved successfully!"
                : "Changes requested successfully!";
            toast.success(message);
            return response.data.contract;
        } catch (error) {
            set({ 
                error: error.response?.data?.message || "Error reviewing submission",
                isLoading: false 
            });
            toast.error(error.response?.data?.message || "Error reviewing submission");
            throw error;
        }
    },

    // Release payment for milestone
    releasePayment: async (contractId, milestoneId) => {
        set({ isLoading: true, error: null });
        try {
            const response = await axios.post(
                `${API_URL}/${contractId}/milestones/${milestoneId}/release`
            );

            // Check if all milestones are completed
            const allMilestonesCompleted = response.data.contract.milestones.every(
                milestone => milestone.status === "completed"
            );

            // If all milestones are completed, update contract status
            if (allMilestonesCompleted) {
                const completeResponse = await axios.post(`${API_URL}/${contractId}/complete`);
                set(state => ({
                    contracts: state.contracts.map(contract =>
                        contract._id === contractId ? completeResponse.data.contract : contract
                    ),
                    currentContract: completeResponse.data.contract,
                    isLoading: false
                }));
                toast.success("Contract completed successfully!");
                return completeResponse.data.contract;
            }

            set(state => ({
                contracts: state.contracts.map(contract =>
                    contract._id === contractId ? response.data.contract : contract
                ),
                currentContract: response.data.contract,
                isLoading: false
            }));
            toast.success("Payment released successfully!");
            return response.data.contract;
        } catch (error) {
            set({ 
                error: error.response?.data?.message || "Error releasing payment",
                isLoading: false 
            });
            toast.error(error.response?.data?.message || "Error releasing payment");
            throw error;
        }
    },

    // Get all contracts (filtered by role - client/freelancer)
    getContracts: async () => {
        set({ isLoading: true, error: null });
        try {
            const response = await axios.get(`${API_URL}/my-contracts`);
            set({ 
                contracts: response.data.contracts,
                isLoading: false 
            });
            return response.data.contracts;
        } catch (error) {
            set({ 
                error: error.response?.data?.message || "Error fetching contracts",
                isLoading: false 
            });
            throw error;
        }
    },

    // Get a single contract by ID
    getContractById: async (contractId) => {
        set({ isLoading: true, error: null });
        try {
            const response = await axios.get(`${API_URL}/${contractId}`);
            set({ 
                currentContract: response.data.contract,
                isLoading: false 
            });
            return response.data.contract;
        } catch (error) {
            set({ 
                error: error.response?.data?.message || "Error fetching contract",
                isLoading: false 
            });
            throw error;
        }
    },

    // Clear current contract
    clearCurrentContract: () => {
        set({ currentContract: null });
    }
})); 