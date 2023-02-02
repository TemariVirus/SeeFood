<script lang="ts">
    import { store } from "$lib/authStore";
    import guestPfp from "$lib/images/guest-pfp.svg";

    
</script>

<section>
    <div class="left">
        <img src={guestPfp} alt="Your profile" height=340 width=340 />
        <div id="username">{$store.user?.name ?? "Guest"}</div>
    </div>

    <div class="right">

    </div>
</section>

<style>
    .left {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        width: 50%;
        height: 100vh;
        background-color: #406477;
    }

    .right {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        width: 50%;
        height: 100vh;
        background-color: #406477;
    }
</style>