import { get } from "svelte/store";
import { authStore } from "$lib/stores/auth";
import Cookies from "js-cookie";

const AUTH_COOKIE_NAME = "SeeFood-login-JWT";

export function getAuthCookie() {
  return Cookies.get(AUTH_COOKIE_NAME);
}

export function setAuthCookie(token: string) {
  Cookies.set(AUTH_COOKIE_NAME, token, {
    expires: 7,
    sameSite: "strict",
    secure: true,
  });
}

export function removeAuthCookie() {
  Cookies.remove(AUTH_COOKIE_NAME);
}

export async function silentLogin(): Promise<boolean> {
  const token = get(authStore).token ?? getAuthCookie();

  if (!token) {
    authStore.set({
      user: null,
      token: null,
    });
    return false;
  }

  return await fetch("/users", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }).then(async (res) => {
    if (res.ok) {
      setAuthCookie(token);
      authStore.set({
        user: {
          name: (await res.json()).name,
        },
        token,
      });
    }
    return res.ok;
  });
}

export function logout() {
  authStore.set({
    user: null,
    token: null,
  });
  removeAuthCookie();
}
