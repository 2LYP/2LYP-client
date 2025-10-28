"use client";
import Background from "@/components/ui/Background";
import Lypcursor from "@/components/ui/Lypcursor";
import RouteLoadingBar from "@/components/ui/RouteLoadingBar";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

// Fix dark mode hydration and background click issues
function useFixDarkModeAndPointerEvents() {
  useEffect(() => {
    if (
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
    ) {
      document.documentElement.classList.add("dark");
    }
    const bg = document.getElementById("lyp-bg");
    if (bg) {
      bg.style.pointerEvents = "none";
      const main = document.querySelector("main");
      if (main) main.style.pointerEvents = "auto";
    }
  }, []);
}

const Navbar = ({ sections, router }) => (
  <nav className="fixed top-0 left-0 w-full bg-white/80 dark:bg-black/80 backdrop-blur-sm p-4 z-20 border-b border-gray-200 dark:border-gray-800">
    <div className="flex justify-between items-center max-w-6xl mx-auto">
      <div className="text-xl font-bold text-black dark:text-white">2LYP computations</div>
      <div className="flex gap-4">
        {sections.map((section, i) => (
          <button
            key={i}
            className="typewriter hover:opacity-80 transition-opacity"
            style={{
              "--button-bg-light": section.buttonColor,
              fontSize: "22px",
              height: "60px",
            }}
            onClick={() => section.title === "Products" && router.push("/products")}
          >
            {section.title}
          </button>
        ))}
      </div>
    </div>
  </nav>
);

const SECTION_DATA = [
  { title: "Products", buttonColor: "rgb(255 0 0)" },
  { title: "Services", buttonColor: "#00aeef" },
  { title: "Learn", buttonColor: "#1ba754" },
  { title: "Hub", buttonColor: "rgb(255 255 0)" },
];

export default function NotFound() {
  const router = useRouter();
  useFixDarkModeAndPointerEvents();
  const [typedText, setTypedText] = useState("");
  const fullText = "Error 404";

  useEffect(() => {
    let i = 0;
    const typingInterval = setInterval(() => {
      if (i < fullText.length) {
        setTypedText(fullText.substring(0, i + 1));
        i++;
      } else {
        clearInterval(typingInterval);
      }
    }, 150); // Adjust typing speed here

    return () => clearInterval(typingInterval);
  }, []);

  return (
    <main className="relative w-full min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col items-center justify-center">
      <RouteLoadingBar />
      <Lypcursor />
      <Background />
      <Navbar sections={SECTION_DATA} router={router} />

      <div className="flex flex-col items-center justify-center w-full h-screen px-4">
        <section
          className="relative w-full max-w-6xl mx-auto flex flex-col items-center py-8 px-12 bg-white/90 dark:bg-gray-800/90 rounded-xl border-2 border-black dark:border-gray-600 shadow-2xl animate-boxPop backdrop-blur-sm"
          style={{ height: "auto", minHeight: "300px" }} // Decreased minHeight
        >
          {/* Decorative corners */}
          {[
            ["top-4", "left-4"],
            ["top-4", "right-4"],
            ["bottom-4", "left-4"],
            ["bottom-4", "right-4"],
          ].map(([top, left], i) => (
            <div 
              key={i} 
              className={`absolute w-3 h-3 bg-black dark:bg-white rounded-full ${top} ${left}`} 
            />
          ))}

          <div className="w-full text-center">
            <h1 
              className="text-4xl font-extrabold my-4 mx-auto"
              style={{ 
                fontFamily: "'Courier New', monospace",
                whiteSpace: "nowrap",
                overflow: "hidden",
                display: "flex",
                justifyContent: "center",
                gap: "0.5em"
              }}
            >
              {/* "Error" and "404" with typewriter animation, each word a different color */}
              <span style={{ color: "#e11d48" }}>
                {typedText.slice(0, 5)}
              </span>
              <span style={{ color: "#00aeef" }}>
                {typedText.length > 5 ? typedText.slice(5) : ""}
              </span>
            </h1>
            <h2 className="text-xl font-bold mb-4 text-black dark:text-white">
              Oops, you've wandered off the grid.
            </h2>
            <p className="text-lg text-gray-700 dark:text-gray-300 mb-8 leading-relaxed">
              The page you're looking for doesn't exist or has moved. Click Home to create a new path!
            </p>
          </div>
          
          <button
            className="typewriter px-8 py-3 text-lg font-semibold rounded-lg border-2 border-black dark:border-white bg-white dark:bg-black hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors"
            style={{
              "--button-bg-light": "#fff",
              color: "#111"
            }}
            onClick={() => router.push("/")}
          >
            Go Home
          </button>
        </section>
      </div>

      <style jsx global>{`
        @keyframes boxPop {
          0% {
            opacity: 0;
            transform: scale(0.96) translateY(20px);
          }
          100% {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        .animate-boxPop {
          animation: boxPop 0.6s cubic-bezier(.23,1.01,.32,1) both;
        }
        /* Removed error color animations */
      `}</style>
    </main>
  );
}