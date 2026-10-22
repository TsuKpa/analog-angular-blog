---
title: >
    AI Agent từ A đến Z phần II: Bên trong model và cách model được dạy
description: >
    Attention, KV cache, temperature, context window là gì? Vì sao chữ đầu tiên lâu hiện? Model được huấn luyện qua những giai đoạn nào để từ máy đoán chữ thành trợ lý biết code?
authors:
  - Nam Nguyen (TsuKpa)
createdDate: 22 Oct, 2026
lastmod: 2026-10-22T09:10:00.000Z
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
photo: /blog/images/ai-agent/cover-2.png
seo:
  metatitle: >
    AI Agent từ A đến Z phần II: Bên trong model và cách model được dạy
  metadescription: >
    Attention, KV cache, temperature, context window là gì? Vì sao chữ đầu tiên lâu hiện? Model được huấn luyện qua những giai đoạn nào để từ máy đoán chữ thành trợ lý biết code?
publish: true
---

![background](/blog/images/ai-agent/cover-2.png)

Xin chào mọi người, ở [phần I](/blog/ai-agent-a-to-z-part-1) mình đã đi qua hành trình của một request, từ lúc nhấn Enter cho tới khi chữ hiện lên. Phần này mình sẽ "mở nắp" cái hộp model ra xem bên trong có gì, và model được dạy như thế nào.

Yên tâm là **không có công thức toán nào** đâu nha :D Chỉ cần nắm 5 bước là đủ hiểu vì sao có độ trễ, vì sao có cache, và vì sao context dài lại kém đi.

## 1. Bên trong model, phiên bản dễ hiểu

### 1.1. Năm bước của một model

1. **Token → embedding**: mỗi token ID được đổi thành một vector, giống như tọa độ trên một "bản đồ ý nghĩa". Từ gần nghĩa thì nằm gần nhau (ví dụ "vua" gần "hoàng hậu", xa "bàn phím").

2. **Qua hàng chục lớp transformer**: ở mỗi lớp, cơ chế **attention** cho mỗi token "nhìn" các token đứng trước để lấy ngữ cảnh, sau đó một mạng nhỏ biến đổi tiếp.

3. **Ra một bảng xác suất** cho mọi token có thể đứng tiếp theo, thường là hơn 100.000 lựa chọn.

4. **Sampler chọn một token**, dựa theo mấy cái núm chỉnh **temperature** và **top-p**.

5. **Nối token đó vào cuối dãy, rồi lặp lại** cho tới khi model sinh ra token "dừng".

Vậy thôi đó, mọi thứ "thông minh" mà mọi người thấy đều đến từ việc lặp đi lặp lại bước đoán token tiếp theo này ^^

### 1.2. Temperature: núm chỉnh độ "ngẫu hứng"

Giả sử model đang cần đoán token tiếp theo sau câu *"Thủ đô của Việt Nam là"*:

![Temperature](/blog/images/ai-agent/temperature.png)

Số liệu ở hình là minh họa nha. Temperature thay đổi bảng xác suất này như sau:

| Token | Temperature 0 | Temperature 0,5 | Temperature 1 | Temperature 2 |
|---|---|---|---|---|
| "Hà" | 100% | ~99,7% | 90% | ~59% |
| "thành" | 0% | ~0,2% | 4% | ~12% |
| "một" | 0% | ~0,1% | 3% | ~11% |
| "TP", "Sài", "nơi" | 0% | ~0% | 3% | ~18% |

- **Temperature thấp (về 0)**: luôn chọn token có xác suất cao nhất, câu trả lời ổn định, lặp lại được. Kiểu học sinh trả lời đúng sách giáo khoa.
- **Temperature cao (lên 2)**: các lựa chọn hiếm có cơ hội hơn, sáng tạo hơn nhưng dễ lạc đề. Kiểu nhà thơ đang "phiêu" :D
- **Top-p**: chỉ bốc thăm trong nhóm token có khả năng cao nhất, cộng lại đủ p (ví dụ 90%). Giống chọn món nhưng chỉ chọn trong top món bán chạy.

### 1.3. Attention: vì sao model hiểu ngữ cảnh

Trong câu *"Con mèo đuổi con chuột vì **nó** đói"*, để hiểu "nó" là ai, token "nó" phải chú ý mạnh vào "con mèo" và ít vào "con chuột". Attention học được những mối liên kết đó từ dữ liệu.

Với code cũng y chang: khi bạn viết `user.`, model "nhìn lại" chỗ `user` được khai báo để biết có những field nào mà gợi ý.

### 1.4. KV cache, prefill và decode: vì sao chữ đầu tiên lâu hiện

Mỗi token đã xử lý để lại "ghi chú" (key, value) để các token sau tra cứu. Mấy cái ghi chú này được giữ lại trong **KV cache**, nên sinh token thứ 500 không phải tính lại 499 token trước.

- **Prefill**: đọc toàn bộ prompt cùng lúc, song song trên GPU. Prompt 100k token thì bước này mất thời gian, đó chính là thời gian chờ chữ đầu tiên (**TTFT - Time To First Token**).
- **Decode**: sinh từng token một, nối tiếp nhau. Tốc độ tính bằng token/giây. Câu trả lời dài gấp đôi thì mất gần gấp đôi thời gian.

> Ví von: prefill như đọc đề thi, lướt nhanh cả tờ. Decode như viết bài, từng chữ một. KV cache là ghi chú bên lề, nên viết tới câu thứ 10 không phải đọc lại đề từ đầu.

Và đây là chỗ hay nè: **prompt caching** (phần III) thực chất là nhà cung cấp lưu lại KV cache của phần đầu prompt giữa các request. Lần sau gửi đúng phần đầu đó, họ bỏ qua được bước prefill cho phần ấy, nên vừa rẻ hơn vừa nhanh hơn.

### 1.5. Context window và "context rot"

**Context window** là tổng số token model nhìn được trong một lần gọi, tính cả input lẫn output. Năm 2026 thì mấy model lớn đều có khoảng **1 triệu token**.

Nhưng lớn không có nghĩa là nên nhồi cho đầy. Anthropic có cảnh báo hiện tượng **context rot**: context càng dài, model càng dễ bỏ sót chi tiết nằm ở giữa, và mỗi lượt càng đắt.

> Context window là mặt bàn làm việc. Bàn to để được nhiều giấy, nhưng giấy chất càng cao thì càng khó tìm đúng tờ cần.

### 1.6. Mixture of Experts (MoE)

Nhiều model lớn, nhất là model mã nguồn mở, được chia thành nhiều "chuyên gia" con. Mỗi token chỉ đi qua vài chuyên gia thôi. Ví dụ DeepSeek V4 Pro có khoảng **1,6 nghìn tỷ tham số** nhưng mỗi token chỉ dùng khoảng **49 tỷ**. Nhờ vậy model rất "to" mà vẫn chạy đủ nhanh.

Đó là lý do mọi người hay thấy cách ghi kiểu `235B-A22B`: tổng số tham số và số tham số hoạt động. Giống bệnh viện có 100 bác sĩ nhưng mỗi ca chỉ cần 3–4 người khám.

### 1.7. Hệ quả thực tế: hallucination

Vì model chỉ đoán token "hợp lý nhất", nó có thể tự tin viết ra thứ **không tồn tại**: một hàm `array.sortBy()` trong JavaScript thuần, một option config chưa từng có, một package npm bịa tên,... Model không "biết" là mình sai đâu.

Cách phòng là **cho nó kiểm chứng**: chạy code, chạy test, tra tài liệu đúng phiên bản của thư viện đang dùng (ví dụ MCP Context7 mình giới thiệu ở [phần III](/blog/ai-agent-a-to-z-part-3)).

## 2. Model được dạy như thế nào

Một model như Claude hay GPT đi qua 4 giai đoạn huấn luyện, mỗi giai đoạn dạy một kỹ năng khác nhau:

![Bốn giai đoạn huấn luyện](/blog/images/ai-agent/training-pipeline.png)

### 2.1. Pretraining → base model

Model đọc lượng chữ và code khổng lồ, chỉ học đúng 1 việc là **đoán token tiếp theo**. Đây là giai đoạn đắt nhất, tốn hàng tháng trời GPU.

Kết quả là một **base model** biết rất nhiều nhưng chỉ biết "viết tiếp". Hỏi nó *"Thủ đô của Pháp?"* nó có thể viết tiếp *"Thủ đô của Đức?"* như đang chép một đề thi :v

### 2.2. SFT / Instruction tuning

Cho model học hàng chục nghìn cặp "câu hỏi → câu trả lời mẫu" do người viết. Sau bước này model biết trả lời theo yêu cầu và gọi tool đúng định dạng.

Giống như đưa nhân viên mới xem 10.000 email mẫu trả lời khách hàng vậy.

### 2.3. Preference tuning: học "câu nào tốt hơn"

- **RLHF**: người chấm chọn câu trả lời tốt hơn giữa 2 câu, một "giám khảo máy" (reward model) học khẩu vị đó, rồi model được tối ưu theo giám khảo.
- **Constitutional AI / RLAIF** (Anthropic): thay người chấm bằng một bộ nguyên tắc viết sẵn ("hiến pháp") để AI tự phê bình và tự sửa. Kiểu công ty phát sổ tay quy tắc để nhân viên tự kiểm tra thay vì sếp duyệt từng việc.
- **DPO**: học thẳng từ các cặp "A tốt hơn B", không cần dựng giám khảo trung gian.

Một kết quả nổi tiếng cho thấy bước này quan trọng cỡ nào: trong nghiên cứu **InstructGPT**, người dùng thích câu trả lời của model **1,3 tỷ tham số** đã qua RLHF hơn model GPT-3 **175 tỷ tham số** chưa qua RLHF. Nhỏ mà có võ ^^

### 2.4. RL cho reasoning

Cho model giải những bài có đáp án kiểm chứng được (toán, code có test), thưởng khi giải đúng. Model tự học cách nháp, tự kiểm tra, quay lại sửa. **DeepSeek-R1** đã chứng minh cách này hoạt động chỉ với RL, không cần người viết mẫu lời giải.

Đây cũng là lý do model ngày càng giỏi code: code chạy pass test hay không là biết liền, nên rất dễ "chấm điểm" tự động.

## 3. Thinking token và effort: bạn trả tiền cho cả giấy nháp

Reasoning model "nghĩ" trước khi trả lời: nó sinh ra một đoạn suy luận dài, rồi mới viết câu trả lời. Cái này gọi là **test-time compute**: tốn thêm token lúc trả lời để được kết quả tốt hơn.

- **Thinking token tính tiền như output**, tức là loại token đắt nhất. Thứ bạn thấy trên màn hình thường chỉ là bản tóm tắt, còn toàn bộ phần suy luận vẫn bị tính tiền.
- Các model Claude đời mới dùng **adaptive thinking**: model tự quyết nghĩ bao nhiêu, bạn điều chỉnh bằng núm **effort** (low → medium → high → xhigh → max). Fable 5.1, Opus 5.5 và Sonnet 5.5 không tắt hẳn được thinking, nên effort là cách điều chỉnh duy nhất.
- OpenAI có các mức reasoning từ low tới max, Gemini có low, medium, high.

> Sửa một lỗi typo thì không cần triệu tập cả phòng họp. Để effort max cho việc đơn giản là đang trả tiền cho rất nhiều giấy nháp không cần thiết đó mọi người.

## 4. Thuật ngữ trong bài

- **Embedding**: biến mỗi token thành một tọa độ trên "bản đồ ý nghĩa". *Ví dụ: "vua" gần "hoàng hậu", xa "bàn phím".*
- **Transformer**: kiến trúc nền của hầu hết LLM hiện nay. *Ví dụ: như "kiến trúc MVC" của thế giới AI.*
- **Attention**: cơ chế cho mỗi chữ "nhìn lại" các chữ khác để hiểu ngữ cảnh. *Ví dụ: trong "Con mèo đuổi con chuột vì nó đói", attention giúp hiểu "nó" là con mèo.*
- **Next-token prediction**: việc duy nhất model làm, đoán token tiếp theo rồi lặp lại. *Ví dụ: trò nối chữ, nhưng chơi cực giỏi.*
- **Temperature**: núm chỉnh độ "ngẫu hứng" khi chọn chữ. *Ví dụ: 0 như học sinh trả lời đúng sách giáo khoa, 1 như nhà thơ.*
- **Top-p**: chỉ bốc thăm trong nhóm chữ có khả năng cao nhất, cộng lại đủ p. *Ví dụ: chọn món, nhưng chỉ trong top món bán chạy.*
- **KV cache**: phần "đã hiểu" của các token trước được lưu lại. *Ví dụ: ghi chú bên lề khi đọc sách.*
- **Prefill**: bước đọc toàn bộ prompt cùng lúc. *Ví dụ: lướt đọc đề thi.*
- **Decode**: bước viết câu trả lời từng token một. *Ví dụ: viết bài thi từng chữ.*
- **TTFT (Time To First Token)**: thời gian chờ chữ đầu tiên hiện ra. *Ví dụ: từ lúc gọi món đến khi món đầu tiên được bưng ra.*
- **Context rot**: context càng dài, model càng dễ bỏ sót chi tiết ở giữa. *Ví dụ: bàn chất đầy giấy thì khó tìm tờ quan trọng.*
- **Hallucination (ảo giác)**: model tự tin bịa ra thứ không có thật. *Ví dụ: gợi ý dùng `array.sortBy()` trong JavaScript thuần.*
- **MoE (Mixture of Experts)**: model có nhiều "chuyên gia" con, mỗi token chỉ gọi vài chuyên gia. *Ví dụ: bệnh viện 100 bác sĩ, mỗi ca chỉ cần 3–4 người khám.*
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

## 5. Tổng kết

- Model = bản đồ ý nghĩa (embedding) + nhiều lớp attention + một bảng xác suất + sampler.
- Chữ đầu tiên lâu hiện vì bước **prefill**, chữ sau nhanh hơn nhờ **KV cache**.
- Context dài không miễn phí: tốn tiền hơn và model dễ "quên" chi tiết hơn.
- Model được dạy qua 4 bước: pretraining → SFT → preference tuning → RL cho reasoning.
- Thinking token tính tiền như output, nên chỉnh effort cho hợp với việc.

Phần cuối mới là phần mình thích nhất: **agent**. Model không có tay chân, vậy làm sao nó sửa được code, chạy được test? MCP, skill, subagent là gì? Prompt caching giúp tiết kiệm tiền ra sao, và làm sao để agent không bị lừa? Hẹn gặp lại mọi người ở phần III. See ya!

________________

**Series AI Agent từ A đến Z:**

- [Phần I: Hành trình của một request](/blog/ai-agent-a-to-z-part-1)
- **Phần II: Bên trong model và cách model được dạy** (bài này)
- [Phần III: Agent, chi phí và bảo mật](/blog/ai-agent-a-to-z-part-3)

**Nguồn tham khảo:** [Attention Is All You Need](https://arxiv.org/abs/1706.03762), [InstructGPT](https://arxiv.org/abs/2203.02155), [DPO](https://arxiv.org/abs/2305.18290), [DeepSeek-R1](https://arxiv.org/abs/2501.12948), [Constitutional AI](https://www.anthropic.com/research/constitutional-ai-harmlessness-from-ai-feedback), [Adaptive thinking](https://platform.claude.com/docs/en/build-with-claude/adaptive-thinking), [Context windows](https://platform.claude.com/docs/en/build-with-claude/context-windows), [PagedAttention](https://arxiv.org/abs/2309.06180).
