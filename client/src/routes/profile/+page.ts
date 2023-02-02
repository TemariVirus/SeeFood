import { redirect } from "@sveltejs/kit";
import { get } from "svelte/store";
import { store } from "$lib/authStore";
import HttpStatusCodes from "$lib/httpStatusCodes";

export const prerender = "auto";

export const load = async () => {
  const data = get(store);
  if (!data.user) throw redirect(HttpStatusCodes.FOUND, "/login");

  return data.user;
};
