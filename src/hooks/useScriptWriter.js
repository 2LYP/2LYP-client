// hooks/useScriptWriter.js
import { useState, useRef, useCallback, useEffect } from "react";

// Autocomplete options (could import from constants if preferred)
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

export default function useScriptWriter() {
  // Screenplay States
  const [screenplayElements, setScreenplayElements] = useState([{
    type: "sceneheading",
    number: 1,
    setting: "",
    location: "",
    time: "",
    action: "",
    character_name: "",
    parentheticalText: "",
    dialogue: "",
    transition: "",
  }]);
  const [formData, setFormData] = useState({
    movie_name: "",
    writer: "",
    director: "",
    producer: "",
    genre: "", // <-- Added genre property
  });
  const [undoStack, setUndoStack] = useState([]);
  const [redoStack, setRedoStack] = useState([]);
  const [characterNames, setCharacterNames] = useState(["JOHN", "MARY", "DETECTIVE"]);
  const [activeElementIndex, setActiveElementIndex] = useState(0);

  // Helper functions
  const auto_grow = (element) => {
    element.style.height = "5px";
    element.style.height = `${element.scrollHeight}px`;
  };

  const adjustWidth = (input) => {
    const minWidth = 20;
    const padding = 8;
    const span = document.createElement("span");
    span.style.visibility = "hidden";
    span.style.whiteSpace = "pre";
    span.textContent = input.value || input.placeholder || "";
    document.body.appendChild(span);
    let width = span.offsetWidth + padding;
    width = Math.max(width, minWidth);
    input.style.width = `${width}px`;
    document.body.removeChild(span);
  };

  // Enhanced undo/redo logic
  const saveToUndo = useCallback(() => {
    setUndoStack((prevElements) => [...prevElements, JSON.parse(JSON.stringify(screenplayElements))]);
    // Clear redo stack when new action is performed
    setRedoStack([]);
  }, [screenplayElements]);

  // Check if a block is empty
  const isBlockEmpty = useCallback((element) => {
    switch (element.type) {
      case "sceneheading":
        return !element.setting && !element.location && !element.time;
      case "action":
        return !element.action;
      case "character":
        return !element.character_name;
      case "parenthetical":
        return !element.parentheticalText;
      case "dialogue":
        return !element.dialogue;
      case "transition":
        return !element.transition;
      default:
        return true;
    }
  }, []);

  // Remove block at specific index
  const removeBlock = useCallback((index) => {
    if (screenplayElements.length <= 1) return; // Don't remove the last element
    
    saveToUndo();
    setScreenplayElements((prevElements) => {
      const newElements = prevElements.filter((_, i) => i !== index);
      // Recalculate scene numbers if we removed a scene heading
      if (prevElements[index].type === "sceneheading") {
        let sceneCount = 1;
        return newElements.map(element => {
          if (element.type === "sceneheading") {
            return { ...element, number: sceneCount++ };
          }
          return element;
        });
      }
      return newElements;
    });
  }, [screenplayElements, saveToUndo]);

  // Enhanced undo function
  const handleUndo = useCallback(() => {
    if (undoStack.length > 0) {
      const lastState = undoStack[undoStack.length - 1];
      // Save current state to redo stack
      setRedoStack((prevRedo) => [...prevRedo, JSON.parse(JSON.stringify(screenplayElements))]);
      // Restore previous state
      setScreenplayElements(lastState);
      setUndoStack((prevStack) => prevStack.slice(0, -1));
    }
  }, [undoStack, screenplayElements]);

  // New redo function
  const handleRedo = useCallback(() => {
    if (redoStack.length > 0) {
      const nextState = redoStack[redoStack.length - 1];
      // Save current state to undo stack
      setUndoStack((prevUndo) => [...prevUndo, JSON.parse(JSON.stringify(screenplayElements))]);
      // Restore next state
      setScreenplayElements(nextState);
      setRedoStack((prevStack) => prevStack.slice(0, -1));
    }
  }, [redoStack, screenplayElements]);

  const setActiveElement = useCallback((index) => {
    setActiveElementIndex(index);
  }, []);

  // Block adders
  const addBlock = useCallback((newElement) => {
    saveToUndo();
    setScreenplayElements((prevElements) => {
      const newElements = [...prevElements];
      newElements.splice(activeElementIndex + 1, 0, newElement);
      return newElements;
    });
  }, [activeElementIndex, saveToUndo]);

  const scenehead = useCallback(() => {
    const sceneCount = screenplayElements.filter(
      (element) => element.type === "sceneheading"
    ).length + 1;
    addBlock({
      type: "sceneheading",
      number: sceneCount,
      setting: "",
      location: "",
      time: "",
    });
  }, [addBlock, screenplayElements]);

  const addActionBlock = useCallback(() => {
    addBlock({ type: "action", action: "" });
  }, [addBlock]);

  const addCharacterBlock = useCallback(() => {
    addBlock({ type: "character", character_name: "" });
  }, [addBlock]);

  const addDialogueBlock = useCallback(() => {
    addBlock({ type: "dialogue", dialogue: "" });
  }, [addBlock]);

  const addParentheticalBlock = useCallback(() => {
    addBlock({ type: "parenthetical", parentheticalText: "" });
  }, [addBlock]);

  const addTransitionBlock = useCallback(() => {
    addBlock({ type: "transition", transition: "" });
  }, [addBlock]);

  // Element change handlers
  const handleElementChange = (index, field, value) => {
    setScreenplayElements((prevElements) => {
      const updatedElements = [...prevElements];
      updatedElements[index] = {
        ...updatedElements[index],
        [field]: value,
      };
      // Track new character names
      if (field === "character_name" && value && !characterNames.includes(value.toUpperCase())) {
        setCharacterNames(prev => [...prev, value.toUpperCase()]);
      }
      return updatedElements;
    });
  };

  const handleChangeScreen = (e) => {
    const { name, value } = e.target;
    handleElementChange(0, name, value);
  };

  const handleBlurScreen = () => {};

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleCharacterInput = (e, index) => {
    const value = e.target.value.slice(0, 90);
    handleElementChange(index, "character_name", value);
    adjustWidth(e.target);
  };

  const handleParentheticalInput = (e, index) => {
    const value = e.target.value.slice(0, 60);
    handleElementChange(index, "parentheticalText", value);
    adjustWidth(e.target);
  };

  const handleActionInput = (e, index) => {
    const value = e.target.value;
    handleElementChange(index, "action", value);
    auto_grow(e.target);
  };

  // Autocomplete helpers
  const handleAutocomplete = (field, value) => {
    if (field === "character") {
      const allNames = [...characterNames];
      if (value && !allNames.includes(value.toUpperCase())) {
        allNames.push(value.toUpperCase());
      }
      return allNames.filter(opt => opt.toLowerCase().includes((value || "").toLowerCase()));
    }
    if (!value) {
      if (field === "setting") return availableOptions;
      if (field === "time" ) return uniqueOptions;
      if (field === "transition") return availableOptions3;
      if (field === "parenthetical") return parentheticalOptions;
      return [];
    }
    let options = [];
    if (field === "setting") options = availableOptions;
    if (field === "time" ) options = uniqueOptions;
    if (field === "transition") options = availableOptions3;
    if (field === "parenthetical") options = parentheticalOptions;
    return options.filter(opt => opt.toLowerCase().includes(value.toLowerCase()));
  };

  return {
    screenplayElements,
    setScreenplayElements,
    formData,
    setFormData,
    undoStack,
    setUndoStack,
    redoStack,
    setRedoStack,
    characterNames,
    setCharacterNames,
    auto_grow,
    adjustWidth,
    saveToUndo,
    scenehead,
    addActionBlock,
    addCharacterBlock,
    addDialogueBlock,
    addParentheticalBlock,
    addTransitionBlock,
    handleUndo,
    handleRedo,
    removeBlock,
    isBlockEmpty,
    handleElementChange,
    handleChangeScreen,
    handleBlurScreen,
    handleChange,
    handleCharacterInput,
    handleParentheticalInput,
    handleActionInput,
    handleAutocomplete,
    availableOptions,
    uniqueOptions,
    availableOptions3,
    parentheticalOptions,
    activeElementIndex,
    setActiveElement,
  };
}
