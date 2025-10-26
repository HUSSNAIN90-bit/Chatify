import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

export const useContactStore = create((set, get) => ({
  allContacts: [],
  isUsersLoading: false,
  isContactAdding: false,
  contactAdd: false,
  contactFullName: "",
  contactPhoneNumber: "",

  setContactAdd: () =>
    set({
      contactAdd: !get().contactAdd,
      contactFullName: "",
      contactPhoneNumber: "",
    }),
  setContactFullName: (name) => set({ contactFullName: name }),
  setContactPhoneNumber: (phoneNumber) =>
    set({ contactPhoneNumber: phoneNumber }),

  getAllContacts: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/contacts/get");
      set({ allContacts: res.data });
    } catch (error) {
      toast.error(error?.response?.data?.message);
    } finally {
      set({ isUsersLoading: false });
    }
  },
  addContact: async (data) => {
    set({ isContactAdding: true });
    try {
      const contacts = get().allContacts;
      const res = await axiosInstance.post("/contacts/add", data);
      set({
        allContacts: [...contacts, res.data.contact],
      });
      toast.success(res.data.message);
      set({ contactAdd: false });
    } catch (err) {
      toast.error(err?.response?.data?.message);
    } finally {
      set({ isContactAdding: false });
    }
  },
}));
