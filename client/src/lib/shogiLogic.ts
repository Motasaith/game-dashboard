// ===================== Shogi Logic (Simplified) =====================
// 9×9 board, standard pieces, capture & drop, promotion

export const BOARD_SIZE = 9;
export type Player = 'sente' | 'gote'; // sente = player (moves up), gote = CPU (moves down)

export interface Piece {
    type: PieceType;
    player: Player;
    promoted: boolean;
}

export type PieceType = 'king' | 'rook' | 'bishop' | 'gold' | 'silver' | 'knight' | 'lance' | 'pawn';
export type CellValue = Piece | null;

export interface GameState {
    board: CellValue[][];
    turn: Player;
    winner: Player | null;
    hand: { sente: PieceType[]; gote: PieceType[] };
    selectedCell: [number, number] | null;
    selectedHand: PieceType | null;
    validMoves: [number, number][];
    inCheck: boolean;
    message: string;
}

const PIECE_LABELS: Record<PieceType, string> = {
    king: '王', rook: '飛', bishop: '角', gold: '金',
    silver: '銀', knight: '桂', lance: '香', pawn: '歩',
};

const PROMOTED_LABELS: Record<PieceType, string> = {
    king: '王', rook: '龍', bishop: '馬', gold: '金',
    silver: '全', knight: '圭', lance: '杏', pawn: 'と',
};

export { PIECE_LABELS, PROMOTED_LABELS };

export function initializeGame(): GameState {
    const board: CellValue[][] = Array.from({ length: BOARD_SIZE }, () => Array(BOARD_SIZE).fill(null));

    // Gote (CPU) pieces — top of board
    board[0][0] = { type: 'lance', player: 'gote', promoted: false };
    board[0][1] = { type: 'knight', player: 'gote', promoted: false };
    board[0][2] = { type: 'silver', player: 'gote', promoted: false };
    board[0][3] = { type: 'gold', player: 'gote', promoted: false };
    board[0][4] = { type: 'king', player: 'gote', promoted: false };
    board[0][5] = { type: 'gold', player: 'gote', promoted: false };
    board[0][6] = { type: 'silver', player: 'gote', promoted: false };
    board[0][7] = { type: 'knight', player: 'gote', promoted: false };
    board[0][8] = { type: 'lance', player: 'gote', promoted: false };
    board[1][1] = { type: 'rook', player: 'gote', promoted: false };
    board[1][7] = { type: 'bishop', player: 'gote', promoted: false };
    for (let c = 0; c < 9; c++) {
        board[2][c] = { type: 'pawn', player: 'gote', promoted: false };
    }

    // Sente (Player) pieces — bottom of board
    board[8][0] = { type: 'lance', player: 'sente', promoted: false };
    board[8][1] = { type: 'knight', player: 'sente', promoted: false };
    board[8][2] = { type: 'silver', player: 'sente', promoted: false };
    board[8][3] = { type: 'gold', player: 'sente', promoted: false };
    board[8][4] = { type: 'king', player: 'sente', promoted: false };
    board[8][5] = { type: 'gold', player: 'sente', promoted: false };
    board[8][6] = { type: 'silver', player: 'sente', promoted: false };
    board[8][7] = { type: 'knight', player: 'sente', promoted: false };
    board[8][8] = { type: 'lance', player: 'sente', promoted: false };
    board[7][7] = { type: 'rook', player: 'sente', promoted: false };
    board[7][1] = { type: 'bishop', player: 'sente', promoted: false };
    for (let c = 0; c < 9; c++) {
        board[6][c] = { type: 'pawn', player: 'sente', promoted: false };
    }

    return {
        board,
        turn: 'sente',
        winner: null,
        hand: { sente: [], gote: [] },
        selectedCell: null,
        selectedHand: null,
        validMoves: [],
        inCheck: false,
        message: 'Your turn',
    };
}

function getMoveDirections(piece: Piece): [number, number][] {
    const dir = piece.player === 'sente' ? -1 : 1; // sente moves up (row decreases)

    if (piece.promoted) {
        if (piece.type === 'rook') return [[0, 1], [0, -1], [1, 0], [-1, 0], [1, 1], [1, -1], [-1, 1], [-1, -1]]; // Dragon
        if (piece.type === 'bishop') return [[1, 1], [1, -1], [-1, 1], [-1, -1], [0, 1], [0, -1], [1, 0], [-1, 0]]; // Horse
        // Promoted silver/knight/lance/pawn move like gold
        return [[dir, 0], [0, 1], [0, -1], [-dir, 0], [dir, 1], [dir, -1]];
    }

    switch (piece.type) {
        case 'king': return [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]];
        case 'gold': return [[dir, 0], [0, 1], [0, -1], [-dir, 0], [dir, 1], [dir, -1]];
        case 'silver': return [[dir, 0], [dir, 1], [dir, -1], [-dir, 1], [-dir, -1]];
        case 'knight': return [[dir * 2, -1], [dir * 2, 1]];
        case 'pawn': return [[dir, 0]];
        case 'lance': return [[dir, 0]]; // Will handle as sliding
        case 'rook': return [[0, 1], [0, -1], [1, 0], [-1, 0]]; // Sliding
        case 'bishop': return [[1, 1], [1, -1], [-1, 1], [-1, -1]]; // Sliding
        default: return [];
    }
}

function isSliding(piece: Piece): boolean {
    if (piece.promoted && (piece.type === 'rook' || piece.type === 'bishop')) return true;
    return ['rook', 'bishop', 'lance'].includes(piece.type) && !piece.promoted;
}

export function getValidMovesForPiece(board: CellValue[][], row: number, col: number): [number, number][] {
    const piece = board[row][col];
    if (!piece) return [];

    const moves: [number, number][] = [];
    const directions = getMoveDirections(piece);

    if (isSliding(piece)) {
        // Rook/bishop/lance slide, but promoted rook/bishop also have single-step diag/ortho
        const slideCount = piece.promoted ? 4 : directions.length; // First N are sliding dirs
        for (let d = 0; d < directions.length; d++) {
            const [dr, dc] = directions[d];
            const maxDist = (piece.promoted && d >= 4) ? 1 : BOARD_SIZE; // Non-slide for promoted extras

            for (let dist = 1; dist <= maxDist; dist++) {
                const nr = row + dr * dist;
                const nc = col + dc * dist;
                if (nr < 0 || nr >= BOARD_SIZE || nc < 0 || nc >= BOARD_SIZE) break;

                const target = board[nr][nc];
                if (target && target.player === piece.player) break;
                moves.push([nr, nc]);
                if (target) break; // Can capture but can't go further
            }
        }
    } else {
        for (const [dr, dc] of directions) {
            const nr = row + dr;
            const nc = col + dc;
            if (nr < 0 || nr >= BOARD_SIZE || nc < 0 || nc >= BOARD_SIZE) continue;

            const target = board[nr][nc];
            if (target && target.player === piece.player) continue;
            moves.push([nr, nc]);
        }
    }

    return moves;
}

function shouldPromote(piece: Piece, toRow: number): boolean {
    if (piece.promoted || piece.type === 'king' || piece.type === 'gold') return false;
    if (piece.player === 'sente') return toRow <= 2;
    return toRow >= 6;
}

function mustPromote(piece: Piece, toRow: number): boolean {
    if (piece.type === 'pawn' || piece.type === 'lance') {
        return piece.player === 'sente' ? toRow === 0 : toRow === 8;
    }
    if (piece.type === 'knight') {
        return piece.player === 'sente' ? toRow <= 1 : toRow >= 7;
    }
    return false;
}

export function movePiece(state: GameState, fromR: number, fromC: number, toR: number, toC: number): GameState {
    if (state.winner) return state;

    const newBoard = state.board.map(r => [...r]);
    const piece = { ...newBoard[fromR][fromC]! };
    const captured = newBoard[toR][toC];
    const newHand = { sente: [...state.hand.sente], gote: [...state.hand.gote] };

    // Capture
    if (captured && captured.player !== piece.player) {
        newHand[piece.player].push(captured.type);
    }

    // Auto-promote if entering promotion zone or must promote
    if (shouldPromote(piece, toR) || mustPromote(piece, toR)) {
        piece.promoted = true;
    }

    newBoard[toR][toC] = piece;
    newBoard[fromR][fromC] = null;

    // Check if opponent king is captured
    let winner: Player | null = null;
    if (captured?.type === 'king') {
        winner = piece.player;
    }

    return {
        ...state,
        board: newBoard,
        hand: newHand,
        turn: winner ? state.turn : (state.turn === 'sente' ? 'gote' : 'sente'),
        winner,
        selectedCell: null,
        selectedHand: null,
        validMoves: [],
        message: winner ? `${winner === 'sente' ? 'You' : 'CPU'} wins!` : '',
    };
}

export function getDropMoves(board: CellValue[][], pieceType: PieceType, player: Player): [number, number][] {
    const moves: [number, number][] = [];

    for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
            if (board[r][c] !== null) continue;

            // Pawns can't be in same column with existing unpromoted pawn
            if (pieceType === 'pawn') {
                const hasPawn = board.some((row, ri) => row[c]?.type === 'pawn' && row[c]?.player === player && !row[c]?.promoted);
                if (hasPawn) continue;
                // Can't drop pawn on last rank
                if (player === 'sente' && r === 0) continue;
                if (player === 'gote' && r === 8) continue;
            }
            if (pieceType === 'lance') {
                if (player === 'sente' && r === 0) continue;
                if (player === 'gote' && r === 8) continue;
            }
            if (pieceType === 'knight') {
                if (player === 'sente' && r <= 1) continue;
                if (player === 'gote' && r >= 7) continue;
            }

            moves.push([r, c]);
        }
    }

    return moves;
}

export function dropPiece(state: GameState, pieceType: PieceType, row: number, col: number): GameState {
    if (state.winner) return state;

    const newBoard = state.board.map(r => [...r]);
    newBoard[row][col] = { type: pieceType, player: state.turn, promoted: false };

    const newHand = { ...state.hand };
    const handArr = [...newHand[state.turn]];
    const idx = handArr.indexOf(pieceType);
    if (idx !== -1) handArr.splice(idx, 1);
    newHand[state.turn] = handArr;

    return {
        ...state,
        board: newBoard,
        hand: newHand,
        turn: state.turn === 'sente' ? 'gote' : 'sente',
        selectedCell: null,
        selectedHand: null,
        validMoves: [],
    };
}

// AI: simple random valid move
export function getAIMove(state: GameState): { type: 'move'; from: [number, number]; to: [number, number] } | { type: 'drop'; piece: PieceType; to: [number, number] } | null {
    const allMoves: { from: [number, number]; to: [number, number]; score: number }[] = [];

    for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
            const cell = state.board[r][c];
            if (!cell || cell.player !== state.turn) continue;

            const moves = getValidMovesForPiece(state.board, r, c);
            for (const [tr, tc] of moves) {
                let score = Math.random() * 5;
                const target = state.board[tr][tc];
                if (target) {
                    if (target.type === 'king') score += 1000;
                    else score += 20;
                }
                // Prefer advancing
                score += (state.turn === 'gote' ? tr : (8 - tr));
                allMoves.push({ from: [r, c], to: [tr, tc], score });
            }
        }
    }

    // Consider drops
    for (const pieceType of state.hand[state.turn]) {
        const drops = getDropMoves(state.board, pieceType, state.turn);
        for (const [dr, dc] of drops) {
            let score = Math.random() * 3 + 5;
            allMoves.push({ from: [-1, -1], to: [dr, dc], score }); // -1 marks a drop
        }
    }

    if (allMoves.length === 0) return null;

    allMoves.sort((a, b) => b.score - a.score);
    const best = allMoves[0];

    if (best.from[0] === -1) {
        // Drop
        const pieceType = state.hand[state.turn][0];
        return { type: 'drop', piece: pieceType, to: best.to };
    }

    return { type: 'move', from: best.from, to: best.to };
}
