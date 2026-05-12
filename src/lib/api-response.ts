export interface ApiResponseEnvelope<T = unknown> {
  status?: string;
  message?: string;
  data?: T;
  errors?: unknown;
}

export async function readApiResponse<T>(res: Response): Promise<ApiResponseEnvelope<T> | null> {
  const text = await res.text();

  if (!text || text.trim() === "") {
    return null;
  }

  try {
    return JSON.parse(text) as ApiResponseEnvelope<T>;
  } catch {
    return null;
  }
}

export function getApiMessage<T>(payload: ApiResponseEnvelope<T> | null, fallback: string): string {
  if (typeof payload?.message === "string" && payload.message.trim() !== "") {
    return payload.message;
  }

  return fallback;
}

export function getApiFieldErrors(payload: ApiResponseEnvelope | null): Record<string, string[]> {
  if (!payload || !payload.errors || typeof payload.errors !== "object" || Array.isArray(payload.errors)) {
    return {};
  }

  const result: Record<string, string[]> = {};

  for (const [field, value] of Object.entries(payload.errors as Record<string, unknown>)) {
    if (Array.isArray(value)) {
      const messages = value.filter((entry): entry is string => typeof entry === "string");

      if (messages.length > 0) {
        result[field] = messages;
      }
    }
  }

  return result;
}
