// ===================== Lights Out Logic =====================

export const GRID_SIZE = 5;

export interface GameState {
    grid: boolean[][]; // true = lit, false = off
    moves: number;
    won: boolean;
    level: number;
}

function createGrid(size: number): boolean[][] {
    return Array.from({ length: size }, () => Array(size).fill(false));
}

// Generate a solvable puzzle by starting from solved and applying random toggles
export function generatePuzzle(level: number): GameState {
    const grid = createGrid(GRID_SIZE);
    const numToggles = Math.min(3 + level * 2, 20);

    for (let i = 0; i < numToggles; i++) {
        const r = Math.floor(Math.random() * GRID_SIZE);
        const c = Math.floor(Math.random() * GRID_SIZE);
        toggleCell(grid, r, c);
    }

    // Make sure at least some lights are on
    const litCount = grid.flat().filter(Boolean).length;
    if (litCount < 3) {
        toggleCell(grid, 2, 2);
        toggleCell(grid, 1, 1);
        toggleCell(grid, 3, 3);
    }

    return { grid, moves: 0, won: false, level };
}

function toggleCell(grid: boolean[][], row: number, col: number): void {
    const toggle = (r: number, c: number) => {
        if (r >= 0 && r < GRID_SIZE && c >= 0 && c < GRID_SIZE) {
            grid[r][c] = !grid[r][c];
        }
    };
    toggle(row, col);
    toggle(row - 1, col);
    toggle(row + 1, col);
    toggle(row, col - 1);
    toggle(row, col + 1);
}

export function applyMove(state: GameState, row: number, col: number): GameState {
    if (state.won) return state;

    const newGrid = state.grid.map(r => [...r]);
    toggleCell(newGrid, row, col);

    const won = newGrid.every(r => r.every(c => !c));

    return {
        ...state,
        grid: newGrid,
        moves: state.moves + 1,
        won,
    };
}

export function initializeGame(level: number = 1): GameState {
    return generatePuzzle(level);
}
