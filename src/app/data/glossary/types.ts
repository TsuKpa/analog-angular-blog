export interface GlossaryEntry {
  title: string;
  definition: string;
  example?: string;
  category: string;
}

export type Glossary = Record<string, GlossaryEntry>;
