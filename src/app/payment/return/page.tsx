"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getApiMessage, readApiResponse } from "@/lib/api-response";
import { apiFetch } from "@/lib/fetch";
import { useI18n } from "@/lib/i18n";
import { getSubscriptionDetailsHref } from "@/lib/subscriptions";

type PaymentFinalizeResponse = {
  order_ref?: string;
  order_id?: number;
  subscription_id?: number;
  kyc_required?: boolean;
};

function resolvePaymentReturnHref(data?: PaymentFinalizeResponse): string {
  if (data?.subscription_id) {
    return getSubscriptionDetailsHref(data.subscription_id);
  }

  if (data?.kyc_required) {
    return "/dashboard/compte";
  }

  return "/dashboard/wallet";
}

export default function PaymentReturnPage() {
  const router = useRouter();
  const { t } = useI18n();
  const [status, setStatus] = useState<'loading' | 'success' | 'failed'>('loading');
  const [message, setMessage] = useState('');
  const [redirectHref, setRedirectHref] = useState("/dashboard");

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const provider = searchParams.get('provider') ?? (searchParams.get('token') ? 'paypal' : 'moneroo');
    const ref = searchParams.get('ref');
    const paymentStatus = searchParams.get('paymentStatus');
    const paypalOrderId = searchParams.get('token') ?? searchParams.get('paypal_order_id') ?? searchParams.get('orderId');

    if (!ref) {
      queueMicrotask(() => {
        setStatus('failed');
        setMessage(t("paymentReturn.missingParams"));
      });
      return;
    }

    if (provider === 'paypal') {
      if (!paypalOrderId) {
        queueMicrotask(() => {
          setStatus('failed');
          setMessage(t("paymentReturn.missingParams"));
        });
        return;
      }

      apiFetch('/api/v1/checkout/paypal/capture', {
        method: 'POST',
        body: JSON.stringify({ paypal_order_id: paypalOrderId, order_ref: ref }),
      })
        .then(async (res) => {
          const data = await readApiResponse<PaymentFinalizeResponse>(res);

          if (res.ok && data?.status === "success") {
            const requiresKyc = Boolean(data.data?.kyc_required);
            const nextHref = resolvePaymentReturnHref(data.data);

            setRedirectHref(nextHref);
            setStatus('success');
            setMessage(getApiMessage(data, requiresKyc ? t("paymentReturn.kycRequiredSuccess") : t("paymentReturn.topupSuccess")));
            setTimeout(() => {
              router.push(nextHref);
            }, 3000);
          } else {
            setStatus('failed');
            setMessage(getApiMessage(data, t("paymentReturn.verifyFailed")));
          }
        })
        .catch(err => {
          console.error('Payment verification failed:', err);
          setStatus('failed');
          setMessage(t("paymentReturn.verifyError"));
        });
      return;
    }

    if (paymentStatus && paymentStatus !== 'success') {
      queueMicrotask(() => {
        setStatus('failed');
        setMessage(t("paymentReturn.paymentFailed"));
      });
      return;
    }

    apiFetch('/api/v1/checkout/moneroo/verify', {
      method: 'POST',
      body: JSON.stringify({ order_ref: ref }),
    })
      .then(async (res) => {
        const data = await readApiResponse<PaymentFinalizeResponse>(res);

        if (res.ok && data?.status === "success") {
          const requiresKyc = Boolean(data.data?.kyc_required);
          const nextHref = resolvePaymentReturnHref(data.data);

          setRedirectHref(nextHref);
          setStatus('success');
          setMessage(getApiMessage(data, requiresKyc ? t("paymentReturn.kycRequiredSuccess") : t("paymentReturn.topupSuccess")));
          setTimeout(() => {
            router.push(nextHref);
          }, 3000);
        } else {
          setStatus('failed');
          setMessage(getApiMessage(data, t("paymentReturn.verifyFailed")));
        }
      })
      .catch(err => {
        console.error('Payment verification failed:', err);
        setStatus('failed');
        setMessage(t("paymentReturn.verifyError"));
      });
  }, [router, t]);

  return (
    <div className="bg-[#f6f6f8] text-[#131118] min-h-screen flex justify-center items-center p-4">
      <div className="w-full max-w-md bg-white rounded-[40px] p-8 text-center shadow-lg">
        {status === 'loading' && (
          <>
            <div className="size-16 bg-[#f2f0f4] rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-[#5b13ec] animate-spin">progress_activity</span>
            </div>
            <h1 className="text-xl font-bold mb-2">{t("paymentReturn.verifyingTitle")}</h1>
            <p className="text-gray-600">{t("paymentReturn.verifyingText")}</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="size-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-green-600">check_circle</span>
            </div>
            <h1 className="text-xl font-bold mb-2 text-green-600">{t("paymentReturn.successTitle")}</h1>
            <p className="text-gray-600 mb-6">{message}</p>
            <p className="text-sm text-gray-500">{t("paymentReturn.redirectDashboard")}</p>
            <Link href={redirectHref} className="inline-block mt-4 px-6 py-3 bg-[#5b13ec] text-white rounded-full font-bold hover:bg-[#4a0ebb] transition-colors">
              {t("paymentReturn.goDashboard")}
            </Link>
          </>
        )}

        {status === 'failed' && (
          <>
            <div className="size-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-red-600">error</span>
            </div>
            <h1 className="text-xl font-bold mb-2 text-red-600">{t("paymentReturn.failedTitle")}</h1>
            <p className="text-gray-600 mb-6">{message}</p>
            <Link href="/dashboard/recharge" className="inline-block px-6 py-3 bg-[#5b13ec] text-white rounded-full font-bold hover:bg-[#4a0ebb] transition-colors">
              {t("paymentReturn.retry")}
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
