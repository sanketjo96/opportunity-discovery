export type Opportunity = {
  title: string;
  category: "casting" | "workshop" | "other";
  roles?: string[];
  ageRange?: string;
  location?: string;
  language?: string;
  description: string;
  email?: string;
  url?: string;
  contact?: string;
  deadline?: string;
};
