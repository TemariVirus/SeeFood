import { get } from "svelte/store";
import { authStore } from "$lib/stores/auth";
import Cookies from "js-cookie";

const AUTH_COOKIE_NAME = "SeeFood-login-JWT";

const loginCallbacks = [] as (() => void)[];

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

export function onCheckCredentials(handler: () => void) {
  loginCallbacks.push(handler);

  return {
    destroy: () => {
      loginCallbacks.splice(loginCallbacks.indexOf(handler), 1);
    },
  };
}

export async function silentLogin(): Promise<boolean> {
  const token = get(authStore).token ?? getAuthCookie();

  if (!token) {
    logout();
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
    } else {
      logout();
    }

    for (const callback of loginCallbacks) {
      callback();
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
