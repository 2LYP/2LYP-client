//component/ui/Background.js
"use client";
import { useEffect, useRef } from "react";
import { useTheme } from '@/contexts/ThemeContext';

export default function Background() {
  const canvasRef = useRef(null);
  const { isDarkMode, isManualOverride } = useTheme();

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      generateDots();
    };

    let dots = [];
    const spacing = 20;
    const maxSize = 3;
    const minSize = 1;
    const waveSpeed = 0.01;
    const dissolveSpeed = 0.005;
    let cursor = { x: canvas.width / 2, y: canvas.height / 2 };

    const generateDots = () => {
      dots = [];
      for (let x = 0; x < canvas.width; x += spacing) {
        for (let y = 0; y < canvas.height; y += spacing) {
          dots.push({ x, y, size: minSize });
        }
      }
    };

    const drawGrid = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = isDarkMode ? "white" : "grey";

      dots.forEach(dot => {
        const dist = Math.hypot(dot.x - cursor.x, dot.y - cursor.y);
        const wave = Math.sin(dist * 0.05 - performance.now() * waveSpeed) * 0.5 + 0.5;
        const dissolve = Math.exp(-dist * dissolveSpeed);
        dot.size = minSize + wave * (maxSize - minSize) * dissolve;

        if (dot.size > minSize) {
          ctx.beginPath();
          ctx.arc(dot.x, dot.y, dot.size, 0, Math.PI * 2);
          ctx.fill();
        }
      });
    };

    const animate = () => {
      drawGrid();
      requestAnimationFrame(animate);
    };

    window.addEventListener("mousemove", e => {
      cursor.x = e.clientX;
      cursor.y = e.clientY;
    });

    window.addEventListener("resize", resizeCanvas);

    resizeCanvas();
    animate();

    return () => {
      window.removeEventListener("mousemove", () => {});
      window.removeEventListener("resize", resizeCanvas);
    };
  }, [isDarkMode]);

  return (
    <div className={`fixed inset-0 transition-colors duration-500 ${isDarkMode ? "bg-black" : "bg-white"}`}>
      <canvas ref={canvasRef} className="w-full h-full" />
      {/* Theme Toggle Button */}
      <div className="absolute bottom-85 left-5 flex justify-center">
        <button
          type="button"
          className="typewriter rounded-full w-30 h-30 p-0 relative"
          onClick={() => {
            // Toggle theme using the context
            const event = new CustomEvent('toggleTheme');
            window.dispatchEvent(event);
          }}
          title={`Switch to ${isDarkMode ? 'light' : 'dark'} mode${isManualOverride ? ' (Manual)' : ' (System)'}`}
        >
          {/* Diamond logo container */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative w-8 h-8">
              <div className="absolute w-full h-full top-[-70%] border-[3px]"
                style={{
                  borderColor: isDarkMode ? 'white' : 'black',
                  transform: 'rotate(45deg)'
                }}>
                <div 
                  className="absolute w-[80%] h-[80%] border-[3px] top-1/2 left-1/2"
                  style={{
                    transform: 'translate(-50%, -50%) rotate(270deg)',
                    borderTopColor: isDarkMode ? '#FF5555' : '#FF0000',
                    borderRightColor: isDarkMode ? '#55AAFF' : '#00aeef',
                    borderBottomColor: isDarkMode ? '#55FF55' : '#1ba754',
                    borderLeftColor: isDarkMode ? '#FFFF55' : '#FFFF00'
                  }}
                ></div>
              </div>
              <div 
                className="absolute bg-current h-[90px] w-[2px] top-[-80%] left-1/2 transform -translate-x-1/2"
                style={{
                  color: isDarkMode ? 'white' : 'black'
                }}
              ></div>
            </div>
          </div>
          
          {/* Outer ring (using pseudo-element) */}
          <style jsx>{`
            button.typewriter.rounded-full::before {
              content: "";
              position: absolute;
              inset: -6px;
              border: 2px solid ${isDarkMode ? 'white' : 'black'};
              border-radius: 50%;
              pointer-events: none;
            }
          `}</style>
        </button>
      </div>
    </div>
  );
}