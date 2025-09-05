import { api } from './api';
import type { User } from '../types';

export const UsersAPI = {
  list: () => api.get<User[]>('/users'),
  create: (u: Omit<User,'id'>) => api.post<User>('/users', u),
  update: (id: number, u: Omit<User,'id'>) => api.put<User>(`/users/${id}`, u),
  remove: (id: number) => api.del<{}>(`/users/${id}`)
};
