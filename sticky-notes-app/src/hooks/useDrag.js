import { useRef, useCallback, useEffect } from "react";

export function useDrag({ containerRef, onMove, onDragStart }) {
  const dragInfo = useRef(null);

  const handleMove = useCallback(
    (e) => {
      const info = dragInfo.current;
      const container = containerRef.current;

      if (!info || !container) return;

      const rect = container.getBoundingClientRect();

      const x = Math.max(
        0,
        e.clientX - rect.left - info.offsetX + container.scrollLeft,
      );

      const y = Math.max(
        0,
        e.clientY - rect.top - info.offsetY + container.scrollTop,
      );

      onMove(info.id, x, y);
    },
    [containerRef, onMove],
  );

  const handleEnd = useCallback(() => {
    dragInfo.current = null;
    document.removeEventListener("mousemove", handleMove);
  }, [handleMove]);

  const startDrag = useCallback(
    (e, id, noteX, noteY) => {
      const container = containerRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();

      dragInfo.current = {
        id,
        offsetX: e.clientX - rect.left - noteX + container.scrollLeft,
        offsetY: e.clientY - rect.top - noteY + container.scrollTop,
      };

      onDragStart?.(id);

      document.addEventListener("mousemove", handleMove);

      // Automatically removed after first mouseup
      document.addEventListener("mouseup", handleEnd, { once: true });
    },
    [containerRef, onDragStart, handleMove, handleEnd],
  );

  useEffect(() => {
    return () => {
      document.removeEventListener("mousemove", handleMove);
      document.removeEventListener("mouseup", handleEnd);
    };
  }, [handleMove, handleEnd]);

  return { startDrag };
}
