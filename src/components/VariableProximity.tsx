import { forwardRef, useMemo, useRef, useEffect, MutableRefObject, RefObject, HTMLAttributes } from 'react';
import { motion } from 'motion/react';
import './VariableProximity.css';

type Callback = () => void;

function useAnimationFrame(callback: Callback, throttleMs: number = 0) {
  useEffect(() => {
    let frameId: number;
    let lastTime = 0;
    
    const loop = (currentTime: number) => {
      if (currentTime - lastTime >= throttleMs) {
        callback();
        lastTime = currentTime;
      }
      frameId = requestAnimationFrame(loop);
    };
    frameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frameId);
  }, [callback, throttleMs]);
}

function useMousePositionRef(containerRef: RefObject<HTMLElement | HTMLDivElement | null>) {
  const positionRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const updatePosition = (x: number, y: number) => {
      if (containerRef?.current) {
        const rect = containerRef.current.getBoundingClientRect();
        positionRef.current = { x: x - rect.left, y: y - rect.top };
      } else {
        positionRef.current = { x, y };
      }
    };

    const handleMouseMove = (ev: MouseEvent) => updatePosition(ev.clientX, ev.clientY);
    const handleTouchMove = (ev: TouchEvent) => {
      const touch = ev.touches[0];
      updatePosition(touch.clientX, touch.clientY);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleTouchMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
    };
  }, [containerRef]);

  return positionRef;
}

interface VariableProximityProps extends HTMLAttributes<HTMLSpanElement> {
  label: string;
  fromFontVariationSettings: string;
  toFontVariationSettings: string;
  containerRef: RefObject<HTMLElement | HTMLDivElement | null>;
  radius?: number;
  falloff?: 'linear' | 'exponential' | 'gaussian';
  className?: string;
  onClick?: () => void;
  style?: React.CSSProperties;
}

const VariableProximity = forwardRef<HTMLSpanElement, VariableProximityProps>((props, ref) => {
  const {
    label,
    fromFontVariationSettings,
    toFontVariationSettings,
    containerRef,
    radius = 50,
    falloff = 'linear',
    className = '',
    onClick,
    style,
    ...restProps
  } = props;

  const letterRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const interpolatedSettingsRef = useRef<string[]>([]);
  const mousePositionRef = useMousePositionRef(containerRef);
  const lastPositionRef = useRef<{ x: number | null; y: number | null }>({ x: null, y: null });
  const letterPositionsRef = useRef<{ x: number; y: number }[]>([]);
  const needsPositionUpdateRef = useRef<boolean>(true);
  const settingsCache = useRef<Map<string, string>>(new Map());

  const parsedSettings = useMemo(() => {
    const parseSettings = (settingsStr: string) =>
      new Map(
        settingsStr
          .split(',')
          .map(s => s.trim())
          .map(s => {
            const [name, value] = s.split(' ');
            return [name.replace(/['"]/g, ''), parseFloat(value)];
          })
      );

    const fromSettings = parseSettings(fromFontVariationSettings);
    const toSettings = parseSettings(toFontVariationSettings);

    return Array.from(fromSettings.entries()).map(([axis, fromValue]) => ({
      axis,
      fromValue,
      toValue: toSettings.get(axis) ?? fromValue
    }));
  }, [fromFontVariationSettings, toFontVariationSettings]);

  const calculateDistance = (x1: number, y1: number, x2: number, y2: number) =>
    Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);

  const calculateFalloff = (distance: number) => {
    const norm = Math.min(Math.max(1 - distance / radius, 0), 1);
    switch (falloff) {
      case 'exponential':
        return norm ** 2;
      case 'gaussian':
        return Math.exp(-((distance / (radius / 2)) ** 2) / 2);
      case 'linear':
      default:
        return norm;
    }
  };

  // Cache letter positions and update only when necessary
  const updateLetterPositions = () => {
    if (!containerRef?.current) return;
    const containerRect = containerRef.current.getBoundingClientRect();
    
    letterPositionsRef.current = letterRefs.current.map(letterRef => {
      if (!letterRef) return { x: 0, y: 0 };
      const rect = letterRef.getBoundingClientRect();
      return {
        x: rect.left + rect.width / 2 - containerRect.left,
        y: rect.top + rect.height / 2 - containerRect.top
      };
    });
    needsPositionUpdateRef.current = false;
  };

  // Memoized function to generate font variation settings
  const generateFontSettings = (falloffValue: number) => {
    // Create a cache key based on the falloff value (rounded to reduce cache misses)
    const cacheKey = Math.round(falloffValue * 100).toString();
    
    if (settingsCache.current.has(cacheKey)) {
      return settingsCache.current.get(cacheKey)!;
    }

    const newSettings = parsedSettings
      .map(({ axis, fromValue, toValue }) => {
        const interpolatedValue = fromValue + (toValue - fromValue) * falloffValue;
        return `'${axis}' ${interpolatedValue}`;
      })
      .join(', ');

    settingsCache.current.set(cacheKey, newSettings);
    
    // Limit cache size to prevent memory leaks
    if (settingsCache.current.size > 100) {
      const firstKey = settingsCache.current.keys().next().value;
      if (firstKey !== undefined) {
        settingsCache.current.delete(firstKey);
      }
    }
    
    return newSettings;
  };

  // Update positions on resize
  useEffect(() => {
    const handleResize = () => {
      needsPositionUpdateRef.current = true;
      // Clear settings cache on resize as positions change
      settingsCache.current.clear();
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useAnimationFrame(() => {
    if (!containerRef?.current) return;
    const { x, y } = mousePositionRef.current;
    
    // Early exit if mouse hasn't moved significantly (reduce jitter calculations)
    if (lastPositionRef.current.x !== null && lastPositionRef.current.y !== null) {
      const deltaX = Math.abs(x - lastPositionRef.current.x);
      const deltaY = Math.abs(y - lastPositionRef.current.y);
      if (deltaX < 1 && deltaY < 1) {
        return;
      }
    }
    lastPositionRef.current = { x, y };

    // Update letter positions if needed (on first run or after resize)
    if (needsPositionUpdateRef.current) {
      updateLetterPositions();
    }

    letterRefs.current.forEach((letterRef, index) => {
      if (!letterRef || !letterPositionsRef.current[index]) return;

      const { x: letterCenterX, y: letterCenterY } = letterPositionsRef.current[index];
      const distance = calculateDistance(x, y, letterCenterX, letterCenterY);

      if (distance >= radius) {
        letterRef.style.fontVariationSettings = fromFontVariationSettings;
        return;
      }

      const falloffValue = calculateFalloff(distance);
      const newSettings = generateFontSettings(falloffValue);

      interpolatedSettingsRef.current[index] = newSettings;
      letterRef.style.fontVariationSettings = newSettings;
    });
  }, 16); // Throttle to ~60fps max to prevent excessive calculations

  const paragraphs = label.split('\n\n');
  let letterIndex = 0;

  return (
    <span
      ref={ref}
      className={`${className} variable-proximity`}
      onClick={onClick}
      style={{ display: 'block', ...style }}
      {...restProps}
    >
      {paragraphs.map((paragraph, paragraphIndex) => {
        const words = paragraph.split(' ');
        return (
          <span key={paragraphIndex} style={{ display: 'block', marginBottom: paragraphIndex < paragraphs.length - 1 ? '1rem' : '0' }}>
            {words.map((word, wordIndex) => (
              <span key={wordIndex} style={{ display: 'inline-block', whiteSpace: 'nowrap' }}>
                {word.split('').map(letter => {
                  const currentLetterIndex = letterIndex++;
                  return (
                    <motion.span
                      key={currentLetterIndex}
                      ref={el => {
                        letterRefs.current[currentLetterIndex] = el;
                      }}
                      style={{
                        display: 'inline-block',
                        fontVariationSettings: interpolatedSettingsRef.current[currentLetterIndex]
                      }}
                      aria-hidden="true"
                    >
                      {letter}
                    </motion.span>
                  );
                })}
                {wordIndex < words.length - 1 && <span style={{ display: 'inline-block' }}>&nbsp;</span>}
              </span>
            ))}
          </span>
        );
      })}
      <span className="sr-only">{label}</span>
    </span>
  );
});

VariableProximity.displayName = 'VariableProximity';
export default VariableProximity;
