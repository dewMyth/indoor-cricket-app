import { useState, useEffect } from "react";
// @ts-ignore
import { roastGothaya } from "@/utils/ai-insights/roastGothaya";

export default function AIRoastGothayaComponent({
  matchData,
  worstPlayer,
}: {
  matchData: any;
  worstPlayer: string;
}) {
  const [insight, setInsight] = useState("");
  const [loading, setLoading] = useState(false);

  const analyze = async () => {
    setLoading(true);

    const result = await roastGothaya(matchData, worstPlayer);

    if (result) {
      setInsight(result);
    }
    setLoading(false);
  };

  useEffect(() => {
    analyze();
  }, [matchData, worstPlayer]);

  return <>{insight}</>;
}
