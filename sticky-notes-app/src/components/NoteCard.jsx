import { Copy, Pencil, Trash2, Pin } from "lucide-react";

export default function NoteCard({ note, darkMode, onDragStart, onResizeStart, onCopy, onEdit, onDelete, onPin }) {
  return (
    <div
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
      className="rounded-lg shadow-md flex flex-col select-none"
    >
      <div
        onMouseDown={(e) => onDragStart(e, note.id)}
        className="flex justify-end gap-1 p-1.5 cursor-move rounded-t-lg"
        style={{ backgroundColor: "rgba(0,0,0,0.06)" }}
      >
        <button onClick={() => onCopy(note.content)} title="Copy" className="p-1 rounded hover:bg-black/10">
          <Copy size={14} />
        </button>
        <button onClick={() => onEdit(note.id)} title="Edit" className="p-1 rounded hover:bg-black/10">
          <Pencil size={14} />
        </button>
        <button onClick={() => onPin(note.id)} title="Pin" className="p-1 rounded hover:bg-black/10">
          <Pin size={14} fill={note.pinned ? "currentColor" : "none"} />
        </button>
        <button onClick={() => onDelete(note.id)} title="Delete" className="p-1 rounded hover:bg-black/10">
          <Trash2 size={14} />
        </button>
      </div>
      <div className={`flex-1 p-3 overflow-auto text-sm whitespace-pre-wrap break-words ${darkMode ? "text-gray-100" : "text-gray-800"}`}>
        {note.content}
      </div>
      <div
        onMouseDown={(e) => onResizeStart(e, note.id)}
        className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize"
        style={{
          background: "linear-gradient(135deg, transparent 50%, rgba(0,0,0,0.3) 50%)",
          borderBottomRightRadius: "0.5rem",
        }}
      />
    </div>
  );
}
