    import React, { useEffect, useRef } from "react";
import { useAuthStore } from "../stores/useAuthStore";
import { useChatStore } from "../stores/useChatStore";
import ChatHeader from "./ChatHeader";
import NoChatHistoryPlaceholder from "./NoChatHistoryPlaceholder";
import MessageInput from "./MessageInput";
import MessagesLoadingSkeleton from "./MessagesLoadingSkeleton";
import { CheckCheck } from "lucide-react";

function ChatContainer() {
  const {
    selectedUser,
    getMessagesByUserId,
    messages,
    markAsRead,
    isMessagesLoading,
    subscribeMessages,
    unSubscribeMessages,
  } = useChatStore();
  const { authUser } = useAuthStore();
  const messageEndRef = useRef(null);

  useEffect(() => {
    if (!selectedUser?._id) return;

    let didMarkRead = false;
    let readTimeout;

    const fetchAndSubscribe = async () => {
      await getMessagesByUserId(selectedUser._id);
      subscribeMessages();

      // Only mark as read if there are unread incoming messages in this chat
      const hasUnreadIncoming = () => {
        return (
          Array.isArray(messages) &&
          messages.some(
            (m) =>
              m.senderId === selectedUser._id &&
              !m.isReaded
          )
        );
      };

      readTimeout = setTimeout(async () => {
        if (!didMarkRead && hasUnreadIncoming()) {
          didMarkRead = true;
          await markAsRead(selectedUser._id);
        }
      }, 800);

      return () => {
        clearTimeout(readTimeout);
        unSubscribeMessages();
      };
    };

    let cleanup;
    fetchAndSubscribe().then((cb) => {
      cleanup = cb;
    });

    return () => {
      if (cleanup) cleanup();
      else unSubscribeMessages();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedUser]);

  useEffect(() => {
    if (
      !selectedUser?._id ||
      !Array.isArray(messages) ||
      messages.length === 0
    )
      return;

    // If any *incoming* (from selectedUser) messages are not isReaded, mark as read
    const unread = messages.some(
      (m) => m.senderId === selectedUser._id && !m.isReaded
    );
    if (unread) {
      const to = setTimeout(() => {
        markAsRead(selectedUser._id);
      }, 400);
      return () => clearTimeout(to);
    }
  }, [messages, selectedUser, markAsRead]);

  useEffect(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  return (
    <>
      <ChatHeader />
      <div className="flex-1 px-6 overflow-y-auto py-8">
        {isMessagesLoading ? (
          <MessagesLoadingSkeleton />
        ) : messages.length > 0 ? (
          <div className="w-full mx-auto space-y-6">
            {messages.map((msg) => (
              <div
                key={msg._id}
                className={`chat ${
                  msg.senderId === authUser._id ? "chat-end" : "chat-start"
                }`}
              >
                <div
                  className={`chat-bubble relative px-4 py-1 ${
                    msg.senderId === authUser._id
                      ? "bg-cyan-600 text-white"
                      : "bg-slate-800 text-slate-200"
                  }`}
                >
                  {msg.image && (
                    <img
                      src={msg.image}
                      alt="Shared"
                      className="rounded-lg h-48 object-cover"
                    />
                  )}

                  {msg.text && <p className="mt-2 text-sm">{msg.text}</p>}
                  <p className="text-xs mt-1 opacity-75 flex items-center gap-1">
                    {new Date(msg.createdAt).toLocaleTimeString(undefined, {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                    {msg.senderId === authUser._id && (
                      <CheckCheck
                        className={`size-4 ${
                          msg.isReaded ? "text-green-500" : "text-gray-900"
                        }`}
                      />
                    )}
                  </p>
                </div>
              </div>
            ))}
            <div ref={messageEndRef} />
          </div>
        ) : (
          <NoChatHistoryPlaceholder name={selectedUser?.fullName} />
        )}
      </div>
      <MessageInput />
    </>
  );
}

export default ChatContainer;
