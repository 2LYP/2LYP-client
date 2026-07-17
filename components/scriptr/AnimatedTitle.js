// components/scriptr/AnimatedTitle.js
import React from "react";

const AnimatedTitle = ({ animatedTitle }) => (
  <h1
    className="text-center text-white font-bold w-full"
    style={{
      fontSize: "64px",
      whiteSpace: "nowrap",
      overflow: "hidden",
      lineHeight: "130px",
      height: "130px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    }}
  >
    {animatedTitle}
  </h1>
);

export default AnimatedTitle;
