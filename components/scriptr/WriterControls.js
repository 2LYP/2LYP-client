// components/scriptr/WriterControls.js
import React from "react";
import Button from "@/components/ui/Button";

const WriterControls = ({
  sidebarOpen,
  setSidebarOpen,
  sidebarWidth,
  setSidebarWidth,
  sidebarRef,
  isResizing,
  handleMouseDown,
  handleA4PaginateToggle,
  a4Paginate,
  scenehead,
  addActionBlock,
  addCharacterBlock,
  addParentheticalBlock,
  addDialogueBlock,
  addTransitionBlock,
  handleUndo,
  handleRedo,
  handlePrint,
  handleSave,
  autoSaveEnabled,
  setAutoSaveEnabled,
  isLoggedIn
}) => (
  <>
    <div
      ref={sidebarRef}
      style={{ width: sidebarOpen ? sidebarWidth : 0 }}
      className={`bg-gray-100 dark:bg-gray-800 p-4 transition-all duration-500 ease-in-out h-full overflow-y-auto fixed left-0 top-0 z-20 ${sidebarOpen ? "block" : "hidden"}`}
    >
      <div className="w-full text-sm">
        <div
          className="flex justify-center mb-4"
          style={{
            width: "100%",
            minHeight: 48,
            maxHeight: 70,
          }}
        >
          <div
            className="relative flex items-center justify-center bg-red-600 rounded-xl border-3 border-black w-full"
            style={{
              minHeight: 48,
              maxHeight: 70,
            }}
          >
            <h1
              className="text-center text-white font-bold w-full"
              style={{
                fontSize: 24,
                whiteSpace: "nowrap",
                overflow: "hidden",
                lineHeight: "48px",
                height: "48px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                letterSpacing: "0.1em"
              }}
            >
              S.C.R.I.P.T.R.
            </h1>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <Button className="typewriter" style={{ fontSize: "16px", height: "42px", paddingTop: "10px" }} onClick={scenehead}>Scene Heading (Alt⌥+1)</Button>
          <Button className="typewriter" style={{ fontSize: "16px", height: "42px", paddingTop: "10px" }} onClick={addActionBlock}>Action (Alt⌥+2)</Button>
          <Button className="typewriter" style={{ fontSize: "16px", height: "42px", paddingTop: "10px" }} onClick={addCharacterBlock}>Character (Alt⌥+3)</Button>
          <Button className="typewriter" style={{ fontSize: "16px", height: "42px", paddingTop: "10px" }} onClick={addParentheticalBlock}>Parenthetical (Alt⌥+4)</Button>
          <Button className="typewriter" style={{ fontSize: "16px", height: "42px", paddingTop: "10px" }} onClick={addDialogueBlock}>Dialogue (Alt⌥+5)</Button>
          <Button className="typewriter" style={{ fontSize: "16px", height: "42px", paddingTop: "10px" }} onClick={addTransitionBlock}>Transition (Alt⌥+6)</Button>
          <Button className="typewriter" style={{ fontSize: "16px", height: "42px", paddingTop: "10px" }} onClick={handleUndo}>Undo (Ctrl+Z)</Button>
          <Button className="typewriter" style={{ fontSize: "16px", height: "42px", paddingTop: "10px" }} onClick={handleRedo}>Redo (Ctrl+Y)</Button>
          <Button className="typewriter" style={{ fontSize: "16px", height: "42px", paddingTop: "10px" }} onClick={handlePrint}>Print (Ctrl+P)</Button>
          <Button className="typewriter" style={{ fontSize: "16px", height: "42px", paddingTop: "10px" }} onClick={handleA4PaginateToggle}> {a4Paginate ? "A4 Pages Mode" : "Scroll Mode"}</Button>
          {/* Auto-Save Toggle */}
          {isLoggedIn && (
            <Button className="typewriter" style={{ fontSize: "16px", height: "42px", paddingTop: "10px" }} onClick={() => setAutoSaveEnabled(v => !v)}>
              {autoSaveEnabled ? "Auto-Save: ON" : "Auto-Save: OFF"}
            </Button>
          )}
          {/* Save Button: Only show if Auto-Save is OFF */}
          {!autoSaveEnabled && (
            <Button className="typewriter bg-green-600 hover:bg-green-700 text-white font-bold" style={{ fontSize: "16px", height: "42px", paddingTop: "10px" }} onClick={handleSave}>
              Save (Ctrl+S)
            </Button>
          )}
        </div>
      </div>
    </div>
    <button
      onClick={() => setSidebarOpen(!sidebarOpen)}
      onMouseDown={handleMouseDown}
      style={{ left: sidebarOpen ? sidebarWidth : 0 }}
      className="fixed top-1/2 transform -translate-y-1/2 bg-black font-bold text-white px-3 py-20 rounded-r-lg transition-all duration-200 ease-in-out z-30 hover:bg-gray-800"
    >
      {sidebarOpen ? "▶" : "◀"}
    </button>
  </>
);

export default WriterControls;