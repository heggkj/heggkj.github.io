// Game version
const GAME_VERSION = "v. 0.1";

// Output the game version to the console
console.log(`WordFall Game Version: ${GAME_VERSION}`);

// Game constants
const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 20;

// Game state
let gameBoard = Array.from({ length: BOARD_HEIGHT }, () => Array(BOARD_WIDTH).fill(null));
let currentTetrad = null;
let morphemes = [];
let dictionary = [];

// Load the morphemes and dictionary data using D3
d3.csv("morphemes.csv").then(function(data) {
    morphemes = data;
    initializeGame();
});

d3.csv("filtered_collins_words.csv").then(function(data) {
    dictionary = data.map(d => d.Word);
});

function initializeGame() {
    // Select a random morpheme and display it on the game board
    currentTetrad = getRandomTetrad();
    drawGameBoard();
}

function getRandomTetrad() {
    let randomMorpheme = morphemes[Math.floor(Math.random() * morphemes.length)].Morpheme;
    return {
        shape: randomMorpheme,
        position: { x: Math.floor(BOARD_WIDTH / 2), y: 0 }  // Start at the top-middle of the board
    };
}

function drawGameBoard() {
    // Clear previous tetrad display
    const boardElement = document.getElementById('game-board');
    boardElement.innerHTML = '';

    // Display current tetrad
    const tetradElement = document.createElement('div');
    tetradElement.style.position = 'absolute';
    tetradElement.style.left = (currentTetrad.position.x * 40) + 'px';  // 40 is arbitrary block size
    tetradElement.style.top = (currentTetrad.position.y * 40) + 'px';
    tetradElement.style.width = '40px';
    tetradElement.style.height = '40px';
    tetradElement.style.backgroundColor = 'blue';  // Color for the tetrad
    tetradElement.textContent = currentTetrad.shape;
    boardElement.appendChild(tetradElement);
}

// Event listener for arrow keys
document.addEventListener('keydown', function(event) {
    switch(event.keyCode) {
        case 37: // Left Arrow
            currentTetrad.position.x -= 1;
            break;
        case 39: // Right Arrow
            currentTetrad.position.x += 1;
            break;
        case 40: // Down Arrow
            currentTetrad.position.y += 1;
            break;
        case 38: // Up Arrow
            // Rotation logic will go here in the future
            break;
    }
    drawGameBoard();  // Update the game board after any movement
});
