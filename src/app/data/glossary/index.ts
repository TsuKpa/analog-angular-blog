import { COMMON_GLOSSARY } from './common';
import { AI_AGENT_PART_1_GLOSSARY } from './ai-agent-a-to-z-part-1';
import { AI_AGENT_PART_2_GLOSSARY } from './ai-agent-a-to-z-part-2';
import { AI_AGENT_PART_3_GLOSSARY } from './ai-agent-a-to-z-part-3';
import { EXTRA_GLOSSARY } from './extra';
import { Glossary } from './types';

export type { Glossary, GlossaryEntry } from './types';

/**
 * Hover-dictionary terms, keyed by the id used in `[[id]]` / `data-term`.
 * Split per post; a term used by several posts lives in common.ts.
 */
export const GLOSSARY: Glossary = {
  ...COMMON_GLOSSARY,
  ...AI_AGENT_PART_1_GLOSSARY,
  ...AI_AGENT_PART_2_GLOSSARY,
  ...AI_AGENT_PART_3_GLOSSARY,
  ...EXTRA_GLOSSARY,
};
