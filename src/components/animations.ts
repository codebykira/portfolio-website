// Reusable yellow highlight animation style
export const yellowHighlightAnimation = {
  initial: {
    filter: 'brightness(0)'
  },
  whileInView: {
    filter: 'brightness(0) saturate(100%) invert(65%) sepia(58%) saturate(348%) hue-rotate(349deg) brightness(101%) contrast(103%)'
  },
  viewport: { once: true, amount: 0.3, margin: "-25% 0px -25% 0px" }
};

// Reusable text color animation style (dim to design-system 70% white).
// Use on dark backgrounds.
export const textColorAnimation = {
  className: "text-md",
  initial: {
    color: 'rgba(255, 255, 255, 0.2)'
  },
  whileInView: {
    color: 'rgba(255, 255, 255, 0.7)' // --ds-text
  },
  viewport: { once: true, amount: 0.3, margin: "-25% 0px -25% 0px" }
};

// Same effect for light backgrounds (dim grey → near-black).
export const textColorAnimationDark = {
  className: "text-md",
  initial: {
    color: 'rgba(0, 0, 0, 0.2)'
  },
  whileInView: {
    color: 'rgba(0, 0, 0, 0.85)'
  },
  viewport: { once: true, amount: 0.3, margin: "-25% 0px -25% 0px" }
};