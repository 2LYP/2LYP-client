"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Background from "@/components/ui/Background";
import Lypcursor from "@/components/ui/Lypcursor";
import RouteLoadingBar from '@/components/ui/RouteLoadingBar';
import { useAuth } from "@/contexts/AuthContext";
import { axiosInstance } from "@/utils/api";
import { toast } from "react-toastify";
import LoginForm from "@/components/LoginForm";
import SignupForm from "@/components/SignupForm";
import Image from "next/image";
import { io as socketIOClient } from "socket.io-client";
import FlipCard from "@/components/scriptr/FlipCard"; // Use the same FlipCard as Scriptr

// Constants
const animatedTitle = "Q.S.N.Ai.R."; // For front

export default function QsnairPage() {
  const router = useRouter();
  const { user, handleLogin, handleSignup, logout, authError, setAuthError, refetchUser } = useAuth();
  const isLoggedIn = !!user;

  // Animation states
  const [animationStage, setAnimationStage] = useState(0);
  const [showContent, setShowContent] = useState(false);
  const [isCreating, setIsCreating] = useState(false); // From new page.js

  // UI State
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(false);
  const [leftSidebarWidth, setLeftSidebarWidth] = useState(300);
  
  // State for auth forms
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  
  // Refs
  const leftSidebarRef = useRef(null);
  const isLeftResizing = useRef(false);

  // Data
  const [characters, setCharacters] = useState([]);
  const [socket, setSocket] = useState(null);

  // Animation and initial setup effects
  useEffect(() => {
    const timer1 = setTimeout(() => setAnimationStage(1), 500);
    const timer2 = setTimeout(() => setAnimationStage(2), 1500);
    const timer3 = setTimeout(() => setShowContent(true), 2500);
    return () => { clearTimeout(timer1); clearTimeout(timer2); clearTimeout(timer3); };
  }, []);

  // Effect to load user's characters when user object changes
  useEffect(() => {
    if (user) {
      loadUserCharacters();
    } else {
      setCharacters([]);
    }
  }, [user]);

  // Socket connection setup
  useEffect(() => {
    const s = socketIOClient(process.env.NEXT_PUBLIC_API_URL, {
      withCredentials: true,
      transports: ["websocket"],
    });
    setSocket(s);
    return () => {
      s.disconnect();
    };
  }, []);

  // Socket event listeners for real-time updates
  useEffect(() => {
    if (!socket || !user) return;

    const handleUpdate = () => {
        loadUserCharacters();
    };

    socket.on('character:created', handleUpdate);
    socket.on('character:deleted', handleUpdate);

    return () => {
      socket.off('character:created', handleUpdate);
      socket.off('character:deleted', handleUpdate);
    };
  }, [socket, user]);

  // Fetches characters for the logged-in user
  const loadUserCharacters = async () => {
    try {
      const response = await axiosInstance.get('/api/characters');
      setCharacters(response.data.map(char => ({
        id: char._id,
        name: char.name,
        image: char.imageUrl || "/placeholder-character.jpg",
        questionnaireId: char.questionnaireId // Make sure this is coming from the backend
      })));
    } catch (error) {
      console.error('Error loading characters:', error);
      toast.error('Failed to load characters.');
    }
  };
  
  // Deletes a character
  const deleteCharacter = async (characterId) => {
    if (!window.confirm("Are you sure? This cannot be undone.")) return;
    try {
      await axiosInstance.delete(`/api/characters/${characterId}`);
      toast.success("Character deleted!");
      setCharacters(prev => prev.filter(c => c.id !== characterId));
    } catch (error) {
      console.error('Delete character error:', error);
      toast.error(error.response?.data?.error || "Failed to delete character.");
    }
  };

  // --- QUESTIONNAIRE LOGIC (New version) ---
  const startQuestions = async (num) => {
    if (!isLoggedIn) {
      toast.error("Please log in to start creating a character.");
      setLeftSidebarOpen(true);
      setShowLogin(true);
      return;
    }
    setIsCreating(true);
    try {
      const response = await axiosInstance.post('/api/questionnaires', {
        questionSetType: num
      });
      const newQuestionnaire = response.data;
      router.push(`/qsnair/${newQuestionnaire._id}`);
    } catch (error) {
      console.error("Failed to create questionnaire session:", error);
      toast.error(error.response?.data?.error || "Could not start a new session.");
      setIsCreating(false);
    }
  };

  // --- AUTHENTICATION LOGIC ---
  const handleAuthSuccess = async () => {
    await refetchUser();
    setShowLogin(false);
    setShowSignup(false);
    setLeftSidebarOpen(false);
  };

  const onLogout = async () => {
    await logout();
    setShowLogin(false);
    setShowSignup(false);
    toast.success("You have been logged out.");
  };

  // --- UI HANDLERS AND HELPERS ---
  const handleMouseDown = (e) => {
    if (e.target.id === 'left-resizer') isLeftResizing.current = true;
  };

  const handleMouseMove = useCallback((e) => {
    if (isLeftResizing.current) {
      const newWidth = window.innerWidth - e.clientX;
      if (newWidth > 200 && newWidth < 600) setLeftSidebarWidth(newWidth);
    }
  }, []);

  const handleMouseUp = useCallback(() => {
    isLeftResizing.current = false;
  }, []);
  
  // --- RENDER FUNCTIONS ---
  const renderAuthForms = () => (
    <div className="z-50 relative w-full">
      {showLogin && (
        <LoginForm
          onSubmit={handleLogin}
          onAuthSuccess={handleAuthSuccess}
          error={authError}
          onShowSignup={() => { setShowSignup(true); setShowLogin(false); setAuthError(null); }}
        />
      )}
      {showSignup && (
        <SignupForm
          onSubmit={handleSignup}
          onAuthSuccess={() => {
            toast.info("Registration successful! Please check your email to verify your account.");
            handleAuthSuccess();
          }}
          error={authError}
          onShowLogin={() => { setShowLogin(true); setShowSignup(false); setAuthError(null); }}
        />
      )}
    </div>
  );

  // --- MAIN JSX RETURN ---
  return (
    <main className="relative w-full min-h-screen bg-gray-100 dark:bg-gray-900" onMouseMove={handleMouseMove} onMouseUp={handleMouseUp}>
      <RouteLoadingBar />
      <Lypcursor />
      <Background />
      
      {/* Right Sidebar (User Hub) */}
      <div ref={leftSidebarRef} style={{ width: leftSidebarOpen ? leftSidebarWidth : 0 }} className={`bg-[#ffff00] dark:bg-gray-800 p-4 transition-all duration-500 ease-in-out h-full overflow-y-auto fixed right-0 top-0 flex flex-col z-20 ${leftSidebarOpen ? "block" : "hidden"}`}>
        <div className="w-full text-sm flex flex-col items-center justify-center h-full">
          <button onClick={() => router.push("/qsnair/dashboard")} className="typewriter mb-5 flex items-center justify-center" style={{ fontSize: "30px", height: "52px", paddingTop: "5px" }}>Hub</button>
          {isLoggedIn ? (
            <>
              <div className="text-center mb-6"><h2 className="text-xl font-bold">Namaste, {user.name}</h2>{user.companyName && <p className="text-sm">Company: {user.companyName}</p>}</div>
              <div className="mb-4 w-full">
                <h3 className="font-bold mb-2 text-lg text-center">Your Characters</h3>
                {characters.length > 0 ? (
                  <div className="flex flex-col gap-3 w-full">
                    {characters.map((character) => (
                      <div key={character.id} className="flex items-center bg-white dark:bg-gray-700 rounded shadow px-4 py-3 h-20 w-full">
                        <div className="flex-shrink-0 w-16 h-16 mr-4"><Image src={character.image} alt={character.name} width={64} height={64} className="w-16 h-16 object-cover rounded" onError={(e) => { e.target.onerror = null; e.target.src = "/placeholder-character.jpg"; }} /></div>
                        <div className="flex-grow min-w-0 text-base font-semibold truncate">{character.name}</div>
                        <div className="flex-shrink-0 flex gap-2 ml-4">
                          <button onClick={() => router.push(`/qsnair/${character.questionnaireId}`)} className="text-blue-500 hover:text-blue-700 text-sm">View</button>
                          <button onClick={() => deleteCharacter(character.id)} className="text-red-500 hover:text-red-700 text-sm">Delete</button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (<div className="text-center py-4 bg-white dark:bg-gray-700 rounded shadow">No characters created yet</div>)}
              </div>
              <button onClick={onLogout} className="typewriter mb-4" style={{ fontSize: "18px", height: "52px" }}>Logout</button>
            </>
          ) : (
            <>
              {showLogin || showSignup ? (renderAuthForms()) : (
                <div className="w-full text-center">
                  <button onClick={() => { setShowLogin(true); setShowSignup(false); setAuthError(null); }} className="typewriter mb-4" style={{ fontSize: "18px", height: "52px" }}>Login</button>
                  <button onClick={() => { setShowSignup(true); setShowLogin(false); setAuthError(null); }} className="typewriter ml-3 mb-4" style={{ fontSize: "18px", height: "52px" }}>Sign Up</button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {showContent && (<button id="left-resizer" onClick={() => setLeftSidebarOpen(!leftSidebarOpen)} onMouseDown={handleMouseDown} style={{ right: leftSidebarOpen ? leftSidebarWidth : 0 }} className="fixed top-1/2 transform -translate-y-1/2 bg-black font-bold text-white px-3 py-20 rounded-l-lg transition-all duration-200 ease-in-out z-30 hover:bg-gray-800">{leftSidebarOpen ? "▶" : "◀"}</button>)}
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col items-center p-6 transition-all duration-500 ease-in-out" style={{ marginRight: leftSidebarOpen ? leftSidebarWidth : 0, minHeight: '100vh' }}>
        <div
          className={`relative flex items-center justify-center transition-all duration-1000 ease-in-out ${
            animationStage >= 2 ? "mt-6 mx-auto" : "my-auto mx-auto"
          }`}
          style={{
            width:
              animationStage >= 1
                ? `calc(90vw - ${leftSidebarOpen ? leftSidebarWidth : 0}px)`
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
                <h1 className="text-center text-white font-bold w-full"
                    style={{
                      fontSize: "64px",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      lineHeight: "130px",
                      height: "130px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center"
                    }}>
                  {animatedTitle}
                </h1>
              </>
            }
            backContent={
              <>
                <div className="absolute w-3 h-3 bg-black rounded-full top-4 left-4"></div>
                <div className="absolute w-3 h-3 bg-black rounded-full top-4 right-4"></div>
                <div className="absolute w-3 h-3 bg-black rounded-full bottom-4 left-4"></div>
                <div className="absolute w-3 h-3 bg-black rounded-full bottom-4 right-4"></div>
                <h1 className="text-center px-5 py-2 text-2xl text-white font-bold">
                  Questionnaire for Character Natures &amp; AI Image Rendering
                </h1>
              </>
            }
            hide={false}
          />
        </div>
        {showContent && (
          <>
            <br /><br />
            <div className="flex flex-col items-center justify-center gap-5">
                <div className="flex gap-5">
                  <button disabled={isCreating} onClick={() => startQuestions(21)} className="typewriter flex flex-col items-center"><span className="text-red-500 text-2xl font-bold leading-tight">create </span>Simple<br /><span className="text-red-500 text-5xl">21</span><span className="text-base px-2 py-1 relative -top-2">Questions</span></button>
                  <button disabled={isCreating} onClick={() => startQuestions(180)} className="typewriter flex flex-col items-center"><span className="text-red-500 text-2xl font-bold leading-tight">create </span>Deep<br /><span className="text-red-500 text-5xl">180</span><span className="text-base px-2 py-1 relative -top-2">Questions</span></button>
                  <button disabled={isCreating} onClick={() => startQuestions(369)} className="typewriter flex flex-col items-center"><span className="text-red-500 text-2xl font-bold leading-tight">create </span>Dive<br /><span className="text-red-500 text-5xl">369</span><span className="text-base px-2 py-1 relative -top-2">Questions</span></button>
                </div>
                <div className="relative w-3/4 mx-auto flex flex-col items-center pt-3 pb-3 bg-white dark:bg-gray-800 rounded-xl border-4 border-black mt-12"><h1 className="text-xl p-4 text-center font-bold">Create and visualize characters with Gen-AI through immersive questionnaires</h1></div>
                {!isLoggedIn && (
                  <div className="flex gap-8 mt-6">
                    <button onClick={() => { setShowLogin(true); setShowSignup(false); setLeftSidebarOpen(true); setAuthError(null); }} className="typewriter flex flex-col items-center justify-center border-2 border-black rounded-lg px-8 py-4 hover:bg-red-50 transition" style={{ fontSize: "1.5rem", fontWeight: 700, minWidth: "140px" }}>Login</button>
                    <button onClick={() => { setShowSignup(true); setShowLogin(false); setLeftSidebarOpen(true); setAuthError(null); }} className="typewriter flex flex-col items-center justify-center border-2 border-black rounded-lg px-8 py-4 hover:bg-red-50 transition" style={{ fontSize: "1.5rem", fontWeight: 700, minWidth: "140px" }}>Sign Up</button>
                  </div>
                )}
              </div>
          </>
        )}
      </div>
    </main>
  );
}