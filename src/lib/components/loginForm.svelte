<script lang="ts">
  let username = "",
    password = "";

  export let btnText: string;
  export let handleLogin: (
    username: string,
    password: string
  ) => null | undefined;
</script>

<form class="form" on:submit|preventDefault={handleLogin(username, password)}>
  <input
    bind:value={username}
    name="username"
    type="username"
    aria-label="username"
    placeholder="Username"
    class="rounded-full"
  />
  <input
    bind:value={password}
    name="password"
    type="password"
    aria-label="password"
    placeholder="Password"
    class="rounded-full"
  />
  <slot />
  <button class="rounded-full btn" type="submit">{btnText}</button>
</form>

<style>
  .form {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  input,
  button {
    width: 20rem;
    height: 2.5rem;
    padding: 0.1rem;
    font-size: 1.5rem;
    border: 0px;
  }

  input {
    background-color: white;
    color: black;
    border: 1px solid #707070;
    padding-left: 0.9375rem;
    padding-right: 0.9375rem;
  }

  input:first-of-type {
    margin-bottom: 1.25rem;
  }

  .btn {
    background-color: #d98c28;
    color: #eee;
    width: 21.875rem;
    margin-top: 2.25rem;
  }
</style>
