# Content components for blog posts

Posts are markdown rendered by `<analog-markdown>`. Raw HTML with classes works; Angular components do not run inside markdown. Styles live in `src/app/styles/content-blocks.css` and only apply inside `.blog-content` (post pages). Light and dark mode are both handled.

**Rule:** markdown inside an HTML block needs a blank line before and after the markdown, otherwise it is printed literally.

```html
<div class="callout">

Text with **markdown** works because of the blank lines.

</div>
```

## Callout

```html
<div class="callout">
<span class="callout-title">Ghi chú</span>

Nội dung **markdown**.

</div>

<div class="callout callout--warn">
<span class="callout-title">Cẩn thận</span>

Cảnh báo.

</div>

<div class="callout callout--tip">
<span class="callout-title">Mẹo</span>

Gợi ý.

</div>
```

## Analogy

Label defaults to "Ví von"; override with `data-label`.

```html
<div class="analogy">

Context window giống bàn làm việc: bàn càng rộng càng nhiều tài liệu trải ra.

</div>

<div class="analogy" data-label="Ví dụ">

Nội dung khác nhãn.

</div>
```

## TL;DR (numbered cards)

Must be an `<ol>`. Markdown list syntax inside is not parsed, use `<li>` tags.

```html
<ol class="tldr">
  <li>Điểm chính thứ nhất.</li>
  <li>Điểm chính thứ hai.</li>
  <li>Điểm chính thứ ba.</li>
</ol>
```

## Cards

```html
<div class="cards">
  <div class="card">
    <span class="card-kicker">Bước 1</span>
    <h4>Tiêu đề</h4>
    <p>Mô tả ngắn.</p>
  </div>
  <div class="card">
    <span class="card-kicker">Bước 2</span>
    <h4>Tiêu đề</h4>
    <p>Mô tả ngắn.</p>
  </div>
</div>
```

## Pills and tiers

```html
<span class="pill pill--ok">đã xác minh</span>
<span class="pill pill--warn">chưa chắc</span>
<span class="pill pill--bad">sai</span>
<span class="pill">mặc định (xanh)</span>
<span class="tier">Tier 1</span>
```

Inside a markdown table cell, put them inline on one line.

## Token chips

Five pastel colours rotate automatically. `<b>` is the token text (spaces preserved), `<i>` the id.

```html
<div class="chips">
  <span class="chip"><b>Xin</b><i>1234</i></span>
  <span class="chip"><b> chào</b><i>5678</i></span>
  <span class="chip"><b> bạn</b><i>91</i></span>
</div>
```

## Diagram (inline SVG)

Wrap the SVG in `.figure-diagram`; add `figure-diagram--wide` (min 760px) or `--mid` (min 560px) to scroll on phones instead of shrinking text.

Helper classes: boxes `bx` (neutral), `bx-a` (blue), `bx-m` (dark blue, emphasis), `bx-p` (muted); text `t` (title), `s` (small muted), `m` (mono), `acc` (blue), `amb` (dark blue); lines `ln`, `ln-a`, `ln-m`, `dash`; fills `fill-muted`, `fill-acc`, `fill-amb`.

```html
<figure>
<div class="figure-diagram">
<svg viewBox="0 0 400 100" role="img" aria-label="User gửi prompt tới model">
  <defs>
    <marker id="arr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M0 0L10 5L0 10z" class="fill-muted" />
    </marker>
  </defs>
  <rect class="bx" x="10" y="20" width="120" height="60" rx="8" />
  <text class="t" x="70" y="55" text-anchor="middle">User</text>
  <line class="ln" x1="130" y1="50" x2="270" y2="50" marker-end="url(#arr)" />
  <rect class="bx-a" x="270" y="20" width="120" height="60" rx="8" />
  <text class="t acc" x="330" y="55" text-anchor="middle">Model</text>
</svg>
</div>
<figcaption>Hình 1: Luồng cơ bản.</figcaption>
</figure>
```

Keep SVG markup free of blank lines, or markdown will end the HTML block early. Use unique marker ids per post.

## Wide table

Plain markdown tables already scroll. Use the wrapper for a bordered card look.

```html
<div class="table-wrap">

| Model | Giá vào | Giá ra |
| ----- | ------- | ------ |
| A     | $1      | $5     |

</div>
```

## GitHub-style alerts

`> [!NOTE]` is **not** supported: marked outputs a plain blockquote, so it needs a marked extension (e.g. `marked-alert`). Use `.callout` instead.
