// Game version
const GAME_VERSION = "v. 0.3";
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
    if (dictionary.length > 0) {
        initializeGame();
    }
});

d3.csv("filtered_collins_words.csv").then(function(data) {
    dictionary = data.map(d => d.Word);
    if (morphemes.length > 0) {
        initializeGame();
    }
});

function initializeGame() {
    currentTetrad = getRandomTetrad();
    drawGameBoard();
}

function getRandomTetrad() {
    let randomMorpheme = morphemes[Math.floor(Math.random() * morphemes.length)].Morpheme;
    return {
        shape: randomMorpheme.toUpperCase(), // Capitalize the letters
        position: { x: Math.floor(BOARD_WIDTH / 2) - 1, y: 0 }  // Adjusted starting position
    };
}

function drawGameBoard() {
    const boardElement = document.getElementById('game-board');
    boardElement.innerHTML = '';
    for (let i = 0; i < currentTetrad.shape.length; i++) {
        const blockElement = document.createElement('div');
        blockElement.style.position = 'absolute';
        blockElement.style.left = (currentTetrad.position.x + i) * 40 + 'px';  // 40 is block size
        blockElement.style.top = currentTetrad.position.y * 40 + 'px';
        blockElement.style.width = '40px';
        blockElement.style.height = '40px';
        blockElement.style.backgroundColor = 'blue'; 
        blockElement.style.border = '1px solid white'; // Added border for clarity between blocks
        blockElement.textContent = currentTetrad.shape[i];
        blockElement.style.textAlign = 'center';
        blockElement.style.lineHeight = '40px';
        boardElement.appendChild(blockElement);
    }
}

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
    drawGameBoard();
});
