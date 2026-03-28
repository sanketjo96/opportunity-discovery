import type { Opportunity } from "../../../types/llm/opportunity";

export const VALID_CATEGORIES = new Set<Opportunity["category"]>([
  "casting",
  "workshop",
  "music",
  "voiceover",
  "other",
]);

export function optionalTrimmedString(value: unknown): string | undefined {
  if (value === undefined || value === null) {
    return undefined;
  }
  if (typeof value !== "string") {
    return undefined;
  }
  const t = value.trim();
  return t.length > 0 ? t : undefined;
}

export function optionalStringArray(value: unknown): string[] | undefined {
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

function optionalGender(value: unknown): Opportunity["gender"] | undefined {
  if (typeof value !== "string") {
    return undefined;
  }
  if (value === "male" || value === "female" || value === "unisex") {
    return value;
  }
  return undefined;
}

export function toOpportunity(parsed: unknown): Opportunity {
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
    throw new Error(
      "LLM JSON: category must be casting, workshop, music, voiceover, or other"
    );
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

  const gender = optionalGender(obj.gender);
  if (gender) {
    opportunity.gender = gender;
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

  const date = optionalTrimmedString(obj.date);
  if (date) {
    opportunity.date = date;
  }

  return opportunity;
}
