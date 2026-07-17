//components/home/Section.js

import FlipCard from '../ui/FlipCard';
import { useRouter } from "next/navigation";

export default function Section({ title, bgColor, items = [], buttonColor, sectionIndex }) {
  const router = useRouter();

  const handleCardFlip = ({ section, item, sectionIndex, itemIndex }) => {
    console.log("Flipped card:", {
      sectionTitle: section.title,
      sectionIndex,
      itemIndex,
      itemName: item.name,
    });
    // Add more logic here if needed
  };

  return (
    <section className={`relative w-3/4 mx-auto flex flex-col items-center pt-7 pb-15 ${bgColor} dark:bg-gray-800 rounded-xl border-4 border-black`}>
      {/* Black Dots at Corners */}
      {[['top-4', 'left-4'], ['top-4', 'right-4'], ['bottom-4', 'left-4'], ['bottom-4', 'right-4']].map(([top, left], i) => (
        <div key={i} className={`absolute w-3 h-3 bg-black rounded-full ${top} ${left}`} />
      ))}

      <h2 className="bg-gray-100 p-4 border-3 border-black text-center text-3xl font-bold mb-10 text-black dark:text-white">
        {title}
      </h2>
      
      <div className="flex justify-center gap-8 flex-wrap px-4">
        {items.map((item, index) => (
          <FlipCard 
            key={index}
            item={item}
            buttonColor={buttonColor}
            sectionIndex={sectionIndex}
            itemIndex={index}
            onClick={() => item.route && router.push(item.route)}
            onFlip={handleCardFlip}
          />
        ))}
      </div>
    </section>
  );
}
