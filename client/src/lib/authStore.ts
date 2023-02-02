import type { IUser } from "$lib/server/entities";
import { writable } from "svelte/store";

export const store = writable({
  user: null as IUser | null,
  token: null as string | null,
});
