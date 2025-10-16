import React, { useEffect } from "react";
import { useChatStore } from "../stores/useChatStore";
import UsersLoadingSkeleton from "./UsersLoadingSkeleton";
import { useAuthStore } from "../stores/useAuthStore";
import {NoChatsFound} from "./NoChatsFound";

export default function ContactList() {
  const { getAllContacts, allContacts, isUsersLoading, setSelectedUser } =
    useChatStore();
  const { onlineUsers } = useAuthStore();
  useEffect(() => {
    getAllContacts();
  }, [getAllContacts]);
  if (isUsersLoading) return <UsersLoadingSkeleton />;
  if (chats.length === 0) return <NoChatsFound />;
  return (
    <>
      {" "}
      {allContacts.map((contact) => (
        <div
          key={contact._id}
          className="bg-cyan-500/10 p-2 rounded-lg cursor-pointer hover:bg-cyan-500/20 transition-colors"
          onClick={() => setSelectedUser(contact)}
        >
          <div className="flex items-center gap-3">
            <div
              className={`avatar ${
                Array.isArray(onlineUsers) && onlineUsers.includes(contact._id)
                  ? "online"
                  : "offline"
              }`}
            >
              <div className="size-11 rounded-full">
                <img
                  src={contact.profilePic || "/avatar.png"}
                  alt={contact.fullName}
                />
              </div>
            </div>
            <h4 className="text-slate-200 font-medium truncate">
              {contact.fullName}
            </h4>
          </div>
        </div>
      ))}
    </>
  );
}
