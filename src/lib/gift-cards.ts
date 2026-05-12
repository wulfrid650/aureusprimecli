import { getApiMessage, readApiResponse } from "@/lib/api-response";
import { apiFetch } from "@/lib/fetch";

export type GiftCardCredential = {
  label?: string | null;
  value?: string | null;
};

export type GiftCardItem = {
  id: number;
  type?: string | null;
  payload_type?: string | null;
  code?: string | null;
  amount?: number | null;
  currency?: string | null;
  product_name?: string | null;
  product_slug?: string | null;
  credential?: GiftCardCredential | null;
  active?: boolean;
  created_at?: string | null;
  expires_at?: string | null;
};

type GiftCardRequestError = Error & {
  status?: number;
};

function createGiftCardRequestError(message: string, status?: number): GiftCardRequestError {
  const error = new Error(message) as GiftCardRequestError;
  error.status = status;
  return error;
}

export async function fetchUserGiftCards(): Promise<GiftCardItem[]> {
  const response = await apiFetch("/api/v1/me/gift-cards");
  const payload = await readApiResponse<GiftCardItem[]>(response);

  if (!response.ok) {
    throw createGiftCardRequestError(
      getApiMessage(payload, "Unable to load your gift cards right now."),
      response.status,
    );
  }

  return Array.isArray(payload?.data) ? payload.data : [];
}
