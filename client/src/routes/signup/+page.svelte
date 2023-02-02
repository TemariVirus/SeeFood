<script lang="ts">
    import { goto } from "$app/navigation";
    import LoginForm from "$lib/components/loginForm.svelte";

    function signUp(username: string, password: string) {
        console.log("username: ", username);
        console.log("password: ", password);

        // TODO: send username and password to server

        goto("/");
        return null;
    }
</script>

<section>
    <LoginForm btnText="Sign Up" handleLogin={signUp}/>
</section>