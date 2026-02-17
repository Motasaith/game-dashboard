export type Player = "bottom" | "top"; // Bottom is player, Top is AI/Opponent

export type GameState = {
    pits: number[]; // 0-5 (Bottom), 6 (Bottom Store), 7-12 (Top), 13 (Top Store)
    currentPlayer: Player;
    winner: Player | "draw" | null;
    lastSownIndex: number | null;
    animatingPits: number[];
};

export const PITS_COUNT = 14;
export const SEEDS_PER_PIT = 4;

export const BOTTOM_STORE = 6;
export const TOP_STORE = 13;

export function getInitialGameState(): GameState {
    const pits = Array(PITS_COUNT).fill(0);

    // Fill regular pits
    for (let i = 0; i < PITS_COUNT; i++) {
        if (i !== BOTTOM_STORE && i !== TOP_STORE) {
            pits[i] = SEEDS_PER_PIT;
        }
    }

    return {
        pits,
        currentPlayer: "bottom",
        winner: null,
        lastSownIndex: null,
        animatingPits: []
    };
}

export function isValidMove(gameState: GameState, pitIndex: number): boolean {
    if (gameState.winner) return false;

    const isBottomTurn = gameState.currentPlayer === "bottom";

    // Check if pit belongs to current player
    if (isBottomTurn) {
        if (pitIndex < 0 || pitIndex > 5) return false;
    } else {
        if (pitIndex < 7 || pitIndex > 12) return false;
    }

    // Check if pit has seeds
    if (gameState.pits[pitIndex] === 0) return false;

    return true;
}

export function sowSeeds(gameState: GameState, pitIndex: number): GameState {
    let seeds = gameState.pits[pitIndex];
    const newPits = [...gameState.pits];
    newPits[pitIndex] = 0;

    let currentIndex = pitIndex;
    const isBottomTurn = gameState.currentPlayer === "bottom";
    const myStore = isBottomTurn ? BOTTOM_STORE : TOP_STORE;
    const opponentStore = isBottomTurn ? TOP_STORE : BOTTOM_STORE;

    while (seeds > 0) {
        currentIndex = (currentIndex + 1) % PITS_COUNT;

        // Skip opponent's store
        if (currentIndex === opponentStore) continue;

        newPits[currentIndex]++;
        seeds--;
    }

    // Capture Logic
    // If last seed lands in own empty pit and opposite pit has seeds
    let didCapture = false;
    const isMySide = isBottomTurn
        ? (currentIndex >= 0 && currentIndex <= 5)
        : (currentIndex >= 7 && currentIndex <= 12);

    if (isMySide && newPits[currentIndex] === 1 && currentIndex !== myStore) {
        const oppositeIndex = 12 - currentIndex;
        if (newPits[oppositeIndex] > 0) {
            // Capture!
            const captured = newPits[oppositeIndex] + newPits[currentIndex];
            newPits[oppositeIndex] = 0;
            newPits[currentIndex] = 0;
            newPits[myStore] += captured;
            didCapture = true;
        }
    }

    // Determine Next Player
    // If last seed lands in store, get another turn
    const isExtraTurn = currentIndex === myStore;
    let nextPlayer = gameState.currentPlayer;

    if (!isExtraTurn) {
        nextPlayer = gameState.currentPlayer === "bottom" ? "top" : "bottom";
    }

    // Check Game End
    // If one side is empty, game ends. Remaining seeds go to store.
    let bottomEmpty = true;
    for (let i = 0; i <= 5; i++) if (newPits[i] > 0) bottomEmpty = false;

    let topEmpty = true;
    for (let i = 7; i <= 12; i++) if (newPits[i] > 0) topEmpty = false;

    if (bottomEmpty || topEmpty) {
        // Collect remaining seeds
        for (let i = 0; i <= 5; i++) {
            newPits[BOTTOM_STORE] += newPits[i];
            newPits[i] = 0;
        }
        for (let i = 7; i <= 12; i++) {
            newPits[TOP_STORE] += newPits[i];
            newPits[i] = 0;
        }

        const winner = newPits[BOTTOM_STORE] > newPits[TOP_STORE]
            ? "bottom"
            : newPits[BOTTOM_STORE] < newPits[TOP_STORE]
                ? "top"
                : "draw";

        return {
            ...gameState,
            pits: newPits,
            winner,
            lastSownIndex: currentIndex,
            currentPlayer: nextPlayer, // Doesn't matter, game over
            animatingPits: []
        };
    }

    return {
        ...gameState,
        pits: newPits,
        currentPlayer: nextPlayer,
        lastSownIndex: currentIndex,
        animatingPits: []
    };
}

export function getAIMove(gameState: GameState): number {
    const validMoves = [];
    for (let i = 7; i <= 12; i++) {
        if (gameState.pits[i] > 0) validMoves.push(i);
    }

    if (validMoves.length === 0) return -1;

    // 1. Check for extra turn
    for (const move of validMoves) {
        let seeds = gameState.pits[move];
        let finalIndex = (move + seeds) % PITS_COUNT;
        // Logic overly simplified for skipping opponent store, but good heuristic
        // If lands exactly in store (index 13)
        // Need actual simulation for perfect accuracy, but this is simple AI
        const simState = sowSeeds(gameState, move);
        if (simState.currentPlayer === "top" && !simState.winner) return move;
    }

    // 2. Random Valid
    return validMoves[Math.floor(Math.random() * validMoves.length)];
}
