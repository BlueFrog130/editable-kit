// The admin token lives in sessionStorage, which only exists in the browser.
// ponytail: client-only render instead of a cookie session — the token never
// needs to reach the server except as the Authorization header it already is.
export const ssr = false;
