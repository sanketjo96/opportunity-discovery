export const OPPORTUNITY_JSON_SCHEMA = `{
  "title": string (required, short headline),
  "category": "casting" | "workshop" | music | voiceover | "other" (required),
  "roles": string[] (optional, character or job roles if mentioned),
  "ageRange": string (optional, e.g. "18-25"),
  "gender": "male" | "female" | "unisex" (optional),
  "location": string (optional),
  "language": string (optional),
  "description": string (required, concise summary of the opportunity),
  "email": string (optional, single email if present),
  "url": string (optional, full URL if present, e.g. https://...),
  "contact": string (optional, phone/WhatsApp/social handle if present and not already in email or url),
  "date": string (optional, as stated in the text)
}`;

export const SYSTEM_PROMPT = `You extract casting calls, workshops, and similar opportunities from unstructured text.

Return a single JSON object that matches this shape exactly (omit optional keys if unknown):
${OPPORTUNITY_JSON_SCHEMA}

Rules:
- Infer category: casting for auditions/roles; workshop for classes/training; music for music opportunities; voiceover for voiceover opportunities; otherwise other.
- Infer gender: male for male opportunities; female for female opportunities; unisex for unisex opportunities; otherwise undefined.
- Infer age range: if mentioned, use the age range as stated in the text; otherwise undefined.
- Put email addresses in email, links in url, and other contact channels in contact.
- Use only information supported by the text; do not invent emails, URLs, contacts, or dates.
- Output must be valid JSON only: no markdown, no code fences, no commentary before or after the object.`;
