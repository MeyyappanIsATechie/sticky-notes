import { useState, useRef } from "react";
import {
  Plus,
  Undo2,
  Redo2,
  Search,
  Moon,
  Sun,
  Download,
  Upload,
} from "lucide-react";

export default function Toolbar({
  input,
  onInputChange,
  onSubmit,
  isEditing,
  onUndo,
  canUndo,
  onRedo,
  canRedo,
  search,
  onSearchChange,
  darkMode,
  onToggleDarkMode,
  onExportJSON,
  onExportMarkdown,
  onImportFile,
  borderColor,
  panelBg,
  textColor,
  hoverBg,
}) {
  const [showExportMenu, setShowExportMenu] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) onImportFile(file);
    e.target.value = ""; // allow re-importing the same filename later
  };

  return (
    <div
      className={`flex flex-wrap items-center gap-2 p-4 ${panelBg} border-b ${borderColor} shadow-sm z-50 shrink-0`}
    >
      <input
        type="text"
        value={input}
        onChange={(e) => onInputChange(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && onSubmit()}
        placeholder={isEditing ? "Edit note..." : "Write a note..."}
        className={`flex-1 min-w-[200px] px-3 py-2 rounded-lg border ${borderColor} ${panelBg} ${textColor} focus:outline-none focus:ring-2 focus:ring-blue-400`}
      />
      <button
        onClick={onSubmit}
        className="flex items-center gap-1 px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors"
      >
        <Plus size={16} /> {isEditing ? "Update" : "Add"}
      </button>
      <button
        onClick={onUndo}
        disabled={!canUndo}
        className={`p-2 rounded-lg border ${borderColor} disabled:opacity-30 ${hoverBg}`}
        title="Undo"
      >
        <Undo2 size={18} />
      </button>
      <button
        onClick={onRedo}
        disabled={!canRedo}
        className={`p-2 rounded-lg border ${borderColor} disabled:opacity-30 ${hoverBg}`}
        title="Redo"
      >
        <Redo2 size={18} />
      </button>
      <div className="relative">
        <Search
          size={16}
          className="absolute left-2 top-1/2 -translate-y-1/2 opacity-50"
        />
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search notes..."
          className={`pl-8 pr-3 py-2 rounded-lg border ${borderColor} ${panelBg} ${textColor} focus:outline-none focus:ring-2 focus:ring-blue-400 w-48`}
        />
      </div>

      <div className="relative">
        <button
          onClick={() => setShowExportMenu((v) => !v)}
          className={`p-2 rounded-lg border ${borderColor} ${hoverBg}`}
          title="Export notes"
        >
          <Download size={18} />
        </button>
        {showExportMenu && (
          <div
            className={`absolute right-0 mt-1 w-44 rounded-lg border ${borderColor} ${panelBg} shadow-lg z-50 overflow-hidden`}
          >
            <button
              onClick={() => {
                onExportJSON();
                setShowExportMenu(false);
              }}
              className={`block w-full text-left px-3 py-2 text-sm ${textColor} ${hoverBg}`}
            >
              Export as JSON
            </button>
            <button
              onClick={() => {
                onExportMarkdown();
                setShowExportMenu(false);
              }}
              className={`block w-full text-left px-3 py-2 text-sm ${textColor} ${hoverBg}`}
            >
              Export as Markdown
            </button>
          </div>
        )}
      </div>

      <button
        onClick={() => fileInputRef.current?.click()}
        className={`p-2 rounded-lg border ${borderColor} ${hoverBg}`}
        title="Import notes (JSON)"
      >
        <Upload size={18} />
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept=".json,application/json"
        onChange={handleFileChange}
        className="hidden"
      />

      <button
        onClick={onToggleDarkMode}
        className={`p-2 rounded-lg border ${borderColor} ${hoverBg}`}
        title="Toggle dark mode"
      >
        {darkMode ? <Sun size={18} /> : <Moon size={18} />}
      </button>
    </div>
  );
}
