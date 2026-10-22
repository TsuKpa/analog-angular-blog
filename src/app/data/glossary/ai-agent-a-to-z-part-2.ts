import { Glossary } from './types';

/** Terms used only in "AI Agent từ A đến Z" part II. */
export const AI_AGENT_PART_2_GLOSSARY: Glossary = {
  "parameter": {
    title: "Parameter (tham số)",
    definition: "Từng con số trong bộ não đó. \"70B\" là 70 tỷ tham số.",
    example: "như số nơ-ron; nhiều hơn thường khôn hơn nhưng nặng và tốn hơn.",
    category: "A. Nền tảng",
  },
  "embedding": {
    title: "Embedding",
    definition: "Biến mỗi token thành một tọa độ trên \"bản đồ ý nghĩa\", chữ gần nghĩa nằm gần nhau.",
    example: "\"vua\" gần \"hoàng hậu\", xa \"bàn phím\".",
    category: "A. Nền tảng",
  },
  "transformer": {
    title: "Transformer",
    definition: "Kiến trúc nền của hầu hết LLM hiện nay.",
    example: "như \"kiến trúc MVC\" của thế giới AI.",
    category: "B. Bên trong model",
  },
  "attention": {
    title: "Attention",
    definition: "Cơ chế cho mỗi chữ \"nhìn lại\" các chữ khác để hiểu ngữ cảnh.",
    example: "trong \"Con mèo đuổi con chuột vì nó đói\", attention giúp hiểu \"nó\" là con mèo.",
    category: "B. Bên trong model",
  },
  "next-token": {
    title: "Next-token prediction",
    definition: "Việc duy nhất model làm: đoán token tiếp theo, rồi lặp lại.",
    example: "trò nối chữ, nhưng chơi cực giỏi.",
    category: "B. Bên trong model",
  },
  "temperature": {
    title: "Temperature",
    definition: "Núm chỉnh độ \"ngẫu hứng\" khi chọn chữ. Thấp thì ổn định, cao thì sáng tạo nhưng dễ lan man.",
    example: "0 như học sinh trả lời đúng sách giáo khoa, 1 như nhà thơ.",
    category: "B. Bên trong model",
  },
  "top-p": {
    title: "Top-p",
    definition: "Chỉ bốc thăm trong nhóm chữ có khả năng cao nhất, cộng lại đủ p (ví dụ 90%).",
    example: "chọn món, nhưng chỉ trong top món bán chạy.",
    category: "B. Bên trong model",
  },
  "kv-cache": {
    title: "KV cache",
    definition: "Phần \"đã hiểu\" của các token trước được lưu lại, nên viết token tiếp theo không phải tính lại từ đầu.",
    example: "ghi chú bên lề khi đọc sách.",
    category: "B. Bên trong model",
  },
  "prefill": {
    title: "Prefill",
    definition: "Bước đọc toàn bộ prompt cùng lúc, song song trên GPU. Prompt càng dài bước này càng lâu.",
    example: "lướt đọc đề thi.",
    category: "B. Bên trong model",
  },
  "decode": {
    title: "Decode",
    definition: "Bước viết câu trả lời từng token một, nối tiếp nhau.",
    example: "viết bài thi từng chữ.",
    category: "B. Bên trong model",
  },
  "ttft": {
    title: "TTFT (Time To First Token)",
    definition: "Thời gian chờ đến khi chữ đầu tiên hiện ra.",
    example: "từ lúc gọi món đến khi món đầu tiên được bưng ra.",
    category: "B. Bên trong model",
  },
  "context-rot": {
    title: "Context rot",
    definition: "Context càng dài, model càng dễ \"quên\" hoặc bỏ sót chi tiết ở giữa.",
    example: "bàn chất đầy giấy thì khó tìm tờ quan trọng.",
    category: "B. Bên trong model",
  },
  "hallucination": {
    title: "Hallucination (ảo giác)",
    definition: "Model tự tin bịa ra thứ không có thật.",
    example: "gợi ý dùng array.sortBy() trong JavaScript thuần, hàm không tồn tại.",
    category: "B. Bên trong model",
  },
  "moe": {
    title: "MoE (Mixture of Experts)",
    definition: "Model có nhiều \"chuyên gia\" con, mỗi token chỉ gọi vài chuyên gia, nên to mà vẫn chạy nhanh.",
    example: "bệnh viện 100 bác sĩ, mỗi ca chỉ cần 3–4 người khám.",
    category: "B. Bên trong model",
  },
  "pretraining": {
    title: "Pretraining",
    definition: "Giai đoạn đọc khối lượng chữ và code khổng lồ để học đoán chữ tiếp theo. Đắt nhất.",
    example: "đọc hết thư viện quốc gia, biết nhiều nhưng chưa biết cách trả lời người khác.",
    category: "D. Huấn luyện",
  },
  "base-model": {
    title: "Base model",
    definition: "Model vừa pretrain xong, chỉ biết \"viết tiếp\".",
    example: "hỏi \"Thủ đô Pháp?\", nó có thể viết tiếp \"Thủ đô Đức?\".",
    category: "D. Huấn luyện",
  },
  "sft": {
    title: "SFT / Instruction tuning",
    definition: "Dạy model bằng các cặp hỏi–đáp mẫu.",
    example: "đưa nhân viên mới 10.000 email mẫu trả lời khách.",
    category: "D. Huấn luyện",
  },
  "rlhf": {
    title: "RLHF",
    definition: "Người so sánh hai câu trả lời, chọn câu tốt hơn, model học theo khẩu vị đó.",
    example: "huấn luyện bằng phần thưởng, làm đúng thì được bánh.",
    category: "D. Huấn luyện",
  },
  "reward-model": {
    title: "Reward model",
    definition: "\"Giám khảo máy\" học cách chấm điểm giống con người để chấm thay hàng triệu lần.",
    example: "giám khảo tập sự học theo giám khảo chính.",
    category: "D. Huấn luyện",
  },
  "rlaif": {
    title: "RLAIF / Constitutional AI",
    definition: "Thay người chấm bằng một bộ nguyên tắc (\"hiến pháp\") để AI tự chấm và tự sửa.",
    example: "công ty phát sổ tay quy tắc để nhân viên tự kiểm tra.",
    category: "D. Huấn luyện",
  },
  "dpo": {
    title: "DPO",
    definition: "Học thẳng từ các cặp \"câu A tốt hơn câu B\", không cần giám khảo trung gian.",
    example: "học trực tiếp từ đáp án mẫu.",
    category: "D. Huấn luyện",
  },
  "reasoning": {
    title: "Reasoning model / Thinking token",
    definition: "Model \"nháp\" suy nghĩ trước khi trả lời. Phần nháp tính tiền như output.",
    example: "làm toán nháp ra giấy; giấy nháp cũng tốn mực.",
    category: "D. Huấn luyện",
  },
  "test-time-compute": {
    title: "Test-time compute",
    definition: "Cho model thêm thời gian suy nghĩ lúc trả lời để kết quả tốt hơn, thay vì train thêm.",
    example: "cho thêm 30 phút làm bài thay vì bắt đi học thêm.",
    category: "D. Huấn luyện",
  },
  "effort": {
    title: "Effort",
    definition: "Núm chỉnh mức suy nghĩ (low → max). Cao thì kỹ hơn nhưng tốn hơn.",
    example: "sửa lỗi typo thì không cần họp cả phòng.",
    category: "D. Huấn luyện",
  },
};
