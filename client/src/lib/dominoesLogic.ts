// ===================== Dominoes Logic =====================
// Standard double-six (28 tiles), linear chain, scoring

export interface Tile { left: number; right: number; }
export type Player = 'player' | 'cpu';

export interface GameState {
    chain: { tile: Tile; reversed: boolean }[];
    playerHand: Tile[];
    cpuHand: Tile[];
    boneyard: Tile[];
    turn: Player;
    winner: Player | 'draw' | null;
    scores: { player: number; cpu: number };
    message: string;
    consecutivePasses: number;
}

function createAllTiles(): Tile[] {
    const tiles: Tile[] = [];
    for (let i = 0; i <= 6; i++) {
        for (let j = i; j <= 6; j++) {
            tiles.push({ left: i, right: j });
        }
    }
    return tiles;
}

function shuffle<T>(arr: T[]): T[] {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

export function initializeGame(): GameState {
    const tiles = shuffle(createAllTiles());

    return {
        chain: [],
        playerHand: tiles.slice(0, 7),
        cpuHand: tiles.slice(7, 14),
        boneyard: tiles.slice(14),
        turn: 'player',
        winner: null,
        scores: { player: 0, cpu: 0 },
        message: 'Place a tile or draw from boneyard',
        consecutivePasses: 0,
    };
}

function getChainEnds(chain: { tile: Tile; reversed: boolean }[]): [number, number] {
    if (chain.length === 0) return [-1, -1]; // Any tile can start

    const first = chain[0];
    const last = chain[chain.length - 1];

    const leftEnd = first.reversed ? first.tile.right : first.tile.left;
    const rightEnd = last.reversed ? last.tile.left : last.tile.right;

    return [leftEnd, rightEnd];
}

export function getPlayableTiles(hand: Tile[], chain: { tile: Tile; reversed: boolean }[]): { tile: Tile; index: number; side: 'left' | 'right' }[] {
    if (chain.length === 0) {
        return hand.map((tile, index) => ({ tile, index, side: 'right' as const }));
    }

    const [leftEnd, rightEnd] = getChainEnds(chain);
    const playable: { tile: Tile; index: number; side: 'left' | 'right' }[] = [];

    hand.forEach((tile, index) => {
        if (tile.left === leftEnd || tile.right === leftEnd) {
            playable.push({ tile, index, side: 'left' });
        }
        if (tile.left === rightEnd || tile.right === rightEnd) {
            playable.push({ tile, index, side: 'right' });
        }
    });

    return playable;
}

export function playTile(state: GameState, tileIndex: number, side: 'left' | 'right'): GameState {
    if (state.winner) return state;

    const hand = state.turn === 'player' ? [...state.playerHand] : [...state.cpuHand];
    const tile = hand[tileIndex];
    const newChain = [...state.chain];

    if (newChain.length === 0) {
        newChain.push({ tile, reversed: false });
    } else {
        const [leftEnd, rightEnd] = getChainEnds(newChain);

        if (side === 'left') {
            const reversed = tile.right !== leftEnd;
            newChain.unshift({ tile, reversed });
        } else {
            const reversed = tile.left !== rightEnd;
            newChain.push({ tile, reversed });
        }
    }

    hand.splice(tileIndex, 1);

    const handScore = (h: Tile[]) => h.reduce((sum, t) => sum + t.left + t.right, 0);

    // Check win
    let winner: Player | 'draw' | null = null;
    if (hand.length === 0) {
        winner = state.turn;
    }

    const nextTurn = state.turn === 'player' ? 'cpu' : 'player';

    return {
        chain: newChain,
        playerHand: state.turn === 'player' ? hand : state.playerHand,
        cpuHand: state.turn === 'cpu' ? hand : state.cpuHand,
        boneyard: state.boneyard,
        turn: winner ? state.turn : nextTurn,
        winner,
        scores: {
            player: winner === 'player' ? state.scores.player + handScore(state.cpuHand) : state.scores.player,
            cpu: winner === 'cpu' ? state.scores.cpu + handScore(state.playerHand) : state.scores.cpu,
        },
        message: winner ? `${winner === 'player' ? 'You' : 'CPU'} wins the round!` : '',
        consecutivePasses: 0,
    };
}

export function drawTile(state: GameState): GameState {
    if (state.winner || state.boneyard.length === 0) {
        // Pass
        const passes = state.consecutivePasses + 1;
        if (passes >= 2) {
            // Both passed — game over
            const pScore = state.playerHand.reduce((s, t) => s + t.left + t.right, 0);
            const cScore = state.cpuHand.reduce((s, t) => s + t.left + t.right, 0);
            const winner: Player | 'draw' = pScore < cScore ? 'player' : pScore > cScore ? 'cpu' : 'draw';
            return {
                ...state,
                winner,
                message: winner === 'draw' ? "It's a draw!" : `${winner === 'player' ? 'You' : 'CPU'} wins! (Lower pip count)`,
                consecutivePasses: passes,
            };
        }
        return {
            ...state,
            turn: state.turn === 'player' ? 'cpu' : 'player',
            message: `${state.turn === 'player' ? 'You' : 'CPU'} passes.`,
            consecutivePasses: passes,
        };
    }

    const newBoneyard = [...state.boneyard];
    const drawn = newBoneyard.pop()!;

    return {
        ...state,
        playerHand: state.turn === 'player' ? [...state.playerHand, drawn] : state.playerHand,
        cpuHand: state.turn === 'cpu' ? [...state.cpuHand, drawn] : state.cpuHand,
        boneyard: newBoneyard,
        message: state.turn === 'player' ? `Drew [${drawn.left}|${drawn.right}]` : 'CPU drew a tile',
        consecutivePasses: 0,
    };
}

// AI: play highest-value playable tile, or draw
export function getCPUAction(state: GameState): { type: 'play'; index: number; side: 'left' | 'right' } | { type: 'draw' } {
    const playable = getPlayableTiles(state.cpuHand, state.chain);

    if (playable.length === 0) {
        return { type: 'draw' };
    }

    // Pick highest-value tile
    playable.sort((a, b) => (b.tile.left + b.tile.right) - (a.tile.left + a.tile.right));
    return { type: 'play', index: playable[0].index, side: playable[0].side };
}
