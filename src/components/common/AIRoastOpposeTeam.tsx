import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
// @ts-ignore
import { appreciateMyTeam } from "@/utils/ai-insights/appreciateMyTeam";

export default function AIRoastOpposingTeamComponent({
  matchData,
}: {
  matchData: any;
}) {
  const [insight, setInsight] = useState("");
  const [loading, setLoading] = useState(false);

  const analyze = async () => {
    setLoading(true);

    const result = await appreciateMyTeam(matchData);

    if (result) {
      setInsight(result);
    }
    setLoading(false);
  };

  useEffect(() => {
    analyze();
  }, [matchData]);

  return (
    <div className="w-full max-w-3xl mx-auto space-y-4">
      {insight && (
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <article className="prose max-w-none text-gray-900">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{insight}</ReactMarkdown>
          </article>
        </div>
      )}
    </div>
  );
}
