// ===================== Stratego Logic (Simplified) =====================
// 8×8 board, simplified piece set, hidden pieces, combat resolution

export const BOARD_SIZE = 8;
export type Player = 'red' | 'blue';

export interface Piece {
    rank: number; // Higher rank wins combat
    name: string;
    player: Player;
    revealed: boolean;
}

export type CellValue = Piece | 'water' | null;

export interface GameState {
    board: CellValue[][];
    turn: Player;
    winner: Player | null;
    message: string;
    lastCombat: { attacker: string; defender: string; result: 'win' | 'lose' | 'draw' } | null;
}

const PIECE_SET = [
    { rank: 10, name: 'Marshal', count: 1 },
    { rank: 9, name: 'General', count: 1 },
    { rank: 7, name: 'Colonel', count: 1 },
    { rank: 6, name: 'Major', count: 2 },
    { rank: 5, name: 'Captain', count: 2 },
    { rank: 4, name: 'Lieutenant', count: 2 },
    { rank: 3, name: 'Sergeant', count: 2 },
    { rank: 2, name: 'Miner', count: 2 },
    { rank: 1, name: 'Spy', count: 1 },
    { rank: 0, name: 'Flag', count: 1 },
    { rank: -1, name: 'Bomb', count: 1 },
];

function createPiecePool(player: Player): Piece[] {
    const pieces: Piece[] = [];
    for (const config of PIECE_SET) {
        for (let i = 0; i < config.count; i++) {
            pieces.push({ rank: config.rank, name: config.name, player, revealed: false });
        }
    }
    return pieces;
}

function shuffle<T>(arr: T[]): T[] {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

export function initializeGame(): GameState {
    const board: CellValue[][] = Array.from({ length: BOARD_SIZE }, () => Array(BOARD_SIZE).fill(null));

    // Place water in the middle (rows 3-4, cols 2-3 and 4-5)
    board[3][2] = 'water'; board[3][3] = 'water';
    board[4][2] = 'water'; board[4][3] = 'water';
    board[3][5] = 'water'; board[3][6] = 'water';
    board[4][5] = 'water'; board[4][6] = 'water';

    // Place red pieces (rows 6-7) — player
    const redPieces = shuffle(createPiecePool('red'));
    let idx = 0;
    for (let r = 6; r <= 7; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
            if (idx < redPieces.length) {
                board[r][c] = { ...redPieces[idx], revealed: true }; // Player can see their own
                idx++;
            }
        }
    }

    // Place blue pieces (rows 0-1) — CPU, hidden
    const bluePieces = shuffle(createPiecePool('blue'));
    idx = 0;
    for (let r = 0; r <= 1; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
            if (idx < bluePieces.length) {
                board[r][c] = { ...bluePieces[idx], revealed: false };
                idx++;
            }
        }
    }

    return {
        board,
        turn: 'red',
        winner: null,
        message: 'Select a piece to move',
        lastCombat: null,
    };
}

function isPiece(cell: CellValue): cell is Piece {
    return cell !== null && cell !== 'water';
}

function canMove(piece: Piece): boolean {
    return piece.rank !== -1 && piece.rank !== 0; // Bombs and flags can't move
}

export function getValidMoves(state: GameState, row: number, col: number): [number, number][] {
    const cell = state.board[row][col];
    if (!isPiece(cell) || cell.player !== state.turn || !canMove(cell)) return [];

    const moves: [number, number][] = [];
    const dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];

    for (const [dr, dc] of dirs) {
        const nr = row + dr;
        const nc = col + dc;
        if (nr < 0 || nr >= BOARD_SIZE || nc < 0 || nc >= BOARD_SIZE) continue;

        const target = state.board[nr][nc];
        if (target === 'water') continue;
        if (isPiece(target) && target.player === cell.player) continue;

        moves.push([nr, nc]);
    }

    return moves;
}

function resolveCombat(attacker: Piece, defender: Piece): 'win' | 'lose' | 'draw' {
    // Special: Spy kills Marshal
    if (attacker.rank === 1 && defender.rank === 10) return 'win';
    // Special: Miner defuses Bomb
    if (attacker.rank === 2 && defender.rank === -1) return 'win';
    // Bomb kills anyone (except Miner)
    if (defender.rank === -1) return 'lose';
    // Flag is captured
    if (defender.rank === 0) return 'win';

    if (attacker.rank > defender.rank) return 'win';
    if (attacker.rank < defender.rank) return 'lose';
    return 'draw';
}

export function movePiece(state: GameState, fromR: number, fromC: number, toR: number, toC: number): GameState {
    if (state.winner) return state;

    const validMoves = getValidMoves(state, fromR, fromC);
    if (!validMoves.some(([r, c]) => r === toR && c === toC)) return state;

    const newBoard = state.board.map(r => [...r]);
    const attacker = newBoard[fromR][fromC] as Piece;
    const target = newBoard[toR][toC];
    let message = '';
    let lastCombat = null;
    let winner: Player | null = null;

    if (isPiece(target)) {
        // Combat!
        const result = resolveCombat(attacker, target);
        const revealedDefender = { ...target, revealed: true };
        lastCombat = { attacker: attacker.name, defender: target.name, result };

        if (result === 'win') {
            if (target.rank === 0) winner = attacker.player; // Captured flag
            newBoard[toR][toC] = { ...attacker, revealed: true };
            newBoard[fromR][fromC] = null;
            message = `${attacker.name} defeats ${target.name}!`;
        } else if (result === 'lose') {
            newBoard[fromR][fromC] = null;
            newBoard[toR][toC] = revealedDefender;
            message = `${attacker.name} falls to ${target.name}!`;
        } else {
            newBoard[fromR][fromC] = null;
            newBoard[toR][toC] = null;
            message = `${attacker.name} and ${target.name} destroy each other!`;
        }
    } else {
        // Simple move
        newBoard[toR][toC] = attacker;
        newBoard[fromR][fromC] = null;
        message = '';
    }

    const nextTurn = state.turn === 'red' ? 'blue' : 'red';

    return {
        board: newBoard,
        turn: winner ? state.turn : nextTurn,
        winner,
        message: winner ? `${winner === 'red' ? 'You' : 'CPU'} captured the flag!` : message,
        lastCombat,
    };
}

// AI: move a random movable piece toward opponent
export function getAIMove(state: GameState): { from: [number, number]; to: [number, number] } | null {
    const moves: { from: [number, number]; to: [number, number]; score: number }[] = [];

    for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
            const cell = state.board[r][c];
            if (!isPiece(cell) || cell.player !== state.turn) continue;

            const validMoves = getValidMoves(state, r, c);
            for (const [tr, tc] of validMoves) {
                let score = 0;
                const target = state.board[tr][tc];

                // Prefer attacking
                if (isPiece(target) && target.player !== cell.player) score += 10;

                // Move toward opponent side
                if (state.turn === 'blue') score += tr; // Blue moves toward row 7
                else score += (BOARD_SIZE - 1 - tr);

                // Add randomness
                score += Math.random() * 3;

                moves.push({ from: [r, c], to: [tr, tc], score });
            }
        }
    }

    if (moves.length === 0) return null;
    moves.sort((a, b) => b.score - a.score);
    return { from: moves[0].from, to: moves[0].to };
}
