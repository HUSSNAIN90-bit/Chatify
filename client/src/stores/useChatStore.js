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

  setActiveTab: (tab) => set({ activeTab: tab }),
  setSelectedUser: (selectedUser) => set({ selectedUser }),

  // ✅ Fetch all chats
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
    const { selectedUser, messages, chats } = get();
    const { authUser, socket } = useAuthStore.getState();

    const tempId = `temp-${Date.now()}`;
    const optimisticMessage = {
      _id: tempId,
      senderId: authUser._id,
      receiverId: selectedUser._id,
      text: messageData.text,
      image: messageData.image,
      createdAt: new Date().toISOString(),
      isReaded: false,
      isOptimistic: true,
    };

    // 🟡 Optimistic add to UI
    set({ messages: [...messages, optimisticMessage] });

    try {
      const res = await axiosInstance.post(
        `/messages/send/${selectedUser._id}`,
        messageData
      );

      // Replace temporary message with actual one
      const updatedMessages = get().messages.map((msg) =>
        msg._id === tempId ? res.data : msg
      );

      // ✅ Update messages in UI
      set({ messages: updatedMessages });

      // ✅ Also update chats (move this user to top + update lastMessage)
      const partner = chats.find((chat) => chat._id === selectedUser._id);
      if (partner) {
        partner.lastMessage = res.data;
        const updatedChats = [
          partner,
          ...chats.filter((chat) => chat._id !== partner._id),
        ];
        set({ chats: updatedChats });
      }

      // ✅ Notify server (optional, for real-time updates)
      socket?.emit("newMessage", res.data);
    } catch (error) {
      set({
        messages: get().messages.filter((msg) => msg._id !== tempId),
      });
      toast.error(error.response?.data?.message || "Message failed to send");
    }
  },
  // ✅ Real-time Subscriptions for All Chats
  // Unified subscription for all and selected user chat
  subscribeMessages: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket) return;

    // 🧹 Remove previous listeners to prevent duplicates
    socket.off("newMessage");
    socket.off("messagesRead");

    socket.on("newMessage", (newMessage) => {
      const { chats, selectedUser } = get();
      const { authUser } = useAuthStore.getState();

      // Is this message for the selected chat user?
      const isActiveChat =
        selectedUser &&
        (newMessage.senderId === selectedUser._id ||
          newMessage.receiverId === selectedUser._id);

      if (isActiveChat) {
        // 📲 Add new message to the open chat UI
        set({ messages: [...get().messages, newMessage] });

        // 🧠 Update lastMessage for the selected chat (but don't move chat to top)
        const { chats } = get();
        const partnerIndex = chats.findIndex(
          (chat) => chat._id === selectedUser._id
        );
        if (partnerIndex !== -1) {
          const updatedChats = [...chats];
          updatedChats[partnerIndex] = {
            ...updatedChats[partnerIndex],
            lastMessage: newMessage,
          };
          set({ chats: updatedChats });
        }
      } else {
        // Message is not for currently opened chat, update chats list
        const partner = chats.find(
          (chat) =>
            chat._id === newMessage.senderId ||
            chat._id === newMessage.receiverId
        );
        if (partner) {
          // Update their lastMessage and move to top
          partner.lastMessage = newMessage;
          const updatedChats = [
            partner,
            ...chats.filter((chat) => chat._id !== partner._id),
          ];
          set({ chats: updatedChats });
        }
        // 🟠 Optionally: Add to chats if chat doesn't exist (for new/external contacts)
        // if (!partner && newMessage.sender && newMessage.sender._id !== authUser._id) {
        //   set({ chats: [newMessage.sender, ...chats] });
        // }

        // 🔊 Play notification if new message is for me & not from myself, and sound is enabled
        if (authUser._id !== newMessage.senderId && get().isSoundEnabled) {
          const sound = new Audio("/sounds/notification.mp3");
          sound.currentTime = 0;
          sound.play().catch(() => {});
        }
      }
    });

    socket.on("messagesRead", ({ senderId, readerId }) => {
      const { chats, selectedUser } = get();
      const { authUser } = useAuthStore.getState();

      // If senderId is my id, update my outgoing messages
      if (authUser && authUser._id === senderId) {
        // If I am viewing the chat with this reader
        if (selectedUser && selectedUser._id === readerId) {
          // Mark all my messages as read in state
          set({
            messages: get().messages.map((m) =>
              m.senderId === senderId ? { ...m, isReaded: true } : m
            ),
          });

          // Update lastMessage in current chat
          const partnerIndex = chats.findIndex(
            (chat) => chat._id === selectedUser._id
          );
          if (partnerIndex !== -1) {
            const updatedChats = [...chats];
            if (updatedChats[partnerIndex].lastMessage) {
              updatedChats[partnerIndex].lastMessage.isReaded = true;
            }
            set({ chats: updatedChats });
          }
        } else {
          // Find that chat and update only lastMessage.isReaded
          const partnerIndex = chats.findIndex((chat) => chat._id === readerId);
          if (partnerIndex !== -1) {
            const updatedChats = [...chats];
            if (updatedChats[partnerIndex].lastMessage) {
              updatedChats[partnerIndex].lastMessage.isReaded = true;
            }
            set({ chats: updatedChats });
          }
        }
      }
    });
  },

  // ✅ Unsubscribe for cleanup (from all message listeners)
  unSubscribeMessages: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket) return;
    socket.off("newMessage");
    socket.off("messagesRead");
  },

  // ✅ Mark messages as read
  markAsRead: async (senderId) => {
    const socket = useAuthStore.getState().socket;
    const { messages } = get();

    try {
      await axiosInstance.post("/messages/readed", { senderId });

      // Immediately reflect in UI
      const updated = messages.map((m) =>
        m.senderId === senderId ? { ...m, isReaded: true } : m
      );
      set({ messages: updated });

      // Emit to notify sender
      socket?.emit("messagesRead", {
        senderId,
        readerId: useAuthStore.getState().authUser._id,
      });
    } catch (error) {
      console.error("Failed to mark messages as read:", error);
    }
  },
}));
