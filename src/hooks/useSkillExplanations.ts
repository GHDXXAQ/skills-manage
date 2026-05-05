import { useEffect, useRef, useState } from "react";
import { invoke, isTauriRuntime } from "@/lib/tauri";

/**
 * Fetch AI explanations for a list of skill IDs.
 * Returns a Map<string, string> where keys are skill IDs that have cached explanations.
 */
export function useSkillExplanations(
  skillIds: string[],
  lang: string,
  refreshKey?: number,
): Map<string, string> {
  const [explanations, setExplanations] = useState<Map<string, string>>(new Map());
  const cancelledRef = useRef(false);

  useEffect(() => {
    cancelledRef.current = false;

    if (!isTauriRuntime() || skillIds.length === 0) {
      setExplanations(new Map());
      return;
    }

    invoke<Record<string, string>>("batch_get_skill_explanations", {
      skillIds,
      lang,
    })
      .then((result) => {
        if (!cancelledRef.current) {
          setExplanations(new Map(Object.entries(result)));
        }
      })
      .catch(() => {
        if (!cancelledRef.current) setExplanations(new Map());
      });

    return () => {
      cancelledRef.current = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [skillIds.join(","), lang, refreshKey]);

  return explanations;
}
