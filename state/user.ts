import {create} from "zustand";

type useUserStoreType = {
  user: User | null;
  setUser: (user: any) => void;
  getAccessToken: () => string | null;
  setAccessToken: (token: string | null) => void;
  clearUser: () => void;
};

type User = {
  id: string;
  firstName: string;
  lastName: string;
  threadIds: string[];
  courses: string[];
  accessToken?: string;
};
const useUserStore = create<useUserStoreType>((set, get) => ({
  user: null,
  setUser: (user) => set({ user }),
  getAccessToken: () => {
    return get().user?.accessToken || null;
  },
  setAccessToken: (token: string | null) => {
    set((state) => ({
      user: state.user ? { ...state.user, accessToken: token || undefined } : null,
    }));
  },
  clearUser: () => set({ user: null }),
}));

export default useUserStore;