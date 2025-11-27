// Rota AI Engine - Grandmaster Minimax Implementation

// Adjacency list for Rota (0-7 outer circle, 8 center)
const ADJACENCY = {
    0: [1, 7, 8],
    1: [0, 2, 8],
    2: [1, 3, 8],
    3: [2, 4, 8],
    4: [3, 5, 8],
    5: [4, 6, 8],
    6: [5, 7, 8],
    7: [6, 0, 8],
    8: [0, 1, 2, 3, 4, 5, 6, 7]
};

// Win lines
const WIN_LINES = [
    [0, 8, 4], [1, 8, 5], [2, 8, 6], [3, 8, 7], // Diameters
    [0, 1, 2], [2, 3, 4], [4, 5, 6], [6, 7, 0]  // Perimeter (Corner-Edge-Corner only)
];

// Helper: Check for a win
const checkWin = (board, player) => {
    return WIN_LINES.some(line => line.every(index => board[index] === player));
};

// Helper: Check if a move blocks an opponent's win
const isBlockingMove = (board, moveIndex, opponent) => {
    const tempBoard = [...board];
    tempBoard[moveIndex] = opponent;
    return checkWin(tempBoard, opponent);
};

// Helper: Get available moves (Placement Phase)
const getEmptySpots = (board) => {
    return board.map((cell, idx) => cell === null ? idx : -1).filter(idx => idx !== -1);
};

// Helper: Get available moves (Movement Phase)
const getValidMoves = (board, player) => {
    const moves = [];
    const pieces = board.map((cell, idx) => cell === player ? idx : -1).filter(idx => idx !== -1);
    
    pieces.forEach(from => {
        ADJACENCY[from].forEach(to => {
            if (board[to] === null) {
                moves.push({ from, to });
            }
        });
    });
    return moves;
};

// --- Task 1: Placement Logic ---
export const getBestPlacement = (board, cpuColor, playerColor) => {
    const emptySpots = getEmptySpots(board);
    
    // Priority 1: Take Center if empty (Crucial Strategy)
    if (board[8] === null) return { index: 8 };

    // Priority 2: Block Opponent (If they have 2 in a line)
    for (let index of emptySpots) {
        if (isBlockingMove(board, index, playerColor)) {
            return { index };
        }
    }

    // Priority 3: Win (If I have 2 in a line)
    for (let index of emptySpots) {
        const tempBoard = [...board];
        tempBoard[index] = cpuColor;
        if (checkWin(tempBoard, cpuColor)) {
            return { index };
        }
    }

    // Priority 4: Pick any corner (Outer circle 0-7)
    // We'll pick a random available spot from the remaining empty spots
    const randomIndex = Math.floor(Math.random() * emptySpots.length);
    return { index: emptySpots[randomIndex] };
};

// --- Task 2: Minimax Movement Logic ---

const evaluateBoard = (board, cpuColor, playerColor) => {
    if (checkWin(board, cpuColor)) return 1000;
    if (checkWin(board, playerColor)) return -1000;

    let score = 0;
    
    // Holding Center
    if (board[8] === cpuColor) score += 50;
    if (board[8] === playerColor) score -= 50;

    return score;
};

const minimax = (board, depth, isMaximizing, cpuColor, playerColor, alpha, beta) => {
    const score = evaluateBoard(board, cpuColor, playerColor);
    
    // Terminal states
    if (score === 1000) return score - depth; // Prefer faster wins
    if (score === -1000) return score + depth; // Prefer slower losses
    if (depth === 0) return score;

    if (isMaximizing) {
        let maxEval = -Infinity;
        const moves = getValidMoves(board, cpuColor);
        
        if (moves.length === 0) return -1000; // Trapped = Loss

        for (let move of moves) {
            const newBoard = [...board];
            newBoard[move.from] = null;
            newBoard[move.to] = cpuColor;

            const evalScore = minimax(newBoard, depth - 1, false, cpuColor, playerColor, alpha, beta);
            maxEval = Math.max(maxEval, evalScore);
            
            alpha = Math.max(alpha, evalScore);
            if (beta <= alpha) break;
        }
        return maxEval;
    } else {
        let minEval = Infinity;
        const moves = getValidMoves(board, playerColor);

        if (moves.length === 0) return 1000; // Opponent Trapped = Win

        for (let move of moves) {
            const newBoard = [...board];
            newBoard[move.from] = null;
            newBoard[move.to] = playerColor;

            const evalScore = minimax(newBoard, depth - 1, true, cpuColor, playerColor, alpha, beta);
            minEval = Math.min(minEval, evalScore);

            beta = Math.min(beta, evalScore);
            if (beta <= alpha) break;
        }
        return minEval;
    }
};

export const getBestMove = (board, cpuColor, playerColor) => {
    const moves = getValidMoves(board, cpuColor);
    if (moves.length === 0) return null; // Trapped

    let bestMove = null;
    let bestValue = -Infinity;

    for (let move of moves) {
        const newBoard = [...board];
        newBoard[move.from] = null;
        newBoard[move.to] = cpuColor;

        const moveValue = minimax(newBoard, 3, false, cpuColor, playerColor, -Infinity, Infinity);

        if (moveValue > bestValue) {
            bestValue = moveValue;
            bestMove = move;
        }
    }

    return bestMove;
};
