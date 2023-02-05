import { get } from "svelte/store";
import { goto } from "$app/navigation";
import { authStore } from "$lib/stores/auth";
import { onCheckCredentials } from "$lib/client/auth";

export const load = async () => {
  onCheckCredentials(() => {
    if (get(authStore).user) {
      goto("/profile");
    }
  });
};
