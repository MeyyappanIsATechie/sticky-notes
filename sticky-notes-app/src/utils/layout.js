import { NOTE_WIDTH, NOTE_HEIGHT, GRID_GAP } from "../constants";

function rectsOverlap(a, b) {
  return !(
    a.x + a.width <= b.x ||
    b.x + b.width <= a.x ||
    a.y + a.height <= b.y ||
    b.y + b.height <= a.y
  );
}

export function getNextPosition(
  notes,
  containerWidth = 800,
  scrollLeft = 0,
  scrollTop = 0,
) {
  const cols = Math.max(
    1,
    Math.floor((containerWidth - GRID_GAP) / (NOTE_WIDTH + GRID_GAP)),
  );
  let index = 0;
  while (index < 2000) {
    const x = scrollLeft + GRID_GAP + (index % cols) * (NOTE_WIDTH + GRID_GAP);
    const y =
      scrollTop +
      GRID_GAP +
      Math.floor(index / cols) * (NOTE_HEIGHT + GRID_GAP);
    const candidate = { x, y, width: NOTE_WIDTH, height: NOTE_HEIGHT };

    const occupied = notes.some((n) =>
      rectsOverlap(candidate, {
        x: n.x,
        y: n.y,
        width: n.width,
        height: n.height,
      }),
    );

    if (!occupied) return { x, y };
    index += 1;
  }
  return { x: scrollLeft + GRID_GAP, y: scrollTop + GRID_GAP };
}

export function pickColor(index, colors) {
  return colors[index % colors.length];
}
