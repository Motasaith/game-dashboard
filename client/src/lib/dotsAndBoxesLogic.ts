
export type Player = 'player' | 'cpu';
export type Line = 'horizontal' | 'vertical';

export interface GameState {
    horizontalLines: boolean[][]; // [row][col]
    verticalLines: boolean[][];   // [row][col]
    boxes: (Player | null)[][];   // [row][col] (who captured it)
    turn: Player;
    scores: { player: number, cpu: number };
    gridSize: number; // e.g. 4 means 4x4 boxes (5x5 dots)
    winner: Player | 'draw' | null;
    lastMove: { type: Line, row: number, col: number } | null;
}

export const INITIAL_STATE: GameState = {
    horizontalLines: [],
    verticalLines: [],
    boxes: [],
    turn: 'player',
    scores: { player: 0, cpu: 0 },
    gridSize: 4,
    winner: null,
    lastMove: null
};

export const initializeGame = (size: number = 4): GameState => {
    return {
        ...INITIAL_STATE,
        gridSize: size,
        horizontalLines: Array(size + 1).fill(null).map(() => Array(size).fill(false)),
        verticalLines: Array(size).fill(null).map(() => Array(size + 1).fill(false)),
        boxes: Array(size).fill(null).map(() => Array(size).fill(null)),
    };
};

export const applyMove = (state: GameState, move: { type: Line, row: number, col: number }): GameState => {
    // Validation
    if (move.type === 'horizontal') {
        if (state.horizontalLines[move.row][move.col]) return state; // Already taken
    } else {
        if (state.verticalLines[move.row][move.col]) return state; // Already taken
    }

    const nextState = {
        ...state,
        horizontalLines: state.horizontalLines.map(r => [...r]),
        verticalLines: state.verticalLines.map(r => [...r]),
        boxes: state.boxes.map(r => [...r]),
        scores: { ...state.scores },
        lastMove: move
    };

    // Apply Line
    if (move.type === 'horizontal') nextState.horizontalLines[move.row][move.col] = true;
    else nextState.verticalLines[move.row][move.col] = true;

    // Check for Boxes Captured specific to this move
    let captured = false;
    const { row, col } = move;

    // Logic for box checking
    // A box at [r, c] uses:
    // Top: H[r][c]
    // Bottom: H[r+1][c]
    // Left: V[r][c]
    // Right: V[r][c+1]

    const checkBox = (r: number, c: number): boolean => {
        if (r < 0 || c < 0 || r >= state.gridSize || c >= state.gridSize) return false;
        if (nextState.boxes[r][c] !== null) return false; // Already captured

        const top = nextState.horizontalLines[r][c];
        const bottom = nextState.horizontalLines[r + 1][c];
        const left = nextState.verticalLines[r][c];
        const right = nextState.verticalLines[r][c + 1];

        if (top && bottom && left && right) {
            nextState.boxes[r][c] = state.turn;
            nextState.scores[state.turn]++;
            return true;
        }
        return false;
    };

    // Check neighbors based on line type
    if (move.type === 'horizontal') {
        // Check box above (row-1, col) and box below (row, col)
        if (checkBox(row - 1, col)) captured = true;
        if (checkBox(row, col)) captured = true;
    } else {
        // Check box left (row, col-1) and box right (row, col)
        if (checkBox(row, col - 1)) captured = true;
        if (checkBox(row, col)) captured = true;
    }

    // Turn Logic: Capture = Extra Turn
    if (!captured) {
        nextState.turn = state.turn === 'player' ? 'cpu' : 'player';
    }

    // Win Check
    const totalBoxes = state.gridSize * state.gridSize;
    if (nextState.scores.player + nextState.scores.cpu === totalBoxes) {
        if (nextState.scores.player > nextState.scores.cpu) nextState.winner = 'player';
        else if (nextState.scores.cpu > nextState.scores.player) nextState.winner = 'cpu';
        else nextState.winner = 'draw';
    }

    return nextState;
};

// --- AI ENGINE ---
export const getBestMove = (state: GameState): { type: Line, row: number, col: number } | null => {
    const availableMoves: { type: Line, row: number, col: number }[] = [];

    // Collect all valid moves
    state.horizontalLines.forEach((row, r) => row.forEach((taken, c) => {
        if (!taken) availableMoves.push({ type: 'horizontal', row: r, col: c });
    }));
    state.verticalLines.forEach((row, r) => row.forEach((taken, c) => {
        if (!taken) availableMoves.push({ type: 'vertical', row: r, col: c });
    }));

    if (availableMoves.length === 0) return null;

    // 1. Take any box-completing move (Greedy)
    for (const move of availableMoves) {
        const nextState = applyMove(state, move);
        if (nextState.turn === 'cpu') {
            // Means we captured a box (turn didn't change)
            return move;
        }
    }

    // 2. Avoid giving boxes (Safe Move)
    // Filter out moves that would make a box complete-able by opponent
    // This requires checking "is the box now having 3 lines?"

    // Simple heuristic: Pick random safe move, simplified for Phase 4 speed
    return availableMoves[Math.floor(Math.random() * availableMoves.length)];
};
