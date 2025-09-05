import { api } from './api';
import type { Post } from '../types';

export const PostsAPI = {
  list: () => api.get<Post[]>('/posts'),
  byUser: (userId: number) => api.get<Post[]>(`/posts?userId=${userId}`),
  create: (p: Omit<Post,'id'>) => api.post<Post>('/posts', p),
  update: (id: number, p: Omit<Post,'id'>) => api.put<Post>(`/posts/${id}`, p),
  remove: (id: number) => api.del<{}>(`/posts/${id}`)
};
