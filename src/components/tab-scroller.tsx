import GirlSVG from "./GirlSVG";

const Navigation = () => {
  const scrollToSection = (sectionId: string): void => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <nav className="fixed pt-6 pr-6 z-50 flex justify-end w-screen max-sm:justify-center max-sm:pr-0">
      <div className="px-6 py-0.5 flex items-center justify-center border border-gray-200 bg-white rounded-full max-sm:py-2 max-sm:px-4 indie-flower-regular text-xl">
        <div className="flex items-center space-x-8  max-sm:space-x-5">
          <button
            onClick={() => scrollToSection("home")}
            className="text-gray-600 hover:text-black hover:font-bold transition-colors"
          >
            <GirlSVG />
          </button>
          <button
            onClick={() => scrollToSection("work")}
            className="text-gray-600 hover:text-[#FD652D] hover:font-bold transition-colors"
          >
            Work
          </button>
          <button
            onClick={() => scrollToSection("writing")}
            className="text-gray-600 hover:text-[#FD652D] hover:font-bold transition-colors"
          >
            Writing
          </button>
          <button
            onClick={() => scrollToSection("story")}
            className="text-gray-600 hover:text-[#FD652D] hover:font-bold transition-colors"
          >
            Story
          </button>
          <button
            onClick={() => scrollToSection("connect")}
            className="text-gray-600 hover:text-[#FD652D] hover:font-bold transition-colors"
          >
            Connect
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
