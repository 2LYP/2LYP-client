// components/scriptr/FlipCard.js
import React from "react";

const FlipCard = ({ frontContent, backContent, hide }) => (
  <div
    className={`group w-full h-full perspective ${hide ? "hidden" : ""}`}
    style={{ perspective: "1200px" }}
  >
    <div
      className="relative w-full h-full transition-transform duration-700"
      style={{
        transformStyle: "preserve-3d",
      }}
    >
      {/* Front Side */}
      <div
        className="absolute inset-0 flex flex-col items-center justify-center bg-red-600 rounded-xl border-4 border-black p-6"
        style={{
          backfaceVisibility: "hidden",
          WebkitBackfaceVisibility: "hidden",
          zIndex: 2,
        }}
      >
        {frontContent}
      </div>
      {/* Back Side */}
      <div
        className="absolute inset-0 flex flex-col items-center justify-center bg-red-600 rounded-xl border-4 border-black p-6"
        style={{
          transform: "rotateY(180deg)",
          backfaceVisibility: "hidden",
          WebkitBackfaceVisibility: "hidden",
          zIndex: 1,
        }}
      >
        {backContent}
      </div>
    </div>
    <style jsx global>{`
      .perspective {
        perspective: 1200px;
      }
      .group:hover > .relative {
        transform: rotateY(180deg) !important;
      }
    `}</style>
  </div>
);

export default FlipCard;
