import { MessageCircleIcon } from "lucide-react";
import { useChatStore } from "../stores/useChatStore";
import { useContactStore } from "../stores/useContactStore";
import { PlusIcon } from "lucide-react";

function NoChatsFound() {
  const { setActiveTab } = useChatStore();
  const { setContactAdd } = useContactStore();

  return (
    <div className="flex flex-col items-center justify-center py-10 text-center space-y-4">
      <div className="w-16 h-16 bg-cyan-500/10 rounded-full flex items-center justify-center">
        <MessageCircleIcon className="w-8 h-8 text-cyan-400" />
      </div>
      <div>
        <h4 className="text-slate-200 font-medium mb-1">
          No conversations yet
        </h4>
        <p className="text-slate-400 text-sm px-6">
          Start a new chat by selecting a contact from the contacts tab
        </p>
      </div>
      <button
        onClick={() => setActiveTab("contacts")}
        className="px-4 py-2 text-sm text-cyan-400 bg-cyan-500/10 rounded-lg hover:bg-cyan-500/20 transition-colors"
      >
        Find contacts
      </button>

      <button
        onClick={() => setContactAdd()}
        className="btn btn-circle bg-cyan-800 hover:bg-cyan-900 absolute bottom-5 right-5"
      >
        <PlusIcon />
      </button>
    </div>
  );
}
export default NoChatsFound;
