"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DashboardBottomNav } from "@/components/dashboard/bottom-nav";
import { DashboardHeaderControls } from "@/components/dashboard/header-controls";
import { clearStoredAuthToken } from "@/lib/auth-token";
import { apiFetch, safeFetch } from "@/lib/fetch";
import { useI18n } from "@/lib/i18n";

interface UserProfile {
  name: string;
  email: string;
  phone?: string;
  created_at?: string;
  email_verified_at?: string | null;
  email_verified?: boolean;
  kyc_status?: string | null;
  kyc?: {
    status?: string | null;
    is_verified?: boolean;
    requires_action?: boolean;
    student_years_count?: number;
    student_last_verified_at?: string | null;
    latest_document?: {
      status?: string | null;
      admin_note?: string | null;
      updated_at?: string | null;
    } | null;
  } | null;
}

interface SecurityEvent {
  id: number;
  event_type?: string;
  device_name?: string | null;
  country?: string | null;
  city?: string | null;
  risk_level?: string | null;
  is_new_device?: boolean;
  is_suspicious?: boolean;
  created_at?: string | null;
}

interface SecurityDevice {
  id: number;
  device_name?: string | null;
  last_country?: string | null;
  last_city?: string | null;
  last_seen_at?: string | null;
  is_active?: boolean;
}

interface SecurityOverview {
  active_devices_count?: number;
  alerts_last_30_days?: number;
  recent_devices?: SecurityDevice[];
}

interface PaginatedResponse<T> {
  data?: T[];
}

export default function ComptePage() {
  const router = useRouter();
  const { dateLocale, t } = useI18n();
  
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  // État formulaire
  const [formData, setFormData] = useState({ name: "", phone: "" });
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState("");

  // État formulaire mot de passe
  const [pwForm, setPwForm] = useState({ current: "", next: "", confirm: "" });
  const [pwSaving, setPwSaving] = useState(false);
  const [pwError, setPwError] = useState("");
  const [pwSuccess, setPwSuccess] = useState(false);

  // État KYC étudiant
  const [kycFile, setKycFile] = useState<File | null>(null);
  const [kycUploading, setKycUploading] = useState(false);
  const [kycError, setKycError] = useState("");
  const [kycSuccess, setKycSuccess] = useState(false);
  const [verificationSending, setVerificationSending] = useState(false);
  const [verificationMessage, setVerificationMessage] = useState("");
  const [verificationError, setVerificationError] = useState("");
  const [securityOverview, setSecurityOverview] = useState<SecurityOverview | null>(null);
  const [loginHistory, setLoginHistory] = useState<SecurityEvent[]>([]);
  const [securityLoading, setSecurityLoading] = useState(true);
  const [securityError, setSecurityError] = useState("");
  const [revokingDevices, setRevokingDevices] = useState(false);
  const [revokeSuccess, setRevokeSuccess] = useState(false);

  useEffect(() => {
    safeFetch<{ data?: UserProfile }>("/api/v1/me")
      .then((data) => {
        const user = data?.data;
        if (user) {
          setProfile(user);
          setFormData({
            name: user.name || "",
            phone: user.phone || "",
          });
        } else {
          // Fallback local si l'API ne répond pas / 401
          const fallback: UserProfile = { name: t("account.defaultUser"), email: "N/A" };
          setProfile(fallback);
          setFormData({ name: "", phone: "" });
        }
        setIsLoading(false);
      })
      .catch((err) => {
        console.error(t("account.profileError"), err);
        setProfile({ name: t("account.defaultUser"), email: "N/A" });
        setFormData({ name: "", phone: "" });
        setIsLoading(false);
      });
  }, [t]);

  const handleResendVerificationEmail = async () => {
    setVerificationSending(true);
    setVerificationMessage("");
    setVerificationError("");

    try {
      const res = await apiFetch("/api/v1/email/resend", {
        method: "POST",
      });
      const text = await res.text();
      const data = text ? JSON.parse(text) : {};

      if (!res.ok) {
        setVerificationError(data?.message || t("account.verificationSendError"));
        return;
      }

      setVerificationMessage(data?.message || t("account.verificationSent"));
    } catch {
      setVerificationError(t("account.retryNetwork"));
    } finally {
      setVerificationSending(false);
    }
  };

  useEffect(() => {
    Promise.all([
      safeFetch<{ data?: SecurityOverview }>("/api/v1/me/security/overview"),
      safeFetch<PaginatedResponse<SecurityEvent>>("/api/v1/me/security/login-history?per_page=5"),
    ])
      .then(([overviewResponse, historyResponse]) => {
        setSecurityOverview(overviewResponse?.data ?? null);
        setLoginHistory(historyResponse?.data ?? []);
      })
      .catch((err) => {
        console.error(t("account.securityErrorLog"), err);
        setSecurityError(t("account.securityLoadError"));
      })
      .finally(() => {
        setSecurityLoading(false);
      });
  }, [t]);

  const formatSecurityDate = (dateStr?: string | null) => {
    if (!dateStr) return t("account.unknownDate");
    const date = new Date(dateStr);
    if (Number.isNaN(date.getTime())) return t("account.unknownDate");

    return date.toLocaleDateString(dateLocale, {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatLocation = (city?: string | null, country?: string | null) => {
    const parts = [city, country].filter(Boolean);
    return parts.length > 0 ? parts.join(", ") : t("account.unknownLocation");
  };

  const getDeviceIcon = (deviceName?: string | null) => {
    const label = deviceName?.toLowerCase() ?? "";
    return /iphone|android|mobile|phone/.test(label) ? "smartphone" : "computer";
  };

  const handleRevokeDevices = async () => {
    setRevokingDevices(true);
    setSecurityError("");
    setRevokeSuccess(false);

    try {
      const res = await apiFetch("/api/v1/me/security/not-me", {
        method: "POST",
        body: JSON.stringify({ keep_current_session: true }),
      });

      const text = await res.text();
      const data = text ? JSON.parse(text) : {};

      if (!res.ok) {
        throw new Error(data?.message || t("account.revokeError"));
      }

      setRevokeSuccess(true);

      const [overviewResponse, historyResponse] = await Promise.all([
        safeFetch<{ data?: SecurityOverview }>("/api/v1/me/security/overview"),
        safeFetch<PaginatedResponse<SecurityEvent>>("/api/v1/me/security/login-history?per_page=5"),
      ]);

      setSecurityOverview(overviewResponse?.data ?? null);
      setLoginHistory(historyResponse?.data ?? []);
    } catch (error) {
      setSecurityError(error instanceof Error ? error.message : t("account.revokeError"));
    } finally {
      setRevokingDevices(false);
    }
  };

  const handleLogout = () => {
    clearStoredAuthToken();
    router.push("/login");
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);
    setSaveError("");

    try {
      const res = await apiFetch("/api/v1/me/profile", {
        method: "PATCH",
        body: JSON.stringify({
          name: formData.name,
          phone: formData.phone,
        }),
      });
      const text = await res.text();
      const data = text ? JSON.parse(text) : {};

      if (!res.ok) {
        throw new Error(data?.message || t("account.saveError"));
      }

      const user = data?.data as UserProfile | undefined;
      if (user) {
        setProfile((current) => ({
          ...(current || {}),
          ...user,
        }));
        setFormData({
          name: user.name || "",
          phone: user.phone || "",
        });
      }

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : t("account.retryNetwork"));
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwError("");
    setPwSuccess(false);

    if (pwForm.next !== pwForm.confirm) {
      setPwError(t("auth.passwordMismatch"));
      return;
    }
    if (pwForm.next.length < 8) {
      setPwError(t("account.minPassword"));
      return;
    }

    setPwSaving(true);
    try {
      const res = await apiFetch("/api/v1/me/password", {
        method: "POST",
        body: JSON.stringify({ current_password: pwForm.current, password: pwForm.next, password_confirmation: pwForm.confirm }),
      });
      const text = await res.text();
      if (!res.ok) {
        const err = text ? JSON.parse(text) : {};
        setPwError(err?.message || t("account.passwordCurrentWrong"));
      } else {
        setPwSuccess(true);
        setPwForm({ current: "", next: "", confirm: "" });
        setTimeout(() => setPwSuccess(false), 3000);
      }
    } catch {
      setPwError(t("account.retryNetwork"));
    } finally {
      setPwSaving(false);
    }
  };

  const emailVerified = Boolean(profile?.email_verified ?? profile?.email_verified_at);
  const kycStatus = profile?.kyc?.status ?? profile?.kyc_status ?? "none";

  return (
    <div className="dashboard-mode bg-[#f6f6f8] text-[#131118] min-h-screen flex justify-center sm:items-center sm:p-4">
      {/* Container */}
      <div className="w-full sm:max-w-[420px] sm:h-[90vh] sm:max-h-[850px] bg-[#f6f6f8] sm:rounded-[40px] overflow-hidden relative shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] flex flex-col mx-auto h-[100dvh] sm:h-auto">
        
        {/* Sticky Header */}
        <header className="sticky top-0 z-50 bg-[#f6f6f8] px-5 py-4 flex flex-col gap-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <button onClick={() => router.back()} className="flex items-center justify-center size-9 rounded-full bg-white border border-gray-100 text-[#131118] hover:bg-gray-50 transition-colors mr-1">
                <span className="material-symbols-outlined text-[20px]">arrow_back</span>
              </button>
              <h1 className="text-lg font-bold tracking-tight">{t("account.title")}</h1>
            </div>
            <DashboardHeaderControls />
          </div>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto no-scrollbar scroll-smooth px-5 pb-6 pt-2">
          
          {isLoading ? (
            <div className="flex flex-col gap-6 animate-pulse">
              <div className="flex flex-col items-center gap-3 mt-4">
                <div className="size-24 rounded-full bg-gray-200"></div>
                <div className="h-4 w-32 bg-gray-200 rounded"></div>
                <div className="h-3 w-40 bg-gray-200 rounded"></div>
              </div>
              <div className="bg-white rounded-3xl p-5 h-64 mt-4"></div>
            </div>
          ) : (
            <>
              {/* Profile Overview */}
              <div className="flex flex-col items-center mb-8 mt-2">
                <div className="size-24 rounded-full bg-[#131118] text-white flex items-center justify-center text-3xl font-bold mb-4 shadow-xl shadow-black/10 relative">
                  {profile?.name?.charAt(0).toUpperCase() || "U"}
                  <div className="absolute bottom-0 right-0 size-7 bg-white rounded-full flex items-center justify-center shadow-sm cursor-pointer hover:bg-gray-50">
                    <span className="material-symbols-outlined text-[#eab308] text-[16px] font-bold">edit</span>
                  </div>
                </div>
                <h2 className="text-xl font-extrabold">{profile?.name || t("account.defaultUser")}</h2>
                <p className="text-sm font-medium text-gray-500">{profile?.email || "-"}</p>
                <div className="flex gap-2 mt-2 flex-wrap justify-center">
                  {emailVerified ? (
                    <span className="text-xs font-bold px-3 py-1 bg-green-100 text-green-700 rounded-full flex items-center gap-1">
                      <span className="material-symbols-outlined text-[12px]" style={{ fontVariationSettings: "'FILL' 1" }}>mark_email_read</span>
                      {t("account.emailVerified")}
                    </span>
                  ) : (
                    <span className="text-xs font-bold px-3 py-1 bg-orange-100 text-orange-700 rounded-full flex items-center gap-1">
                      <span className="material-symbols-outlined text-[12px]">mail</span>
                      {t("account.emailUnverified")}
                    </span>
                  )}
                  {kycStatus === "verified" && (
                    <span className="text-xs font-bold px-3 py-1 bg-blue-100 text-blue-700 rounded-full flex items-center gap-1">
                      <span className="material-symbols-outlined text-[12px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified_user</span>
                      {t("account.studentKyc")}
                    </span>
                  )}
                </div>
              </div>

              {!emailVerified && (
                <div className="bg-amber-50 rounded-3xl p-6 border border-amber-200 shadow-sm mb-6">
                  <div className="flex items-start gap-3">
                    <div className="mt-1 flex size-11 shrink-0 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
                      <span className="material-symbols-outlined">mark_email_unread</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-[#131118]">{t("account.emailRequired")}</h3>
                      <p className="mt-1 text-sm text-amber-800/80">
                        {t("account.emailRequiredText")}
                      </p>
                    </div>
                  </div>

                  {verificationMessage && (
                    <p className="mt-4 rounded-2xl bg-green-50 px-4 py-3 text-sm font-bold text-green-700">{verificationMessage}</p>
                  )}

                  {verificationError && (
                    <p className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm font-bold text-red-700">{verificationError}</p>
                  )}

                  <button
                    type="button"
                    disabled={verificationSending}
                    onClick={handleResendVerificationEmail}
                    className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#131118] py-3.5 text-sm font-bold text-white transition-colors hover:bg-black disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {verificationSending ? (
                      <span className="material-symbols-outlined animate-spin text-[20px]">refresh</span>
                    ) : (
                      <>
                        <span>{t("account.resendVerification")}</span>
                        <span className="material-symbols-outlined text-[18px]">outgoing_mail</span>
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* Edit Form */}
              <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm mb-6">
                <div className="flex items-center justify-between mb-4">
                   <h3 className="font-bold text-[#131118]">{t("account.information")}</h3>
                   {saveSuccess && <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-md">{t("account.updated")}</span>}
                </div>
                
                <form onSubmit={handleSave} className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-gray-500 uppercase">{t("common.fullName")}</label>
                    <input 
                      type="text" 
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full bg-[#f6f6f8] border-none rounded-xl px-4 py-3 text-sm font-semibold focus:ring-2 focus:ring-[#5b13ec] outline-none transition-all"
                    />
                  </div>
                  
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-gray-500 uppercase">{t("common.phone")}</label>
                    <input 
                      type="text" 
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      placeholder="+237 ..."
                      className="w-full bg-[#f6f6f8] border-none rounded-xl px-4 py-3 text-sm font-semibold focus:ring-2 focus:ring-[#5b13ec] outline-none transition-all"
                    />
                  </div>

                  {saveError && (
                    <p className="text-xs font-bold text-red-600 bg-red-50 px-3 py-2 rounded-xl">{saveError}</p>
                  )}

                  <button 
                    type="submit" 
                    disabled={isSaving || (formData.name === profile?.name && formData.phone === profile?.phone)}
                    className="mt-2 w-full bg-[#131118] hover:bg-black text-white font-bold py-3.5 rounded-xl shadow-lg shadow-black/10 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isSaving ? <span className="material-symbols-outlined animate-spin text-[20px]">refresh</span> : <span>{t("account.saveChanges")}</span>}
                  </button>
                </form>
              </div>

              {/* Password Change */}
              <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-[#131118]">{t("account.passwordSection")}</h3>
                  {pwSuccess && <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-md">{t("account.modified")}</span>}
                </div>

                <form onSubmit={handlePasswordChange} className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-gray-500 uppercase">{t("account.currentPassword")}</label>
                    <input
                      type="password"
                      value={pwForm.current}
                      onChange={(e) => setPwForm({ ...pwForm, current: e.target.value })}
                      placeholder="••••••••"
                      className="w-full bg-[#f6f6f8] border-none rounded-xl px-4 py-3 text-sm font-semibold focus:ring-2 focus:ring-[#5b13ec] outline-none transition-all"
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-gray-500 uppercase">{t("account.newPassword")}</label>
                    <input
                      type="password"
                      value={pwForm.next}
                      onChange={(e) => setPwForm({ ...pwForm, next: e.target.value })}
                      placeholder="••••••••"
                      className="w-full bg-[#f6f6f8] border-none rounded-xl px-4 py-3 text-sm font-semibold focus:ring-2 focus:ring-[#5b13ec] outline-none transition-all"
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-gray-500 uppercase">{t("account.confirm")}</label>
                    <input
                      type="password"
                      value={pwForm.confirm}
                      onChange={(e) => setPwForm({ ...pwForm, confirm: e.target.value })}
                      placeholder="••••••••"
                      className={`w-full bg-[#f6f6f8] border-none rounded-xl px-4 py-3 text-sm font-semibold focus:ring-2 outline-none transition-all ${
                        pwForm.confirm && pwForm.confirm !== pwForm.next ? "ring-2 ring-red-400" : "focus:ring-[#5b13ec]"
                      }`}
                      required
                    />
                  </div>

                  {pwError && (
                    <p className="text-xs font-bold text-red-600 bg-red-50 px-3 py-2 rounded-xl">{pwError}</p>
                  )}

                  <button
                    type="submit"
                    disabled={pwSaving || !pwForm.current || !pwForm.next || !pwForm.confirm}
                    className="mt-1 w-full bg-[#5b13ec] hover:bg-[#4a0ebb] text-white font-bold py-3.5 rounded-xl shadow-lg shadow-[#5b13ec]/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {pwSaving
                      ? <span className="material-symbols-outlined animate-spin text-[20px]">refresh</span>
                      : <span>{t("account.changePassword")}</span>
                    }
                  </button>
                </form>
              </div>

              {/* KYC Étudiant */}
              {kycStatus !== "verified" && (
                <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm mb-6">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-bold text-[#131118]">{t("account.studentVerification")}</h3>
                    {kycStatus === "pending" && (
                      <span className="text-xs font-bold px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded-md">{t("account.pending")}</span>
                    )}
                    {(kycStatus === "rejected" || kycStatus === "revoked") && (
                      <span className="text-xs font-bold px-2 py-0.5 bg-red-100 text-red-700 rounded-md">{t("account.rejected")}</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mb-4">
                    {t("account.kycDescription")}
                  </p>

                  {kycSuccess ? (
                    <div className="flex items-center gap-2 bg-green-50 text-green-700 px-4 py-3 rounded-xl text-sm font-bold">
                      <span className="material-symbols-outlined text-[18px]">check_circle</span>
                      {t("account.kycSent")}
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3">
                      <label className={`flex flex-col items-center justify-center gap-2 p-5 border-2 border-dashed rounded-2xl cursor-pointer transition-colors ${kycFile ? 'border-[#5b13ec] bg-[#5b13ec]/5' : 'border-gray-200 hover:border-[#5b13ec]/50'}`}>
                        <span className={`material-symbols-outlined text-[32px] ${kycFile ? 'text-[#5b13ec]' : 'text-gray-400'}`}>
                          {kycFile ? 'description' : 'upload_file'}
                        </span>
                        <span className="text-sm font-semibold text-gray-600 text-center">
                          {kycFile ? kycFile.name : t("account.fileSelect")}
                        </span>
                        <span className="text-xs text-gray-400">{t("account.fileHelp")}</span>
                        <input type="file" accept=".jpg,.jpeg,.png,.pdf" className="hidden"
                          onChange={(e) => { setKycFile(e.target.files?.[0] || null); setKycError(""); }}
                        />
                      </label>

                      {kycError && <p className="text-xs font-bold text-red-600 bg-red-50 px-3 py-2 rounded-xl">{kycError}</p>}

                      <button
                        disabled={!kycFile || kycUploading}
                        onClick={async () => {
                          if (!kycFile) return;
                          setKycUploading(true);
                          setKycError("");
                          try {
                            const fd = new FormData();
                            fd.append("file", kycFile);
                            const res = await apiFetch("/api/v1/kyc/student", { method: "POST", body: fd });
                            if (!res.ok) {
                              const text = await res.text();
                              const err = text ? JSON.parse(text) : {};
                              setKycError(err?.message || t("account.fileUploadError"));
                            } else {
                              setKycSuccess(true);
                            }
                          } catch {
                            setKycError(t("account.retryNetwork"));
                          } finally {
                            setKycUploading(false);
                          }
                        }}
                        className="w-full bg-[#131118] text-white font-bold py-3 rounded-xl disabled:opacity-50 flex items-center justify-center gap-2 transition-all"
                      >
                        {kycUploading
                          ? <span className="material-symbols-outlined animate-spin text-[20px]">refresh</span>
                          : <><span>{t("account.sendDocument")}</span><span className="material-symbols-outlined text-[18px]">upload</span></>
                        }
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Security History */}
              <h3 className="font-bold text-[#131118] mb-4 text-sm uppercase text-gray-500 px-1">{t("account.accountSecurity")}</h3>
              <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm flex flex-col gap-4 mb-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-2xl bg-[#f6f6f8] px-4 py-3">
                    <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-gray-400">{t("account.activeDevices")}</span>
                    <p className="mt-2 text-2xl font-extrabold text-[#131118]">{securityOverview?.active_devices_count ?? 0}</p>
                  </div>
                  <div className="rounded-2xl bg-[#f6f6f8] px-4 py-3">
                    <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-gray-400">{t("account.alerts30d")}</span>
                    <p className="mt-2 text-2xl font-extrabold text-[#131118]">{securityOverview?.alerts_last_30_days ?? 0}</p>
                  </div>
                </div>

                {revokeSuccess && (
                  <div className="rounded-2xl bg-green-50 px-4 py-3 text-sm font-bold text-green-700">
                    {t("account.revokedSuccess")}
                  </div>
                )}

                {securityError && (
                  <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
                    {securityError}
                  </div>
                )}

                <div className="flex flex-col gap-3">
                  <h4 className="text-xs font-bold uppercase tracking-[0.16em] text-gray-400">{t("account.latestConnections")}</h4>
                  {securityLoading ? (
                    [0, 1, 2].map((item) => (
                      <div key={item} className="flex items-start gap-4 rounded-2xl bg-[#f6f6f8] px-4 py-4 animate-pulse">
                        <div className="size-10 rounded-full bg-gray-200 shrink-0" />
                        <div className="flex-1 space-y-2">
                          <div className="h-4 w-40 rounded bg-gray-200" />
                          <div className="h-3 w-32 rounded bg-gray-200" />
                        </div>
                      </div>
                    ))
                  ) : loginHistory.length > 0 ? (
                    loginHistory.map((item, index) => (
                      <div key={item.id} className={`flex items-start gap-4 ${index !== loginHistory.length - 1 ? 'pb-4 border-b border-gray-100' : ''}`}>
                        <div className={`mt-1 size-10 rounded-full flex items-center justify-center shrink-0 ${item.is_suspicious ? 'bg-red-100 text-red-600' : item.is_new_device ? 'bg-amber-100 text-amber-600' : 'bg-gray-50 text-gray-500'}`}>
                          <span className="material-symbols-outlined text-[20px]">{getDeviceIcon(item.device_name)}</span>
                        </div>
                        <div className="flex flex-col flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-sm text-[#131118]">{item.device_name || t("account.unknownDevice")}</span>
                            {index === 0 && <span className="text-[9px] font-bold bg-green-500 text-white px-1.5 py-0.5 rounded uppercase">{t("account.recent")}</span>}
                            {item.is_new_device && <span className="text-[9px] font-bold bg-amber-500 text-white px-1.5 py-0.5 rounded uppercase">{t("account.new")}</span>}
                            {item.is_suspicious && <span className="text-[9px] font-bold bg-red-500 text-white px-1.5 py-0.5 rounded uppercase">{t("account.alert")}</span>}
                          </div>
                          <span className="text-xs text-gray-500 font-medium">
                            {formatLocation(item.city, item.country)} • {formatSecurityDate(item.created_at)}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-2xl bg-[#f6f6f8] px-4 py-4 text-sm text-gray-500">
                      {t("account.noLoginHistory")}
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-3">
                  <h4 className="text-xs font-bold uppercase tracking-[0.16em] text-gray-400">{t("account.knownDevices")}</h4>
                  {(securityOverview?.recent_devices ?? []).length > 0 ? (
                    securityOverview!.recent_devices!.map((device) => (
                      <div key={device.id} className="flex items-start gap-4 rounded-2xl bg-[#f6f6f8] px-4 py-4">
                        <div className={`mt-1 size-10 rounded-full flex items-center justify-center shrink-0 ${device.is_active ? 'bg-green-100 text-green-600' : 'bg-gray-200 text-gray-500'}`}>
                          <span className="material-symbols-outlined text-[20px]">{getDeviceIcon(device.device_name)}</span>
                        </div>
                        <div className="flex flex-col flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-sm text-[#131118]">{device.device_name || t("account.unknownDevice")}</span>
                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${device.is_active ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-700'}`}>
                              {device.is_active ? t("common.active") : t("account.revoked")}
                            </span>
                          </div>
                          <span className="text-xs text-gray-500 font-medium">
                            {formatLocation(device.last_city, device.last_country)} • {t("account.seenOn", { date: formatSecurityDate(device.last_seen_at) })}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    !securityLoading && (
                      <div className="rounded-2xl bg-[#f6f6f8] px-4 py-4 text-sm text-gray-500">
                        {t("account.noSavedDevice")}
                      </div>
                    )
                  )}
                </div>
                
                <button
                  type="button"
                  disabled={revokingDevices}
                  onClick={handleRevokeDevices}
                  className="w-full py-2 mt-2 text-sm font-bold text-red-500 hover:text-red-700 bg-red-50 rounded-xl transition-colors disabled:opacity-50"
                >
                  {revokingDevices ? t("account.revoking") : t("account.logoutOtherDevices")}
                </button>
              </div>

               {/* Log out */}
               <button onClick={handleLogout} className="w-full py-4 mt-4 text-sm font-bold text-gray-700 hover:text-black hover:bg-gray-200 bg-white border border-gray-200 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-sm">
                   <span className="material-symbols-outlined">logout</span>
                   {t("account.logout")}
               </button>

            </>
          )}

        </main>

        <DashboardBottomNav active="account" />

      </div>
    </div>
  );
}
