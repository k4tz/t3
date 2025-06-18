export default class Ledger {
    constructor() {
        this.boardState = [
            ['', '', ''],
            ['', '', ''],
            ['', '', '']
        ];
        this.gameSteps = [];
        this.xMoveSet = [];
        this.oMoveSet = [];
        this.lastMove = '';
        this.winner = '';
        this.currentStep = 9;
        this.leadingMark = '';
        this.winnerPlacements = [];
        this.isReplaying = false;
    }

    isValidMove(player, row, col) {
        // Only allow if cell is empty and it's the player's turn
        if (this.winner) return false;
        if (row < 0 || row > 2 || col < 0 || col > 2) return false;
        if (this.boardState[row][col]) return false;
        // First move: leadingMark
        if (!this.leadingMark) {
            return true;
        }
        // After first move, enforce turn order
        const expected = this.lastMove === 'X' ? 'O' : 'X';
        return player === expected;
    }

    applyMove(player, row, col) {
        if (!this.isValidMove(player, row, col)) return false;
        this.boardState[row][col] = player;
        this.lastMove = player;
        const moveIdx = 3 * row + col;
        if (player === 'X') {
            this.xMoveSet.push(moveIdx);
        } else {
            this.oMoveSet.push(moveIdx);
        }
        this.gameSteps.push(this.boardState.map(row => row.slice()));
        if (!this.leadingMark) this.leadingMark = player;
        this.currentStep--;
        this.checkVictory();
        return true;
    }

    checkVictory() {
        // Check all win conditions
        const b = this.boardState;
        const lines = [
            // Rows
            [[0,0],[0,1],[0,2]],
            [[1,0],[1,1],[1,2]],
            [[2,0],[2,1],[2,2]],
            // Columns
            [[0,0],[1,0],[2,0]],
            [[0,1],[1,1],[2,1]],
            [[0,2],[1,2],[2,2]],
            // Diagonals
            [[0,0],[1,1],[2,2]],
            [[0,2],[1,1],[2,0]]
        ];
        for (const line of lines) {
            const [a, b1, c] = line;
            const v = b[a[0]][a[1]];
            if (v && v === b[b1[0]][b1[1]] && v === b[c[0]][c[1]]) {
                this.winner = v;
                this.winnerPlacements = line.map(([r, c]) => 3*r+c);
                return v;
            }
        }
        if (this.currentStep === 0 && !this.winner) {
            this.winner = 'draw';
        }
        return this.winner;
    }

    switchTurn() {
        if (!this.lastMove) return 'X';
        return this.lastMove === 'X' ? 'O' : 'X';
    }
}

