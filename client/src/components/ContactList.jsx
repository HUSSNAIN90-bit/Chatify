import React, { useEffect } from "react";
import { useContactStore } from "../stores/useContactStore";
import UsersLoadingSkeleton from "./UsersLoadingSkeleton";
import { useAuthStore } from "../stores/useAuthStore";
import NoChatsFound from "./NoChatsFound";
import { useChatStore } from "../stores/useChatStore";
import { PlusIcon } from "lucide-react";
import { connect } from "socket.io-client";
import { PhoneNumber } from "libphonenumber-js";

export default function ContactList() {
  const { getAllContacts, allContacts, isUsersLoading } = useContactStore();
  const { setSelectedUser } = useChatStore();
  const { onlineUsers } = useAuthStore();
  const { setContactAdd } = useContactStore();
  useEffect(() => {
    getAllContacts();
  }, [getAllContacts]);
  if (isUsersLoading) return <UsersLoadingSkeleton />;
  if (allContacts.length == 0) return <NoChatsFound />;
  return (
    <>
      {" "}
      {allContacts.map((contact) => (
        <div
          key={contact.contactId._id}
          className="bg-cyan-500/10 p-2 rounded-lg cursor-pointer hover:bg-cyan-500/20 transition-colors"
          onClick={() =>
            setSelectedUser({
              _id: contact.contactId._id,
              displayName: contact.name,
              phoneNumber: contact.phoneNumber,
              fullName: contact.contactId.fullName,
              profilePic: contact.contactId.profilePic,
              isContact: true,
            })
          }
        >
          <div className="flex items-center gap-3">
            <div
              className={`avatar ${
                Array.isArray(onlineUsers) &&
                onlineUsers.includes(contact.contactId._id)
                  ? "online"
                  : "offline"
              }`}
            >
              <div className="size-11 rounded-full">
                <img
                  src={contact.contactId.profilePic || "/avatar.png"}
                  alt={contact.name}
                />
              </div>
            </div>
            <h4 className="text-slate-200 font-medium truncate">
              {contact.name}
            </h4>
          </div>
        </div>
      ))}
      <button
        onClick={() => setContactAdd()}
        className="btn btn-circle bg-cyan-800 hover:bg-cyan-900 absolute bottom-5 right-5"
      >
        <PlusIcon />
      </button>
    </>
  );
}
