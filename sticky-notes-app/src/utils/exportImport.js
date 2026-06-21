export function notesToJSON(notes) {
  return JSON.stringify(notes, null, 2);
}

export function notesToMarkdown(notes) {
  if (notes.length === 0) return "# Sticky Notes\n\n_No notes yet._\n";
  const lines = ["# Sticky Notes", ""];
  notes
    .slice()
    .sort((a, b) => (a.pinned === b.pinned ? 0 : a.pinned ? -1 : 1))
    .forEach((n, i) => {
      lines.push(`## Note ${i + 1}${n.pinned ? " 📌" : ""}`);
      lines.push("");
      lines.push(n.content);
      lines.push("");
    });
  return lines.join("\n");
}

export function downloadFile(filename, content, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function exportNotesAsJSON(notes) {
  downloadFile(
    "sticky-notes-export.json",
    notesToJSON(notes),
    "application/json",
  );
}

export function exportNotesAsMarkdown(notes) {
  downloadFile(
    "sticky-notes-export.md",
    notesToMarkdown(notes),
    "text/markdown",
  );
}

// Validates and normalizes notes parsed from an imported JSON file.
// Malformed entries are dropped rather than failing the whole import.
export function parseImportedNotes(fileText) {
  let parsed;
  try {
    parsed = JSON.parse(fileText);
  } catch {
    throw new Error("That file isn't valid JSON.");
  }
  if (!Array.isArray(parsed)) {
    throw new Error("Expected a JSON array of notes.");
  }
  return parsed
    .filter(
      (n) => n && typeof n.content === "string" && n.content.trim().length > 0,
    )
    .map((n) => ({
      content: n.content,
      color: typeof n.color === "string" ? n.color : null,
      pinned: !!n.pinned,
      width: typeof n.width === "number" ? n.width : null,
      height: typeof n.height === "number" ? n.height : null,
    }));
}
