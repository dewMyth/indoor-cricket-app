// import { useState } from "react";
// // Module has no TypeScript declarations; silence implicit any error for this import
// // @ts-ignore
// import { getMatchInsight } from "@/utils/ai-insights/getMatchInsights";

// export default function AIInsightsComponent({ matchData }: { matchData: any }) {
//   const [insight, setInsight] = useState<string>("");
//   const [loading, setLoading] = useState(false);

//   const analyze = async () => {
//     setLoading(true);

//     const result = await getMatchInsight(matchData);

//     console.log("AI Insight result:", result);

//     setInsight(result);
//     setLoading(false);
//   };

//   return (
//     <>
//       <button onClick={analyze}>Generate AI Insight</button>

//       {loading && <p>Analyzing...</p>}

//       <pre>{insight}</pre>
//     </>
//   );
// }

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
// @ts-ignore
import { getMatchInsight } from "@/utils/ai-insights/getMatchInsights";

export default function AIInsightsComponent({ matchData }: { matchData: any }) {
  const [insight, setInsight] = useState("");
  const [loading, setLoading] = useState(false);

  const analyze = async () => {
    setLoading(true);

    const result = await getMatchInsight(matchData);

    setInsight(result);
    setLoading(false);
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-4">
      <button
        onClick={analyze}
        disabled={loading}
        // Take width of the parent container, add padding, rounded corners, and a hover effect
        className="w-full rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"

        // className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? "Analyzing..." : "Generate AI Insight"}
      </button>

      {insight && (
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <article className="prose max-w-none text-gray-900">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{insight}</ReactMarkdown>
          </article>
        </div>
      )}
      {/* <div className="rounded-xl border bg-white p-6 shadow-sm">
        {loading ? (
          <div className="animate-pulse space-y-3">
            <div className="h-4 w-2/3 rounded bg-gray-200" />
            <div className="h-4 rounded bg-gray-200" />
            <div className="h-4 w-5/6 rounded bg-gray-200" />
            <div className="h-4 w-1/2 rounded bg-gray-200" />
          </div>
        ) : (
          <article className="prose max-w-none text-gray-900">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{insight}</ReactMarkdown>
          </article>
        )}
      </div> */}
    </div>
  );
}
