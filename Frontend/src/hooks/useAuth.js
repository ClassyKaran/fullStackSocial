import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import * as authApi from '../api/auth';


export function useLogin() {
  const queryClient = useQueryClient();
  return useMutation(({ email, password }) => authApi.login({ email, password }), {
    onSuccess: (data) => {
      localStorage.setItem('token', data.data.token);
      queryClient.invalidateQueries(['auth', 'user']);
    },
  });
}


export function useRegister() {
  const queryClient = useQueryClient();
  return useMutation(({ username, email, password }) => authApi.register({ username, email, password }), {
    onSuccess: (data) => {
      localStorage.setItem('token', data.data.token);
      queryClient.invalidateQueries(['auth', 'user']);
    },
  });
}

export function useAuth(userId) {
  const queryClient = useQueryClient();

  // Fetch user profile
  const { data, isLoading, isError, refetch } = useQuery(['profile', userId], async () => {
    const token = localStorage.getItem('token');
    const res = await authApi.getProfile(userId, token);
    return res.data;
  }, {
    enabled: !!userId,
  });

  // Follow user
  const followMutation = useMutation(() => authApi.followUser(userId), {
    onSuccess: () => queryClient.invalidateQueries(['profile', userId]),
  });

  // Unfollow user
  const unfollowMutation = useMutation(() => authApi.unfollowUser(userId), {
    onSuccess: () => queryClient.invalidateQueries(['profile', userId]),
  });

  return {
    data,
    isLoading,
    isError,
    follow: followMutation.mutate,
    unfollow: unfollowMutation.mutate,
    refetch,
  };
}
