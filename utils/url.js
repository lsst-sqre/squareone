/* Client-side URL utilities */

/*
 * Get the Science Platform login URL based on the hostname in the window,
 * requesting a redirect back to the current page.
 */
export function getLoginUrl(currentUrl) {
  const url = new URL('/login', currentUrl);
  url.searchParams.append('rd', currentUrl);
  return url.href;
}

/*
 * Get the Science Platform logout URL based on the hostname in the window,
 * requesting a redirect back to the homepage.
 */
export function getLogoutUrl(currentUrl) {
  const logoutUrl = new URL('/logout', currentUrl);
  const homeUrl = new URL('/', currentUrl);
  logoutUrl.searchParams.append('rd', homeUrl);
  return logoutUrl.href;
}

/*
 * Get the development-mode login API endpoint.
 */
export function getDevLoginEndpoint(currentUrl) {
  const url = new URL('/api/dev/login', currentUrl);
  return url.href;
}

/*
 * Get the development-mode logout API endpoint.
 */
export function getDevLogoutEndpoint(currentUrl) {
  const url = new URL('/api/dev/logout', currentUrl);
  return url.href;
}
