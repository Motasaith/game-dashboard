// ===================== Tic-Tac-Toe Logic =====================

export type CellValue = 'X' | 'O' | null;
export type Player = 'X' | 'O';

export interface GameState {
    board: CellValue[];
    turn: Player;
    winner: Player | 'draw' | null;
    winLine: number[] | null;
}

export const INITIAL_STATE: GameState = {
    board: Array(9).fill(null),
    turn: 'X',
    winner: null,
    winLine: null,
};

const WIN_LINES = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // cols
    [0, 4, 8], [2, 4, 6],            // diagonals
];

function checkWinner(board: CellValue[]): { winner: Player | 'draw' | null; winLine: number[] | null } {
    for (const line of WIN_LINES) {
        const [a, b, c] = line;
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            return { winner: board[a] as Player, winLine: line };
        }
    }
    if (board.every(cell => cell !== null)) {
        return { winner: 'draw', winLine: null };
    }
    return { winner: null, winLine: null };
}

export function applyMove(state: GameState, index: number): GameState {
    if (state.board[index] !== null || state.winner) return state;

    const newBoard = [...state.board];
    newBoard[index] = state.turn;

    const { winner, winLine } = checkWinner(newBoard);

    return {
        board: newBoard,
        turn: state.turn === 'X' ? 'O' : 'X',
        winner,
        winLine,
    };
}

// Minimax AI for O
function minimax(board: CellValue[], isMaximizing: boolean, depth: number): number {
    const { winner } = checkWinner(board);
    if (winner === 'O') return 10 - depth;
    if (winner === 'X') return depth - 10;
    if (winner === 'draw') return 0;

    if (isMaximizing) {
        let best = -Infinity;
        for (let i = 0; i < 9; i++) {
            if (board[i] === null) {
                board[i] = 'O';
                best = Math.max(best, minimax(board, false, depth + 1));
                board[i] = null;
            }
        }
        return best;
    } else {
        let best = Infinity;
        for (let i = 0; i < 9; i++) {
            if (board[i] === null) {
                board[i] = 'X';
                best = Math.min(best, minimax(board, true, depth + 1));
                board[i] = null;
            }
        }
        return best;
    }
}

export function getBestMove(state: GameState): number {
    let bestScore = -Infinity;
    let bestMove = -1;
    const board = [...state.board];

    for (let i = 0; i < 9; i++) {
        if (board[i] === null) {
            board[i] = 'O';
            const score = minimax(board, false, 0);
            board[i] = null;
            if (score > bestScore) {
                bestScore = score;
                bestMove = i;
            }
        }
    }
    return bestMove;
}
