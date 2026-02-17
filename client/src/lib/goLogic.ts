// ===================== Go Logic (9×9) =====================
// Simplified Go with capture, ko rule, scoring

export const BOARD_SIZE = 9;
export type Player = 'black' | 'white';
export type CellValue = Player | null;

export interface GameState {
    board: CellValue[][];
    turn: Player;
    captures: { black: number; white: number };
    winner: Player | 'draw' | null;
    lastMove: [number, number] | null;
    prevBoard: string | null; // For ko rule
    consecutivePasses: number;
    phase: 'playing' | 'gameover';
}

export const INITIAL_STATE: GameState = {
    board: Array.from({ length: BOARD_SIZE }, () => Array(BOARD_SIZE).fill(null)),
    turn: 'black',
    captures: { black: 0, white: 0 },
    winner: null,
    lastMove: null,
    prevBoard: null,
    consecutivePasses: 0,
    phase: 'playing',
};

function getNeighbors(r: number, c: number): [number, number][] {
    return [
        [r - 1, c], [r + 1, c], [r, c - 1], [r, c + 1],
    ].filter(([nr, nc]) => nr >= 0 && nr < BOARD_SIZE && nc >= 0 && nc < BOARD_SIZE) as [number, number][];
}

function getGroup(board: CellValue[][], r: number, c: number): { stones: [number, number][]; liberties: Set<string> } {
    const player = board[r][c];
    if (!player) return { stones: [], liberties: new Set() };

    const visited = new Set<string>();
    const stones: [number, number][] = [];
    const liberties = new Set<string>();
    const queue: [number, number][] = [[r, c]];
    visited.add(`${r},${c}`);

    while (queue.length > 0) {
        const [cr, cc] = queue.shift()!;
        stones.push([cr, cc]);

        for (const [nr, nc] of getNeighbors(cr, cc)) {
            const key = `${nr},${nc}`;
            if (visited.has(key)) continue;

            if (board[nr][nc] === null) {
                liberties.add(key);
            } else if (board[nr][nc] === player) {
                visited.add(key);
                queue.push([nr, nc]);
            }
        }
    }

    return { stones, liberties };
}

function boardToString(board: CellValue[][]): string {
    return board.map(r => r.map(c => c === 'black' ? 'B' : c === 'white' ? 'W' : '.').join('')).join('');
}

export function applyMove(state: GameState, row: number, col: number): GameState {
    if (state.board[row][col] !== null || state.phase !== 'playing') return state;

    const newBoard = state.board.map(r => [...r]);
    newBoard[row][col] = state.turn;

    const opponent = state.turn === 'black' ? 'white' : 'black';
    let captures = 0;

    // Check captures of opponent groups
    for (const [nr, nc] of getNeighbors(row, col)) {
        if (newBoard[nr][nc] === opponent) {
            const group = getGroup(newBoard, nr, nc);
            if (group.liberties.size === 0) {
                captures += group.stones.length;
                for (const [sr, sc] of group.stones) {
                    newBoard[sr][sc] = null;
                }
            }
        }
    }

    // Check self-capture (suicide) — not allowed
    const selfGroup = getGroup(newBoard, row, col);
    if (selfGroup.liberties.size === 0 && captures === 0) {
        return state; // Illegal move
    }

    // Ko rule
    const boardStr = boardToString(newBoard);
    if (boardStr === state.prevBoard) {
        return state; // Ko violation
    }

    const newCaptures = {
        ...state.captures,
        [state.turn]: state.captures[state.turn] + captures,
    };

    return {
        board: newBoard,
        turn: opponent,
        captures: newCaptures,
        winner: null,
        lastMove: [row, col],
        prevBoard: boardToString(state.board),
        consecutivePasses: 0,
        phase: 'playing',
    };
}

export function pass(state: GameState): GameState {
    const passes = state.consecutivePasses + 1;
    const opponent = state.turn === 'black' ? 'white' : 'black';

    if (passes >= 2) {
        // Game over — count territory
        const scores = calculateScores(state.board, state.captures);
        const winner: Player | 'draw' = scores.black > scores.white ? 'black' :
            scores.white > scores.black ? 'white' : 'draw';

        return {
            ...state,
            turn: opponent,
            consecutivePasses: passes,
            phase: 'gameover',
            winner,
        };
    }

    return {
        ...state,
        turn: opponent,
        consecutivePasses: passes,
        lastMove: null,
    };
}

function calculateScores(board: CellValue[][], captures: { black: number; white: number }): { black: number; white: number } {
    const visited = new Set<string>();
    let blackTerritory = 0;
    let whiteTerritory = 0;

    // Count stones
    let blackStones = 0, whiteStones = 0;
    for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
            if (board[r][c] === 'black') blackStones++;
            if (board[r][c] === 'white') whiteStones++;
        }
    }

    // Territory counting (simplified — flood fill from empty cells)
    for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
            if (board[r][c] !== null || visited.has(`${r},${c}`)) continue;

            const territory: [number, number][] = [];
            const borders = new Set<Player>();
            const queue: [number, number][] = [[r, c]];
            visited.add(`${r},${c}`);

            while (queue.length > 0) {
                const [cr, cc] = queue.shift()!;
                territory.push([cr, cc]);

                for (const [nr, nc] of getNeighbors(cr, cc)) {
                    const key = `${nr},${nc}`;
                    if (visited.has(key)) continue;

                    if (board[nr][nc] === null) {
                        visited.add(key);
                        queue.push([nr, nc]);
                    } else {
                        borders.add(board[nr][nc]!);
                    }
                }
            }

            if (borders.size === 1) {
                const owner = [...borders][0];
                if (owner === 'black') blackTerritory += territory.length;
                else whiteTerritory += territory.length;
            }
        }
    }

    return {
        black: blackStones + blackTerritory + captures.black,
        white: whiteStones + whiteTerritory + captures.white + 6.5, // Komi
    };
}

export function getScores(state: GameState): { black: number; white: number } {
    return calculateScores(state.board, state.captures);
}

// AI: simple — play on highest-liberty empty cell near existing stones
export function getAIMove(state: GameState): [number, number] | 'pass' {
    const player = state.turn;
    let bestScore = -1;
    let bestMove: [number, number] | null = null;

    for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
            if (state.board[r][c] !== null) continue;

            // Simulate move
            const testBoard = state.board.map(row => [...row]);
            testBoard[r][c] = player;

            // Check if it's legal
            const group = getGroup(testBoard, r, c);
            let captureCount = 0;
            const opponent = player === 'black' ? 'white' : 'black';

            for (const [nr, nc] of getNeighbors(r, c)) {
                if (testBoard[nr][nc] === opponent) {
                    const oppGroup = getGroup(testBoard, nr, nc);
                    if (oppGroup.liberties.size === 0) captureCount += oppGroup.stones.length;
                }
            }

            if (group.liberties.size === 0 && captureCount === 0) continue; // Suicide

            let score = group.liberties.size + captureCount * 5;

            // Prefer center
            const centerDist = Math.abs(r - 4) + Math.abs(c - 4);
            score += (8 - centerDist);

            // Prefer near own stones
            for (const [nr, nc] of getNeighbors(r, c)) {
                if (state.board[nr][nc] === player) score += 3;
            }

            score += Math.random() * 2;

            if (score > bestScore) {
                bestScore = score;
                bestMove = [r, c];
            }
        }
    }

    return bestMove || 'pass';
}
