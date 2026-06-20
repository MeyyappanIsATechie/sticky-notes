import NoteCard from "./NoteCard";

export default function NotesCanvas({ containerRef, notes, darkMode, onDragStart, onResizeStart, onCopy, onEdit, onDelete, onPin }) {
  return (
    <div ref={containerRef} className="relative flex-1 overflow-auto">
      {notes.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center opacity-40 text-sm pointer-events-none">
          No notes yet. Add one above!
        </div>
      )}
      {notes.map((note) => (
        <NoteCard
          key={note.id}
          note={note}
          darkMode={darkMode}
          onDragStart={onDragStart}
          onResizeStart={onResizeStart}
          onCopy={onCopy}
          onEdit={onEdit}
          onDelete={onDelete}
          onPin={onPin}
        />
      ))}
    </div>
  );
}
