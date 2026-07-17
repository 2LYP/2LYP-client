"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { axiosInstance } from '@/utils/api';
import Image from 'next/image';
import { io as socketIOClient } from "socket.io-client";
import { toast } from 'react-toastify';

// Component Imports for Authentication
import LoginForm from '@/components/LoginForm'; 
import SignupForm from '@/components/SignupForm';

// ===================================================================
// 1. Dashboard component for logged-in users.
// ===================================================================
function QsnairDashboard() {
  const [characters, setCharacters] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user, logout, isAuthLoading } = useAuth();
  const router = useRouter();
  const [socket, setSocket] = useState(null);

  // Effect to load characters
  useEffect(() => {
    if (!isAuthLoading && user) {
      const loadCharacters = async () => {
        setIsLoading(true);
        try {
          const response = await axiosInstance.get('/api/characters');
          setCharacters(response.data);
        } catch (error) {
          console.error('Error loading characters:', error);
          setCharacters([]);
        } finally {
          setIsLoading(false);
        }
      };
      loadCharacters();
    } else if (!isAuthLoading && !user) {
      setCharacters([]);
      setIsLoading(false);
    }
  }, [user, isAuthLoading]);

  // Effect for socket connection
  useEffect(() => {
    const s = socketIOClient(process.env.NEXT_PUBLIC_API_URL, {
      withCredentials: true,
      transports: ["websocket"],
    });
    setSocket(s);
    return () => s.disconnect();
  }, []);

  // Effect for real-time updates
  useEffect(() => {
    if (!socket || !user) return;

    const handleCreated = (data) => {
      if (data.userId === user._id || data.userId === user.id) {
        setCharacters(prev => [data.character, ...prev]);
      }
    };
    const handleDeleted = (data) => {
      if (data.userId === user._id || data.userId === user.id) {
        setCharacters(prev => prev.filter(char => char._id !== data.characterId));
      }
    };

    socket.on('character:created', handleCreated);
    socket.on('character:deleted', handleDeleted);

    return () => {
      socket.off('character:created', handleCreated);
      socket.off('character:deleted', handleDeleted);
    };
  }, [socket, user]);

  const handleLogout = async () => {
    await logout();
  };

  const handleDelete = async (characterId) => {
    if (!window.confirm("Are you sure you want to delete this character?")) return;
    try {
      await axiosInstance.delete(`/api/characters/${characterId}`);
      toast.success("Character deleted.");
      setCharacters(prev => prev.filter(char => char._id !== characterId));
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to delete character.');
    }
  };

  if (isAuthLoading || isLoading) {
    return <div className="flex justify-center items-center h-64">Loading Dashboard...</div>;
  }

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Welcome, {user?.name}</h1>
        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-600 text-white font-bold px-4 py-2 rounded transition-colors"
        >
          Logout
        </button>
      </div>

      {characters.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {characters.map(character => (
            <div key={character._id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <Image
                src={character.imageUrl || "/placeholder-character.jpg"}
                alt={character.name}
                width={400}
                height={400}
                className="w-full h-64 object-cover"
                onError={(e) => { e.target.onerror = null; e.target.src = "/placeholder-character.jpg"; }}
              />
              <div className="p-4">
                <h2 className="text-xl font-bold mb-2">{character.name}</h2>
                <p className="text-gray-600 mb-4">
                  Created: {new Date(character.createdAt).toLocaleDateString()}
                </p>
                <div className="flex justify-between">
                  {/* --- FIX: Added onClick handler to the View button --- */}
                  <button
                    onClick={() => {
                      if (character.questionnaireId) {
                        router.push(`/qsnair/${character.questionnaireId}`);
                      } else {
                        toast.info("No creation session found for this character.");
                      }
                    }}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded"
                  >
                    View Details
                  </button>
                  <button
                    className="bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded text-red-600"
                    onClick={() => handleDelete(character._id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-xl text-gray-500">You haven&apos;t created any characters yet.</p>
          <button
            onClick={() => router.push('/qsnair')}
            className="mt-4 bg-green-500 hover:bg-green-600 text-white font-bold px-6 py-2 rounded"
          >
            Create Your First Character
          </button>
        </div>
      )}
    </div>
  );
}


// ===================================================================
// 2. The main Page Component that handles the auth logic.
// ===================================================================
export default function QsnairDashboardPage() {
  const { user, refetchUser, handleLogin, handleSignup, authError, setAuthError, isAuthLoading } = useAuth();
  const isLoggedIn = !!user;
  
  const [showLogin, setShowLogin] = useState(true);

  const handleAuthSuccess = async () => {
    await refetchUser();
  };

  if (isAuthLoading) {
    return <div className="flex justify-center items-center h-screen">Loading Application...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-5xl mx-auto">
        {isLoggedIn ? (
          <QsnairDashboard />
        ) : (
          <div className="bg-white rounded-lg shadow-xl p-8 max-w-md mx-auto">
            <h1 className="text-3xl font-bold text-center mb-2 text-gray-800">Qsnair Login</h1>
            <p className="text-center text-gray-500 mb-6">Please sign in to continue</p>
            {showLogin ? (
              <LoginForm
                onSubmit={handleLogin}
                error={authError}
                onAuthSuccess={handleAuthSuccess}
                onShowSignup={() => {
                  setShowLogin(false);
                  setAuthError(null);
                }}
              />
            ) : (
              <SignupForm
                onSubmit={handleSignup}
                error={authError}
                onAuthSuccess={handleAuthSuccess}
                onShowLogin={() => {
                  setShowLogin(true);
                  setAuthError(null);
                }}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

