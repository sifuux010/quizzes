import { jwtDecode } from 'jwt-decode';

export const decodeToken = (token: string) => {
  try {
    return jwtDecode(token) as { id: string; email: string; exp?: number };
  } catch {
    return null;
  }
};

export const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
  };
};
