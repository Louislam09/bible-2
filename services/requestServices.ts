// apiService.ts
import axios, { AxiosError, AxiosInstance } from 'axios';
import { AccessRequest, ApiResponse, RequestStatus } from './types';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

const apiClient: AxiosInstance = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000, // 10 seconds timeout
});

const apiService = {
    requestAccess: async (name: string, email: string): Promise<ApiResponse<RequestStatus>> => {
        try {
            const response = await apiClient.post<ApiResponse<RequestStatus>>('/request-access', { name, email });
            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    },

    checkStatus: async (email: string): Promise<ApiResponse<RequestStatus>> => {
        try {
            const response = await apiClient.post<ApiResponse<RequestStatus>>('/check-status', { email });
            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    },

    getAllRequests: async (): Promise<ApiResponse<RequestStatus[]>> => {
        try {
            const response = await apiClient.get<ApiResponse<RequestStatus[]>>('/requests');
            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    },

    updateRequestStatus: async (id: string, status: RequestStatus['status']): Promise<ApiResponse<RequestStatus>> => {
        try {
            const response = await apiClient.put<ApiResponse<RequestStatus>>(`/requests/${id}`, { status });
            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    },

    deleteRequest: async (id: string): Promise<ApiResponse<void>> => {
        try {
            const response = await apiClient.delete<ApiResponse<void>>(`/requests/${id}`);
            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    },
};

const handleApiError = (error: unknown): Error => {
    if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<{ message: string }>;
        if (axiosError.response) {
            const { status, data } = axiosError.response;

            switch (status) {
                case 400:
                    return new Error(data?.message || 'Invalid input');
                case 404:
                    return new Error(data?.message || 'Resource not found');
                case 409:
                    return new Error(data?.message || 'Email already registered');
                default:
                    return new Error(data?.message || 'An unexpected error occurred');
            }
        } else if (axiosError.request) {
            return new Error('No response from server. Please check your connection');
        }
    }
    return new Error('Failed to send request');
};

export default apiService;