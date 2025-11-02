// Reusable yellow highlight animation style
export const yellowHighlightAnimation = {
  initial: {
    filter: 'brightness(0)'
  },
  whileInView: {
    filter: 'brightness(0) saturate(100%) invert(65%) sepia(58%) saturate(348%) hue-rotate(349deg) brightness(101%) contrast(103%)'
  },
  transition: {
    delay: 0.5,
    duration: 0.3,
    ease: "easeOut"
  },
  viewport: { once: true, amount: 0.3, margin: "-25% 0px -25% 0px" }
};

// Reusable text color animation style (gray to black)
export const textColorAnimation = {
  className: "text-md text-gray-500",
  initial: {
    color: '#9CA3AF' // text-gray-400
  },
  whileInView: {
    color: '#000000' // text-black
  },
  transition: {
    duration: 0.4,
    ease: "easeOut"
  },
  viewport: { once: true, amount: 0.3, margin: "-25% 0px -25% 0px" }
};