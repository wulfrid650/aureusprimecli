import { getApiMessage, readApiResponse } from "@/lib/api-response";
import { apiFetch } from "@/lib/fetch";

export type SubscriptionPayloadValue = string | number | boolean | null;
export type SubscriptionPayload = Record<string, SubscriptionPayloadValue>;

export type SubscriptionProduct = {
  id?: number;
  name?: string | null;
  slug?: string | null;
  category?: {
    name?: string | null;
  } | null;
};

export type SubscriptionOption = {
  id?: number;
  name?: string | null;
  display_name?: string | null;
};

export type SubscriptionAssignedAccount = {
  id: number;
  payload_type?: string | null;
  payload?: SubscriptionPayload | null;
  masked_payload?: SubscriptionPayload | null;
  notes?: string | null;
};

export type SubscriptionAssignment = {
  id: number;
  assigned_at?: string | null;
  revoked_at?: string | null;
  note?: string | null;
  revoked?: boolean;
  assigned_manually?: boolean;
};

export type Subscription = {
  id: number;
  order_id?: number | null;
  product_id?: number;
  variant_id?: number | null;
  product_variation_id?: number | null;
  type?: string | null;
  access_mode?: string | null;
  status: string;
  started_at?: string | null;
  expires_at?: string | null;
  auto_renew?: boolean;
  pending_student_kyc?: boolean;
  product?: SubscriptionProduct | null;
  variant?: SubscriptionOption | null;
  productVariation?: SubscriptionOption | null;
  product_variation?: SubscriptionOption | null;
  assignedAccount?: SubscriptionAssignedAccount | null;
  assigned_account?: SubscriptionAssignedAccount | null;
  assignments?: SubscriptionAssignment[] | null;
  created_at?: string | null;
  updated_at?: string | null;
};

type SubscriptionRequestError = Error & {
  status?: number;
};

const ongoingStatuses = new Set(["active", "pending", "waiting_manual", "pending_student_kyc"]);
const subscriptionRouteIdPrefix = "sub";
const subscriptionRouteIdMultiplier = 1_048_573;
const subscriptionRouteIdOffset = 8_683_179_203;

function createSubscriptionRequestError(message: string, status?: number): SubscriptionRequestError {
  const error = new Error(message) as SubscriptionRequestError;
  error.status = status;
  return error;
}

export function getSubscriptionDetailsHref(subscriptionId: number | string): string {
  return `/dashboard/souscriptions/${encodeSubscriptionRouteId(subscriptionId)}`;
}

function parseBase36ToNumber(value: string): number | null {
  let result = 0;

  for (const char of value.toLowerCase()) {
    const digit = Number.parseInt(char, 36);

    if (!Number.isInteger(digit) || digit < 0 || digit >= 36) {
      return null;
    }

    result = result * 36 + digit;

    if (!Number.isSafeInteger(result)) {
      return null;
    }
  }

  return result;
}

export function encodeSubscriptionRouteId(subscriptionId: number | string): string {
  const rawId = String(subscriptionId).trim();
  const decodedExistingRouteId = parseSubscriptionRouteId(rawId);

  if (decodedExistingRouteId) {
    const encodedValue =
      decodedExistingRouteId * subscriptionRouteIdMultiplier + subscriptionRouteIdOffset;
    return `${subscriptionRouteIdPrefix}-${encodedValue.toString(36)}`;
  }

  return rawId;
}

export function parseSubscriptionRouteId(routeId: string): number | null {
  const normalizedRouteId = routeId.trim().toLowerCase();

  if (/^[1-9]\d*$/.test(normalizedRouteId)) {
    const numericId = Number(normalizedRouteId);
    return Number.isSafeInteger(numericId) ? numericId : null;
  }

  const encodedValue = normalizedRouteId.startsWith(`${subscriptionRouteIdPrefix}-`)
    ? normalizedRouteId.slice(subscriptionRouteIdPrefix.length + 1)
    : "";

  if (!encodedValue) {
    return null;
  }

  const parsedValue = parseBase36ToNumber(encodedValue);

  if (parsedValue === null || parsedValue <= subscriptionRouteIdOffset) {
    return null;
  }

  const decodedValue = parsedValue - subscriptionRouteIdOffset;

  if (decodedValue % subscriptionRouteIdMultiplier !== 0) {
    return null;
  }

  const subscriptionId = decodedValue / subscriptionRouteIdMultiplier;

  if (!Number.isSafeInteger(subscriptionId) || subscriptionId <= 0) {
    return null;
  }

  return subscriptionId;
}

export async function fetchUserSubscription(subscriptionId: number): Promise<Subscription> {
  const response = await apiFetch(`/api/v1/me/subscriptions/${subscriptionId}`, { cache: "no-store" });
  const payload = await readApiResponse<Subscription>(response);

  if (!response.ok) {
    throw createSubscriptionRequestError(
      getApiMessage(payload, "Unable to load this subscription right now."),
      response.status,
    );
  }

  if (!payload?.data) {
    throw createSubscriptionRequestError("Subscription not found.", 404);
  }

  return payload.data;
}

export async function fetchUserSubscriptions(): Promise<Subscription[]> {
  const response = await apiFetch("/api/v1/me/subscriptions", { cache: "no-store" });
  const payload = await readApiResponse<Subscription[]>(response);

  if (!response.ok) {
    throw createSubscriptionRequestError(
      getApiMessage(payload, "Unable to load your subscriptions right now."),
      response.status,
    );
  }

  return regularizeSubscriptionsForTest(Array.isArray(payload?.data) ? payload.data : []);
}

export function normalizeStatus(status?: string | null): string {
  return status?.trim().toLowerCase() ?? "unknown";
}

export function isOngoingSubscription(status?: string | null): boolean {
  return ongoingStatuses.has(normalizeStatus(status));
}

export function isActiveSubscription(status?: string | null): boolean {
  return normalizeStatus(status) === "active";
}

export function getDaysUntil(dateStr?: string | null): number | null {
  if (!dateStr) {
    return null;
  }

  const target = new Date(dateStr);

  if (Number.isNaN(target.getTime())) {
    return null;
  }

  const now = new Date();
  const targetDay = new Date(target.getFullYear(), target.getMonth(), target.getDate()).getTime();
  const currentDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

  return Math.round((targetDay - currentDay) / 86_400_000);
}

export function getSubscriptionOption(subscription: Subscription): SubscriptionOption | null {
  return subscription.variant ?? subscription.productVariation ?? subscription.product_variation ?? null;
}

export function getAssignedAccount(subscription: Subscription): SubscriptionAssignedAccount | null {
  return subscription.assignedAccount ?? subscription.assigned_account ?? null;
}

export function getVisibleAccountPayload(
  assignedAccount?: SubscriptionAssignedAccount | null,
): SubscriptionPayload {
  const payload = assignedAccount?.payload ?? {};

  if (Object.keys(payload).length > 0) {
    return payload;
  }

  return assignedAccount?.masked_payload ?? {};
}

type SubscriptionSelectionInput = {
  productId?: number | null;
  variantId?: number | null;
  variationId?: number | null;
};

function getSubscriptionSelectionKey(subscription: Subscription): string | null {
  if (subscription.product_variation_id) {
    return `variation:${subscription.product_variation_id}`;
  }

  if (subscription.variant_id) {
    return `variant:${subscription.variant_id}`;
  }

  if (subscription.product_id) {
    return `product:${subscription.product_id}`;
  }

  if (subscription.product?.slug) {
    return `slug:${subscription.product.slug}`;
  }

  return null;
}

function getSubscriptionStatusPriority(status?: string | null): number {
  switch (normalizeStatus(status)) {
    case "active":
      return 5;
    case "pending_student_kyc":
      return 4;
    case "waiting_manual":
      return 3;
    case "pending":
      return 2;
    case "expired":
      return 1;
    case "cancelled":
      return 0;
    default:
      return -1;
  }
}

function getTimestampScore(dateStr?: string | null): number {
  if (!dateStr) {
    return -1;
  }

  const timestamp = new Date(dateStr).getTime();
  return Number.isNaN(timestamp) ? -1 : timestamp;
}

function getAssignedAccessScore(subscription: Subscription): number {
  const assignedAccount = getAssignedAccount(subscription);
  const entryCount = Object.keys(getVisibleAccountPayload(assignedAccount)).length;

  if (entryCount > 0) {
    return 2;
  }

  if (assignedAccount) {
    return 1;
  }

  return 0;
}

function pickCanonicalSubscription(current: Subscription, challenger: Subscription): Subscription {
  const priorityDelta =
    getSubscriptionStatusPriority(challenger.status) - getSubscriptionStatusPriority(current.status);

  if (priorityDelta !== 0) {
    return priorityDelta > 0 ? challenger : current;
  }

  const accessDelta = getAssignedAccessScore(challenger) - getAssignedAccessScore(current);
  if (accessDelta !== 0) {
    return accessDelta > 0 ? challenger : current;
  }

  const expiryDelta = getTimestampScore(challenger.expires_at) - getTimestampScore(current.expires_at);
  if (expiryDelta !== 0) {
    return expiryDelta > 0 ? challenger : current;
  }

  const createdDelta = getTimestampScore(challenger.created_at) - getTimestampScore(current.created_at);
  if (createdDelta !== 0) {
    return createdDelta > 0 ? challenger : current;
  }

  return challenger.id > current.id ? challenger : current;
}

export function regularizeSubscriptionsForTest(subscriptions: Subscription[]): Subscription[] {
  const canonicalOngoingByKey = new Map<string, Subscription>();

  for (const subscription of subscriptions) {
    if (!isOngoingSubscription(subscription.status)) {
      continue;
    }

    const key = getSubscriptionSelectionKey(subscription);
    if (!key) {
      continue;
    }

    const existing = canonicalOngoingByKey.get(key);
    canonicalOngoingByKey.set(key, existing ? pickCanonicalSubscription(existing, subscription) : subscription);
  }

  return subscriptions.filter((subscription) => {
    if (!isOngoingSubscription(subscription.status)) {
      return true;
    }

    const key = getSubscriptionSelectionKey(subscription);
    if (!key) {
      return true;
    }

    return canonicalOngoingByKey.get(key)?.id === subscription.id;
  });
}

function matchesSubscriptionSelection(
  subscription: Subscription,
  { productId, variantId, variationId }: SubscriptionSelectionInput,
): boolean {
  if (variationId) {
    return subscription.product_variation_id === variationId;
  }

  if (variantId) {
    return subscription.variant_id === variantId;
  }

  if (!productId) {
    return false;
  }

  return subscription.product_id === productId && !subscription.variant_id && !subscription.product_variation_id;
}

export function findMatchingSubscription(
  subscriptions: Subscription[],
  selection: SubscriptionSelectionInput,
): Subscription | null {
  return regularizeSubscriptionsForTest(subscriptions).find((subscription) => matchesSubscriptionSelection(subscription, selection)) ?? null;
}

export function findMatchingOngoingSubscription(
  subscriptions: Subscription[],
  selection: SubscriptionSelectionInput,
): Subscription | null {
  return (
    regularizeSubscriptionsForTest(subscriptions).find(
      (subscription) => isOngoingSubscription(subscription.status) && matchesSubscriptionSelection(subscription, selection),
    ) ?? null
  );
}

export function findMatchingActiveSubscription(
  subscriptions: Subscription[],
  selection: SubscriptionSelectionInput,
): Subscription | null {
  return (
    regularizeSubscriptionsForTest(subscriptions).find(
      (subscription) => isActiveSubscription(subscription.status) && matchesSubscriptionSelection(subscription, selection),
    ) ?? null
  );
}
