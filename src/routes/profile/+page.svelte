<script lang="ts">
  import { logout as deleteToken } from "$lib/client/auth";
  import { authStore } from "$lib/stores/auth";
  import { goto } from "$app/navigation";
  import { handleApiError } from "$lib/client/responseHandlers";
  import { setAuthCookie } from "$lib/client/auth";
  import Modal from "$lib/components/modal.svelte";
  import guestPfp from "$lib/images/guest-pfp.svg";

  let name = $authStore.user!.name!;
  let oldPassword = "";
  let password = "";
  let showChangePassModal = false;

  function changeName() {
    fetch("/users", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${$authStore.token}`,
      },
      body: JSON.stringify({ name }),
    }).then(async (response) => {
      if (response.ok) {
        $authStore.user!.name = name;
        alert("Name changed successfully.");
      } else {
        await handleApiError(response);
      }
    });

    return null;
  }

  function changePass() {
    if (!oldPassword || !password) {
      alert("Please fill in all fields.");
      return;
    }

    fetch("/users", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${$authStore.token}`,
      },
      body: JSON.stringify({ oldPassword, password }),
    }).then(async (response) => {
      if (response.ok) {
        alert("Password changed successfully.");
        showChangePassModal = false;
        const token = await response.json();
        $authStore.token = token;
        setAuthCookie(token);
      } else {
        await handleApiError(response);
      }
    });

    return null;
  }

  function logOut() {
    deleteToken();
    goto("/login");
  }

  function deleteAccount() {
    fetch("/users", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${$authStore.token}`,
      },
    }).then(async (response) => {
      if (response.ok) {
        logOut();
      } else {
        await handleApiError(response);
      }
    });
  }
</script>

<section>
  <div class="left">
    <img src={guestPfp} alt="Your profile" class="pfp" />
    <form on:submit={changeName}>
      <input
        type="text"
        class="form-textbox"
        placeholder="Your name here"
        bind:value={name}
      />
      <div class="form-btns">
        <button type="submit" id="save-btn">Save</button>
      </div>
    </form>
  </div>

  <div class="sperator" />

  <div class="right form-btns">
    <button id="log-out" on:click={logOut}>Log Out</button>
    <button
      id="change-pass"
      on:click={() => {
        showChangePassModal = true;
        return null;
      }}>Change Password</button
    >
    <button id="delete-acc" on:click={deleteAccount}>Delete Account</button>
    <p>*Your reviews and replies will also be deleted</p>
  </div>

  <Modal
    color="#444"
    bind:show={showChangePassModal}
    on:close={() => {
      oldPassword = "";
      password = "";
    }}
  >
    <h2>Change Password</h2>
    <form on:submit={changePass}>
      <input
        class="form-textbox"
        type="password"
        placeholder="Old Password"
        bind:value={oldPassword}
      />
      <input
        class="form-textbox"
        type="password"
        placeholder="New Password"
        bind:value={password}
      />
      <div class="form-btns">
        <button id="change-pass-btn" type="submit">Change Password</button>
      </div>
    </form>
  </Modal>
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

  form {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .form-textbox {
    padding: 0.5rem;
    margin-top: 1rem;
    border: 0;
    border-radius: 0.25rem;
    text-align: center;
    font-size: 1.25rem;
    width: 9.625rem;
    background-color: #333;
  }

  #save-btn,
  #change-pass-btn {
    width: 10.625rem;
    margin: 0.75rem;
  }

  .right button {
    width: fit-content;
    margin: 0;
  }

  .right button:not(:last-of-type) {
    margin-bottom: 1.5rem;
  }

  #log-out,
  #change-pass {
    background-color: #727272;
  }

  #log-out:hover,
  #change-pass:hover {
    background-color: #5a5a5a;
  }
  #log-out:active,
  #change-pass:active {
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

  h2 {
    text-align: center;
  }
</style>
