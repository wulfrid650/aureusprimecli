const E164_WITH_COUNTRY_CODE = /^\+[1-9]\d{6,14}$/;

export function hasPhoneCountryCode(value: string): boolean {
  return E164_WITH_COUNTRY_CODE.test(value.trim().replace(/[\s-]/g, ""));
}
