import { Glossary } from './types';

/** Terms not used by any post yet; available for future posts. */
export const EXTRA_GLOSSARY: Glossary = {
  "weights": {
    title: "Model / Weights (trọng số)",
    definition: "\"Bộ não\" của AI, thực chất là một file chứa hàng tỷ con số.",
    example: "như file .exe, không đọc hiểu được, chỉ chạy được.",
    category: "A. Nền tảng",
  },
  "inference": {
    title: "Inference",
    definition: "Lúc model chạy để trả lời, khác với lúc huấn luyện.",
    example: "training là đi học, inference là đi làm.",
    category: "A. Nền tảng",
  },
  "agentic-loop": {
    title: "Agentic loop",
    definition: "Vòng \"nghĩ → dùng tool → xem kết quả → nghĩ tiếp\" cho đến khi xong.",
    example: "debug: giả thuyết → thêm log → chạy → xem → sửa.",
    category: "E. Agent",
  },
  "tool-use": {
    title: "Tool use / Function calling",
    definition: "Model không tự chạy gì cả, chỉ viết \"phiếu yêu cầu\"; harness chạy rồi trả kết quả.",
    example: "sếp viết giấy, thư ký đi lấy hồ sơ.",
    category: "E. Agent",
  },
  "gateway-channel": {
    title: "Gateway / Channel (OpenClaw)",
    definition: "Gateway là bộ điều phối trung tâm của agent; channel là kết nối tới từng app nhắn tin.",
    example: "tổng đài và các đường dây điện thoại.",
    category: "E. Agent",
  },
  "heartbeat": {
    title: "Heartbeat",
    definition: "Agent tự \"thức dậy\" định kỳ để kiểm tra có việc gì cần làm, không đợi bạn nhắn.",
    example: "bảo vệ đi tuần mỗi giờ.",
    category: "E. Agent",
  },
  "harness-engineering": {
    title: "Harness engineering",
    definition: "Thiết kế \"khung xe\" quanh model: tool, quyền, hook, cách quản lý context.",
    example: "công việc của đội làm Claude Code hay Cursor.",
    category: "F. Các tầng AI Engineering",
  },
  "node-edge": {
    title: "Node / Edge / State",
    definition: "Node là một bước, edge là mũi tên chuyển bước (có thể kèm điều kiện), state là \"bảng trắng chung\" mọi bước cùng đọc ghi.",
    example: "sơ đồ quy trình duyệt đơn nghỉ phép.",
    category: "F. Các tầng AI Engineering",
  },
  "topology": {
    title: "Topology",
    definition: "Hình dạng tổng thể của sơ đồ: thẳng, rẽ nhánh, song song hay vòng lặp.",
    example: "tuyến xe buýt thẳng so với mạng lưới có trạm trung chuyển.",
    category: "F. Các tầng AI Engineering",
  },
  "kg-tg": {
    title: "Knowledge graph / Task graph",
    definition: "Knowledge graph lưu kiến thức dạng \"thực thể – quan hệ\" (thứ agent nhớ). Task graph mô tả thứ tự công việc (cách agent làm).",
    example: "cây gia phả so với sơ đồ Gantt.",
    category: "F. Các tầng AI Engineering",
  },
  "guardrail": {
    title: "Guardrail",
    definition: "Các lớp chặn để AI không làm điều sai hoặc nguy hiểm.",
    example: "lan can trên cầu.",
    category: "G. An toàn",
  },
  "supply-chain": {
    title: "Supply-chain attack",
    definition: "Tấn công qua thứ bạn cài vào: package, skill, plugin, MCP server.",
    example: "nguyên liệu bẩn từ nhà cung cấp làm hỏng cả món ăn.",
    category: "G. An toàn",
  },
  "quantization": {
    title: "Quantization (nén model)",
    definition: "Giảm độ chính xác của các con số để model nhỏ, nhanh hơn, mất chút chất lượng.",
    example: "ảnh RAW → JPEG.",
    category: "H. Tự host và fine-tune",
  },
  "serving": {
    title: "Serving engine",
    definition: "Phần mềm chạy model và mở API: vLLM, SGLang cho production; Ollama, llama.cpp cho laptop.",
    example: "như Nginx hay Node server, nhưng dành cho model.",
    category: "H. Tự host và fine-tune",
  },
  "vram": {
    title: "GPU / VRAM",
    definition: "GPU là chip tính toán, VRAM là bộ nhớ của GPU. Model phải nằm vừa trong VRAM.",
    example: "gpt-oss-20b cần khoảng 16 GB.",
    category: "H. Tự host và fine-tune",
  },
  "eval": {
    title: "Eval / Benchmark",
    definition: "Bộ bài kiểm tra tự động đo chất lượng model hoặc prompt.",
    example: "unit test, nhưng dành cho AI.",
    category: "H. Tự host và fine-tune",
  },
  "llm-gateway": {
    title: "LLM Gateway",
    definition: "Cổng trung tâm giữa app và các nhà cung cấp AI: ngân sách, thử lại, dự phòng, ghi log. Ví dụ LiteLLM.",
    example: "trạm thu phí kiêm điều phối giao thông.",
    category: "I. Chi phí và vận hành",
  },
  "diffusion": {
    title: "Diffusion model",
    definition: "Model tạo ảnh, video bằng cách bắt đầu từ \"nhiễu\" rồi khử dần thành hình rõ.",
    example: "tấm ảnh polaroid hiện hình dần.",
    category: "J. Video và hình ảnh",
  },
  "gguf": {
    title: "GGUF",
    definition: "Định dạng model đã nén để chạy trên máy yếu hơn (llama.cpp, Ollama, ComfyUI).",
    example: "bản \"lite\" của một ứng dụng.",
    category: "J. Video và hình ảnh",
  },
};
