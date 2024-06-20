/*
 * Get the Science Platform login URL based on the hostname in the window,
 * requesting a redirect back to the current page.
 * @param currentUrl The current URL (including host and protocol).
 * @returns The login URL.
 */
export function getLoginUrl(currentUrl: string) {
  const loginUrl = new URL('/login', currentUrl);
  const url = new URL(currentUrl);
  loginUrl.searchParams.append('rd', url.href);
  return loginUrl.href;
}

/*
 * Get the Science Platform logout URL based on the hostname in the window,
 * requesting a redirect back to the homepage.
 * @param currentUrl The current URL (including host and protocol).
 * @returns The logout URL.
 */
export function getLogoutUrl(currentUrl: string) {
  const logoutUrl = new URL('/logout', currentUrl);
  const homeUrl = new URL('/', currentUrl);
  logoutUrl.searchParams.append('rd', homeUrl.href);
  return logoutUrl.href;
}
