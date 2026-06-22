import { useCallback, useRef, useState } from "react";

const AUTO_ADVANCE_MS = 1000;

export function useAutoAdvance<T extends string | number>(onAdvance: (value: T) => void | Promise<void>) {
  const [pending, setPending] = useState<T | null>(null);
  const [locked, setLocked] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const select = useCallback(
    (value: T) => {
      if (locked || pending != null) return;
      setPending(value);
      setLocked(true);
      timerRef.current = setTimeout(async () => {
        try {
          await onAdvance(value);
        } finally {
          setPending(null);
          setLocked(false);
        }
      }, AUTO_ADVANCE_MS);
    },
    [locked, pending, onAdvance],
  );

  return { pending, locked, select };
}
