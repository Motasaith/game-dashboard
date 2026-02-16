
export type Player = 'black' | 'white';
export type Cell = Player | null;

export interface GameState {
    board: Cell[]; // 8x8 = 64 cells
    turn: Player;
    scores: { black: number, white: number };
    winner: Player | 'draw' | null;
    validMoves: number[]; // Indices of valid moves for current player
    history: any[]; // For undo
    message: string;
}

export const INITIAL_STATE: GameState = {
    board: Array(64).fill(null),
    turn: 'black', // Black moves first
    scores: { black: 2, white: 2 },
    winner: null,
    validMoves: [],
    history: [],
    message: "Black's Turn"
};

// Initialize standard board setup
// Center 4 squares: 27, 28, 35, 36
// 27, 36 = White
// 28, 35 = Black
export const getInitialBoard = (): Cell[] => {
    const board = Array(64).fill(null);
    board[27] = 'white';
    board[36] = 'white';
    board[28] = 'black';
    board[35] = 'black';
    return board;
};

// Directions for flipping: [dx, dy]
const DIRECTIONS = [
    [-1, -1], [0, -1], [1, -1],
    [-1, 0], [1, 0],
    [-1, 1], [0, 1], [1, 1]
];

const isValidPos = (x: number, y: number) => x >= 0 && x < 8 && y >= 0 && y < 8;

export const getValidMoves = (board: Cell[], player: Player): number[] => {
    const validMoves: number[] = [];
    const opponent = player === 'black' ? 'white' : 'black';

    for (let i = 0; i < 64; i++) {
        if (board[i] !== null) continue;

        const x = i % 8;
        const y = Math.floor(i / 8);

        // Check all directions for sandwiching opponent
        let isValid = false;

        for (const [dx, dy] of DIRECTIONS) {
            let cx = x + dx;
            let cy = y + dy;
            let flips = 0;

            while (isValidPos(cx, cy) && board[cy * 8 + cx] === opponent) {
                cx += dx;
                cy += dy;
                flips++;
            }

            if (flips > 0 && isValidPos(cx, cy) && board[cy * 8 + cx] === player) {
                isValid = true;
                break;
            }
        }

        if (isValid) validMoves.push(i);
    }
    return validMoves;
};

export const applyMove = (state: GameState, index: number): GameState => {
    if (index === -1) {
        // Pass Turn
        const nextTurn = state.turn === 'black' ? 'white' : 'black';
        const nextValidMoves = getValidMoves(state.board, nextTurn);

        // Game Over Check: If both pass, potential end?
        // Logic handled in UI or AI wrapper usually

        return {
            ...state,
            turn: nextTurn,
            validMoves: nextValidMoves,
            message: nextValidMoves.length === 0 ? "Game Over" : `${nextTurn === 'black' ? "Black" : "White"}'s Turn`
        };
    }

    const newBoard = [...state.board];
    const player = state.turn;
    const opponent = player === 'black' ? 'white' : 'black';
    const x = index % 8;
    const y = Math.floor(index / 8);

    newBoard[index] = player;

    // Flip pieces
    for (const [dx, dy] of DIRECTIONS) {
        let cx = x + dx;
        let cy = y + dy;
        const toFlip: number[] = [];

        while (isValidPos(cx, cy) && newBoard[cy * 8 + cx] === opponent) {
            toFlip.push(cy * 8 + cx);
            cx += dx;
            cy += dy;
        }

        if (toFlip.length > 0 && isValidPos(cx, cy) && newBoard[cy * 8 + cx] === player) {
            toFlip.forEach(idx => newBoard[idx] = player);
        }
    }

    // Update Counts
    let blackCount = 0;
    let whiteCount = 0;
    newBoard.forEach(c => {
        if (c === 'black') blackCount++;
        else if (c === 'white') whiteCount++;
    });

    // Next Turn
    let nextTurn: Player = player === 'black' ? 'white' : 'black';
    let nextValidMoves = getValidMoves(newBoard, nextTurn);
    let message = `${nextTurn === 'black' ? "Black" : "White"}'s Turn`;
    let winner = state.winner;

    // If opponent has no moves, pass back to current player?
    if (nextValidMoves.length === 0) {
        // Check if current player has moves?
        const currentHasMoves = getValidMoves(newBoard, player).length > 0;
        if (currentHasMoves) {
            nextTurn = player;
            nextValidMoves = getValidMoves(newBoard, player);
            message = `${opponent === 'black' ? "Black" : "White"} has no moves! ${player === 'black' ? "Black" : "White"} goes again.`;
        } else {
            // Game Over
            message = "Game Over";
            if (blackCount > whiteCount) winner = 'black';
            else if (whiteCount > blackCount) winner = 'white';
            else winner = 'draw';
        }
    }

    return {
        ...state,
        board: newBoard,
        turn: nextTurn,
        scores: { black: blackCount, white: whiteCount },
        validMoves: nextValidMoves,
        winner,
        message
    };
};

export const getBestMove = (state: GameState): number => {
    // Greedy Strategy: Maximize flips + Corner preference
    const moves = state.validMoves;
    if (moves.length === 0) return -1;

    let bestScore = -Infinity;
    let bestMove = moves[0];

    const CORNERS = [0, 7, 56, 63];

    for (const move of moves) {
        // Simulate
        let nextState = applyMove(state, move); // This updates state completely

        let score = 0;
        if (state.turn === 'black') {
            score = nextState.scores.black - nextState.scores.white;
        } else {
            score = nextState.scores.white - nextState.scores.black;
        }

        if (CORNERS.includes(move)) score += 50;

        if (score > bestScore) {
            bestScore = score;
            bestMove = move;
        }
    }

    return bestMove;
};
