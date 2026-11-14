/**
 * Desktop-only access check. All device rules live here so the backend can later apply the same policy
 * (send `classifyDevice()` along with sign-in, and validate it server-side).
 *
 * Best effort only: user agents and client hints can be spoofed, and "request desktop site" modes exist.
 * This keeps honest phone/tablet users out of a desktop workflow; it is not a security control.
 */

export type DeviceClass = "desktop" | "mobile" | "tablet";

export interface DeviceSignals {
  userAgent: string;
  /** navigator.userAgentData?.mobile (Chromium client hints), when available. */
  uaDataMobile?: boolean;
  /** navigator.userAgentData?.platform, e.g. "Android", "macOS", "Windows". */
  uaDataPlatform?: string;
  maxTouchPoints: number;
}

export interface DeviceCheck {
  device: DeviceClass;
  allowed: boolean;
  reason: string;
}

const PHONE_UA = /iPhone|iPod|Windows Phone|IEMobile|BlackBerry|BB10|Opera Mini|webOS|Android.+Mobile|Mobile Safari(?!.*Macintosh)|\bMobi\b/i;
const TABLET_UA = /iPad|Tablet|PlayBook|Silk|Kindle|KFAPWI|Nexus (7|9|10)|SM-T\d|Android(?!.+Mobile)/i;

/** Pure classification so it can be unit-tested and mirrored on the server. */
export function classifyDevice(s: DeviceSignals): DeviceCheck {
  const ua = s.userAgent;
  if (s.uaDataMobile === true) return blocked("mobile", "Client hints report a mobile device");
  if (s.uaDataPlatform && /^(Android|iOS|iPadOS)$/i.test(s.uaDataPlatform)) return blocked("tablet", `Client hints report ${s.uaDataPlatform}`);
  if (PHONE_UA.test(ua)) return blocked("mobile", "User agent identifies a phone");
  if (TABLET_UA.test(ua)) return blocked("tablet", "User agent identifies a tablet");
  // iPadOS 13+ presents a desktop Safari "Macintosh" UA; real Macs report no touch points.
  if (/Macintosh/i.test(ua) && s.maxTouchPoints > 1) return blocked("tablet", "iPad with a desktop-class user agent");
  // Touch-screen Windows/Linux laptops have touch points too, so touch alone never blocks.
  return { device: "desktop", allowed: true, reason: "Desktop or laptop" };
}

function blocked(device: DeviceClass, reason: string): DeviceCheck {
  return { device, allowed: false, reason };
}

interface UAData {
  mobile?: boolean;
  platform?: string;
}

export function currentDevice(): DeviceCheck {
  if (typeof navigator === "undefined") return { device: "desktop", allowed: true, reason: "No navigator" };
  const uaData = (navigator as Navigator & { userAgentData?: UAData }).userAgentData;
  return classifyDevice({
    userAgent: navigator.userAgent,
    uaDataMobile: uaData?.mobile,
    uaDataPlatform: uaData?.platform,
    maxTouchPoints: navigator.maxTouchPoints ?? 0,
  });
}
