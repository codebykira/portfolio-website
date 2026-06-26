import { useState, useEffect } from "react";
import GirlSVG from "./GirlSVG";

const Navigation = () => {
  const [activeSection, setActiveSection] = useState("home");
  const scrollToSection = (sectionId: string): void => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {

    const handleScroll = () => {
      const sections = ["home", "work", "writing", "story", "connect"];
      const scrollPosition = window.scrollY + 200; // Offset for better detection

      for (const sectionId of sections) {
        const element = document.getElementById(sectionId);
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(sectionId);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll(); // Check initial position

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav className="fixed pt-6 pr-6 z-50 flex justify-end w-screen max-sm:justify-center max-sm:pr-0">
      <div className="px-6 py-0.5 flex items-center justify-center rounded-full border border-white/15 bg-white/10 shadow-lg shadow-black/20 backdrop-blur-xl backdrop-saturate-150 max-sm:py-2 max-sm:px-4 indie-flower-regular text-xl">
        <div className="flex items-center space-x-8  max-sm:space-x-5">
          <button
            onClick={() => scrollToSection("home")}
            className="transition-colors text-white/80 hover:text-white hover:font-bold"
            style={activeSection === "home" ? { color: "white", fontWeight: "bold" } : {}}
          >
            <GirlSVG isActive={activeSection === "home"} />
          </button>
          <button
            onClick={() => scrollToSection("work")}
            className="transition-colors text-white/80 hover:text-white hover:font-bold"
            style={activeSection === "work" ? { color: "white", fontWeight: "bold" } : {}}
          >
            Work
          </button>
          {/* <button
            onClick={() => scrollToSection("writing")}
            className="transition-colors text-white/80 hover:text-white hover:font-bold"
            style={activeSection === "writing" ? { color: "white", fontWeight: "bold" } : {}}
          >
            Writing
          </button> */}
          <button
            onClick={() => scrollToSection("story")}
            className="transition-colors text-white/80 hover:text-white hover:font-bold"
            style={activeSection === "story" ? { color: "white", fontWeight: "bold" } : {}}
          >
            Story
          </button>
          <button
            onClick={() => scrollToSection("connect")}
            className="transition-colors text-white/80 hover:text-white hover:font-bold"
            style={activeSection === "connect" ? { color: "white", fontWeight: "bold" } : {}}
          >
            Connect
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
