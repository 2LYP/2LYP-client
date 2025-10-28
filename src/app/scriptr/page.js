"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import useScriptWriter from "@/hooks/useScriptWriter";
import Background from "@/components/ui/Background";
import Lypcursor from "@/components/ui/Lypcursor";
import RouteLoadingBar from '@/components/ui/RouteLoadingBar';
import Button from "@/components/ui/Button";
import LoginForm from "@/components/LoginForm";
import SignupForm from "@/components/SignupForm";
import Dashboard from "@/components/Dashboard";
import FlipCard from "@/components/scriptr/FlipCard";
import LeftSidebar from "@/components/scriptr/LeftSidebar";
import WriterControls from "@/components/scriptr/WriterControls";
import ScriptPages from "@/components/scriptr/ScriptPages";
import AnimatedTitle from "@/components/scriptr/AnimatedTitle";
import CoverForm from "@/components/scriptr/CoverForm";
import ScreenElementBlock from "@/components/scriptr/ScreenElementBlock";
import styles from "@/styles/scriptr.module.css";
import { useTheme } from "@/contexts/ThemeContext";
import {
  availableOptions,
  uniqueOptions,
  availableOptions3,
  parentheticalOptions
} from "@/constants/screenplayConstants";



export default function ScriptrPage() {
  const { isDarkMode } = useTheme();
  const { user, isAuthLoading, handleLogin, handleSignup, logout, authError, setAuthError, refetchUser } = useAuth();
  const isLoggedIn = !!user;
  const router = useRouter();

  // Animation states
  const [animationStage, setAnimationStage] = useState(0);
  const [showContent, setShowContent] = useState(false);

  // Sidebar state
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(300);
  const [leftSidebarWidth, setLeftSidebarWidth] = useState(300);

  // Print and A4 mode state
  const [printMode, setPrintMode] = useState(false); // true when printing
  const [a4Paginate, setA4Paginate] = useState(false); // true = split into A4 pages

  // Refs
  const leftSidebarRef = useRef(null);
  const isLeftResizing = useRef(false);
  const sidebarRef = useRef(null);
  const isResizing = useRef(false);

  // --- Use custom screenplay hook ---
  const {
    screenplayElements,
    setScreenplayElements,
    formData,
    setFormData,
    undoStack,
    setUndoStack,
    redoStack,
    setRedoStack,
    characterNames,
    setCharacterNames,
    auto_grow,
    adjustWidth,
    saveToUndo,
    scenehead,
    addActionBlock,
    addCharacterBlock,
    addDialogueBlock,
    addParentheticalBlock,
    addTransitionBlock,
    handleUndo,
    handleRedo,
    removeBlock,
    isBlockEmpty,
    handleElementChange,
    handleChangeScreen,
    handleBlurScreen,
    handleChange,
    handleCharacterInput,
    handleParentheticalInput,
    handleActionInput,
    handleAutocomplete,
    availableOptions,
    uniqueOptions,
    availableOptions3,
    parentheticalOptions,
  } = useScriptWriter();
  // --- end screenplay hook ---

  // Auth Forms visibility state
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [userName, setUserName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [error, setError] = useState("");
  const [createError, setCreateError] = useState(""); // Add this line

  // Add: after login/signup, close sidebar and refetch user
  const handleAuthSuccess = async () => {
    await refetchUser();
    setShowLogin(false);
    setShowSignup(false);
    setLeftSidebarOpen(false);
  };

  // Add this handler for Google login/signup
  const handleGoogleAuth = async (user, googleProfilePicUrl) => {
    await refetchUser();
    setShowLogin(false);
    setShowSignup(false);
    setLeftSidebarOpen(false);
  };

  // Define renderAuthForms to be used in LeftSidebar
  const renderAuthForms = () => (
    <div className="z-50 relative w-full max-w-md mx-auto mt-8">
      {showLogin && (
        <LoginForm
          email={email}
          password={password}
          error={authError}
          onEmailChange={(e) => setEmail(e.target.value)}
          onPasswordChange={(e) => setPassword(e.target.value)}
          onSubmit={handleLogin}
          onShowSignup={() => {
            setShowLogin(false);
            setShowSignup(true);
            setAuthError("");
            setEmail("");
            setPassword("");
          }}
          onGoogleAuth={handleGoogleAuth}
          onAuthSuccess={handleAuthSuccess}
        />
      )}
      {showSignup && (
        <SignupForm
          userName={userName}
          companyName={companyName}
          email={email}
          password={password}
          confirmPassword={confirmPassword}
          error={authError}
          onUserNameChange={(e) => setUserName(e.target.value)}
          onCompanyNameChange={(e) => setCompanyName(e.target.value)}
          onEmailChange={(e) => setEmail(e.target.value)}
          onPasswordChange={(e) => setPassword(e.target.value)}
          onConfirmPasswordChange={(e) => setConfirmPassword(e.target.value)}
          onSubmit={handleSignup}
          onShowLogin={() => {
            setShowLogin(true);
            setShowSignup(false);
            setAuthError("");
            setUserName("");
            setEmail("");
            setPassword("");
            setConfirmPassword("");
            setCompanyName("");
          }}
          onGoogleAuth={handleGoogleAuth}
          onAuthSuccess={handleAuthSuccess}
        />
      )}
    </div>
  );

  // Animation effects
  useEffect(() => {
    const timer1 = setTimeout(() => setAnimationStage(1), 500);
    const timer2 = setTimeout(() => setAnimationStage(2), 1500);
    const timer3 = setTimeout(() => setShowContent(true), 2500);
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, []);

  // UI handlers
  const handleMouseDown = () => isResizing.current = true;
  const handleLeftMouseDown = () => isLeftResizing.current = true;
  const handleMouseMove = useCallback((e) => {
    if (isResizing.current) {
      const newWidth = e.clientX;
      if (newWidth > 200 && newWidth < 600) setSidebarWidth(newWidth);
    }
    if (isLeftResizing.current) {
      const newWidth = window.innerWidth - e.clientX;
      if (newWidth > 200 && newWidth < 600) setLeftSidebarWidth(newWidth);
    }
  }, []);
  const handleMouseUp = useCallback(() => {
    isResizing.current = false;
    isLeftResizing.current = false;
  }, []);

  // Print logic
    const handlePrint = useCallback(() => {
    if (!a4Paginate) {
      setA4Paginate(true);
      setTimeout(() => {
        setPrintMode(true);
        setTimeout(() => {
          window.print();
          setTimeout(() => setPrintMode(false), 1000);
        }, 100);
      }, 100);
    } else {
      setPrintMode(true);
      setTimeout(() => {
        window.print();
        setTimeout(() => setPrintMode(false), 1000);
      }, 100);
    }
  }, [a4Paginate]);


  // KEYBOARD HANDLING
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Only handle keyboard shortcuts when not in an input field
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        return;
      }
      
      if (e.altKey && !e.shiftKey && !e.ctrlKey) {
        switch (e.key.toLowerCase()) {
          case "1":
            e.preventDefault();
            scenehead();
            break;
          case "2":
            e.preventDefault();
            addActionBlock();
            break;
          case "3":
            e.preventDefault();
            addCharacterBlock();
            break;
          case "4":
            e.preventDefault();
            addParentheticalBlock();
            break;
          case "5":
            e.preventDefault();
            addDialogueBlock();
            break;
          case "6":
            e.preventDefault();
            addTransitionBlock();
            break;
          default:
            break;
        }
      } else if (e.ctrlKey && !e.shiftKey && !e.altKey) {
        switch (e.key.toLowerCase()) {
          case "z":
            // Undo
            e.preventDefault();
            handleUndo();
            break;
          case "y":
            // Redo
            e.preventDefault();
            handleRedo();
            break;
          case "p":
            // Print
            e.preventDefault();
            handlePrint();
            break;
          default:
            break;
        }
      } else if (e.ctrlKey && e.shiftKey && !e.altKey) {
        switch (e.key.toLowerCase()) {
          case "z":
            // Ctrl+Shift+Z for redo
            e.preventDefault();
            handleRedo();
            break;
          default:
            break;
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [scenehead, addActionBlock, addCharacterBlock, addParentheticalBlock, addDialogueBlock, addTransitionBlock, handleUndo, handleRedo, handlePrint]);


  // A4 Pagination toggle
  const handleA4PaginateToggle = () => setA4Paginate((prev) => !prev);

  // A4 Pagination logic: split screenplayElements into pages of N elements
  // First page is always the cover, rest are paginated by elementsPerPage
  const elementsPerPage = 60;
  const paginatedElements = [];
  if (a4Paginate) {
    // First page is always the cover (screenplayElements[0])
    // Paginate the rest (screenplayElements.slice(1))
    const rest = screenplayElements.slice(1);
    // If there are elements, the first page should include screenplayElements[0] + first (elementsPerPage-1) from rest
    if (rest.length > 0) {
      paginatedElements.push([screenplayElements[0], ...rest.slice(0, elementsPerPage - 1)]);
      for (let i = elementsPerPage - 1; i < rest.length; i += elementsPerPage) {
        paginatedElements.push(rest.slice(i, i + elementsPerPage));
      }
    } else {
      // Only the first element exists
      paginatedElements.push([screenplayElements[0]]);
    }
  }

  // Add this line to define the animatedTitle variable
  const animatedTitle = "S.C.R.I.P.T.R.";

  // Handler for "Create" button
  // New: Create button opens a blank script editor (no login required, no save yet)
  const handleCreateScript = () => {
    if (isLoggedIn) {
      // Create a new script on the server and redirect to it
      (async () => {
        try {
          const csrfRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/csrf-token`, { credentials: "include" });
          const { csrfToken } = await csrfRes.json();
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/script/new`, {
            method: "POST",
            headers: { "Content-Type": "application/json", "X-CSRF-Token": csrfToken },
            credentials: "include",
            body: JSON.stringify({ title: "Untitled Script", content: JSON.stringify({ screenplayElements: [{ type: "sceneheading", number: 1, setting: "", location: "", time: "" }], formData: { movie_name: "", writer: "", director: "", producer: "" } }) }),
          });
          if (!res.ok) {
            setCreateError("Failed to create script. Please try again.");
            return;
          }
          const data = await res.json();
          if (data.scriptId) {
            router.push(`/scriptr/${data.scriptId}`);
          } else {
            setCreateError("Failed to create script. No script ID returned.");
          }
        } catch (err) {
          setCreateError("Network error: Could not create script.");
        }
      })();
    } else {
      // Generate a random temp id for unsaved script (could use uuid or timestamp)
      const tempId = `temp-${Date.now()}`;
      // Store a flag in sessionStorage to indicate this is a new/unsaved script
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('scriptr_new_script', '1');
      }
      router.push(`/scriptr/${tempId}`);
    }
  };

  // Add state for scripts list
  const [scripts, setScripts] = useState([]);
  const [scriptsLoading, setScriptsLoading] = useState(false);
  const [scriptsError, setScriptsError] = useState("");

  // Fetch all scripts for the logged-in user
  useEffect(() => {
    if (!isLoggedIn) {
      setScripts([]);
      return;
    }
    setScriptsLoading(true);
    setScriptsError("");
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/script/scripts`, {
      credentials: "include",
    })
      .then(async (res) => {
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || "Failed to fetch scripts");
        }
        return res.json();
      })
      .then((data) => {
        setScripts(Array.isArray(data.scripts) ? data.scripts : []);
        setScriptsLoading(false);
      })
      .catch((err) => {
        setScriptsError(err.message || "Failed to fetch scripts");
        setScriptsLoading(false);
      });
  }, [isLoggedIn]);

  // Render logic
  return (
    <main
      className={`relative w-full min-h-screen bg-gray-100 dark:bg-gray-900 ${printMode ? "print-mode" : ""}`}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      <RouteLoadingBar />
      {!printMode && <Lypcursor />}
      {!printMode && <Background />}

      {/* Left Sidebar */}
      {!printMode && showContent && (
        <LeftSidebar
          leftSidebarRef={leftSidebarRef}
          leftSidebarOpen={leftSidebarOpen}
          leftSidebarWidth={leftSidebarWidth}
          user={user}
          isLoggedIn={isLoggedIn}
          showLogin={showLogin}
          showSignup={showSignup}
          setShowLogin={setShowLogin}
          setShowSignup={setShowSignup}
          logout={logout}
          router={router}
          renderAuthForms={renderAuthForms}
          scripts={scripts}
          scriptsLoading={scriptsLoading}
          scriptsError={scriptsError}
          scriptId={null}
          handleDeleteScript={async (scriptId) => {
            if (!window.confirm("Are you sure you want to delete this script?")) return;
            try {
              const csrfRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/csrf-token`, { credentials: "include" });
              const { csrfToken } = await csrfRes.json();
              const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/script/${scriptId}`,
                {
                  method: "DELETE",
                  headers: {
                    "Content-Type": "application/json",
                    "X-CSRF-Token": csrfToken,
                  },
                  credentials: "include",
                }
              );
              if (!res.ok) {
                let msg = "Failed to delete script";
                try {
                  const data = await res.json();
                  msg = data?.error || msg;
                  console.error("Delete script error:", msg);
                } catch (e) {
                  const text = await res.text();
                  if (text) {
                    msg = text;
                    console.error("Delete script error (text):", msg);
                  }
                }
                alert(msg);
              } else {
                setScripts((prev) => prev.filter((s) => s._id !== scriptId));
              }
            } catch (err) {
              alert("Network error: Could not delete script");
            }
          }}
        />
      )}
      {/* Left Sidebar Toggle Button */}
      {!printMode && showContent && (
        <button
          onClick={() => setLeftSidebarOpen(!leftSidebarOpen)}
          onMouseDown={handleLeftMouseDown}
          style={{ right: leftSidebarOpen ? leftSidebarWidth : 0 }}
          className="fixed top-1/2 transform -translate-y-1/2 bg-black font-bold text-white px-3 py-20 rounded-l-lg transition-all duration-200 ease-in-out z-30 hover:bg-gray-800"
        >
          {leftSidebarOpen ? "◀" : "▶"}
        </button>
      )}

      {/* Right Sidebar (Script Writer Controls) */}
      {!printMode && showContent && false && (
        <>
          <WriterControls
            sidebarOpen={sidebarOpen}
            sidebarWidth={sidebarWidth}
            scenehead={scenehead}
            addActionBlock={addActionBlock}
            addCharacterBlock={addCharacterBlock}
            addParentheticalBlock={addParentheticalBlock}
            addDialogueBlock={addDialogueBlock}
            addTransitionBlock={addTransitionBlock}
            handleUndo={handleUndo}
            handleRedo={handleRedo}
            handlePrint={handlePrint}
            handleA4PaginateToggle={handleA4PaginateToggle}
            a4Paginate={a4Paginate}
          />
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            onMouseDown={handleMouseDown}
            style={{ left: sidebarOpen ? sidebarWidth : 0 }}
            className="fixed top-1/2 transform -translate-y-1/2 bg-black font-bold text-white px-3 py-20 rounded-r-lg transition-all duration-200 ease-in-out z-30 hover:bg-gray-800"
          >
            {sidebarOpen ? "▶" : "◀"}
          </button>
        </>
      )}

      {/* Main Content */}
      <div
        className={`flex-1 flex flex-col items-center p-6 transition-all duration-500 ease-in-out ${printMode ? "print-main" : ""}`}
        style={{
          marginLeft: !printMode && sidebarOpen ? sidebarWidth : 0,
          marginRight: !printMode && leftSidebarOpen ? leftSidebarWidth : 0,
          minHeight: '100vh',
        }}
      >
        {/* Animated Red Flip Card */}
        <div
          className={`relative flex items-center justify-center transition-all duration-1000 ease-in-out ${
            animationStage >= 2 ? "mt-6 mx-auto" : "my-auto mx-auto"
          }`}
          style={{
            width:
              animationStage >= 1
                ? `calc(90vw - ${sidebarOpen && !printMode ? sidebarWidth : 0}px - ${leftSidebarOpen && !printMode ? leftSidebarWidth : 0}px)`
                : "40px",
            maxWidth: "1000px",
            height: "130px",
            transition: "width 1s cubic-bezier(0.4,0,0.2,1)"
          }}
        >
          <FlipCard
            frontContent={
              <>
                <div className="absolute w-3 h-3 bg-black rounded-full top-4 left-4"></div>
                <div className="absolute w-3 h-3 bg-black rounded-full top-4 right-4"></div>
                <div className="absolute w-3 h-3 bg-black rounded-full bottom-4 left-4"></div>
                <div className="absolute w-3 h-3 bg-black rounded-full bottom-4 right-4"></div>
                <AnimatedTitle animatedTitle={animatedTitle} />
              </>
            }
            backContent={
              <>
                <div className="absolute w-3 h-3 bg-black rounded-full top-4 left-4"></div>
                <div className="absolute w-3 h-3 bg-black rounded-full top-4 right-4"></div>
                <div className="absolute w-3 h-3 bg-black rounded-full bottom-4 left-4"></div>
                <div className="absolute w-3 h-3 bg-black rounded-full bottom-4 right-4"></div>
                <h1 className="text-center px-5 py-2 text-2xl text-white font-bold">
                  Screenplay Creation and Revision Instrument for Production&apos;s Treatment Record
                </h1>
              </>
            }
            hide={false}
          />
        </div>

        {/* Main Content (shown after animation completes) */}
        {showContent && (
          <div className={`flex flex-col items-center justify-center gap-5 mt-10 ${printMode ? "hidden" : ""}`}>
            {/* Create Now button - large and above */}
            <Button
              onClick={handleCreateScript}
              className="typewriter flex flex-col items-center justify-center bg-white border-4 border-black rounded-xl shadow-lg transition hover:bg-red-50"
              style={{
                fontSize: "2.2rem",
                minWidth: "260px",
                minHeight: "100px",
                color: isDarkMode ? "#fff" : "#111",
                fontWeight: 700,
                letterSpacing: "1px",
                marginBottom: "2.5rem",
              }}
            >
              <span className={`text-4xl font-bold leading-tight ${isDarkMode ? 'text-cyan-300' : 'text-red-500'}`}>create</span><br />
            </Button>
            {/* Show error if script creation fails */}
            {createError && (
              <div className="text-red-600 font-bold mb-2">{createError}</div>
            )}
            {/* Info box */}
            <div className="relative w-auto mx-auto flex flex-col items-center pt-3 pb-3 bg-white dark:bg-gray-800 rounded-xl border-4 border-black">
              <h1 className="text-xl p-4 ml-8 mr-8 text-center font-bold text-gray-900 dark:text-gray-100">
                Create scripts, own your words and earn rewards
              </h1>
            </div>
            {/* Scripts List for logged-in users */}
            {isLoggedIn && (
              <div className="w-full max-w-2xl mt-8">
                <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">Your Scripts</h2>
                {scriptsLoading && <div>Loading scripts...</div>}
                {scriptsError && <div className="text-red-500 dark:text-red-400">{scriptsError}</div>}
                {!scriptsLoading && !scriptsError && scripts.length === 0 && (
                  <div className="text-gray-800 dark:text-gray-200">No scripts found. Click <b>create</b> to start a new script.</div>
                )}
                {!scriptsLoading && !scriptsError && scripts.length > 0 && (
                  <ul className="divide-y divide-gray-300 dark:divide-gray-700">
                    {scripts.map((script) => (
                      <li
                        key={script._id}
                        className="py-3 px-2 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer flex justify-between items-center"
                      >
                        <span
                          className="font-semibold flex-1 text-gray-900 dark:text-gray-100"
                          onClick={() => {
                            setLeftSidebarOpen(false);
                            router.push(`/scriptr/${script._id}`);
                          }}
                        >
                          {script.title || "Untitled Script"}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400 mr-2">{script.status || "draft"}</span>
                        <button
                          title="Delete"
                          onClick={async (e) => {
                            e.stopPropagation();
                            if (!window.confirm("Are you sure you want to delete this script?")) return;
                            try {
                              const csrfRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/csrf-token`, { credentials: "include" });
                              const { csrfToken } = await csrfRes.json();
                              const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/script/${script._id}`,
                                {
                                  method: "DELETE",
                                  headers: {
                                    "Content-Type": "application/json",
                                    "X-CSRF-Token": csrfToken,
                                  },
                                  credentials: "include",
                                }
                              );
                              if (!res.ok) {
                                let msg = "Failed to delete script";
                                try {
                                  const data = await res.json();
                                  msg = data?.error || msg;
                                  console.error("Delete script error:", msg);
                                } catch (e) {
                                  const text = await res.text();
                                  if (text) {
                                    msg = text;
                                    console.error("Delete script error (text):", msg);
                                  }
                                }
                                alert(msg);
                              } else {
                                setScripts((prev) => prev.filter((s) => s._id !== script._id));
                              }
                            } catch (err) {
                              alert("Network error: Could not delete script");
                            }
                          }}
                          className="ml-2 text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 focus:outline-none"
                          style={{ fontSize: '1.2em', background: 'none', border: 'none', cursor: 'pointer' }}
                        >
                          <span role="img" aria-label="delete">🗑️</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {/* Login and Signup side by side below */}
            {!isLoggedIn && (
              <div className="flex gap-8 mt-6">
                <Button
                  onClick={() => { setShowLogin(true); setShowSignup(false); setLeftSidebarOpen(true); }}
                  className="typewriter flex flex-col items-center justify-center border-2 border-black rounded-lg px-8 py-4 hover:bg-red-50 transition"
                  style={{
                    fontSize: "1.5rem",
                    fontWeight: 700,
                    minWidth: "140px"
                  }}
                >
                  Login
                </Button>
                <Button
                  onClick={() => { setShowSignup(true); setShowLogin(false); setLeftSidebarOpen(true); }}
                  className="typewriter flex flex-col items-center justify-center border-2 border-black rounded-lg px-8 py-4 hover:bg-red-50 transition"
                  style={{
                    fontSize: "1.5rem",
                    fontWeight: 700,
                    minWidth: "140px"
                  }}
                >
                  Sign Up
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
      {/* Print styles */}
      <style jsx global>{`
        @media print {
          body, html, #__next, main, .print-main {
            background: white !important;
            color: black !important;
            min-height: 0 !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          .print-a4 {
            page-break-after: always;
            page-break-inside: avoid;
            background: white !important;
            color: black !important;
            box-shadow: none !important;
            border: none !important;
            margin: 0 auto !important;
            width: 210mm !important;
            min-height: 297mm !important;
            max-width: 210mm !important;
            padding: 5mm !important;
            display: flex !important;
            flex-direction: column !important;
            justify-content: space-between !important;
          }
          .print-a4 form {
            flex: 1 1 auto !important;
          }
      S.C.R.I.P.T.R.    @page {
            margin: 0;
          }
          .print-a4.mt-8 {
            margin-top: 0 !important;
          }
        }
      `}</style>
    </main>
  );
}