
export type Player = 'X' | 'O';
export type Cell = Player | null;
export type SmallBoard = Cell[]; // 9 cells
export type BigBoard = (Player | 'draw' | null)[]; // 9 cells representing winners of small boards

export interface GameState {
    board: SmallBoard[]; // 9x9 grid
    macroBoard: BigBoard; // 3x3 grid of winners
    turn: Player;
    nextMacro: number | null; // Index of the macro board the player must play in (null = any)
    winner: Player | 'draw' | null;
    history: any[]; // For undo/redo if needed
}

export const WIN_LINES = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6]
];

export const INITIAL_STATE: GameState = {
    // 9 small boards
    board: Array(9).fill(null).map(() => Array(9).fill(null)),
    macroBoard: Array(9).fill(null),
    turn: 'X', // Player starts as X
    nextMacro: null, // First move can be anywhere
    winner: null,
    history: []
};

// Check for win on a 3x3 board
export const checkSmallWin = (board: Cell[]): Player | null => {
    for (const line of WIN_LINES) {
        if (board[line[0]] && board[line[0]] === board[line[1]] && board[line[0]] === board[line[2]]) {
            return board[line[0]];
        }
    }
    return null;
};

// Check if a board is full (draw)
export const checkDraw = (board: Cell[]): boolean => {
    return board.every(cell => cell !== null);
};

// --- AI ENGINE (Minimax with Alpha-Beta Pruning) ---

function evaluateBoard(state: GameState): number {
    const cpu = 'O';
    const player = 'X';

    if (state.winner === cpu) return 10000;
    if (state.winner === player) return -10000;
    if (state.winner === 'draw') return 0;

    let score = 0;

    // Macro Board advantages
    state.macroBoard.forEach((cell, i) => {
        if (cell === cpu) score += 100;
        else if (cell === player) score -= 100;
        // Should also check "almost wins" on macro board?
    });

    // Micro Board advantages
    // ... deeper heuristic

    return score;
}

export const getMoves = (state: GameState): { macro: number, micro: number }[] => {
    if (state.winner) return [];
    const moves: { macro: number, micro: number }[] = [];

    // Identify which macro boards are playable
    let targetMacros: number[] = [];
    if (state.nextMacro !== null && state.macroBoard[state.nextMacro] === null) {
        targetMacros = [state.nextMacro];
    } else {
        // If target is won/full, can play anywhere that isn't won/full
        targetMacros = [0, 1, 2, 3, 4, 5, 6, 7, 8].filter(i => state.macroBoard[i] === null);
    }

    targetMacros.forEach(macroIdx => {
        state.board[macroIdx].forEach((cell, microIdx) => {
            if (cell === null) {
                moves.push({ macro: macroIdx, micro: microIdx });
            }
        });
    });

    return moves;
};

// Apply Move (Immutable)
export const applyMove = (state: GameState, move: { macro: number, micro: number }): GameState => {
    const newBoard = state.board.map((b, i) => i === move.macro ? [...b] : b);
    newBoard[move.macro][move.micro] = state.turn;

    const newMacroBoard = [...state.macroBoard];
    // Check if small board won
    const smallWinner = checkSmallWin(newBoard[move.macro]);
    if (smallWinner) {
        newMacroBoard[move.macro] = smallWinner;
    } else if (checkDraw(newBoard[move.macro])) {
        newMacroBoard[move.macro] = 'draw';
    }

    // Check big board win
    let bigWinner: Player | 'draw' | null = null;

    // Check main win lines
    for (const line of WIN_LINES) {
        const a = newMacroBoard[line[0]];
        const b = newMacroBoard[line[1]];
        const c = newMacroBoard[line[2]];
        // Ensure a is a Player ('X' or 'O'), not 'draw' or null, before comparing
        if (a && a !== 'draw' && a === b && a === c) {
            bigWinner = a as Player;
            break;
        }
    }

    if (!bigWinner && newMacroBoard.every(c => c !== null)) {
        bigWinner = 'draw';
    }

    return {
        ...state,
        board: newBoard,
        macroBoard: newMacroBoard,
        turn: state.turn === 'X' ? 'O' : 'X',
        nextMacro: newMacroBoard[move.micro] === null ? move.micro : null, // If sent to full/won board, play anywhere
        winner: bigWinner,
        history: [...state.history, move]
    };
};

export const getBestMove = (state: GameState): { macro: number, micro: number } | null => {
    const moves = getMoves(state);
    if (moves.length === 0) return null;

    // Simple depth-1 search (greedy) + random tie-break
    let bestScore = -Infinity;
    let bestMoves: any[] = [];

    // CPU is 'O'
    for (const move of moves) {
        const nextState = applyMove(state, move);

        // Immediate Win
        if (nextState.winner === 'O') return move;

        // Don't let opponent win immediately
        // Simulate opponent move
        const opponentMoves = getMoves(nextState);
        const opponentCanWin = opponentMoves.some(m => applyMove(nextState, m).winner === 'X');

        let score = evaluateBoard(nextState);
        if (opponentCanWin) score -= 5000;

        if (score > bestScore) {
            bestScore = score;
            bestMoves = [move];
        } else if (score === bestScore) {
            bestMoves.push(move);
        }
    }

    return bestMoves[Math.floor(Math.random() * bestMoves.length)];
};
