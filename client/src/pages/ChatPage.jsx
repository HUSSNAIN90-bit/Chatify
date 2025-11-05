import { useChatStore } from "../stores/useChatStore";

import BorderAnimatedContainer from "../components/BorderAnimatedContainer";
import ProfileHeader from "../components/ProfileHeader";
import ActiveTabSwitch from "../components/ActiveTabSwitch";
import ChatsList from "../components/ChatsList";
import ContactList from "../components/ContactList.jsx";
import ChatContainer from "../components/ChatContainer";
import NoConversationPlaceholder from "../components/NoConversationPlaceholder";
import { useAuthStore } from "../stores/useAuthStore";

function ChatPage() {
  const { activeTab, selectedUser } = useChatStore();
  const {isSelectedUser} = useAuthStore();

  return (
    <div className="relative w-[calc(100vw-64px)] h-[calc(100vh-64px)]  max-sm:w-full max-sm:h-full">
      <BorderAnimatedContainer>
        {/* LEFT SIDE */}
        <div className={`w-80 bg-slate-800/50 backdrop-blur-sm flex flex-col ${selectedUser ? "max-sm:hidden" : "max-sm:block max-sm:w-full"}`}>
          <ProfileHeader />
          <ActiveTabSwitch />

          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {activeTab === "chats" ? <ChatsList /> : <ContactList />}
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className={`flex-1 flex flex-col bg-slate-900/50 backdrop-blur-sm ${!selectedUser ? "max-sm:hidden" : "max-sm:block max-sm:w-full"}`}>
          {selectedUser ? <ChatContainer /> : <NoConversationPlaceholder />}
        </div>
      </BorderAnimatedContainer>
    </div>
  );
}
export default ChatPage;