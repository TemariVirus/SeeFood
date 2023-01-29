<script>
  export let searchTerm = "";
  export let search = () => {};
</script>

<form>
  <input type="text" bind:value={searchTerm} />
  <button type="submit" on:click|preventDefault={search}>Search</button>
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
  
  input {
    width: 100%;
    font-size: 1.5rem;
    padding: 0.5rem;
    color: #000;
    background-color: #fff;
  }

  button {
    font-size: 1.5rem;
    padding: 0.5rem;
  }
</style>
