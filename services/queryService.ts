import { storedData$ } from '@/context/LocalstoreContext';
import { pb } from '@/globalConfig';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { RequestStatus } from './types';

// Request Access Mutation
export const useRequestAccess = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ name, email }: { name: string; email: string }) => {
      try {
        const response = await pb.collection('access_requests').create({
          name,
          user: email,
          status: 'pending',
        });
        return response;
      } catch (error) {
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['requests'] });
    }
  });
};

// Check Status Mutation
export const useCheckStatus = () => {
  return useMutation({
    mutationFn: async (email: string) => {
      try {
        const requests = await pb.collection('access_requests').getFullList(200, {
          filter: `user="${email}"`, // Filter by email
        });
        return requests;
      } catch (error) {
        throw error;
      }
    },
    onSuccess: (data) => {
      const status = data?.[0]?.status;
      if (status === 'approved') {
        storedData$.isAlegresNuevasUnlocked.set(true);
        storedData$.hasRequestAccess.set(true);
      }
    }
  });
};

export const useGetAllRequests = () => {
  const getAllRequests = async () => {
    try {
      const allRequests = await pb.collection('access_requests').getFullList({
        sort: '-created'
      });
      console.log({ allRequests: allRequests.length })
      return allRequests;
    } catch (error) {
      console.log({ error })
      throw error;
    }
  };
  return useQuery({
    queryKey: ['requests'],
    queryFn: getAllRequests,
    staleTime: 0, // Data is always considered stale
  });
};

export const useUpdateRequestStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: RequestStatus['status'] }) => {
      console.log({ id, status })
      try {
        const updatedRequest = await pb.collection('access_requests').update(id, {
          status,
        });
        return updatedRequest;
      } catch (error) {
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['requests'] });
    }
  });
};

export const useDeleteRequest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      try {
        await pb.collection('access_requests').delete(id);
      } catch (error) {
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['requests'] });
    }
  });
};
