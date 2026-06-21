import { useState, useRef, useEffect, useCallback } from "react";
import Toolbar from "./components/Toolbar";
import NotesCanvas from "./components/NotesCanvas";
import { useDebounce } from "./hooks/useDebounce";
import { useHistory } from "./hooks/useHistory";
import { useDrag } from "./hooks/useDrag";
import { useResize } from "./hooks/useResize";
import { getNextPosition } from "./utils/layout";
import { loadState, saveState } from "./utils/storage";
import {
  exportNotesAsJSON,
  exportNotesAsMarkdown,
  parseImportedNotes,
} from "./utils/exportImport";
import {
  NOTE_WIDTH,
  NOTE_HEIGHT,
  NOTE_COLORS,
  DEBOUNCE_DELAY,
  SAVE_DEBOUNCE_DELAY,
} from "./constants";

function getInitialState() {
  return loadState() || {};
}

export default function App() {
  const [notes, setNotes] = useState(() => getInitialState().notes || []);
  const [input, setInput] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");
  const [darkMode, setDarkMode] = useState(() => !!getInitialState().darkMode);
  const [colorIndex, setColorIndex] = useState(
    () => getInitialState().colorIndex || 0,
  );

  const containerRef = useRef(null);
  const debouncedInput = useDebounce(input, DEBOUNCE_DELAY);

  const { undoStack, redoStack, pushAction, undo, redo } = useHistory(
    () => getInitialState().undoStack || [],
    () => getInitialState().redoStack || [],
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      saveState({ notes, undoStack, redoStack, darkMode, colorIndex });
    }, SAVE_DEBOUNCE_DELAY);
    return () => clearTimeout(timer);
  }, [notes, undoStack, redoStack, darkMode, colorIndex]);

  const handleSubmit = () => {
    const content = input.trim();
    if (!content) return;

    if (editingId) {
      setNotes((prev) =>
        prev.map((n) => (n.id === editingId ? { ...n, content } : n)),
      );
      setEditingId(null);
      setInput("");
      return;
    }

    //const containerWidth = containerRef.current ? containerRef.current.clientWidth : 800;
    //const pos = getNextPosition(notes, containerWidth);
    const container = containerRef.current;
    const containerWidth = container ? container.clientWidth : 800;
    const scrollLeft = container ? container.scrollLeft : 0;
    const scrollTop = container ? container.scrollTop : 0;
    const pos = getNextPosition(notes, containerWidth, scrollLeft, scrollTop);

    const newNote = {
      id: Date.now() + Math.random(),
      content,
      x: pos.x,
      y: pos.y,
      width: NOTE_WIDTH,
      height: NOTE_HEIGHT,
      pinned: false,
      zIndex: 1,
      color: NOTE_COLORS[colorIndex % NOTE_COLORS.length],
    };
    setColorIndex((c) => c + 1);
    setNotes((prev) => [...prev, newNote]);
    pushAction({ type: "create", note: newNote });
    setInput("");
  };

  const handleDelete = (id) => {
    const note = notes.find((n) => n.id === id);
    if (!note) return;
    setNotes((prev) => prev.filter((n) => n.id !== id));
    pushAction({ type: "delete", note });
    if (editingId === id) {
      setEditingId(null);
      setInput("");
    }
  };

  const handleEdit = (id) => {
    const note = notes.find((n) => n.id === id);
    if (!note) return;
    setInput(note.content);
    setEditingId(id);
  };

  const handleCopy = (content) => {
    navigator.clipboard?.writeText(content).catch(() => {});
  };

  const handlePin = (id) => {
    setNotes((prev) => {
      const maxZ = Math.max(0, ...prev.map((n) => n.zIndex));
      return prev.map((n) =>
        n.id === id ? { ...n, pinned: !n.pinned, zIndex: maxZ + 1 } : n,
      );
    });
  };

  const applyInverse = useCallback((action) => {
    if (action.type === "create") {
      setNotes((prev) => prev.filter((n) => n.id !== action.note.id));
    } else if (action.type === "delete") {
      setNotes((prev) => [...prev, action.note]);
    } else if (action.type === "bulk-create") {
      const ids = new Set(action.notes.map((n) => n.id));
      setNotes((prev) => prev.filter((n) => !ids.has(n.id)));
    }
  }, []);

  const applyForward = useCallback((action) => {
    if (action.type === "create") {
      setNotes((prev) => [...prev, action.note]);
    } else if (action.type === "delete") {
      setNotes((prev) => prev.filter((n) => n.id !== action.note.id));
    } else if (action.type === "bulk-create") {
      setNotes((prev) => [...prev, ...action.notes]);
    }
  }, []);

  const handleUndo = () => undo(applyInverse);
  const handleRedo = () => redo(applyForward);
  const handleExportJSON = () => exportNotesAsJSON(notes);
  const handleExportMarkdown = () => exportNotesAsMarkdown(notes);

  const handleImportFile = async (file) => {
    try {
      const text = await file.text();
      const incoming = parseImportedNotes(text);
      if (incoming.length === 0) return;

      const container = containerRef.current;
      const containerWidth = container ? container.clientWidth : 800;
      const scrollLeft = container ? container.scrollLeft : 0;
      const scrollTop = container ? container.scrollTop : 0;

      let workingNotes = notes;
      let nextColorIndex = colorIndex;
      const created = [];

      incoming.forEach((n) => {
        const pos = getNextPosition(
          workingNotes,
          containerWidth,
          scrollLeft,
          scrollTop,
        );
        const note = {
          id: Date.now() + Math.random(),
          content: n.content,
          x: pos.x,
          y: pos.y,
          width: n.width || NOTE_WIDTH,
          height: n.height || NOTE_HEIGHT,
          pinned: n.pinned,
          zIndex: 1,
          color: n.color || NOTE_COLORS[nextColorIndex % NOTE_COLORS.length],
        };
        nextColorIndex += 1;
        created.push(note);
        workingNotes = [...workingNotes, note];
      });

      setColorIndex(nextColorIndex);
      setNotes(workingNotes);
      pushAction({ type: "bulk-create", notes: created });
    } catch (err) {
      alert(err.message || "Import failed.");
    }
  };

  const bringToFront = useCallback((id) => {
    setNotes((prev) => {
      const maxZ = Math.max(0, ...prev.map((n) => n.zIndex));
      return prev.map((n) => (n.id === id ? { ...n, zIndex: maxZ + 1 } : n));
    });
  }, []);

  const { startDrag } = useDrag({
    containerRef,
    onMove: (id, x, y) =>
      setNotes((prev) => prev.map((n) => (n.id === id ? { ...n, x, y } : n))),
    onDragStart: bringToFront,
  });

  const onDragStart = (e, id) => {
    const note = notes.find((n) => n.id === id);
    if (!note) return;
    startDrag(e, id, note.x, note.y);
  };

  const { startResize } = useResize({
    onResize: (id, width, height) =>
      setNotes((prev) =>
        prev.map((n) => (n.id === id ? { ...n, width, height } : n)),
      ),
  });

  const onResizeStart = (e, id) => {
    const note = notes.find((n) => n.id === id);
    if (!note) return;
    startResize(e, id, note.width, note.height);
  };

  const filteredNotes = notes.filter((n) =>
    n.content.toLowerCase().includes(search.toLowerCase()),
  );
  const sortedNotes = [...filteredNotes].sort((a, b) =>
    a.pinned === b.pinned ? a.zIndex - b.zIndex : a.pinned ? 1 : -1,
  );

  const bg = darkMode ? "bg-gray-900" : "bg-gray-100";
  const panelBg = darkMode ? "bg-gray-800" : "bg-white";
  const textColor = darkMode ? "text-gray-100" : "text-gray-900";
  const borderColor = darkMode ? "border-gray-700" : "border-gray-300";
  const hoverBg = darkMode ? "hover:bg-gray-700" : "hover:bg-gray-200";

  return (
    <div
      className={`flex flex-col h-screen ${bg} ${textColor} transition-colors duration-300`}
    >
      <Toolbar
        input={input}
        onInputChange={setInput}
        onSubmit={handleSubmit}
        isEditing={!!editingId}
        onUndo={handleUndo}
        canUndo={undoStack.length > 0}
        onRedo={handleRedo}
        canRedo={redoStack.length > 0}
        search={search}
        onSearchChange={setSearch}
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode((d) => !d)}
        onExportJSON={handleExportJSON}
        onExportMarkdown={handleExportMarkdown}
        onImportFile={handleImportFile}
        borderColor={borderColor}
        panelBg={panelBg}
        textColor={textColor}
        hoverBg={hoverBg}
      />
      <NotesCanvas
        containerRef={containerRef}
        notes={sortedNotes}
        darkMode={darkMode}
        onDragStart={onDragStart}
        onResizeStart={onResizeStart}
        onCopy={handleCopy}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onPin={handlePin}
      />
      <div
        className={`px-4 py-1.5 text-xs ${panelBg} border-t ${borderColor} opacity-70 flex justify-between shrink-0`}
      >
        <span>
          {notes.length} note{notes.length !== 1 ? "s" : ""}
        </span>
        {debouncedInput && <span>{debouncedInput.length} chars</span>}
      </div>
    </div>
  );
}
