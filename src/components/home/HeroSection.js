//components/home/HeroSection.js
import Logo from "@/components/ui/Logo";
import Button from "@/components/ui/Button";

export default function HeroSection({ sectionData, isScrolled, router }) {
  return (
    <div className="flex flex-col items-center justify-center w-full h-screen">
      <Logo style={{ transform: "scale(0.9)" }} />
      <div
        className="text-7xl font-bold mt-8 z-0 mx-auto text-center px-4 py-2 rounded"
        style={{
          color: "var(--text)",
          overflow: "hidden",
          whiteSpace: "nowrap",
          animation: "typing 3s steps(30, end) forwards",
          width: "0",
        }}
      >
        C O M P U T A T I O N S
      </div>
      <div
        className={`mt-1 flex gap-15 transition-all duration-100 ${
          isScrolled ? "-translate-y-0 opacity-0" : "translate-y-10 opacity-100"
        }`}
      >
        {sectionData.map((section, i) => {
          // Assign a glow color based on the button's color or title
          let glowColor = section.buttonColor;
          // Optionally, you can hardcode for specific titles if needed
          if (section.title === "Products") glowColor = "#FF0000"; // red
          else if (section.title === "Services") glowColor = "#00aeef"; // blue
          else if (section.title === "Learn") glowColor = "#1ba754"; // green
          else if (section.title === "Hub") glowColor = "#FFFF00"; // yellow or any color you want

          return (
            <Button
              key={i}
              className="typewriter"
              style={{
                "--button-bg-light": section.buttonColor,
                "--button-glow-color": glowColor,
              }}
              onClick={() => section.title === "Products" && router.push("/products")}
            >
              {section.title}
            </Button>
          );
        })}
      </div>
    </div>
  );
}