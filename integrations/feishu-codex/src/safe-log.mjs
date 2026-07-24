const SECRET_VALUE =
  /(\b(?:app[_-]?secret|pairing[_-]?code|access[_-]?token|refresh[_-]?token)\b\s*[:=]\s*)(?:"[^"]*"|'[^']*'|[^\s,;]+)/gi;
const BEARER_TOKEN = /\bBearer\s+[A-Za-z0-9._~+/=-]+/gi;
const FEISHU_IDENTIFIER = /\b(?:cli|ou|oc|om|on)_[A-Za-z0-9_-]+\b/gi;
const CODEX_IDENTIFIER =
  /(\b(?:thread|turn)(?:_?id)?\b\s*[:=]\s*)[A-Za-z0-9_-]+/gi;

export function safeLogText(value) {
  return String(value ?? "未知错误")
    .replace(SECRET_VALUE, "$1[REDACTED]")
    .replace(BEARER_TOKEN, "Bearer [REDACTED]")
    .replace(FEISHU_IDENTIFIER, "[REDACTED_ID]")
    .replace(CODEX_IDENTIFIER, "$1[REDACTED_ID]");
}

export function safeErrorMessage(error) {
  return safeLogText(error instanceof Error ? error.message : error);
}
