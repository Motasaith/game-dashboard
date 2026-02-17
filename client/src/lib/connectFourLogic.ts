export type Player = "red" | "yellow";
export type CellState = Player | null;
export type GameState = {
    board: CellState[][]; // 6 rows x 7 cols
    currentPlayer: Player;
    winner: Player | "draw" | null;
    history: CellState[][][];
};

export const ROWS = 6;
export const COLS = 7;

export function getInitialGameState(): GameState {
    return {
        board: Array(ROWS).fill(null).map(() => Array(COLS).fill(null)),
        currentPlayer: "red",
        winner: null,
        history: [],
    };
}

export function dropDisc(
    gameState: GameState,
    colIndex: number
): GameState {
    if (gameState.winner) return gameState;

    // Find the first empty row in this column (starting from bottom)
    let rowIndex = -1;
    for (let r = ROWS - 1; r >= 0; r--) {
        if (!gameState.board[r][colIndex]) {
            rowIndex = r;
            break;
        }
    }

    // Column is full
    if (rowIndex === -1) return gameState;

    const newBoard = gameState.board.map((row) => [...row]);
    newBoard[rowIndex][colIndex] = gameState.currentPlayer;

    const winner = checkWinner(newBoard, rowIndex, colIndex, gameState.currentPlayer);
    const isDraw = !winner && newBoard.every((row) => row.every((cell) => cell !== null));

    return {
        board: newBoard,
        currentPlayer: gameState.currentPlayer === "red" ? "yellow" : "red",
        winner: winner ? gameState.currentPlayer : isDraw ? "draw" : null,
        history: [...gameState.history, gameState.board],
    };
}

function checkWinner(
    board: CellState[][],
    row: number,
    col: number,
    player: Player
): boolean {
    // Directions: [rowDelta, colDelta]
    const directions = [
        [0, 1],   // Horizontal
        [1, 0],   // Vertical
        [1, 1],   // Diagonal /
        [1, -1],  // Diagonal \
    ];

    for (const [dr, dc] of directions) {
        let count = 1;

        // Check positive direction
        for (let i = 1; i < 4; i++) {
            const r = row + (dr * i);
            const c = col + (dc * i);
            if (r >= 0 && r < ROWS && c >= 0 && c < COLS && board[r][c] === player) {
                count++;
            } else {
                break;
            }
        }

        // Check negative direction
        for (let i = 1; i < 4; i++) {
            const r = row - (dr * i);
            const c = col - (dc * i);
            if (r >= 0 && r < ROWS && c >= 0 && c < COLS && board[r][c] === player) {
                count++;
            } else {
                break;
            }
        }

        if (count >= 4) return true;
    }

    return false;
}

export function getAIMove(gameState: GameState): number {
    const validMoves = [];
    for (let c = 0; c < COLS; c++) {
        if (!gameState.board[0][c]) {
            validMoves.push(c);
        }
    }

    if (validMoves.length === 0) return -1;

    // 1. Check for winning move
    for (const col of validMoves) {
        const nextState = dropDisc(gameState, col);
        if (nextState.winner === gameState.currentPlayer) return col;
    }

    // 2. Block opponent winning move
    const opponent = gameState.currentPlayer === "red" ? "yellow" : "red";
    for (const col of validMoves) {
        // Simulate opponent move
        // We need a temp state where it's opponent's turn
        const tempState: GameState = {
            ...gameState,
            currentPlayer: opponent
        };
        const nextState = dropDisc(tempState, col);
        if (nextState.winner === opponent) return col;
    }

    // 3. Random valid move
    return validMoves[Math.floor(Math.random() * validMoves.length)];
}
