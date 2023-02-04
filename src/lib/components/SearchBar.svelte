<script lang="ts">
  let searchTerm = "";

  export let placeholder = "Search";
  export let search: (searchTerm: string) => null | undefined;
</script>

<form>
  <input type="text" {placeholder} bind:value={searchTerm} />
  <button
    type="submit"
    class="gone"
    on:click|preventDefault={search(searchTerm)}
  />
</form>

<style>
  form {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin: 3.75rem;
    margin-top: 3rem;
    margin-bottom: 3rem;
  }

  input[type="text"] {
    width: 100%;
    font-size: 1.5rem;
    padding: 0.5rem;
    color: black;
    background-color: #fff;
    border: 0px;
  }
</style>
