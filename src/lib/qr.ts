import { renderSVG } from "uqr"

/** Renders a QR code as an SVG string (no network request). */
export function renderQrSvg(data: string): string {
  return renderSVG(data)
}
