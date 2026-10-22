# Markdown widgets

Interactive Angular components embedded in blog markdown via placeholders. `MarkdownWidgetsDirective`
(`[appMarkdownWidgets]`, on the `.blog-content` wrapper) finds `[data-widget]` elements after render and mounts
the matching component from `widget-registry.ts`. Mounting is browser-only; the placeholder's inner HTML is the
SSR / no-JS fallback (it is replaced on mount).

IMPORTANT: put a blank line before and after each HTML block, otherwise markdown swallows it into a paragraph.

## Widgets

```html
<div data-widget="temperature" data-prompt="Thủ đô của Việt Nam là"></div>

<div data-widget="image-tokens" data-price-per-mtok="2"></div>
```

`data-*` attributes become component inputs (kebab → camelCase, e.g. `data-price-per-mtok` → `pricePerMtok`).
Unknown widget names log a `console.warn` and keep the fallback.

## Token chips

```html
<div class="chips" data-chips="V|ì|·sao|·trang"></div>

<div class="chips" data-chips="V|ì|·sao" data-chip-ids="53|24076|48301"></div>
```

`|` separates chips; `·` renders as a space. Optional `data-chip-ids` (same `|` order) adds the token id.
Output: `<span class="chip"><b>text</b><i>id</i></span>`.

## Adding a widget

1. Create a standalone, OnPush component with `input()` signals (use `numberAttribute` for numbers; attrs arrive as strings).
2. Register it in `WIDGET_REGISTRY`.
