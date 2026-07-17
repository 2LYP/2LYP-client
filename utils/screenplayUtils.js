// utils/screenplayUtils.js
import { availableOptions, uniqueOptions, availableOptions3, parentheticalOptions } from '../constants/screenplayConstants';

export const auto_grow = (element) => {
  element.style.height = "5px";
  element.style.height = `${element.scrollHeight}px`;
};

export const adjustWidth = (input) => {
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

export const handleAutocomplete = (field, value, characterNames) => {
  if (field === "character") {
    const allNames = [...characterNames];
    if (value && !allNames.includes(value.toUpperCase())) {
      allNames.push(value.toUpperCase());
    }
    return allNames.filter(opt => opt.toLowerCase().includes((value || "").toLowerCase()));
  }
  if (!value) {
    if (field === "setting") return availableOptions;
    if (field === "time") return uniqueOptions;
    if (field === "transition") return availableOptions3;
    if (field === "parenthetical") return parentheticalOptions;
    return [];
  }
  let options = [];
  if (field === "setting") options = availableOptions;
  if (field === "time") options = uniqueOptions;
  if (field === "transition") options = availableOptions3;
  if (field === "parenthetical") options = parentheticalOptions;
  return options.filter(opt => opt.toLowerCase().includes(value.toLowerCase()));
};