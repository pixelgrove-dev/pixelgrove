const words = [
    "raccoon",
    "forest",
    "owl",
    "llama",
    "sloth",
    "garden",
    "river",
    "mountain"
];

const MAX_WRONG_GUESSES = 6;

const wordDisplay =
    document.getElementById("word-display");

const wrongCount =
    document.getElementById("wrong-count");

const keyboard =
    document.getElementById("keyboard");

const gameMessage =
    document.getElementById("game-message");

const restartButton =
    document.getElementById("restart-game");

const bodyParts = [
    document.getElementById("head"),
    document.getElementById("body"),
    document.getElementById("left-arm"),
    document.getElementById("right-arm"),
    document.getElementById("left-leg"),
    document.getElementById("right-leg")
];

let selectedWord = "";
let guessedLetters = new Set();
let wrongGuesses = 0;
let gameFinished = false;


function chooseRandomWord() {
    const randomIndex =
        Math.floor(Math.random() * words.length);

    return words[randomIndex];
}


function startGame() {
    selectedWord = chooseRandomWord();

    guessedLetters =
        new Set();

    wrongGuesses = 0;
    gameFinished = false;

    wrongCount.textContent = "0";
    gameMessage.textContent = "";

    bodyParts.forEach(part => {
        part.classList.remove("visible");
    });

    buildKeyboard();
    updateWordDisplay();
}


function buildKeyboard() {
    keyboard.innerHTML = "";

    const alphabet =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

    alphabet.split("").forEach(letter => {
        const button =
            document.createElement("button");

        button.type = "button";
        button.className = "letter-button";
        button.textContent = letter;

        button.addEventListener("click", () => {
            handleGuess(letter.toLowerCase(), button);
        });

        keyboard.appendChild(button);
    });
}


function handleGuess(letter, button) {
    if (
        gameFinished ||
        guessedLetters.has(letter)
    ) {
        return;
    }

    guessedLetters.add(letter);
    button.disabled = true;

    if (selectedWord.includes(letter)) {
        button.classList.add("correct");
    } else {
        button.classList.add("incorrect");

        wrongGuesses += 1;
        wrongCount.textContent =
            String(wrongGuesses);

        bodyParts[
            wrongGuesses - 1
        ]?.classList.add("visible");
    }

    updateWordDisplay();
    checkGameResult();
}


function updateWordDisplay() {
    const displayedWord =
        selectedWord
            .split("")
            .map(letter => {
                return guessedLetters.has(letter)
                    ? letter.toUpperCase()
                    : "_";
            })
            .join(" ");

    wordDisplay.textContent =
        displayedWord;
}


function checkGameResult() {
    const solved =
        selectedWord
            .split("")
            .every(letter =>
                guessedLetters.has(letter)
            );

    if (solved) {
        gameFinished = true;

        gameMessage.textContent =
            "You won! The grove celebrates. 🌿";
    }

    if (wrongGuesses >= MAX_WRONG_GUESSES) {
        gameFinished = true;

        gameMessage.textContent =
            `Game over. The word was "${selectedWord.toUpperCase()}".`;

        revealWord();
    }

    if (gameFinished) {
        disableKeyboard();
    }
}


function revealWord() {
    selectedWord
        .split("")
        .forEach(letter =>
            guessedLetters.add(letter)
        );

    updateWordDisplay();
}


function disableKeyboard() {
    const buttons =
        keyboard.querySelectorAll("button");

    buttons.forEach(button => {
        button.disabled = true;
    });
}


restartButton.addEventListener(
    "click",
    startGame
);

startGame();