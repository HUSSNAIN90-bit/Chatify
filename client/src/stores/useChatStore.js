import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set, get) => ({
  chats: [],
  messages: [],
  activeTab: "chats",
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,
  isSoundEnabled: JSON.parse(localStorage.getItem("isSoundEnabled")) === true,

  // ✅ Toggle message sound
  toggleSound: () => {
    const newState = !get().isSoundEnabled;
    localStorage.setItem("isSoundEnabled", newState);
    set({ isSoundEnabled: newState });  
  },

  // ✅ UI state
  setActiveTab: (tab) => set({ activeTab: tab }),
  setSelectedUser: (selectedUser) => set({ selectedUser }),

  // ✅ Fetch chat partners
  getMyChatPartners: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/chats");
      set({ chats: res.data });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load chats");
    } finally {
      set({ isUsersLoading: false });
    }
  },

  // ✅ Fetch messages by user
  getMessagesByUserId: async (userId) => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/messages/${userId}`);
      set({ messages: res.data });
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  // ✅ Send message (with optimistic update)
  sendMessage: async (messageData) => {
    const { selectedUser, messages } = get();
    const { authUser } = useAuthStore.getState();

    const tempId = `temp-${Date.now()}`;
    const optimisticMessage = {
      _id: tempId,
      senderId: authUser._id,
      receiverId: selectedUser._id,
      text: messageData.text,
      image: messageData.image,
      createdAt: new Date().toISOString(),
      isOptimistic: true,
    };

    set({ messages: [...messages, optimisticMessage] });

    try {
      const res = await axiosInstance.post(
        `/messages/send/${selectedUser._id}`,
        messageData
      );

      // Replace temporary message with server one
      set({
        messages: get().messages.map((msg) =>
          msg._id === tempId ? res.data : msg
        ),
      });
    } catch (error) {
      set({
        messages: get().messages.filter((msg) => msg._id !== tempId),
      });
      toast.error(error.response?.data?.message || "Message failed to send");
    }
  },

  // ✅ Subscribe to message events
  // Enhanced: Now updates local messages state on "messagesRead" socket event for real-time read status!
  subscribeToMessages: () => {
    const socket = useAuthStore.getState().socket;
    const { selectedUser, markAsRead } = get();

    if (!socket || !selectedUser) return;

    // Remove existing listeners to prevent duplicates
    socket.off("newMessage");
    socket.off("messagesRead");

    // Listen for new messages relevant to this chat
    socket.on("newMessage", (newMessage) => {
      const { selectedUser, isSoundEnabled } = get();

      // Only append if message is for the open conversation
      if (
        newMessage.senderId === selectedUser._id ||
        newMessage.receiverId === selectedUser._id
      ) {
        set({ messages: [...get().messages, newMessage] });

        // Optional: Play sound if enabled
        if (isSoundEnabled) {
          const sound = new Audio("/sounds/notification.mp3");
          sound.currentTime = 0;
          sound.play().catch(() => {});
        }
      }
    });

    // ⚡️ Listen for "messagesRead" event to update isReaded status on the sender side in real time
    socket.on("messagesRead", ({ senderId, readerId }) => {
      // If I am the sender and "readerId" is the open chat, update our local messages state
      const { authUser } = useAuthStore.getState();
      // Only update if current user is the sender (i.e., for outgoing messages)
      if (
        authUser &&
        selectedUser &&
        authUser._id === senderId &&
        selectedUser._id === readerId
      ) {
        set({
          messages: get().messages.map((m) =>
            m.senderId === senderId ? { ...m, isReaded: true } : m
          ),
        });
      }
    });

    // Make sure we mark as read on subscribe, so the receiver's client marks their side
    markAsRead(selectedUser._id);
  },

  // ✅ Unsubscribe (for cleanup)
  unSubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket) return;
    socket.off("newMessage");
    socket.off("messagesRead");
  },

  // ✅ Mark messages as read (fixed: do not remove any messages from state, 
  // and now handled for real-time sender update via socket/event)
  markAsRead: async (senderId) => {
    const socket = useAuthStore.getState().socket;
    const { messages } = get();

    try {
      await axiosInstance.post("/messages/readed", { senderId });
      // Local: Immediately mark as read on UI for receiver side
      const updated = messages.map((m) =>
        m.senderId === senderId ? { ...m, isReaded: true } : m
      );
      set({ messages: updated });
      // No need to emit markAsRead manually, handled by server & reflected to sender via "messagesRead" event
    } catch (error) {
      console.error("Failed to mark messages as read:", error);
    }
  },
}));
