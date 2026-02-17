// ===================== Chinese Checkers Logic (2-player) =====================
// Simplified star board mapped to a hex grid (121 cells total)

export type Player = 'red' | 'blue';
export type CellValue = Player | null | 'blocked';

// Use a 17-row diamond grid approach
// Each cell identified by (row, col)
export interface Pos { row: number; col: number; }

export interface GameState {
    board: Map<string, CellValue>;
    turn: Player;
    winner: Player | null;
    selectedPiece: Pos | null;
    validMoves: Pos[];
}

const key = (p: Pos) => `${p.row},${p.col}`;
const parseKey = (k: string): Pos => {
    const [row, col] = k.split(',').map(Number);
    return { row, col };
};

// Define the star board as a set of valid positions
// Using a simplified 2-player triangle layout (top vs bottom)
// Board is a diamond: rows 0-16, with varying column widths
function getValidPositions(): Set<string> {
    const positions = new Set<string>();

    // Top triangle (rows 0-3) — player 1 home
    for (let r = 0; r <= 3; r++) {
        const width = r + 1;
        const startCol = 6 - r;
        for (let c = 0; c < width; c++) {
            positions.add(key({ row: r, col: startCol + c * 2 }));
        }
    }

    // Middle section (rows 4-12) — shared
    const midWidths = [10, 11, 12, 13, 12, 11, 10, 9, 10];
    const midStarts = [1, 0, -1, -2, -1, 0, 1, 2, 1];
    for (let i = 0; i < 9; i++) {
        const r = 4 + i;
        const width = Math.min(midWidths[i], 13);
        const startCol = Math.max(midStarts[i], -2);
        for (let c = 0; c < width; c++) {
            positions.add(key({ row: r, col: startCol + c }));
        }
    }

    // Bottom triangle (rows 13-16) — player 2 home
    for (let r = 0; r <= 3; r++) {
        const actualRow = 16 - r;
        const width = r + 1;
        const startCol = 6 - r;
        for (let c = 0; c < width; c++) {
            positions.add(key({ row: actualRow, col: startCol + c * 2 }));
        }
    }

    return positions;
}

// Simplified: use a smaller triangular board for playability
// 10-cell equilateral triangle top (red) and bottom (blue)
// with a hexagonal middle area

function createSimpleBoard(): { board: Map<string, CellValue>; redHome: string[]; blueHome: string[] } {
    const board = new Map<string, CellValue>();
    const redHome: string[] = [];
    const blueHome: string[] = [];

    // Simple playfield: 5 rows, each with increasing cells
    // Top triangle (red start) — rows 0-3
    const topRows = [
        [6],
        [5, 7],
        [4, 6, 8],
        [3, 5, 7, 9],
    ];

    for (let r = 0; r < topRows.length; r++) {
        for (const c of topRows[r]) {
            const k = key({ row: r, col: c });
            board.set(k, 'red');
            redHome.push(k);
        }
    }

    // Middle (rows 4-8) — empty
    const midRows = [
        [2, 4, 6, 8, 10],
        [1, 3, 5, 7, 9, 11],
        [2, 4, 6, 8, 10],
        [1, 3, 5, 7, 9, 11],
        [2, 4, 6, 8, 10],
    ];

    for (let i = 0; i < midRows.length; i++) {
        for (const c of midRows[i]) {
            board.set(key({ row: 4 + i, col: c }), null);
        }
    }

    // Bottom triangle (blue start) — rows 9-12
    const bottomRows = [
        [3, 5, 7, 9],
        [4, 6, 8],
        [5, 7],
        [6],
    ];

    for (let r = 0; r < bottomRows.length; r++) {
        for (const c of bottomRows[r]) {
            const k = key({ row: 9 + r, col: c });
            board.set(k, 'blue');
            blueHome.push(k);
        }
    }

    return { board, redHome, blueHome };
}

// Target zones (red aims for bottom, blue aims for top)
const RED_TARGET = [
    key({ row: 9, col: 3 }), key({ row: 9, col: 5 }), key({ row: 9, col: 7 }), key({ row: 9, col: 9 }),
    key({ row: 10, col: 4 }), key({ row: 10, col: 6 }), key({ row: 10, col: 8 }),
    key({ row: 11, col: 5 }), key({ row: 11, col: 7 }),
    key({ row: 12, col: 6 }),
];

const BLUE_TARGET = [
    key({ row: 0, col: 6 }),
    key({ row: 1, col: 5 }), key({ row: 1, col: 7 }),
    key({ row: 2, col: 4 }), key({ row: 2, col: 6 }), key({ row: 2, col: 8 }),
    key({ row: 3, col: 3 }), key({ row: 3, col: 5 }), key({ row: 3, col: 7 }), key({ row: 3, col: 9 }),
];

export function initializeGame(): GameState {
    const { board } = createSimpleBoard();

    return {
        board,
        turn: 'red',
        winner: null,
        selectedPiece: null,
        validMoves: [],
    };
}

// 6 hex directions (for even/odd row offset)
const ADJACENTS: Pos[] = [
    { row: -1, col: -1 }, { row: -1, col: 1 },
    { row: 0, col: -2 }, { row: 0, col: 2 },
    { row: 1, col: -1 }, { row: 1, col: 1 },
];

function getValidMoves(board: Map<string, CellValue>, pos: Pos): Pos[] {
    const moves: Pos[] = [];
    const visited = new Set<string>();

    // Step moves
    for (const d of ADJACENTS) {
        const next: Pos = { row: pos.row + d.row, col: pos.col + d.col };
        const nk = key(next);
        if (board.has(nk) && board.get(nk) === null) {
            moves.push(next);
        }
    }

    // Hop moves (BFS)
    const queue: Pos[] = [pos];
    visited.add(key(pos));

    while (queue.length > 0) {
        const curr = queue.shift()!;
        for (const d of ADJACENTS) {
            const mid: Pos = { row: curr.row + d.row, col: curr.col + d.col };
            const hop: Pos = { row: curr.row + d.row * 2, col: curr.col + d.col * 2 };
            const mk = key(mid);
            const hk = key(hop);

            if (board.has(mk) && board.get(mk) !== null && board.get(mk) !== 'blocked' &&
                board.has(hk) && board.get(hk) === null && !visited.has(hk)) {
                visited.add(hk);
                moves.push(hop);
                queue.push(hop);
            }
        }
    }

    return moves;
}

export function selectPiece(state: GameState, pos: Pos): GameState {
    if (state.winner) return state;
    const k = key(pos);
    if (state.board.get(k) !== state.turn) return state;

    const validMoves = getValidMoves(state.board, pos);
    return { ...state, selectedPiece: pos, validMoves };
}

export function movePiece(state: GameState, to: Pos): GameState {
    if (!state.selectedPiece || state.winner) return state;

    const toKey = key(to);
    if (!state.validMoves.some(m => key(m) === toKey)) return state;

    const newBoard = new Map(state.board);
    const fromKey = key(state.selectedPiece);
    const piece = newBoard.get(fromKey)!;
    newBoard.set(fromKey, null);
    newBoard.set(toKey, piece);

    const nextTurn = state.turn === 'red' ? 'blue' : 'red';

    // Check win
    const targets = state.turn === 'red' ? RED_TARGET : BLUE_TARGET;
    const won = targets.every(tk => newBoard.get(tk) === state.turn);

    return {
        board: newBoard,
        turn: won ? state.turn : nextTurn,
        winner: won ? state.turn : null,
        selectedPiece: null,
        validMoves: [],
    };
}

// Simple AI: move piece closest to target
export function getAIMove(state: GameState): { from: Pos; to: Pos } | null {
    const player = state.turn;
    const targets = player === 'red' ? RED_TARGET : BLUE_TARGET;

    let bestMove: { from: Pos; to: Pos } | null = null;
    let bestImprovement = -Infinity;

    for (const [k, v] of state.board) {
        if (v !== player) continue;
        const pos = parseKey(k);
        const moves = getValidMoves(state.board, pos);

        const targetCenter = player === 'red' ? { row: 10.5, col: 6 } : { row: 2.5, col: 6 };

        const currentDist = Math.abs(pos.row - targetCenter.row) + Math.abs(pos.col - targetCenter.col) * 0.5;

        for (const move of moves) {
            const newDist = Math.abs(move.row - targetCenter.row) + Math.abs(move.col - targetCenter.col) * 0.5;
            const improvement = currentDist - newDist;

            if (improvement > bestImprovement) {
                bestImprovement = improvement;
                bestMove = { from: pos, to: move };
            }
        }
    }

    return bestMove;
}

// Export helpers for rendering
export { key, parseKey };
export type { Pos as Position };
