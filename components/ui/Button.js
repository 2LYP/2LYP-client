// components/home/Button.js
"use client";
import styles from "./Button.module.css";

export default function Button({
  children,
  className = "",
  roundedFull = false,
  style = {},
  ...props
}) {
  const classes = [
    styles.typewriter,
    roundedFull ? styles.roundedFull : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button className={classes} style={style} {...props}>
      {children}
    </button>
  );
}
