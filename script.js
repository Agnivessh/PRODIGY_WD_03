const cells = document.querySelectorAll('[data-cell]');
const status = document.querySelector('.status');
const restartBtn = document.querySelector('.restart-btn');
const pvpBtn = document.getElementById('pvp');
const pvcBtn = document.getElementById('pvc');
const modal = document.getElementById('victoryModal');
const winnerText = document.querySelector('.winner-text');
const playAgainBtn = document.querySelector('.play-again-btn');

let currentPlayer = '1';
let gameActive = true;
let gameState = ['', '', '', '', '', '', '', '', ''];
let isPlayingWithAI = false;

// Map player numbers to X and O symbols
const playerSymbols = {
    '1': 'X',
    '2': 'O'
};

const winningCombinations = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
    [0, 4, 8], [2, 4, 6] // Diagonals
];

function handleGameModeSelection(mode) {
    isPlayingWithAI = mode === 'ai';
    pvpBtn.classList.toggle('active', !isPlayingWithAI);
    pvcBtn.classList.toggle('active', isPlayingWithAI);
    clearWinningLine();
    restartGame();
}

function handleClick(e) {
    const cell = e.target;
    const index = Array.from(cells).indexOf(cell);

    if (gameState[index] !== '' || !gameActive) return;

    makeMove(index);

    if (isPlayingWithAI && gameActive) {
        setTimeout(makeAIMove, 500);
    }
}

function makeMove(index) {
    gameState[index] = currentPlayer;
    cells[index].textContent = playerSymbols[currentPlayer];
    cells[index].classList.add(`player${currentPlayer}`);

    if (checkWin()) {
        highlightWinningCombination();
        return;
    }

    if (checkDraw()) {
        showDrawModal();
        gameActive = false;
        return;
    }

    currentPlayer = currentPlayer === '1' ? '2' : '1';
    status.textContent = `Player ${currentPlayer}'s turn`;
}

function makeAIMove() {
    if (!gameActive) return;
    
    // Try to find winning move
    const winningMove = findBestMove('2');
    if (winningMove !== -1) {
        makeMove(winningMove);
        return;
    }

    // Try to block player's winning move
    const blockingMove = findBestMove('1');
    if (blockingMove !== -1) {
        makeMove(blockingMove);
        return;
    }

    // Try to take center if available
    if (gameState[4] === '') {
        makeMove(4);
        return;
    }

    // Try to take corners
    const corners = [0, 2, 6, 8];
    const emptyCorners = corners.filter(corner => gameState[corner] === '');
    if (emptyCorners.length > 0) {
        const randomCorner = emptyCorners[Math.floor(Math.random() * emptyCorners.length)];
        makeMove(randomCorner);
        return;
    }

    // Take any available edge
    const edges = [1, 3, 5, 7];
    const emptyEdges = edges.filter(edge => gameState[edge] === '');
    if (emptyEdges.length > 0) {
        const randomEdge = emptyEdges[Math.floor(Math.random() * emptyEdges.length)];
        makeMove(randomEdge);
        return;
    }
}

function findBestMove(player) {
    // Check each winning combination
    for (const combination of winningCombinations) {
        const [a, b, c] = combination;
        
        // Count player's symbols and empty cells in this combination
        const playerCount = combination.filter(index => gameState[index] === player).length;
        const emptyCount = combination.filter(index => gameState[index] === '').length;

        // If we can win in this combination
        if (playerCount === 2 && emptyCount === 1) {
            // Find and return the empty position
            return combination.find(index => gameState[index] === '');
        }
    }
    return -1;
}

function checkWin() {
    return winningCombinations.some(combination => {
        return combination.every(index => {
            return gameState[index] === currentPlayer;
        });
    });
}

function highlightWinningCombination() {
    winningCombinations.forEach(combination => {
        if (combination.every(index => gameState[index] === currentPlayer)) {
            drawWinningLine(combination);
            setTimeout(showVictoryModal, 1000); // Delay modal display by 1 second
        }
    });
}

function drawWinningLine(combination) {
    const line = document.createElement('div');
    line.classList.add('winning-line');
    line.classList.add(`player${currentPlayer}`);
    
    const [a, b, c] = combination;
    const cellSize = 100;
    
    const firstCell = cells[a].getBoundingClientRect();
    const lastCell = cells[c].getBoundingClientRect();
    const boardRect = document.querySelector('.board').getBoundingClientRect();
    
    // Calculate line length and angle
    const deltaX = lastCell.left - firstCell.left;
    const deltaY = lastCell.top - firstCell.top;
    const length = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const angle = Math.atan2(deltaY, deltaX) * (180 / Math.PI);
    
    // Position and rotate the line
    line.style.width = `${length}px`;
    line.style.height = '5px';
    line.style.top = `${firstCell.top - boardRect.top + cellSize/2}px`;
    line.style.left = `${firstCell.left - boardRect.left + cellSize/2}px`;
    line.style.transformOrigin = 'left';
    line.style.transform = `rotate(${angle}deg)`;
    
    // Add animation
    line.style.transition = 'width 0.5s ease-in-out';
    line.style.width = '0';
    
    document.querySelector('.board').appendChild(line);
    
    // Trigger animation
    requestAnimationFrame(() => {
        line.style.width = `${length}px`;
    });
}

function checkDraw() {
    return gameState.every(cell => cell !== '');
}

function showVictoryModal() {
    winnerText.textContent = `Player ${currentPlayer} Wins!`;
    modal.classList.add('active');
    createConfetti();
}

function showDrawModal() {
    winnerText.textContent = "It's a Draw!";
    modal.classList.add('active');
}

function createConfetti() {
    for (let i = 0; i < 100; i++) {
        const confetti = document.createElement('div');
        confetti.classList.add('confetti');
        
        // Random confetti properties
        const colors = ['#2ecc71', '#3498db', '#e74c3c', '#f1c40f', '#9b59b6'];
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.left = Math.random() * 100 + 'vw';
        confetti.style.animation = `fall ${Math.random() * 3 + 2}s linear`;
        
        document.body.appendChild(confetti);
        
        // Remove confetti after animation
        confetti.addEventListener('animationend', () => {
            confetti.remove();
        });
    }
}

function restartGame() {
    currentPlayer = '1';
    gameActive = true;
    gameState = ['', '', '', '', '', '', '', '', ''];
    status.textContent = `Player ${currentPlayer}'s turn`;
    
    // Clear all cells
    cells.forEach(cell => {
        cell.textContent = '';
        cell.classList.remove('player1', 'player2', 'winner');
    });

    // Remove winning line
    clearWinningLine();
    
    // Clear modal
    modal.classList.remove('active');
}

// Add new function to clear winning line
function clearWinningLine() {
    const winningLines = document.querySelectorAll('.winning-line');
    winningLines.forEach(line => line.remove());
}

// Event Listeners
cells.forEach(cell => {
    cell.addEventListener('click', handleClick);
});

restartBtn.addEventListener('click', restartGame);
pvpBtn.addEventListener('click', () => handleGameModeSelection('pvp'));
pvcBtn.addEventListener('click', () => handleGameModeSelection('ai'));
playAgainBtn.addEventListener('click', () => {
    clearWinningLine();
    restartGame();
});

// Set default game mode
handleGameModeSelection('pvp');
