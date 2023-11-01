const form = document.querySelector("form");
const startButton = document.querySelector("#start");
const scoreContainer = document.getElementById("score");
const gameContainer = document.getElementById("game");

// global variables to keep track of game stats.
let attemptedCards = [];
let timerDone = true;
let totalPairs = 0;
let countTries = 0;
let countPairsFound = 0;

// do stuff when form button is clicked
form.addEventListener("submit", function (event) {
    event.preventDefault();

    const form = event.target;
    const input = form.children[0];
    const button = form.children[1];

    // for the range input
    for (let child of input.children) {
        if (child.id === "range") {
            // get how many cards to create
            numCards = child.value;
            console.log(`User is asking for ${numCards} cards.`);
        }
    }

    // for the start / reset button:
    if (button.id === "start") {
        // if START GAME button clicked:
        // Create colors, cards, divs, score area, etc:
        runStartSequence(numCards);

        // remove 'start game' button / form
        button.remove();
    }
    // if RESET GAME button clicked:
    else if (button.id === "reset") {
        // Reset colors, cards, divs, score area, etc:
        runResetSequence(numCards);
    }
});

function runStartSequence(numCards) {
    totalPairs = numCards / 2;
    createScoreElement(totalPairs);

    const colors = generateColors(totalPairs);
    const cards = assignColorsToCards(colors, numCards);
    console.log(`${cards.length} cards were assigned colors.`);
    const shuffledCards = shuffle(cards);

    createDivsForColors(shuffledCards);
    createResetButton();
}

function runResetSequence(numCards) {
    totalPairs = numCards / 2;
    updateScoreElement(0, 0, totalPairs);
    removeDivs();

    const colors = generateColors(totalPairs);
    const cards = assignColorsToCards(colors, numCards);
    console.log(`${cards.length} cards were assigned colors.`);
    const shuffledCards = shuffle(cards);

    createDivsForColors(shuffledCards);

    countTries = 0;
    countPairsFound = 0;
}

function generateColors(totalPairs) {
    console.log(`Generating colors for ${totalPairs} card pairs.`);
    const randColorArray = [];
    let hueIncrement = Math.floor(360 / totalPairs) - 1;
    for (let i = 0; i < totalPairs; i++) {
        const h = i * hueIncrement;
        const s = "100%";
        const l = "50%";

        // check to see if random color is
        randColorArray.push(`hsl(${h},${s},${l})`);
    }

    return randColorArray;
}

function assignColorsToCards(colors, numCards) {
    console.log(`Assigning ${colors.length} color pairs for ${colors.length * 2} cards.`);
    const cards = [];
    for (let color of colors) {
        cards.push(color);
        cards.push(color);
    }

    return cards;
}

function shuffle(array) {
    let counter = array.length;

    console.log(`Shuffling colors for ${counter} total cards.`);

    // While there are elements in the array
    while (counter > 0) {
        // Pick a random index
        let index = Math.floor(Math.random() * counter);

        // Decrease counter by 1
        counter--;

        // And swap the last element with it
        let temp = array[counter];
        array[counter] = array[index];
        array[index] = temp;
    }

    return array;
}

function createScoreElement(numPairs) {
    const currentScoreParagraph = document.createElement("p");
    const bestScoreParagraph = document.createElement("p");

    scoreContainer.classList.add("score-div");

    currentScoreParagraph.id = "current-score";
    currentScoreParagraph.innerHTML = generateCurrentScoreText(0, 0, numPairs);
    scoreContainer.append(currentScoreParagraph);

    bestScoreParagraph.id = "best-score";
    let bestScore = localStorage.getItem(numPairs);
    if (bestScore) {
        bestScoreParagraph.innerHTML = `<span class="score">Best Score: ${bestScore} attempts</span><span class="score-facts">(for ${numPairs} pairs)`;
    } else {
        bestScoreParagraph.innerHTML = `<span class="score">Best Score: N/A</span><span class="score-facts">(for ${numPairs} pairs)`;
    }
    scoreContainer.append(bestScoreParagraph);
}

function updateScoreElement(countTries, countPairsFound, numPairs) {
    console.log(`Updating score to ${countTries}.`);
    const currentScoreParagraph = document.querySelector("#current-score");
    const bestScoreParagraph = document.querySelector("#best-score");
    let bestScore = localStorage.getItem(numPairs);

    if (countPairsFound < numPairs) {
        currentScoreParagraph.innerHTML = generateCurrentScoreText(
            countTries,
            countPairsFound,
            numPairs
        );

        bestScoreParagraph.innerHTML = generateBestScoreText(bestScore, numPairs);
        return false;
    } else {
        // GAME WON
        currentScoreParagraph.innerHTML = `<span class="score">GAME WON! It took ${countTries} attemps to find ${numPairs} possible pairs</span>`;

        // save score to localStorage
        saveScore(countTries, numPairs);
        bestScore = localStorage.getItem(numPairs);

        bestScoreParagraph.innerHTML = generateBestScoreText(bestScore, numPairs);
        return true;
    }
}

function generateCurrentScoreText(countTries, countPairsFound, numPairs) {
    let currentScoreText = `<span class="score">Current Score: ${countTries} attempts</span><span class="score-facts">(${countPairsFound} pairs found out of ${numPairs})</span>`;
    return currentScoreText;
}

function generateBestScoreText(bestScore, numPairs) {
    if (!bestScore) {
        bestScore = "N/A";
    }
    let bestScoreText = `<span class="score">Best Score: ${bestScore} attempts</span><span class="score-facts">(for ${numPairs} pairs)`;
    return bestScoreText;
}

function createResetButton() {
    const resetButton = document.createElement("button");
    resetButton.innerText = "Reset Game";
    resetButton.id = "reset";

    form.append(resetButton);
}

function createDivsForColors(colorArray) {
    for (let color of colorArray) {
        // create a new card div
        const cardDiv = document.createElement("div");
        cardDiv.setAttribute("data-color", color);

        // call a function handleCardClick when a div is clicked on
        cardDiv.addEventListener("click", handleCardClick);

        gameContainer.append(cardDiv);
    }
}

function removeDivs() {
    let divs = gameContainer.children;
    let divArray = [];

    // Q: Is there a better way to do this with the data from the HTMLCollection directly?
    // maybe use *forEach* instead within each collection
    // create array of div elements
    for (let div of divs) {
        divArray.push(div);
    }

    // remove divs
    for (let div of divArray) {
        div.remove();
    }
}

function handleCardClick(event) {
    let card = event.target;
    let cardColor = card.getAttribute("data-color");
    let cardShowing = getCardView(card);

    if (attemptedCards.length < 2 && !cardShowing && timerDone) {
        console.log(`Attempt #${attemptedCards.length}. Picked ${cardColor} card.`);
        attemptedCards.push(card);

        // reveal color and mark as 'attempted'
        card.style.backgroundColor = cardColor;
        card.setAttribute("data-attempt", true);
    }

    if (attemptedCards.length === 2 && timerDone) {
        console.log(`Two cards attempted. Seeing if they match...`);
        timerDone = false;

        // Q: Cleaner way to do this? A loop didn't seem right when comparing two elements.
        // NOTE: bug would happen if array length wasn't
        if (attemptedCards[0].style.backgroundColor === attemptedCards[1].style.backgroundColor) {
            // Match found!
            console.log("Match! keeping cards revealed");

            for (let c of attemptedCards) {
                c.setAttribute("data-revealed", true);
                c.removeAttribute("data-attempt");
            }
            attemptedCards = [];
            countPairsFound++;
            timerDone = true;
        } else {
            // Not a match!
            console.log(
                `${attemptedCards[0].className} != ${attemptedCards[1].className} --> turning cards back over in 1s`
            );

            // hide cards after 1s if not a match
            setTimeout(function () {
                // to use arg in hideCards, need to call within an anon function
                hideCards(attemptedCards);
                attemptedCards = [];
                timerDone = true;
            }, 1000);
        }

        countTries++;

        // update score & check if game won
        updateScoreElement(countTries, countPairsFound, totalPairs);
    }
}

function getCardView(card) {
    if (card.getAttribute("data-attempt") || card.getAttribute("data-revealed")) {
        return true;
    }
    return false;
}

function hideCards(attemptedCards) {
    for (let attemptedCard of attemptedCards) {
        attemptedCard.style.backgroundColor = null;
        attemptedCard.removeAttribute("data-attempt");
    }
    attemptedCards = [];
}

function saveScore(score, numPairs) {
    let countPairs = numPairs;
    let scoreObj = { countPairs: score };

    let bestScore = localStorage.getItem(countPairs);

    // if local storage has a best score for that countPairs check to see if new score is better
    if (bestScore) {
        if (score >= bestScore) {
            console.log("New score not better. Keeping old score in local storage");
        } else {
            console.log("New score is better! Adding new score to local storage");
            localStorage.setItem(countPairs, score);
        }
    } else {
        console.log("Score didn't exist. Adding to local storage");
        localStorage.setItem(countPairs, score);
    }
}
