import { create } from 'zustand';

export const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,

  setUser(user) {
    set({
      user,
      isAuthenticated: true,
    });
  },

  logout() {
    localStorage.removeItem('token');

    set({
      user: null,
      isAuthenticated: false,
    });
  },
}));
