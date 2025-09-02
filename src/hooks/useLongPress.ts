import { useCallback, useRef } from 'react';

interface LongPressOptions {
  onLongPress: (event: React.TouchEvent | React.MouseEvent) => void;
  onClick?: (event: React.TouchEvent | React.MouseEvent) => void;
  threshold?: number; // milliseconds
}

export function useLongPress({ onLongPress, onClick, threshold = 500 }: LongPressOptions) {
  const isLongPress = useRef(false);
  const timeout = useRef<NodeJS.Timeout>();
  const target = useRef<EventTarget>();

  const start = useCallback((event: React.TouchEvent | React.MouseEvent) => {
    // Prevent text selection during long press
    event.preventDefault();
    
    target.current = event.target;
    isLongPress.current = false;

    timeout.current = setTimeout(() => {
      isLongPress.current = true;
      onLongPress(event);
    }, threshold);
  }, [onLongPress, threshold]);

  const clear = useCallback(() => {
    if (timeout.current) {
      clearTimeout(timeout.current);
      timeout.current = undefined;
    }
  }, []);

  const clickHandler = useCallback((event: React.TouchEvent | React.MouseEvent) => {
    clear();
    
    // Only trigger click if it wasn't a long press and the target hasn't changed
    if (!isLongPress.current && onClick && event.target === target.current) {
      onClick(event);
    }
  }, [clear, onClick]);

  return {
    onMouseDown: start,
    onTouchStart: start,
    onMouseUp: clickHandler,
    onTouchEnd: clickHandler,
    onMouseLeave: clear,
    onTouchCancel: clear,
  };
}