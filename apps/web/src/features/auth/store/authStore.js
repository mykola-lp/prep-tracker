import { create } from 'zustand';

import { storage } from '@/lib/storage';

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
    storage.removeToken();

    set({
      user: null,
      isAuthenticated: false,
    });
  },
}));
