import { NOTE_WIDTH, NOTE_HEIGHT, GRID_GAP } from "../constants";

function rectsOverlap(a, b, gap = 0) {
  return !(
    a.x + a.width + gap <= b.x ||
    b.x + b.width + gap <= a.x ||
    a.y + a.height + gap <= b.y ||
    b.y + b.height + gap <= a.y
  );
}

export function getNextPosition(
  notes,
  containerWidth = 800,
  scrollLeft = 0,
  scrollTop = 0,
) {
  const width = NOTE_WIDTH;
  const height = NOTE_HEIGHT;

  // Candidate anchor points: viewport origin, plus the right edge and
  // bottom edge of every existing note. These are the only spots a new
  // rectangle could start without immediately overlapping something —
  // the same corner-point heuristic used in 2D rectangle packing.
  const candidates = [{ x: scrollLeft + GRID_GAP, y: scrollTop + GRID_GAP }];
  notes.forEach((n) => {
    candidates.push({ x: n.x + n.width + GRID_GAP, y: n.y });
    candidates.push({ x: n.x, y: n.y + n.height + GRID_GAP });
  });

  const maxX =
    scrollLeft + Math.max(containerWidth - width - GRID_GAP, GRID_GAP);

  const valid = candidates
    .map((c) => ({
      x: Math.max(c.x, scrollLeft + GRID_GAP),
      y: Math.max(c.y, scrollTop + GRID_GAP),
    }))
    .filter((c) => c.x <= maxX)
    .filter((c) => {
      const rect = { x: c.x, y: c.y, width, height };
      return !notes.some((n) =>
        rectsOverlap(
          rect,
          { x: n.x, y: n.y, width: n.width, height: n.height },
          GRID_GAP,
        ),
      );
    });

  if (valid.length === 0) {
    // Board is fully packed at this width — stack below everything.
    const maxBottom = notes.reduce(
      (m, n) => Math.max(m, n.y + n.height),
      scrollTop,
    );
    return { x: scrollLeft + GRID_GAP, y: maxBottom + GRID_GAP };
  }

  // Prefer the topmost candidate, then leftmost — keeps the layout
  // compact and fills gaps instead of scattering notes around.
  valid.sort((a, b) => (a.y === b.y ? a.x - b.x : a.y - b.y));
  return valid[0];
}

export function pickColor(index, colors) {
  return colors[index % colors.length];
}
