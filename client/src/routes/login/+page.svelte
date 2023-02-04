<script lang="ts">
  import { goto } from "$app/navigation";
  import { authStore } from "$lib/stores/auth";
  import { clientHandleApiError } from "$lib/responseHandlers";
  import LoginForm from "$lib/components/loginForm.svelte";

  function login(name: string, password: string) {
    fetch("/login", {
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
        $authStore.user = { name };
        $authStore.token = token;
        goto("/");
      } else {
        clientHandleApiError(response);
      }
    });

    return undefined;
  }
</script>

<section>
  <div class="header-text">Log In</div>

  <LoginForm btnText="Log In" handleLogin={login}>
    <p>Don't have an account? <a href="/signup">Sign Up</a></p>
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
