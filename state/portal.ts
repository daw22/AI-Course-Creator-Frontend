import { create } from "zustand";

type PortalType = "signIn" | "signUp" | "Rewind" |null;

type PortalState = {
  type: PortalType;
  openPortal: (portalType: PortalType) => void;
  closePortal: () => void;
};

const usePortalStore = create<PortalState>((set) => ({
  type: null,
  openPortal: (portalType: PortalType) => set({ type: portalType }),
  closePortal: () => set({ type: null }),
}));

export default usePortalStore;