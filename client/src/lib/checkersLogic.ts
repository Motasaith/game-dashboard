export type Player = "red" | "white";
export type PieceType = "man" | "king";

export type Piece = {
    player: Player;
    type: PieceType;
};

export type CellState = Piece | null;

export type GameState = {
    board: CellState[][]; // 8x8
    currentPlayer: Player;
    selectedCell: { row: number; col: number } | null;
    validMoves: { row: number; col: number }[];
    winner: Player | null;
    mustCapture: boolean; // If a capture is available, player must take it
};

export const BOARD_SIZE = 8;

export function getInitialGameState(): GameState {
    const board: CellState[][] = Array(BOARD_SIZE)
        .fill(null)
        .map(() => Array(BOARD_SIZE).fill(null));

    // Place pieces
    // Red (Top): Rows 0, 1, 2
    // White (Bottom): Rows 5, 6, 7
    for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
            if ((r + c) % 2 === 1) {
                if (r < 3) board[r][c] = { player: "red", type: "man" };
                if (r > 4) board[r][c] = { player: "white", type: "man" };
            }
        }
    }

    const initialState: GameState = {
        board,
        currentPlayer: "white", // White moves first usually
        selectedCell: null,
        validMoves: [],
        winner: null,
        mustCapture: false,
    };

    // Calculate initial forced captures if any
    const captureMoves = getAllCaptureMoves(board, "white");
    return { ...initialState, mustCapture: captureMoves.length > 0 };
}

// Check if a move is valid for a piece
function getValidMovesForPiece(
    board: CellState[][],
    row: number,
    col: number,
    mustCapture: boolean
): { row: number; col: number; isCapture: boolean }[] {
    const piece = board[row][col];
    if (!piece) return [];

    const moves: { row: number; col: number; isCapture: boolean }[] = [];
    const directions = [];

    if (piece.type === "king") {
        directions.push([1, 1], [1, -1], [-1, 1], [-1, -1]);
    } else {
        // Red moves down (+row), White moves up (-row)
        const forward = piece.player === "red" ? 1 : -1;
        directions.push([forward, 1], [forward, -1]);
    }

    // Check captures first
    for (const [dr, dc] of directions) {
        const jumpR = row + (dr * 2);
        const jumpC = col + (dc * 2);
        const midR = row + dr;
        const midC = col + dc;

        if (isValidPos(jumpR, jumpC)) {
            const midPiece = board[midR][midC];
            if (midPiece && midPiece.player !== piece.player && !board[jumpR][jumpC]) {
                moves.push({ row: jumpR, col: jumpC, isCapture: true });
            }
        }
    }

    // If we MUST capture, return only capture moves
    if (mustCapture) {
        return moves.filter(m => m.isCapture);
    }

    // Otherwise check normal moves
    if (moves.length === 0) {
        for (const [dr, dc] of directions) {
            const newR = row + dr;
            const newC = col + dc;
            if (isValidPos(newR, newC) && !board[newR][newC]) {
                moves.push({ row: newR, col: newC, isCapture: false });
            }
        }
    }

    return moves;
}

function getAllCaptureMoves(board: CellState[][], player: Player) {
    let captures: any[] = [];
    for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
            const piece = board[r][c];
            if (piece && piece.player === player) {
                const moves = getValidMovesForPiece(board, r, c, true); // true forces looking only for captures
                if (moves.length > 0) captures.push(...moves);
            }
        }
    }
    return captures;
}

function isValidPos(row: number, col: number) {
    return row >= 0 && row < BOARD_SIZE && col >= 0 && col < BOARD_SIZE;
}

export function handleCellClick(
    gameState: GameState,
    row: number,
    col: number
): GameState {
    if (gameState.winner) return gameState;

    // 1. Select a piece
    if (gameState.board[row][col]?.player === gameState.currentPlayer) {
        // Use helper to see if this piece has valid moves considering capture rules
        const moves = getValidMovesForPiece(gameState.board, row, col, gameState.mustCapture);

        // If forced capture is active, ensure this piece CAN capture
        if (gameState.mustCapture && !moves.some(m => m.isCapture)) {
            return gameState; // Invalid selection, must select a piece that can capture
        }

        return {
            ...gameState,
            selectedCell: { row, col },
            validMoves: moves.map(m => ({ row: m.row, col: m.col }))
        };
    }

    // 2. Move to empty square
    if (!gameState.board[row][col] && gameState.selectedCell) {
        const isMoveValid = gameState.validMoves.some(m => m.row === row && m.col === col);
        if (!isMoveValid) return gameState;

        const { row: fromR, col: fromC } = gameState.selectedCell;
        const piece = gameState.board[fromR][fromC]!;
        const newBoard = gameState.board.map(r => [...r]);

        // Move piece
        newBoard[row][col] = piece;
        newBoard[fromR][fromC] = null;

        let captured = false;

        // Check Capture
        if (Math.abs(row - fromR) === 2) {
            const capturedR = (row + fromR) / 2;
            const capturedC = (col + fromC) / 2;
            newBoard[capturedR][capturedC] = null;
            captured = true;
        }

        // King Promotion
        if ((piece.player === "white" && row === 0) || (piece.player === "red" && row === BOARD_SIZE - 1)) {
            newBoard[row][col] = { ...piece, type: "king" };
        }

        // Turn Logic
        // If captured, check if another capture is possible with SAME piece
        if (captured) {
            const moreCaptures = getValidMovesForPiece(newBoard, row, col, true);
            if (moreCaptures.length > 0) {
                return {
                    ...gameState,
                    board: newBoard,
                    selectedCell: { row, col }, // Keep selected for multi-jump
                    validMoves: moreCaptures.map(m => ({ row: m.row, col: m.col })),
                    mustCapture: true
                };
            }
        }

        // Switch turn
        const nextPlayer = gameState.currentPlayer === "white" ? "red" : "white";
        const nextCaptures = getAllCaptureMoves(newBoard, nextPlayer);

        return {
            ...gameState,
            board: newBoard,
            currentPlayer: nextPlayer,
            selectedCell: null,
            validMoves: [],
            mustCapture: nextCaptures.length > 0,
            winner: checkCheckersWinner(newBoard)
        };
    }

    return gameState;
}

function checkCheckersWinner(board: CellState[][]): Player | null {
    let redCount = 0;
    let whiteCount = 0;
    let redMoves = false;
    let whiteMoves = false;

    for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
            const piece = board[r][c];
            if (piece?.player === "red") {
                redCount++;
                if (getValidMovesForPiece(board, r, c, false).length > 0) redMoves = true;
            }
            if (piece?.player === "white") {
                whiteCount++;
                if (getValidMovesForPiece(board, r, c, false).length > 0) whiteMoves = true;
            }
        }
    }

    if (redCount === 0 || !redMoves) return "white";
    if (whiteCount === 0 || !whiteMoves) return "red";
    return null;
}

// --- AI ENGINE ---

export function getAIMove(
    gameState: GameState
): { from: { row: number; col: number }; to: { row: number; col: number } } | null {
    const player = gameState.currentPlayer;
    const allMoves: { from: { row: number; col: number }; to: { row: number; col: number }; isCapture: boolean; score: number }[] = [];

    for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
            const piece = gameState.board[r][c];
            if (piece && piece.player === player) {
                const moves = getValidMovesForPiece(gameState.board, r, c, gameState.mustCapture);
                for (const move of moves) {
                    let score = 0;

                    // Heavily prioritize captures
                    if (move.isCapture) score += 100;

                    // Prefer advancing toward promotion row
                    if (player === "red") {
                        score += move.row; // Red advances downward
                    } else {
                        score += (BOARD_SIZE - 1 - move.row); // White advances upward
                    }

                    // Prefer center columns
                    const centerDist = Math.abs(move.col - 3.5);
                    score += (4 - centerDist) * 2;

                    // Prefer king safety (kings stay center)
                    if (piece.type === "king") {
                        score += 5;
                    }

                    // Penalize edge moves slightly  
                    if (move.col === 0 || move.col === 7) score -= 1;

                    // Bonus for reaching promotion row
                    if (player === "red" && move.row === BOARD_SIZE - 1) score += 20;
                    if (player === "white" && move.row === 0) score += 20;

                    allMoves.push({
                        from: { row: r, col: c },
                        to: { row: move.row, col: move.col },
                        isCapture: move.isCapture,
                        score
                    });
                }
            }
        }
    }

    if (allMoves.length === 0) return null;

    // Sort by score descending and pick from top candidates with some randomness
    allMoves.sort((a, b) => b.score - a.score);
    const topScore = allMoves[0].score;
    const topMoves = allMoves.filter(m => m.score >= topScore - 5);

    const chosen = topMoves[Math.floor(Math.random() * topMoves.length)];
    return { from: chosen.from, to: chosen.to };
}

