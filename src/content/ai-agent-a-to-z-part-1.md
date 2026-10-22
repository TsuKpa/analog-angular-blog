---
title: >
    AI Agent từ A đến Z phần I: Hành trình của một request
description: >
    Chuyện gì xảy ra từ lúc bạn nhấn Enter trong Claude Code, Cursor hay ChatGPT cho đến khi chữ cuối cùng hiện ra? Model "hiểu" chữ, code, ảnh, âm thanh như thế nào?
authors:
  - Nam Nguyen (TsuKpa)
  - Claude Team
createdDate: 22 Oct, 2026
lastmod: 2026-10-22T09:00:00.000Z
tags:
  - VietNamese
  - AI
  - AI Agent
  - LLM
topics:
  - blog
tweet:
format: blog
canonical_url:
photo: /blog/images/ai-agent/cover-1.png
seo:
  metatitle: >
    AI Agent từ A đến Z phần I: Hành trình của một request
  metadescription: >
    Chuyện gì xảy ra từ lúc bạn nhấn Enter trong Claude Code, Cursor hay ChatGPT cho đến khi chữ cuối cùng hiện ra? Model "hiểu" chữ, code, ảnh, âm thanh như thế nào?
publish: true
---

![background](/blog/images/ai-agent/cover-1.png)

Xin chào mọi người, như mình có kể trong [bài tổng kết 2025](/blog/tong-ket-2025) thì năm nay mình xài AI agent max ping, task gì cũng quăng cho nó làm. Xài nhiều thì cũng sinh ra nhiều câu hỏi: tại sao có lúc nó nhớ, có lúc nó quên? Tại sao đang làm ngon lành tự nhiên hết limit? Tại sao dán 1 cái screenshot vào mà tốn quá trời [[token|token]]? :D

Nên mình quyết định ngồi research lại từ A tới Z cách mà mấy con AI agent (Claude, ChatGPT, Gemini,...) hoạt động, để chia sẻ với team và với mọi người. Series này viết cho bạn nào từ junior trở lên đều đọc được, **không cần biết gì về machine learning** hết nha.

Series sẽ gồm 3 phần, phần đầu tiên này mình sẽ đi qua **hành trình của một request**: từ lúc bạn nhấn Enter cho tới khi chữ cuối cùng hiện ra trên màn hình.

## 1. TL;DR: 5 điều cần nhớ

Ai lười đọc thì nhớ 5 điều này là đủ xài rồi ^^

1. **Model chỉ làm đúng một việc: "Đoán [[token|token]] tiếp theo"**. Chat, gọi tool, sửa code,... tất cả là vòng lặp do phần mềm bọc ngoài (gọi là [[harness]]) như Claude Code hay Cursor điều khiển.

2. **Model không có trí nhớ.** Mỗi lượt, app gửi lại *toàn bộ* hội thoại, file đã đọc và kết quả tool. [[context-window|Context]] càng dài thì càng tốn tiền và model càng dễ bỏ sót chi tiết.

3. **Chữ, code, ảnh, PDF, âm thanh đều biến thành token.** Tiền và limit tính theo token. Token model viết ra (output) đắt khoảng **5 lần** token model đọc (input).

4. **Agent = model + tool + vòng lặp.** Một câu yêu cầu của bạn có thể thành hàng chục lượt gọi model, mỗi lượt lại gửi cả context lên.

5. **[[prompt-caching|Prompt caching]] là đòn bẩy chi phí lớn nhất**, còn độ an toàn của agent thì nằm ở **phân quyền** (sandbox, danh sách tool được phép, bước duyệt của người), chứ model "ngoan" thôi là chưa đủ.

## 2. Bức tranh model tháng 10/2026

Ba ông lớn đều chia model thành 3 hạng: **hạng nặng** cho việc khó, **hạng trung** cho việc hằng ngày, **hạng nhẹ** cho việc đơn giản và số lượng lớn. Chênh lệch giá giữa hạng nặng và hạng nhẹ lên tới cỡ **100 lần** luôn.

| Hãng | Model | Hạng | Input ($/1M token) | Output ($/1M token) | Context |
|---|---|---|---|---|---|
| Anthropic | Claude Fable 5.1 | nặng nhất | 10 | 50 | 1M |
| Anthropic | Claude Opus 5.5 | nặng | 4 | 20 | 1M |
| Anthropic | Claude Sonnet 5.5 | trung | 2 | 10 | 1M |
| Anthropic | Claude Haiku 5.5 | nhẹ | 0,10 | 0,50 | 1M |
| OpenAI | GPT-6 Astra | nặng nhất | 10 | 50 | 1,05M |
| OpenAI | GPT-6.1 Sol | trung | 2 | 10 | 1,05M |
| OpenAI | GPT-6 Luna | nhẹ | 0,10 | 0,50 | 1,05M |
| Google | Gemini 4 Argon | nặng | 2 → 4* | 10 → 20* | ~1M |
| Google | Gemini 3.8 Flash | trung | 0,75 | 3,75 | — |
| Google | Gemini 3.1 Flash-Lite | nhẹ | 0,25 | 1,50 | — |

*Gemini 4 Argon đang giá khuyến mãi, mấy nguồn mình đọc chưa thống nhất ngày tăng giá. Haiku 5.5 giá trên áp dụng cho [[prompt|prompt]] dưới 100k [[token|token]].

## 3. Hành trình của một request

Giả sử mình gõ vào Claude Code: *"Vì sao trang /checkout lỗi 500?"*. Câu này sẽ đi qua 6 trạm trước khi chữ đầu tiên của câu trả lời hiện lên:

<figure>
<div class="figure-diagram figure-diagram--wide">
<svg viewBox="0 0 990 250" role="img" aria-label="Request đi từ người dùng qua harness, API, tokenizer, model, sampler; token được stream ngược về; nếu model yêu cầu tool thì harness chạy tool rồi gọi lại API.">
<defs>
<marker id="p1-ar" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" class="fill-muted"/></marker>
<marker id="p1-ara" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" class="fill-acc"/></marker>
<marker id="p1-arm" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" class="fill-amb"/></marker>
</defs>
<rect class="bx-p" x="0" y="50" width="130" height="90" rx="10"/>
<text class="t" x="65" y="82" text-anchor="middle">Bạn</text><text class="s" x="65" y="102" text-anchor="middle">gõ prompt,</text><text class="s" x="65" y="117" text-anchor="middle">nhấn Enter</text>
<rect class="bx-a" x="170" y="50" width="130" height="90" rx="10"/>
<text class="t" x="235" y="82" text-anchor="middle">Harness</text><text class="s" x="235" y="102" text-anchor="middle">ghép system prompt,</text><text class="s" x="235" y="117" text-anchor="middle">history, tools, file</text>
<rect class="bx" x="340" y="50" width="130" height="90" rx="10"/>
<text class="t" x="405" y="82" text-anchor="middle">API</text><text class="s" x="405" y="102" text-anchor="middle">xác thực, rate limit,</text><text class="s" x="405" y="117" text-anchor="middle">tra prompt cache</text>
<rect class="bx" x="510" y="50" width="130" height="90" rx="10"/>
<text class="t" x="575" y="82" text-anchor="middle">Tokenizer</text><text class="s" x="575" y="102" text-anchor="middle">chữ, ảnh, audio</text><text class="s" x="575" y="117" text-anchor="middle">→ dãy token ID</text>
<rect class="bx-m" x="680" y="50" width="130" height="90" rx="10"/>
<text class="t" x="745" y="82" text-anchor="middle">Model</text><text class="s" x="745" y="102" text-anchor="middle">prefill: đọc cả prompt</text><text class="s" x="745" y="117" text-anchor="middle">decode: từng token</text>
<rect class="bx" x="850" y="50" width="130" height="90" rx="10"/>
<text class="t" x="915" y="82" text-anchor="middle">Sampler</text><text class="s" x="915" y="102" text-anchor="middle">temperature, top-p</text><text class="s" x="915" y="117" text-anchor="middle">→ chọn 1 token</text>
<line class="ln" x1="130" y1="88" x2="168" y2="88" marker-end="url(#p1-ar)"/><text class="m" x="149" y="80" text-anchor="middle">text</text>
<line class="ln" x1="300" y1="95" x2="338" y2="95" marker-end="url(#p1-ar)"/><text class="m" x="319" y="87" text-anchor="middle">JSON</text>
<line class="ln" x1="470" y1="95" x2="508" y2="95" marker-end="url(#p1-ar)"/><text class="m" x="489" y="87" text-anchor="middle">text</text>
<line class="ln" x1="640" y1="95" x2="678" y2="95" marker-end="url(#p1-ar)"/><text class="m" x="659" y="87" text-anchor="middle">ID</text>
<line class="ln" x1="810" y1="95" x2="848" y2="95" marker-end="url(#p1-ar)"/><text class="m" x="829" y="87" text-anchor="middle">xác suất</text>
<line class="ln" x1="168" y1="118" x2="132" y2="118" marker-end="url(#p1-ar)"/><text class="m" x="149" y="134" text-anchor="middle">hiển thị</text>
<path class="ln-a" d="M915,140 V195 H235 V142" marker-end="url(#p1-ara)"/>
<text class="acc" x="575" y="216" text-anchor="middle">mỗi token sinh ra được stream ngay về (SSE), lặp đến khi model dừng</text>
<path class="ln-m dash" d="M255,50 V24 H405 V48" marker-end="url(#p1-arm)"/>
<text class="amb" x="330" y="16" text-anchor="middle">tool_use → harness chạy tool → gọi lại API với context mới</text>
</svg>
</div>
<figcaption>Model (ô vàng) chỉ nhận dãy số và trả ra xác suất. Mọi thứ còn lại do phần mềm xung quanh lo. Vòng nét đứt là thứ biến chatbot thành agent (mình nói kỹ ở <a href="/blog/ai-agent-a-to-z-part-3">phần III</a>).</figcaption>
</figure>

Ô màu vàng (Model) chỉ nhận vào một dãy số và trả ra xác suất thôi. Mọi thứ còn lại đều do phần mềm xung quanh lo. Còn cái vòng nét đứt ở trên là thứ biến chatbot thành agent, mình sẽ nói kỹ ở phần III.

### 3.1. Trạm 1–2: Harness gói câu hỏi thành một "request"

**[[harness|Harness]]** là phần mềm bọc quanh model: Claude Code, Cursor, Copilot,... đều là harness hết. Nó không gửi đúng mỗi câu bạn gõ đâu, mà gửi nguyên một gói JSON gồm:

- **[[prompt|System prompt]]**: "Nội quy" do harness viết sẵn (bạn là ai, được làm gì, trả lời theo phong cách nào).
- **Định nghĩa tool**: Danh sách công cụ model được phép yêu cầu (đọc file, chạy lệnh, search web,...), mỗi tool có mô tả và schema tham số.
- **Lịch sử hội thoại**: Toàn bộ các lượt trước, gồm cả kết quả tool.
- **Câu hỏi mới của bạn** và file hay ảnh đính kèm.

Nó trông đại khái như vầy:

```json
{
  "model": "claude-sonnet-5-5",
  "system": "Bạn là trợ lý code cho dự án Next.js. Luôn chạy test trước khi báo xong...",
  "tools": [{ "name": "read_file", "description": "Đọc nội dung 1 file", "input_schema": {} }],
  "messages": [
    { "role": "user", "content": "Vì sao trang /checkout lỗi 500?" },
    { "role": "assistant", "content": [{ "type": "tool_use", "name": "read_file",
                                         "input": { "path": "app/checkout/page.tsx" } }] },
    { "role": "user", "content": [{ "type": "tool_result", "content": "export default async function..." }] }
  ],
  "stream": true
}
```

Để ý xíu: kết quả tool được gửi lại trong một lượt `user`. Với model thì "người dùng" là bất cứ thứ gì không phải chính nó viết ra :D

<div class="callout callout--warn">
<p class="callout-title">Điểm quan trọng nhất của phần này</p>
<p>Model <strong>không nhớ gì</strong> giữa các lần gọi (<span class="term" tabindex="0" data-term="stateless">stateless</span>). Ở lượt thứ 10, harness gửi lại cả 9 lượt trước. Cảm giác "AI nhớ cuộc trò chuyện" thật ra là app chép lại toàn bộ cuộc trò chuyện mỗi lần.</p>
</div>

Ví von cho dễ hiểu: giống như gọi tổng đài mà lần nào cũng gặp một nhân viên mới. Bạn phải đưa họ đọc lại toàn bộ biên bản mấy cuộc gọi trước rồi mới hỏi tiếp được. Đây cũng chính là lý do hội thoại càng dài thì càng tốn limit nhanh.

### 3.2. Trạm 3–4: API và tokenizer

API kiểm tra key, **[[rate-limit|rate limit]]**, và xem phần đầu prompt đã có trong cache chưa (phần III mình nói kỹ). Sau đó server "ép phẳng" gói JSON thành một chuỗi duy nhất bằng **chat template**: các system role, user, assistant, tool được đánh dấu bằng những [[token|token]] đặc biệt. Chuỗi này đi qua **[[tokenizer|tokenizer]]** để thành dãy số.

```
<|system|>Bạn là trợ lý code cho dự án Next.js...<|tools|>[read_file: Đọc nội dung 1 file...]
<|user|>Vì sao trang /checkout lỗi 500?<|assistant|>
```

Cái này chỉ là minh họa thôi nha, mỗi hãng dùng ký hiệu riêng và không công bố đầy đủ. Ý chính là: với model, system prompt, tool, lịch sử, ảnh,... đều nằm chung trong **một dãy token**, và tất cả cùng chiếm chỗ trong [[context-window|context window]].

### 3.3. Trạm 5–6: Model và sampler

Model đọc toàn bộ dãy token một lượt (**prefill**), rồi tính xác suất cho mọi token có thể đứng tiếp theo. Sampler chọn một token, nối token đó vào cuối dãy, rồi lặp lại (**decode**). Phần II mình sẽ mổ xẻ kỹ chỗ này.

### 3.4. Đường về: streaming

Khi bật `stream: true`, mỗi token vừa sinh ra được đẩy ngay về qua **[[streaming|Server-Sent Events]] (SSE)**, nên chữ hiện ra dần dần thay vì bắt bạn ngồi chờ cả câu trả lời. Thứ tự các sự kiện:

```
message_start
  content_block_start   (text | thinking | tool_use)
  content_block_delta   ×N   ← từng mảnh chữ, hoặc từng mảnh JSON tham số tool
  content_block_stop
message_delta           ← stop_reason: end_turn | tool_use | max_tokens | refusal, kèm số token đã dùng
message_stop
```

Nếu `stop_reason` là `tool_use`, harness chạy tool, nối kết quả vào lịch sử, rồi **gọi lại API từ đầu với toàn bộ context mới**. Đó chính là cái vòng nét đứt trong sơ đồ phía trên.

## 4. Model "hiểu" chữ, code, ảnh, âm thanh như thế nào?

Câu trả lời ngắn: **không có cách hiểu riêng cho từng loại**. Mọi input đều được chuyển thành [[token|token]] rồi đưa vào cùng một model, khác nhau chỉ ở bước chuyển đổi thôi.

### 4.1. Chữ và code: cắt thành token

[[tokenizer|Tokenizer]] cắt chữ thành các mảnh hay gặp, phần lớn theo thuật toán [[bpe|BPE (Byte-Pair Encoding)]]. Từ phổ biến thường là 1 token, từ hiếm bị cắt thành nhiều mảnh. Nhờ vậy mà model đọc được cả những từ nó chưa từng thấy.

Thử nhìn câu hỏi của bạn dưới mắt model (minh họa, số bên dưới là token ID):

<div class="chips" data-chips="V|ì|·sao|·trang|·/|checkout|·l|ỗi|·500|?" data-chip-ids="53|24076|48301|21907|611|48018|326|82014|3101|30"></div>

Và đây là cùng một ý nhưng viết bằng tiếng Anh, tiếng Việt và code, để thấy số token khác nhau thế nào:

<div class="card">
<p class="card-kicker">Tiếng Anh</p>
<div class="chips" data-chips="Why|·does|·checkout|·return|·500|?"></div>
<p class="card-kicker">Tiếng Việt: dấu thanh làm từ bị cắt vụn hơn</p>
<div class="chips" data-chips="V|ì|·sao|·trang|·check|out|·l|ỗi|·500|?"></div>
<p class="card-kicker">Code: cùng tokenizer, không có gì đặc biệt</p>
<div class="chips" data-chips="const|·total|·=|·items|.reduce|((|s|,|·i|)|·=>|·s|·+|·i|.price|,|·0|);"></div>
</div>

Cách cắt ở trên chỉ để minh họa thôi, mỗi model có tokenizer riêng. Tiếng Việt có dấu nên thường bị cắt vụn hơn tiếng Anh, tức là **viết [[prompt|prompt]] tiếng Việt thường tốn token hơn** một chút. Anthropic cũng cho biết từ Claude 4.7 trở đi tokenizer mới sinh ra khoảng **30% token nhiều hơn** cho cùng một đoạn chữ. Muốn đếm chính xác thì dùng endpoint đếm token của nhà cung cấp nhé.

**Vì sao model giỏi code?** Dữ liệu huấn luyện có lượng code khổng lồ, mà code lại có cấu trúc chặt và *kiểm chứng được*: chạy test là biết đúng sai liền. Cái này cực hợp với giai đoạn huấn luyện bằng phần thưởng (phần II).

### 4.2. Ảnh: cắt thành ô vuông

Ảnh đi qua một [[vision-encoder|vision encoder]]: ảnh bị cắt thành các ô vuông nhỏ (patch), mỗi ô được chuyển thành một vector giống như token chữ. Với Claude thì **mỗi ô 28×28 pixel là 1 token**. Ảnh lớn quá sẽ bị thu nhỏ trước.

Công thức: `token = ⌈rộng/28⌉ × ⌈cao/28⌉` (sau khi thu nhỏ cho vừa giới hạn). Một vài ví dụ:

| Ảnh | Chế độ | Token |
|---|---|---|
| 1000×1000 | chuẩn | 1.296 |
| Screenshot 1920×1080 | chuẩn (tối đa 1.568) | 1.560 |
| Screenshot 1920×1080 | độ phân giải cao, Claude 4.7+ (tối đa 4.784) | 2.691 |

Hoặc tự bấm thử với kích thước ảnh của bạn:

<div data-widget="image-tokens" data-price-per-mtok="2"></div>

Gemini thì tính khác: 258 token cho ảnh tới 384×384, ảnh lớn hơn cắt thành ô 768×768, mỗi ô 258 token.

Lưu ý nè: ảnh **cũng được gửi lại mỗi lượt** như chữ, nên dán 10 cái screenshot vào một hội thoại dài là tốn rất nhanh đó.

### 4.3. PDF: đọc hai lần cùng lúc

Claude xử lý mỗi trang PDF theo 2 đường song song: chữ được trích xuất ra, và cả trang được chụp thành ảnh. Nhờ vậy nó đọc được cả biểu đồ và bảng. Mỗi trang tốn khoảng **1.500–3.000 token** phần chữ, cộng thêm token phần ảnh. Giới hạn là 600 trang và 32 MB mỗi request (100 trang với model context 200K).

### 4.4. Âm thanh: hai kiến trúc khác nhau

<figure>
<div class="figure-diagram figure-diagram--mid">
<svg viewBox="0 0 720 210" role="img" aria-label="So sánh: pipeline chuyển giọng nói thành chữ, qua LLM, rồi chuyển chữ thành giọng nói, với model native nghe và nói trực tiếp.">
<defs><marker id="p1-ar2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" class="fill-muted"/></marker></defs>
<text class="m" x="0" y="18">PIPELINE (ghép nối)</text>
<rect class="bx-p" x="0" y="30" width="110" height="54" rx="8"/><text class="t" x="55" y="62" text-anchor="middle">Giọng nói</text>
<rect class="bx" x="150" y="30" width="110" height="54" rx="8"/><text class="t" x="205" y="54" text-anchor="middle">STT</text><text class="s" x="205" y="72" text-anchor="middle">giọng → chữ</text>
<rect class="bx-m" x="300" y="30" width="110" height="54" rx="8"/><text class="t" x="355" y="54" text-anchor="middle">LLM</text><text class="s" x="355" y="72" text-anchor="middle">chỉ thấy chữ</text>
<rect class="bx" x="450" y="30" width="110" height="54" rx="8"/><text class="t" x="505" y="54" text-anchor="middle">TTS</text><text class="s" x="505" y="72" text-anchor="middle">chữ → giọng</text>
<rect class="bx-p" x="600" y="30" width="110" height="54" rx="8"/><text class="t" x="655" y="62" text-anchor="middle">Loa</text>
<line class="ln" x1="110" y1="57" x2="148" y2="57" marker-end="url(#p1-ar2)"/><line class="ln" x1="260" y1="57" x2="298" y2="57" marker-end="url(#p1-ar2)"/><line class="ln" x1="410" y1="57" x2="448" y2="57" marker-end="url(#p1-ar2)"/><line class="ln" x1="560" y1="57" x2="598" y2="57" marker-end="url(#p1-ar2)"/>
<text class="s" x="355" y="104" text-anchor="middle">mất giọng điệu, cảm xúc; 3 bước nối tiếp nên chậm; khó ngắt lời</text>
<text class="m" x="0" y="138">NATIVE (speech-to-speech)</text>
<rect class="bx-p" x="0" y="150" width="110" height="54" rx="8"/><text class="t" x="55" y="182" text-anchor="middle">Giọng nói</text>
<rect class="bx-m" x="150" y="150" width="410" height="54" rx="8"/><text class="t" x="355" y="174" text-anchor="middle">Một model nghe và nói trực tiếp</text><text class="s" x="355" y="192" text-anchor="middle">audio token vào, audio token ra; vẫn gọi tool được</text>
<rect class="bx-p" x="600" y="150" width="110" height="54" rx="8"/><text class="t" x="655" y="182" text-anchor="middle">Loa</text>
<line class="ln" x1="110" y1="177" x2="148" y2="177" marker-end="url(#p1-ar2)"/><line class="ln" x1="560" y1="177" x2="598" y2="177" marker-end="url(#p1-ar2)"/>
</svg>
</div>
<figcaption>Pipeline đơn giản, dễ thay từng khâu. Native nhanh hơn, giữ được ngữ điệu và cho ngắt lời tự nhiên (ví dụ OpenAI Realtime, Gemini Live).</figcaption>
</figure>

- **Pipeline (ghép nối)**: giọng nói → chữ ([[stt-tts|STT]]) → [[llm|LLM]] → giọng nói (TTS). Đơn giản, dễ thay từng khâu, nhưng mất ngữ điệu, cảm xúc, chậm và khó ngắt lời.
- **Native (speech-to-speech)**: một model nghe và nói trực tiếp, nhanh hơn, giữ được ngữ điệu, cho ngắt lời tự nhiên (ví dụ OpenAI Realtime, Gemini Live).

Với Gemini, âm thanh tốn khoảng **32 token mỗi giây** (1.920 token mỗi phút), tối đa khoảng 9,5 giờ trong một prompt.

### 4.5. Video

Video được xử lý như một chuỗi khung hình (ảnh), cộng thêm âm thanh nếu model hỗ trợ. Gemini nhận video trực tiếp luôn. Video thì tốn token kinh khủng, nên cách làm khôn ngoan là không đưa nguyên video cho model, mà chỉ đưa transcript có mốc thời gian, cộng vài khung hình ở chỗ cần quyết định.

### 4.6. Native multimodal và kiểu "ghép nối"

- **Native**: một model duy nhất nhìn thấy cả token chữ, ảnh, âm thanh trong cùng một dãy, nên hiểu được quan hệ giữa chúng (ví dụ "cái nút màu đỏ trong ảnh này làm gì?").
- **Ghép nối**: dùng [[ocr|OCR]], STT hay một model mô tả ảnh để biến mọi thứ thành chữ, rồi đưa cho LLM chỉ đọc được chữ. Đơn giản, nhưng thông tin bị rơi rớt ở bước chuyển đổi.

Các hãng ít khi công bố chi tiết kiến trúc, nên mấy câu kiểu "natively [[multimodal|multimodal]]" là lời của chính nhà cung cấp nha mọi người.

## 5. Tổng kết

Tóm lại thì: bạn gõ một câu → [[harness|harness]] gói thêm cả đống thứ ([[prompt|system prompt]], tool, lịch sử) → tất cả biến thành [[token|token]] → model đoán từng token một → stream về màn hình. Và vì model không có trí nhớ, nên **mỗi lượt là gửi lại tất cả**.

Phần tiếp theo mình sẽ mổ xẻ bên trong model: attention là gì, tại sao chữ đầu tiên lâu hiện, temperature là cái gì, và model được "dạy" như thế nào để từ một cái máy đoán chữ trở thành trợ lý biết code. Theo dõi mình để đọc tiếp nhé, hẹn gặp lại ở phần II. See ya!

________________

**Series AI Agent từ A đến Z:**

- **Phần I: Hành trình của một request** (bài này)
- [Phần II: Bên trong model và cách model được dạy](/blog/ai-agent-a-to-z-part-2)
- [Phần III: Agent, chi phí và bảo mật](/blog/ai-agent-a-to-z-part-3)

**Nguồn tham khảo:** [Anthropic Vision](https://platform.claude.com/docs/en/build-with-claude/vision), [PDF support](https://platform.claude.com/docs/en/build-with-claude/pdf-support), [Streaming](https://platform.claude.com/docs/en/build-with-claude/streaming), [Anthropic pricing](https://platform.claude.com/docs/en/about-claude/pricing), [OpenAI pricing](https://developers.openai.com/api/docs/pricing), [Gemini pricing](https://ai.google.dev/gemini-api/docs/pricing), [Gemini audio](https://ai.google.dev/gemini-api/docs/audio), [OpenAI Realtime](https://developers.openai.com/api/docs/guides/realtime), [BPE paper](https://arxiv.org/abs/1508.07909), [ViT paper](https://arxiv.org/abs/2010.11929).
