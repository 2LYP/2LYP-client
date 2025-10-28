//components/ui/Lypcursor.js

"use client";
import { useEffect, useState, useCallback } from "react";

export default function Lypcursor() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [colors, setColors] = useState(["#00aeef", "#1ba754", "#FFFF00", "#FF0000"]);
  const [isRotating, setIsRotating] = useState(false);

  const moveCursor = useCallback((e) => {
    setPosition({ x: e.clientX, y: e.clientY });
  }, []);

  useEffect(() => {
    document.addEventListener("mousemove", moveCursor);
    return () => document.removeEventListener("mousemove", moveCursor);
  }, [moveCursor]);

  useEffect(() => {
    let interval;
    let timeout;
    
    if (isRotating) {
      interval = setInterval(() => {
        setColors((prevColors) => [prevColors[3], prevColors[0], prevColors[1], prevColors[2]]);
      }, 100);
      
      // Automatically stop rotation after 4 seconds
      timeout = setTimeout(() => {
        setIsRotating(false);
        clearInterval(interval);
      }, 4000);
    }
    
    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [isRotating]);

  const handleClick = useCallback((e) => {
    if (e.target.closest("button, a")) {
      setIsRotating(prev => !prev);
    }
  }, []);

  useEffect(() => {
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [handleClick]);

  return (
    <div
      className="lyp-cursor"
      style={{
        position: 'fixed',
        pointerEvents: 'none',
        zIndex: 9999,
        transform: 'translate(-50%, -50%) rotate(340deg)',
        top: position.y,
        left: position.x,
        transition: 'transform 0.1s ease',
        "--border-top-color": colors[0],
        "--border-right-color": colors[1],
        "--border-bottom-color": colors[2],
        "--border-left-color": colors[3],
      }}
    >
      <div className="diamond">
        <div className="inner-diamond"></div>
      </div>
      <div className="stem"></div>
    </div>
  );
}