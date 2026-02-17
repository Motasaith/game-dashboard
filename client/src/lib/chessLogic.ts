export type Player = "white" | "black";
export type PieceType = "pawn" | "rook" | "knight" | "bishop" | "queen" | "king";

export type Piece = {
    player: Player;
    type: PieceType;
    hasMoved?: boolean; // For castling and pawn double move
};

export type CellState = Piece | null;

export type GameState = {
    board: CellState[][]; // 8x8
    currentPlayer: Player;
    selectedCell: { row: number; col: number } | null;
    validMoves: { row: number; col: number }[];
    winner: Player | "draw" | null;
    inCheck: boolean;
    history: CellState[][][];
};

export const BOARD_SIZE = 8;

export function getInitialGameState(): GameState {
    const board: CellState[][] = Array(BOARD_SIZE)
        .fill(null)
        .map(() => Array(BOARD_SIZE).fill(null));

    // Pawns
    for (let c = 0; c < BOARD_SIZE; c++) {
        board[1][c] = { player: "black", type: "pawn", hasMoved: false };
        board[6][c] = { player: "white", type: "pawn", hasMoved: false };
    }

    // Rooks
    board[0][0] = board[0][7] = { player: "black", type: "rook", hasMoved: false };
    board[7][0] = board[7][7] = { player: "white", type: "rook", hasMoved: false };

    // Knights
    board[0][1] = board[0][6] = { player: "black", type: "knight", hasMoved: false };
    board[7][1] = board[7][6] = { player: "white", type: "knight", hasMoved: false };

    // Bishops
    board[0][2] = board[0][5] = { player: "black", type: "bishop", hasMoved: false };
    board[7][2] = board[7][5] = { player: "white", type: "bishop", hasMoved: false };

    // Queens
    board[0][3] = { player: "black", type: "queen", hasMoved: false };
    board[7][3] = { player: "white", type: "queen", hasMoved: false };

    // Kings
    board[0][4] = { player: "black", type: "king", hasMoved: false };
    board[7][4] = { player: "white", type: "king", hasMoved: false };

    return {
        board,
        currentPlayer: "white",
        selectedCell: null,
        validMoves: [],
        winner: null,
        inCheck: false,
        history: []
    };
}

// Check if a move is valid (simplified for this context, fully implementing chess rules is huge)
// Focus on movement patterns and basic capturing
function getValidMoves(
    gameState: GameState,
    row: number,
    col: number
): { row: number; col: number }[] {
    const piece = gameState.board[row][col];
    if (!piece) return [];

    const moves: { row: number; col: number }[] = [];
    const directions: { [key in PieceType]: number[][] } = {
        pawn: [], // Calculated dynamically
        rook: [[0, 1], [0, -1], [1, 0], [-1, 0]],
        knight: [[2, 1], [2, -1], [-2, 1], [-2, -1], [1, 2], [1, -2], [-1, 2], [-1, -2]],
        bishop: [[1, 1], [1, -1], [-1, 1], [-1, -1]],
        queen: [[0, 1], [0, -1], [1, 0], [-1, 0], [1, 1], [1, -1], [-1, 1], [-1, -1]],
        king: [[0, 1], [0, -1], [1, 0], [-1, 0], [1, 1], [1, -1], [-1, 1], [-1, -1]]
    };

    const isSlidingPiece = ["rook", "bishop", "queen"].includes(piece.type);

    if (piece.type === "pawn") {
        const direction = piece.player === "white" ? -1 : 1;
        const startRow = piece.player === "white" ? 6 : 1;

        // Move forward 1
        if (!gameState.board[row + direction]?.[col]) {
            moves.push({ row: row + direction, col });
            // Move forward 2
            if (row === startRow && !gameState.board[row + direction * 2]?.[col]) {
                moves.push({ row: row + direction * 2, col });
            }
        }

        // Capture diagonals
        const captureCols = [col - 1, col + 1];
        for (const c of captureCols) {
            if (c >= 0 && c < BOARD_SIZE) {
                const target = gameState.board[row + direction][c];
                if (target && target.player !== piece.player) {
                    moves.push({ row: row + direction, col: c });
                }
            }
        }
    } else if (piece.type === "knight" || piece.type === "king") {
        for (const [dr, dc] of directions[piece.type]) {
            const newR = row + dr;
            const newC = col + dc;
            if (newR >= 0 && newR < BOARD_SIZE && newC >= 0 && newC < BOARD_SIZE) {
                const target = gameState.board[newR][newC];
                if (!target || target.player !== piece.player) {
                    moves.push({ row: newR, col: newC });
                }
            }
        }
    } else { // Sliding pieces
        for (const [dr, dc] of directions[piece.type]) {
            let r = row + dr;
            let c = col + dc;
            while (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE) {
                const target = gameState.board[r][c];
                if (!target) {
                    moves.push({ row: r, col: c });
                } else {
                    if (target.player !== piece.player) {
                        moves.push({ row: r, col: c });
                    }
                    break; // Blocked
                }
                r += dr;
                c += dc;
            }
        }
    }

    return moves;
}

export function handleCellClick(
    gameState: GameState,
    row: number,
    col: number
): GameState {
    if (gameState.winner) return gameState;

    // 1. Select a piece
    if (gameState.board[row][col]?.player === gameState.currentPlayer) {
        const moves = getValidMoves(gameState, row, col);
        return {
            ...gameState,
            selectedCell: { row, col },
            validMoves: moves
        };
    }

    // 2. Move Logic
    if (gameState.selectedCell) {
        const isMoveValid = gameState.validMoves.some(m => m.row === row && m.col === col);
        if (isMoveValid) {
            const { row: fromR, col: fromC } = gameState.selectedCell;
            const piece = gameState.board[fromR][fromC]!;
            const newBoard = gameState.board.map(r => [...r]);

            // Execute Move
            newBoard[row][col] = { ...piece, hasMoved: true };
            newBoard[fromR][fromC] = null;

            // Pawn Promotion (Auto-Queen for simplicity)
            if (piece.type === "pawn" && (row === 0 || row === 7)) {
                newBoard[row][col] = { ...piece, type: "queen", hasMoved: true };
            }

            // Check for Checkmate (Simplified: capture King ends game)
            // In real chess, you checkmate. Here, capturing the King wins for immediate feedback.
            // A more complex checkmate detection can be added later.
            let winner = null;
            const opponent = gameState.currentPlayer === "white" ? "black" : "white";
            let kingFound = false;
            for (let r = 0; r < BOARD_SIZE; r++) {
                for (let c = 0; c < BOARD_SIZE; c++) {
                    if (newBoard[r][c]?.type === "king" && newBoard[r][c]?.player === opponent) {
                        kingFound = true;
                    }
                }
            }
            if (!kingFound) winner = gameState.currentPlayer;

            return {
                ...gameState,
                board: newBoard,
                currentPlayer: opponent,
                selectedCell: null,
                validMoves: [],
                winner,
                history: [...gameState.history, gameState.board]
            };
        }
    }

    // Deselect if clicking invalid cell
    return { ...gameState, selectedCell: null, validMoves: [] };
}

export function getAIMove(gameState: GameState): { from: { row: number, col: number }, to: { row: number, col: number } } | null {
    // 1. Find all pieces
    const myPieces: { row: number; col: number }[] = [];
    for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
            if (gameState.board[r][c]?.player === "black") {
                myPieces.push({ row: r, col: c });
            }
        }
    }

    // 2. Find all valid moves
    const allMoves: { from: { row: number, col: number }, to: { row: number, col: number } }[] = [];
    for (const piece of myPieces) {
        const moves = getValidMoves(gameState, piece.row, piece.col);
        for (const move of moves) {
            allMoves.push({ from: piece, to: move });
        }
    }

    if (allMoves.length === 0) return null;

    // 3. Prioritize Captures
    const captures = allMoves.filter(m => gameState.board[m.to.row][m.to.col] !== null);
    if (captures.length > 0) {
        return captures[Math.floor(Math.random() * captures.length)];
    }

    // 4. Random Move
    return allMoves[Math.floor(Math.random() * allMoves.length)];
}
