// ===================== Mahjong Solitaire Logic =====================
// Tile matching/removal puzzle

export interface Tile {
    id: number;
    suit: string;
    value: number;
    label: string;
    emoji: string;
    row: number;
    col: number;
    layer: number;
    removed: boolean;
}

export interface GameState {
    tiles: Tile[];
    selected: number | null;
    matchesFound: number;
    totalPairs: number;
    winner: boolean;
    stuck: boolean;
}

const SUITS = [
    { suit: 'bamboo', emoji: '🎋', count: 9 },
    { suit: 'circle', emoji: '🔴', count: 9 },
    { suit: 'character', emoji: '🀄', count: 9 },
    { suit: 'wind', emoji: '🌬', count: 4 },
    { suit: 'dragon', emoji: '🐉', count: 3 },
];

function shuffle<T>(arr: T[]): T[] {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

function generateLayout(): { row: number; col: number; layer: number }[] {
    const positions: { row: number; col: number; layer: number }[] = [];

    // Layer 0: 8x6 base (48 positions, we'll use 36)
    for (let r = 0; r < 6; r++) {
        for (let c = 0; c < 8; c++) {
            if ((r === 0 || r === 5) && (c === 0 || c === 7)) continue; // Skip corners
            positions.push({ row: r, col: c, layer: 0 });
        }
    }

    // Layer 1: 6x4 (24 positions, we'll use 16) centered
    for (let r = 1; r < 5; r++) {
        for (let c = 1; c < 7; c++) {
            if ((r === 1 || r === 4) && (c === 1 || c === 6)) continue;
            positions.push({ row: r, col: c, layer: 1 });
        }
    }

    // Layer 2: 4x2 top (8 positions)
    for (let r = 2; r < 4; r++) {
        for (let c = 2; c < 6; c++) {
            positions.push({ row: r, col: c, layer: 2 });
        }
    }

    // Layer 3: 2x1 peak
    positions.push({ row: 2, col: 3, layer: 3 });
    positions.push({ row: 3, col: 3, layer: 3 });
    positions.push({ row: 2, col: 4, layer: 3 });
    positions.push({ row: 3, col: 4, layer: 3 });

    return positions;
}

export function initializeGame(): GameState {
    const layout = generateLayout();
    const numTiles = layout.length;

    // Ensure even number (for pairs)
    const pairCount = Math.floor(numTiles / 2);
    const usedPositions = layout.slice(0, pairCount * 2);

    // Create pairs of tiles
    const tileTypes: { suit: string; value: number; label: string; emoji: string }[] = [];
    for (const s of SUITS) {
        for (let v = 1; v <= s.count; v++) {
            tileTypes.push({
                suit: s.suit,
                value: v,
                label: `${s.suit}-${v}`,
                emoji: s.emoji,
            });
        }
    }

    // Select enough types for our pairs
    const neededTypes = pairCount;
    let selectedTypes: typeof tileTypes = [];
    while (selectedTypes.length < neededTypes) {
        selectedTypes = [...selectedTypes, ...shuffle(tileTypes)];
    }
    selectedTypes = selectedTypes.slice(0, neededTypes);

    // Create pairs
    const pairedTiles = shuffle([...selectedTypes, ...selectedTypes]);

    const tiles: Tile[] = usedPositions.map((pos, i) => ({
        id: i,
        ...pairedTiles[i],
        ...pos,
        removed: false,
    }));

    return {
        tiles,
        selected: null,
        matchesFound: 0,
        totalPairs: pairCount,
        winner: false,
        stuck: false,
    };
}

export function isTileFree(tile: Tile, tiles: Tile[]): boolean {
    if (tile.removed) return false;

    // Check if blocked from above (higher layer on same or overlapping position)
    const blockedAbove = tiles.some(t =>
        !t.removed && t.layer > tile.layer &&
        Math.abs(t.row - tile.row) < 1.5 && Math.abs(t.col - tile.col) < 1.5
    );
    if (blockedAbove) return false;

    // Check if blocked from both left AND right on the same layer
    const blockedLeft = tiles.some(t =>
        !t.removed && t.layer === tile.layer && t.row === tile.row && t.col === tile.col - 1
    );
    const blockedRight = tiles.some(t =>
        !t.removed && t.layer === tile.layer && t.row === tile.row && t.col === tile.col + 1
    );

    return !(blockedLeft && blockedRight);
}

export function tilesMatch(a: Tile, b: Tile): boolean {
    return a.suit === b.suit && a.value === b.value && a.id !== b.id;
}

export function selectTile(state: GameState, tileId: number): GameState {
    if (state.winner) return state;

    const tile = state.tiles.find(t => t.id === tileId);
    if (!tile || tile.removed || !isTileFree(tile, state.tiles)) return state;

    if (state.selected === null) {
        return { ...state, selected: tileId };
    }

    if (state.selected === tileId) {
        return { ...state, selected: null };
    }

    const selectedTile = state.tiles.find(t => t.id === state.selected)!;

    if (tilesMatch(tile, selectedTile)) {
        const newTiles = state.tiles.map(t =>
            t.id === tile.id || t.id === selectedTile.id ? { ...t, removed: true } : t
        );
        const newMatches = state.matchesFound + 1;
        const isWin = newMatches === state.totalPairs;

        return {
            tiles: newTiles,
            selected: null,
            matchesFound: newMatches,
            totalPairs: state.totalPairs,
            winner: isWin,
            stuck: !isWin && !hasAvailableMatches(newTiles),
        };
    }

    // No match — select the new tile instead
    return { ...state, selected: tileId };
}

function hasAvailableMatches(tiles: Tile[]): boolean {
    const freeTiles = tiles.filter(t => !t.removed && isTileFree(t, tiles));
    for (let i = 0; i < freeTiles.length; i++) {
        for (let j = i + 1; j < freeTiles.length; j++) {
            if (tilesMatch(freeTiles[i], freeTiles[j])) return true;
        }
    }
    return false;
}

export function getHint(state: GameState): [number, number] | null {
    const freeTiles = state.tiles.filter(t => !t.removed && isTileFree(t, state.tiles));
    for (let i = 0; i < freeTiles.length; i++) {
        for (let j = i + 1; j < freeTiles.length; j++) {
            if (tilesMatch(freeTiles[i], freeTiles[j])) {
                return [freeTiles[i].id, freeTiles[j].id];
            }
        }
    }
    return null;
}
