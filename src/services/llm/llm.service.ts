import { getOpenAIClient } from "../../config/openai";
import type { Opportunity } from "../../types/llm/opportunity";
import { toOpportunity } from "./helpers/opportunityJson.helpers";
import { SYSTEM_PROMPT } from "./prompts/extractOpportunity.prompt";

/**
 * Calls OpenAI to extract a structured {@link Opportunity} from free-form text.
 * Uses JSON response mode so the model returns parseable JSON only.
 */
export async function extractOpportunity(text: string): Promise<Opportunity> {
  const client = getOpenAIClient();

  const completion = await client.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0.2,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      {
        role: "user",
        content: `Extract the opportunity from the following text and respond with JSON only (one object).\n\n---\n${text}\n---`,
      },
    ],
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) {
    throw new Error("OpenAI returned an empty completion");
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(content) as unknown;
  } catch {
    throw new Error("OpenAI completion was not valid JSON");
  }

  return toOpportunity(parsed);
}
