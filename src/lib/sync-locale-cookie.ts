/**
 * Mirrors next-intl's internal syncLocaleCookie (navigation/shared/syncLocaleCookie.js).
 * Required before hard navigations so middleware resolves unprefixed default-locale URLs.
 *
 * @see https://github.com/amannn/next-intl/issues/786
 */

type LocaleCookieConfig = {
  name: string;
  path?: string;
  sameSite?: "lax" | "strict" | "none" | boolean;
  maxAge?: number;
  secure?: boolean;
  domain?: string;
};

/** Default next-intl locale cookie when localeCookie is true. */
export const NEXT_INTL_LOCALE_COOKIE: LocaleCookieConfig = {
  name: "NEXT_LOCALE",
  sameSite: "lax",
};

function getCookiePath(fullPathname: string): string {
  if (fullPathname === "/") {
    return window.location.pathname;
  }

  const basePath = window.location.pathname.replace(fullPathname, "");
  return basePath !== "" ? basePath : "/";
}

function buildCookieString(
  config: LocaleCookieConfig,
  nextLocale: string,
  path: string,
): string {
  const { name, ...rest } = config;
  const attributes: Record<string, string | number | boolean | undefined> = {
    ...rest,
    path,
  };

  let cookie = `${name}=${nextLocale};`;

  for (const [key, value] of Object.entries(attributes)) {
    const targetKey = key === "maxAge" ? "max-age" : key;
    cookie += targetKey;

    if (typeof value !== "boolean") {
      cookie += `=${value}`;
    }

    cookie += ";";
  }

  return cookie;
}

/**
 * Updates NEXT_LOCALE before a locale switch, matching next-intl's useRouter behavior.
 *
 * @param fullPathname - Browser pathname from `usePathname()` in `next/navigation`
 * @param currentLocale - Active locale
 * @param nextLocale - Target locale
 */
export function syncLocaleCookie(
  fullPathname: string | null,
  currentLocale: string,
  nextLocale: string,
  localeCookie: LocaleCookieConfig | false = NEXT_INTL_LOCALE_COOKIE,
): void {
  const isSwitchingLocale = nextLocale !== currentLocale && nextLocale != null;

  if (!localeCookie || !isSwitchingLocale || !fullPathname) {
    return;
  }

  const path = localeCookie.path ?? getCookiePath(fullPathname);
  document.cookie = buildCookieString(localeCookie, nextLocale, path);
}
