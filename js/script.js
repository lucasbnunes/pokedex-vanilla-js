let newPage = 'https://pokeapi.co/api/v2/pokemon?limit=20';
let isLoading = true;

getFirstPage();

document.addEventListener('scroll', toggleBackToTop);
document.addEventListener('scroll', debounce(getNewPage, 500));

function debounce(func, wait) {
  let timer = null;
  return function () {
    clearTimeout(timer);
    timer = setTimeout(func, wait);
  };
}

async function getFirstPage() {
  showLoader();

  const res = await fetch(newPage);
  const resJson = await res.json();
  const { next, results } = resJson;

  newPage = next;

  if (results) {
    const newPokemons = await getPokemon(results);
    hideLoader();
    renderPokemons(newPokemons);
  } else {
    hideLoader();
  }

  isLoading = false;
}

async function getNewPage() {
  if (isLoading) {
    return;
  }

  if (
    window.innerHeight + window.pageYOffset >=
    document.body.offsetHeight - window.innerHeight / 5
  ) {
    isLoading = true;
    showLoader();
    const res = await fetch(newPage);
    const resJson = await res.json();
    const { next, results } = resJson;

    newPage = next;

    if (results) {
      const newPokemons = await getPokemon(results);
      hideLoader();
      renderPokemons(newPokemons);
    } else {
      hideLoader();
    }

    isLoading = false;
  }
}

async function getPokemon(results) {
  let currentPagePokemons = [];

  for (const { url } of results) {
    const res = await fetch(url);
    const resJson = await res.json();
    const { id, name, types, sprites } = resJson;

    const pokemon = {
      id: id,
      name: name,
      types: types.map((typesArr) => typesArr.type.name),
      description: await getPokemonDescription(id),
      sprite: sprites.front_default,
    };
    currentPagePokemons.push(pokemon);
  }

  return currentPagePokemons;
}

async function getPokemonDescription(pokemonId) {
  const resDesc = await fetch(
    `https://pokeapi.co/api/v2/pokemon-species/${pokemonId}`
  );
  const descJson = await resDesc.json();
  let description = descJson.flavor_text_entries.find(
    (desc) => desc.language.name === 'en'
  );

  description = description.flavor_text.replace(/\f/g, ' ');

  return description;
}

function showLoader() {
  const loaderContainer = document.querySelector('.loader-container');

  loaderContainer.classList.remove('hidden');
}

function hideLoader() {
  const loaderContainer = document.querySelector('.loader-container');

  loaderContainer.classList.add('hidden');
}

function renderPokemons(newPokemons) {
  const pokedex = document.querySelector('.pokedex');

  const pokemonCards = newPokemons.map(
    ({ id, name, types, description, sprite }) => {
      return `<div class='card' data-poke-id=${id}>
      <div class='poke-sprite ${types[0].toLowerCase()}'>
      <img src=${sprite} alt='${name} sprite'/>
      </div>
      <span>#${id}</span>
      <h2 class='poke-name'>${capitalizeFirstLetter(name)}</h2>
      <ul class='types-list'>
      ${types
        .map(
          (type) =>
            `<li class='${type.toLowerCase()}'>${capitalizeFirstLetter(
              type
            )}</li>`
        )
        .join('')}
        </ul>
        <p>${description}</p>
        </div>`;
    }
  );

  pokedex.innerHTML += pokemonCards.join('');
}

function toggleBackToTop() {
  const backToTop = document.querySelector('#back-to-top');
  if (window.scrollY > window.innerHeight * 0.4) {
    backToTop.classList.remove('hidden');
  } else {
    backToTop.classList.add('hidden');
  }
}

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}
