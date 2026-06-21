import { useEffect, useRef, useState } from "react";
import { motion, useAnimationControls } from "framer-motion";
import { Copy, Pencil, Trash2, Pin } from "lucide-react";

export default function NoteCard({
  note,
  darkMode,
  onDragStart,
  onResizeStart,
  onCopy,
  onEdit,
  onDelete,
  onPin,
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const controls = useAnimationControls();
  const prevPinned = useRef(note.pinned);

  useEffect(() => {
    controls.start({
      opacity: 1,
      scale: isDragging ? 1.04 : 1,
      boxShadow: isDragging
        ? "0 16px 28px rgba(0,0,0,0.28)"
        : note.pinned
          ? "0 4px 10px rgba(245,158,11,0.35)"
          : "0 2px 6px rgba(0,0,0,0.12)",
      transition: { type: "spring", stiffness: 350, damping: 26 },
    });
  }, [isDragging, note.pinned, controls]);

  useEffect(() => {
    if (note.pinned && !prevPinned.current) {
      controls.start({
        scale: [1, 1.1, 1],
        transition: { duration: 0.35, ease: "easeOut" },
      });
    }
    prevPinned.current = note.pinned;
  }, [note.pinned, controls]);

  const handleDragStart = (e) => {
    if (note.pinned) return;
    setIsDragging(true);
    onDragStart(e, note.id);
    const stop = () => {
      setIsDragging(false);
      document.removeEventListener("mouseup", stop);
    };
    document.addEventListener("mouseup", stop);
  };

  const handleResizeStart = (e) => {
    setIsResizing(true);
    onResizeStart(e, note.id);
    const stop = () => {
      setIsResizing(false);
      document.removeEventListener("mouseup", stop);
    };
    document.addEventListener("mouseup", stop);
  };

  return (
    <motion.div
      layout={isDragging || isResizing ? false : true}
      initial={{ opacity: 0, scale: 0.85 }}
      animate={controls}
      exit={{ opacity: 0, scale: 0.85, transition: { duration: 0.18 } }}
      style={{
        position: "absolute",
        left: note.x,
        top: note.y,
        width: note.width,
        height: note.height,
        backgroundColor: darkMode ? "#374151" : note.color,
        zIndex: note.pinned ? 1000 + note.zIndex : note.zIndex,
        border: note.pinned ? "2px solid #f59e0b" : "1px solid rgba(0,0,0,0.1)",
      }}
      className="rounded-lg flex flex-col select-none"
    >
      <div
        onMouseDown={handleDragStart}
        className={`flex justify-end gap-1 p-1.5 rounded-t-lg ${note.pinned ? "cursor-default" : "cursor-move"}`}
        style={{ backgroundColor: "rgba(0,0,0,0.06)" }}
      >
        <button
          onClick={() => onCopy(note.content)}
          title="Copy"
          className="p-1 rounded hover:bg-black/10"
        >
          <Copy size={14} />
        </button>
        <button
          onClick={() => onEdit(note.id)}
          title="Edit"
          className="p-1 rounded hover:bg-black/10"
        >
          <Pencil size={14} />
        </button>
        <button
          onClick={() => onPin(note.id)}
          title="Pin"
          className="p-1 rounded hover:bg-black/10"
        >
          <Pin size={14} fill={note.pinned ? "currentColor" : "none"} />
        </button>
        <button
          onClick={() => onDelete(note.id)}
          title="Delete"
          className="p-1 rounded hover:bg-black/10"
        >
          <Trash2 size={14} />
        </button>
      </div>
      <div
        className={`flex-1 p-3 overflow-auto text-sm whitespace-pre-wrap break-words ${darkMode ? "text-gray-100" : "text-gray-800"}`}
      >
        {note.content}
      </div>
      {!note.pinned && (
        <div
          onMouseDown={handleResizeStart}
          className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize"
          style={{
            background:
              "linear-gradient(135deg, transparent 50%, rgba(0,0,0,0.3) 50%)",
            borderBottomRightRadius: "0.5rem",
          }}
        />
      )}
    </motion.div>
  );
}
