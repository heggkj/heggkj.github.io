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
    // For simplicity, we'll just select a random morpheme and display it on the game board
    currentTetrad = getRandomTetrad();
    drawGameBoard();
}

function getRandomTetrad() {
    let randomMorpheme = morphemes[Math.floor(Math.random() * morphemes.length)].Morpheme;
    // For now, we'll just return the morpheme as a tetrad (we'll shape and orient it properly later)
    return {
        shape: randomMorpheme,  // This will be refined later to be an actual shape
        position: { x: Math.floor(BOARD_WIDTH / 2), y: 0 }  // Start at the top-middle of the board
    };
}

function drawGameBoard() {
    // This function will update the visual game board. For now, it'll just log the current tetrad.
    console.log(currentTetrad);
}

// Event listener for arrow keys
document.addEventListener('keydown', function(event) {
    switch(event.keyCode) {
        case 37: // Left Arrow
            // Move tetrad left
            break;
        case 39: // Right Arrow
            // Move tetrad right
            break;
        case 40: // Down Arrow
            // Move tetrad down faster
            break;
        case 38: // Up Arrow
            // Rotate tetrad
            break;
    }
});
