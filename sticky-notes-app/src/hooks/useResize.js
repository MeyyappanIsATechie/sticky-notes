import { useRef, useCallback, useEffect } from "react";
import { MIN_NOTE_WIDTH, MIN_NOTE_HEIGHT } from "../constants";

export function useResize({ onResize }) {
  const resizeInfo = useRef(null);
  const onResizeRef = useRef(onResize);

  useEffect(() => {
    onResizeRef.current = onResize;
  });

  const handleMove = useCallback((e) => {
    const info = resizeInfo.current;

    if (!info) return;

    const width = Math.max(
      MIN_NOTE_WIDTH,
      info.startWidth + (e.clientX - info.startX),
    );

    const height = Math.max(
      MIN_NOTE_HEIGHT,
      info.startHeight + (e.clientY - info.startY),
    );

    onResizeRef.current(info.id, width, height);
  }, []);

  const handleEnd = useCallback(() => {
    resizeInfo.current = null;
    document.removeEventListener("mousemove", handleMove);
  }, [handleMove]);

  const startResize = useCallback(
    (e, id, width, height) => {
      e.stopPropagation();

      resizeInfo.current = {
        id,
        startX: e.clientX,
        startY: e.clientY,
        startWidth: width,
        startHeight: height,
      };

      document.addEventListener("mousemove", handleMove);

      // Automatically removed after firing once
      document.addEventListener("mouseup", handleEnd, {
        once: true,
      });
    },
    [handleMove, handleEnd],
  );

  useEffect(() => {
    return () => {
      document.removeEventListener("mousemove", handleMove);
      document.removeEventListener("mouseup", handleEnd);
    };
  }, [handleMove, handleEnd]);

  return { startResize };
}
