import { client } from "./openai";

export async function roastGothaya(matchData, worstPlayer) {
  const response = await client.responses.create({
    model: "gpt-4o-mini",
    input: [
      {
        role: "system",
        content: `
        Come up with a good one liner to roast the player mentioned in the worstPlayer variable. Limit to 25 words max.
        Make it funny and witty. Always be humorous and sarcastic. Be mean as possible.
        Use matchData variable if his performance can be used to roast him.
        Try to express "He just can't walk the talk" in a funny way.
        Use cricket terminology if possible.
        He do analyzes and says lot of international matches, but can't perform.
        Try to add this when you roast him.
          `,
      },
      {
        role: "user",
        content: `This is the matchData variable: ${JSON.stringify(matchData)}`,
      },
      {
        role: "user",
        content: `This is the worstPlayer variable: ${JSON.stringify(worstPlayer)}`,
      },
    ],
  });
  return response.output_text;
}
