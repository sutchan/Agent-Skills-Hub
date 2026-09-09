// 安全内联 JSON：用于把数据序列化后内联进 HTML <script> 标签（如 window.SKILLS_DATA = {...}）。
// JSON.stringify 不转义 `<` `>` `&`，若字段（如技能 description）含 `</script>`，会提前闭合
// script 标签造成存储型 XSS。这里把上述字符替换为等价的 JSON 转义序列（JSON.parse 后会原样还原，
// 数据内容不变），同时使 HTML 解析器无法把数据识别为标签或注释，阻断注入。
export function jsonForInlineScript(value) {
  return JSON.stringify(value)
    .replace(/&/g, "\\u0026")
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e");
}