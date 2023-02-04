import type { IUser } from "$lib/server/entities";
import { writable } from "svelte/store";

export const authStore = writable({
  user: null as Partial<IUser> | null,
  token: null as string | null,
});
