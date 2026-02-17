// ===================== Backgammon Logic (simplified) =====================

export const NUM_POINTS = 24;
export type Player = 'white' | 'black';

export interface GameState {
    // points[0..23]: positive = white pieces, negative = black pieces
    points: number[];
    bar: { white: number; black: number };
    borneOff: { white: number; black: number };
    dice: [number, number];
    remainingMoves: number[];
    turn: Player;
    winner: Player | null;
    phase: 'rolling' | 'moving' | 'gameover';
    message: string;
}

export function initializeGame(): GameState {
    const points = Array(24).fill(0);
    // Standard backgammon setup
    // White moves from point 1 (index 0) toward point 24 (index 23)
    points[0] = 2;    // Point 1
    points[11] = 5;   // Point 12
    points[16] = 3;   // Point 17
    points[18] = 5;   // Point 19

    // Black (negative)
    points[23] = -2;  // Point 24
    points[12] = -5;  // Point 13
    points[7] = -3;   // Point 8
    points[5] = -5;   // Point 6

    return {
        points,
        bar: { white: 0, black: 0 },
        borneOff: { white: 0, black: 0 },
        dice: [0, 0],
        remainingMoves: [],
        turn: 'white',
        winner: null,
        phase: 'rolling',
        message: 'Roll the dice!',
    };
}

export function rollDice(state: GameState): GameState {
    if (state.phase !== 'rolling') return state;
    const d1 = Math.floor(Math.random() * 6) + 1;
    const d2 = Math.floor(Math.random() * 6) + 1;

    const remaining = d1 === d2 ? [d1, d1, d1, d1] : [d1, d2];

    const newState = {
        ...state,
        dice: [d1, d2] as [number, number],
        remainingMoves: remaining,
        phase: 'moving' as const,
        message: `Rolled ${d1} and ${d2}`,
    };

    // Check if any valid moves exist
    if (getValidMoves(newState).length === 0) {
        return {
            ...newState,
            phase: 'rolling',
            turn: state.turn === 'white' ? 'black' : 'white',
            remainingMoves: [],
            message: `No valid moves for ${state.turn}. Turn passes.`,
        };
    }

    return newState;
}

function isWhite(count: number): boolean { return count > 0; }
function isBlack(count: number): boolean { return count < 0; }

function belongs(point: number, player: Player): boolean {
    return player === 'white' ? point > 0 : point < 0;
}

function canBearOff(points: number[], player: Player, bar: { white: number; black: number }): boolean {
    if (player === 'white' && bar.white > 0) return false;
    if (player === 'black' && bar.black > 0) return false;

    if (player === 'white') {
        // All white pieces must be in home board (points 18-23)
        for (let i = 0; i < 18; i++) {
            if (points[i] > 0) return false;
        }
        return true;
    } else {
        // All black pieces must be in home board (points 0-5)
        for (let i = 6; i < 24; i++) {
            if (points[i] < 0) return false;
        }
        return true;
    }
}

export interface Move {
    from: number | 'bar';
    to: number | 'off';
    dieValue: number;
}

export function getValidMoves(state: GameState): Move[] {
    const moves: Move[] = [];
    const { points, bar, turn, remainingMoves } = state;

    if (remainingMoves.length === 0) return moves;

    const uniqueDice = [...new Set(remainingMoves)];

    for (const die of uniqueDice) {
        // From bar
        if (bar[turn] > 0) {
            const target = turn === 'white' ? die - 1 : 24 - die;
            if (target >= 0 && target < 24) {
                const opp = turn === 'white' ? points[target] < -1 : points[target] > 1;
                if (!opp) {
                    moves.push({ from: 'bar', to: target, dieValue: die });
                }
            }
            continue; // Must move from bar first
        }

        // From points
        for (let i = 0; i < 24; i++) {
            if (!belongs(points[i], turn)) continue;

            const target = turn === 'white' ? i + die : i - die;

            // Bearing off
            if (canBearOff(points, turn, bar)) {
                if (turn === 'white' && target >= 24) {
                    moves.push({ from: i, to: 'off', dieValue: die });
                    continue;
                }
                if (turn === 'black' && target < 0) {
                    moves.push({ from: i, to: 'off', dieValue: die });
                    continue;
                }
            }

            if (target < 0 || target >= 24) continue;

            // Check if target is blocked
            const opp = turn === 'white' ? points[target] < -1 : points[target] > 1;
            if (!opp) {
                moves.push({ from: i, to: target, dieValue: die });
            }
        }
    }

    return moves;
}

export function applyMove(state: GameState, moveData: Move): GameState {
    const newPoints = [...state.points];
    const newBar = { ...state.bar };
    const newBorneOff = { ...state.borneOff };
    const newRemaining = [...state.remainingMoves];
    const { turn } = state;
    const add = turn === 'white' ? 1 : -1;

    // Remove die
    const dieIdx = newRemaining.indexOf(moveData.dieValue);
    if (dieIdx !== -1) newRemaining.splice(dieIdx, 1);

    // Remove from source
    if (moveData.from === 'bar') {
        newBar[turn]--;
    } else {
        newPoints[moveData.from] -= add;
    }

    // Place on target
    if (moveData.to === 'off') {
        newBorneOff[turn]++;
    } else {
        // Hit opponent?
        const target = moveData.to;
        if (turn === 'white' && newPoints[target] === -1) {
            newPoints[target] = 0;
            newBar.black++;
        } else if (turn === 'black' && newPoints[target] === 1) {
            newPoints[target] = 0;
            newBar.white++;
        }
        newPoints[target] += add;
    }

    // Check winner
    let winner: Player | null = null;
    if (newBorneOff[turn] === 15) {
        winner = turn;
    }

    const newState: GameState = {
        ...state,
        points: newPoints,
        bar: newBar,
        borneOff: newBorneOff,
        remainingMoves: newRemaining,
        winner,
        phase: winner ? 'gameover' : newRemaining.length === 0 ? 'rolling' : 'moving',
        turn: newRemaining.length === 0 && !winner ? (turn === 'white' ? 'black' : 'white') : turn,
        message: winner ? `${winner} wins!` : '',
    };

    // If no valid moves left with remaining dice, pass turn
    if (newState.phase === 'moving' && getValidMoves(newState).length === 0) {
        return {
            ...newState,
            phase: 'rolling',
            turn: turn === 'white' ? 'black' : 'white',
            remainingMoves: [],
            message: 'No more valid moves.',
        };
    }

    return newState;
}

// Simple AI: picks a random valid move
export function getAIMove(state: GameState): Move | null {
    const moves = getValidMoves(state);
    if (moves.length === 0) return null;

    // Prefer hits, bearing off, then advance
    const hits = moves.filter(m => typeof m.to === 'number' && (
        (state.turn === 'black' && state.points[m.to as number] === 1) ||
        (state.turn === 'white' && state.points[m.to as number] === -1)
    ));
    if (hits.length > 0) return hits[Math.floor(Math.random() * hits.length)];

    const bearOffs = moves.filter(m => m.to === 'off');
    if (bearOffs.length > 0) return bearOffs[Math.floor(Math.random() * bearOffs.length)];

    return moves[Math.floor(Math.random() * moves.length)];
}
