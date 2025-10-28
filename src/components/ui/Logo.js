// components/ui/Logo.js
"use client";
import styles from "./Logo.module.css";

export default function Logo({ style }) {
  return (
    <div className="logo-container" style={style}>
      <div className={styles.logo}>
        <div className="grid">
          {/* Dots */}
          {[...Array(3)].map((_, row) =>
            [...Array(13)].map((_, col) => (
              <div key={`${row}-${col}`} className="dot" style={{ gridColumn: col + 1, gridRow: row + 1 }}></div>
            ))
          )}
          {/* Lines for logo */}
          <div className="line line-2-1"></div>
          <div className="line line-2-2"></div>
          <div className="line line-2-3"></div>
          <div className="line line-2-4"></div>
          <div className="line line-2-5"></div>
          <div className="line line-l-1"></div>
          <div className="line line-l-2"></div>
          <div className="line line-y-1"></div>
          <div className="line line-y-2"></div>
          <div className="line line-y-3"></div>
          <div className="line line-y-4"></div>
          <div className="line line-p-1"></div>
          <div className="line line-p-2"></div>
          <div className="line line-p-3"></div>
          <div className="line line-p-4"></div>
        </div>
      </div>
    </div>
  );
}
