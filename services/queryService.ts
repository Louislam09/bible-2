import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import apiService from './requestServices';
import { ApiResponse, RequestStatus } from './types';

export const useRequestAccess = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ name, email }: { name: string; email: string }) => 
      apiService.requestAccess(name, email),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['requests'] });
    }
  });
};

export const useCheckStatus = (email: string) => {
  return useQuery({
    queryKey: ['requestStatus', email],
    queryFn: () => apiService.checkStatus(email),
    enabled: !!email
  });
};

export const useGetAllRequests = () => {
  return useQuery({
    queryKey: ['requests'],
    queryFn: () => apiService.getAllRequests()
  });
};

export const useUpdateRequestStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: RequestStatus['status'] }) =>
      apiService.updateRequestStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['requests'] });
    }
  });
};

export const useDeleteRequest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiService.deleteRequest(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['requests'] });
    }
  });
};
