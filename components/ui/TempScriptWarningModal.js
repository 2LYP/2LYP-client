import React from "react";
import Button from "../ui/Button";
import Lypcursor from "@/components/ui/Lypcursor";


export default function TempScriptWarningModal({ open, onClose, onLogin, onSignup }) {
  if (!open) return null;
return (
    <div
        style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(0,0,0,0.15)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
        }}
    >
        <div
            style={{
                background: "#fff",
                borderRadius: 16,
                boxShadow: "0 4px 32px rgba(0,0,0,0.18)",
                padding: "2.5rem 2.5rem 2rem 2.5rem",
                maxWidth: 420,
                width: "90vw",
                textAlign: "center",
                position: "relative",
            }}
        >
            <button
                onClick={onClose}
                style={{
                    position: "absolute",
                    top: 12,
                    right: 12,
                    background: "none",
                    border: "none",
                    fontSize: 24,
                    cursor: "pointer",
                    color: "#888",
                }}
                aria-label="Close"
            >
                ×
            </button>
            <div style={{ fontWeight: 700, fontSize: 22, marginBottom: 12 }}>
                Temporary Script
            </div>
            <div style={{ fontSize: 16, marginBottom: 24, color: "#222" }}>
                You are editing a temporary script. Chances of{" "}
                <span style={{ fontWeight: 700 }}>losing it</span>
                {" "}to the abyss are{" "}
                <span style={{ color: "#FF0000", fontWeight: 700 }}>high</span>.
                {" "}To save your work and access it later, please
            </div>
            <div style={{ display: "flex", flexDirection: "row", gap: 12, justifyContent: "center", alignItems: "center", marginBottom: 8 }}>
                <Button
                    onClick={onLogin}
                    className="typewriter"
                    style={{
                        fontSize: 18,
                        padding: "8px 18px",
                        backgroundColor: "#FFFF00",
                        color: "#222",
                        minWidth: 90,
                    }}
                >
                    Login
                </Button>
                <Button
                    onClick={onSignup}
                    className="typewriter"
                    style={{
                        fontSize: 18,
                        padding: "8px 18px",
                        backgroundColor: "#FFFF00",
                        color: "#222",
                        minWidth: 90,
                    }}
                >
                    Sign Up
                </Button>
            </div>
        </div>
        <Lypcursor />
    </div>
);
}
