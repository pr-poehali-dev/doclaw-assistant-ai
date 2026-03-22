import json
import os
import urllib.request
import urllib.error

SYSTEM_PROMPT = """Ты — профессиональный юридический ассистент для бизнеса. 
Отвечаешь строго, по делу, без лишних слов. Используй деловой стиль речи.
Ты знаешь российское законодательство, корпоративные регламенты и правовые процедуры.
Если вопрос выходит за рамки правовой тематики — вежливо перенаправь к юридическим вопросам.
Предупреждай, когда ситуация требует консультации живого юриста.
Отвечай на русском языке."""


def handler(event: dict, context) -> dict:
    """Юридический ИИ-ассистент: принимает вопрос, возвращает консультацию через OpenAI."""

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

    messages = [{"role": "system", "content": SYSTEM_PROMPT}]
    for h in history[-10:]:
        role = h.get("role")
        content = h.get("content", "")
        if role in ("user", "assistant") and content:
            messages.append({"role": role, "content": content})
    messages.append({"role": "user", "content": message})

    payload = json.dumps({
        "model": "gpt-4o-mini",
        "messages": messages,
        "max_tokens": 1000,
        "temperature": 0.3,
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
