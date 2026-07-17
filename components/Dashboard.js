// components/Dashboard.js
import Button from "@/components/ui/Button";
import ProfilePicture from "@/components/ui/ProfilePicture";

export default function Dashboard({ userName, email, profilePicUrl, handleProfilePicClick, fileInputRef, handleProfilePicChange, handleLogout }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold">
          Namaste, <br /> {userName || email || "User"}
        </h2>
      </div>
      <div className="relative flex flex-col items-center">
        <div
          className="w-40 h-40 rounded-full border-4 border-black bg-gray-200 overflow-hidden cursor-pointer mb-4 shadow-lg"
          onClick={handleProfilePicClick}
          title="Click to upload profile picture"
        >
          <ProfilePicture
            src={profilePicUrl}
            alt="Profile"
            className="w-full h-full"
          />
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            style={{ display: "none" }}
            onChange={handleProfilePicChange}
          />
        </div>
        <div className="text-2xl font-bold text-black dark:text-white mb-2">{userName || "User"}</div>
        <div className="text-gray-600 dark:text-gray-300 mb-4">{email}</div>
        <Button onClick={handleLogout} className="typewriter" style={{ fontSize: "18px", height: "52px" }}>Logout</Button>
      </div>
    </div>
  );
}
