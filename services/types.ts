export interface AccessRequest {
    name: string;
    email: string;
}

export interface RequestStatus {
    id: string;
    name: string;
    email: string;
    status: 'pending' | 'approved' | 'rejected';
    createdAt: string;
    updatedAt: string;
}

export interface ApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
}
