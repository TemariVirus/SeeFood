<script lang="ts">
  export let primaryText: string;
  export let secondaryText: string = "";
  export let imageURL: string;
  export let altText: string = "Item";
  export let link: string = "#";
</script>

<a href={link} class="item-card">
  <img src={imageURL} alt={altText} class="card-image" />
  <div class="secondary-text">{secondaryText}</div>
  <div class="primary-text">{primaryText}</div>
</a>

<style>
  .item-card {
    --max-width: 17.25rem;
    --padding: 0.75rem;
    display: flex;
    flex-direction: column;
    margin: 0.5625rem;
    padding: var(--padding);
    background-color: #333;
    max-width: var(--max-width);
    align-items: center;
  }

  .item-card div {
    color: var(--text-color);
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .card-image {
    width: 15.75rem;
    height: 10.5rem;
    object-fit: contain;
    object-position: center;
    margin-bottom: 0.375rem;
  }

  .primary-text {
    font-size: 1.875rem;
    max-width: calc(var(--max-width) - 2 * var(--padding));
    line-height: 1.875rem;
  }

  .secondary-text {
    font-size: 1rem;
    max-width: calc(var(--max-width) - 2 * var(--padding));
    line-height: 1rem;
  }
</style>
