// constants/screenplayConstants.js
export const availableOptions = ["INT", "EXT", "INT/EXT", "EXT/INT"];

export const availableOptions2 = [
  "DAY", "NIGHT", "DAWN", "SUNRISE", "MORNING", "AFTERNOON", "NOON", "DUSK", "SUNSET", "EVENING", "TWILIGHT", "MIDNIGHT",
  "THIS MOMENT", "THAT MOMENT", "MOMENTS LATER", "LATER", "CONTINUOUS", "SAME TIME", "IMMEDIATELY AFTER", "THE NEXT DAY",
  "LATER THAT DAY", "SAME DAY", "LATE NIGHT", "SAME NIGHT", "SAME MORNING", "LATE AFTERNOON", "SAME AFTERNOON", "HIGH NOON",
  "SAME EVENING", "LATER THAT EVENING", "LATE EVENING", "LATER THAT NIGHT"
];

export const uniqueOptions = Array.from(new Set(availableOptions2));

export const availableOptions3 = [
  "CUT TO", "FADE IN", "FADE OUT", "FADE TO", "DISSOLVE TO", "BACK TO", "MATCH CUT TO", "JUMP CUT TO", "SMASH TO", "FADE TO BLACK"
];

export const parentheticalOptions = ["V.O.", "O.S.", "O.C."];

export const elementsPerPage = 60;