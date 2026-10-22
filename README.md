# analog-angular-blog

Personal blog ([nqnam.dev](https://nqnam.dev)) built with Analog.js 1.18, Angular 20 and Tailwind v4. Posts are markdown files in `src/content/`, prerendered at build time.

```bash
npm run dev         # dev server
npx ng build        # full build + prerender (output in dist/analog/public)
```

## Writing a post

This section is the guide for anyone (human or AI agent) formatting a new post. The "AI Agent từ A đến Z" series (`src/content/ai-agent-a-to-z-part-{1,2,3}.md`) is the reference example of every feature below.

### How rendering works (read first)

- Markdown is converted to HTML **at build time** by `marked` inside Analog's Vite content plugin (`vite.config.ts` → `content.markedOptions`). Custom markdown syntax must be registered there, not in `app.config.ts`.
- Raw HTML in markdown is kept as-is. Angular components written in markdown do **not** run. Interactivity comes from directives on the `.blog-content` wrapper in `src/app/pages/blog/[slug].page.ts` that post-process the rendered DOM in the browser.
- Styles for content blocks live in `src/app/styles/content-blocks.css` and `src/app/styles/glossary.css`, scoped to `.blog-content`, with light and dark (`.dark` on `<html>`) variants. Match the blog look: Nunito font, Tailwind grays, blue accent. Do not bring in other fonts or color themes.

### HTML block rules

These two rules cause almost every rendering bug:

1. Put a **blank line before and after** every HTML block.
2. **No blank lines inside** an HTML block (especially SVG). A blank line ends the block and the rest is printed as text. If you need markdown inside an HTML block, it must be surrounded by blank lines, and that is the only exception.

### File skeleton

```markdown
---
title: >
    Post title
description: >
    One or two sentence summary.
authors:
  - Nam Nguyen (TsuKpa)
createdDate: 22 Oct, 2026
lastmod: 2026-10-22T09:00:00.000Z
tags:
  - VietNamese
  - AI
topics:
  - blog
tweet:
format: blog
canonical_url:
photo: /blog/images/<folder>/cover.png
seo:
  metatitle: >
    Post title
  metadescription: >
    Same as description.
publish: true
---

![background](/blog/images/<folder>/cover.png)

Intro paragraph(s).

Mấy từ có gạch chấm bên dưới là thuật ngữ nha, rê chuột (hoặc chạm trên điện thoại) vào là hiện giải nghĩa ngắn :D

## 1. First section
...

## N. Tổng kết

________________

**Series ...:**          <- only for series posts

- [Phần I: ...](/blog/<slug-1>)
- **Phần II: ...** (bài này)

**Nguồn tham khảo:** [Title](url), [Title](url), ...
```

Conventions:

- The slug is the file name (or `slug:` in frontmatter). `draft: true` excludes a post from prerender.
- Number `##` headings (`## 1.`, `### 1.1.`). The table of contents is built from the headings automatically.
- Sources go in one plain **Nguồn tham khảo:** line at the end. There is no separate sources component.
- Do not add a "glossary / thuật ngữ" section at the end. Definitions are attached to the words instead (next section).
- Prefer the HTML diagrams and widgets below over screenshots/PNG diagrams. Only the cover image should be a `.png`.
- In-site links (e.g. series links) use the router and scroll to the top automatically.

### Hover dictionary (glossary terms)

Readers hover (or tap on mobile) a dotted-underlined word to see its definition.

```markdown
[[token]]                      -> shows the word "token"
[[context-window|Context]]     -> shows "Context", definition of context-window
```

- Inside a raw HTML block, `[[...]]` is not parsed. Use `<span class="term" tabindex="0" data-term="token">token</span>`.
- Inside a markdown table cell, escape the pipe: `[[context-window\|Context]]`.
- Never put terms in headings: the table of contents would show the raw `[[...]]`.
- Wrap only the **first occurrence of a term in each `##` section**, not every occurrence. Skip code, links and headings.
- If a word only appears in a heading, add a few words to the first paragraph so it can be wrapped (e.g. "Đây là giai đoạn [[pretraining]], ...").

Definitions live in `src/app/data/glossary/`:

| File | Content |
|---|---|
| `common.ts` | terms used by more than one post |
| `<post-slug>.ts` | terms used only by that post (e.g. `ai-agent-a-to-z-part-1.ts`) |
| `extra.ts` | terms not used by any post yet, available for new posts |
| `index.ts` | merges all files into `GLOSSARY` |
| `types.ts` | `GlossaryEntry` type |

Entry format (Vietnamese, plain language, `example` is shown as "Ví dụ: ..."):

```ts
"context-window": {
  title: "Context window",
  definition: "Lượng token tối đa model nhìn thấy trong một lần gọi, tính cả câu hỏi lẫn câu trả lời.",
  example: "mặt bàn làm việc chỉ để được chừng ấy giấy.",
  category: "A. Nền tảng",
},
```

For a new post: reuse existing ids first (search all files in `src/app/data/glossary/`). If a term you need already lives in another post's file, move it to `common.ts`. Pick it out of `extra.ts` into your post's file when you use it. New terms go in a new `<post-slug>.ts`, which must be added to `index.ts`. Ids must be unique across all files (a later file in `index.ts` silently overrides an earlier one). An unknown id renders as plain text and logs a warning in dev.

### Content blocks (raw HTML + CSS classes)

Full copy-paste examples: [`docs/content-components.md`](docs/content-components.md).

| Block | Markup |
|---|---|
| Callout | `<div class="callout">` + optional `<span class="callout-title">`; variants `callout--warn` (darker blue, for "important"), `callout--tip` |
| Analogy ("Ví von") | `<p class="analogy">...</p>`; custom label with `data-label="Ví dụ"` |
| TL;DR numbered cards | `<ol class="tldr"><li>...</li></ol>` (raw `<li>`, not markdown list) |
| Cards grid | `<div class="cards"><div class="card"><span class="card-kicker">Bước 1</span><h4>...</h4><p>...</p></div></div>` |
| Badges | `<span class="pill pill--ok">` / `--warn` / `--bad`, `<span class="tier">` |
| Bordered table | `<div class="table-wrap">` around a markdown table (blank lines inside) |
| Compact table | `<div class="table-sm">` around a dense markdown table (smaller font, tighter cells; blank lines inside) |
| Diagram | `<figure><div class="figure-diagram [figure-diagram--wide\|--mid]"><svg>...</svg></div><figcaption>...</figcaption></figure>` |

SVG diagram helper classes (they switch colors in dark mode, so never hard-code fills/strokes):

- Boxes: `bx` (neutral), `bx-a` (blue), `bx-m` (dark blue, emphasis), `bx-p` (muted)
- Text: `t` (title), `s` (small muted), `m` (mono), `acc`, `amb`
- Lines: `ln`, `ln-a`, `ln-m`, `dash`
- Fills (arrow markers): `fill-muted`, `fill-acc`, `fill-amb`

Give SVG `<marker>` ids a per-figure prefix (`p1-ar`, `mcp-ar`) so they stay unique on the page. Use `--wide` (min 760px) or `--mid` (min 560px) so wide diagrams scroll on phones instead of shrinking text. Add `role="img"` and an `aria-label` to every SVG.

### Interactive widgets

Placeholders mounted in the browser by `MarkdownWidgetsDirective`. `data-*` attributes become component inputs (kebab-case to camelCase). Details: [`src/app/components/widgets/README.md`](src/app/components/widgets/README.md).

```html
<div data-widget="temperature" data-prompt="Thủ đô của Việt Nam là"></div>

<div data-widget="image-tokens" data-price-per-mtok="2"></div>

<div data-widget="agent-loop"></div>

<div class="chips" data-chips="V|ì|·sao|·trang" data-chip-ids="53|24076|48301|21907"></div>
```

- `temperature`: slider showing next-token probabilities.
- `image-tokens`: image token calculator (Claude 28px patch formula).
- `agent-loop`: step-through of an agent loop with context growth.
- `chips`: token chips; `|` separates chips, `·` renders as a space, `data-chip-ids` is optional.

The placeholder is empty in prerendered HTML and fills in after the page loads. To add a widget: create a standalone OnPush component with signal `input()`s (Tailwind with `dark:` variants), then register it in `src/app/components/widgets/widget-registry.ts`.

### Checklist before finishing a post

```bash
npx ng build
F=dist/analog/public/blog/<slug>/index.html
grep -c '\[\[' $F                          # must be 0 (no unparsed glossary terms)
grep -o '<svg' $F | wc -l; grep -o '</svg>' $F | wc -l   # counts must match
grep -o 'data-term="[^"]*"' $F | sort -u   # every id must exist in src/app/data/glossary/
```

Then open the post with `npm run dev` and check light mode, dark mode and a phone-width viewport.
