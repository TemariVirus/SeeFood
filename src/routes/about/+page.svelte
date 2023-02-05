<script lang="ts">
  import fish from "$lib/images/fish.webp";
</script>

<svelte:head>
  <title>About</title>
  <meta name="About page" content="About this website" />
</svelte:head>

<section>
  <img id="main-banner" src={fish} alt="Fish in a market" />
  <div class="header-text">About</div>
  <p class="content">
    Created for a school project, this website is able to display a list of all
    the restaurants in the database, as well as the details of each restaurant.
    It can also dynamically pull restaurants from the database based on the
    user's search query.
    <br /> <br />
    Furthermore, the database stores all the users and their comments, and with along
    with a secure authentication system, users can create an account and create,
    edit, and delete their own comments.
    <br /> <br />
    You will need an account to create a comment, but you can still view all the
    comments without an account. You may create an account
    <a href="/signup">here</a>.
  </p>
  <div style="padding-bottom: 2.5rem;"/>
</section>

<style>
  .content {
    text-align: center;
    margin: 0 11rem;
  }
</style>
