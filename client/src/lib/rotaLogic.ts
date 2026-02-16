export class RotaGame {
    players: { [key: string]: string };
    board: (string | null)[];
    turn: string;
    piecesPlaced: { [key: string]: number };
    phase: 'placing' | 'moving';
    winner: string | null;
    adjacency: { [key: number]: number[] };

    constructor(player1Id: string, player2Id: string) {
        this.players = {
            [player1Id]: 'X',
            [player2Id]: 'O'
        };
        this.board = Array(9).fill(null); // 0-8 indices
        // Random Toss
        this.turn = Math.random() < 0.5 ? player1Id : player2Id;
        this.piecesPlaced = {
            [player1Id]: 0,
            [player2Id]: 0
        };
        this.phase = 'placing'; // 'placing' or 'moving'
        this.winner = null;

        // Adjacency list for Rota board (Circle with center)
        // 0-7 are outer circle, 8 is center
        this.adjacency = {
            0: [1, 7, 8],
            1: [0, 2, 8],
            2: [1, 3, 8],
            3: [2, 4, 8],
            4: [3, 5, 8],
            5: [4, 6, 8],
            6: [5, 7, 8],
            7: [6, 0, 8],
            8: [0, 1, 2, 3, 4, 5, 6, 7]
        };
    }

    makeMove(playerId: string, move: any) {
        if (this.winner) return { error: 'Game is over' };
        if (this.turn !== playerId) return { error: 'Not your turn' };

        const symbol = this.players[playerId];

        if (this.phase === 'placing') {
            const { index } = move;
            if (this.board[index] !== null) return { error: 'Spot taken' };

            this.board[index] = symbol;
            this.piecesPlaced[playerId]++;

            if (this.checkWin(symbol)) {
                this.winner = playerId;
            } else {
                // Check if phase should change
                if (this.piecesPlaced[playerId] === 3 && this.piecesPlaced[this.getOpponent(playerId)] === 3) {
                    this.phase = 'moving';
                }
                this.switchTurn();
            }
        } else {
            // Moving phase
            const { from, to } = move;
            if (this.board[from] !== symbol) return { error: 'Not your piece' };
            if (this.board[to] !== null) return { error: 'Destination occupied' };
            if (!this.adjacency[from].includes(to)) return { error: 'Invalid move' };

            this.board[from] = null;
            this.board[to] = symbol;

            if (this.checkWin(symbol)) {
                this.winner = playerId;
            } else {
                // Check Trapped Condition
                const opponentId = this.getOpponent(playerId);
                if (!this.hasAvailableMoves(opponentId)) {
                    this.winner = playerId; // Current player wins if opponent is trapped
                } else {
                    this.switchTurn();
                }
            }
        }

        return { success: true };
    }

    getOpponent(playerId: string) {
        return Object.keys(this.players).find(id => id !== playerId) || '';
    }

    switchTurn() {
        this.turn = this.getOpponent(this.turn);
    }

    hasAvailableMoves(playerId: string) {
        const symbol = this.players[playerId];
        // Find pieces
        const pieceIndices = this.board.map((val, idx) => val === symbol ? idx : -1).filter(i => i !== -1);

        for (const from of pieceIndices) {
            const neighbors = this.adjacency[from];
            for (const to of neighbors) {
                if (this.board[to] === null) return true;
            }
        }
        return false;
    }

    checkWin(symbol: string) {
        // Win conditions: 3 in a row through center or around circle
        const lines = [
            // Through center
            [0, 8, 4], [1, 8, 5], [2, 8, 6], [3, 8, 7],
            // Around circle (All 8 segments)
            [0, 1, 2], [1, 2, 3], [2, 3, 4], [3, 4, 5],
            [4, 5, 6], [5, 6, 7], [6, 7, 0], [7, 0, 1]
        ];

        return lines.some(line => line.every(index => this.board[index] === symbol));
    }

    getState() {
        return {
            board: this.board,
            turn: this.turn,
            phase: this.phase,
            winner: this.winner,
            players: this.players,
            piecesPlaced: this.piecesPlaced
        };
    }
}
