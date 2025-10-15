import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import { toast } from "react-hot-toast";

export const useAuthStore = create((set) => ({
  authUser: null,
  isCheckingAuth: true,
  isSigningUp: false,
  isLoggingIn: false,

  checkAuth: async () => {
    try {
      const res = await axiosInstance.get("/auth/check");
      set({ authUser: res.data });
    } catch (error) {
      console.log("Error in checkAuth:", error);
      set({ authUser: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },
  signup: async (Data) => {
    set({ isSigningUp: true });
    try {
      const res = await axiosInstance.post("/auth/signup", Data);
      set({ authUser: res.data });
      toast.success("Account created successfully!");
    } catch (error) {
      console.log("Error in signup:", error);
      toast.error(
        error?.response?.data?.message || "Signup failed. Please try again."
      );
    } finally {
      set({ isSigningUp: false });
    }
  },
  login: async (Data) => {
    set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post("/auth/login", Data);
      set({ authUser: res.data });
      toast.success("Logged in successfully!");
    } catch (error) {
      console.log("Error in login:", error);
      toast.error(
        error?.response?.data?.message || "Login failed. Please try again."
      );
    } finally {
      set({ isLoggingIn: false });
    }
  },
  logout: async () => {
    try {
      await axiosInstance.post("/auth/logout");
      set({ authUser: null });
      toast.success("Logged out successfully!");
    } catch (error) {
      console.log("Error in logout:", error);
      toast.error("Logout failed. Please try again.");
    }
  },
}));
