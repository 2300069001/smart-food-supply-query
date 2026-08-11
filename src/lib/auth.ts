const AUTH_KEY = 'sfc_authenticated';

export function isAuthenticated(): boolean {
  return sessionStorage.getItem(AUTH_KEY) === 'true';
}

export function setAuthenticated(): void {
  sessionStorage.setItem(AUTH_KEY, 'true');
}
