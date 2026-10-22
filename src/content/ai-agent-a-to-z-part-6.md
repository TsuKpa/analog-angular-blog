---
title: >
    AI Agent từ A đến Z phần VI: Áp dụng cho team và từ điển thuật ngữ
description: >
    Kiến trúc tham khảo khi đưa AI vào web app, workflow với coding agent, top 10 đề xuất, lộ trình 30/60/90 ngày và từ điển hơn 90 thuật ngữ AI giải thích bằng lời thường.
authors:
  - Nam Nguyen (TsuKpa)
createdDate: 22 Oct, 2026
lastmod: 2026-10-22T09:50:00.000Z
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
photo: /blog/images/ai-agent/cover-6.png
seo:
  metatitle: >
    AI Agent từ A đến Z phần VI: Áp dụng cho team và từ điển thuật ngữ
  metadescription: >
    Kiến trúc tham khảo khi đưa AI vào web app, workflow với coding agent, top 10 đề xuất, lộ trình 30/60/90 ngày và từ điển hơn 90 thuật ngữ AI giải thích bằng lời thường.
publish: true
---

![background](/blog/images/ai-agent/cover-6.png)

Xin chào mọi người, cuối cùng cũng tới phần cuối của series rồi ^^ Sau 5 phần đi từ token tới agent, từ tiền bạc tới bảo mật, phần này mình gom lại thành **cách áp dụng thực tế cho team web**, kèm một **từ điển thuật ngữ** ở cuối bài để mọi người tra nhanh khi đọc mấy phần trước.

Có 2 mặt trận:

- Dùng agent để **làm việc nhanh hơn**.
- Đưa **tính năng AI vào sản phẩm** một cách an toàn, kiểm soát được chi phí.

## 1. Kiến trúc tham khảo khi đưa AI vào web app

![Kiến trúc tham khảo](/blog/images/ai-agent/web-app-architecture.png)

- **LLM gateway**: một cổng duy nhất cho mọi lời gọi model giúp kiểm soát ngân sách, retry, chuyển nhà cung cấp dự phòng, ghi log (ví dụ LiteLLM). Lưu ý: gateway nào làm rơi đánh dấu `cache_control` sẽ âm thầm khiến bạn trả giá đầy đủ, mất hết tiền tiết kiệm từ caching ở [phần IV](/blog/ai-agent-a-to-z-part-4).
- **RAG**: dùng **pgvector** (index HNSW), kết hợp tìm kiếm full-text của Postgres, đặt đoạn tài liệu tìm được ở **cuối** prompt sau phần cố định để giữ cache.
- **Tool**: schema chặt, kiểm tham số ở server, kiểm quyền bằng **danh tính người dùng thật**, không bao giờ dựa vào phán đoán của model. Hành động quan trọng cần người xác nhận.
- **Eval**: giữ một bộ câu hỏi mẫu có đáp án, chạy trong CI mỗi lần đổi prompt hoặc model (dùng Batch API để rẻ một nửa).
- **Dự phòng**: nhà cung cấp dự phòng có cache lạnh, nên khi chuyển sẽ chậm và đắt hơn một lúc. Nhớ test đường dự phòng trong CI nữa.

## 2. Workflow dev với coding agent

| Thực hành | Cách làm |
|---|---|
| **AGENTS.md / CLAUDE.md** | Commit vào repo, giữ dưới ~200 dòng. Chỉ ghi thứ agent không tự đoán được: lệnh build, test, quy ước riêng, cạm bẫy. AGENTS.md là định dạng mở được nhiều tool đọc. Đây là gợi ý, không phải luật cứng |
| **Hooks** | Script chạy chắc chắn ở các thời điểm cố định: format sau khi sửa file, chặn ghi vào thư mục migration, quét secret, lọc output test. Thứ gì **bắt buộc** phải xảy ra thì dùng hook, đừng dùng lời dặn trong CLAUDE.md |
| **Skills** | Chuyển hướng dẫn ít dùng ra khỏi CLAUDE.md thành skill để chỉ nạp khi cần |
| **Subagent** | Cho việc tìm hiểu, việc có output lớn, hoặc review với context mới. Việc đơn giản dùng model rẻ |
| **Plan mode** | Tìm hiểu → lên kế hoạch → làm → commit. Bỏ qua khi thay đổi mô tả được trong một câu |
| **Cho agent cách tự kiểm** | Test, build, screenshot. Anthropic coi đây là đòn bẩy quan trọng nhất cho chất lượng |
| **Review trên CI** | GitHub Action cho agent: giới hạn số lượt, timeout, quyền tối thiểu, secret ở cấp tổ chức |
| **Chi phí** | Anthropic ghi nhận trung bình khoảng $13 mỗi dev mỗi ngày làm việc, 90% người dùng dưới $30/ngày. `/clear` giữa các việc khác nhau, mặc định dùng model hạng giữa |

Một ví dụ `AGENTS.md` ngắn gọn cho project Analog + Angular kiểu như blog này:

```markdown
# AGENTS.md

## Commands
- Dev: `npm run dev`
- Build (bắt buộc pass trước khi báo xong): `npm run build:prod`
- Test: `npm test`

## Conventions
- Bài viết nằm ở `src/content/*.md`, frontmatter phải có `publish: true` mới hiện ở trang /blog
- Ảnh tĩnh đặt trong `public/`, link bằng đường dẫn tuyệt đối `/blog/images/...`
- Không sửa `vite.config.ts` nếu không được yêu cầu

## Gotchas
- Merge vào `master` là CI tự deploy lên prod, đừng push thẳng lên master
```

## 3. Top 10 đề xuất cho team

1. **Chọn một agent chính** (Claude Code hoặc Codex CLI), OpenCode làm phương án không phụ thuộc nhà cung cấp. Giữ skill và AGENTS.md dùng được qua nhiều tool.
2. **ccusage** trước tiên: không đo thì không tối ưu được.
3. **Playwright MCP** để agent tự kiểm tra UI trên trình duyệt thật.
4. **Chrome DevTools MCP** để debug console, network, performance.
5. **Context7** chống bịa API của framework thay đổi nhanh.
6. **GitHub MCP**, thêm **Sentry MCP** nếu team dùng Sentry.
7. **Superpowers hoặc Spec Kit** (chọn một thôi), thử trên một tính năng trước.
8. **addyosmani/agent-skills + Impeccable** cho performance, accessibility, bảo mật, chất lượng UI.
9. **RTK hoặc Repomix** để nén output và context, phần có tác dụng thật lên hóa đơn.
10. **Langfuse + Promptfoo (+ LiteLLM)** nếu sản phẩm có tính năng AI.

## 4. Lộ trình 30 / 60 / 90 ngày

- **30 ngày - Đo và chuẩn hóa**: đo baseline (thời gian chu kỳ, số PR, lỗi lọt) trước khi đổi gì. Viết AGENTS.md cho repo chính. Cài ccusage, Playwright MCP, Context7. Thống nhất checklist bảo mật ở [phần V](/blog/ai-agent-a-to-z-part-5).
- **60 ngày - Quy trình và tự động**: thử Spec Kit hoặc Superpowers trên 1–2 tính năng. Thêm hook format, quét secret. Bật agent review PR trên CI với quyền tối thiểu. Thử ponytail và tự đo.
- **90 ngày - Sản phẩm và đánh giá**: nếu làm tính năng AI thì dựng gateway, trace, bộ eval trong CI. So sánh lại với baseline và quyết định giữ, bỏ, mở rộng cái gì.

> **Đừng tin cảm giác, hãy đo**: nghiên cứu có đối chứng của METR đầu năm 2025 (16 dev giàu kinh nghiệm, 246 issue thật) cho thấy dùng AI làm họ **chậm hơn khoảng 19%**, trong khi chính họ tin mình nhanh hơn khoảng 20%. METR sau đó nói kết quả này đã cũ so với tool cuối 2025. Nhưng bài học vẫn đúng: đo thời gian chu kỳ, số PR, tỷ lệ phải sửa lại sau review, lỗi lọt ra production, chi phí trên mỗi PR được merge, chứ đừng đo bằng cảm nhận hay số dòng code được chấp nhận.

## 5. Từ điển thuật ngữ

Mỗi thuật ngữ mình giải thích bằng lời thường, kèm một ví dụ đời thường cho dễ nhớ.

### 5.1. Nền tảng

- **LLM (Large Language Model)**: chương trình đã đọc lượng chữ khổng lồ nên rất giỏi đoán chữ tiếp theo. Claude, GPT, Gemini đều là LLM. *Ví dụ: autocomplete trên bàn phím điện thoại, nhưng đã đọc cả thư viện.*
- **Model / Weights (trọng số)**: "bộ não" của AI, thực chất là một file chứa hàng tỷ con số. *Ví dụ: như file .exe, không đọc hiểu được, chỉ chạy được.*
- **Parameter (tham số)**: từng con số trong bộ não đó. "70B" là 70 tỷ tham số. *Ví dụ: như số nơ-ron, nhiều hơn thường khôn hơn nhưng nặng và tốn hơn.*
- **Token**: đơn vị chữ mà AI đọc và tính tiền, thường là một mảnh của từ. *Ví dụ: "unbelievable" → "un" + "believ" + "able" = 3 token.*
- **Tokenizer**: bộ "cắt chữ" thành token và đổi mỗi token thành một con số ID. *Ví dụ: như máy cắt bánh mì, mỗi tiệm cắt lát dày mỏng khác nhau.*
- **BPE (Byte-Pair Encoding)**: cách cắt chữ phổ biến, ghép dần các cặp ký tự hay đi cùng nhau thành một mảnh. *Ví dụ: như tốc ký, cụm hay gặp như "ing", "tion" được viết bằng một ký hiệu.*
- **Embedding**: biến mỗi token thành một tọa độ trên "bản đồ ý nghĩa". *Ví dụ: "vua" gần "hoàng hậu", xa "bàn phím".*
- **Context window**: lượng token tối đa model nhìn thấy trong một lần gọi, tính cả câu hỏi lẫn câu trả lời. *Ví dụ: mặt bàn làm việc chỉ để được chừng ấy giấy.*
- **Prompt / System prompt**: prompt là lời bạn gửi, system prompt là "nội quy" do app đặt sẵn. *Ví dụ: system prompt là bản mô tả công việc, prompt là yêu cầu hằng ngày.*
- **Inference**: lúc model chạy để trả lời. *Ví dụ: training là đi học, inference là đi làm.*
- **Stateless (không trạng thái)**: model không nhớ gì giữa các lần gọi. *Ví dụ: gọi tổng đài, lần nào cũng gặp nhân viên mới, phải kể lại từ đầu.*
- **Harness**: phần mềm bọc quanh model, lo system prompt, lịch sử, chạy tool, xin quyền. *Ví dụ: model là động cơ, harness là cả chiếc xe.*

### 5.2. Bên trong model

- **Transformer**: kiến trúc nền của hầu hết LLM hiện nay. *Ví dụ: như "kiến trúc MVC" của thế giới AI.*
- **Attention**: cơ chế cho mỗi chữ "nhìn lại" các chữ khác để hiểu ngữ cảnh. *Ví dụ: trong "Con mèo đuổi con chuột vì nó đói", attention giúp hiểu "nó" là con mèo.*
- **Next-token prediction**: việc duy nhất model làm, đoán token tiếp theo rồi lặp lại. *Ví dụ: trò nối chữ, nhưng chơi cực giỏi.*
- **Temperature**: núm chỉnh độ "ngẫu hứng" khi chọn chữ. *Ví dụ: 0 như học sinh trả lời đúng sách giáo khoa, 1 như nhà thơ.*
- **Top-p**: chỉ bốc thăm trong nhóm chữ có khả năng cao nhất, cộng lại đủ p. *Ví dụ: chọn món, nhưng chỉ trong top món bán chạy.*
- **KV cache**: phần "đã hiểu" của các token trước được lưu lại. *Ví dụ: ghi chú bên lề khi đọc sách.*
- **Prefill**: bước đọc toàn bộ prompt cùng lúc. *Ví dụ: lướt đọc đề thi.*
- **Decode**: bước viết câu trả lời từng token một. *Ví dụ: viết bài thi từng chữ.*
- **TTFT (Time To First Token)**: thời gian chờ chữ đầu tiên hiện ra. *Ví dụ: từ lúc gọi món đến khi món đầu tiên được bưng ra.*
- **Streaming (SSE)**: gửi câu trả lời về từng mảnh. *Ví dụ: xem video online vừa tải vừa xem.*
- **Context rot**: context càng dài, model càng dễ bỏ sót chi tiết ở giữa. *Ví dụ: bàn chất đầy giấy thì khó tìm tờ quan trọng.*
- **Hallucination (ảo giác)**: model tự tin bịa ra thứ không có thật. *Ví dụ: gợi ý dùng `array.sortBy()` trong JavaScript thuần.*
- **MoE (Mixture of Experts)**: model có nhiều "chuyên gia" con, mỗi token chỉ gọi vài chuyên gia. *Ví dụ: bệnh viện 100 bác sĩ, mỗi ca chỉ cần 3–4 người khám.*

### 5.3. Đa phương thức

- **Multimodal**: model nhận nhiều loại input như chữ, ảnh, âm thanh, video. *Ví dụ: người vừa đọc, vừa nhìn, vừa nghe được.*
- **Vision encoder / Patch**: ảnh được cắt thành ô vuông nhỏ (Claude dùng ô 28×28 px), mỗi ô thành một token. *Ví dụ: tranh ghép puzzle.*
- **OCR**: công cụ đọc chữ trong ảnh. *Ví dụ: chụp hóa đơn rồi copy được chữ trong đó.*
- **STT / TTS / Speech-to-speech**: giọng nói thành chữ, chữ thành giọng nói, hoặc model nghe và nói trực tiếp. *Ví dụ: nói qua phiên dịch viên so với nói chuyện trực tiếp.*

### 5.4. Huấn luyện

- **Pretraining**: giai đoạn đọc khối lượng chữ và code khổng lồ để học đoán chữ tiếp theo. *Ví dụ: đọc hết thư viện quốc gia, biết nhiều nhưng chưa biết cách trả lời người khác.*
- **Base model**: model vừa pretrain xong, chỉ biết "viết tiếp". *Ví dụ: hỏi "Thủ đô Pháp?", nó có thể viết tiếp "Thủ đô Đức?".*
- **SFT / Instruction tuning**: dạy model bằng các cặp hỏi–đáp mẫu. *Ví dụ: đưa nhân viên mới 10.000 email mẫu trả lời khách.*
- **RLHF**: người so sánh hai câu trả lời, chọn câu tốt hơn, model học theo. *Ví dụ: huấn luyện bằng phần thưởng.*
- **Reward model**: "giám khảo máy" học cách chấm điểm giống con người. *Ví dụ: giám khảo tập sự học theo giám khảo chính.*
- **RLAIF / Constitutional AI**: thay người chấm bằng một bộ nguyên tắc để AI tự chấm và tự sửa. *Ví dụ: công ty phát sổ tay quy tắc để nhân viên tự kiểm tra.*
- **DPO**: học thẳng từ các cặp "câu A tốt hơn câu B". *Ví dụ: học trực tiếp từ đáp án mẫu.*
- **Reasoning model / Thinking token**: model "nháp" suy nghĩ trước khi trả lời, phần nháp tính tiền như output. *Ví dụ: làm toán nháp ra giấy, giấy nháp cũng tốn mực.*
- **Test-time compute**: cho model thêm thời gian suy nghĩ lúc trả lời. *Ví dụ: cho thêm 30 phút làm bài thay vì bắt đi học thêm.*
- **Effort**: núm chỉnh mức suy nghĩ (low → max). *Ví dụ: sửa lỗi typo thì không cần họp cả phòng.*

### 5.5. Agent

- **Agent**: AI tự làm nhiều bước để hoàn thành việc. *Ví dụ: chatbot là tư vấn qua điện thoại, agent là thợ đến tận nhà sửa.*
- **Agentic loop**: vòng "nghĩ → dùng tool → xem kết quả → nghĩ tiếp". *Ví dụ: debug: giả thuyết → thêm log → chạy → xem → sửa.*
- **Tool use / Function calling**: model chỉ viết "phiếu yêu cầu", harness mới là người chạy. *Ví dụ: sếp viết giấy, thư ký đi lấy hồ sơ.*
- **MCP (Model Context Protocol)**: chuẩn chung để cắm dịch vụ vào bất kỳ agent nào. *Ví dụ: cổng USB-C cho AI, hoặc LSP cho editor.*
- **Skill**: gói hướng dẫn và script cho một loại việc, cần mới mở ra đọc. *Ví dụ: sổ tay quy trình trong ngăn kéo.*
- **Subagent**: agent con có context riêng, làm xong chỉ gửi lại bản tóm tắt. *Ví dụ: nhờ thực tập sinh đọc 200 file, chỉ nhận báo cáo 1 trang.*
- **Memory**: ghi chú lưu giữa các phiên, ví dụ file CLAUDE.md. *Ví dụ: sổ bàn giao ca làm việc.*
- **RAG**: tìm đoạn tài liệu liên quan rồi kẹp vào prompt. *Ví dụ: thi được mở tài liệu.*
- **Vector DB**: database tìm theo ý nghĩa thay vì từ khóa, ví dụ pgvector. *Ví dụ: tìm "cách hủy đơn" ra được bài "hướng dẫn hoàn tiền".*
- **Context engineering**: chọn đúng thông tin đưa vào context. *Ví dụ: đưa đúng 5 trang cần cho cuộc họp, không đưa cả tủ hồ sơ.*
- **Compaction**: tóm tắt phần cũ khi context sắp đầy. *Ví dụ: biên bản cuộc họp 3 tiếng gói trong nửa trang.*
- **Prompt caching**: nhà cung cấp nhớ phần đầu prompt đã xử lý, gửi lại y hệt thì tính giá rẻ. *Ví dụ: phần đề giống hệt lần trước thì giáo viên không cần đọc lại.*
- **Cache hit / miss, TTL**: trúng cache (rẻ), trượt cache (giá đầy đủ cộng phí ghi), TTL là thời gian cache còn sống. *Ví dụ: đồ ăn trong tủ lạnh, còn hạn thì hâm lại, quá hạn thì nấu lại.*
- **Gateway / Channel (OpenClaw)**: bộ điều phối trung tâm của agent và các kết nối tới app nhắn tin. *Ví dụ: tổng đài và các đường dây điện thoại.*
- **Heartbeat**: agent tự "thức dậy" định kỳ để kiểm tra có việc gì cần làm. *Ví dụ: bảo vệ đi tuần mỗi giờ.*
- **Git worktree**: nhiều thư mục làm việc từ cùng một repo, mỗi agent một bản. *Ví dụ: mỗi thợ một bàn riêng thay vì chen nhau một bàn.*
- **Spec-driven development**: viết spec → plan → tasks rồi mới cho agent code. *Ví dụ: có bản vẽ rồi mới xây nhà.*

### 5.6. Các tầng AI Engineering

- **Prompt engineering**: viết câu lệnh cho AI rõ, đủ, đúng ý. *Ví dụ: "Sửa code này" mơ hồ, "Sửa lỗi null ở dòng 42, giữ API, thêm unit test" thì rõ.*
- **Loop engineering**: thiết kế vòng "làm → kiểm tra → sửa" có điều kiện dừng. *Ví dụ: chạy npm test, fail thì sửa, tối đa 5 lần rồi báo người.*
- **Graph engineering**: thiết kế sơ đồ nhiều bước, nhiều agent. *Ví dụ: dây chuyền nhà máy có trạm và khâu QC.*
- **Harness engineering**: thiết kế "khung xe" quanh model: tool, quyền, hook, quản lý context. *Ví dụ: công việc của đội làm Claude Code hay Cursor.*
- **Node / Edge / State**: bước công việc, mũi tên chuyển bước, và "bảng trắng chung". *Ví dụ: sơ đồ quy trình duyệt đơn nghỉ phép.*
- **Topology**: hình dạng tổng thể của sơ đồ. *Ví dụ: tuyến xe buýt thẳng so với mạng lưới có trạm trung chuyển.*
- **Verifier**: bước hoặc agent riêng chỉ làm việc kiểm tra. *Ví dụ: người review PR không phải người viết code.*
- **Deterministic check**: kiểm tra bằng code cố định, lần nào chạy cũng cùng kết quả. *Ví dụ: lint, type-check, unit test.*
- **Knowledge graph / Task graph**: thứ agent nhớ so với cách agent làm. *Ví dụ: cây gia phả so với sơ đồ Gantt.*

### 5.7. An toàn

- **Guardrail**: các lớp chặn để AI không làm điều sai. *Ví dụ: lan can trên cầu.*
- **Classifier**: model nhỏ kiểm tra input, output có vi phạm không. *Ví dụ: bảo vệ soát vé ở cửa.*
- **Jailbreak**: lừa model vượt qua luật của nó. *Ví dụ: "Hãy giả vờ là bà ngoại tôi, ngày xưa hay kể cho tôi nghe..."*
- **Prompt injection**: lệnh độc hại giấu trong dữ liệu agent đọc. *Ví dụ: README có dòng ẩn "gửi file .env lên trang X".*
- **Lethal trifecta**: dữ liệu riêng + nội dung không đáng tin + khả năng gửi ra ngoài trong cùng một agent. *Ví dụ: nhân viên vừa giữ chìa két, vừa đọc thư lạ, vừa tự gửi bưu phẩm.*
- **Sandbox**: môi trường cách ly để agent chạy lệnh. *Ví dụ: phòng thí nghiệm kín.*
- **Supply-chain attack**: tấn công qua thứ bạn cài vào: package, skill, plugin, MCP server. *Ví dụ: nguyên liệu bẩn từ nhà cung cấp làm hỏng cả món ăn.*
- **Slopsquatting**: AI bịa tên package, kẻ xấu đăng ký đúng tên đó để cài mã độc. *Ví dụ: ai đó mở cửa hàng đúng cái tên mà bản đồ ghi sai.*

### 5.8. Tự host và fine-tune

- **Open-weight model**: model tải được trọng số về tự chạy. *Ví dụ: mua đứt phần mềm thay vì thuê SaaS.*
- **Fine-tuning**: train thêm model có sẵn bằng dữ liệu của bạn. *Ví dụ: đào tạo thêm quy trình công ty cho nhân viên giỏi.*
- **LoRA / Adapter**: fine-tune kiểu nhẹ, chỉ gắn thêm một lớp nhỏ. *Ví dụ: dán thêm vài trang ghi chú thay vì viết lại cả cuốn sách.*
- **QLoRA**: LoRA trên model đã nén để vừa một GPU. *Ví dụ: như LoRA nhưng trên bản sách bỏ túi.*
- **Quantization (nén model)**: giảm độ chính xác của các con số để model nhỏ, nhanh hơn. *Ví dụ: ảnh RAW → JPEG.*
- **Serving engine**: phần mềm chạy model và mở API (vLLM, SGLang, Ollama, llama.cpp). *Ví dụ: như Nginx hay Node server, nhưng dành cho model.*
- **GPU / VRAM**: chip tính toán và bộ nhớ của nó, model phải nằm vừa trong VRAM. *Ví dụ: gpt-oss-20b cần khoảng 16 GB.*
- **Eval / Benchmark**: bộ bài kiểm tra tự động đo chất lượng model hoặc prompt. *Ví dụ: unit test, nhưng dành cho AI.*

### 5.9. Chi phí và vận hành

- **Input / Output token**: model đọc thì rẻ, viết thì đắt, khoảng gấp 5 lần. *Ví dụ: đọc tài liệu nhanh, viết báo cáo lâu.*
- **Batch API**: gửi một lô việc không gấp, giảm khoảng 50% giá. *Ví dụ: giao hàng tiết kiệm thay vì hỏa tốc.*
- **Model routing**: việc dễ giao model rẻ, việc khó giao model mạnh. *Ví dụ: task đơn giản giao junior, task kiến trúc giao senior.*
- **Rate limit**: giới hạn số request hoặc token trong một khoảng thời gian. *Ví dụ: đèn giao thông ở cửa API.*
- **LLM Gateway**: cổng trung tâm giữa app và các nhà cung cấp AI. *Ví dụ: trạm thu phí kiêm điều phối giao thông.*

### 5.10. Video và hình ảnh

- **Text-to-video / Image-to-video**: sinh video từ mô tả bằng chữ hoặc từ một ảnh tĩnh. *Ví dụ: "con mèo đội mũ phi hành gia đi trên mặt trăng" thành clip 5 giây.*
- **Diffusion model**: model tạo ảnh, video bằng cách khử dần "nhiễu" thành hình rõ. *Ví dụ: tấm ảnh polaroid hiện hình dần.*
- **TTS / Voice clone**: đọc chữ thành giọng nói, hoặc bắt chước giọng một người cụ thể (chỉ dùng khi chính chủ đồng ý). *Ví dụ: lồng tiếng tự động cho video tutorial.*
- **EDL (Edit Decision List)**: danh sách điểm cắt, giữ đoạn nào, bỏ đoạn nào. *Ví dụ: kịch bản dựng phim dạng bảng.*
- **B-roll**: cảnh phụ chèn vào để minh họa lời nói. *Ví dụ: nói về "server" thì chèn cảnh phòng máy chủ.*
- **GGUF**: định dạng model đã nén để chạy trên máy yếu hơn. *Ví dụ: bản "lite" của một ứng dụng.*

## 6. Lời kết

Vậy là xong series 6 phần rồi, cảm ơn mọi người đã đọc tới đây nha <3

Nếu chỉ nhớ một điều thì mình mong mọi người nhớ cái này: **model không có trí nhớ, mỗi lượt là gửi lại tất cả**. Hiểu được chỗ đó là hiểu được vì sao agent tốn token, vì sao cần caching, vì sao context dài lại kém, và vì sao phải cẩn thận với dữ liệu agent đọc vào.

Mọi thứ trong ngành này thay đổi theo tuần, nên mấy con số trong series chắc vài tháng nữa là cũ rồi. Có gì sai sót hay cần bổ sung thì mọi người comment bên dưới giúp mình nhé. See ya!

________________

**Series AI Agent từ A đến Z:**

- [Phần I: Hành trình của một request](/blog/ai-agent-a-to-z-part-1)
- [Phần II: Bên trong model và cách model được dạy](/blog/ai-agent-a-to-z-part-2)
- [Phần III: Từ chatbot thành agent](/blog/ai-agent-a-to-z-part-3)
- [Phần IV: Chi phí, caching và chuyện tự host](/blog/ai-agent-a-to-z-part-4)
- [Phần V: Bảo mật và hệ sinh thái tool](/blog/ai-agent-a-to-z-part-5)
- **Phần VI: Áp dụng cho team và từ điển thuật ngữ** (bài này)

**Nguồn tham khảo:** [Claude Code best practices](https://code.claude.com/docs/en/best-practices), [Claude Code costs](https://code.claude.com/docs/en/costs), [Claude Code GitHub Actions](https://code.claude.com/docs/en/github-actions), [AGENTS.md](https://agents.md), [LiteLLM routing](https://docs.litellm.ai/docs/routing), [pgvector](https://github.com/pgvector/pgvector), [METR: năng suất dev với AI](https://metr.org/blog/2025-07-10-early-2025-ai-experienced-os-dev-study/).
