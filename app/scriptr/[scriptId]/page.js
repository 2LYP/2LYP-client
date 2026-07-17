"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import LoginForm from "@/components/LoginForm";
import SignupForm from "@/components/SignupForm";
import FlipCard from "@/components/scriptr/FlipCard";
import LeftSidebar from "@/components/scriptr/LeftSidebar";
import Background from "@/components/ui/Background";
import Lypcursor from "@/components/ui/Lypcursor";
import RouteLoadingBar from "@/components/ui/RouteLoadingBar";
import Button from "@/components/ui/Button";
import WriterControls from "@/components/scriptr/WriterControls";
import ScriptPages from "@/components/scriptr/ScriptPages";
import AnimatedTitle from "@/components/scriptr/AnimatedTitle";
import CoverForm from "@/components/scriptr/CoverForm";
import ScreenElementBlock from "@/components/scriptr/ScreenElementBlock";
import styles from "@/styles/scriptr.module.css";
import Dashboard from "@/components/Dashboard"; 
import { useTheme } from "@/contexts/ThemeContext";
import { toast } from "react-toastify";
import TempScriptWarningModal from "@/components/ui/TempScriptWarningModal";
import useScriptWriter from "@/hooks/useScriptWriter";

export default function ScriptrScriptPage() {
  const { isDarkMode } = useTheme();
  const router = useRouter();
  const { user, logout, handleLogin, handleSignup, authError, setAuthError, refetchUser } = useAuth();
  const isLoggedIn = !!user;
  
  // State variables
  const [showContent, setShowContent] = useState(false);
  const [printMode, setPrintMode] = useState(false);
  
  // Auth form states
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userName, setUserName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  // Sidebar states
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(300);
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(false);
  const [leftSidebarWidth, setLeftSidebarWidth] = useState(300);
  
  // Refs
  const leftSidebarRef = useRef(null);
  const sidebarRef = useRef(null);
  const isLeftResizing = useRef(false);
  const isResizing = useRef(false);
  const fileInputRef = useRef(null);
  
  // Script management states
  const [userScripts, setUserScripts] = useState([]);
  const [userScriptsLoading, setUserScriptsLoading] = useState(false);
  const [editingScriptId, setEditingScriptId] = useState(null);
  const [editingTitle, setEditingTitle] = useState("");
  
  // Profile states
  const [profilePic, setProfilePic] = useState(null);
  const [profilePicUrl, setProfilePicUrl] = useState("/placeholder-character.jpg");
  
  // A4 pagination state
  const [a4Paginate, setA4Paginate] = useState(false);
  
  const params = useParams();
  const scriptId = params?.scriptId;

  // Use custom screenplay hook
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
    setActiveElement,
  } = useScriptWriter();

  // Add save status and auto-save state
  const [saveStatus, setSaveStatus] = useState("idle"); // idle | saving | saved | error
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  // If script is new/unsaved (from Create), disable auto-save by default
  useEffect(() => {
    if (typeof window !== 'undefined' && scriptId && scriptId.startsWith('temp-')) {
      setAutoSaveEnabled(false);
    }
  }, [scriptId]);

  // Fetch script content or restore temp script from storage
  useEffect(() => {
    if (!scriptId) return;
    // If temp script, try to restore from localStorage/sessionStorage
    if (scriptId.startsWith('temp-')) {
      let temp = null;
      try {
        temp = JSON.parse(localStorage.getItem('scriptr_temp_script') || sessionStorage.getItem('scriptr_temp_script'));
      } catch {}
      if (temp && temp.screenplayElements && temp.formData) {
        setScreenplayElements(temp.screenplayElements);
        setFormData(temp.formData);
      }
      return;
    }
    // Otherwise, fetch from server
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/script/${scriptId}`, {
      method: 'GET',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    })
      .then(async res => {
        let data;
        try {
          data = await res.json();
        } catch (err) {
          console.error("Failed to parse response as JSON:", err);
          toast.error("Failed to load script: Invalid server response.");
          return;
        }
        if (data.error && data.error.toLowerCase().includes("decrypt")) {
          console.error("Backend decryption error:", data.error);
          toast.error("Failed to decrypt script data. Please check your account or contact support.");
          setScreenplayElements([
            { type: "sceneheading", number: 1, setting: "", location: "", time: "" },
            { type: "action", action: "" },
            { type: "character", character_name: "" },
            { type: "parenthetical", parentheticalText: "" },
            { type: "dialogue", dialogue: "" },
            { type: "transition", transition: "" },
          ]);
          setFormData({ movie_name: "", writer: "", director: "", producer: "" });
          return;
        }
        const scriptObj = data.script || data;
        if (scriptObj.content) {
          try {
            const parsedContent = JSON.parse(scriptObj.content);
            if (parsedContent.screenplayElements) {
              setScreenplayElements(parsedContent.screenplayElements);
            }
            if (parsedContent.formData) {
              setFormData(parsedContent.formData);
            }
          } catch (err) {
            console.error("Failed to parse script content:", err);
            toast.error("Failed to load script: Content is corrupted or invalid.");
          }
        } else if (scriptObj.formData && scriptObj.screenplayElements) {
          setScreenplayElements(scriptObj.screenplayElements);
          setFormData(scriptObj.formData);
        } else if (data.error) {
          toast.error(data.error);
        }
      })
      .catch(err => {
        console.error("Failed to fetch script:", err);
        toast.error("Network error: Could not load script.");
      });
  }, [scriptId]);
  // Persist temp script to storage on every change
  useEffect(() => {
    if (scriptId && scriptId.startsWith('temp-')) {
      const temp = JSON.stringify({ screenplayElements, formData });
      try {
        localStorage.setItem('scriptr_temp_script', temp);
      } catch {
        sessionStorage.setItem('scriptr_temp_script', temp);
      }
    }
  }, [screenplayElements, formData, scriptId]);

  // Save logic (manual or auto)
  const saveScript = useCallback(async () => {
    if (!user || !scriptId || scriptId.startsWith('temp-')) return;
    setSaveStatus("saving");
    try {
      const safeScreenplayElements = Array.isArray(screenplayElements) && screenplayElements.length > 0
        ? screenplayElements
        : [{ type: "sceneheading", number: 1, setting: "", location: "", time: "" }];
      const safeFormData = formData && typeof formData === "object"
        ? formData
        : { movie_name: "", writer: "", director: "", producer: "" };
      const csrfRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/csrf-token`, { credentials: "include" });
      const { csrfToken } = await csrfRes.json();
      const title = (safeFormData.movie_name && typeof safeFormData.movie_name === "string" && safeFormData.movie_name.trim())
        ? safeFormData.movie_name.trim()
        : "Untitled Script";
      const contentObj = { screenplayElements: safeScreenplayElements, formData: safeFormData };
      const content = JSON.stringify(contentObj);
      const body = JSON.stringify({ title: title || "Untitled Script", content: content || "{}" });
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/script/${scriptId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "X-CSRF-Token": csrfToken },
        credentials: "include",
        body,
      });
      if (!res.ok) {
        let msg = "Failed to save script";
        let data;
        const text = await res.text();
        try { data = JSON.parse(text); } catch { data = text; }
        if (data && typeof data === "object" && (data.error || data.message)) {
          msg = data.error || data.message;
          toast.error(msg || "Save failed: Unknown error");
        } else if (typeof data === "object" && Object.keys(data).length === 0) {
          toast.error("Save failed: No error details returned.");
        } else if (typeof data === "string" && data.trim().length > 0) {
          msg = data;
          toast.error(msg);
        } else {
          msg = "Failed to save script (no error details from server)";
          toast.error(msg);
        }
        setSaveStatus("error");
        return;
      }
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 1500);
      if (formData.movie_name) {
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/script/scripts`, {
          method: "GET",
          credentials: "include",
          headers: { "Content-Type": "application/json" }
        })
          .then(res => res.json())
          .then(data => { setUserScripts(Array.isArray(data.scripts) ? data.scripts : []); })
          .catch(err => { console.error("Failed to refetch scripts:", err); });
      }
    } catch (err) {
      setSaveStatus("error");
      toast.error("Network error: Could not save script");
      console.error("Save failed:", err);
    }
  }, [user, scriptId, screenplayElements, formData]);

  // Auto-Save effect: only if enabled, logged in, and not a temp script
  useEffect(() => {
    if (!autoSaveEnabled || !user || !scriptId || scriptId.startsWith('temp-')) return;
    const timeout = setTimeout(() => { saveScript(); }, 1000);
    return () => clearTimeout(timeout);
  }, [screenplayElements, formData, saveScript, autoSaveEnabled, user, scriptId]);

  // Manual Save handler: if not logged in, show login, then save after login
  const handleSave = async () => {
    if (!user) {
      // Before showing login, ensure current temp script data is saved to storage
      if (scriptId && scriptId.startsWith('temp-')) {
        const temp = JSON.stringify({ screenplayElements, formData });
        try {
          localStorage.setItem('scriptr_temp_script', temp);
        } catch {
          sessionStorage.setItem('scriptr_temp_script', temp);
        }
        console.log('Saving temp script data before login:', { screenplayElements, formData });
      }
      setShowLogin(true);
      setShowSignup(false);
      setLeftSidebarOpen(true);
      // Login will automatically trigger conversion of temp script
      return;
    }
    if (!scriptId) {
      toast.error('Please create and save a script after logging in.');
      return;
    }
    if (scriptId.startsWith('temp-')) {
      // User is logged in, but editing a temp script: convert to permanent script
      await convertTempScriptToPermanent();
      return;
    }
    saveScript();
  };

  // Ctrl+S shortcut for Save
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        handleSave();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSave]);

  // Helper function to convert temp script to permanent script after login
  const convertTempScriptToPermanent = async () => {
    if (!scriptId || !scriptId.startsWith('temp-')) return;
    
    try {
      // First, ensure we have the latest temp script data from storage
      let tempData = null;
      try {
        tempData = JSON.parse(localStorage.getItem('scriptr_temp_script') || sessionStorage.getItem('scriptr_temp_script'));
      } catch {}
      
      // Use temp data if available, otherwise fall back to current state
      let elementsToSave = screenplayElements;
      let formDataToSave = formData;
      
      if (tempData && tempData.screenplayElements && tempData.formData) {
        elementsToSave = tempData.screenplayElements;
        formDataToSave = tempData.formData;
        // Update current state to match temp data
        setScreenplayElements(tempData.screenplayElements);
        setFormData(tempData.formData);
      }
      
      const csrfRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/csrf-token`, { credentials: "include" });
      const { csrfToken } = await csrfRes.json();
      
      const safeScreenplayElements = Array.isArray(elementsToSave) && elementsToSave.length > 0
        ? elementsToSave
        : [{ type: "sceneheading", number: 1, setting: "", location: "", time: "" }];
      const safeFormData = formDataToSave && typeof formDataToSave === "object"
        ? formDataToSave
        : { movie_name: "", writer: "", director: "", producer: "" };
      
      const title = (safeFormData.movie_name && typeof safeFormData.movie_name === "string" && safeFormData.movie_name.trim())
        ? safeFormData.movie_name.trim()
        : "Untitled Script";
      
      const contentObj = { screenplayElements: safeScreenplayElements, formData: safeFormData };
      const content = JSON.stringify(contentObj);
      const body = JSON.stringify({ title: title || "Untitled Script", content: content || "{}" });
      
      console.log('Converting temp script with data:', { safeScreenplayElements, safeFormData, title });
      
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/script/new`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-CSRF-Token": csrfToken },
        credentials: "include",
        body,
      });
      
      if (!res.ok) {
        toast.error('Failed to save script to account after login.');
        return;
      }
      
      const data = await res.json();
      if (data.scriptId) {
        // Clear the temp script from storage since it's now saved
        localStorage.removeItem('scriptr_temp_script');
        sessionStorage.removeItem('scriptr_temp_script');
        // Redirect to the new permanent script
        router.replace(`/scriptr/${data.scriptId}`);
        toast.success('Script saved to your account!');
      }
    } catch (err) {
      toast.error('Failed to save script to account after login.');
      console.error('Convert temp script error:', err);
    }
  };

  // Google auth handler: after Google login, refetch user and update UI immediately
  const handleGoogleAuth = async (user, googleProfilePicUrl) => {
    await refetchUser();
    setShowLogin(false);
    setShowSignup(false);
    setLeftSidebarOpen(false);
    // If temp script, convert it to permanent script and redirect
    if (scriptId && scriptId.startsWith('temp-')) {
      await convertTempScriptToPermanent();
    }
  };

  // Auth success handler: refetch user, close forms, show dashboard immediately
  const handleAuthSuccess = async () => {
    await refetchUser();
    setShowLogin(false);
    setShowSignup(false);
    setLeftSidebarOpen(false);
    // If temp script, convert it to permanent script and redirect
    if (scriptId && scriptId.startsWith('temp-')) {
      await convertTempScriptToPermanent();
    }
  };

  // Local login handler that calls onAuthSuccess
  const handleLoginForm = async (e) => {
    e.preventDefault?.();
    try {
      await handleLogin({ email, password });
      // Wait for user state to update
      await refetchUser();
      setShowLogin(false);
      setShowSignup(false);
      setLeftSidebarOpen(false);
      // If temp script, convert it to permanent script and redirect
      if (scriptId && scriptId.startsWith('temp-')) {
        await convertTempScriptToPermanent();
      }
    } catch (err) {
      setAuthError(err.message || "Login failed. Please try again.");
    }
  };

  // Local signup handler that calls onAuthSuccess
  const handleSignupForm = async (e) => {
    e.preventDefault?.();
    try {
      await handleSignup({ userName, companyName, email, password, confirmPassword });
      // Wait for user state to update
      await refetchUser();
      // Debug: log user after refetch
      console.log("User after signup:", user);
      setShowLogin(false);
      setShowSignup(false);
      setLeftSidebarOpen(false);
      // If temp script, convert it to permanent script and redirect
      if (scriptId && scriptId.startsWith('temp-')) {
        await convertTempScriptToPermanent();
      }
    } catch (err) {
      setAuthError(err.message || "Signup failed. Please try again.");
    }
  };

  // Temp Script Warning Modal
  const [showTempWarning, setShowTempWarning] = useState(false);

  useEffect(() => {
    if (!isLoggedIn && scriptId && scriptId.startsWith('temp-')) {
      setShowTempWarning(true);
    }
  }, [isLoggedIn, scriptId]);

  // Auth forms renderer
  const renderAuthForms = () => (
    <div className="z-50 relative w-full max-w-md mx-auto mt-8">
      {showLogin && (
        <LoginForm
          email={email}
          password={password}
          error={authError}
          onEmailChange={(e) => setEmail(e.target.value)}
          onPasswordChange={(e) => setPassword(e.target.value)}
          onSubmit={handleLoginForm}
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
          onSubmit={handleSignupForm}
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

  // Mouse handlers for resizing
  const handleLeftMouseDown = () => (isLeftResizing.current = true);
  const handleMouseDown = () => (isResizing.current = true);
  
  // Update handleMouseMove to support right sidebar resizing
  const handleMouseMove = useCallback(
    (e) => {
      if (isLeftResizing.current) {
        const newWidth = window.innerWidth - e.clientX;
        if (newWidth > 200 && newWidth < 600) setLeftSidebarWidth(newWidth);
      }
      if (isResizing.current) {
        const newWidth = e.clientX;
        if (newWidth > 200 && newWidth < 600) setSidebarWidth(newWidth);
      }
    },
    []
  );
  
  const handleMouseUp = useCallback(() => {
    isLeftResizing.current = false;
    isResizing.current = false;
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setShowContent(true), 500);
    return () => clearTimeout(timer);
  }, []);

  // Debug logs
  useEffect(() => {
    console.log("Render: ", { screenplayElements, formData, saveStatus });
  });

  // Add debug logs before return
  console.log("isLoggedIn:", isLoggedIn, "user:", user);
  console.log("screenplayElements:", screenplayElements);
  console.log("printMode:", printMode);

  // Keyboard shortcuts for block insert, print, undo
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Only handle keyboard shortcuts when not in an input field
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        return;
      }
      
      if (e.altKey && !e.shiftKey && !e.ctrlKey) {
        switch (e.key.toLowerCase()) {
          case "1":
            // Add scene heading block
            e.preventDefault();
            scenehead();
            break;
          case "2":
            // Add action block
            e.preventDefault();
            addActionBlock();
            break;
          case "3":
            // Add character block
            e.preventDefault();
            addCharacterBlock();
            break;
          case "4":
            // Add parenthetical block
            e.preventDefault();
            addParentheticalBlock();
            break;
          case "5":
            // Add dialogue block
            e.preventDefault();
            addDialogueBlock();
            break;
          case "6":
            // Add transition block
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
  }, [scenehead, addActionBlock, addCharacterBlock, addParentheticalBlock, addDialogueBlock, addTransitionBlock, handleUndo, handleRedo, a4Paginate]);

  // Fetch all scripts for the logged-in user
  useEffect(() => {
    if (!user) {
      setUserScripts([]);
      return;
    }
    setUserScriptsLoading(true);
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/script/scripts`, {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json"
      }
    })
      .then(res => res.json())
      .then(data => {
        setUserScripts(Array.isArray(data.scripts) ? data.scripts : []);
        setUserScriptsLoading(false);
      })
      .catch(() => {
        setUserScripts([]);
        setUserScriptsLoading(false);
      });
  }, [user, scriptId, formData.movie_name]);

  // Add debug log for scripts
  useEffect(() => {
    if (userScripts && userScripts.length > 0) {
      console.log("User Scripts:", userScripts);
    }
  }, [userScripts]);

  // Sync profilePicUrl with user.profilePic when user changes
  useEffect(() => {
    if (user && user.profilePic) {
      setProfilePicUrl(user.profilePic);
    } else {
      setProfilePicUrl("/placeholder-character.jpg");
    }
  }, [user]);

  // Profile pic upload handler
  const handleProfilePicChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size must be less than 5MB");
        return;
      }
      if (!file.type.startsWith('image/')) {
        toast.error("Please select an image file");
        return;
      }
      setProfilePic(file);
      setProfilePicUrl(URL.createObjectURL(file));
    }
  };
  
  const handleProfilePicClick = () => {
    fileInputRef.current?.click();
  };

  // Handler for updating script title (movie name) directly from the list
  const handleScriptTitleEdit = async (scriptIdToEdit, newTitle) => {
    if (!newTitle.trim()) return;
    try {
      const csrfRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/csrf-token`, {
        credentials: "include",
      });
      const { csrfToken } = await csrfRes.json();
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/script/${scriptIdToEdit}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": csrfToken,
        },
        credentials: "include",
        body: JSON.stringify({ title: newTitle }),
      });
      if (!res.ok) {
        toast.error("Failed to update script title");
      } else {
        // Refetch scripts after update
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/script/scripts`, {
          method: "GET",
          credentials: "include",
          headers: { "Content-Type": "application/json" }
        })
          .then(res => res.json())
          .then(data => setUserScripts(Array.isArray(data.scripts) ? data.scripts : []));
      }
    } catch (err) {
      toast.error("Network error: Could not update script title");
    }
  };

  // Handler for deleting a script
  const handleDeleteScript = async (scriptIdToDelete) => {
    if (!window.confirm("Are you sure you want to delete this script?")) return;
    try {
      const csrfRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/csrf-token`, {
        credentials: "include",
      });
      const { csrfToken } = await csrfRes.json();
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/script/${scriptIdToDelete}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": csrfToken,
        },
        credentials: "include",
      });
      if (!res.ok) {
        toast.error("Failed to delete script");
      } else {
        setUserScripts(scripts => scripts.filter(s => s._id !== scriptIdToDelete));
        toast.success("Script deleted");
        // Optionally, redirect if current script is deleted
        if (scriptIdToDelete === scriptId) {
          router.push("/scriptr");
        }
      }
    } catch (err) {
      toast.error("Network error: Could not delete script");
    }
  };

  // Handler for downloading a script as PDF
  const handleDownloadScript = (scriptIdToDownload) => {
    window.open(`${process.env.NEXT_PUBLIC_API_URL}/api/script/download/${scriptIdToDownload}`, "_blank");
  };

  // Update renderDashboard to include "Your Scripts" with actions
  const renderDashboard = () => (
    <div>
      {/* Custom styled buttons for Hub Dashboard and Logout */}
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold">
          Namaste, <br /> {user?.name || user?.email || "User"}
        </h2>
      </div>
      <div className="mb-4">
        <div className="font-bold mb-1">Your Scripts</div>
        {userScriptsLoading ? (
          <div>Loading...</div>
        ) : (
          <div
            className="max-h-40 overflow-y-auto text-xs"
            style={{ fontFamily: 'Courier New, Courier, monospace', color: '#f3f6fa' }}
          >
            <div style={{ display: 'table', width: '100%' }}>
              {userScripts.length === 0 && (
                <div style={{ display: 'table-row' }}>
                  <div style={{ display: 'table-cell', padding: '2px 0', color: isDarkMode ? '#f3f6fa' : 'black' }}>No scripts found.</div>
                </div>
              )}
              {userScripts.map((script) => (
                <div
                  key={script._id}
                  style={{ display: 'table-row', verticalAlign: 'middle' }}
                >
                  <div
                    style={{
                      display: 'table-cell',
                      minWidth: 110,
                      maxWidth: 180,
                      padding: '2px 0',
                      fontWeight: 700,
                      color: script._id == scriptId ? '#4ade80' : (isDarkMode ? '#f3f6fa' : '#000'),
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      fontSize: '1.1em',
                    }}
                    title="Go to script"
                    onClick={() => {
                      if (editingScriptId === script._id) return;
                      router.push(`/scriptr/${script._id}`);
                    }}
                  >
                    {editingScriptId === script._id ? (
                      <input
                        type="text"
                        value={editingTitle}
                        onChange={e => setEditingTitle(e.target.value)}
                        onBlur={() => {
                          handleScriptTitleEdit(script._id, editingTitle);
                          setEditingScriptId(null);
                        }}
                        onKeyDown={e => {
                          if (e.key === 'Enter') {
                            handleScriptTitleEdit(script._id, editingTitle);
                            setEditingScriptId(null);
                          } else if (e.key === 'Escape') {
                            setEditingScriptId(null);
                          }
                        }}
                        style={{
                          fontFamily: 'inherit',
                          fontWeight: 700,
                          fontSize: '1.1em',
                          background: '#222e39',
                          color: '#f3f6fa',
                          border: '1.5px solid #aaa',
                          borderRadius: '6px',
                          padding: '1px 6px',
                          minWidth: 60,
                          maxWidth: 120,
                        }}
                        autoFocus
                      />
                    ) : (
                      script.title || 'Untitled Script'
                    )}
                  </div>
                  <div style={{ display: 'table-cell', minWidth: 80, padding: '2px 0', textAlign: 'left' }}>
                    <button
                      title="Edit title"
                      onClick={e => {
                        e.stopPropagation();
                        setEditingScriptId(script._id);
                        setEditingTitle(script.title || 'Untitled');
                      }}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontSize: '1.2em', marginRight: 2 }}
                    >
                      <span role="img" aria-label="edit">✏️</span>
                    </button>
                    <button
                      title="Delete"
                      onClick={e => {
                        e.stopPropagation();
                        handleDeleteScript(script._id);
                      }}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontSize: '1.2em', marginRight: 2 }}
                    >
                      <span role="img" aria-label="delete">🗑️</span>
                    </button>
                    <button
                      title="Download PDF"
                      onClick={e => {
                        e.stopPropagation();
                        handleDownloadScript(script._id);
                      }}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontSize: '1.2em' }}
                    >
                      <span role="img" aria-label="download">⬇️</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem', marginBottom: '2.5rem', marginTop: '1.5rem' }}>
        <Button
          onClick={() => router.push("/hub")}
          className="typewriter mb-4"
          style={{ fontSize: "18px", height: "52px" }}
        >
          Hub Dashboard
        </Button>
        <Button
          onClick={logout}
          className="typewriter mb-4"
          style={{ fontSize: "18px", height: "52px" }}
        >
          Logout
        </Button>
      </div>
    </div>
  );

  // Handler to toggle A4 paginate mode
  const handleA4PaginateToggle = () => setA4Paginate((prev) => !prev);

  // Pagination logic: split screenplayElements into pages of N elements
  const elementsPerPage = 60;
  const paginatedElements = [];
  if (a4Paginate) {
    // Handle the case where we have no elements
    if (screenplayElements.length === 0) {
      paginatedElements.push([]);
    } else {
      // Split all elements into pages of elementsPerPage
      for (let i = 0; i < screenplayElements.length; i += elementsPerPage) {
        paginatedElements.push(screenplayElements.slice(i, i + elementsPerPage));
      }
    }
  }

  return (
    <main
      className={`relative w-full min-h-screen bg-gray-100 dark:bg-gray-900 ${
        printMode ? "print-mode" : ""
      }`}
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
          renderDashboard={renderDashboard}
          scripts={userScripts}
          scriptsLoading={userScriptsLoading}
          scriptsError={null}
          handleScriptTitleEdit={handleScriptTitleEdit}
          handleDeleteScript={handleDeleteScript}
          handleDownloadScript={handleDownloadScript}
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

      {/* Right Sidebar (Writer Controls) */}
      {!printMode && showContent && (
        <WriterControls
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          sidebarWidth={sidebarWidth}
          setSidebarWidth={setSidebarWidth}
          sidebarRef={sidebarRef}
          isResizing={isResizing}
          handleMouseDown={handleMouseDown}
          handleA4PaginateToggle={handleA4PaginateToggle}
          a4Paginate={a4Paginate}
          scenehead={scenehead}
          addActionBlock={addActionBlock}
          addCharacterBlock={addCharacterBlock}
          addParentheticalBlock={addParentheticalBlock}
          addDialogueBlock={addDialogueBlock}
          addTransitionBlock={addTransitionBlock}
          handleUndo={() => setScreenplayElements(prev => prev.length > 1 ? prev.slice(0, -1) : prev)}
          handlePrint={() => {
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
          }}
          // New props for Save/Auto-Save
          handleSave={handleSave}
          autoSaveEnabled={autoSaveEnabled}
          setAutoSaveEnabled={setAutoSaveEnabled}
          isLoggedIn={!!user}
        />
      )}

      {/* Main content with adjusted margins */}
      <div
        className={`flex-1 flex flex-col items-center justify-center p-6 transition-all duration-500 ease-in-out ${
          printMode ? "print-main" : ""
        }`}
        style={{
          marginLeft: !printMode && sidebarOpen ? sidebarWidth : 0,
          marginRight: !printMode && leftSidebarOpen ? leftSidebarWidth : 0,
          minHeight: "100vh",
        }}
      >
        {/* Save status indicator */}
        <div style={{ position: "fixed", top: 10, left: 10, zIndex: 1000 }}>
          {saveStatus === "saving" && <span>Saving...</span>}
          {saveStatus === "saved" && <span style={{ color: isDarkMode ? '#22c55e' : 'green' }}>Saved</span>}
          {saveStatus === "error" && <span style={{ color: isDarkMode ? '#f87171' : 'red' }}>Save failed</span>}
        </div>

        {/* Hidden file input for profile pic */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleProfilePicChange}
          accept="image/*"
          style={{ display: 'none' }}
        />

        {/* Render CoverForm and ScriptPages in A4 paginate or scroll mode */}
        {a4Paginate ? (
          <>
            {/* Render Cover Page separately */}
            <div
              className={`a4-box${printMode ? ' print-a4' : ''}`}
              style={{
                display: printMode ? 'flex' : undefined,
                marginTop: printMode ? 0 : '2rem',
                minHeight: printMode ? '297mm' : undefined,
                width: printMode ? '210mm' : undefined,
                maxWidth: printMode ? '210mm' : undefined,
                padding: printMode ? '5mm' : undefined,
                position: 'relative'
              }}
            >
              <CoverForm
                formData={formData}
                setFormData={setFormData}
                printMode={printMode}
              />
              <div className={styles.a4Footer}>
                drafted using S.C.R.I.P.T.R. by <span style={{ fontFamily: "Arial" }}>2LYP Computations</span> @ <span style={{ fontWeight: "bold" }}>{formData.writer || "Writer"}</span>
              </div>
            </div>

            {/* Render Script Pages */}
            {(() => {
              let runningSceneNumber = 1;
              let globalStartIndex = 0;
              return paginatedElements.map((elements, pageIdx) => {
                const sceneHeadingsOnPage = elements.filter(e => e.type === "sceneheading").length;
                const sceneNumberStart = runningSceneNumber;
                const startIndex = globalStartIndex;
                runningSceneNumber += sceneHeadingsOnPage;
                globalStartIndex += elements.length;
                return (
                  <div
                    key={pageIdx}
                    className={`a4-box${printMode ? ' print-a4' : ''}`}
                    style={{
                      display: printMode ? 'flex' : undefined,
                      marginTop: printMode ? 0 : '-2rem',
                      minHeight: printMode ? '297mm' : undefined,
                      width: printMode ? '210mm' : undefined,
                      maxWidth: printMode ? '210mm' : undefined,
                      padding: printMode ? '5mm' : undefined,
                      position: 'relative'
                    }}
                  >
                    <div className={styles.a4PageNumber}>
                      {pageIdx + 1}
                    </div>
                    <ScriptPages
                      screenplayElements={elements}
                      setScreenplayElements={setScreenplayElements}
                      printMode={printMode}
                      formData={formData}
                      scriptId={scriptId}
                      user={user}
                      sceneNumberStart={sceneNumberStart}
                      startIndex={startIndex}
                      removeBlock={removeBlock}
                      isBlockEmpty={isBlockEmpty}
                      handleUndo={handleUndo}
                      handleRedo={handleRedo}
                    />
                  </div>
                );
              });
            })()}
          </>
        ) : (
          <>
            <CoverForm
              formData={formData}
              setFormData={setFormData}
              printMode={printMode}
            />
            <ScriptPages
              screenplayElements={screenplayElements}
              setScreenplayElements={setScreenplayElements}
              printMode={printMode}
              formData={formData}
              scriptId={scriptId}
              user={user}
              sceneNumberStart={1}
              startIndex={0}
              removeBlock={removeBlock}
              isBlockEmpty={isBlockEmpty}
              handleUndo={handleUndo}
              handleRedo={handleRedo}
              setActiveElement={setActiveElement}
            />
          </>
        )}

        {/* Temp Script Warning Modal */}
        <TempScriptWarningModal
          open={showTempWarning}
          onClose={() => setShowTempWarning(false)}
          onLogin={() => {
            setShowTempWarning(false);
            setShowLogin(true);
            setShowSignup(false);
            setLeftSidebarOpen(true);
          }}
          onSignup={() => {
            setShowTempWarning(false);
            setShowSignup(true);
            setShowLogin(false);
            setLeftSidebarOpen(true);
          }}
        />
      </div>
    </main>
  );
}
