
export type Cell = 'player' | 'cpu' | null;
export type GamePhase = 'placing' | 'moving' | 'flying' | 'removing';

export interface GameState {
    board: Cell[];
    turn: 'player' | 'cpu';
    phase: GamePhase;
    piecesHand: { player: number; cpu: number };
    piecesBoard: { player: number; cpu: number };
    selectedCell: number | null;
    winner: 'player' | 'cpu' | 'draw' | null;
    message: string;
    removalPending: boolean; // True if player needs to remove an opponent piece
}

// 24 Nodes
// Outer: 0-1-2, 7-8, 13-14-15
// Middle: 3-4-5, 9-10, 16-17-18
// Inner: 6-11-12
// BUT WAIT! Let's use a standard 0-23 indexing that visually makes sense.
// 0-------1-------2
// |       |       |
// |   3---4---5   |
// |   |   |   |   |
// 6---7       8---9
// |   |   |   |   |
// |   10--11--12  |
// |       |       |
// 13------14------15
// Re-mapping based on typical boards:
// Outer Square: 0, 1, 2 (top) | 2, 14, 23 (right) | 23, 22, 21 (bottom) | 21, 9, 0 (left) -- indices are tricky.
// Let's use the explicit coordinate map below for logic.

const CONNECTIONS = [
    [0, 1], [1, 2], [0, 9], [1, 4], [2, 14],
    [3, 4], [4, 5], [3, 10], [5, 13],
    [6, 7], [7, 8], [6, 11], [7, 4], [8, 12],
    [9, 10], [10, 11], [11, 15], [8, 12], [5, 13], [12, 17], [13, 14], [14, 23],
    [15, 16], [16, 17], [11, 6], [12, 8], // wait this manual graph is error prone.
    // Let's stick to the Adjacency List provided in previous step and VALIDATE it.
];

export const ADJACENCY: { [key: number]: number[] } = {
    0: [1, 9], 1: [0, 2, 4], 2: [1, 14],
    3: [4, 10], 4: [1, 3, 5, 7], 5: [4, 13],
    6: [7, 11], 7: [4, 6, 8], 8: [7, 12],
    9: [0, 10, 21], 10: [3, 9, 11, 18], 11: [6, 10, 15],
    12: [8, 13, 17], 13: [5, 12, 14, 20], 14: [2, 13, 23],
    15: [11, 16], 16: [15, 17, 19], 17: [12, 16],
    18: [10, 19], 19: [16, 18, 20, 22], 20: [13, 19],
    21: [9, 22], 22: [19, 21, 23], 23: [14, 22]
};

// Valid Mills (Lines of 3)
export const MILLS = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],          // Horizontal Top
    [9, 10, 11], [12, 13, 14],                // Horizontal Middle
    [15, 16, 17], [18, 19, 20], [21, 22, 23], // Horizontal Bottom

    [0, 9, 21], [3, 10, 18], [6, 11, 15],     // Vertical Left
    [1, 4, 7], [16, 19, 22],                  // Vertical Middle
    [8, 12, 17], [5, 13, 20], [2, 14, 23]     // Vertical Right
];

export const INITIAL_STATE: GameState = {
    board: Array(24).fill(null),
    turn: 'player',
    phase: 'placing',
    piecesHand: { player: 9, cpu: 9 },
    piecesBoard: { player: 0, cpu: 0 },
    selectedCell: null,
    winner: null,
    message: "Place your pieces!",
    removalPending: false
};

// Check if a move completed a mill
export const checkMill = (board: Cell[], index: number, player: 'player' | 'cpu'): boolean => {
    return MILLS.filter(mill => mill.includes(index)).some(mill =>
        mill.every(i => board[i] === player)
    );
};

// Check if a player has any valid moves
export const hasValidMoves = (board: Cell[], player: 'player' | 'cpu', phase: GamePhase): boolean => {
    if (phase === 'placing') return true; // Assuming hand not empty
    if (phase === 'flying') return board.includes(null);

    // Normal moving
    return board.some((cell, i) => {
        if (cell !== player) return false;
        return ADJACENCY[i].some(neighbor => board[neighbor] === null);
    });
};

// --- AI ENGINE (Minimax) ---

function evaluateBoard(state: GameState): number {
    const cpu = 'cpu';
    const player = 'player';

    if (state.winner === cpu) return 1000;
    if (state.winner === player) return -1000;

    let score = 0;

    // Material advantage
    score += (state.piecesBoard[cpu] - state.piecesBoard[player]) * 10;
    score += (state.piecesHand[cpu] - state.piecesHand[player]) * 5;

    // Mobility (only in moving phase)
    if (state.phase === 'moving') {
        const cpuMoves = getPossibleMoves(state, cpu).length;
        const playerMoves = getPossibleMoves(state, player).length;
        score += (cpuMoves - playerMoves);
    }

    // Mills formed (heavier weight)
    // TODO: Add complex mill analysis

    return score;
}

function getPossibleMoves(state: GameState, actor: 'player' | 'cpu'): { from?: number, to: number, remove?: number }[] {
    const moves: { from?: number, to: number, remove?: number }[] = [];

    // 1. Placing Phase
    if (state.phase === 'placing' && state.piecesHand[actor] > 0) {
        state.board.forEach((cell, i) => {
            if (cell === null) moves.push({ to: i });
        });
        return moves;
    }

    // 2. Flying Phase (3 pieces left)
    if (state.piecesBoard[actor] === 3 && state.piecesHand[actor] === 0) {
        const myPieces = state.board.map((c, i) => c === actor ? i : -1).filter(i => i !== -1);
        const emptySpots = state.board.map((c, i) => c === null ? i : -1).filter(i => i !== -1);

        myPieces.forEach(from => {
            emptySpots.forEach(to => {
                moves.push({ from, to });
            });
        });
        return moves;
    }

    // 3. Moving Phase
    const myPieces = state.board.map((c, i) => c === actor ? i : -1).filter(i => i !== -1);
    myPieces.forEach(from => {
        ADJACENCY[from].forEach(to => {
            if (state.board[to] === null) {
                moves.push({ from, to });
            }
        });
    });

    return moves;
}

export const getBestMove = (state: GameState): { from?: number, to: number, remove?: number } | null => {
    const moves = getPossibleMoves(state, 'cpu');
    if (moves.length === 0) return null;

    // Simple heuristic for now: Take any move that forms a mill
    for (const move of moves) {
        const testBoard = [...state.board];
        if (move.from !== undefined) testBoard[move.from] = null;
        testBoard[move.to] = 'cpu';

        if (checkMill(testBoard, move.to, 'cpu')) {
            // If mill formed, find best piece to remove
            const remove = findBestRemoval(testBoard, 'player');
            return { ...move, remove };
        }
    }

    // Otherwise random valid move (upgrade to Minimax later)
    return moves[Math.floor(Math.random() * moves.length)];
};

const findBestRemoval = (board: Cell[], opponent: string): number => {
    const targets = board.map((c, i) => c === opponent ? i : -1).filter(i => i !== -1);
    // Prefer removing pieces that are NOT in a mill first
    const nonMillTargets = targets.filter(i => !checkMill(board, i, opponent as any));

    if (nonMillTargets.length > 0) {
        return nonMillTargets[Math.floor(Math.random() * nonMillTargets.length)];
    }
    // If all in mills, must take one
    return targets[0];
};
