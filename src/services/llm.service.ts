import OpenAI from "openai";

import type { Opportunity } from "../types/opportunity";

const OPPORTUNITY_JSON_SCHEMA = `{
  "title": string (required, short headline),
  "category": "casting" | "workshop" | "other" (required),
  "roles": string[] (optional, character or job roles if mentioned),
  "ageRange": string (optional, e.g. "18-25"),
  "location": string (optional),
  "language": string (optional),
  "description": string (required, concise summary of the opportunity),
  "email": string (optional, single email if present),
  "url": string (optional, full URL if present, e.g. https://...),
  "contact": string (optional, phone/WhatsApp/social handle if present and not already in email or url),
  "deadline": string (optional, as stated in the text)
}`;

const SYSTEM_PROMPT = `You extract casting calls, workshops, and similar opportunities from unstructured text.

Return a single JSON object that matches this shape exactly (omit optional keys if unknown):
${OPPORTUNITY_JSON_SCHEMA}

Rules:
- Infer category: casting for auditions/roles; workshop for classes/training; otherwise other.
- Put email addresses in email, links in url, and other contact channels in contact.
- Use only information supported by the text; do not invent emails, URLs, contacts, or deadlines.
- Output must be valid JSON only: no markdown, no code fences, no commentary before or after the object.`;

const VALID_CATEGORIES = new Set<Opportunity["category"]>([
  "casting",
  "workshop",
  "other",
]);

let openaiClient: OpenAI | null = null;

function getClient(): OpenAI {
  const apiKey = process.env.OPEN_API_KEY;
  if (!apiKey) {
    throw new Error("OPEN_API_KEY is not set");
  }
  if (!openaiClient) {
    openaiClient = new OpenAI({ apiKey });
  }
  return openaiClient;
}

function optionalTrimmedString(value: unknown): string | undefined {
  if (value === undefined || value === null) {
    return undefined;
  }
  if (typeof value !== "string") {
    return undefined;
  }
  const t = value.trim();
  return t.length > 0 ? t : undefined;
}

function optionalStringArray(value: unknown): string[] | undefined {
  if (value === undefined || value === null) {
    return undefined;
  }
  if (!Array.isArray(value)) {
    throw new Error("LLM JSON: roles must be an array of strings when present");
  }
  const roles = value
    .filter((item): item is string => typeof item === "string")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
  return roles.length > 0 ? roles : undefined;
}

function toOpportunity(parsed: unknown): Opportunity {
  if (typeof parsed !== "object" || parsed === null) {
    throw new Error("LLM returned invalid JSON root");
  }

  const obj = parsed as Record<string, unknown>;

  const title = optionalTrimmedString(obj.title);
  const description = optionalTrimmedString(obj.description);
  const category = obj.category;

  if (!title) {
    throw new Error("LLM JSON: missing or empty title");
  }
  if (!description) {
    throw new Error("LLM JSON: missing or empty description");
  }
  if (typeof category !== "string" || !VALID_CATEGORIES.has(category as Opportunity["category"])) {
    throw new Error("LLM JSON: category must be casting, workshop, or other");
  }

  const opportunity: Opportunity = {
    title,
    category: category as Opportunity["category"],
    description,
  };

  const roles = optionalStringArray(obj.roles);
  if (roles) {
    opportunity.roles = roles;
  }

  const ageRange = optionalTrimmedString(obj.ageRange);
  if (ageRange) {
    opportunity.ageRange = ageRange;
  }

  const location = optionalTrimmedString(obj.location);
  if (location) {
    opportunity.location = location;
  }

  const language = optionalTrimmedString(obj.language);
  if (language) {
    opportunity.language = language;
  }

  const email = optionalTrimmedString(obj.email);
  if (email) {
    opportunity.email = email;
  }

  const url = optionalTrimmedString(obj.url);
  if (url) {
    opportunity.url = url;
  }

  const contact = optionalTrimmedString(obj.contact);
  if (contact) {
    opportunity.contact = contact;
  }

  const deadline = optionalTrimmedString(obj.deadline);
  if (deadline) {
    opportunity.deadline = deadline;
  }

  return opportunity;
}

/**
 * Calls OpenAI to extract a structured {@link Opportunity} from free-form text.
 * Uses JSON response mode so the model returns parseable JSON only.
 */
export async function extractOpportunity(text: string): Promise<Opportunity> {
  const client = getClient();

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
