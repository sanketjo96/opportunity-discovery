export type Opportunity = {
  title: string;
  category: "casting" | "workshop" | "music" | "voiceover" | "other";
  gender?: "male" | "female" | "unisex";
  roles?: string[];
  ageRange?: string;
  location?: string;
  language?: string;
  description: string;
  email?: string;
  url?: string;
  contact?: string;
  date?: string;
};
