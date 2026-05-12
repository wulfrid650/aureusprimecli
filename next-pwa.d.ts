declare module "next-pwa" {
  import type { NextConfig } from "next";

  type WithPwa = (config: NextConfig) => NextConfig;

  export default function nextPwa(
    options?: Record<string, unknown>,
  ): WithPwa;
}
