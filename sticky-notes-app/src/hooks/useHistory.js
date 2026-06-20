import { useState, useCallback, useEffect, useRef } from "react";

export function useHistory(initialUndo = [], initialRedo = []) {
  const [undoStack, setUndoStack] = useState(initialUndo);
  const [redoStack, setRedoStack] = useState(initialRedo);

  const undoRef = useRef(undoStack);
  const redoRef = useRef(redoStack);
  useEffect(() => {
    undoRef.current = undoStack;
    redoRef.current = redoStack;
  }, [undoStack, redoStack]);

  const pushAction = useCallback((action) => {
    setUndoStack((prev) => [...prev, action]);
    setRedoStack([]);
  }, []);

  const undo = useCallback((applyInverse) => {
    const stack = undoRef.current;
    if (stack.length === 0) return;
    const action = stack[stack.length - 1];
    applyInverse(action);
    setUndoStack(stack.slice(0, -1));
    setRedoStack((prev) => [...prev, action]);
  }, []);

  const redo = useCallback((applyForward) => {
    const stack = redoRef.current;
    if (stack.length === 0) return;
    const action = stack[stack.length - 1];
    applyForward(action);
    setRedoStack(stack.slice(0, -1));
    setUndoStack((prev) => [...prev, action]);
  }, []);

  return {
    undoStack,
    redoStack,
    pushAction,
    undo,
    redo,
    setUndoStack,
    setRedoStack,
  };
}
