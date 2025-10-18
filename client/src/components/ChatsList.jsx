import { useEffect } from "react";
import { useChatStore } from "../stores/useChatStore";
import { useContactStore } from "../stores/useContactStore";
import UsersLoadingSkeleton from "./UsersLoadingSkeleton";
import NoChatsFound from "./NoChatsFound";
import { useAuthStore } from "../stores/useAuthStore";
import { parsePhoneNumberFromString } from "libphonenumber-js";
import { PlusIcon } from "lucide-react";

function ChatsList() {
  const { getMyChatPartners, chats, isUsersLoading, setSelectedUser } =
    useChatStore();
  const { onlineUsers } = useAuthStore();
  const {setContactAdd} = useContactStore();

  useEffect(() => {
    getMyChatPartners();
  }, [getMyChatPartners]);

  if (isUsersLoading) return <UsersLoadingSkeleton />;
  if (chats.length == 0) return <NoChatsFound />;

  const formatPhoneNumber = (number, regionCode = "PK") => {
    try {
      // Clean up the number (remove spaces, etc.)
      const cleanNumber = number?.toString().trim();

      // Parse the number using the provided ISO region code (like "PK", "US", "IN")
      const phoneNumber = parsePhoneNumberFromString(
        `+${cleanNumber}`,
        regionCode.toUpperCase()
      );

      // Return nicely formatted number if valid
      if (phoneNumber && phoneNumber.isValid()) {
        return phoneNumber.formatInternational(); // e.g. "+92 300 1234567"
      }

      // fallback if invalid
      return `+${cleanNumber}`;
    } catch (err) {
      console.error("Phone format error:", err);
      return `+${number}`;
    }
  };

  return (
    <>
      {chats.map((chat) => {
        return (
          <div
            key={chat._id}
            className="bg-cyan-500/10 p-4 rounded-lg cursor-pointer hover:bg-cyan-500/20 transition-colors"
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
              <h4 className="text-slate-200 font-medium truncate">
                {chat.displayName
                  ? chat.displayName
                  : formatPhoneNumber(chat.phoneNumber, chat.region)}
              </h4>
            </div>
          </div>
        );
      })}
      <button onClick={()=>setContactAdd()} className="btn btn-circle bg-cyan-800 hover:bg-cyan-900 absolute bottom-5 right-5">
        <PlusIcon />
      </button>
      
    </>
  );
}

export default ChatsList;
