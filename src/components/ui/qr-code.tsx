"use client";

import { useMemo } from "react";
import qrcodeGenerator from "@/lib/vendor/qrcode-generator";

interface QrCodeProps {
  value: string;
  size?: number;
  className?: string;
  /** Module color, e.g. "#131118". Defaults to currentColor so it follows text color / theme. */
  moduleColor?: string;
  backgroundColor?: string;
}

/**
 * Renders a QR code as inline SVG using a locally vendored, dependency-free
 * encoder (src/lib/vendor/qrcode-generator.ts — MIT, Kazuhiko Arase). No new
 * npm dependency: the project had no QR library available (direct or
 * transitive) so this was vendored instead of pulled from npm.
 */
export function QrCode({ value, size = 220, className, moduleColor = "currentColor", backgroundColor = "#ffffff" }: QrCodeProps) {
  const modules = useMemo(() => {
    if (!value) return null;

    try {
      // typeNumber = 0 lets the encoder auto-pick the smallest QR version
      // that fits the payload; "M" is a common default error-correction level.
      const qr = qrcodeGenerator(0, "M");
      qr.addData(value);
      qr.make();

      const count = qr.getModuleCount();
      const cells: boolean[][] = [];
      for (let row = 0; row < count; row++) {
        const line: boolean[] = [];
        for (let col = 0; col < count; col++) {
          line.push(qr.isDark(row, col));
        }
        cells.push(line);
      }
      return cells;
    } catch {
      return null;
    }
  }, [value]);

  if (!modules) {
    return null;
  }

  const count = modules.length;

  return (
    <svg
      viewBox={`0 0 ${count} ${count}`}
      width={size}
      height={size}
      role="img"
      aria-label="QR code"
      className={className}
      shapeRendering="crispEdges"
    >
      <rect x={0} y={0} width={count} height={count} fill={backgroundColor} />
      {modules.map((row, rowIndex) =>
        row.map((isDark, colIndex) =>
          isDark ? (
            <rect key={`${rowIndex}-${colIndex}`} x={colIndex} y={rowIndex} width={1} height={1} fill={moduleColor} />
          ) : null,
        ),
      )}
    </svg>
  );
}
