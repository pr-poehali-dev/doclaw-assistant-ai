import json
import os
import urllib.request

SYSTEM_PROMPT = """Ты — помощник Корусантской гвардии (Guard). Отвечаешь строго по регламентам организации.

Правила ответа:
- Отвечай ТОЛЬКО на основе предоставленных документов и регламентов.
- Если в документах нет ответа — скажи: "В регламентах данная ситуация не описана. Обратитесь к командованию."
- Отвечай чётко, по делу, без лишних слов. Деловой военный стиль.
- Если вопрос про конкретную процедуру — перечисляй шаги по порядку.
- Если вопрос про конкретный пункт правила — цитируй именно этот пункт и объясни его.
- Структура документов: цифра с точкой (1.) — отдельный раздел; цифра в скобках с точкой (1). — пункт внутри раздела.
- Категории нарушений: 🟢 = проступок 1 кат., 🔵 = проступок 2 кат., 🟡 = проступок 3 кат., 🔴 = преступление средней тяжести, ⚫ = тяжкое преступление.
- Отвечай на русском языке."""


def build_system_prompt(docs: list) -> str:
    if not docs:
        return SYSTEM_PROMPT
    docs_text = "\n\n".join(
        f"=== {d.get('title', '')} ===\n{d.get('content', '')}"
        for d in docs
    )
    return f"{SYSTEM_PROMPT}\n\n--- БАЗА РЕГЛАМЕНТОВ ---\n{docs_text}\n--- КОНЕЦ БАЗЫ ---"


def handler(event: dict, context) -> dict:
    """Помощник Guard: отвечает на вопросы строго по переданным регламентам через OpenAI."""

    cors_headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
        "Content-Type": "application/json",
    }

    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": cors_headers, "body": ""}

    body = json.loads(event.get("body") or "{}")
    message = body.get("message", "").strip()
    history = body.get("history", [])
    docs = body.get("docs", [])  # список {title, content} из фронтенда

    if not message:
        return {
            "statusCode": 400,
            "headers": cors_headers,
            "body": json.dumps({"error": "Сообщение не может быть пустым"}),
        }

    api_key = os.environ.get("OPENAI_API_KEY", "")
    if not api_key:
        return {
            "statusCode": 500,
            "headers": cors_headers,
            "body": json.dumps({"error": "API ключ не настроен"}),
        }

    system_content = build_system_prompt(docs)

    messages = [{"role": "system", "content": system_content}]
    for h in history[-10:]:
        role = h.get("role")
        content = h.get("content", "")
        if role in ("user", "assistant") and content:
            messages.append({"role": role, "content": content})
    messages.append({"role": "user", "content": message})

    payload = json.dumps({
        "model": "gpt-4o-mini",
        "messages": messages,
        "max_tokens": 1200,
        "temperature": 0.2,
    }).encode("utf-8")

    req = urllib.request.Request(
        "https://api.openai.com/v1/chat/completions",
        data=payload,
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        },
        method="POST",
    )

    with urllib.request.urlopen(req, timeout=25) as resp:
        result = json.loads(resp.read().decode("utf-8"))

    reply = result["choices"][0]["message"]["content"].strip()

    return {
        "statusCode": 200,
        "headers": cors_headers,
        "body": json.dumps({"reply": reply}, ensure_ascii=False),
    }