// ===================== Hex Logic =====================
// 11×11 hex grid, connection-based win condition

export const BOARD_SIZE = 11;
export type Player = 'red' | 'blue';
export type CellValue = Player | null;

export interface GameState {
    board: CellValue[][];
    turn: Player;
    winner: Player | null;
    winPath: [number, number][] | null;
    lastMove: [number, number] | null;
}

export const INITIAL_STATE: GameState = {
    board: Array.from({ length: BOARD_SIZE }, () => Array(BOARD_SIZE).fill(null)),
    turn: 'red',
    winner: null,
    winPath: null,
    lastMove: null,
};

// Hex neighbors (6 directions)
function getNeighbors(r: number, c: number): [number, number][] {
    return [
        [r - 1, c], [r - 1, c + 1],
        [r, c - 1], [r, c + 1],
        [r + 1, c - 1], [r + 1, c],
    ].filter(([nr, nc]) => nr >= 0 && nr < BOARD_SIZE && nc >= 0 && nc < BOARD_SIZE) as [number, number][];
}

// Check if player has connected their two sides
// Red: connect left-right (col 0 to col 10)
// Blue: connect top-bottom (row 0 to row 10)
function checkWin(board: CellValue[][], player: Player): [number, number][] | null {
    const visited = new Set<string>();
    const parent = new Map<string, string>();
    const queue: [number, number][] = [];

    // Start from one edge
    for (let i = 0; i < BOARD_SIZE; i++) {
        const [r, c] = player === 'red' ? [i, 0] : [0, i];
        if (board[r][c] === player) {
            const key = `${r},${c}`;
            queue.push([r, c]);
            visited.add(key);
            parent.set(key, '');
        }
    }

    while (queue.length > 0) {
        const [r, c] = queue.shift()!;

        // Reached other edge?
        if (player === 'red' && c === BOARD_SIZE - 1) {
            // Trace path
            const path: [number, number][] = [];
            let key = `${r},${c}`;
            while (key) {
                const [pr, pc] = key.split(',').map(Number);
                path.push([pr, pc]);
                key = parent.get(key)!;
            }
            return path;
        }
        if (player === 'blue' && r === BOARD_SIZE - 1) {
            const path: [number, number][] = [];
            let key = `${r},${c}`;
            while (key) {
                const [pr, pc] = key.split(',').map(Number);
                path.push([pr, pc]);
                key = parent.get(key)!;
            }
            return path;
        }

        for (const [nr, nc] of getNeighbors(r, c)) {
            const nkey = `${nr},${nc}`;
            if (!visited.has(nkey) && board[nr][nc] === player) {
                visited.add(nkey);
                parent.set(nkey, `${r},${c}`);
                queue.push([nr, nc]);
            }
        }
    }

    return null;
}

export function applyMove(state: GameState, row: number, col: number): GameState {
    if (state.board[row][col] !== null || state.winner) return state;

    const newBoard = state.board.map(r => [...r]);
    newBoard[row][col] = state.turn;

    const winPath = checkWin(newBoard, state.turn);

    return {
        board: newBoard,
        turn: state.turn === 'red' ? 'blue' : 'red',
        winner: winPath ? state.turn : null,
        winPath: winPath || null,
        lastMove: [row, col],
    };
}

// AI — simple with bridge/connection priority
export function getAIMove(state: GameState): [number, number] | null {
    const player = state.turn;
    const opponent = player === 'red' ? 'blue' : 'red';

    let bestScore = -Infinity;
    let bestMove: [number, number] | null = null;

    for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
            if (state.board[r][c] !== null) continue;

            let score = 0;

            // Connectivity: count friendly neighbors
            for (const [nr, nc] of getNeighbors(r, c)) {
                if (state.board[nr][nc] === player) score += 10;
                if (state.board[nr][nc] === opponent) score += 5; // Block
            }

            // Prefer center
            const centerDist = Math.abs(r - 5) + Math.abs(c - 5);
            score += (10 - centerDist);

            // Prefer advancing toward goal
            if (player === 'red') score += c * 2;
            else score += r * 2;

            if (score > bestScore) {
                bestScore = score;
                bestMove = [r, c];
            }
        }
    }

    return bestMove;
}
