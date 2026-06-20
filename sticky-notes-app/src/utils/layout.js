import { NOTE_WIDTH, NOTE_HEIGHT, GRID_GAP } from "../constants";

export function getNextPosition(notes, containerWidth = 800) {
  const cols = Math.max(
    1,
    Math.floor((containerWidth - GRID_GAP) / (NOTE_WIDTH + GRID_GAP)),
  );
  let index = 0;
  while (index < 2000) {
    const x = GRID_GAP + (index % cols) * (NOTE_WIDTH + GRID_GAP);
    const y = GRID_GAP + Math.floor(index / cols) * (NOTE_HEIGHT + GRID_GAP);
    const occupied = notes.some(
      (n) => Math.abs(n.x - x) < 10 && Math.abs(n.y - y) < 10,
    );
    if (!occupied) return { x, y };
    index += 1;
  }
  return { x: GRID_GAP, y: GRID_GAP };
}

export function pickColor(index, colors) {
  return colors[index % colors.length];
}
