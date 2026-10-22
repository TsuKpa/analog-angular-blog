import { Glossary } from './types';

/** Terms used by more than one post. */
export const COMMON_GLOSSARY: Glossary = {
  "harness": {
    title: "Harness",
    definition: "Phần mềm bọc quanh model: lo system prompt, lịch sử, chạy tool, xin quyền. Claude Code, Cursor, Copilot đều là harness.",
    example: "model là động cơ, harness là cả chiếc xe.",
    category: "A. Nền tảng",
  },
  "prompt-caching": {
    title: "Prompt caching",
    definition: "Nhà cung cấp nhớ phần đầu prompt đã xử lý; lần sau gửi y hệt thì tính giá rẻ (khoảng 10% hoặc thấp hơn).",
    example: "phần đề giống hệt lần trước thì giáo viên không cần đọc lại.",
    category: "E. Agent",
  },
};
