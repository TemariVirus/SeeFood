<script lang="ts">
  import { authStore } from "$lib/stores/auth";
  import { goto } from "$app/navigation";
  import { clientHandleApiError } from "$lib/responseHandlers";
  import guestPfp from "$lib/images/guest-pfp.svg";

  let name = $authStore.user!.name!;

  function changeName(name: string) {
    console.log($authStore.token);
    fetch("/users", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${$authStore.token}`,
      },
      body: JSON.stringify({ name }),
    }).then((response) => {
      if (response.ok) {
        $authStore.user!.name = name;
        alert("Name changed successfully.");
      } else {
        clientHandleApiError(response);
      }
    });

    return null;
  }

  function logOut() {
    $authStore.user = null;
    $authStore.token = null;
    goto("/login");
  }

  function deleteAccount() {
    fetch("/users", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${$authStore.token}`,
      },
    }).then((response) => {
      if (response.ok) {
        logOut();
      } else {
        clientHandleApiError(response);
      }
    });
  }
</script>

<section>
  <div class="left">
    <img src={guestPfp} alt="Your profile" class="pfp" />
    <form on:submit={changeName(name)}>
      <input
        type="text"
        class="name-text"
        placeholder="Your name here"
        bind:value={name}
      />
      <div class="form-btns">
        <button type="submit" id="save-button">Save</button>
      </div>
    </form>
  </div>

  <div class="sperator" />

  <div class="right form-btns">
    <button id="log-out" on:click={logOut}>Log Out</button>
    <button id="delete-acc" on:click={deleteAccount}>Delete Account</button>
    <p>*Your reviews and replies will also be deleted</p>
  </div>
</section>

<style>
  section {
    display: flex;
    flex-direction: row;
    height: calc(100vh - var(--header-height));
  }

  .left {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 14.625rem;
  }

  .sperator {
    width: 1px;
    background-color: #a0a0a0;
    margin: 0.75rem 0;
  }

  .right {
    display: flex;
    flex-direction: column;
    margin: 2.875rem 2.4375rem;
  }

  .pfp {
    width: 10.625rem;
    height: 10.625rem;
    border-radius: 50%;
    object-fit: cover;
    margin: 2rem 2rem 0 2rem;
  }

  .name-text {
    padding: 0.5rem;
    margin-top: 1rem;
    border: 0;
    border-radius: 0.25rem;
    text-align: center;
    font-size: 1.25rem;
  }

  .name-text {
    width: 9.625rem;
    background-color: #333;
  }

  #save-button {
    width: 10.625rem;
    margin: 0.75rem;
  }

  .right button {
    width: fit-content;
    margin: 0;
  }

  .right button:first-of-type {
    margin-bottom: 1.5rem;
  }

  #log-out {
    background-color: #727272;
  }

  #log-out:hover {
    background-color: #5a5a5a;
  }
  #log-out:active {
    background-color: #4a4a4a;
  }

  #delete-acc {
    background-color: #ee3030;
  }

  #delete-acc:hover {
    background-color: #d32f2f;
  }
  #delete-acc:active {
    background-color: #b32b2b;
  }

  p {
    font-size: 0.75rem;
  }
</style>
