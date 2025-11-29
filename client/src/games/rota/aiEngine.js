// client/src/games/rota/aiEngine.js

// --- CONSTANTS ---
const ADJACENCY = {
    0: [1, 7, 8], 1: [0, 2, 8], 2: [1, 3, 8], 3: [2, 4, 8],
    4: [3, 5, 8], 5: [4, 6, 8], 6: [5, 7, 8], 7: [6, 0, 8],
    8: [0, 1, 2, 3, 4, 5, 6, 7]
};

const WIN_LINES = [
    [0, 8, 4], [1, 8, 5], [2, 8, 6], [3, 8, 7], // Diameters
    [0, 1, 2], [1, 2, 3], [2, 3, 4], [3, 4, 5], // Perimeter arcs
    [4, 5, 6], [5, 6, 7], [6, 7, 0], [7, 0, 1]
];

// --- HELPERS ---
const checkWin = (board, player) => {
    for (let line of WIN_LINES) {
        if (board[line[0]] === player && board[line[1]] === player && board[line[2]] === player) {
            return true;
        }
    }
    return false;
};

// --- PLACEMENT PHASE AI ---
export const getBestPlacement = (board, cpuColor, playerColor) => {
    // 1. Find all truly EMPTY spots
    const emptySpots = board.map((val, idx) => val === null ? idx : null).filter(val => val !== null);
    
    // Priority 1: Take Center (Index 8) if empty
    if (board[8] === null) return { index: 8 };

    // Priority 2: Win Immediately
    for (let i of emptySpots) {
        const testBoard = [...board];
        testBoard[i] = cpuColor;
        if (checkWin(testBoard, cpuColor)) return { index: i };
    }

    // Priority 3: Block Player Win
    for (let i of emptySpots) {
        const testBoard = [...board];
        testBoard[i] = playerColor;
        if (checkWin(testBoard, playerColor)) return { index: i };
    }

    // Priority 4: Random Empty Spot
    const random = emptySpots[Math.floor(Math.random() * emptySpots.length)];
    return { index: random };
};

// --- MOVEMENT PHASE AI (Minimax) ---
export const getBestMove = (board, cpuColor, playerColor) => {
    // 1. Find all pieces belonging to CPU
    const myPieces = board.map((val, idx) => val === cpuColor ? idx : null).filter(val => val !== null);
    let potentialMoves = [];

    // 2. Generate all VALID moves (Empty + Adjacent)
    myPieces.forEach(from => {
        ADJACENCY[from].forEach(to => {
            if (board[to] === null) {
                potentialMoves.push({ from, to });
            }
        });
    });

    if (potentialMoves.length === 0) return null; // Trapped

    // 3. Simple Strategy (Win/Block) - Faster than full recursion for web
    
    // Check for Immediate Win
    for (let move of potentialMoves) {
        const testBoard = [...board];
        testBoard[move.from] = null;
        testBoard[move.to] = cpuColor;
        if (checkWin(testBoard, cpuColor)) return move;
    }

    // Check for Immediate Block
    // (Hypothetically: If I don't move here, can he move there and win?)
    // This is complex in movement, so we fallback to Center Control.

    // Strategy: Move to Center if possible
    const centerMove = potentialMoves.find(m => m.to === 8);
    if (centerMove) return centerMove;

    // Strategy: Move to block a line (Simple Heuristic)
    // Random fallback is fine for now to prevent freezing
    return potentialMoves[Math.floor(Math.random() * potentialMoves.length)];
};
