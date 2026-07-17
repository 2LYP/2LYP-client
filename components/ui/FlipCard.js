// components/ui/FlipCard.js
import Button from "@/components/ui/Button";
import SECTION_DATA from "@/constants/sectionData";

export default function FlipCard({ item, buttonColor, onClick, sectionIndex, itemIndex, onFlip }) {
  let cardData = item;
  if (
    !cardData &&
    typeof sectionIndex === "number" &&
    typeof itemIndex === "number" &&
    SECTION_DATA[sectionIndex] &&
    Array.isArray(SECTION_DATA[sectionIndex].items) &&
    SECTION_DATA[sectionIndex].items[itemIndex]
  ) {
    cardData = SECTION_DATA[sectionIndex].items[itemIndex];
  }

  if (!cardData) return null;

  const handleMouseEnter = () => {
    if (onFlip) {
      onFlip({ section: SECTION_DATA[sectionIndex], item: cardData, sectionIndex, itemIndex });
    }
  };

  return (
    <div
      className="group w-64 h-80"
      onMouseEnter={handleMouseEnter}
      style={{ perspective: "1000px" }}
    >
      <div
        className="relative w-full h-full transition-transform duration-700 group-hover:[transform:rotateY(180deg)]"
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* Front Side */}
        <div 
          className="absolute inset-0 flex flex-col items-center justify-center bg-white dark:bg-gray-700 shadow-lg rounded-lg p-6"
          style={{ backfaceVisibility: "hidden" }}
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {cardData.name}
          </h3>
        </div>
        
        {/* Back Side */}
        <div 
          className="absolute inset-0 flex flex-col items-center justify-center bg-gray-800 dark:bg-gray-600 text-white shadow-lg rounded-lg p-6"
          style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
        >
          <h3 className="text-lg font-semibold">{cardData.description}</h3>
          {cardData.button && (
            <Button
              style={{ "--button-bg-light": buttonColor, fontSize: "22px", height: "60px" }}
              onClick={e => {
                e.stopPropagation();
                onClick && onClick();
              }}
            >
              {cardData.button}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}