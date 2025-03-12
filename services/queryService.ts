import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import apiService from './requestServices';
import { ApiResponse, RequestStatus } from './types';
import { storedData$ } from '@/context/LocalstoreContext';

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

export const useCheckStatus = () => {
  return useMutation({
    mutationFn: (email: string) => apiService.checkStatus(email),
    onSuccess: (data) => {
      // @ts-ignore
      const status = data?.requests[0]?.status;
      if (status === 'approved') {
        storedData$.isAlegresNuevasUnlocked.set(true);
        storedData$.hasRequestAccess.set(true);
      }
    }
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
