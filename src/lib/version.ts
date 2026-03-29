/**
 * Version management utilities.
 * Reads version from version.json which is updated by CI/CD.
 */

interface VersionInfo {
  version: string;
  releaseType: "stable" | "dev";
  timestamp?: number;
}

let cachedVersion: VersionInfo | null = null;

/**
 * Get the current app version from version.json.
 * This is populated by the CI/CD workflow during releases.
 *
 * Format:
 * - Stable: "1.0.0"
 * - Dev: "1.0.0-dev.1"
 */
export function getAppVersion(): VersionInfo {
  // Return cached version if already loaded
  if (cachedVersion) {
    return cachedVersion;
  }

  // Try to load from window for client-side (Vite will inject this)
  if (typeof window !== "undefined" && (window as any).__APP_VERSION__) {
    cachedVersion = (window as any).__APP_VERSION__;
    return cachedVersion;
  }

  // Fallback to default version
  cachedVersion = {
    version: "0.1.0",
    releaseType: "dev",
  };

  return cachedVersion;
}

/**
 * Get formatted version string for display.
 * Examples:
 * - "1.0.0" for stable releases
 * - "1.0.0-dev.1" for dev builds
 */
export function getVersionString(): string {
  const info = getAppVersion();
  if (info.releaseType === "stable") {
    return info.version;
  }
  return `${info.version}-dev`;
}

/**
 * Get release type display text.
 */
export function getReleaseType(): string {
  const info = getAppVersion();
  return info.releaseType === "stable" ? "Stable" : "Development";
}
