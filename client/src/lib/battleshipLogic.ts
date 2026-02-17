// ===================== Battleship Logic =====================

export const GRID_SIZE = 10;
export type CellState = 'empty' | 'ship' | 'hit' | 'miss' | 'sunk';
export type Phase = 'placing' | 'playing' | 'gameover';

export interface Ship {
    name: string;
    size: number;
    positions: [number, number][];
    hits: boolean[];
}

export const SHIP_CONFIGS = [
    { name: 'Carrier', size: 5 },
    { name: 'Battleship', size: 4 },
    { name: 'Cruiser', size: 3 },
    { name: 'Submarine', size: 3 },
    { name: 'Destroyer', size: 2 },
];

export interface Board {
    grid: CellState[][];
    ships: Ship[];
}

export interface GameState {
    playerBoard: Board;
    cpuBoard: Board;
    phase: Phase;
    playerTurn: boolean;
    winner: 'player' | 'cpu' | null;
    message: string;
}

function createEmptyGrid(): CellState[][] {
    return Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill('empty'));
}

function canPlaceShip(grid: CellState[][], row: number, col: number, size: number, horizontal: boolean): boolean {
    for (let i = 0; i < size; i++) {
        const r = horizontal ? row : row + i;
        const c = horizontal ? col + i : col;
        if (r >= GRID_SIZE || c >= GRID_SIZE || grid[r][c] !== 'empty') return false;
    }
    return true;
}

function placeShipOnGrid(grid: CellState[][], row: number, col: number, size: number, horizontal: boolean): [number, number][] {
    const positions: [number, number][] = [];
    for (let i = 0; i < size; i++) {
        const r = horizontal ? row : row + i;
        const c = horizontal ? col + i : col;
        grid[r][c] = 'ship';
        positions.push([r, c]);
    }
    return positions;
}

export function autoPlaceShips(): Board {
    const grid = createEmptyGrid();
    const ships: Ship[] = [];

    for (const config of SHIP_CONFIGS) {
        let placed = false;
        let attempts = 0;
        while (!placed && attempts < 200) {
            const horizontal = Math.random() > 0.5;
            const row = Math.floor(Math.random() * GRID_SIZE);
            const col = Math.floor(Math.random() * GRID_SIZE);

            if (canPlaceShip(grid, row, col, config.size, horizontal)) {
                const positions = placeShipOnGrid(grid, row, col, config.size, horizontal);
                ships.push({
                    name: config.name,
                    size: config.size,
                    positions,
                    hits: Array(config.size).fill(false),
                });
                placed = true;
            }
            attempts++;
        }
    }

    return { grid, ships };
}

export function initializeGame(): GameState {
    return {
        playerBoard: autoPlaceShips(),
        cpuBoard: autoPlaceShips(),
        phase: 'playing',
        playerTurn: true,
        winner: null,
        message: 'Fire at the enemy grid!',
    };
}

function checkSunk(ship: Ship): boolean {
    return ship.hits.every(Boolean);
}

function checkAllSunk(board: Board): boolean {
    return board.ships.every(s => checkSunk(s));
}

function fireAt(board: Board, row: number, col: number): { board: Board; hit: boolean; sunkShip: Ship | null } {
    const newGrid = board.grid.map(r => [...r]);
    const newShips = board.ships.map(s => ({ ...s, hits: [...s.hits], positions: [...s.positions] as [number, number][] }));

    let hit = false;
    let sunkShip: Ship | null = null;

    if (newGrid[row][col] === 'ship') {
        newGrid[row][col] = 'hit';
        hit = true;

        for (const ship of newShips) {
            const posIndex = ship.positions.findIndex(([r, c]) => r === row && c === col);
            if (posIndex !== -1) {
                ship.hits[posIndex] = true;
                if (checkSunk(ship)) {
                    sunkShip = ship;
                    for (const [sr, sc] of ship.positions) {
                        newGrid[sr][sc] = 'sunk';
                    }
                }
            }
        }
    } else if (newGrid[row][col] === 'empty') {
        newGrid[row][col] = 'miss';
    }

    return { board: { grid: newGrid, ships: newShips }, hit, sunkShip };
}

export function playerFire(state: GameState, row: number, col: number): GameState {
    if (!state.playerTurn || state.phase !== 'playing') return state;
    if (state.cpuBoard.grid[row][col] === 'hit' || state.cpuBoard.grid[row][col] === 'miss' || state.cpuBoard.grid[row][col] === 'sunk') return state;

    const { board: newCpuBoard, hit, sunkShip } = fireAt(state.cpuBoard, row, col);

    let message = hit ? (sunkShip ? `You sunk their ${sunkShip.name}!` : 'Hit!') : 'Miss!';

    if (checkAllSunk(newCpuBoard)) {
        return { ...state, cpuBoard: newCpuBoard, phase: 'gameover', winner: 'player', message: 'Victory! All enemy ships sunk!' };
    }

    return { ...state, cpuBoard: newCpuBoard, playerTurn: false, message };
}

export function cpuFire(state: GameState): GameState {
    if (state.playerTurn || state.phase !== 'playing') return state;

    // Simple AI: target around previous hits, else random
    const grid = state.playerBoard.grid;
    const targets: [number, number][] = [];

    // Find adjacent cells to hits
    for (let r = 0; r < GRID_SIZE; r++) {
        for (let c = 0; c < GRID_SIZE; c++) {
            if (grid[r][c] === 'hit') {
                const adj: [number, number][] = [[r - 1, c], [r + 1, c], [r, c - 1], [r, c + 1]];
                for (const [ar, ac] of adj) {
                    if (ar >= 0 && ar < GRID_SIZE && ac >= 0 && ac < GRID_SIZE) {
                        if (grid[ar][ac] === 'empty' || grid[ar][ac] === 'ship') {
                            targets.push([ar, ac]);
                        }
                    }
                }
            }
        }
    }

    let row: number, col: number;
    if (targets.length > 0) {
        [row, col] = targets[Math.floor(Math.random() * targets.length)];
    } else {
        const available: [number, number][] = [];
        for (let r = 0; r < GRID_SIZE; r++) {
            for (let c = 0; c < GRID_SIZE; c++) {
                if (grid[r][c] === 'empty' || grid[r][c] === 'ship') available.push([r, c]);
            }
        }
        [row, col] = available[Math.floor(Math.random() * available.length)];
    }

    const { board: newPlayerBoard, hit, sunkShip } = fireAt(state.playerBoard, row, col);

    let message = hit ? (sunkShip ? `CPU sunk your ${sunkShip.name}!` : 'CPU hit your ship!') : 'CPU missed!';

    if (checkAllSunk(newPlayerBoard)) {
        return { ...state, playerBoard: newPlayerBoard, phase: 'gameover', winner: 'cpu', message: 'Defeat! All your ships are sunk!' };
    }

    return { ...state, playerBoard: newPlayerBoard, playerTurn: true, message };
}
