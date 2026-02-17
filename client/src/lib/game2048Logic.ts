// ===================== 2048 Game Logic =====================

export interface GameState {
    board: number[][];
    score: number;
    bestScore: number;
    gameOver: boolean;
    won: boolean;
}

function createEmptyBoard(): number[][] {
    return Array.from({ length: 4 }, () => Array(4).fill(0));
}

function addRandomTile(board: number[][]): number[][] {
    const empty: [number, number][] = [];
    for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 4; c++) {
            if (board[r][c] === 0) empty.push([r, c]);
        }
    }
    if (empty.length === 0) return board;

    const [row, col] = empty[Math.floor(Math.random() * empty.length)];
    const newBoard = board.map(r => [...r]);
    newBoard[row][col] = Math.random() < 0.9 ? 2 : 4;
    return newBoard;
}

export function initializeGame(): GameState {
    let board = createEmptyBoard();
    board = addRandomTile(board);
    board = addRandomTile(board);
    return { board, score: 0, bestScore: 0, gameOver: false, won: false };
}

function slideRow(row: number[]): { newRow: number[]; points: number } {
    // Remove zeros
    let tiles = row.filter(v => v !== 0);
    let points = 0;

    // Merge
    for (let i = 0; i < tiles.length - 1; i++) {
        if (tiles[i] === tiles[i + 1]) {
            tiles[i] *= 2;
            points += tiles[i];
            tiles.splice(i + 1, 1);
        }
    }

    // Pad with zeros
    while (tiles.length < 4) tiles.push(0);

    return { newRow: tiles, points };
}

function rotateBoard(board: number[][]): number[][] {
    const n = board.length;
    const result = createEmptyBoard();
    for (let r = 0; r < n; r++) {
        for (let c = 0; c < n; c++) {
            result[c][n - 1 - r] = board[r][c];
        }
    }
    return result;
}

function boardsEqual(a: number[][], b: number[][]): boolean {
    for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 4; c++) {
            if (a[r][c] !== b[r][c]) return false;
        }
    }
    return true;
}

function canMove(board: number[][]): boolean {
    for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 4; c++) {
            if (board[r][c] === 0) return true;
            if (c < 3 && board[r][c] === board[r][c + 1]) return true;
            if (r < 3 && board[r][c] === board[r + 1][c]) return true;
        }
    }
    return false;
}

function hasWon(board: number[][]): boolean {
    return board.some(row => row.some(cell => cell >= 2048));
}

export type Direction = 'up' | 'down' | 'left' | 'right';

export function move(state: GameState, direction: Direction): GameState {
    if (state.gameOver) return state;

    let board = state.board.map(r => [...r]);
    let totalPoints = 0;

    // Normalize to "slide left"
    let rotations = 0;
    if (direction === 'right') rotations = 2;
    if (direction === 'up') rotations = 1;
    if (direction === 'down') rotations = 3;

    for (let i = 0; i < rotations; i++) board = rotateBoard(board);

    // Slide each row left
    for (let r = 0; r < 4; r++) {
        const { newRow, points } = slideRow(board[r]);
        board[r] = newRow;
        totalPoints += points;
    }

    // Rotate back
    for (let i = 0; i < (4 - rotations) % 4; i++) board = rotateBoard(board);

    // If nothing moved, no-op
    if (boardsEqual(state.board, board)) return state;

    // Add random tile
    board = addRandomTile(board);

    const newScore = state.score + totalPoints;
    const won = hasWon(board);
    const gameOver = !canMove(board);

    return {
        board,
        score: newScore,
        bestScore: Math.max(newScore, state.bestScore),
        gameOver,
        won: state.won || won,
    };
}

// Color scheme for tiles
export function getTileColor(value: number): { bg: string; text: string } {
    const colors: Record<number, { bg: string; text: string }> = {
        0: { bg: 'bg-slate-800/50', text: 'text-transparent' },
        2: { bg: 'bg-slate-700', text: 'text-slate-200' },
        4: { bg: 'bg-slate-600', text: 'text-slate-100' },
        8: { bg: 'bg-orange-600', text: 'text-white' },
        16: { bg: 'bg-orange-500', text: 'text-white' },
        32: { bg: 'bg-red-500', text: 'text-white' },
        64: { bg: 'bg-red-600', text: 'text-white' },
        128: { bg: 'bg-yellow-500', text: 'text-white' },
        256: { bg: 'bg-yellow-400', text: 'text-slate-900' },
        512: { bg: 'bg-yellow-300', text: 'text-slate-900' },
        1024: { bg: 'bg-amber-400', text: 'text-slate-900' },
        2048: { bg: 'bg-cyan-500', text: 'text-white' },
    };
    return colors[value] || { bg: 'bg-purple-600', text: 'text-white' };
}
