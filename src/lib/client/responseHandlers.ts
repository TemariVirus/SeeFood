import { goto } from "$app/navigation";
import HttpStatusCodes from "$lib/httpStatusCodes";
import { logout } from "$lib/client/auth";

export async function handleApiError(response: Response) {
  alert(
    await response.json().then((data) => {
      if (Array.isArray(data)) {
        data = data[0];
      }
      return data.message ?? data;
    })
  );

  if (response.status === HttpStatusCodes.UNAUTHORIZED) {
    logout();
    goto("/login");
  }
}
