---
title: >
    AI Agent từ A đến Z phần III: Từ chatbot thành agent
description: >
    Model không có tay chân, vậy làm sao nó sửa code, chạy test? Tool use, agent loop, MCP, skill, subagent là gì? Và sự tiến hóa từ prompt engineering đến graph engineering.
authors:
  - Nam Nguyen (TsuKpa)
createdDate: 22 Oct, 2026
lastmod: 2026-10-22T09:20:00.000Z
tags:
  - VietNamese
  - AI
  - AI Agent
  - MCP
topics:
  - blog
tweet:
format: blog
canonical_url:
photo: /blog/images/ai-agent/cover-3.png
seo:
  metatitle: >
    AI Agent từ A đến Z phần III: Từ chatbot thành agent
  metadescription: >
    Model không có tay chân, vậy làm sao nó sửa code, chạy test? Tool use, agent loop, MCP, skill, subagent là gì? Và sự tiến hóa từ prompt engineering đến graph engineering.
publish: true
---

![background](/blog/images/ai-agent/cover-3.png)

Xin chào mọi người, sau 2 phần "lý thuyết suông" ([phần I](/blog/ai-agent-a-to-z-part-1), [phần II](/blog/ai-agent-a-to-z-part-2)) thì giờ mới tới phần mình thích nhất: **agent**.

Chatbot thì trả lời câu hỏi. Còn agent thì **tự làm nhiều bước** để hoàn thành việc: đọc file, chạy lệnh, sửa code, chạy test lại. Khác biệt nằm ở 3 thứ: **tool**, **vòng lặp**, và **phần mềm điều khiển vòng lặp** đó.

## 1. Tool use: model không tự chạy gì cả

Đây là hiểu lầm phổ biến nhất mà mình gặp. Model **không** có tay chân gì hết. Khi cần đọc file, nó chỉ viết ra một "phiếu yêu cầu" có cấu trúc rồi dừng lại với `stop_reason: "tool_use"`. Harness đọc phiếu, tự chạy tool trên máy bạn (hoặc trên server), rồi gửi kết quả lại cho model ở lượt sau.

```json
// Model viết ra (rồi dừng):
{ "type": "tool_use", "name": "run_command", "input": { "cmd": "npm test -- checkout" } }

// Harness chạy lệnh, rồi gửi lại:
{ "type": "tool_result", "content": "FAIL  checkout.test.ts › total is NaN when coupon is empty ..." }
```

> Ví von: sếp viết giấy *"lấy giúp tôi hồ sơ khách hàng A"*, thư ký đi lấy về đặt lên bàn. Sếp không tự rời ghế. Vì thế **quyền** nằm ở thư ký (harness): thư ký có thể từ chối, hỏi lại, hoặc chỉ được vào một số phòng.

Có 3 loại tool:

- **Tool bạn tự định nghĩa**: ví dụ `get_order(id)` gọi vào API nội bộ.
- **Tool có schema do nhà cung cấp định nghĩa sẵn**: như `bash`, `text_editor`, `computer`. Model đã được huấn luyện với tụi nó nên gọi đáng tin cậy hơn, nhưng vẫn chạy ở phía bạn.
- **Tool chạy phía server nhà cung cấp**: như web search, web fetch, code execution. Bạn không phải tự chạy.

## 2. Vòng lặp agent, từng bước một

Để thấy rõ, mình lấy một ví dụ thực tế: *"Trang /checkout lỗi 500, sửa giúp"*.

![Vòng lặp agent](/blog/images/ai-agent/agent-loop.png)

Số token ở đây là ước lượng thôi, nhưng mọi người để ý con số cuối nha:

| Lượt gọi model | Model làm gì | Input gửi lên (token) |
|---|---|---|
| #1 | Nghĩ, gọi `grep "checkout"` | 16.050 |
| #2 | Gọi `read_file page.tsx` | 17.550 |
| #3 | Gọi `read_file lib/payment.ts` | 22.200 |
| #4 | Sửa file | 26.150 |
| #5 | Chạy `npm test` | 27.150 |
| #6 | Đọc log lỗi, sửa tiếp | 33.270 |
| #7 | Chạy lại `npm test` | 34.070 |
| #8 | Trả lời, giải thích nguyên nhân | 34.590 |
| **Tổng** | | **~211.000** |

**Một câu hỏi của bạn = 8 lượt gọi model.** Lượt nào cũng gửi lại toàn bộ context, nên tổng input model phải xử lý (~211k) lớn hơn rất nhiều so với context cuối cùng (~35k). Đây chính là lý do một task agent "bình thường" lại ngốn limit nhanh vậy. Nếu phần đầu trúng cache thì phần lớn số này được tính giá rẻ (phần IV).

## 3. Năm loại agent mọi người sẽ gặp

- **App chat**: claude.ai, ChatGPT, Gemini. Tool chủ yếu chạy phía server (search web, chạy code trong sandbox).
- **Coding agent CLI**: Claude Code, Codex CLI, Gemini CLI, OpenCode. Chạy lệnh và sửa file thật trên máy bạn, xin quyền theo cấu hình.
- **Agent trong IDE**: Cursor, Copilot, Cline, Zed. Giống loại trên nhưng gắn với editor, thấy file đang mở và diff trực quan.
- **Agent chạy nền trên cloud**: nhận issue, tự làm trên máy ảo, mở pull request. Bạn không ngồi xem từng bước.
- **Agent trợ lý cá nhân 24/7**: **OpenClaw** 🦞 (con tôm hùm nổi đình nổi đám năm nay) là ví dụ tiêu biểu. Chạy liên tục, nhận lệnh qua WhatsApp hay Telegram, có quyền vào email, lịch, file. Mạnh nhất và cũng rủi ro nhất, phần V mình sẽ kể.

## 4. MCP: chuẩn chung để cắm tool vào agent

Trước khi có MCP, mỗi agent phải tự viết tích hợp riêng cho GitHub, Jira, database,... Mệt xỉu. **MCP (Model Context Protocol)** là chuẩn mở dựa trên JSON-RPC 2.0: viết một MCP server cho GitHub một lần, mọi agent hỗ trợ MCP đều xài được.

![Kiến trúc MCP](/blog/images/ai-agent/mcp-architecture.png)

Mỗi server cung cấp 3 thứ:

- **Tools**: hành động (tạo issue, query DB, mở trình duyệt,...)
- **Resources**: dữ liệu để đọc
- **Prompts**: mẫu câu lệnh

Đặc tả MCP yêu cầu coi mô tả tool là **dữ liệu không đáng tin**, và phải có sự đồng ý của người dùng trước khi gọi tool.

> MCP là cổng USB-C cho AI: một chuẩn cắm, dùng cho mọi thiết bị. Với dân web thì có thể nghĩ nó giống **LSP**: một language server xài được cho mọi editor.

### 4.1. Cái giá ẩn của MCP

Tên, mô tả và schema của **mọi** tool được nạp vào context ở **mọi** lượt. Anthropic đưa ví dụ 5 MCP server tốn khoảng **55.000 token** chỉ cho phần định nghĩa tool. Độ chính xác chọn tool cũng giảm khi vượt quá khoảng 30–50 tool.

Cách xử lý:

- Chỉ bật server thật sự cần cho dự án.
- Hoặc dùng **tool search**: model chỉ tải định nghĩa tool khi cần. Anthropic cho biết cách này giảm hơn **85%** phần token đó.

## 5. Skills: sổ tay mở khi cần

Một **skill** là một thư mục có file `SKILL.md` (tên, mô tả, hướng dẫn) kèm script hoặc tài liệu phụ. Điểm hay là nó **nạp dần từng tầng** (progressive disclosure):

- **Luôn nạp**: chỉ tên và mô tả, khoảng **100 token** mỗi skill.
- **Khi cần**: nội dung `SKILL.md`, thường dưới **5.000 token**.
- **Khi thật sự cần**: file phụ mới được đọc, script được chạy và chỉ trả về kết quả.

Chuẩn `SKILL.md` giờ được dùng chung bởi nhiều agent: Claude Code, Codex, Cursor, OpenCode, cả OpenClaw. Giống sổ tay quy trình trong ngăn kéo: nhớ mục lục, cần thì mới lật ra.

## 6. Subagent: giao việc cho người khác đọc hộ

Agent chính giao một việc cho **subagent**. Subagent có context window riêng, system prompt riêng, danh sách tool riêng. Nó đọc 200 file, rồi chỉ gửi về bản tóm tắt khoảng **1.000–2.000 token**.

Context của agent chính được giữ gọn gàng. Nhưng đổi lại, tổng token tăng: tài liệu chi phí của Claude Code ghi nhận chế độ nhiều agent phối hợp (agent team) tốn khoảng **7 lần** token so với một phiên thường. Nên xài subagent cũng phải cân nhắc nha mọi người.

## 7. Memory, RAG và context engineering

- **Memory**: model không nhớ, nên "trí nhớ" thực ra là file do harness đọc vào mỗi phiên: `CLAUDE.md`, `AGENTS.md`, thư mục ghi chú,... Nhớ là file này nằm trong context ở **mọi** lượt, viết dài quá là tốn đó.
- **RAG**: tìm đoạn tài liệu liên quan trong **vector database** rồi kẹp vào prompt. Hợp với kiến thức riêng hoặc mới. Coding agent ngày nay thường chọn cách **"lấy đúng lúc"**: không nạp trước, mà để agent tự `grep`, tự mở file khi cần.
- **Context engineering**: chọn đúng thông tin để đặt vào context, không thiếu, không thừa.
- **Compaction**: khi context gần đầy, harness tóm tắt phần cũ rồi làm tiếp. Bước an toàn đầu tiên thường là xóa bớt kết quả tool cũ. Ghi chú có cấu trúc (file `NOTES.md`, danh sách việc) giúp agent không mất dấu sau khi tóm tắt.

## 8. Sự tiến hóa của AI Engineering

Cách làm việc với AI đã đi qua 4 tầng. Tầng sau không thay thế tầng trước mà **bọc ra ngoài** tầng trước, giống búp bê Nga vậy:

![Bốn tầng AI Engineering](/blog/images/ai-agent/ai-engineering-layers.png)

| Tầng | Điều khiển cái gì | Ví von nhà bếp | Trong công việc của team |
|---|---|---|---|
| **Prompt Engineering** | Câu chữ, chỉ dẫn gửi cho model | Viết công thức món ăn thật rõ | Prompt cụ thể, có ví dụ mẫu, nêu định dạng mong muốn |
| **Context Engineering** | Model được thấy thông tin, tài liệu nào | Bày đúng nguyên liệu lên bàn | `CLAUDE.md`, `@file`, MCP, RAG, `/compact` |
| **Loop Engineering** | Vòng tự sửa lặp lại quanh một lần gọi model | Đầu bếp nếm, nêm, nếm lại đến khi vừa | Agent chạy test → đọc lỗi → sửa → chạy lại đến khi pass, có điều kiện dừng |
| **Graph Engineering** | Cách nối nhiều loop, agent, bước kiểm tra cố định thành một sơ đồ phối hợp | Cả bếp nhà hàng: bếp trưởng chia việc, mỗi trạm một món, khâu kiểm món trước khi ra | Router chia task, subagent chạy song song, verifier riêng, cổng duyệt của người, review trên CI |

### 8.1. Mẫu "kim cương" của graph engineering

![Mẫu kim cương](/blog/images/ai-agent/graph-diamond.png)

Chia việc → nhiều worker song song → mỗi worker có **verifier riêng** (không phải chính nó tự chấm) → gộp → người duyệt. Verifier nên ưu tiên kiểm tra bằng code cố định: lint, type-check, unit test.

### 8.2. Khi nào dừng ở loop, khi nào cần graph?

Phần lớn việc hằng ngày chỉ cần **một loop tốt**: một agent, có test để tự kiểm, có điều kiện dừng. Chỉ chuyển lên graph khi việc có nhánh rẽ rõ ràng, có phần làm song song được, hoặc cần nhiều "chuyên gia" phối hợp.

Graph càng phức tạp thì càng tốn token (mỗi node là một context riêng) và càng khó debug. Đừng over-engineering nha :D

### 8.3. Ví dụ thật

- **Loop**: repo `video-use` render video xong tự đánh giá kết quả, thấy lỗi thì sửa và render lại, tối đa 3 lần.
- **Context**: cũng `video-use`, không đưa cả video cho model mà chỉ đưa transcript có mốc thời gian, cộng vài khung hình ở chỗ cần quyết định.
- **Graph**: `OpenMontage` đi qua research → script → assets → edit → compose, có cổng chờ người duyệt ở các bước sáng tạo, và kiểm tra bằng code cố định (ffprobe, kiểm tra phụ đề) ở cuối.

Lưu ý nhỏ: "loop engineering" và "graph engineering" là thuật ngữ mới (theo bài viết của Aishwarya Srinivasan ngày 28/8/2026), chưa phải chuẩn ngành. Repo [codejunkie99/graph-engineering](https://github.com/codejunkie99/graph-engineering) dùng chữ "graph" theo 2 nghĩa: knowledge graph (thứ agent nhớ) và task graph (cách agent làm). Ở đây mình dùng nghĩa thứ hai.

## 9. Tổng kết

- Model không tự chạy gì cả, nó chỉ viết "phiếu yêu cầu", **harness** mới là người làm và giữ quyền.
- Một câu hỏi có thể thành nhiều lượt gọi model, mỗi lượt gửi lại cả context.
- MCP là chuẩn cắm tool, nhưng mỗi tool đều chiếm chỗ trong context.
- Skill nạp dần, subagent giữ context gọn nhưng tốn tổng token hơn.
- Từ prompt → context → loop → graph: đa số việc chỉ cần một loop tốt.

Phần sau mình sẽ nói tới chuyện tiền bạc: token tính tiền ra sao, prompt caching hoạt động thế nào, và khi nào nên tự host model mã nguồn mở. Hẹn gặp lại ở phần IV. See ya!

________________

**Series AI Agent từ A đến Z:**

- [Phần I: Hành trình của một request](/blog/ai-agent-a-to-z-part-1)
- [Phần II: Bên trong model và cách model được dạy](/blog/ai-agent-a-to-z-part-2)
- **Phần III: Từ chatbot thành agent** (bài này)
- [Phần IV: Chi phí, caching và chuyện tự host](/blog/ai-agent-a-to-z-part-4)
- [Phần V: Bảo mật và hệ sinh thái tool](/blog/ai-agent-a-to-z-part-5)
- [Phần VI: Áp dụng cho team và từ điển thuật ngữ](/blog/ai-agent-a-to-z-part-6)

**Nguồn tham khảo:** [Tool use](https://platform.claude.com/docs/en/agents-and-tools/tool-use/overview), [Tool search](https://platform.claude.com/docs/en/agents-and-tools/tool-use/tool-search-tool), [Agent Skills](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/overview), [MCP specification](https://modelcontextprotocol.io/specification/latest), [Effective context engineering](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents), [Building effective agents](https://www.anthropic.com/engineering/building-effective-agents), [Claude Code costs](https://code.claude.com/docs/en/costs), [Graph Engineering Explained](https://aishwaryasrinivasan.substack.com/p/graph-engineering-explained).
