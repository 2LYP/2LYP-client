import React, { useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import styles from "@/styles/scriptr.module.css";

// Dynamic imports for heavy components
const CoverForm = dynamic(() => import("./CoverForm"), { ssr: false });
const ScreenElementBlock = dynamic(() => import("./ScreenElementBlock"), { ssr: false });

const availableOptions = ["INT", "EXT", "INT/EXT", "EXT/INT"];
const availableOptions2 = [
  "DAY", "NIGHT", "DAWN", "SUNRISE", "MORNING", "AFTERNOON", "NOON", "DUSK", "SUNSET", "EVENING", "TWILIGHT", "MIDNIGHT",
  "THIS MOMENT", "THAT MOMENT", "MOMENTS LATER", "LATER", "CONTINUOUS", "SAME TIME", "IMMEDIATELY AFTER", "THE NEXT DAY",
  "LATER THAT DAY", "SAME DAY", "LATE NIGHT", "SAME NIGHT", "SAME MORNING", "LATE AFTERNOON", "SAME AFTERNOON", "HIGH NOON",
  "SAME EVENING", "LATER THAT EVENING", "LATE EVENING", "LATER THAT NIGHT"
];
const uniqueOptions = Array.from(new Set(availableOptions2));
const availableOptions3 = [
  "CUT TO", "FADE IN", "FADE OUT", "FADE TO", "DISSOLVE TO", "BACK TO", "MATCH CUT TO", "JUMP CUT TO", "SMASH TO", "FADE TO BLACK"
];
const parentheticalOptions = ["V.O.", "O.S.", "O.C."];

export default function ScriptPages({
  screenplayElements = [],
  setScreenplayElements,
  printMode,
  formData = {},
  scriptId,
  user,
  sceneNumberStart = 1, // <-- add this prop
  startIndex = 0, // <-- add this prop for pagination support
  removeBlock,
  isBlockEmpty,
  handleUndo,
  handleRedo,
  setActiveElement,
}) {
  // Compute consecutive scene numbers for rendering
  let sceneNumber = sceneNumberStart;

  // Generic handler for all input/textarea changes
  const handleElementChange = (idx, field, value) => {
    if (setScreenplayElements) {
      setScreenplayElements((prev) => {
        const updated = [...prev];
        // Map local index to global index for pagination support
        const globalIndex = startIndex + idx;
        updated[globalIndex] = { ...updated[globalIndex], [field]: value };
        return updated;
      });
    }
  };

  // For auto-grow and width adjustment
  const auto_grow = (el) => {
    if (!el) return;
    el.style.height = "5px";
    el.style.height = el.scrollHeight + "px";
  };
  const adjustWidth = (el) => {
    if (!el) return;
    const minWidth = 20;
    const padding = 8;
    const span = document.createElement("span");
    span.style.visibility = "hidden";
    span.style.whiteSpace = "pre";
    span.textContent = el.value || el.placeholder || "";
    document.body.appendChild(span);
    let width = span.offsetWidth + padding;
    width = Math.max(width, minWidth);
    el.style.width = `${width}px`;
    document.body.removeChild(span);
  };

  // Keyboard event handler for block removal
  const handleKeyDown = (e, elementIndex) => {
    // Check if the block is empty and user pressed Delete or Backspace
    if ((e.key === 'Delete' || e.key === 'Backspace') && removeBlock && isBlockEmpty) {
      const element = screenplayElements[elementIndex];
      if (element && isBlockEmpty(element)) {
        e.preventDefault();
        removeBlock(startIndex + elementIndex);
      }
    }
  };



  // Note: Auto-save is handled by the parent component to avoid conflicts in paginated mode

// --- end auto-save ---

  return (
    <div className={`${styles['a4-box']} ${printMode ? 'print-a4' : ''}`}>
      <div className={styles.formContainer1}>
        <form>
          {screenplayElements.map((element, idx) => {
            let numberToShow = undefined;
            if (element.type === "sceneheading") {
              numberToShow = sceneNumber++;
            }
            return (
              <div key={idx} className={element.type} align="left" onFocus={() => setActiveElement(startIndex + idx)}>
                {element.type === "sceneheading" && (
                  <div align="left">
                    <input
                      type="cunt"
                      value={numberToShow}
                      readOnly
                      className={styles.cuntInput}
                    />
                    .
                    <input
                      name="setting"
                      type="settext"
                      placeholder="INT/EXT??"
                      list={`setting-option-${idx}`}
                      value={element.setting}
                      onChange={e => handleElementChange(idx, "setting", e.target.value)}
                      onKeyDown={e => handleKeyDown(e, idx)}
                      onInput={e => adjustWidth(e.target)}
                      className={styles.settextInput}
                      autoComplete="on"
                      disabled={printMode}
                    />
                    <datalist id={`setting-option-${idx}`}>
                      {availableOptions.map(option => (
                        <option key={option} value={option} />
                      ))}
                    </datalist>
                    .
                    <input
                      type="loctext"
                      placeholder="Location??"
                      value={element.location}
                      onChange={e => handleElementChange(idx, "location", e.target.value)}
                      onKeyDown={e => handleKeyDown(e, idx)}
                      onInput={e => adjustWidth(e.target)}
                      className={styles.loctextInput}
                      disabled={printMode}
                    />
                    -
                    <input
                      name="time"
                      type="tym"
                      placeholder=" Time??"
                      list={`time-options-${idx}`}
                      value={element.time || ""}
                      onChange={e => handleElementChange(idx, "time", e.target.value)}
                      onKeyDown={e => handleKeyDown(e, idx)}
                      onInput={e => adjustWidth(e.target)}
                      className={styles.tymInput}
                      disabled={printMode}
                    />
                    <datalist id={`time-options-${idx}`}>
                      {uniqueOptions.map(option => (
                        <option key={option} value={option} />
                      ))}
                    </datalist>
                  </div>
                )}
                {element.type === "action" && (
                  <textarea
                    name="action"
                    placeholder="Describe the Action in Scene"
                    value={element.action || ""}
                    onChange={e => handleElementChange(idx, "action", e.target.value)}
                    onKeyDown={e => handleKeyDown(e, idx)}
                    onInput={e => auto_grow(e.target)}
                    className={styles.acttext}
                    disabled={printMode}
                  />
                )}
                {element.type === "character" && (
                  <center>
                    <input
                      type="character"
                      placeholder="Character Name"
                      value={element.character_name || ""}
                      onChange={e => handleElementChange(idx, "character_name", e.target.value)}
                      onKeyDown={e => handleKeyDown(e, idx)}
                      onInput={e => {
                        adjustWidth(e.target);
                        auto_grow(e.target);
                      }}
                      maxLength={90}
                      className={styles.characterInput}
                      disabled={printMode}
                    />
                    <br />
                  </center>
                )}
                {element.type === "parenthetical" && (
                  <center>
                    (
                    <input
                      type="parenthetical"
                      name="parenthetical"
                      placeholder="Parenthetical?"
                      value={element.parentheticalText || ""}
                      list={`parenthetical-options-${idx}`}
                      onChange={e => handleElementChange(idx, "parentheticalText", e.target.value)}
                      onKeyDown={e => handleKeyDown(e, idx)}
                      onInput={e => adjustWidth(e.target)}
                      maxLength={60}
                      className={styles.parentheticalInput}
                      disabled={printMode}
                    />
                    <datalist id={`parenthetical-options-${idx}`}>
                      {parentheticalOptions.map(option => (
                        <option key={option} value={option} />
                      ))}
                    </datalist>
                    )
                  </center>
                )}
                {element.type === "dialogue" && (
                  <textarea
                    name="dialogue"
                    type="dialogue"
                    placeholder="Dialogues here"
                    value={element.dialogue || ""}
                    onChange={e => handleElementChange(idx, "dialogue", e.target.value)}
                    onKeyDown={e => handleKeyDown(e, idx)}
                    onInput={e => auto_grow(e.target)}
                    className={styles.dialogueTextarea}
                    disabled={printMode}
                  />
                )}
                {element.type === "transition" && (
                  <p align="right">
                    <input
                      name="transis"
                      type="transis"
                      placeholder="Transition??"
                      list={`transition-options-${idx}`}
                      value={element.transition || ""}
                      onChange={e => handleElementChange(idx, "transition", e.target.value)}
                      onKeyDown={e => handleKeyDown(e, idx)}
                      onInput={e => adjustWidth(e.target)}
                      autoComplete="off"
                      className={styles.transisInput}
                      disabled={printMode}
                    />
                    <datalist id={`transition-options-${idx}`}>
                      {availableOptions3.map(option => (
                        <option key={option} value={option} />
                      ))}
                    </datalist>
                  </p>
                )}
              </div>
            );
          })}
        </form>
      </div>
      <br></br>
      <div className={styles.a4Footer}>
        drafted using S.C.R.I.P.T.R. by 2LYP Computations @{" "}
        <span style={{ fontWeight: "bold" }}>{formData.writer || "Writer"}</span>
      </div>
    </div>
  );
}
