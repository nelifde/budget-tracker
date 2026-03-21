type CoachPromptKind = "reflection" | "checkin" | "reminder";

type PromptInput = {
  kind: CoachPromptKind;
  context: string;
  fallback: string;
};

const OPENAI_URL = process.env.AI_COACH_API_URL ?? "https://api.openai.com/v1/chat/completions";
const OPENAI_MODEL = process.env.AI_COACH_MODEL ?? "gpt-4o-mini";
const AI_TIMEOUT_MS = Number(process.env.AI_COACH_TIMEOUT_MS ?? "5000");

function sanitizePrompt(text: string, fallback: string): string {
  const trimmed = text.trim().replace(/\s+/g, " ");
  if (!trimmed) return fallback;
  const safe = trimmed
    .replace(/buy now/gi, "pause first")
    .replace(/guarantee/gi, "support");
  return safe.slice(0, 220);
}

async function callAi(prompt: string): Promise<string | null> {
  const apiKey = process.env.AI_COACH_API_KEY;
  if (!apiKey) return null;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), AI_TIMEOUT_MS);
  try {
    const res = await fetch(OPENAI_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: OPENAI_MODEL,
        temperature: 0.5,
        messages: [
          {
            role: "system",
            content:
              "You are an ADHD-friendly budget coach. Be warm, short, non-judgmental, and avoid financial guarantees. Keep under 35 words.",
          },
          { role: "user", content: prompt },
        ],
      }),
      signal: controller.signal,
    });
    if (!res.ok) return null;
    const data = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    return data.choices?.[0]?.message?.content?.trim() ?? null;
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

export async function generateCoachPrompt(input: PromptInput): Promise<{ prompt: string; source: "ai" | "fallback" }> {
  const task = `Create a ${input.kind} message for this context: ${input.context}`;
  const generated = await callAi(task);
  if (!generated) {
    return { prompt: sanitizePrompt(input.fallback, input.fallback), source: "fallback" };
  }
  return { prompt: sanitizePrompt(generated, input.fallback), source: "ai" };
}
