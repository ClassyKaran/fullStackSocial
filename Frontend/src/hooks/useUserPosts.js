import { useQuery } from '@tanstack/react-query';
import * as postsApi from '../api/posts';

export function useUserPosts(userId) {
  return useQuery(['userPosts', userId], () => postsApi.getUserPosts(userId), {
    enabled: !!userId,
  });
}
