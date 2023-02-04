<script lang="ts">
  import { goto } from "$app/navigation";
  import { setAuthCookie } from "$lib/client/auth";
  import { authStore } from "$lib/stores/auth";
  import { handleApiError } from "$lib/client/responseHandlers";
  import LoginForm from "$lib/components/loginForm.svelte";

  function signUp(name: string, password: string) {
    fetch("/users", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        password,
      }),
    }).then(async (response) => {
      if (response.ok) {
        const token = await response.json();
        authStore.set({ user: { name }, token });
        setAuthCookie(token);
        goto("/");
      } else {
        await handleApiError(response);
      }
    });

    return undefined;
  }
</script>

<section>
  <div class="header-text">Sign Up</div>

  <LoginForm btnText="Sign Up" handleLogin={signUp}>
    <p>Already have an account? <a href="/login">Log In</a></p>
  </LoginForm>
</section>

<style>
  .header-text {
    margin-top: 3rem;
    margin-bottom: 2.25rem;
  }

  p {
    margin: 0;
    margin-top: 0.375rem;
    font-size: 0.875rem;
  }
</style>
