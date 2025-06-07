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
            
            // Only update state if the request was successful
            if (response.data.success) {
                set(state => ({
                    contracts: [...state.contracts, response.data.contract],
                    currentContract: response.data.contract,
                    isLoading: false,
                    error: null
                }));
                toast.success("Contract created successfully!");
                return response.data.contract;
            } else {
                throw new Error(response.data.message || "Failed to create contract");
            }
        } catch (error) {
            // Ensure loading state is reset and error is set
            set({ 
                isLoading: false,
                error: error.response?.data?.message || error.message || "Error creating contract"
            });
            
            // Re-throw the error to be handled by the component
            toast.error(error.response?.data?.message || error.message || "Error creating contract");
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
            // Create FormData object
            let formData;
            
            // If submissionData is already FormData, use it directly
            if (submissionData instanceof FormData) {
                formData = submissionData;
            } else {
                formData = new FormData();
                // Add files if they exist
                if (submissionData.files) {
                    submissionData.files.forEach(file => {
                        formData.append('files', file);
                    });
                }
                // Add comments if they exist
                if (submissionData.comments) {
                    formData.append('comments', submissionData.comments);
                }
            }

            // Add submission date
            formData.append('submittedAt', new Date().toISOString());

            const response = await axios.post(
                `${API_URL}/${contractId}/milestones/${milestoneId}/submit`,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );

            set(state => {
                // Deep clone the contract to avoid mutation
                const updatedContracts = state.contracts.map(contract => {
                    if (contract._id === contractId) {
                        const updatedContract = JSON.parse(JSON.stringify(contract));
                        const milestone = updatedContract.milestones.find(m => m._id === milestoneId);
                        
                        if (milestone) {
                            // Ensure the submission has a submittedAt date
                            if (milestone.currentSubmission && !milestone.currentSubmission.submittedAt) {
                                milestone.currentSubmission.submittedAt = new Date().toISOString();
                            }
                        }
                        return updatedContract;
                    }
                    return contract;
                });

                return {
                    contracts: updatedContracts,
                    currentContract: response.data.contract,
                    isLoading: false
                };
            });
            
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
    reviewSubmission: async (contractId, milestoneId, status, feedback = '') => {
        set({ isLoading: true, error: null });
        try {
            const response = await axios.post(
                `${API_URL}/${contractId}/milestones/${milestoneId}/review`,
                { status, feedback }
            );

            // Update the contracts in the store
            set(state => {
                const updatedContracts = state.contracts.map(contract => {
                    if (contract._id === contractId) {
                        // Deep clone the contract to avoid mutation
                        const updatedContract = JSON.parse(JSON.stringify(contract));
                        const milestone = updatedContract.milestones.find(m => m._id === milestoneId);
                        
                        if (milestone) {
                            // Update milestone status
                            milestone.status = status === "approved" ? "completed" : "changes_requested";
                            
                            // Update current submission status and add feedback
                            if (milestone.currentSubmission) {
                                const now = new Date().toISOString();
                                milestone.currentSubmission.status = status;
                                milestone.currentSubmission.clientFeedback = feedback;
                                milestone.currentSubmission.feedbackAt = now;
                                
                                // Move current submission to history with the correct status and dates
                                if (!milestone.submissionHistory) {
                                    milestone.submissionHistory = [];
                                }
                                milestone.submissionHistory.push({
                                    ...milestone.currentSubmission,
                                    status: status,
                                    submittedAt: milestone.currentSubmission.submittedAt || now, // Preserve original submission date
                                    feedbackAt: now
                                });
                                milestone.currentSubmission = null;
                            }
                        }
                        return updatedContract;
                    }
                    return contract;
                });

                return {
                    contracts: updatedContracts,
                    isLoading: false
                };
            });

            return response.data.contract;
        } catch (error) {
            set({ 
                error: error.response?.data?.message || "Error reviewing submission",
                isLoading: false 
            });
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

            set(state => ({
                contracts: state.contracts.map(contract =>
                    contract._id === contractId ? response.data.contract : contract
                ),
                currentContract: response.data.contract,
                isLoading: false
            }));

            return response.data.contract;
        } catch (error) {
            set({ 
                error: error.response?.data?.message || "Error releasing payment",
                isLoading: false 
            });
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
    },

    // Get my contracts
    getMyContracts: async () => {
        set({ isLoading: true, error: null });
        try {
            const response = await axios.get(`${API_URL}/my/contracts`);
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

    // Complete contract
    completeContract: async (contractId) => {
        set({ isLoading: true, error: null });
        try {
            const response = await axios.post(`${API_URL}/${contractId}/complete`);
            
            set(state => ({
                contracts: state.contracts.map(contract =>
                    contract._id === contractId ? response.data.contract : contract
                ),
                currentContract: response.data.contract,
                isLoading: false
            }));

            return response.data.contract;
        } catch (error) {
            set({ 
                error: error.response?.data?.message || "Error completing contract",
                isLoading: false 
            });
            throw error;
        }
    }
})); 