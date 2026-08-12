import { create } from 'zustand';

import { storage } from '@/lib/storage';

export const useAuthStore = create((set) => ({
  user: null,
  authStatus: storage.getToken() ? 'checking' : 'guest',

  setUser(user) {
    set({
      user,
      authStatus: 'authenticated',
    });
  },

  setGuest() {
    set({
      user: null,
      authStatus: 'guest',
    });
  },

  logout() {
    storage.removeToken();

    set({
      user: null,
      authStatus: 'guest',
    });
  },
}));
