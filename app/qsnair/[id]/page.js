"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Background from "@/components/ui/Background";
import Lypcursor from "@/components/ui/Lypcursor";
import RouteLoadingBar from '@/components/ui/RouteLoadingBar';
import { useAuth } from "@/contexts/AuthContext";
import { axiosInstance } from "@/utils/api";
import { toast } from "react-toastify";
import Image from "next/image";
import { io as socketIOClient } from "socket.io-client";
import LoginForm from "@/components/LoginForm";
import SignupForm from "@/components/SignupForm";
import FlipCard from "@/components/scriptr/FlipCard";

// Constants
const animatedTitle = "Q.S.N.Ai.R.";
const QUESTION_SETS = {
  21: ["What is character's full name?", "What is {name}'s gender?", "What is {name}'s favorite color?", "What is {name}'s age?", "What is {name}'s favorite beverage?",
    "If {name} had to run an errand, which vehicle would they pick?", "Is {name} more of a morning person or a night owl?",
    "What kind of music does {name} enjoy?", "What brand of clothes does {name} like?",
    "What is {name}'s favorite genre of entertainment?", "Does {name} enjoy being indoors or outdoors more?",
    "What is {name}'s favorite season?",
    "Does {name} like sweet or savory snacks?",
    "How often does {name} usually spend time in gym?",
    "What’s {name}'s birthplace?",
    "Does {name} prefer dogs or cats?",
    "Is {name} more introverted or extroverted?",
    "What’s {name}'s ethnicity?",
    "Does {name} believe in astrology?",
    "Does {name} prefer city life or village living?",
    "What’s a hobby {name} enjoys?",
    "On a scale of 1 to 10, how much does {name} like jilabi sweets?",
    "If {name} could have any superpower, what would it be?"],
  180: [
    "What is character's full name?",
    "Does {name} have any nicknames, and why?",
    "What is {name}'s age?",
    "What is {name}'s zodiac sign?",
    "What is {name}'s blood type?",
    "What is {name}'s gender identity?",
    "What are {name}'s pronouns?",
    "What is {name}'s sexual orientation?",
    "Where was {name} born?",
    "Where does {name} currently live?",
    "Has {name} ever moved? If so, why?",
    "What languages does {name} speak?",
    "Does {name} have a birthmark or other identifying physical trait?",
    "What is {name}'s dominant hand?",
    "What’s {name}'s favorite type of weather?",
    "What is {name}'s favorite season?",
    "Does {name} have any allergies?",
    "What time of day is {name} most active?",
    "Does {name} believe in astrology?",
    "How would {name} introduce themselves in one sentence?",
    "How tall is {name}?",
    "How much does {name} weigh?",
    "What is {name}'s body type?",
    "What is {name}'s skin tone?",
    "Does {name} have freckles, moles, or scars?",
    "What color are {name}'s eyes?",
    "Does {name} wear glasses or contacts?",
    "What is {name}'s natural hair color?",
    "Does {name} dye their hair?",
    "How does {name} usually style their hair?",
    "Does {name} have piercings or tattoos?",
    "What kind of clothing does {name} prefer to wear?",
    "Does {name} have a signature accessory or piece of clothing?",
    "What’s {name}'s favorite color?",
    "What’s {name}'s least favorite color?",
    "What’s {name}'s fashion style?",
    "What’s {name}'s favorite outfit?",
    "Does {name} prefer casual or formal wear?",
    "What’s {name}'s favorite kind of shoes?",
    "Does {name} wear makeup?",
    "How does {name} take care of their appearance?",
    "Does {name} have a preferred fragrance or cologne?",
    "What’s {name}'s voice like?",
    "How expressive is {name} with their face?",
    "How does {name} carry themselves?",
    "Does {name} have any nervous tics or habits?",
    "What’s {name}'s favorite food?",
    "What’s a food {name} dislikes?",
    "What’s {name}'s favorite drink?",
    "Does {name} prefer tea or coffee?",
    "What’s {name}'s favorite dessert?",
    "What’s {name}'s favorite fruit?",
    "What’s {name}'s favorite vegetable?",
    "Does {name} like spicy food?",
    "Does {name} cook?",
    "What’s {name}'s favorite meal of the day?",
    "What’s {name}'s comfort food?",
    "Is {name} a picky eater?",
    "Does {name} have a favorite restaurant or café?",
    "Does {name} prefer home-cooked meals or eating out?",
    "Does {name} have any dietary restrictions?",
    "Does {name} like trying new foods?",
    "What’s a food {name} wants to try?",
    "What’s {name}'s dream meal?",
    "What kind of home does {name} live in?",
    "What does {name}'s bedroom look like?",
    "Is {name} a neat or messy person?",
    "What kind of decor does {name} like?",
    "Does {name} prefer a minimalist or cluttered space?",
    "Does {name} have any plants or pets?",
    "What’s {name}'s favorite piece of furniture?",
    "Does {name} like scented candles or incense?",
    "Does {name} collect anything?",
    "What kind of books does {name} like?",
    "Does {name} keep a journal or diary?",
    "Does {name} like writing or drawing?",
    "Does {name} have a favorite movie?",
    "What’s {name}'s favorite TV show?",
    "Does {name} listen to podcasts?",
    "What kind of music does {name} like?",
    "Does {name} play any musical instruments?",
    "What’s {name}'s favorite song?",
    "What’s {name}'s favorite hobby?",
    "Is {name} good at sports?",
    "Does {name} like video games?",
    "What’s {name}'s favorite board game?",
    "Does {name} like puzzles?",
    "What’s {name}'s favorite holiday?",
    "What traditions does {name} follow?",
    "Does {name} celebrate their birthday?",
    "What’s {name}'s favorite childhood memory?",
    "What was {name}'s favorite toy as a kid?",
    "Was {name} a good student?",
    "What subject did {name} enjoy the most?",
    "What’s something {name} wants to learn?",
    "What’s {name}'s dream job?",
    "Does {name} like working alone or in a team?",
    "What motivates {name}?",
    "What’s {name}'s biggest fear?",
    "What’s {name}'s greatest strength?",
    "What’s {name}'s greatest weakness?",
    "On a scale of 1 to 10, how much does {name} love jilabi sweets?",
    "What is {name}'s favorite Indian festival or tradition?"
  ],
  369: [
    "What is your full name?",
    "Does {name} have any nicknames, and why?",
    "What is {name}'s age?",
    "What is {name}'s zodiac sign?",
    "What is {name}'s blood type?",
    "What is {name}'s gender identity?",
    "What are {name}'s pronouns?",
    "What is {name}'s sexual orientation?",
    "Where was {name} born?",
    "Where does {name} currently live?",
    "Has {name} ever moved? If so, why?",
    "What languages does {name} speak?",
    "Does {name} have a birthmark or other identifying physical trait?",
    "What is {name}'s dominant hand?",
    "What’s {name}'s favorite type of weather?",
    "What is {name}'s favorite season?",
    "Does {name} have any allergies?",
    "What time of day is {name} most active?",
    "Does {name} believe in astrology?",
    "How would {name} introduce themselves in one sentence?",
    // Appearance
    "How tall is {name}?",
    "How much does {name} weigh?",
    "What is {name}'s body type?",
    "What is {name}'s skin tone?",
    "Does {name} have freckles, moles, or scars?",
    "What color are {name}'s eyes?",
    "Does {name} wear glasses or contacts?",
    "What is {name}'s natural hair color?",
    "Does {name} dye their hair?",
    "How does {name} usually style their hair?",
    "Does {name} have piercings or tattoos?",
    "What kind of clothing does {name} prefer to wear?",
    "Does {name} have a signature accessory or piece of clothing?",
    "What’s {name}'s favorite color?",
    "What’s {name}'s least favorite color?",
    "What’s {name}'s fashion style?",
    "What’s {name}'s favorite outfit?",
    "Does {name} prefer casual or formal wear?",
    "What’s {name}'s favorite kind of shoes?",
    "Does {name} wear makeup?",
    "How does {name} take care of their appearance?",
    "Does {name} have a preferred fragrance or cologne?",
    "What’s {name}'s voice like?",
    "How expressive is {name} with their face?",
    "How does {name} carry themselves?",
    "Does {name} have any nervous tics or habits?",
    // Preferences & Daily Life
    "What’s {name}'s favorite food?",
    "What’s a food {name} dislikes?",
    "What’s {name}'s favorite drink?",
    "Does {name} prefer tea or coffee?",
    "What’s {name}'s favorite dessert?",
    "What’s {name}'s favorite fruit?",
    "What’s {name}'s favorite vegetable?",
    "Does {name} like spicy food?",
    "Does {name} cook?",
    "What’s {name}'s favorite meal of the day?",
    "What’s {name}'s comfort food?",
    "Is {name} a picky eater?",
    "Does {name} have a favorite restaurant or café?",
    "Does {name} prefer home-cooked meals or eating out?",
    "Does {name} have any dietary restrictions?",
    "Does {name} like trying new foods?",
    "What’s a food {name} wants to try?",
    "What’s {name}'s dream meal?",
    "What kind of home does {name} live in?",
    "What does {name}'s bedroom look like?",
    "Is {name} a neat or messy person?",
    "What kind of decor does {name} like?",
    "Does {name} prefer a minimalist or cluttered space?",
    "Does {name} have any plants or pets?",
    "What’s {name}'s favorite piece of furniture?",
    "Does {name} like scented candles or incense?",
    "Does {name} collect anything?",
    "What kind of books does {name} like?",
    "Does {name} keep a journal or diary?",
    "Does {name} like writing or drawing?",
    "Does {name} have a favorite movie?",
    "What’s {name}'s favorite TV show?",
    "Does {name} listen to podcasts?",
    "What kind of music does {name} like?",
    "Does {name} play any musical instruments?",
    "What’s {name}'s favorite song?",
    "What’s {name}'s favorite hobby?",
    "Is {name} good at sports?",
    "Does {name} like video games?",
    "What’s {name}'s favorite board game?",
    "Does {name} like puzzles?",
    "What’s {name}'s favorite holiday?",
    "What traditions does {name} follow?",
    "Does {name} celebrate their birthday?",
    "What’s {name}'s favorite childhood memory?",
    "What was {name}'s favorite toy as a kid?",
    "Was {name} a good student?",
    "What subject did {name} enjoy the most?",
    "What’s something {name} wants to learn?",
    "What’s {name}'s dream job?",
    "Does {name} like working alone or in a team?",
    "What motivates {name}?",
    "What’s {name}'s biggest fear?",
    "What’s {name}'s greatest strength?",
    "What’s {name}'s greatest weakness?",
    "On a scale of 1 to 10, how much does {name} love jilabi sweets?",
    "What is {name}'s favorite Indian festival or tradition?",
    "Which aspect of Indian heritage does {name} connect with the most?"
  ]
};

export default function QuestionnairePage() {
  const router = useRouter();
  const params = useParams();
  const questionnaireId = params.id;
  const { user, isAuthLoading, handleLogin, handleSignup, logout, authError, setAuthError, refetchUser } = useAuth();
  const isLoggedIn = !!user;

  // Page State
  const [isLoadingPage, setIsLoadingPage] = useState(true);
  const [isViewMode, setIsViewMode] = useState(false);
  const [animationStage, setAnimationStage] = useState(0);

  // Questionnaire state
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [answers, setAnswers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [selectedSet, setSelectedSet] = useState(null);
  const [characterName, setCharacterName] = useState("");
  const [error, setError] = useState("");
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [typedPrompt, setTypedPrompt] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showPrompt, setShowPrompt] = useState(true);

  // UI State
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sidebarWidth, setSidebarWidth] = useState(300);
  const [leftSidebarWidth, setLeftSidebarWidth] = useState(300);
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);

  // Refs
  const sidebarRef = useRef(null);
  const leftSidebarRef = useRef(null);
  const typingIntervalRef = useRef(null);
  const isResizing = useRef(false);
  const isLeftResizing = useRef(false);

  // Data
  const [characters, setCharacters] = useState([]);
  const [socket, setSocket] = useState(null);

  // Animation
  useEffect(() => {
    const timer1 = setTimeout(() => setAnimationStage(1), 500);
    const timer2 = setTimeout(() => setAnimationStage(2), 1500);
    return () => { clearTimeout(timer1); clearTimeout(timer2); };
  }, []);

  // --- DATA FETCHING & MODE-SETTING EFFECT ---
  useEffect(() => {
    if (isAuthLoading || !questionnaireId) return;

    if (!user) {
      toast.error("You must be logged in to view this page.");
      router.push('/qsnair/dashboard');
      return;
    }

    const fetchSessionData = async () => {
      setIsLoadingPage(true);
      try {
        const response = await axiosInstance.get(`/api/questionnaires/${questionnaireId}`);
        const { questionnaire, character, answers: savedAnswers } = response.data;

        if (!questionnaire) throw new Error("Questionnaire session not found.");

        setSelectedSet(questionnaire.questionSetType);
        setAnswers(savedAnswers || []);
        if (savedAnswers && savedAnswers.length > 0) {
          setCharacterName(savedAnswers[0]);
        }


        if (character) {
          // --- VIEW MODE ---
          setIsViewMode(true);
          setImageUrl(character.imageUrl);
          setPrompt(character.prompt);
          setCharacterName(character.name);
          setQuestionIndex(null); // Don't show questions
        } else {
          // --- CREATE MODE ---
          setIsViewMode(false);
          setQuestionIndex(savedAnswers ? savedAnswers.length : 0);
        }
      } catch (err) {
        toast.error(err.response?.data?.error || "Could not load this session.");
        router.push('/qsnair/dashboard');
      } finally {
        setIsLoadingPage(false);
      }
    };
    fetchSessionData();
  }, [questionnaireId, user, isAuthLoading, router]);

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

  // --- SIDEBAR DATA ---
  useEffect(() => {
    if (user) {
      loadUserCharacters();
    } else {
      setCharacters([]);
    }
  }, [user]);

  useEffect(() => {
    if (!socket || !user) return;
    const handleUpdate = () => loadUserCharacters();
    socket.on('character:created', handleUpdate);
    socket.on('character:deleted', handleUpdate);
    return () => {
      socket.off('character:created', handleUpdate);
      socket.off('character:deleted', handleUpdate);
    };
  }, [socket, user]);

  const loadUserCharacters = async () => {
    try {
      const response = await axiosInstance.get('/api/characters');
      setCharacters(response.data.map(char => ({
        id: char._id,
        name: char.name,
        image: char.imageUrl || "/placeholder-character.jpg",
        questionnaireId: char.questionnaireId
      })));
    } catch (error) {
      console.error('Error loading characters:', error);
    }
  };

  const deleteCharacter = async (characterId) => {
    if (!window.confirm("Are you sure? This cannot be undone.")) return;
    try {
      await axiosInstance.delete(`/api/characters/${characterId}`);
      toast.success("Character deleted!");
      setCharacters(prev => prev.filter(c => c.id !== characterId));
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to delete character.");
    }
  };


  // --- CORE LOGIC ---
  const submitAnswer = async () => {
    if (!answer.trim()) { setError("Please enter an answer"); return; }

    const newAnswers = [...answers];
    newAnswers[questionIndex] = answer;
    setAnswers(newAnswers);

    if (questionIndex === 0) setCharacterName(answer);

    setAnswer("");
    setError("");

    if (questionIndex + 1 < QUESTION_SETS[selectedSet]?.length) {
      setQuestionIndex(questionIndex + 1);
    } else {
      setIsLoading(true);
      setQuestionIndex(null);

      setTimeout(async () => {
        try {
          const promptResponse = await axiosInstance.post('/api/ai/generate-prompt', { answers: newAnswers });
          const newPrompt = promptResponse.data.prompt;
          setPrompt(newPrompt);
          await generateImage(newPrompt);
        } catch (err) {
          const errMsg = err.response?.data?.error || "Failed to process answers";
          setError(errMsg); toast.error(errMsg);
          setIsLoading(false);
        }
      }, 500);
    }

    try {
      await axiosInstance.put(`/api/questionnaires/${questionnaireId}`, { answers: newAnswers });
    } catch (err) {
      console.error("Failed to save answer:", err);
      toast.error("Failed to save progress.", { autoClose: 2000 });
    }
  };

  const generateImage = async (promptToUse) => {
    if (!promptToUse) return;
    setIsGeneratingImage(true);
    try {
      const imageGenerationPrompt = `photorealistic, 8k, sharp focus, hyper-realistic full body portrait of a character from head to toe, who is in front looking at the camera. There are objects behind them, and a detailed background. ${promptToUse}`;
      const imageResponse = await axiosInstance.post('/api/ai/generate-image', { prompt: imageGenerationPrompt });
      setImageUrl(imageResponse.data.imageUrl);
      await handleSaveCharacter(imageResponse.data.imageUrl, promptToUse);
    } catch (err) {
      const errMsg = err.response?.data?.error || "Failed to generate image";
      setError(errMsg); toast.error(errMsg);
    } finally {
      setIsGeneratingImage(false);
      setIsLoading(false);
    }
  };

  const handleSaveCharacter = async (imageUrlToSave, promptToSave) => {
    if (!characterName || !imageUrlToSave || !promptToSave) {
      toast.error("Character data is not complete yet.");
      return;
    };
    setIsLoading(true);
    try {
      await axiosInstance.put(`/api/questionnaires/${questionnaireId}/character`, {
        name: characterName,
        imageUrl: imageUrlToSave,
        prompt: promptToSave,
      });
      toast.success(`Character "${characterName}" has been saved!`);
      setIsViewMode(true);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save character.');
    } finally {
      setIsLoading(false);
    }
  };

  // --- UI & ANIMATION ---
  const startTypingAnimation = useCallback(() => {
    setIsTyping(true); let i = 0; setTypedPrompt("");
    if (typingIntervalRef.current) clearInterval(typingIntervalRef.current);
    typingIntervalRef.current = setInterval(() => {
      if (i < prompt.length) {
        setTypedPrompt(prev => prev + prompt.charAt(i)); i++;
      } else {
        clearInterval(typingIntervalRef.current); setIsTyping(false);
      }
    }, 20);
  }, [prompt]);

  useEffect(() => {
    if (prompt && !isTyping) startTypingAnimation();
  }, [prompt, isTyping, startTypingAnimation]);

  const getCurrentQuestion = useCallback(() => {
    if (questionIndex === null || !selectedSet) return "Choose a question set to start.";
    let currentQuestion = QUESTION_SETS[selectedSet]?.[questionIndex] || "";
    const nameAnswer = answers[0];
    if (nameAnswer) currentQuestion = currentQuestion.replace(/{name}/g, nameAnswer);
    return currentQuestion;
  }, [questionIndex, selectedSet, answers]);

  const handleMouseDown = (e) => {
    if (e.target.id === 'left-resizer') isLeftResizing.current = true;
    else isResizing.current = true;
  };

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

  // --- AUTH LOGIC ---
  const handleAuthSuccess = async () => {
    await refetchUser();
    setShowLogin(false);
    setShowSignup(false);
    setLeftSidebarOpen(false);
  };

  const onLogout = async () => {
    await logout();
    toast.success("You have been logged out.");
    router.push('/qsnair');
  };

  // --- RENDER ---
  if (isLoadingPage || !selectedSet) {
    return <div className="flex justify-center items-center h-screen bg-gray-100 dark:bg-gray-900 text-black dark:text-white">Loading Session...</div>;
  }

  const renderAuthForms = () => (
    <div className="z-50 relative w-full">
      {showLogin && <LoginForm onSubmit={handleLogin} onAuthSuccess={handleAuthSuccess} error={authError} onShowSignup={() => { setShowSignup(true); setShowLogin(false); setAuthError(null); }} />}
      {showSignup && <SignupForm onSubmit={handleSignup} onAuthSuccess={() => { toast.info("Registration successful! Please verify your email."); handleAuthSuccess(); }} error={authError} onShowLogin={() => { setShowLogin(true); setShowSignup(false); setAuthError(null); }} />}
    </div>
  );

  const renderCharacterCreation = () => (
    <div className="w-full">
      {!isViewMode && !imageUrl && (<h2 className="text-center bg-white text-2xl text-red-500 font-bold mb-6 p-2">{selectedSet} Questions for Character Design</h2>)}
      {questionIndex !== null && !isViewMode ? (
        <div className="w-full max-w-3xl mx-auto">
          <div className="relative w-3/4 mx-auto flex flex-col items-center pt-7 pb-10 pl-10 pr-10 bg-white dark:bg-gray-800 rounded-xl border-4 border-black mt-4">
            <div className="absolute w-3 h-3 bg-black rounded-full top-4 left-4"></div><div className="absolute w-3 h-3 bg-black rounded-full top-4 right-4"></div><div className="absolute w-3 h-3 bg-black rounded-full bottom-4 left-4"></div><div className="absolute w-3 h-3 bg-black rounded-full bottom-4 right-4"></div>
            <h2 className="text-xl font-bold mb-4">{getCurrentQuestion()}</h2>
            <input type="text" value={answer} onChange={(e) => setAnswer(e.target.value)} onKeyDown={(e) => e.key === "Enter" && submitAnswer()} className="w-full p-4 border-2 rounded-lg mb-4" autoFocus />
            {error && <div className="text-red-500 text-sm mb-4">{error}</div>}
            <div className="flex justify-center gap-4 w-full">
              {questionIndex > 0 && (<button onClick={() => { setQuestionIndex(questionIndex - 1); setAnswer(answers[questionIndex - 1] || ""); }} className="typewriter mb-4" style={{ fontSize: "22px", height: "60px", "--button-bg-light": "#ff0000" }}>Previous</button>)}
              <button onClick={submitAnswer} className="typewriter mb-4" style={{ fontSize: "22px", height: "60px", "--button-bg-light": "#ff0000" }} disabled={isLoading}>{isLoading ? 'Processing...' : 'Submit'}</button>
              {questionIndex < QUESTION_SETS[selectedSet].length - 1 && (<button onClick={() => { setQuestionIndex(questionIndex + 1) }} className="typewriter mb-4" style={{ fontSize: "22px", height: "60px", "--button-bg-light": "#ff0000" }}>Skip</button>)}
            </div>
          </div>
        </div>
      ) : (
        <div className="w-full">
          {imageUrl && (
            <div className="flex flex-col items-center justify-center w-full mt-4">
              <div className="relative w-3/4 mx-auto flex flex-col items-center pt-7 pb-15 bg-white dark:bg-gray-800 rounded-xl border-4 border-black">
                <div className="absolute w-3 h-3 bg-black rounded-full top-4 left-4"></div><div className="absolute w-3 h-3 bg-black rounded-full top-4 right-4"></div><div className="absolute w-3 h-3 bg-black rounded-full bottom-4 left-4"></div><div className="absolute w-3 h-3 bg-black rounded-full bottom-4 right-4"></div>
                <Image src={imageUrl} alt={characterName || "Generated Character"} width={384} height={384} className="rounded-lg shadow-md w-96 h-96 object-cover mb-6" />
                {isViewMode ? (
                  <button onClick={() => router.push('/qsnair/dashboard')} className="typewriter mb-4" style={{ fontSize: "22px", height: "60px" }}>Dashboard</button>
                ) : (
                  <button onClick={() => handleSaveCharacter(imageUrl, prompt)} className="typewriter mb-4" style={{ fontSize: "22px", height: "60px" }} disabled={isLoading}>{isLoading ? 'Saving...' : 'Save This Character'}</button>
                )}
                <h2 className="text-3xl font-bold text-center mb-4">Meet <span className="text-red-500">{characterName || "Your Character"}</span></h2>
                {error && <div className="text-red-500 text-sm mb-4">{error}</div>}
              </div>
            </div>
          )}
          {(isLoading || prompt) && (
            <div className="relative w-3/4 mx-auto flex flex-col items-center pt-7 pb-15 bg-red-600 dark:bg-gray-800 rounded-xl border-4 border-black mt-4">
              <div className="absolute w-3 h-3 bg-black rounded-full top-4 left-4"></div><div className="absolute w-3 h-3 bg-black rounded-full top-4 right-4"></div><div className="absolute w-3 h-3 bg-black rounded-full bottom-4 left-4"></div><div className="absolute w-3 h-3 bg-black rounded-full bottom-4 right-4"></div>
              <div className="flex justify-between items-center w-full px-4 cursor-pointer" onClick={() => setShowPrompt(!showPrompt)}>
                <h3 className="text-xl p-4 text-center font-bold">{isGeneratingImage ? "Generating your character image..." : "Character Overview"}</h3>
                <span className="text-white text-xl">{showPrompt ? '▲' : '▼'}</span>
              </div>
              {showPrompt && (
                <div className="bg-white p-4 rounded border border-gray-300 min-h-32 w-full">
                  {typedPrompt ? (<p className="whitespace-pre-wrap">{typedPrompt}{isTyping && <span className="animate-pulse">|</span>}</p>) : (<p>{isGeneratingImage ? "Generating image..." : "Generating character description..."}</p>)}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );

  return (
    <main className="relative w-full min-h-screen bg-gray-100 dark:bg-gray-900" onMouseMove={handleMouseMove} onMouseUp={handleMouseUp}>
      <RouteLoadingBar />
      <Lypcursor />
      <Background />

      <div
        className={`relative flex items-center justify-center transition-all duration-1000 ease-in-out ${animationStage >= 2 ? "mt-6 mx-auto" : "my-auto mx-auto"
          }`}
        style={{
          width:
            animationStage >= 1
              ? `calc(90vw - ${sidebarOpen ? sidebarWidth : 0}px - ${leftSidebarOpen ? leftSidebarWidth : 0}px)`
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
      <button id="left-resizer" onClick={() => setLeftSidebarOpen(!leftSidebarOpen)} onMouseDown={handleMouseDown} style={{ right: leftSidebarOpen ? leftSidebarWidth : 0 }} className={`fixed top-1/2 transform -translate-y-1/2 bg-black font-bold text-white px-3 py-20 rounded-l-lg transition-all duration-200 ease-in-out z-30 hover:bg-gray-800`}>{leftSidebarOpen ? "▶" : "◀"}</button>

      {/* Left Sidebar (Question List) */}
      {!isViewMode && (
        <>
          <div ref={sidebarRef} style={{ width: sidebarOpen ? sidebarWidth : 0 }} className={`bg-gray-100 dark:bg-gray-800 p-4 transition-all duration-500 ease-in-out h-full overflow-y-auto fixed left-0 top-0 z-20 ${sidebarOpen ? "block" : "hidden"}`}>
            <div className="w-full text-sm">
              <input type="text" placeholder="Search questions..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full p-2 border rounded mb-3" />
              <ul>{QUESTION_SETS[selectedSet]?.map((q, index) => ({ q: q.replace(/{name}/g, answers[0] || "{name}"), index, })).filter(({ q }) => q.toLowerCase().includes(searchQuery.toLowerCase())).map(({ q, index }) => (<li key={index} className={`p-2 cursor-pointer border-b ${index === questionIndex ? "bg-gray-300 font-bold" : "hover:bg-gray-200"}`} onClick={() => { setQuestionIndex(index); setAnswer(answers[index] || ""); }}>{q} {answers[index] && (<span className="text-red-500 ml-2">{answers[index]}</span>)}</li>))}</ul>
            </div>
          </div>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} onMouseDown={handleMouseDown} style={{ left: sidebarOpen ? sidebarWidth : 0 }} className="fixed top-1/2 transform -translate-y-1/2 bg-black font-bold text-white px-3 py-20 rounded-r-lg transition-all duration-200 ease-in-out z-30 hover:bg-gray-800">{sidebarOpen ? "◀" : "▶"}</button>
        </>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col items-center p-6 transition-all duration-500 ease-in-out" style={{ marginLeft: sidebarOpen && !isViewMode ? sidebarWidth : 0, marginRight: leftSidebarOpen ? leftSidebarWidth : 0, minHeight: '100vh' }}>
        <div className="pt-12 w-full">
          {renderCharacterCreation()}
        </div>
      </div>
    </main>
  );
}