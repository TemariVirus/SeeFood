import { redirect } from "@sveltejs/kit";
import { get } from "svelte/store";
import { authStore } from "$lib/stores/auth";
import HttpStatusCodes from "$lib/httpStatusCodes";

export const prerender = false;

export const load = async () => {
  const { user, token } = get(authStore);
  if (!user) throw redirect(HttpStatusCodes.FOUND, "/login");

  return user;
};
