// ===================== Gomoku Logic (Five in a Row) =====================

export const BOARD_SIZE = 15;
export type CellValue = 'black' | 'white' | null;
export type Player = 'black' | 'white';

export interface GameState {
    board: CellValue[][];
    turn: Player;
    winner: Player | 'draw' | null;
    winLine: [number, number][] | null;
    lastMove: [number, number] | null;
}

export const INITIAL_STATE: GameState = {
    board: Array.from({ length: BOARD_SIZE }, () => Array(BOARD_SIZE).fill(null)),
    turn: 'black',
    winner: null,
    winLine: null,
    lastMove: null,
};

const DIRECTIONS: [number, number][] = [[0, 1], [1, 0], [1, 1], [1, -1]];

function checkWin(board: CellValue[][], row: number, col: number, player: Player): [number, number][] | null {
    for (const [dr, dc] of DIRECTIONS) {
        const line: [number, number][] = [[row, col]];

        // Forward
        for (let i = 1; i < 5; i++) {
            const r = row + dr * i, c = col + dc * i;
            if (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE && board[r][c] === player) {
                line.push([r, c]);
            } else break;
        }

        // Backward
        for (let i = 1; i < 5; i++) {
            const r = row - dr * i, c = col - dc * i;
            if (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE && board[r][c] === player) {
                line.push([r, c]);
            } else break;
        }

        if (line.length >= 5) return line;
    }
    return null;
}

export function applyMove(state: GameState, row: number, col: number): GameState {
    if (state.board[row][col] !== null || state.winner) return state;

    const newBoard = state.board.map(r => [...r]);
    newBoard[row][col] = state.turn;

    const winLine = checkWin(newBoard, row, col, state.turn);
    const isDraw = !winLine && newBoard.every(r => r.every(c => c !== null));

    return {
        board: newBoard,
        turn: state.turn === 'black' ? 'white' : 'black',
        winner: winLine ? state.turn : isDraw ? 'draw' : null,
        winLine: winLine || null,
        lastMove: [row, col],
    };
}

// AI — threat-based scoring
export function getAIMove(state: GameState): [number, number] | null {
    const player = state.turn;
    const opponent = player === 'black' ? 'white' : 'black';
    const board = state.board;

    let bestScore = -1;
    let bestMove: [number, number] | null = null;

    // Only consider cells near existing stones
    const candidates = new Set<string>();
    for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
            if (board[r][c] !== null) {
                for (let dr = -2; dr <= 2; dr++) {
                    for (let dc = -2; dc <= 2; dc++) {
                        const nr = r + dr, nc = c + dc;
                        if (nr >= 0 && nr < BOARD_SIZE && nc >= 0 && nc < BOARD_SIZE && board[nr][nc] === null) {
                            candidates.add(`${nr},${nc}`);
                        }
                    }
                }
            }
        }
    }

    if (candidates.size === 0) return [7, 7]; // Center

    for (const key of candidates) {
        const [r, c] = key.split(',').map(Number);
        let score = 0;

        for (const [dr, dc] of DIRECTIONS) {
            // Score for AI
            score += evaluateLine(board, r, c, dr, dc, player) * 2;
            // Score for blocking opponent
            score += evaluateLine(board, r, c, dr, dc, opponent);
        }

        if (score > bestScore) {
            bestScore = score;
            bestMove = [r, c];
        }
    }

    return bestMove;
}

function evaluateLine(board: CellValue[][], row: number, col: number, dr: number, dc: number, player: Player): number {
    let count = 0;
    let openEnds = 0;

    // Forward
    for (let i = 1; i <= 4; i++) {
        const r = row + dr * i, c = col + dc * i;
        if (r < 0 || r >= BOARD_SIZE || c < 0 || c >= BOARD_SIZE) break;
        if (board[r][c] === player) count++;
        else { if (board[r][c] === null) openEnds++; break; }
    }

    // Backward
    for (let i = 1; i <= 4; i++) {
        const r = row - dr * i, c = col - dc * i;
        if (r < 0 || r >= BOARD_SIZE || c < 0 || c >= BOARD_SIZE) break;
        if (board[r][c] === player) count++;
        else { if (board[r][c] === null) openEnds++; break; }
    }

    if (count >= 4) return 100000;
    if (count === 3 && openEnds === 2) return 10000;
    if (count === 3 && openEnds === 1) return 1000;
    if (count === 2 && openEnds === 2) return 500;
    if (count === 2 && openEnds === 1) return 100;
    if (count === 1 && openEnds === 2) return 10;
    return count;
}
