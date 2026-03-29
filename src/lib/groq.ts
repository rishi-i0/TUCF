const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_STORAGE_KEY = 'groq_api_key';
const GROQ_MODEL = 'llama-3.1-8b-instant';

export function getGroqApiKey() {
  return localStorage.getItem(GROQ_STORAGE_KEY)?.trim() || '';
}

export function saveGroqApiKey(value: string) {
  localStorage.setItem(GROQ_STORAGE_KEY, value.trim());
}

function extractReplyContent(payload: unknown) {
  if (
    payload &&
    typeof payload === 'object' &&
    'choices' in payload &&
    Array.isArray((payload as { choices?: unknown[] }).choices) &&
    (payload as { choices: Array<{ message?: { content?: string } }> }).choices[0]?.message?.content
  ) {
    return (payload as { choices: Array<{ message: { content: string } }> }).choices[0].message.content;
  }

  throw new Error('Groq response did not include a message.');
}

export async function requestGroqContent(prompt: string) {
  const apiKey = getGroqApiKey();
  if (!apiKey) {
    throw new Error('Add Groq API key in Settings');
  }

  const response = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  const payload = await response.json();
  if (!response.ok) {
    const message =
      payload && typeof payload.error?.message === 'string'
        ? payload.error.message
        : 'API call failed.';
    throw new Error(message);
  }

  return extractReplyContent(payload).trim();
}

export function parseGroqJson<T>(content: string): T {
  const trimmed = content.trim();
  const objectStart = trimmed.indexOf('{');
  const arrayStart = trimmed.indexOf('[');
  const startIndex =
    objectStart === -1
      ? arrayStart
      : arrayStart === -1
        ? objectStart
        : Math.min(objectStart, arrayStart);

  if (startIndex === -1) {
    throw new Error('Model did not return JSON.');
  }

  const jsonText = trimmed.slice(startIndex);
  return JSON.parse(jsonText) as T;
}
