"use client";

import { Suspense, use, useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ServiceIllustration } from "@/components/dashboard/service-illustration";
import { DashboardHeaderControls } from "@/components/dashboard/header-controls";
import { getApiMessage, readApiResponse } from "@/lib/api-response";
import { fetchCatalogProduct, resolveOwnershipBadgeIcon, type CatalogOption, type CatalogProduct } from "@/lib/catalog";
import { apiFetch, safeFetch } from "@/lib/fetch";
import { getPlural, useI18n } from "@/lib/i18n";
import {
  fetchUserSubscriptions,
  findMatchingOngoingSubscription,
  findMatchingSubscription,
  getSubscriptionDetailsHref,
  isActiveSubscription,
  type Subscription,
} from "@/lib/subscriptions";

type WalletResponse = {
  data?: {
    wallet?: {
      available_balance?: number | string;
    };
  };
};

type CheckoutResponse = {
  provider?: string;
  status?: string;
  order_ref?: string;
  order_id?: number;
  subscription_id?: number;
  kyc_required?: boolean;
  redirect_url?: string;
  requires_confirmation?: boolean;
  case?: string;
  preview?: MigrationPreview;
};

type MigrationPreview = {
  status: "ok" | "insufficient_balance" | "incompatible_delivery_type" | "same_variation";
  subscription_id?: number;
  from_variation_name?: string;
  to_variation_name?: string;
  new_price?: number;
  credit?: number;
  net_amount?: number;
  excess_credit?: number;
  available_balance?: number;
};

type CheckoutPreviewResponse = {
  case?: "new_purchase" | "renewal" | "migration";
  subscription_id?: number;
  preview?: MigrationPreview;
};

type PaymentSuccessState =
  | {
      mode: "checkout";
      orderRef?: string;
      subscriptionId?: number;
      kycRequired?: boolean;
    }
  | {
      mode: "renewal";
      subscriptionId: number;
    };

const EMPTY_ACCEPTED_CONSTRAINTS: ReadonlySet<string> = new Set();

const subscribeToHydration = () => () => undefined;

function useHasMounted(): boolean {
  return useSyncExternalStore(subscribeToHydration, () => true, () => false);
}

function CheckoutContent({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const searchParams = useSearchParams();
  const router = useRouter();
  const { dateLocale, locale, t } = useI18n();

  const variantId = searchParams.get("variant");
  const variationId = searchParams.get("variation");
  const offerType = searchParams.get("offer");
  const renewalSubscriptionId = searchParams.get("subscription");

  const [balance, setBalance] = useState<number | null>(null);
  const [service, setService] = useState<CatalogProduct | null>(null);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPaying, setIsPaying] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState<PaymentSuccessState | null>(null);
  const [error, setError] = useState("");
  // Keyed by option id so switching formulas never carries an acceptance
  // over to a different formula's constraints (each has its own set).
  const [acceptedConstraintsByOption, setAcceptedConstraintsByOption] = useState<Record<string, Set<string>>>({});
  const [hasExistingAccount, setHasExistingAccount] = useState<boolean | null>(null);
  const [delegateManagement, setDelegateManagement] = useState<boolean | null>(null);
  const [existingAccountEmail, setExistingAccountEmail] = useState("");
  const [existingAccountPassword, setExistingAccountPassword] = useState("");
  const [newAccountEmail, setNewAccountEmail] = useState("");
  const [migrationPreview, setMigrationPreview] = useState<MigrationPreview | null>(null);
  const [migrationConfirmed, setMigrationConfirmed] = useState(false);
  const hasMounted = useHasMounted();

  useEffect(() => {
    let isActive = true;

    async function loadCheckoutContext() {
      setIsLoading(true);
      setError("");

      try {
        const [productPayload, walletPayload, subscriptionsPayload] = await Promise.all([
          fetchCatalogProduct(resolvedParams.id),
          safeFetch<WalletResponse>("/api/v1/me/wallet"),
          fetchUserSubscriptions().catch((fetchError) => {
            console.error("Failed to fetch user subscriptions:", fetchError);
            return [];
          }),
        ]);

        if (!isActive) return;

        setService(productPayload);
        setSubscriptions(subscriptionsPayload);

        const walletValue = walletPayload?.data?.wallet?.available_balance;
        const parsedBalance = Number(walletValue ?? 0);

        if (!Number.isNaN(parsedBalance)) {
          setBalance(parsedBalance);
        }

        if (!productPayload) {
          setError(t("checkout.selectedUnavailable"));
        }
      } catch (err) {
        console.error("Failed to load checkout context:", err);

        if (isActive) {
          setSubscriptions([]);
          setError(t("checkout.loadError"));
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    loadCheckoutContext();

    return () => {
      isActive = false;
    };
  }, [locale, resolvedParams.id, t]);

  const selectedOption = useMemo<CatalogOption | null>(() => {
    if (!service) return null;

    if (variantId) {
      const byVariant = service.options.find((option) => {
        const matchesVariant = option.checkoutPayload.variantId === Number(variantId);
        const matchesOffer = !offerType || option.checkoutPayload.offerType === offerType;

        return matchesVariant && matchesOffer;
      });
      if (byVariant) return byVariant;
    }

    if (variationId) {
      const byVariation = service.options.find((option) => {
        const matchesVariation = option.checkoutPayload.variationId === Number(variationId);
        const matchesOffer = !offerType || option.checkoutPayload.offerType === offerType;

        return matchesVariation && matchesOffer;
      });
      if (byVariation) return byVariation;
    }

    return service.defaultOption ?? null;
  }, [offerType, service, variantId, variationId]);

  const matchingSubscription = useMemo(() => {
    if (!service) {
      return null;
    }

    const selection = {
      productId: selectedOption?.checkoutPayload.productId ?? service.productId,
      variantId: selectedOption?.checkoutPayload.variantId ?? null,
      variationId: selectedOption?.checkoutPayload.variationId ?? null,
    };

    const explicitSubscriptionId = Number(renewalSubscriptionId);
    if (Number.isInteger(explicitSubscriptionId) && explicitSubscriptionId > 0) {
      const explicitSubscription = subscriptions.find((subscription) => subscription.id === explicitSubscriptionId) ?? null;

      if (explicitSubscription && findMatchingSubscription([explicitSubscription], selection)) {
        return explicitSubscription;
      }
    }

    return findMatchingOngoingSubscription(subscriptions, selection);
  }, [renewalSubscriptionId, selectedOption, service, subscriptions]);

  const finalPriceText = selectedOption?.priceFormatted ?? service?.currentPriceFormatted ?? "0 Auri";
  const priceValue = selectedOption?.price ?? service?.currentPrice ?? 0;
  const isMigrationCase = Boolean(migrationPreview && migrationPreview.status !== "same_variation");
  // Une migration ne facture que le net après crédit prorata, pas le prix
  // plein de la nouvelle formule : le solde requis doit refléter ce montant.
  const effectivePayAmount = isMigrationCase && migrationPreview?.net_amount !== undefined
    ? migrationPreview.net_amount
    : priceValue;
  const effectivePayAmountFormatted = isMigrationCase
    ? `${effectivePayAmount.toLocaleString(dateLocale)} Auri`
    : finalPriceText;
  const shouldShowLoadingState = !hasMounted || isLoading;
  const hasEnoughFunds = hasMounted && balance !== null && balance >= effectivePayAmount;
  const isRenewalFlow = matchingSubscription ? isActiveSubscription(matchingSubscription.status) : false;
  const hasBlockingSubscription = Boolean(matchingSubscription && !isRenewalFlow);
  const selectedRequiresKyc = selectedOption?.requiresKyc ?? service?.requiresKyc ?? false;
  const acceptedConstraints = selectedOption
    ? (acceptedConstraintsByOption[selectedOption.id] ?? EMPTY_ACCEPTED_CONSTRAINTS)
    : EMPTY_ACCEPTED_CONSTRAINTS;
  const constraintsToAccept = selectedOption?.constraintsToAccept ?? [];
  const remainingConstraintsToAccept = constraintsToAccept.filter(
    (constraint) => !acceptedConstraints.has(constraint.code),
  );
  // Un renouvellement ne redemande jamais de valider une condition "à
  // accepter" (ex: appartenance à un groupe familial) : c'est déjà acquis
  // depuis le premier achat, la reposer à chaque renouvellement n'a pas de
  // sens.
  const hasUnacceptedConstraints = !isRenewalFlow && remainingConstraintsToAccept.length > 0;
  // Un renouvellement n'affiche plus du tout les conditions "à accepter"
  // (ex: groupe familial) : déjà acquises depuis le premier achat, aucune
  // information à répéter.
  const visibleConstraints = (selectedOption?.constraints ?? []).filter(
    (constraint) => !(constraint.severity === "to_accept" && isRenewalFlow),
  );
  const hasBlockingConstraints = selectedOption?.hasBlockingConstraints ?? false;
  // Une prolongation ou une migration réutilisent le compte déjà connu de
  // l'abonnement existant : inutile de reposer les questions d'activation
  // assistée (compte, délégation, identifiants), on les a déjà.
  const requiresAssistedActivationAnswers =
    selectedOption?.deliveryType === "ACTIVATION_ASSISTEE" && !isRenewalFlow && !isMigrationCase;
  const assistedActivationIncomplete =
    requiresAssistedActivationAnswers &&
    (hasExistingAccount === null ||
      (hasExistingAccount === false && !newAccountEmail.trim()) ||
      (hasExistingAccount === true && delegateManagement === null) ||
      (hasExistingAccount === true && delegateManagement === false && !newAccountEmail.trim()) ||
      (hasExistingAccount === true &&
        delegateManagement === true &&
        (!existingAccountEmail.trim() || !existingAccountPassword.trim())));

  useEffect(() => {
    setHasExistingAccount(null);
    setDelegateManagement(null);
    setExistingAccountEmail("");
    setExistingAccountPassword("");
    setNewAccountEmail("");
  }, [selectedOption?.id]);

  const buildSelectionPayload = (): Record<string, unknown> => {
    const payload: Record<string, unknown> = {};

    if (selectedOption?.checkoutPayload.variantId) {
      payload.variant_id = selectedOption.checkoutPayload.variantId;
    } else if (selectedOption?.checkoutPayload.variationId) {
      payload.variation_id = selectedOption.checkoutPayload.variationId;
    } else if (selectedOption?.checkoutPayload.productId) {
      payload.product_id = selectedOption.checkoutPayload.productId;
    } else if (service) {
      payload.product_id = service.productId;
    }

    if (selectedOption?.checkoutPayload.offerType) {
      payload.offer_type = selectedOption.checkoutPayload.offerType;
      payload.student_offer = selectedOption.checkoutPayload.offerType === "student";
    }

    return payload;
  };

  // On demande au serveur, avant tout paiement, ce que ferait ce checkout
  // (nouvel achat, prolongation, ou migration payante d'une formule à une
  // autre). Si c'est une migration, on affiche le montant exact et on exige
  // une confirmation explicite avant de facturer quoi que ce soit.
  useEffect(() => {
    let isActive = true;
    setMigrationConfirmed(false);
    setMigrationPreview(null);

    if (!service || !selectedOption?.checkoutPayload.variationId) {
      return;
    }

    async function loadPreview() {
      try {
        const res = await apiFetch("/api/v1/checkout/preview", {
          method: "POST",
          body: JSON.stringify(buildSelectionPayload()),
        });

        if (!res.ok) return;

        const data = await readApiResponse<CheckoutPreviewResponse>(res);
        if (!isActive) return;

        if (data?.data?.case === "migration" && data.data.preview) {
          setMigrationPreview(data.data.preview);
        }
      } catch {
        // Aperçu non bloquant : si ça échoue, le checkout normal reste
        // protégé côté serveur (confirmation requise avant facturation).
      }
    }

    loadPreview();

    return () => {
      isActive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedOption?.id, service?.productId]);

  const toggleConstraintAccepted = (code: string) => {
    if (!selectedOption) return;
    const optionId = selectedOption.id;

    setAcceptedConstraintsByOption((current) => {
      const next = new Set(current[optionId] ?? EMPTY_ACCEPTED_CONSTRAINTS);
      if (next.has(code)) {
        next.delete(code);
      } else {
        next.add(code);
      }
      return { ...current, [optionId]: next };
    });
  };

  const handlePayment = async () => {
    if (!service || isPaying) return;

    if (hasUnacceptedConstraints || hasBlockingConstraints) return;

    if (matchingSubscription && hasBlockingSubscription) {
      router.push(getSubscriptionDetailsHref(matchingSubscription.id));
      return;
    }

    if (!isRenewalFlow && assistedActivationIncomplete) return;

    if (!isRenewalFlow && isMigrationCase && !migrationConfirmed) return;

    if (!hasEnoughFunds) return;

    setError("");
    setIsPaying(true);

    try {
      if (matchingSubscription && isRenewalFlow) {
        const renewResponse = await apiFetch(`/api/v1/me/subscriptions/${matchingSubscription.id}/renew`, {
          method: "POST",
          body: JSON.stringify({
            payment_method: "wallet",
          }),
        });

        const renewPayload = await readApiResponse<Subscription>(renewResponse);

        if (!renewResponse.ok) {
          setError(getApiMessage(renewPayload, t("checkout.renewalFailed")));
          return;
        }

        setPaymentSuccess({
          mode: "renewal",
          subscriptionId: matchingSubscription.id,
        });
        setBalance((currentBalance) => (currentBalance === null ? currentBalance : Math.max(0, currentBalance - priceValue)));
        return;
      }

      const payload: Record<string, unknown> = {
        payment_method: "wallet",
        ...buildSelectionPayload(),
      };

      if (isMigrationCase && migrationConfirmed) {
        payload.confirm_migration = true;
      }

      if (requiresAssistedActivationAnswers && hasExistingAccount !== null) {
        payload.has_existing_account = hasExistingAccount;

        if (hasExistingAccount && delegateManagement !== null) {
          payload.delegate_management = delegateManagement;
        }

        if (hasExistingAccount === false || (hasExistingAccount === true && delegateManagement === false)) {
          payload.account_email = newAccountEmail.trim();
        }
      }

      if (requiresAssistedActivationAnswers && hasExistingAccount === true && delegateManagement === true) {
        payload.existing_account_credentials = {
          email: existingAccountEmail.trim(),
          password: existingAccountPassword,
        };
      }

      const res = await apiFetch("/api/v1/checkout", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      const data = await readApiResponse<CheckoutResponse>(res);

      if (!res.ok) {
        setError(getApiMessage(data, t("checkout.paymentFailed")));
        return;
      }

      if (data?.data?.requires_confirmation && data.data.case === "migration" && data.data.preview) {
        // Filet de sécurité si l'aperçu chargé au montage était périmé : on
        // affiche la confirmation au lieu de facturer sans preuve visible.
        setMigrationPreview(data.data.preview);
        setMigrationConfirmed(false);
        return;
      }

      setPaymentSuccess({
        mode: "checkout",
        orderRef: data?.data?.order_ref,
        subscriptionId: data?.data?.subscription_id,
        kycRequired: Boolean(data?.data?.kyc_required),
      });
      setBalance((currentBalance) => (currentBalance === null ? currentBalance : Math.max(0, currentBalance - priceValue)));
    } catch (paymentError) {
      console.error("Checkout payment failed:", paymentError);
      setError(t("checkout.finalizeError"));
    } finally {
      setIsPaying(false);
    }
  };

  if (paymentSuccess) {
    const successHref =
      paymentSuccess.mode === "renewal"
        ? getSubscriptionDetailsHref(paymentSuccess.subscriptionId)
        : service?.isGiftCard
          ? "/dashboard/cartes-cadeaux"
          : paymentSuccess.subscriptionId
            ? getSubscriptionDetailsHref(paymentSuccess.subscriptionId)
            : paymentSuccess.kycRequired
              ? "/dashboard/compte"
              : "/dashboard/souscriptions";
    const successCtaLabel =
      paymentSuccess.mode === "renewal"
        ? t("checkout.seeSubscription")
        : service?.isGiftCard
          ? t("checkout.seeCode")
          : paymentSuccess.kycRequired && !paymentSuccess.subscriptionId
            ? t("checkout.kycUploadCta")
            : t("checkout.seeSubscription");

    return (
      <div className="dashboard-mode bg-[#f6f6f8] text-[#131118] min-h-screen flex justify-center sm:items-center sm:p-4">
        <div className="w-full sm:max-w-[420px] sm:h-[90vh] sm:max-h-[850px] bg-white sm:rounded-[40px] overflow-hidden relative shadow-2xl flex flex-col mx-auto h-[100dvh] sm:h-auto items-center justify-center p-6 text-center">
          <div className="size-20 rounded-full bg-green-100 text-green-600 flex items-center justify-center mb-6">
            <span className="material-symbols-outlined text-[40px]">check_circle</span>
          </div>
          <h1 className="text-2xl font-black mb-2 text-[#131118]">
            {paymentSuccess.mode === "renewal"
              ? t("checkout.renewalSuccessTitle")
              : paymentSuccess.kycRequired
                ? t("checkout.kycSuccessTitle")
                : t("checkout.paymentSuccessTitle")}
          </h1>
          <p className="text-gray-500 mb-8">
            {paymentSuccess.mode === "renewal" ? (
              <>
                {t("checkout.renewalSuccessPrefix")} <strong>{service?.title}</strong>
                {selectedOption ? ` (${selectedOption.name})` : ""} {t("checkout.renewalSuccessSuffix")}
              </>
            ) : service?.isGiftCard ? (
              <>
                {t("checkout.giftSuccessPrefix")} <strong>{paymentSuccess.orderRef || ""}</strong> {t("checkout.giftSuccessMiddle")} <strong>{service.title}</strong>.
                {" "}{t("checkout.giftSuccessSuffix")}
              </>
            ) : paymentSuccess.kycRequired ? (
              <>
                {t("checkout.kycSuccessText")} <strong>{service?.title}</strong>
                {selectedOption ? ` (${selectedOption.name})` : ""}.
              </>
            ) : (
              <>
                {t("checkout.checkoutSuccessPrefix")} <strong>{paymentSuccess.orderRef || ""}</strong> {t("checkout.checkoutSuccessMiddle")} <strong>{service?.title}</strong>
                {selectedOption ? ` (${selectedOption.name})` : ""}.
              </>
            )}
            {selectedOption?.deliveryType === "ACTIVATION_ASSISTEE" &&
              (paymentSuccess.mode === "renewal" || !paymentSuccess.kycRequired) && (
              <>
                {" "}
                <strong>{t("checkout.activeOnYourAccount")}</strong>
              </>
            )}
          </p>
          <Link
            href={successHref}
            className="w-full bg-[#f2f0f4] hover:bg-[#e8e6eb] text-[#131118] font-bold text-lg py-4 rounded-2xl transition-all"
          >
            {successCtaLabel}
          </Link>
        </div>
      </div>
    );
  }

  if (hasMounted && !isLoading && !service) {
    return (
      <div className="dashboard-mode bg-[#f6f6f8] text-[#131118] min-h-screen flex justify-center sm:items-center sm:p-4">
        <div className="w-full sm:max-w-[420px] sm:h-[90vh] sm:max-h-[850px] bg-white sm:rounded-[40px] overflow-hidden relative shadow-2xl flex flex-col mx-auto h-[100dvh] sm:h-auto items-center justify-center p-6 text-center">
          <div className="size-20 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center mb-6">
            <span className="material-symbols-outlined text-[40px]">inventory_2</span>
          </div>
          <h1 className="text-2xl font-black mb-2 text-[#131118]">{t("checkout.unavailableTitle")}</h1>
          <p className="text-gray-500 mb-8">{error || t("checkout.productNotAccessible")}</p>
          <Link href="/dashboard/services" className="w-full bg-[#131118] text-white font-bold text-lg py-4 rounded-2xl transition-all">
            {t("serviceDetail.backToServices")}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-mode bg-[#f6f6f8] text-[#131118] min-h-screen flex justify-center sm:items-center sm:p-4">
      {/* Container */}
      <div className="w-full sm:max-w-[420px] sm:h-[90vh] sm:max-h-[850px] bg-[#f6f6f8] sm:rounded-[40px] overflow-hidden relative shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] flex flex-col mx-auto h-[100dvh] sm:h-auto">
        
        {/* Header */}
        <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md shadow-sm border-b border-[#f2f0f4] px-5 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button onClick={() => router.back()} className="flex items-center justify-center size-10 rounded-full bg-white border border-gray-100 text-[#131118] hover:bg-gray-50 transition-colors">
              <span className="material-symbols-outlined text-[20px]">arrow_back</span>
            </button>
            <h1 className="text-lg font-bold tracking-tight">{t("checkout.title")}</h1>
          </div>
          <DashboardHeaderControls />
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto no-scrollbar scroll-smooth p-5 pt-2">
          
          <h2 className="text-2xl font-black mb-6">{t("checkout.summaryTitle")}</h2>

          {error && (
            <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {error}
            </div>
          )}
          
          {/* Order Summary Card */}
          <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 mb-6 flex flex-col gap-4">
             <div className="flex gap-4 items-center">
               <div className="size-16 rounded-2xl overflow-hidden relative shrink-0">
                 {shouldShowLoadingState ? (
                   <div className="absolute inset-0 bg-gray-100 animate-pulse" />
                 ) : (
                   service && <ServiceIllustration service={service} variant="thumb" />
                 )}
               </div>
               <div className="flex flex-col flex-1">
                 <span className="font-extrabold text-lg text-[#131118]">{service?.title || t("common.loading")}</span>
                 {selectedOption && <span className="text-gray-500 font-medium text-sm">{selectedOption.name}</span>}
                 {!selectedOption && service && <span className="text-gray-500 font-medium text-sm">{service.category}</span>}
                 {selectedOption?.description && (
                   <span className="mt-1 text-xs leading-relaxed text-gray-500">{selectedOption.description}</span>
                 )}
               </div>
             </div>

             <div className="h-px w-full bg-gray-100 my-1"></div>

             <div className="flex items-center justify-between">
               <span className="text-gray-500 font-medium">{t("checkout.totalPrice")}</span>
               <div className="text-right">
                 <span className="block text-2xl font-black text-[#5b13ec]">{finalPriceText}</span>
                 <span className="text-xs text-gray-400">{selectedOption?.billingSummary ?? service?.billingSummary}</span>
                 {selectedOption?.ownershipBadge && (
                   <span className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-[#5b13ec]/10 px-2 py-0.5 text-[10px] font-bold text-[#5b13ec]">
                     <span className="material-symbols-outlined text-[12px]">
                       {resolveOwnershipBadgeIcon(selectedOption.deliveryType)}
                     </span>
                     {selectedOption.ownershipBadge.label}
                   </span>
                 )}
               </div>
             </div>
          </div>

          {selectedOption && visibleConstraints.length > 0 && (
            <div className="mb-6 rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
              <h3 className="text-xs font-black uppercase tracking-[0.18em] text-gray-400 mb-3">
                {t("checkout.constraintsTitle")}
              </h3>
              <ul className="flex flex-col gap-3">
                {visibleConstraints.map((constraint) => {
                  if (constraint.severity === "to_accept") {
                    const isAccepted = acceptedConstraints.has(constraint.code);
                    return (
                      <li key={constraint.code}>
                        <label className="flex cursor-pointer items-start gap-3 rounded-2xl border-2 border-amber-200 bg-amber-50 p-3 transition-colors">
                          <input
                            type="checkbox"
                            checked={isAccepted}
                            onChange={() => toggleConstraintAccepted(constraint.code)}
                            className="mt-0.5 size-4 shrink-0 accent-[#5b13ec]"
                          />
                          <span className="text-sm leading-relaxed text-amber-900">
                            {constraint.label}
                          </span>
                        </label>
                      </li>
                    );
                  }

                  // La divulgation complète a déjà été vue sur la fiche
                  // produit (même donnée, label complet) : au checkout on ne
                  // répète qu'un lien discret vers celle-ci, pas le
                  // paragraphe entier — la preuve existe déjà en amont.
                  if (constraint.short_label && service?.slug) {
                    return (
                      <li key={constraint.code}>
                        <Link
                          href={`/dashboard/services/${service.slug}`}
                          className="text-xs font-medium text-gray-400 underline decoration-dotted underline-offset-2 hover:text-gray-600"
                        >
                          {constraint.short_label}
                        </Link>
                      </li>
                    );
                  }

                  return (
                    <li key={constraint.code} className="flex items-start gap-2.5">
                      <span
                        className={`material-symbols-outlined mt-0.5 text-[16px] shrink-0 ${
                          constraint.severity === "blocking" ? "text-red-600" : "text-gray-400"
                        }`}
                      >
                        {constraint.severity === "blocking" ? "block" : "info"}
                      </span>
                      <span className="text-sm leading-relaxed text-gray-600">{constraint.label}</span>
                    </li>
                  );
                })}
              </ul>

              {hasUnacceptedConstraints && (
                <p className="mt-3 text-xs font-bold text-amber-700">
                  {t("checkout.constraintsAcceptRemaining", {
                    count: remainingConstraintsToAccept.length,
                    plural: getPlural(locale, remainingConstraintsToAccept.length),
                  })}
                </p>
              )}

              {hasBlockingConstraints && (
                <div className="mt-3 rounded-2xl border border-red-200 bg-red-50 px-3 py-2.5">
                  <p className="text-xs font-bold text-red-700">{t("checkout.constraintsBlockingTitle")}</p>
                  <p className="mt-1 text-xs leading-relaxed text-red-600">{t("checkout.constraintsBlockingText")}</p>
                </div>
              )}
            </div>
          )}

          {requiresAssistedActivationAnswers && (
            <div className="mb-6 rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
              <h3 className="text-xs font-black uppercase tracking-[0.18em] text-gray-400 mb-3">
                {t("checkout.assistedActivationTitle")}
              </h3>

              <p className="mb-3 text-sm font-bold text-[#131118]">{t("checkout.assistedHasAccountQuestion")}</p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setHasExistingAccount(true)}
                  className={`flex-1 rounded-2xl border-2 p-3 text-sm font-bold transition-colors ${
                    hasExistingAccount === true
                      ? "border-[#5b13ec] bg-[#5b13ec]/5 text-[#5b13ec]"
                      : "border-gray-100 text-gray-500 hover:border-gray-200"
                  }`}
                >
                  {t("checkout.assistedYes")}
                </button>
                <button
                  type="button"
                  onClick={() => setHasExistingAccount(false)}
                  className={`flex-1 rounded-2xl border-2 p-3 text-sm font-bold transition-colors ${
                    hasExistingAccount === false
                      ? "border-[#5b13ec] bg-[#5b13ec]/5 text-[#5b13ec]"
                      : "border-gray-100 text-gray-500 hover:border-gray-200"
                  }`}
                >
                  {t("checkout.assistedNo")}
                </button>
              </div>

              {hasExistingAccount === false && (
                <div className="mt-4 flex flex-col gap-2 border-t border-gray-100 pt-4">
                  <p className="text-xs leading-relaxed text-gray-500">{t("checkout.assistedNoAccountInfo")}</p>
                  <label className="flex flex-col gap-1">
                    <span className="text-xs font-bold uppercase tracking-[0.1em] text-gray-400">
                      {t("checkout.assistedNewAccountEmailLabel")}
                    </span>
                    <input
                      type="email"
                      value={newAccountEmail}
                      onChange={(event) => setNewAccountEmail(event.target.value)}
                      className="rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-[#131118] focus:border-[#5b13ec] focus:outline-none"
                      autoComplete="off"
                    />
                  </label>
                </div>
              )}

              {hasExistingAccount === true && (
                <div className="mt-4 flex flex-col gap-2 border-t border-gray-100 pt-4">
                  <p className="text-sm font-bold text-[#131118]">{t("checkout.assistedDelegateQuestion")}</p>
                  <button
                    type="button"
                    onClick={() => setDelegateManagement(false)}
                    className={`rounded-2xl border-2 p-3 text-left text-sm font-bold transition-colors ${
                      delegateManagement === false
                        ? "border-[#5b13ec] bg-[#5b13ec]/5 text-[#5b13ec]"
                        : "border-gray-100 text-gray-500 hover:border-gray-200"
                    }`}
                  >
                    {t("checkout.assistedSelfManage")}
                    <span className="mt-0.5 block text-xs font-medium opacity-80">{t("checkout.assistedSelfManageHint")}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setDelegateManagement(true)}
                    className={`rounded-2xl border-2 p-3 text-left text-sm font-bold transition-colors ${
                      delegateManagement === true
                        ? "border-[#5b13ec] bg-[#5b13ec]/5 text-[#5b13ec]"
                        : "border-gray-100 text-gray-500 hover:border-gray-200"
                    }`}
                  >
                    {t("checkout.assistedDelegate")}
                    <span className="mt-0.5 block text-xs font-medium opacity-80">{t("checkout.assistedDelegateHint")}</span>
                  </button>
                </div>
              )}

              {hasExistingAccount === true && delegateManagement === false && (
                <div className="mt-4 flex flex-col gap-2 border-t border-gray-100 pt-4">
                  <label className="flex flex-col gap-1">
                    <span className="text-xs font-bold uppercase tracking-[0.1em] text-gray-400">
                      {t("checkout.assistedNewAccountEmailLabel")}
                    </span>
                    <input
                      type="email"
                      value={newAccountEmail}
                      onChange={(event) => setNewAccountEmail(event.target.value)}
                      className="rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-[#131118] focus:border-[#5b13ec] focus:outline-none"
                      autoComplete="off"
                    />
                  </label>
                  <p className="text-xs leading-relaxed text-gray-500">{t("checkout.assistedSelfManageEmailNotice")}</p>
                </div>
              )}

              {hasExistingAccount === true && delegateManagement === true && (
                <div className="mt-4 flex flex-col gap-3 border-t border-gray-100 pt-4">
                  <label className="flex flex-col gap-1">
                    <span className="text-xs font-bold uppercase tracking-[0.1em] text-gray-400">
                      {t("checkout.assistedEmailLabel")}
                    </span>
                    <input
                      type="email"
                      value={existingAccountEmail}
                      onChange={(event) => setExistingAccountEmail(event.target.value)}
                      className="rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-[#131118] focus:border-[#5b13ec] focus:outline-none"
                      autoComplete="off"
                    />
                  </label>
                  <label className="flex flex-col gap-1">
                    <span className="text-xs font-bold uppercase tracking-[0.1em] text-gray-400">
                      {t("checkout.assistedPasswordLabel")}
                    </span>
                    <input
                      type="password"
                      value={existingAccountPassword}
                      onChange={(event) => setExistingAccountPassword(event.target.value)}
                      className="rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-[#131118] focus:border-[#5b13ec] focus:outline-none"
                      autoComplete="off"
                    />
                  </label>
                  <p className="text-xs leading-relaxed text-gray-500">{t("checkout.assistedCredentialsNotice")}</p>
                </div>
              )}
            </div>
          )}

          {isMigrationCase && migrationPreview && (
            <div className="mb-6 rounded-3xl border-2 border-[#5b13ec]/30 bg-[#5b13ec]/5 p-5">
              <div className="flex items-start gap-3">
                <span className="material-symbols-outlined text-[22px] text-[#5b13ec]">sync_alt</span>
                <div className="flex-1">
                  <p className="text-sm font-bold text-[#131118]">{t("checkout.migrationTitle")}</p>
                  <p className="mt-1 text-xs leading-relaxed text-gray-600">
                    {t("checkout.migrationText", {
                      from: migrationPreview.from_variation_name ?? "",
                      to: migrationPreview.to_variation_name ?? "",
                    })}
                  </p>
                </div>
              </div>

              <div className="mt-4 flex flex-col gap-2 rounded-2xl bg-white p-4 border border-[#5b13ec]/15">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">{t("checkout.migrationNewPrice")}</span>
                  <span className="font-bold text-[#131118]">{(migrationPreview.new_price ?? 0).toLocaleString(dateLocale)} Auri</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">{t("checkout.migrationCredit")}</span>
                  <span className="font-bold text-emerald-600">- {(migrationPreview.credit ?? 0).toLocaleString(dateLocale)} Auri</span>
                </div>
                <div className="h-px w-full bg-gray-100 my-1" />
                <div className="flex items-center justify-between text-sm">
                  <span className="font-bold text-[#131118]">{t("checkout.migrationNetAmount")}</span>
                  <span className="font-black text-[#5b13ec]">
                    {(migrationPreview.net_amount ?? 0).toLocaleString(dateLocale)} Auri
                  </span>
                </div>
              </div>

              {Boolean(migrationPreview.excess_credit) && (
                <p className="mt-3 text-xs leading-relaxed text-gray-500">
                  {t("checkout.migrationExcessCredit", {
                    amount: `${(migrationPreview.excess_credit ?? 0).toLocaleString(dateLocale)} Auri`,
                  })}
                </p>
              )}

              {migrationPreview.status === "insufficient_balance" && (
                <p className="mt-3 text-xs font-bold text-red-600">{t("checkout.migrationInsufficientBalance")}</p>
              )}

              <label className="mt-4 flex cursor-pointer items-start gap-3 rounded-2xl border-2 border-[#5b13ec]/20 bg-white p-3 transition-colors">
                <input
                  type="checkbox"
                  checked={migrationConfirmed}
                  onChange={(event) => setMigrationConfirmed(event.target.checked)}
                  className="mt-0.5 size-4 shrink-0 accent-[#5b13ec]"
                />
                <span className="text-sm font-bold leading-relaxed text-[#131118]">{t("checkout.migrationConfirm")}</span>
              </label>
            </div>
          )}

          {selectedRequiresKyc && (
            <div className="mb-6 rounded-3xl border border-white/10 bg-[#131118] px-4 py-4 text-white">
              <div className="flex items-start gap-3">
                <span className="material-symbols-outlined text-[22px] text-[#dbb723]">school</span>
                <div>
                  <p className="text-sm font-bold">{t("checkout.kycNoticeTitle")}</p>
                  <p className="mt-1 text-xs leading-relaxed text-white/70">{t("checkout.kycNoticeText")}</p>
                </div>
              </div>
            </div>
          )}

          {matchingSubscription && (
            <div
              className={`checkout-subscription-notice mb-6 rounded-3xl border px-4 py-4 ${
                isRenewalFlow ? "border-emerald-200 bg-emerald-50 text-emerald-900" : "border-amber-200 bg-amber-50 text-amber-900"
              }`}
            >
              <p className="text-sm font-bold">
                {isRenewalFlow
                  ? t("checkout.renewalNoticeTitle")
                  : t("checkout.processingNoticeTitle")}
              </p>
              <p className="mt-1 text-xs leading-relaxed opacity-90">
                {isRenewalFlow
                  ? t("checkout.renewalNoticeText")
                  : t("checkout.processingNoticeText")}
              </p>
              <Link
                href={getSubscriptionDetailsHref(matchingSubscription.id)}
                className="mt-3 inline-flex items-center gap-1 text-xs font-bold uppercase tracking-[0.18em]"
              >
                {t("checkout.seeSubscription")}
                <span className="material-symbols-outlined text-[14px]">arrow_outward</span>
              </Link>
            </div>
          )}

          {/* Payment Method */}
          <h3 className="font-bold text-[#131118] mb-3">{t("checkout.paymentMethod")}</h3>
          <div className={`p-5 rounded-3xl border-2 transition-all flex flex-col items-start gap-3 ${hasEnoughFunds ? 'border-[#5b13ec] bg-[#5b13ec]/5' : 'border-red-200 bg-red-50'}`}>
            <div className="flex items-center gap-3 w-full">
              <div className={`size-10 rounded-full flex items-center justify-center shrink-0 ${hasEnoughFunds ? 'bg-[#5b13ec] text-white' : 'bg-red-500 text-white'}`}>
                <span className="material-symbols-outlined">account_balance_wallet</span>
              </div>
              <div className="flex flex-col flex-1">
                <span className={`font-bold ${hasEnoughFunds ? 'text-[#131118]' : 'text-red-900'}`}>{t("checkout.wallet")}</span>
                {shouldShowLoadingState ? (
                  <div className="h-3 w-16 bg-black/10 animate-pulse mt-1 rounded"></div>
                ) : (
                  <span className={`text-sm ${hasEnoughFunds ? 'text-gray-500' : 'text-red-600 font-medium'}`}>
                    {t("checkout.balance", { amount: balance?.toLocaleString(dateLocale) ?? 0 })}
                  </span>
                )}
              </div>
              <div className={`size-5 rounded-full border-2 flex items-center justify-center border-[#5b13ec]`}>
                 <div className="size-2.5 rounded-full bg-[#5b13ec]" />
              </div>
            </div>

            {!shouldShowLoadingState && !hasEnoughFunds && (
              <div className="w-full mt-2 p-3 bg-red-100 rounded-xl flex items-center justify-between">
                <span className="text-xs font-bold text-red-700">{t("checkout.insufficientBalance")}</span>
                <Link href="/dashboard/recharge" className="text-xs font-bold bg-white text-red-600 px-3 py-1.5 rounded-full shadow-sm">
                  {t("checkout.topUp")}
                </Link>
              </div>
            )}
          </div>
          
        </main>

        {/* CTA */}
        <div className="sticky bottom-0 mt-auto w-full bg-white border-t border-[#f2f0f4] p-4 z-50 shadow-[0_-10px_30px_rgba(0,0,0,0.05)] pb-safe">
           <button 
             onClick={handlePayment}
             disabled={
               shouldShowLoadingState ||
               !service ||
               (!hasEnoughFunds && !hasBlockingSubscription) ||
               isPaying ||
               (!hasBlockingSubscription && (hasUnacceptedConstraints || hasBlockingConstraints)) ||
               (!hasBlockingSubscription && !isRenewalFlow && assistedActivationIncomplete) ||
               (!hasBlockingSubscription && !isRenewalFlow && isMigrationCase && !migrationConfirmed)
             }
             className="w-full bg-[#dbb723] hover:bg-[#b79218] text-[#131118] font-bold text-lg py-4 rounded-2xl shadow-xl shadow-[#dbb723]/20 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
           >
             {isPaying ? (
               <span className="material-symbols-outlined animate-spin font-light">progress_activity</span>
             ) : (
               <>
                 <span>
                   {hasBlockingSubscription
                     ? t("checkout.seeCurrentSubscription")
                     : isRenewalFlow
                       ? t("checkout.payAndRenew", { amount: finalPriceText })
                       : isMigrationCase
                         ? t("checkout.payAndMigrate", { amount: effectivePayAmountFormatted })
                         : t("checkout.pay", { amount: finalPriceText })}
                 </span>
                 <span className="material-symbols-outlined">
                   {hasBlockingSubscription ? "subscriptions" : "lock"}
                 </span>
               </>
             )}
           </button>
        </div>

      </div>
    </div>
  );
}

export default function CheckoutPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={null}>
      <CheckoutContent params={params} />
    </Suspense>
  );
}
