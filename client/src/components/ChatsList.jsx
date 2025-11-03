import { useEffect } from "react";
import { useChatStore } from "../stores/useChatStore";
import { useContactStore } from "../stores/useContactStore";
import UsersLoadingSkeleton from "./UsersLoadingSkeleton";
import NoChatsFound from "./NoChatsFound";
import { useAuthStore } from "../stores/useAuthStore";
import { parsePhoneNumberFromString } from "libphonenumber-js";
import { CheckCheck, PlusIcon } from "lucide-react";

function ChatsList() {
  const {
    getMyChatPartners,
    chats,
    subscribeMessages,
    isUsersLoading,
    setSelectedUser,
  } = useChatStore();
  const { onlineUsers, authUser } = useAuthStore();
  const { setContactAdd } = useContactStore();

  useEffect(() => {
    getMyChatPartners();
    subscribeMessages();
    // Cleanup subscriptions on unmount
    return () => {
      if (typeof useChatStore.getState().unSubscribeMessages === "function") {
        useChatStore.getState().unSubscribeMessages();
      }
    };
  }, [getMyChatPartners]);

  if (isUsersLoading) return <UsersLoadingSkeleton />;
  if (chats.length === 0) return <NoChatsFound />;

  const formatPhoneNumber = (number, regionCode = "PK") => {
    try {
      const cleanNumber = number?.toString().trim();
      const phoneNumber = parsePhoneNumberFromString(
        `+${cleanNumber}`,
        regionCode?.toUpperCase?.() || "PK"
      );
      if (phoneNumber && phoneNumber.isValid()) {
        return phoneNumber.formatInternational();
      }
      return `+${cleanNumber}`;
    } catch (err) {
      console.error("Phone format error:", err);
      return `+${number}`;
    }
  };

  return (
    <>
      {chats.map((chat) => {
        const lastMessage = chat.lastMessage || {};
        const isMeSender = lastMessage.senderId === authUser?._id;

        return (
          <div
            key={chat._id}
            className="bg-cyan-500/10 p-3 rounded-lg cursor-pointer relative hover:bg-cyan-500/20 transition-colors"
            onClick={() => setSelectedUser(chat)}
          >
            <div className="flex items-center gap-3">
              <div
                className={`avatar ${
                  Array.isArray(onlineUsers) && onlineUsers.includes(chat._id)
                    ? "online"
                    : "offline"
                }`}
              >
                <div className="size-12 rounded-full">
                  <img
                    src={chat.profilePic || "/avatar.png"}
                    alt={chat.displayName}
                  />
                </div>
              </div>
              <div className="flex flex-col min-w-0 w-full">
                <h4 className="text-slate-200 font-medium truncate">
                  {chat.displayName
                    ? chat.displayName
                    : formatPhoneNumber(chat.phoneNumber, chat.region)}
                </h4>
                <p className="text-xs flex gap-1">
                  <span>
                    {isMeSender && (
                      <CheckCheck
                        className={`size-4 ${
                          lastMessage.isReaded
                            ? "text-green-500"
                            : "text-gray-900"
                        }`}
                      />
                    )}
                  </span>
                  <span className="truncate">
                    {(() => {
                      const text = lastMessage.text || "";
                      const words = text.trim().split(/\s+/);
                      if (words.length > 4) {
                        return words.slice(0, 4).join(" ") + " ...";
                      }
                      return text;
                    })()}
                  </span>
                </p>
              </div>
              {!!chat.unreadCount && (
                <div className="size-5 flex justify-center absolute right-5 items-center bg-green-500 rounded-full">
                  <span className="text-black text-xs">
                    {chat.unreadCount}
                  </span>
                </div>
              )}
            </div>
          </div>
        );
      })}
      <button
        onClick={() => setContactAdd()}
        className="btn btn-circle bg-cyan-800 hover:bg-cyan-900 absolute bottom-5 right-5"
      >
        <PlusIcon />
      </button>
    </>
  );
}

export default ChatsList;
