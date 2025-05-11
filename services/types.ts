export interface AccessRequest {
  name: string;
  email: string;
}

export interface RequestStatus {
  id: string;
  name: string;
  status: "pending" | "approved" | "rejected";
  created: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}
