---
title: >
    AI Agent từ A đến Z phần IV: Chi phí, caching và chuyện tự host
description: >
    Token tính tiền thế nào? Prompt caching hoạt động ra sao và vì sao có thể giảm 90% hóa đơn? Khi nào nên dùng API, khi nào nên tự host model mã nguồn mở và fine-tune?
authors:
  - Nam Nguyen (TsuKpa)
createdDate: 22 Oct, 2026
lastmod: 2026-10-22T09:30:00.000Z
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
photo: /blog/images/ai-agent/cover-4.png
seo:
  metatitle: >
    AI Agent từ A đến Z phần IV: Chi phí, caching và chuyện tự host
  metadescription: >
    Token tính tiền thế nào? Prompt caching hoạt động ra sao và vì sao có thể giảm 90% hóa đơn? Khi nào nên dùng API, khi nào nên tự host model mã nguồn mở và fine-tune?
publish: true
---

![background](/blog/images/ai-agent/cover-4.png)

Xin chào mọi người, tới phần IV rồi, giờ mình nói chuyện tiền bạc nè :D

Hóa đơn AI không tính theo "số câu hỏi" đâu, mà tính theo **token**, và mỗi loại token lại có giá khác nhau. Hiểu chỗ này thì mọi người sẽ hiểu luôn vì sao [phần III](/blog/ai-agent-a-to-z-part-3) mình nói một câu hỏi có thể ngốn cả trăm nghìn token.

## 1. Một hóa đơn AI gồm những gì?

| Loại token | Giá so với input thường | Ghi chú |
|---|---|---|
| **Input thường** | 1× | Phần prompt không trúng cache |
| **Ghi cache** | 1,25× (5 phút) · 2× (1 giờ) | Lần đầu lưu phần đầu prompt vào cache (Anthropic) |
| **Đọc cache** | 0,1× · 0,05× · 0,025× | 0,05× trên Opus 5.5 và Sonnet 5.5; 0,025× trên Fable 5.1 |
| **Output** | ~5× | Token model viết ra |
| **Thinking** | ~5× (tính như output) | Không hiện hết trên màn hình nhưng vẫn bị tính |

Mấy chi phí ẩn khác: định nghĩa tool thêm vài trăm token mỗi request, và tokenizer mới của Claude 4.7+ sinh nhiều hơn khoảng 30% token cho cùng một đoạn chữ.

## 2. Prompt caching

Nhắc lại [phần II](/blog/ai-agent-a-to-z-part-2) xíu: prompt caching là nhà cung cấp lưu lại phần đầu prompt đã xử lý (KV cache). Lần sau gửi y hệt phần đầu đó thì họ bỏ qua bước prefill, tính giá rẻ hơn rất nhiều và trả lời nhanh hơn.

### 2.1. So sánh 3 nhà cung cấp

| | Anthropic | OpenAI | Google Gemini |
|---|---|---|---|
| **Bật thế nào** | Đánh dấu `cache_control` (tối đa 4 điểm) hoặc để tự động | Tự động theo phần đầu prompt | Ngầm định (mặc định bật) + cache tường minh |
| **Phí ghi** | 1,25× (5 phút) · 2× (1 giờ) | 1,25× (30 phút) · 2,5× (12 giờ) trên GPT-5.6+ | Ngầm định: không. Tường minh: phí lưu trữ theo giờ |
| **Phí đọc** | 0,025–0,1× | 0,05–0,1× | ~0,1× |
| **Thời gian sống** | 5 phút, tự gia hạn mỗi lần trúng; tùy chọn 1 giờ | 30 phút hoặc 12 giờ | Mình chưa xác minh được giá trị mặc định |
| **Độ dài tối thiểu** | 512–4.096 token tùy model | 1.024 token | 2.048–4.096 token |

### 2.2. Xếp prompt thế nào để trúng cache

Cache chỉ trúng khi phần đầu prompt **giống hệt từng byte**. Một thay đổi ở tầng nào sẽ làm hỏng cache của tầng đó và mọi tầng phía sau. Vì vậy quy tắc là: **thứ ít đổi đặt trước, thứ hay đổi đặt sau**.

![Xếp prompt để trúng cache](/blog/images/ai-agent/prompt-cache-layers.png)

Đội Claude Code của Anthropic còn chèn thông tin thay đổi (ngày giờ, file vừa sửa) vào message mới thay vì sửa system prompt, và coi tỷ lệ trúng cache quan trọng như uptime luôn. Nghe hơi ghê nhưng mà hợp lý ^^

### 2.3. Những thứ làm mất cache

- Nghỉ quá thời gian sống của cache (ví dụ đi ăn trưa với cache 5 phút :D).
- **Đổi model giữa phiên**: model mới không có cache của model cũ.
- Đổi effort hoặc cấu hình thinking, thêm hoặc bớt tool hay MCP server giữa phiên.
- Sửa system prompt hoặc file context đầu phiên (ví dụ sửa `CLAUDE.md` trong lúc đang làm).
- Chèn thứ thay đổi liên tục vào phần đầu prompt, như timestamp.

> Trượt cache còn **đắt hơn** không dùng cache, vì mỗi lần trượt bạn trả phí *ghi* 1,25×.

### 2.4. Tính thử xem tiết kiệm được bao nhiêu

Giả sử có một tính năng AI với system prompt + tool dài **50.000 token**, mỗi lần gọi thêm 500 token câu hỏi, model trả lời 400 token, gọi **1.000 lần/ngày** trên Sonnet 5.5:

![Máy tính chi phí](/blog/images/ai-agent/cost-calculator.png)

| Model | Không cache | Có cache, traffic đều (trượt 1 lần/ngày) | Có cache, traffic lúc có lúc không (trượt 50 lần/ngày) |
|---|---|---|---|
| Claude Sonnet 5.5 | $105/ngày | **~$10/ngày** | ~$16/ngày |
| Claude Opus 5.5 | $210/ngày | **~$20/ngày** | ~$32/ngày |
| Claude Haiku 5.5 | ~$5,3/ngày | **~$0,8/ngày** | ~$1/ngày |

Cách tính với Sonnet 5.5 (input $2, output $10, đọc cache $0,10 mỗi 1M token):

- **Không cache**: 1.000 × 50.500 token × $2/1M = $101 tiền input, cộng $4 tiền output = **$105**.
- **Có cache**: ghi cache 1 lần ($0,125) + 999 lần đọc cache ($5) + phần câu hỏi thay đổi ($1) + output ($4) = **~$10,1**.

Hai điều rút ra:

1. Có cache rồi thì input gần như hết là vấn đề, phần còn lại chủ yếu là **output** (chiếm khoảng 40% hóa đơn ở ví dụ trên).
2. Traffic thưa thớt (vài phút mới có một request) làm cache 5 phút liên tục hết hạn. Lúc đó cache 1 giờ đáng tiền hơn: phí ghi 2× nhưng chỉ cần trúng 2 lần là hòa vốn.

## 3. Các đòn bẩy chi phí khác

| Đòn bẩy | Tác dụng | Lưu ý |
|---|---|---|
| **Batch API** | Giảm 50%, cộng dồn được với giảm giá cache | Kết quả trong vài giờ (tối đa 24 giờ). Hợp với eval, xử lý dữ liệu hàng loạt, job ban đêm |
| **Chọn model theo việc** | Hạng nhẹ rẻ hơn hạng giữa khoảng 20 lần | Việc dễ cho Haiku/Luna, khó thì đẩy lên. Đừng đổi model giữa một hội thoại dài đang có cache |
| **Semantic cache ở tầng app** | Bỏ qua hẳn lần gọi model khi câu hỏi gần giống câu đã trả lời | Rủi ro trả nhầm câu trả lời. Chỉ cache câu trả lời không cá nhân hóa, tách theo khách hàng |
| **Compaction** | Context nhỏ lại cho các lượt sau | Bản thân việc tóm tắt cũng tốn và làm mất cache. Làm ở chỗ chuyển việc |
| **Giới hạn output** | Output đắt nhất và chậm nhất | Đặt `max_tokens`, hạ effort cho việc dễ |
| **Structured output** | Ít lỗi parse, ít phải gọi lại | Đổi schema cũng làm mất cache |

## 4. Độ trễ

- **TTFT** (chờ chữ đầu tiên) phụ thuộc chủ yếu vào độ dài prompt cần prefill. Cache rút ngắn TTFT vì bỏ qua được prefill phần đã cache.
- **Thời gian còn lại** ≈ số token output ÷ tốc độ sinh. Hướng dẫn của OpenAI chỉ ra: cắt 50% output giảm khoảng 50% độ trễ, còn cắt 50% prompt chỉ giảm 1–5%.
- Luôn **stream** để người dùng thấy chữ ngay. Gộp bớt số lượt gọi, chạy song song các lần gọi độc lập, dùng model nhỏ cho bước phụ.

## 5. API frontier hay tự host model mã nguồn mở?

Gọi API của Anthropic, OpenAI, Google giống như **thuê SaaS**: chất lượng cao nhất, không phải vận hành, trả tiền theo token. Tự host model **open-weight** giống như **mua đứt phần mềm** cài lên server riêng: chủ động hơn, nhưng gánh toàn bộ việc vận hành.

### 5.1. Model mã nguồn mở đáng chú ý (10/2026)

| Model | Kích thước (tổng / hoạt động) | Context | License | Ghi chú |
|---|---|---|---|---|
| **DeepSeek V4 Pro** | ~1,6T / 49B (MoE) | 1M | MIT | Trọng số ~893 GB, cần hạ tầng nhiều GPU |
| **Qwen 3.8** | nhiều cỡ, có bản 27B dense | ~256K | tùy bản | Bản 27B là Apache 2.0 |
| **Gemma 4** (Google) | E2B, E4B, 26B-A4B, 31B | 128K–256K | Apache 2.0 | Bản nhỏ chạy được trên laptop, điện thoại |
| **gpt-oss** (OpenAI) | 120b (5,1B hoạt động), 20b (3,6B) | 128K | Apache 2.0 | 120b vừa 1 GPU 80 GB, 20b vừa 16 GB |
| **Mistral** | Medium 3.5 (128B), Large 3 (675B / 41B) | 256K | MIT sửa đổi / Apache | Hợp yêu cầu dữ liệu ở EU |
| **Llama 4** (Meta) | Scout 109B, Maverick 402B | tới 10M | Llama license | Không có cập nhật mới từ 2025 |

Nhiều ngày phát hành và thông số mình lấy từ trang tin, Hugging Face chỉ xác nhận model tồn tại và kích thước tương đối. Còn mấy bảng xếp hạng "model tốt nhất" của bên thứ ba thì mọi người đừng tin quá, tự đo trên việc của mình là chắc nhất.

### 5.2. Fine-tuning: dạy thêm cho model có sẵn

- **Full fine-tuning**: cập nhật toàn bộ trọng số. Tốn GPU nhất, dễ làm model "quên" kiến thức cũ.
- **LoRA**: không sửa model gốc, chỉ gắn thêm một lớp nhỏ (adapter). Bài báo gốc báo cáo số tham số cần train ít hơn **10.000 lần** và tốn ít hơn khoảng **3 lần** bộ nhớ GPU.
- **QLoRA**: LoRA trên model đã được nén 4-bit. Fine-tune được model 65B trên **một GPU 48 GB**.
- **DPO**: dạy model "câu A tốt hơn câu B" từ dữ liệu cặp so sánh.

> **Hiểu lầm phổ biến**: fine-tuning dạy **hành vi** (văn phong, định dạng, nghiệp vụ hẹp). Nó **kém** ở việc nạp kiến thức mới: muốn model biết tài liệu nội bộ thì dùng RAG. Và mỗi lần model nền ra bản mới, công fine-tune cũ có thể phải làm lại.

### 5.3. Phần mềm chạy model (serving)

| Công cụ | Dùng khi nào | Tình trạng |
|---|---|---|
| **vLLM** | Server production trên GPU, kỹ thuật PagedAttention tăng 2–4 lần throughput | Mặc định nên chọn |
| **SGLang** | Tối ưu cho tác vụ agent, serving quy mô lớn | Hoạt động |
| **Ollama** | Chạy model trên laptop để thử nghiệm, có REST API | Hoạt động |
| **llama.cpp** | Chạy trên CPU, Apple Silicon, nhiều loại GPU | Hoạt động |
| **TGI** (Hugging Face) | Đã chuyển sang bảo trì, repo archive ngày 21/3/2026 | Đừng dùng cho dự án mới |

**Giá GPU tham khảo** (10/2026): H100 thuê theo giờ khoảng $6,9–12,3 ở các cloud lớn (mấy bạn AWS, GCP, Azure), $2,9–6,2 ở nhà cung cấp GPU chuyên dụng, $1,7–2,4 trên các chợ GPU. Một node 8×H100 chạy liên tục ở mức $4/GPU/giờ tốn khoảng **$23.000 mỗi tháng**, chưa tính tiền người vận hành nha. Nhìn con số này là thấy "tự host cho rẻ" chưa chắc đã rẻ :D

### 5.4. Chọn cách nào?

| Cách | Hợp nhất khi | Chi phí, công sức | Rủi ro chính |
|---|---|---|---|
| **Prompt engineering** | Hầu hết mọi việc, thử nhanh nhất | Thấp nhất | Dễ vỡ, tốn context |
| **RAG** | Cần kiến thức riêng hoặc mới, cần trích nguồn | Vừa: dựng index, truy xuất | Chất lượng tìm kiếm |
| **Fine-tuning** | Cần văn phong, định dạng, nghiệp vụ hẹp ổn định | Vừa: dữ liệu, GPU, bộ test | Dữ liệu kém; model mới ra là phải làm lại |
| **Tự host open-weight** | Dữ liệu không được rời hạ tầng, khối lượng lớn đều đặn, cần chạy offline | Cao: GPU, vận hành 24/7 | Chất lượng kém hơn frontier, gánh nặng vận hành |
| **API frontier** | Cần chất lượng cao nhất, việc agent dài hơi, ít vận hành | Trả theo token | Phụ thuộc nhà cung cấp, dữ liệu rời hạ tầng |

**Quy tắc ngón tay cái**: bắt đầu bằng prompt tốt → cần kiến thức thì thêm RAG → cần hành vi ổn định thì mới fine-tune → chỉ tự host khi có lý do cụ thể về quyền riêng tư dữ liệu, độ trễ, hoặc chi phí ở quy mô lớn. Với việc agent dài hơi như coding thì model frontier qua API vẫn dẫn đầu rõ rệt.

## 6. Tổng kết

- Tiền tính theo token, output đắt gấp 5 lần input, thinking tính như output.
- Prompt caching có thể giảm khoảng 90% hóa đơn nếu xếp prompt đúng: **thứ ít đổi trước, thứ hay đổi sau**.
- Đổi model, đổi effort, thêm MCP giữa phiên, nghỉ quá lâu đều làm mất cache.
- Tự host không phải lúc nào cũng rẻ, fine-tuning dạy hành vi chứ không dạy kiến thức.

Phần sau mình sẽ nói về chuyện bảo mật (con tôm OpenClaw có nhiều bài học lắm 🦞) và điểm qua hệ sinh thái tool đang hot trên GitHub, bao gồm mấy cái tên hay nghe như caveman, ponytail, Oh My Pi,... Hẹn gặp lại ở phần V. See ya!

________________

**Series AI Agent từ A đến Z:**

- [Phần I: Hành trình của một request](/blog/ai-agent-a-to-z-part-1)
- [Phần II: Bên trong model và cách model được dạy](/blog/ai-agent-a-to-z-part-2)
- [Phần III: Từ chatbot thành agent](/blog/ai-agent-a-to-z-part-3)
- **Phần IV: Chi phí, caching và chuyện tự host** (bài này)
- [Phần V: Bảo mật và hệ sinh thái tool](/blog/ai-agent-a-to-z-part-5)
- [Phần VI: Áp dụng cho team và từ điển thuật ngữ](/blog/ai-agent-a-to-z-part-6)

**Nguồn tham khảo:** [Anthropic pricing](https://platform.claude.com/docs/en/about-claude/pricing), [Anthropic prompt caching](https://platform.claude.com/docs/en/build-with-claude/prompt-caching), [OpenAI prompt caching](https://developers.openai.com/api/docs/guides/prompt-caching), [OpenAI latency](https://developers.openai.com/api/docs/guides/latency-optimization), [Gemini caching](https://ai.google.dev/gemini-api/docs/caching), [Prompt caching trong Claude Code](https://claude.com/blog/lessons-from-building-claude-code-prompt-caching-is-everything), [LoRA](https://arxiv.org/abs/2106.09685), [QLoRA](https://arxiv.org/abs/2305.14314), [gpt-oss](https://openai.com/index/introducing-gpt-oss/), [TGI](https://github.com/huggingface/text-generation-inference), [Giá thuê H100](https://intuitionlabs.ai/articles/h100-rental-prices-cloud-comparison).
