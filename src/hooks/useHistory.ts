import { useState, useCallback } from "react";
import { useHotkeys } from "react-hotkeys-hook";

type HistoryState<T> = {
  past: T[];
  present: T;
  future: T[];
};

export const useHistory = <T>(initialState: T) => {
  const [history, setHistory] = useState<HistoryState<T>>({
    past: [],
    present: initialState,
    future: [],
  });

  const canUndo = history.past.length > 0;
  const canRedo = history.future.length > 0;

  const undo = useCallback(() => {
    if (!canUndo) return;

    setHistory((currentHistory) => {
      const newPast = currentHistory.past.slice(
        0,
        currentHistory.past.length - 1
      );
      const newPresent = currentHistory.past[currentHistory.past.length - 1];
      const newFuture = [currentHistory.present, ...currentHistory.future];

      return {
        past: newPast,
        present: newPresent,
        future: newFuture,
      };
    });
  }, [canUndo]);

  const redo = useCallback(() => {
    if (!canRedo) return;

    setHistory((currentHistory) => {
      const newPast = [...currentHistory.past, currentHistory.present];
      const newPresent = currentHistory.future[0];
      const newFuture = currentHistory.future.slice(1);

      return {
        past: newPast,
        present: newPresent,
        future: newFuture,
      };
    });
  }, [canRedo]);

  const setState = useCallback((action: T | ((currentState: T) => T)) => {
    setHistory((currentHistory) => {
      const newPresent =
        typeof action === "function"
          ? (action as (currentState: T) => T)(currentHistory.present)
          : action;

      if (
        JSON.stringify(newPresent) === JSON.stringify(currentHistory.present)
      ) {
        return currentHistory;
      }

      const newPast = [...currentHistory.past, currentHistory.present];

      return {
        past: newPast,
        present: newPresent,
        future: [],
      };
    });
  }, []);

  const clear = useCallback(() => {
    setHistory({
      past: [],
      present: initialState,
      future: [],
    });
  }, [initialState]);

  useHotkeys(
    "ctrl+z",
    (event) => {
      event.preventDefault();
      undo();
    },
    {
      enabled: canUndo,
    }
  );

  useHotkeys(
    "ctrl+y, ctrl+shift+z",
    (event) => {
      event.preventDefault();
      redo();
    },
    {
      enabled: canRedo,
    }
  );

  return {
    state: history.present,
    setState,
    undo,
    redo,
    clear,
    canUndo,
    canRedo,
  };
};
