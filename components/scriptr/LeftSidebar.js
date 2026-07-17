// components/scriptr/LeftSidebar.js
import React from "react";
import Button from "@/components/ui/Button";
import LoginForm from "@/components/LoginForm";
import SignupForm from "@/components/SignupForm";
import { useTheme } from "@/contexts/ThemeContext";

import { useState, useCallback } from "react";

// Custom hook for script editing state (reusable)
function useScriptEditing() {
  const [editingScriptId, setEditingScriptId] = useState(null);
  const [editingTitle, setEditingTitle] = useState("");
  const startEditing = useCallback((script) => {
    setEditingScriptId(script._id);
    setEditingTitle(script.title || "Untitled");
  }, []);
  const stopEditing = useCallback(() => {
    setEditingScriptId(null);
    setEditingTitle("");
  }, []);
  return { editingScriptId, setEditingScriptId, editingTitle, setEditingTitle, startEditing, stopEditing };
}

const LeftSidebar = ({
  leftSidebarRef,
  leftSidebarOpen,
  leftSidebarWidth,
  isLoggedIn,
  user,
  logout,
  router,
  showLogin,
  showSignup,
  setShowLogin,
  setShowSignup,
  renderAuthForms,
  renderDashboard,
  scripts = [],
  scriptsLoading = false,
  scriptsError = null,
  scriptId = null,
  handleScriptTitleEdit, // <-- add this prop
  handleDeleteScript, // <-- add this prop
  handleDownloadScript, // <-- add this prop
}) => {
  // Use reusable editing state hook
  const { editingScriptId, setEditingScriptId, editingTitle, setEditingTitle, startEditing, stopEditing } = useScriptEditing();
  const { isDarkMode } = useTheme();

  return (
  <div
    ref={leftSidebarRef}
    style={{ width: leftSidebarOpen ? leftSidebarWidth : 0 }}
    className={`bg-[#ffff00] dark:bg-gray-800 p-4 transition-all duration-500 ease-in-out h-full overflow-y-auto fixed right-0 top-0 flex flex-col z-20 ${leftSidebarOpen ? "block" : "hidden"}`}
  >
    <div className="w-full text-sm flex flex-col items-center justify-center h-full">
      <Button
        onClick={() => (window.location.href = "/dashboard")}
        className="typewriter mb-5 flex items-center justify-center"
        style={{ fontSize: "30px", height: "52px", paddingTop: "5px" }}
      >
        Hub
      </Button>
      {isLoggedIn ? (
        renderDashboard
          ? renderDashboard()
          : (
            <>
              <div className="text-center mb-6">
                <h2 className="text-xl font-bold">
                  Namaste, <br /> {user.userName || user.name || user.email || "User"}
                </h2>
                {user.companyName && <p className="text-sm">Company: {user.companyName}</p>}
              </div>
              <div className="mb-4">
        <div className="font-bold mb-1">Your Scripts</div>
        {scriptsLoading ? (
          <div>Loading...</div>
        ) : scriptsError ? (
          <div style={{ color: 'red' }}>{scriptsError}</div>
        ) : (
          <div
            className="max-h-40 overflow-y-auto text-xs"
            style={{ fontFamily: 'Courier New, Courier, monospace', color: '#f3f6fa' }}
          >
            <div style={{ display: 'table', width: '100%' }}>
              {(!Array.isArray(scripts) || scripts.length === 0) && (
                <div style={{ display: 'table-row' }}>
                  <div style={{ display: 'table-cell', padding: '2px 0', color: isDarkMode ? '#f3f6fa' : 'black' }}>No scripts found.</div>
                </div>
              )}
              {(Array.isArray(scripts) ? scripts : []).map((script) => (
                <div
                  key={script._id}
                  style={{ display: 'flex', alignItems: 'center', marginBottom: 2 }}
                >
                  <div
                    style={{
                      minWidth: 110,
                      maxWidth: 180,
                      fontWeight: 700,
                      color: (script._id == scriptId) ? '#4ade80' : (isDarkMode ? '#f3f6fa' : 'black'),
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      fontSize: '1.1em',
                      marginRight: 6,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      flex: '1 1 auto',
                      display: 'flex',
                      alignItems: 'center',
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
                          handleScriptTitleEdit && handleScriptTitleEdit(script._id, editingTitle);
                          stopEditing();
                        }}
                        onKeyDown={e => {
                          if (e.key === 'Enter') {
                            handleScriptTitleEdit && handleScriptTitleEdit(script._id, editingTitle);
                            stopEditing();
                          } else if (e.key === 'Escape') {
                            stopEditing();
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
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: '1 1 auto' }}>{script.title || 'Untitled Script'}</span>
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', minWidth: 80, padding: '2px 0', textAlign: 'left', gap: 2 }}>
                    <button
                      title="Edit script"
                      onClick={e => {
                        e.stopPropagation();
                        router.push(`/scriptr/${script._id}`);
                      }}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontSize: '1.2em', marginRight: 2 }}
                    >
                      <span role="img" aria-label="go-to-script">✏️</span>
                    </button>
                    <button
                      title="Delete"
                      onClick={e => {
                        e.stopPropagation();
                        handleDeleteScript && handleDeleteScript(script._id);
                      }}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontSize: '1.2em', marginRight: 2 }}
                    >
                      <span role="img" aria-label="delete">🗑️</span>
                    </button>
                    <button
                      title="Download PDF"
                      onClick={e => {
                        e.stopPropagation();
                        handleDownloadScript && handleDownloadScript(script._id);
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
            </>
          )
      ) : (
        <>
          {showLogin || showSignup ? (
            renderAuthForms()
          ) : (
            <div className="w-full text-center">
              <Button
                onClick={() => {
                  setShowLogin(true);
                  setShowSignup(false);
                }}
                className="typewriter mb-4"
                style={{ fontSize: "18px", height: "52px" }}
              >
                Login
              </Button>
              <Button
                onClick={() => {
                  setShowSignup(true);
                  setShowLogin(false);
                }}
                className="typewriter ml-3 mb-4"
                style={{ fontSize: "18px", height: "52px" }}
              >
                Sign Up
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  </div>

  );
}

export default LeftSidebar;
