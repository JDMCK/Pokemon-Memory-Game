const fetchPokemon = async (url) => {
  const response = await fetch(url);
  return pokemon = await response.json();
}

const pokemonPromise = fetchPokemon('https://pokeapi.co/api/v2/pokemon?limit=151');

function shuffle(array) {
  let currentIndex = array.length;
  let randomIndex;

  // While there remain elements to shuffle.
  while (currentIndex != 0) {

    // Pick a remaining element.
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }

  return array;
}

const generateCards = async () => {
  const pokemonResponse = await pokemonPromise;
  let cols = 6;
  let pokeball = 'masterball.png';
  let sizeClass = 'small-sprite';
  switch (difficulty) {
    case '0':
      cardsNum = 6;
      cols = 3;
      pokeball = 'pokeball.png';
      sizeClass = 'large-sprite';
      break;
    case '1':
      cardsNum = 12;
      cols = 4;
      pokeball = 'greatball.png';
      sizeClass = 'medium-sprite';
      break;
    case '2':
      pokeball = 'ultraball.png';
  }
  let pokemon = shuffle(pokemonResponse.results).slice(0, cardsNum / 2);
  pokemon = pokemon.concat(pokemon);
  pokemon = shuffle(pokemon);

  const cardsContainer = document.querySelector('#cards-container');
  cardsContainer.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;

  outOf.innerHTML = `0/${cardsNum / 2}`;
  document.querySelector('#remaining').innerHTML = cardsNum / 2 + ' remaining!'

  let cards = '';
  for (const p of pokemon) {
    const pokemonInfo = await fetchPokemon(p.url);
    const pokemonSprite = pokemonInfo.sprites.other['official-artwork'].front_default;
    cards += `
    <div data-pokemon="${p.name}" class="pokemon-card nes-pointer ${sizeClass}" onclick="flip(event)">
      <img class="pokemon-sprite back-face" src=${pokemonSprite} />
      <img class="pokeball-sprite front-face" src=${pokeball} />
    </div>`;
  }
  cardsContainer.innerHTML = cards;
}

const countdown = () => {

  const resetbutton = document.querySelector('#reset');
  resetbutton.disabled = true;
  resetbutton.classList.replace('is-error', 'is-disabled');

  document.querySelector('header').style.display = 'none';
  const progressBars = document.querySelector('#progress-bars');
  progressBars.style.display = 'block';

  timerText.innerHTML = duration + 's';

  const cardContainer = document.querySelector('#cards-container');
  cardContainer.style.display = 'none';

  const countdownDisplay = document.querySelector('#countdown');
  countdownDisplay.innerHTML = countdownSeconds--;
  const countdownInterval = setInterval(() => {
    if (countdownSeconds === 0) {
      countdownDisplay.innerHTML = 'Go!';
      countdownSeconds--;
    }
    else {
      countdownDisplay.innerHTML = countdownSeconds--;
    }
    if (countdownSeconds === -2) {
      countdownDisplay.style.display = 'none';
      clearInterval(countdownInterval);
      cardContainer.style.display = 'grid';
      switch (difficulty) {
        case '0': showAllCards(0.75); break;
        case '1': showAllCards(2.5); break;
        case '2': showAllCards(4); break;
        case '3': showAllCards(3); break;
      }
    }
  }, 750);
}

const showAllCards = (durationSeconds) => {
  const resetbutton = document.querySelector('#reset');
  const pokemonCards = document.querySelectorAll('.pokemon-card');
  pokemonCards.forEach(pokemonCard => pokemonCard.classList.toggle('flipped'));
  setTimeout(() => {
    pokemonCards.forEach(pokemonCard => pokemonCard.classList.toggle('flipped'));
    resetbutton.disabled = false;
    resetbutton.classList.replace('is-disabled', 'is-error');
    beginTimer();
  }, durationSeconds * 1000);
}

const beginTimer = () => {

  const lossModal = document.querySelector('#loss-modal');
  const winModal = document.querySelector('#win-modal');

  const timerInterval = setInterval(() => {
    timer.value -= (24 / 60) / duration;
    timerText.innerHTML = `${Math.ceil(duration * timer.value / 100)}s`;

    if (score >= 100) {
      clearInterval(timerInterval);
      document.querySelector('#win-final-score').innerHTML = score > 100 ? 100 : score;
      winModal.showModal();
    }

    if (timer.value <= 0) {
      clearInterval(timerInterval);
      document.querySelector('#loss-final-score').innerHTML = score > 100 ? 100 : score;
      lossModal.showModal();
    }
  }, 24 / 60);
}

const flip = (event) => {
  const card = event.target.parentElement;
  const classes = card.classList;
  if (classes.contains('flipped')) return;
  pendingFlipped++;
  if (pendingFlipped > 2) return;
  card.classList.toggle('flipped');
  flippedCards.push(card);

  const clicksDisplay = document.querySelector('#clicks-display');
  clicks++;
  clicksDisplay.innerHTML = 'Clicks: ' + clicks;

  if (pendingFlipped === 2) {
    if (flippedCards[0].dataset.pokemon === flippedCards[1].dataset.pokemon) {
      pendingFlipped = 0;
      flippedCards = [];
      progress();
    } else {
      setTimeout(() => {
        flippedCards.forEach(card => card.classList.toggle('flipped'));
        flippedCards = [];
        pendingFlipped = 0;
      }, 750);
    }
  }

}

const progress = () => {
  const scoreBar = document.querySelector('#score');
  pairsMade++;
  outOf.innerHTML = `${pairsMade}/${cardsNum / 2}`;
  document.querySelector('#remaining').innerHTML = (cardsNum / 2 - pairsMade) + ' remaining!';
  score += Math.ceil(100 / (cardsNum / 2))
  scoreBar.value = score;
  powerUp();
}

const powerUp = () => {
  const random = Math.random();
  if (random <= 0.15) {
    const bonusTime = document.querySelector('#bonus-time');
    bonusTime.style.display = 'block';
    setTimeout(() => {
      bonusTime.style.display = 'none';
    }, 2000);
    timer.value += (5 / duration) * 100;
  }
}

// Game properties
let score = 0;
let countdownSeconds = 3;
let isWin = false;
let difficulty = '0';
let pendingFlipped = 0;
let flippedCards = [];
let cardsNum = 24;
let pairsMade = 0;
let clicks = 0;
let duration = 0;
const timer = document.querySelector('#timer');
const outOf = document.querySelector('#out-of');
const timerText = document.querySelector('#timer-text');

const startGameLoop = () => {
  // Setup
  const startButton = document.querySelector('#start');
  startButton.disabled = true;
  startButton.classList.replace('is-success', 'is-disabled');
  const difficultySelect = document.querySelector('#difficulty-select');
  difficultySelect.disabled = true;
  difficultySelect.classList.toggle('is-disabled');

  difficulty = document.querySelector('#difficulty-select').value;

  switch (difficulty) {
    case '0': duration = 10; break;
    case '1': duration = 20; break;
    case '2': duration = 50; break;
    case '3': duration = 35; break;
  }

  generateCards();

  // Begin gameplay interval chain
  countdown();
}

const reset = () => {
  location.reload();
}

const playAgain = () => {
  score = 0;
  countdownSeconds = 3;
  isWin = false;
  pendingFlipped = 0;
  flippedCards = [];
  timer.value = 100;
  pairsMade = 0;
  duration = 0;

  document.querySelector('#score').value = 0;
  document.querySelector('#countdown').style.display = 'block';

  startGameLoop();
}

const darkTheme = (event) => {
  const elements = document.querySelectorAll('.is-dark-theme');
  elements.forEach(element => element.classList.toggle('is-dark'));
  if (event.target.checked) {
    document.body.style.backgroundColor = 'rgb(33,37,41)';
    document.body.style.color = 'white';
  } else {
    document.body.style.backgroundColor = 'white';
    document.body.style.color = '';

  }
}