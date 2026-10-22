import { Glossary } from './types';

/** Terms used only in "AI Agent từ A đến Z" part I. */
export const AI_AGENT_PART_1_GLOSSARY: Glossary = {
  "llm": {
    title: "LLM (Large Language Model)",
    definition: "Chương trình đã đọc lượng chữ khổng lồ nên rất giỏi đoán chữ tiếp theo. Claude, GPT, Gemini đều là LLM.",
    example: "autocomplete trên bàn phím điện thoại, nhưng đã đọc cả thư viện.",
    category: "A. Nền tảng",
  },
  "token": {
    title: "Token",
    definition: "Đơn vị chữ mà AI đọc và tính tiền, thường là một mảnh của từ.",
    example: "\"unbelievable\" → \"un\" + \"believ\" + \"able\" = 3 token. Tiếng Việt thường tốn token hơn tiếng Anh.",
    category: "A. Nền tảng",
  },
  "tokenizer": {
    title: "Tokenizer",
    definition: "Bộ \"cắt chữ\" thành token và đổi mỗi token thành một con số ID. Mỗi model có tokenizer riêng.",
    example: "như máy cắt bánh mì, mỗi tiệm cắt lát dày mỏng khác nhau.",
    category: "A. Nền tảng",
  },
  "bpe": {
    title: "BPE (Byte-Pair Encoding)",
    definition: "Cách cắt chữ phổ biến: ghép dần các cặp ký tự hay đi cùng nhau thành một mảnh.",
    example: "như tốc ký, cụm hay gặp như \"ing\", \"tion\" được viết bằng một ký hiệu.",
    category: "A. Nền tảng",
  },
  "context-window": {
    title: "Context window",
    definition: "Lượng token tối đa model nhìn thấy trong một lần gọi, tính cả câu hỏi lẫn câu trả lời.",
    example: "mặt bàn làm việc chỉ để được chừng ấy giấy.",
    category: "A. Nền tảng",
  },
  "prompt": {
    title: "Prompt / System prompt",
    definition: "Prompt là lời bạn gửi. System prompt là \"nội quy\" do app đặt sẵn, model đọc trước mọi câu hỏi.",
    example: "system prompt là bản mô tả công việc; prompt là yêu cầu hằng ngày.",
    category: "A. Nền tảng",
  },
  "stateless": {
    title: "Stateless (không trạng thái)",
    definition: "Model không nhớ gì giữa các lần gọi. App phải gửi lại toàn bộ lịch sử mỗi lần.",
    example: "gọi tổng đài, lần nào cũng gặp nhân viên mới, phải kể lại từ đầu.",
    category: "A. Nền tảng",
  },
  "streaming": {
    title: "Streaming (SSE)",
    definition: "Gửi câu trả lời về từng mảnh thay vì đợi xong hết.",
    example: "xem video online vừa tải vừa xem.",
    category: "B. Bên trong model",
  },
  "multimodal": {
    title: "Multimodal",
    definition: "Model nhận nhiều loại input: chữ, ảnh, âm thanh, video.",
    example: "người vừa đọc, vừa nhìn, vừa nghe được.",
    category: "C. Đa phương thức",
  },
  "vision-encoder": {
    title: "Vision encoder / Patch",
    definition: "Ảnh được cắt thành ô vuông nhỏ (Claude dùng ô 28×28 px), mỗi ô thành một token.",
    example: "tranh ghép puzzle; ảnh 1000×1000 ≈ 1.296 token.",
    category: "C. Đa phương thức",
  },
  "ocr": {
    title: "OCR",
    definition: "Công cụ đọc chữ trong ảnh và chuyển thành text.",
    example: "chụp hóa đơn rồi copy được chữ trong đó.",
    category: "C. Đa phương thức",
  },
  "stt-tts": {
    title: "STT / TTS / Speech-to-speech",
    definition: "STT: giọng nói thành chữ. TTS: chữ thành giọng nói. Speech-to-speech: model nghe và nói trực tiếp, giữ được ngữ điệu.",
    example: "nói qua phiên dịch viên so với nói chuyện trực tiếp.",
    category: "C. Đa phương thức",
  },
  "rate-limit": {
    title: "Rate limit",
    definition: "Giới hạn số request hoặc token trong một khoảng thời gian.",
    example: "đèn giao thông.",
    category: "I. Chi phí và vận hành",
  },
};
