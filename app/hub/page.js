// hub/page.js
"use client";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getCsrfToken } from "@/utils/api";
import Background from "@/components/ui/Background";
import Lypcursor from "@/components/ui/Lypcursor";
import RouteLoadingBar from '@/components/ui/RouteLoadingBar';
import LoginForm from "@/components/LoginForm";
import SignupForm from "@/components/SignupForm";
import Dashboard from "@/components/Dashboard";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

export default function HubPage() {
  const { user, logout, isAuthLoading, refetchUser, handleLogin, handleSignup, authError, setAuthError } = useAuth();
  const isLoggedIn = !!user;
  const router = useRouter();

  const [showLogin, setShowLogin] = useState(true);
  const [showSignup, setShowSignup] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [userName, setUserName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [profilePic, setProfilePic] = useState(null);
  const [profilePicUrl, setProfilePicUrl] = useState("/placeholder-character.jpg");
  const fileInputRef = useRef(null);

  // States for new dashboard boxes
  const [tokenBalance, setTokenBalance] = useState(0);
  const [scripts, setScripts] = useState([]);
  const [questionnaires, setQuestionnaires] = useState([]);
  const [loading, setLoading] = useState({
    balance: false,
    scripts: false,
    questionnaires: false,
  });
  const [errors, setErrors] = useState({
    balance: null,
    scripts: null,
    questionnaires: null,
  });

  // Clear error when switching forms
  useEffect(() => {
    setError("");
  }, [showLogin, showSignup]);

  // Sync profilePicUrl with user.profilePic when user changes
  useEffect(() => {
    if (user && user.profilePic) {
      setProfilePicUrl(user.profilePic);
    } else {
      setProfilePicUrl("/placeholder-character.jpg");
    }
  }, [user]);

  // Fetch dashboard data
  useEffect(() => {
    if (isLoggedIn) {
      // Fetch Token Balance
      setLoading(prev => ({ ...prev, balance: true }));
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user/balance`, { credentials: "include" })
        .then(res => res.json())
        .then(data => {
          if (data.tokens !== undefined) {
            setTokenBalance(data.tokens);
          } else {
            setErrors(prev => ({ ...prev, balance: 'Failed to fetch balance' }));
          }
        })
        .catch(() => setErrors(prev => ({ ...prev, balance: 'Error fetching balance' })))
        .finally(() => setLoading(prev => ({ ...prev, balance: false })));

      // Fetch Scripts
      setLoading(prev => ({ ...prev, scripts: true }));
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/script/scripts`, { credentials: "include" })
        .then(res => res.json())
        .then(data => {
          if (data.scripts) {
            setScripts(data.scripts);
          } else {
            setErrors(prev => ({ ...prev, scripts: 'Failed to fetch scripts' }));
          }
        })
        .catch(() => setErrors(prev => ({ ...prev, scripts: 'Error fetching scripts' })))
        .finally(() => setLoading(prev => ({ ...prev, scripts: false })));

      // Fetch Questionnaires
      setLoading(prev => ({ ...prev, questionnaires: true }));
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/qsnair/questionnaires`, { credentials: "include" })
        .then(res => res.json())
        .then(data => {
          if (data.questionnaires) {
            setQuestionnaires(data.questionnaires);
          } else {
            setErrors(prev => ({ ...prev, questionnaires: 'Failed to fetch questionnaires' }));
          }
        })
        .catch(() => setErrors(prev => ({ ...prev, questionnaires: 'Error fetching questionnaires' })))
        .finally(() => setLoading(prev => ({ ...prev, questionnaires: false })));
    }
  }, [isLoggedIn]);

  // Handle login
  const handleLoginForm = async (e) => {
    e.preventDefault();
    setAuthError(null);
    try {
      await handleLogin({ email, password });
      setShowLogin(false);
      setEmail("");
      setPassword("");
    } catch (err) {
      setAuthError(err.message || "Login failed. Please try again.");
    }
  };

  // Handle signup
  const handleSignupForm = async (e) => {
    e.preventDefault();
    setAuthError(null);

    // Validation
    if (!userName.trim() || !email.trim() || !password) {
      setError("Please fill in all required fields.");
      return;
    }

    if (userName.trim().length < 2) {
      setError("Name must be at least 2 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    // Password strength validation
    const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!strongPasswordRegex.test(password)) {
      setError("Password must be at least 8 characters and include uppercase, lowercase, number, and special character.");
      return;
    }

    try {
      await handleSignup({ userName, companyName, email, password, confirmPassword });
      setShowSignup(false);
      setUserName("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      setCompanyName("");
    } catch (err) {
      setAuthError(err.message || "Signup failed. Please try again.");
    }
  };

  // Add a handler to set user and profile pic from Google login/signup
  const handleGoogleAuth = async (user, googleProfilePicUrl) => {
    await refetchUser();
    setProfilePicUrl(googleProfilePicUrl || "/placeholder-character.jpg");
    setShowLogin(false);
    setShowSignup(false);
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await logout();
      setShowLogin(true);
      setShowSignup(false);
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      setUserName("");
      setCompanyName("");
      setProfilePic(null);
      setProfilePicUrl("/placeholder-character.jpg"); // Reset to placeholder
      setError("");
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  const handleProfilePicChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size must be less than 5MB");
        return;
      }

      // Validate file type
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
        />
      )}
    </div>
  );

  const renderDashboard = () => (
    <Dashboard
      userName={user?.name}
      email={user?.email}
      profilePicUrl={profilePicUrl}
      handleProfilePicClick={handleProfilePicClick}
      fileInputRef={fileInputRef}
      handleProfilePicChange={handleProfilePicChange}
      handleLogout={handleLogout}
    />
  );

  // Show loading state while checking authentication
  if (isAuthLoading) {
    return (
      <main className="relative w-full min-h-screen bg-gray-100 dark:bg-gray-900">
        <RouteLoadingBar />
        <Lypcursor />
        <Background />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-300">Loading...</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="relative w-full min-h-screen bg-gray-100 dark:bg-gray-900">
      <RouteLoadingBar />
      <Lypcursor />
      <Background />
      <br /><br /><br /><br /><br /><br />
      <section className="relative w-3/4 max-w-4xl mx-auto flex flex-col items-center pt-7 pb-15 bg-[#ffff00] dark:bg-gray-800 rounded-xl border-4 border-black">
        {/* Black Dots at Corners */}
        <div className="absolute w-3 h-3 bg-black rounded-full top-4 left-4"></div>
        <div className="absolute w-3 h-3 bg-black rounded-full top-4 right-4"></div>
        <div className="absolute w-3 h-3 bg-black rounded-full bottom-4 left-4"></div>
        <div className="absolute w-3 h-3 bg-black rounded-full bottom-4 right-4"></div>

        <h1 className="bg-gray-100 p-4 border-3 border-black text-center text-3xl font-bold mb-6 text-black dark:text-white rounded-lg">
          2LYP Hub
        </h1>

        {!isLoggedIn ? renderAuthForms() : renderDashboard()}
      </section>

      {isLoggedIn && (
        <div className="w-3/4 max-w-4xl mx-auto mt-8 flex flex-col gap-8">
          {/* Token Balance Box */}
          <div className="relative p-6 bg-white dark:bg-gray-800 rounded-xl border-4 border-black">
            <h2 className="text-2xl font-bold mb-4 text-black dark:text-white">Token Balance</h2>
            {loading.balance ? (
              <p>Loading...</p>
            ) : errors.balance ? (
              <p className="text-red-500">{errors.balance}</p>
            ) : (
              <p className="text-xl text-black dark:text-white">You have <span className="font-bold text-blue-600 dark:text-blue-400">{tokenBalance}</span> 2LYP tokens.</p>
            )}
          </div>

          {/* Scriptr Dashboard Box */}
          <div className="relative p-6 bg-white dark:bg-gray-800 rounded-xl border-4 border-black">
            <h2 className="text-2xl font-bold mb-4 text-black dark:text-white">Scriptr Dashboard</h2>
            {loading.scripts ? (
              <p>Loading scripts...</p>
            ) : errors.scripts ? (
              <p className="text-red-500">{errors.scripts}</p>
            ) : scripts.length > 0 ? (
              <ul className="space-y-2">
                {scripts.slice(0, 5).map(script => (
                  <li key={script._id} className="flex justify-between items-center p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer" onClick={() => router.push(`/scriptr/${script._id}`)}>
                    <span className="font-semibold text-black dark:text-white">{script.title || 'Untitled Script'}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">{new Date(script.updatedAt).toLocaleDateString()}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-black dark:text-white">No scripts found.</p>
            )}
            {scripts.length > 0 && (
              <button onClick={() => router.push('/scriptr')} className="mt-4 text-blue-600 dark:text-blue-400 hover:underline">View all scripts...</button>
            )}
          </div>

          {/* Qsnair Dashboard Box */}
          <div className="relative p-6 bg-white dark:bg-gray-800 rounded-xl border-4 border-black">
            <h2 className="text-2xl font-bold mb-4 text-black dark:text-white">Qsnair Dashboard</h2>
            {loading.questionnaires ? (
              <p>Loading questionnaires...</p>
            ) : errors.questionnaires ? (
              <p className="text-red-500">{errors.questionnaires}</p>
            ) : questionnaires.length > 0 ? (
              <ul className="space-y-2">
                {questionnaires.slice(0, 5).map(q => (
                  <li key={q._id} className="flex justify-between items-center p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer" onClick={() => router.push(`/qsnair/${q._id}`)}>
                    <span className="font-semibold text-black dark:text-white">{q.title || 'Untitled Questionnaire'}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">{new Date(q.updatedAt).toLocaleDateString()}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-black dark:text-white">No questionnaires found.</p>
            )}
            {questionnaires.length > 0 && (
              <button onClick={() => router.push('/qsnair')} className="mt-4 text-blue-600 dark:text-blue-400 hover:underline">View all questionnaires...</button>
            )}
          </div>
        </div>
      )}
      <br />
    </main>
  );
}