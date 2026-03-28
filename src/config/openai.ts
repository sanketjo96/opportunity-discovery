import OpenAI from "openai";

let openaiClient: OpenAI | null = null;

/**
 * Lazy singleton OpenAI client. Requires `OPEN_API_KEY` in the environment.
 */
export function getOpenAIClient(): OpenAI {
  const apiKey = process.env.OPEN_API_KEY;
  if (!apiKey) {
    throw new Error("OPEN_API_KEY is not set");
  }
  if (!openaiClient) {
    openaiClient = new OpenAI({ apiKey });
  }
  return openaiClient;
}
