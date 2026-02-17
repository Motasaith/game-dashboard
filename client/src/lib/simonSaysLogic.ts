// ===================== Simon Says Logic =====================

export type Color = 'red' | 'green' | 'blue' | 'yellow';
export const COLORS: Color[] = ['red', 'green', 'blue', 'yellow'];

export interface GameState {
    sequence: Color[];
    playerInput: Color[];
    round: number;
    phase: 'idle' | 'showing' | 'input' | 'success' | 'gameover';
    highScore: number;
    activeColor: Color | null;
}

export const INITIAL_STATE: GameState = {
    sequence: [],
    playerInput: [],
    round: 0,
    phase: 'idle',
    highScore: 0,
    activeColor: null,
};

export function startNewRound(state: GameState): GameState {
    const nextColor = COLORS[Math.floor(Math.random() * 4)];
    return {
        ...state,
        sequence: [...state.sequence, nextColor],
        playerInput: [],
        round: state.round + 1,
        phase: 'showing',
        activeColor: null,
    };
}

export function startGame(): GameState {
    const firstColor = COLORS[Math.floor(Math.random() * 4)];
    return {
        sequence: [firstColor],
        playerInput: [],
        round: 1,
        phase: 'showing',
        highScore: 0,
        activeColor: null,
    };
}

export function handlePlayerInput(state: GameState, color: Color): GameState {
    if (state.phase !== 'input') return state;

    const newInput = [...state.playerInput, color];
    const index = newInput.length - 1;

    // Wrong input
    if (newInput[index] !== state.sequence[index]) {
        return {
            ...state,
            playerInput: newInput,
            phase: 'gameover',
            highScore: Math.max(state.highScore, state.round - 1),
            activeColor: null,
        };
    }

    // Completed the sequence
    if (newInput.length === state.sequence.length) {
        return {
            ...state,
            playerInput: newInput,
            phase: 'success',
            highScore: Math.max(state.highScore, state.round),
            activeColor: null,
        };
    }

    // Partial correct
    return {
        ...state,
        playerInput: newInput,
        activeColor: color,
    };
}
