// ===================== Quoridor Logic =====================
// 9×9 grid, 2 pawns, wall placement, BFS pathfinding

export const BOARD_SIZE = 9;
export type Player = 'p1' | 'p2';

export interface Pos { row: number; col: number; }

export interface Wall { row: number; col: number; orientation: 'h' | 'v'; }

export interface GameState {
    pawns: { p1: Pos; p2: Pos };
    walls: Wall[];
    wallCounts: { p1: number; p2: number };
    turn: Player;
    winner: Player | null;
    phase: 'move' | 'wall' | 'gameover';
    selectedAction: 'move' | 'wall';
}

export function initializeGame(): GameState {
    return {
        pawns: {
            p1: { row: 8, col: 4 },
            p2: { row: 0, col: 4 },
        },
        walls: [],
        wallCounts: { p1: 10, p2: 10 },
        turn: 'p1',
        winner: null,
        phase: 'move',
        selectedAction: 'move',
    };
}

function isBlocked(walls: Wall[], r1: number, c1: number, r2: number, c2: number): boolean {
    for (const wall of walls) {
        if (wall.orientation === 'h') {
            // Horizontal wall blocks vertical movement between rows wall.row and wall.row+1
            if ((r1 === wall.row && r2 === wall.row + 1) || (r1 === wall.row + 1 && r2 === wall.row)) {
                if ((c1 === wall.col || c1 === wall.col + 1) && (c2 === wall.col || c2 === wall.col + 1)) {
                    if (c1 === c2) return true;
                }
            }
        } else {
            // Vertical wall blocks horizontal movement between cols wall.col and wall.col+1
            if ((c1 === wall.col && c2 === wall.col + 1) || (c1 === wall.col + 1 && c2 === wall.col)) {
                if ((r1 === wall.row || r1 === wall.row + 1) && (r2 === wall.row || r2 === wall.row + 1)) {
                    if (r1 === r2) return true;
                }
            }
        }
    }
    return false;
}

function getNeighbors(pos: Pos, walls: Wall[], otherPawn: Pos): Pos[] {
    const neighbors: Pos[] = [];
    const dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];

    for (const [dr, dc] of dirs) {
        const nr = pos.row + dr;
        const nc = pos.col + dc;

        if (nr < 0 || nr >= BOARD_SIZE || nc < 0 || nc >= BOARD_SIZE) continue;
        if (isBlocked(walls, pos.row, pos.col, nr, nc)) continue;

        // If neighbor is the other pawn, try to jump over
        if (nr === otherPawn.row && nc === otherPawn.col) {
            const jr = nr + dr;
            const jc = nc + dc;
            if (jr >= 0 && jr < BOARD_SIZE && jc >= 0 && jc < BOARD_SIZE &&
                !isBlocked(walls, nr, nc, jr, jc)) {
                neighbors.push({ row: jr, col: jc });
            } else {
                // Diagonal jumps
                for (const [ddr, ddc] of dirs) {
                    if (ddr === -dr && ddc === -dc) continue; // Don't go back
                    const djr = nr + ddr;
                    const djc = nc + ddc;
                    if (djr >= 0 && djr < BOARD_SIZE && djc >= 0 && djc < BOARD_SIZE &&
                        !isBlocked(walls, nr, nc, djr, djc) &&
                        !(djr === pos.row && djc === pos.col)) {
                        neighbors.push({ row: djr, col: djc });
                    }
                }
            }
        } else {
            neighbors.push({ row: nr, col: nc });
        }
    }

    return neighbors;
}

// BFS to check if player can reach goal row
function hasPath(pawn: Pos, goalRow: number, walls: Wall[], otherPawn: Pos): boolean {
    const visited = new Set<string>();
    const queue: Pos[] = [pawn];
    visited.add(`${pawn.row},${pawn.col}`);

    while (queue.length > 0) {
        const curr = queue.shift()!;
        if (curr.row === goalRow) return true;

        for (const n of getNeighbors(curr, walls, otherPawn)) {
            const key = `${n.row},${n.col}`;
            if (!visited.has(key)) {
                visited.add(key);
                queue.push(n);
            }
        }
    }
    return false;
}

export function getValidMoves(state: GameState): Pos[] {
    const pawn = state.pawns[state.turn];
    const otherPawn = state.pawns[state.turn === 'p1' ? 'p2' : 'p1'];
    return getNeighbors(pawn, state.walls, otherPawn);
}

export function canPlaceWall(state: GameState, wall: Wall): boolean {
    if (state.wallCounts[state.turn] <= 0) return false;
    if (wall.row < 0 || wall.row >= BOARD_SIZE - 1 || wall.col < 0 || wall.col >= BOARD_SIZE - 1) return false;

    // Check overlap with existing walls
    for (const existing of state.walls) {
        if (existing.row === wall.row && existing.col === wall.col && existing.orientation === wall.orientation) return false;

        if (wall.orientation === 'h' && existing.orientation === 'h') {
            if (wall.row === existing.row && Math.abs(wall.col - existing.col) < 2) return false;
        }
        if (wall.orientation === 'v' && existing.orientation === 'v') {
            if (wall.col === existing.col && Math.abs(wall.row - existing.row) < 2) return false;
        }
        // Cross overlap
        if (wall.orientation !== existing.orientation && wall.row === existing.row && wall.col === existing.col) return false;
    }

    // Check path exists for both players
    const newWalls = [...state.walls, wall];
    if (!hasPath(state.pawns.p1, 0, newWalls, state.pawns.p2)) return false;
    if (!hasPath(state.pawns.p2, 8, newWalls, state.pawns.p1)) return false;

    return true;
}

export function movePawn(state: GameState, to: Pos): GameState {
    if (state.winner) return state;

    const valid = getValidMoves(state);
    if (!valid.some(v => v.row === to.row && v.col === to.col)) return state;

    const newPawns = { ...state.pawns, [state.turn]: to };
    const goalRow = state.turn === 'p1' ? 0 : 8;
    const winner = to.row === goalRow ? state.turn : null;
    const nextTurn = state.turn === 'p1' ? 'p2' : 'p1';

    return {
        ...state,
        pawns: newPawns,
        turn: winner ? state.turn : nextTurn,
        winner,
        phase: winner ? 'gameover' : 'move',
    };
}

export function placeWall(state: GameState, wall: Wall): GameState {
    if (state.winner) return state;
    if (!canPlaceWall(state, wall)) return state;

    return {
        ...state,
        walls: [...state.walls, wall],
        wallCounts: { ...state.wallCounts, [state.turn]: state.wallCounts[state.turn] - 1 },
        turn: state.turn === 'p1' ? 'p2' : 'p1',
    };
}

// Simple AI: move toward goal, occasionally place walls
export function getAIAction(state: GameState): { type: 'move'; to: Pos } | { type: 'wall'; wall: Wall } | null {
    const moves = getValidMoves(state);

    // 30% chance to place a wall if available
    if (state.wallCounts[state.turn] > 0 && Math.random() < 0.3) {
        // Try to place a wall in front of opponent
        const oppPawn = state.pawns[state.turn === 'p1' ? 'p2' : 'p1'];
        const dir = state.turn === 'p2' ? 1 : -1; // p2 moves down (toward row 8)
        const wallRow = oppPawn.row + dir;
        const wallCol = Math.max(0, Math.min(oppPawn.col - 1, BOARD_SIZE - 2));

        for (const orient of ['h', 'v'] as const) {
            const wall: Wall = { row: Math.max(0, Math.min(wallRow, BOARD_SIZE - 2)), col: wallCol, orientation: orient };
            if (canPlaceWall(state, wall)) {
                return { type: 'wall', wall };
            }
        }
    }

    // Move toward goal
    if (moves.length === 0) return null;
    const goalRow = state.turn === 'p1' ? 0 : 8;
    moves.sort((a, b) => Math.abs(a.row - goalRow) - Math.abs(b.row - goalRow));
    return { type: 'move', to: moves[0] };
}
