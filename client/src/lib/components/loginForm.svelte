<script lang="ts">
    import { goto } from "$app/navigation";

    let username = "", password = "";

    export let btnText: string;
    export let handleLogin: (username: string, password: string) => null;
</script>

<form class="form" on:submit|preventDefault={handleLogin(username, password)}>
    <input
        bind:value={username}
        name="username"
        type="username"
        aria-label="username"
        placeholder="username"
    />
    <input
        bind:value={password}
        name="password"
        type="password"
        aria-label="password"
        placeholder="password"
    />
    <button class="btn" type="submit">{btnText}</button>
</form>

<style>

</style>