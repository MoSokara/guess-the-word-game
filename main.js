import { getRandomWord } from "./words.js";

// Settings DOM elements
const difficultySelect = document.getElementById("difficulty-select");
const wordLengthSelect = document.getElementById("word-length-select");
const triesSelect = document.getElementById("tries-select");
const playBtn = document.getElementById("play-btn");
const instructionsPopup = document.getElementById("instructions-popup");
const settingsPopup = document.getElementById("settings-popup");
const restartBtn = document.getElementById("restart-btn");
const submitBtn = document.getElementById("submit-btn");
const hintBtn = document.getElementById("hint-btn");
const winMgsEle = document.getElementById("win-popup");
const loseMgsEle = document.getElementById("lose-popup");
const selectedWordEle = document.querySelectorAll(".selected-word");

// Game state variables
let difficulty = "";
let wordLength = 0;
let hintsNum = 0;
let hintsUsed = 0;
let triesNum = 0;

let correctWord = true;
let currentTry = 1;
let selectedWord = "";

playBtn.addEventListener("click", restartGame);

// Start the game with default settings on page load
document.addEventListener("DOMContentLoaded", () => {
  restartBtn.addEventListener("click", restartGame);

  startGame();
});

function restartGame() {
  // Reset game state variables
  selectedWord = "";
  currentTry = 1;
  correctWord = true;

  submitBtn.removeAttribute("disabled");
  submitBtn.classList.remove("disabled");

  hintBtn.removeAttribute("disabled");
  hintBtn.classList.remove("disabled");

  startGame();
}

function startGame() {
  // Game DOM elements
  const hintsSpanEle = document.querySelectorAll(".hints-num");
  const triesSpanEle = document.getElementById("tries-count");

  // Get the selected game settings
  difficulty = difficultySelect.value;
  wordLength = parseInt(wordLengthSelect.value);
  triesNum = parseInt(triesSelect.value);
  if (difficulty === "easy") {
    if (triesNum === 3) {
      if (wordLength === 4) hintsNum = 1;
      else if (wordLength === 5) hintsNum = 2;
      else if (wordLength === 6) hintsNum = 3;
    } else if (triesNum === 5) {
      if (wordLength === 4) hintsNum = 1;
      else if (wordLength === 5) hintsNum = 1;
      else if (wordLength === 6) hintsNum = 2;
    } else if (triesNum === 6) {
      if (wordLength === 4) hintsNum = 3;
      else if (wordLength === 5) hintsNum = 4;
      else if (wordLength === 6) hintsNum = 5;
    }
  } else if (difficulty === "medium") {
    hintsNum = 1;
  } else {
    hintsNum = 0;
    hintBtn.setAttribute("disabled", true);
    hintBtn.classList.add("disabled");
  }
  triesSpanEle.textContent = triesNum;
  for (let i = 0; i < hintsSpanEle.length; i++) {
    hintsSpanEle[i].textContent = hintsNum;
  }

  // Generate a random word
  selectedWord = getRandomWord(difficulty, wordLength);
  console.log("Selected word:", selectedWord); // For debugging purposes

  // Reset game state variables
  currentTry = 1;
  correctWord = true;

  createGame();

  // Show the game
  settingsPopup.style.display = "none";
}

function createGame() {
  // Inputs Container DOM element
  const inputsContainer = document.getElementById("inputs");

  // Create the game inputs
  inputsContainer.innerHTML = "";

  // Create inputs row div elements
  for (let i = 1; i <= triesNum; i++) {
    const inputRow = document.createElement("div");
    inputRow.classList.add("inputs-row");
    inputRow.setAttribute("id", `try-${i}`);
    const span = document.createElement("span");
    span.textContent = `Try ${i}`;
    if (i !== 1) {
      inputRow.classList.add("disabled-inputs");
    }
    inputRow.appendChild(span);

    // Create inputs keys elements
    for (let j = 1; j <= wordLength; j++) {
      const input = document.createElement("input");
      input.classList.add("input");
      input.setAttribute("id", `try-${i}-letter-${j}`);
      input.setAttribute("type", "text");
      if (i !== 1) {
        input.setAttribute("disabled", "true");
        input.classList.add("disabled");
      }
      input.setAttribute("autocomplete", "off");
      input.setAttribute("maxlength", "1");
      input.setAttribute("data-index", j);
      input.setAttribute("data-try", i);
      inputRow.appendChild(input);
    }
    inputsContainer.appendChild(inputRow);
  }
  document.getElementById("try-1-letter-1").focus();

  addEventToInputs();
}

// Handling every input
function addEventToInputs() {
  const inputsElements = document.querySelectorAll(".input");

  inputsElements.forEach((input, index) => {
    input.addEventListener("input", () => {
      if (input.value.length === 1) {
        const nextInput = inputsElements[index + 1];
        if (nextInput) nextInput.focus();
      }
    });

    input.addEventListener("keydown", (event) => {
      // console.log(event);
      const currentIndex = Array.from(inputsElements).indexOf(event.target);
      if (event.key === "ArrowRight") {
        const nextIndex = currentIndex + 1;
        if (nextIndex < inputsElements.length)
          inputsElements[nextIndex].focus();
      } else if (event.key === "ArrowLeft") {
        const prevIndex = currentIndex - 1;
        if (prevIndex >= 0) inputsElements[prevIndex].focus();
      } else if (event.key === "Backspace") {
        inputsElements[currentIndex].value = "";
        const prevIndex = currentIndex - 1;
        if (prevIndex >= 0) {
          inputsElements[prevIndex].value = "";
          inputsElements[prevIndex].focus();
        }
      }
    });
  });
}

submitBtn.addEventListener("click", handleInput);
document.addEventListener("keydown", (event) =>
  event.key === "Enter" ? handleInput() : null,
);

function handleInput() {
  for (let i = 1; i <= wordLength; i++) {
    const input = document.getElementById(`try-${currentTry}-letter-${i}`);
    const inputLetter = input.value.toLowerCase();
    const currentLetter = selectedWord[i - 1];

    // Game Logic
    if (inputLetter === currentLetter) {
      input.classList.add("correct-letter-in-correct-position");
    } else if (
      selectedWord.toLowerCase().includes(inputLetter) &&
      inputLetter !== ""
    ) {
      input.classList.add("correct-letter-in-wrong-position");
      correctWord = false;
    } else {
      input.classList.add("not-in-word");
      correctWord = false;
    }

    input.setAttribute("disabled", "true");
    input.classList.add("disabled");
  }

  // Check Win or Lose
  if (correctWord) {
    // console.log(`You win! The word was ${selectedWord}`);
    winMgsEle.style.display = "flex";
    for (let i = 0; i < selectedWordEle.length; i++) {
      selectedWordEle[i].innerHTML =
        `The selected word: <span class="selected-word-span">${selectedWord}</span>`;
    }

    const hintsUsedSpan = document.querySelector(".hints-used-span");
    if (hintsUsed > 0) {
      hintsUsedSpan.innerHTML = `You used <span id="hints-used">${hintsUsed}</span> Hints`;
    } else {
      hintsUsedSpan.textContent = "Good job! You didn't use any hints.";
    }

    submitBtn.removeAttribute("disabled");
    submitBtn.classList.add("disabled");

    hintBtn.removeAttribute("disabled");
    hintBtn.classList.add("disabled");
  } else {
    document
      .getElementById(`try-${currentTry}`)
      .classList.add("disabled-inputs");

    Array.from(document.querySelectorAll(`#try-${currentTry} .input`)).forEach(
      (input) => {
        input.setAttribute("disabled", "true");
        input.classList.add("disabled");
      },
    );

    currentTry++;
    correctWord = true;

    if (currentTry <= triesNum) {
      document
        .getElementById(`try-${currentTry}`)
        .classList.remove("disabled-inputs");

      Array.from(
        document.querySelectorAll(`#try-${currentTry} .input`),
      ).forEach((input) => {
        input.removeAttribute("disabled");
        input.classList.remove("disabled");
      });
      if (document.getElementById(`try-${currentTry}-letter-1`)) {
        document.getElementById(`try-${currentTry}-letter-1`).focus();
      }
    } else {
      for (let i = 0; i < selectedWordEle.length; i++) {
        selectedWordEle[i].innerHTML =
          `The selected word: <span class="selected-word-span">${selectedWord}</span>`;
      }

      submitBtn.setAttribute("disabled", "true");
      submitBtn.classList.add("disabled");

      hintBtn.setAttribute("disabled", "true");
      hintBtn.classList.add("disabled");

      // console.log(`You lose! The word was ${selectedWord}`);
      loseMgsEle.style.display = "flex";
    }
  }
}

hintBtn.addEventListener("click", () => {
  if (hintsNum > 0) {
    const hintNumElements = document.getElementById("hints-ele");
    hintsNum--;
    hintNumElements.textContent = hintsNum;
    hintsUsed++;

    const randomIndex = Math.floor(Math.random() * wordLength);

    const enabledInputs = document.querySelectorAll(".input:not([disabled])");
    // console.log(enabledInputs);
    const emptyEnabledInputs = Array.from(enabledInputs).filter(
      (input) => input.value === "",
    );
    // console.log(emptyEnabledInputs);
    if (emptyEnabledInputs.length > 0) {
      const randomIndex = Math.floor(Math.random() * emptyEnabledInputs.length);
      const randomInput = emptyEnabledInputs[randomIndex];
      const indexToFill = Array.from(enabledInputs).indexOf(randomInput);
      // console.log(indexToFill, randomInput, randomIndex);
      if (indexToFill !== -1) {
        randomInput.value = selectedWord[indexToFill].toUpperCase();
      }
    }
  }
  if (hintsNum === 0) {
    hintBtn.setAttribute("disabled", "true");
    hintBtn.classList.add("disabled");
  }
});

// Popup
if (instructionsPopup) {
  const instructionsBtn = document.getElementById("instructions-btn");
  instructionsBtn.addEventListener("click", () => {
    instructionsPopup.style.display = "flex";
  });
} else {
  console.error("Instructions popup element not found");
}

if (settingsPopup) {
  const settingsBtn = document.getElementById("settings-btn");
  settingsBtn.addEventListener("click", () => {
    settingsPopup.style.display = "flex";
  });
} else {
  console.error("Settings popup element not found");
}

document.querySelectorAll(".popup-close").forEach((closeBtn) => {
  closeBtn.onclick = () => {
    settingsPopup.style.display = "none";
    instructionsPopup.style.display = "none";
    winMgsEle.style.display = "none";
    loseMgsEle.style.display = "none";
  };
});

document.querySelectorAll(".popup-overlay").forEach((overlay) => {
  overlay.onclick = (e) => {
    if (e.target === overlay) {
      settingsPopup.style.display = "none";
      instructionsPopup.style.display = "none";
      winMgsEle.style.display = "none";
      loseMgsEle.style.display = "none";
    }
  };
});
