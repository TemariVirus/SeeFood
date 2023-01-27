<script lang="ts">
  import guestPfp from "../assets/guest-pfp.svg";
  export let username = "Guest";
  export let pfp = guestPfp;
</script>

<header>
  <nav>
    <div id="title-btn" class="header-btn">
      <linke to="/" />
      SeeFood
    </div>
    <div id="header-btns">
      <a href="/about">
        <button class="header-btn">About</button>
      </a>
      <a href="/categories">
        <button class="header-btn">Categories</button>
      </a>
      <a href="/user">
        <button class="header-btn user-profile-btn">
          <div id="username">{username}</div>
          <img src={pfp} alt="Profile" />
        </button>
      </a>
    </div>
  </nav>
</header>

<style>
  :root {
    --header-height: 3rem;
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
    text-align: center;
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
    width: 1.875rem;
    height: 1.875rem;
    margin: auto;
    object-fit: contain;
    object-position: center;
  }
</style>
