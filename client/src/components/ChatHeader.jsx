import { Contact2Icon, ContactIcon, UserRoundPlus, XIcon } from "lucide-react";
import { useChatStore } from "../stores/useChatStore";
import { useEffect } from "react";
import { useAuthStore } from "../stores/useAuthStore";
import { parsePhoneNumberFromString } from "libphonenumber-js";
import { useContactStore } from "../stores/useContactStore";

function ChatHeader() {
  const { selectedUser, setSelectedUser } = useChatStore();
  const { onlineUsers } = useAuthStore();
  const { setContactPhoneNumber, setContactFullName, setContactAdd } =
    useContactStore();
  const isOnline = selectedUser?._id
    ? onlineUsers.includes(String(selectedUser._id))
    : false;

  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === "Escape") setSelectedUser(null);
    };

    window.addEventListener("keydown", handleEscKey);

    // cleanup function
    return () => window.removeEventListener("keydown", handleEscKey);
  }, [setSelectedUser]);

  const formatPhoneNumber = (number, regionCode = "PK") => {
    try {
      const cleanNumber = number?.toString().trim();

      const phoneNumber = parsePhoneNumberFromString(
        `+${cleanNumber}`,
        regionCode.toUpperCase()
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
    <div
      className="flex justify-between items-center bg-slate-800/50 border-b
   border-slate-700/50 max-h-[84px] px-6 flex-1"
    >
      <div className="flex items-center space-x-3">
        <div className={`avatar ${isOnline ? "online" : "offline"}`}>
          <div className="w-12 rounded-full">
            <img
              src={selectedUser.profilePic || "/avatar.png"}
              alt={
                selectedUser.name ? selectedUser.name : selectedUser.fullName
              }
            />
          </div>
        </div>

        <div>
          <h3 className="text-slate-200 font-medium">
            {selectedUser.isContact
              ? selectedUser.displayName
              : formatPhoneNumber(
                  selectedUser.phoneNumber,
                  selectedUser.region
                )}
          </h3>
          <p className="text-slate-400 text-sm">
            {isOnline ? "Online" : "Offline"}
          </p>
        </div>
      </div>

      <div className="flex justify-center items-center gap-5">
        {!selectedUser.isContact && (
          <button
            onClick={() => {
              setContactAdd();
              setContactFullName(selectedUser.fullName);
              setContactPhoneNumber(selectedUser.phoneNumber);
            }}
          >
            <UserRoundPlus className="w-5 h-5 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer" />
          </button>
        )}

        <button onClick={() => setSelectedUser(null)}>
          <XIcon className="w-5 h-5 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer" />
        </button>
      </div>
    </div>
  );
}
export default ChatHeader;
