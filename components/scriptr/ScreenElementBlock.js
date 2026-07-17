// components/scriptr/ScreenElementBlock.js
import React from "react";

// Props: element, idx, handlers, styles, options
const ScreenElementBlock = ({
  element,
  idx,
  handleElementChange,
  handleActionInput,
  handleCharacterInput,
  handleParentheticalInput,
  auto_grow,
  adjustWidth,
  handleBlurScreen,
  styles,
  availableOptions,
  uniqueOptions,
  parentheticalOptions,
  availableOptions3
}) => {
  return (
    <div className={element.type} align="left">
      {element.type === "sceneheading" && (
        <div align="left">
          <input type="cunt" value={element.number} readOnly className={styles.cuntInput} />.
          <input
            name="setting"
            type="settext"
            placeholder="INT/EXT??"
            list={`setting-option-${idx}`}
            value={element.setting}
            onChange={e => handleElementChange(idx, "setting", e.target.value)}
            onBlur={handleBlurScreen}
            onInput={e => adjustWidth(e.target)}
            className={styles.settextInput}
            autoComplete="on"
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
            onBlur={handleBlurScreen}
            onInput={e => adjustWidth(e.target)}
            className={styles.loctextInput}
          />
          -
          <input
            name="time"
            type="tym"
            placeholder=" Time??"
            list={`time-options-${idx}`}
            value={element.time || ""}
            onChange={e => handleElementChange(idx, "time", e.target.value)}
            onInput={e => adjustWidth(e.target)}
            onBlur={handleBlurScreen}
            className={styles.tymInput}
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
          onChange={e => handleActionInput(e, idx)}
          onBlur={handleBlurScreen}
          onInput={e => auto_grow(e.target)}
          className={styles.acttext}
        />
      )}
      {element.type === "character" && (
        <center>
          <input
            type="character"
            placeholder="Character Name"
            value={element.character_name || ""}
            onChange={e => handleCharacterInput(e, idx)}
            onBlur={handleBlurScreen}
            onInput={e => {
              adjustWidth(e.target);
              auto_grow(e.target);
            }}
            maxLength={90}
            className={styles.characterInput}
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
            onChange={e => handleParentheticalInput(e, idx)}
            onBlur={handleBlurScreen}
            onInput={e => adjustWidth(e.target)}
            maxLength={60}
            className={styles.parentheticalInput}
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
          onInput={e => auto_grow(e.target)}
          onBlur={handleBlurScreen}
          className={styles.dialogueTextarea}
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
            onInput={e => adjustWidth(e.target)}
            onBlur={handleBlurScreen}
            autoComplete="off"
            className={styles.transisInput}
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
};

export default ScreenElementBlock;
