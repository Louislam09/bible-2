// apiService.ts
import { ApiResponse, RequestStatus } from './types';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

// Default fetch options
const defaultOptions = {
    headers: {
        'Content-Type': 'application/json',
    },
    // Note: fetch doesn't support timeout directly, would need AbortController for that
};

const apiService = {
    requestAccess: async (name: string, email: string): Promise<ApiResponse<RequestStatus>> => {
        try {
            const response = await fetch(`${API_BASE_URL}/request-access`, {
                method: 'POST',
                ...defaultOptions,
                body: JSON.stringify({ name, email })
            });
            return handleResponse<ApiResponse<RequestStatus>>(response);
        } catch (error) {
            throw handleApiError(error);
        }
    },

    checkStatus: async (email: string): Promise<ApiResponse<RequestStatus>> => {
        try {
            const response = await fetch(`${API_BASE_URL}/check-status`, {
                method: 'POST',
                ...defaultOptions,
                body: JSON.stringify({ email })
            });
            return handleResponse<ApiResponse<RequestStatus>>(response);
        } catch (error) {
            throw handleApiError(error);
        }
    },

    getAllRequests: async (): Promise<ApiResponse<RequestStatus[]>> => {
        try {
            const response = await fetch(`${API_BASE_URL}/requests`, {
                method: 'GET',
                ...defaultOptions
            });
            return handleResponse<ApiResponse<RequestStatus[]>>(response);
        } catch (error) {
            throw handleApiError(error);
        }
    },

    updateRequestStatus: async (id: string, status: RequestStatus['status']): Promise<ApiResponse<RequestStatus>> => {
        try {
            const response = await fetch(`${API_BASE_URL}/requests/${id}`, {
                method: 'PUT',
                ...defaultOptions,
                body: JSON.stringify({ status })
            });
            return handleResponse<ApiResponse<RequestStatus>>(response);
        } catch (error) {
            throw handleApiError(error);
        }
    },

    deleteRequest: async (id: string): Promise<ApiResponse<void>> => {
        try {
            const response = await fetch(`${API_BASE_URL}/requests/${id}`, {
                method: 'DELETE',
                ...defaultOptions
            });
            return handleResponse<ApiResponse<void>>(response);
        } catch (error) {
            throw handleApiError(error);
        }
    },
};

// Helper function to handle fetch responses
const handleResponse = async <T>(response: Response): Promise<T> => {
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData?.message || `Error: ${response.status} ${response.statusText}`;
        throw new Error(errorMessage);
    }
    return await response.json() as T;
};

const handleApiError = (error: unknown): Error => {
    if (error instanceof Error) {
        // For network errors or other exceptions
        return error;
    }
    return new Error('Failed to send request');
};

export default apiService;