import { CrossIcon, Loader, LoaderIcon, UserIcon, XIcon } from "lucide-react";
import React, { useState } from "react";
import PhoneInput from "react-phone-input-2";
import { useContactStore } from "../stores/useContactStore";

export default function AddToContact() {
  const [formData, setFormData] = useState({
    phoneNumber: "",
    name: "",
  });
  const { setContactAdd, addContact, isContactAdding } = useContactStore();

  const handleSubmit = (e) => {
    e.preventDefault();
    addContact(formData);
  };

  return (
    <div className="w-screen fixed flex justify-center items-center top-0 left-0 h-screen bg-transparent backdrop-blur-md">
      <div className="bg-slate-900 p-10 w-[450px] rounded-lg ">
        <h2 className="text-2xl text-center font-bold text-slate-200 mb-2">
          Add To Contact
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="auth-input-label">Contact Name</label>
            <div className="relative">
              <UserIcon className="auth-input-icon" />
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="input"
                placeholder="John Doe"
                required
              />
            </div>
          </div>
          <div>
            <label className="auth-input-label">Phone Number</label>
            <div className="relative">
              <PhoneInput
                country={"pk"} // default country
                value={formData.phoneNumber}
                onChange={(phone, country) =>
                  setFormData({
                    ...formData,
                    phoneNumber: phone,
                    region: country.name, // store region name
                  })
                }
                inputStyle={{
                  width: "100%",
                  backgroundColor: "transparent",
                  border: "1px solid #334155",
                  borderRadius: "0.5rem",
                  paddingLeft: "48px",
                  height: "45px",
                  color: "#cbd5e1",
                }}
                buttonStyle={{
                  border: "none",
                  background: "none",
                }}
                dropdownStyle={{
                  backgroundColor: "#1e293b",
                  color: "#cbd5e1",
                }}
                enableSearch={true}
                disableDropdown={false}
                countryCodeEditable={false}
              />
            </div>
          </div>
          <button className="auth-btn" type="submit" disabled={isContactAdding}>
            {isContactAdding ? (
              <LoaderIcon className="w-full h-5 animate-spin text-center" />
            ) : (
              "Add Contact"
            )}
          </button>
        </form>
      </div>

      <button
        className="absolute right-10 top-10"
        onClick={() => setContactAdd()}
      >
        <XIcon className="size-15" />
      </button>
    </div>
  );
}
