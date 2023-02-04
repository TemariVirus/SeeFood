<script lang="ts">
  import { authStore } from "$lib/stores/auth";
  import guestPfp from "$lib/images/guest-pfp.svg";
</script>

<header>
  <nav>
    <a href="/">
      <button id="title-btn" class="header-btn" tabindex="-1">SeeFood</button>
    </a>
    <div id="header-btns">
      <a href="/about">
        <button class="header-btn" tabindex="-1">About</button>
      </a>
      <a href="/categories">
        <button class="header-btn" tabindex="-1">Categories</button>
      </a>
      <a href="/profile">
        <button class="header-btn user-profile-btn" tabindex="-1">
          <div id="username">{$authStore.user?.name ?? "Guest"}</div>
          <img src={guestPfp} alt="Your profile" />
        </button>
      </a>
    </div>
  </nav>
</header>

<style>
  :root {
    --header-height: 2.5rem;
    --header-background-color: #406477;
  }

  header {
    position: fixed;
    background-color: var(--header-background-color);
    top: 0;
    left: 0;
    height: var(--header-height);
    width: 100%;
    z-index: 99;
  }

  nav {
    display: flex;
    height: var(--header-height);
    justify-content: space-between;
  }

  a {
    display: flex;
  }

  #header-btns {
    display: flex;
    margin-left: auto;
  }

  .header-btn {
    font-size: 1.2rem;
    border-radius: 0px;
    border: transparent;
    padding-left: 0.75rem;
    padding-right: 0.75rem;
    background-color: transparent;
  }

  #title-btn {
    padding-left: 1.5rem;
    padding-right: 1.5rem;
    font-family: Georgia, "Times New Roman", Times, serif;
    font-size: 1.875rem;
    margin-right: auto;
  }

  #username {
    font-size: 1.2rem;
    padding-right: 0.75rem;
    margin: auto;
  }

  .user-profile-btn {
    display: flex;
  }

  .user-profile-btn img {
    border-radius: 50%;
    padding-left: 0.75rem;
    widows: auto;
    height: calc(var(--header-height) - 0.6rem);
    margin: auto;
  }
</style>
