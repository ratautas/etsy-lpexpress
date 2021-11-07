<script>
  import { tick } from 'svelte'
  import { COUNTRIES_STORAGE_KEY } from '../constants'
  let countries = []
  let enInputs = []

  chrome.storage.sync.get(COUNTRIES_STORAGE_KEY, (result) => {
    countries = result?.[COUNTRIES_STORAGE_KEY]
  })

  const handleSubmit = async () => {
    countries = [...countries, { en: '', lt: '' }]
    await tick
    enInputs[countries.length - 1]?.focus()
  }

  const handleDeleteClick = (i) => {
    countries = countries.filter((_, index) => i !== index)
  }

  $: countries, chrome.storage.sync.set({ [COUNTRIES_STORAGE_KEY]: countries })
</script>

<main>
  <form on:submit|preventDefault={handleSubmit}>
    <h6 class="text-blueGray-400 text-sm mx-3 px-1 font-bold uppercase">
      Valstybių vertimai
    </h6>
    {#each countries as country, i}
      <div class="flex flex-wrap">
        <div class="w-5/12 px-1">
          <div class="w-full mb-1">
            <input
              type="text"
              class="border-0 px-3 py-1 placeholder-blueGray-300
              text-blueGray-600 bg-white rounded text-sm shadow w-full"
              placeholder="angliškai"
              bind:this={enInputs[i]}
              bind:value={country.en} />
          </div>
        </div>
        <div class="w-5/12 px-1">
          <div class="w-full mb-1">
            <input
              type="text"
              class="border-0 px-3 py-1 placeholder-blueGray-300
              text-blueGray-600 bg-white rounded text-sm shadow w-full"
              placeholder="lietuviškai"
              bind:value={country.lt} />
          </div>
        </div>
        <div
          class="w-2/12 py-1 px-3 cursor-pointer"
          on:click={() => handleDeleteClick(i)}>
          ❌
        </div>
      </div>
    {/each}
    <div class="w-10/12 px-1">
      <button
        type="submit"
        class="bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded w-full">
        Pridėti vertimą
      </button>
    </div>
  </form>
</main>
