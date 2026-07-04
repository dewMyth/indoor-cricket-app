// src/lib/getMatchInsight.js

import { client } from "./openai";

export async function getMatchInsight(matchData) {
  const response = await client.responses.create({
    model: "gpt-4o-mini",
    input: [
      {
        role: "system",
        content: `
  You are an expert cricket analyst.
  Provide:
  - Match summary
  - Winning factors
  - Losing factors
  - Standout performers
  - Tactical observations
  - One interesting statistic
  Only use information from the provided JSON.
  Do not invent missing information.
  Provide your analysis in plain text.

Do not use Markdown.
Do not use headings beginning with #.
Do not use **bold** or bullet point syntax.
Write in well-formatted paragraphs with numbered sections.
          `,
      },
      {
        role: "user",
        content: JSON.stringify(matchData),
      },
    ],
  });
  return response.output_text;
}
