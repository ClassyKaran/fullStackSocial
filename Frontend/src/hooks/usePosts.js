export function useUnlikePost() {
  const queryClient = useQueryClient()
  return useMutation(postsApi.unlikePost, {
    onSuccess: () => {
      queryClient.invalidateQueries(['posts'])
    },
  })
}
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as postsApi from '../api/posts'

export function usePosts() {
  return useQuery(['posts'], postsApi.getPosts)
}

export function useCreatePost() {
  const queryClient = useQueryClient()
  return useMutation(postsApi.createPost, {
    onSuccess: () => {
      queryClient.invalidateQueries(['posts'])
    },
  })
}

export function useLikePost() {
  const queryClient = useQueryClient()
  return useMutation(postsApi.likePost, {
    onSuccess: () => {
      queryClient.invalidateQueries(['posts'])
    },
  })
}

export function useCommentOnPost() {
  const queryClient = useQueryClient()
  return useMutation(({ postId, text }) => postsApi.commentOnPost(postId, text), {
    onSuccess: () => {
      queryClient.invalidateQueries(['posts'])
    },
  })
}

// Delete comment mutation
export function useDeleteComment() {
  const queryClient = useQueryClient();
  return useMutation(({ postId, commentId }) => postsApi.deleteComment(postId, commentId), {
    onSuccess: () => {
      queryClient.invalidateQueries(['posts']);
    },
  });
}

// Delete post mutation
export function useDeletePost() {
  const queryClient = useQueryClient();
  return useMutation((postId) => {
    const token = localStorage.getItem('token');
    return postsApi.deletePost(postId, token);
  }, {
    onSuccess: () => {
      queryClient.invalidateQueries(['userPosts']);
      queryClient.invalidateQueries(['posts']);
    },
  });
}
