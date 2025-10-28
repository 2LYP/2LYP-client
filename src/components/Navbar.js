// components/Navbar.js
"use client";
import SECTION_DATA from "@/constants/sectionData";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import useScrollReveal from "@/hooks/useScrollReveal";
import Button from "@/components/ui/Button";
import ProfilePicture from "@/components/ui/ProfilePicture";
import { useAuth } from "@/contexts/AuthContext"; 
import Logo from "./ui/Logo";

export default function Navbar() {
  const router = useRouter();
  const { isScrolled } = useScrollReveal();
  const [search, setSearch] = useState("");
  const { user } = useAuth(); 

  return (
    <div
      className={`fixed top-0 left-0 w-full bg-white dark:bg-black p-4 shadow-md transition-all duration-1000 z-20 ${
        isScrolled ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"
      }`}
    >
      <div className="flex justify-between items-center max-w-7xl mx-auto">
       {/* Search */}
        <div className="relative inline-block w-1/3">
          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="p-2 pr-10 rounded-md border border-gray-300 dark:border-gray-600 bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-white w-full"
          />
          <button
            type="button"
            className="absolute right-2 top-1/2 transform -translate-y-1/2 cursor-pointer hover:opacity-80"
            style={{ width: '20px', height: '20px' }}
          >
            <div className="lyp-cursor relative w-full h-full" style={{
              transform: 'none',
              filter: 'none',
              pointerEvents: 'none'
            }}>
              <div className="diamond" style={{
                width: '12px',
                height: '12px',
                left: '15px',
                top: '-12px',
                borderWidth: '1.5px'
              }}>
                <div className="inner-diamond" style={{
                  width: '8px',
                  height: '8px',
                  top: '5px',
                  transform: 'translate(-50%, -50%) rotate(270deg)',
                  borderWidth: '1.5px',
                  left: '5px'
                }}></div>
              </div>
              <div className="stem" style={{
                height: '30px',
                top: '-14px',
                width: '1px',
                left: '15px'
              }}></div>
            </div>
          </button>
        </div>

        {/* Nav buttons and Profile Icon */}
        <div className="flex items-center gap-4">
          {SECTION_DATA.map((section, i) => (
            <Button
              key={i}
              style={{
                "--button-bg-light": section.buttonColor,
                fontSize: "22px",
                height: "60px"
              }}
              onClick={() => section.title === "Products" && router.push("/products")}
            >
              {section.title}
            </Button>
          ))}
          <style>{`
@keyframes moveDots {
  from { transform: translateX(0); }
  to { transform: translateX(-50%); }
}
`}</style>

          {/* Profile Image */}
           {user && (
  <div style={{
    position: "absolute",
    right: "150px",  
    left: "auto",           // starts after hub button naturally
    width: "100px",         // enough to stretch from hub btn to pic
    height: "45px",         // +2px taller
    background: "#FFFF00",  // yellow inside
    border: "2px solid #FFFF00",
    overflow: "hidden",
    zIndex: "-1"
  }}>
    <div style={{
      width: "200%",
      height: "100%",
      backgroundImage: "radial-gradient(white 2px, transparent 3px)",
      backgroundSize: "18px 18px",
      animation: "moveDots 3s linear infinite"
    }} />
  </div>
)}
          {user && (
            <div onClick={() => router.push("/hub")} className="cursor-pointer ml-3 w-15 h-15 rounded-full border-3 border-black bg-gray-200 overflow-hidden shadow-lg flex items-center justify-center">
              <ProfilePicture
                src={user.profilePic}
                alt="Profile"
                size={50}
                className="w-full h-full object-cover"
                title={user.name}
              />
            </div>
          )}
        
        </div>
      </div>
    </div>
  );
}