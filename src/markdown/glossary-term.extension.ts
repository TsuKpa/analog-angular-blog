import type { MarkedExtension, Tokens } from 'marked';

/**
 * Glossary syntax: `[[token]]` or `[[token|display text]]` becomes
 * `<span class="term" tabindex="0" data-term="token">…</span>`.
 * Analog renders markdown at build time in its Vite content plugin, so this
 * extension is registered via `content.markedOptions` in vite.config.ts.
 * Inline tokenizers never run inside code spans/blocks, so those stay literal.
 */
const escapeHtml = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

interface GlossaryTermToken extends Tokens.Generic {
  term: string;
  text: string;
}

export const glossaryTermExtension: MarkedExtension = {
  extensions: [
    {
      name: 'glossaryTerm',
      level: 'inline',
      start: (src: string) => {
        const i = src.indexOf('[[');
        return i < 0 ? undefined : i;
      },
      tokenizer(src: string) {
        const m = /^\[\[([^\]|\n]+?)(?:\|([^\]\n]+?))?\]\]/.exec(src);
        if (!m) return undefined;
        const term = m[1].trim();
        return { type: 'glossaryTerm', raw: m[0], term, text: (m[2] ?? term).trim() };
      },
      renderer(token) {
        const { term, text } = token as GlossaryTermToken;
        return `<span class="term" tabindex="0" data-term="${escapeHtml(term)}">${escapeHtml(text)}</span>`;
      },
    },
  ],
};
