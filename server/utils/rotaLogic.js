class RotaGame {
    constructor(player1Id, player2Id) {
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

    makeMove(playerId, move) {
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
                this.switchTurn();
            }
        }

        return { success: true };
    }

    getOpponent(playerId) {
        return Object.keys(this.players).find(id => id !== playerId);
    }

    switchTurn() {
        this.turn = this.getOpponent(this.turn);
    }

    checkWin(symbol) {
        // Win conditions: 3 in a row through center or around circle (Corner-Edge-Corner only)
        const lines = [
            // Through center
            [0, 8, 4], [1, 8, 5], [2, 8, 6], [3, 8, 7],
            // Around circle (Corner-Edge-Corner)
            [0, 1, 2], [2, 3, 4], [4, 5, 6], [6, 7, 0]
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

module.exports = RotaGame;
