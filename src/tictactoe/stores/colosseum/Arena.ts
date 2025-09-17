import Ledger from './Ledger.ts';

export interface ArenaData {
    arenaId: string;
    players: [string, string]; // Player IDs
    spectators: string[]; // Spectator IDs
    playerUsernames?: [string, string]; // Player usernames
    matchStartTime?: Date; // When the match started
    autoCloseTimer?: number; // Auto-close timer in seconds
}

export default class Arena {
    private arenaId: string;
    private players: [string, string]; // Player IDs
    private spectators: string[]; // Spectator IDs
    private playerUsernames: [string, string]; // Player usernames
    private Ledger: Ledger;
    private matchStartTime: Date;
    private autoCloseTimer: number;
    private autoCloseTimeout: NodeJS.Timeout | null;
    
    constructor({ arenaId, players, spectators = [], playerUsernames, matchStartTime, autoCloseTimer = 15 }: ArenaData) {
        this.arenaId = arenaId;
        this.players = players;
        this.spectators = spectators;
        this.playerUsernames = playerUsernames || ['Player 1', 'Player 2'];
        this.Ledger = new Ledger();
        this.matchStartTime = matchStartTime || new Date();
        this.autoCloseTimer = autoCloseTimer;
        this.autoCloseTimeout = null;
        
        // Start the auto-close timer
        this.startAutoCloseTimer();
    }

    getArenaId() {
        return this.arenaId;
    }

    getPlayers() {
        return this.players;
    }

    getSpectators() {
        return this.spectators;
    }

    getPlayerUsernames() {
        return this.playerUsernames;
    }

    getLedger() {
        return this.Ledger;
    }

    getWinnerUsername() {
        const winner = this.Ledger.getWinner();
        if (!winner || winner === 'draw') return winner;
        
        // Convert winner mark to username
        const winnerIndex = winner === 'X' ? 0 : 1;
        return this.playerUsernames[winnerIndex];
    }

    addPlayer(playerId: string){
        if (this.players.length < 2) {
            this.players.push(playerId);
        }
    }

    addSpectator(spectatorId: string) {
        this.spectators.push(spectatorId);
    }

    playerBelongsToArena(playerId: string) {
        if (!this.players || !Array.isArray(this.players)) {
            return false;
        }
        return this.players.includes(playerId);
    }

    getPlayerIndex(playerId: string) {
        if (!this.players || !Array.isArray(this.players)) {
            return -1;
        }
        return this.players.findIndex(id => id === playerId);
    }

    startAutoCloseTimer() {
        // Clear any existing timer
        if (this.autoCloseTimeout) {
            clearTimeout(this.autoCloseTimeout);
        }
        
        // Set timer to auto-close the match
        this.autoCloseTimeout = setTimeout(() => {
            console.log(`[Arena] Auto-closing match ${this.arenaId} after ${this.autoCloseTimer} seconds`);
            this.endMatch('timeout');
        }, this.autoCloseTimer * 1000);
        
        console.log(`[Arena] Started auto-close timer for match ${this.arenaId} (${this.autoCloseTimer}s)`);
    }

    stopAutoCloseTimer() {
        if (this.autoCloseTimeout) {
            clearTimeout(this.autoCloseTimeout);
            this.autoCloseTimeout = null;
            console.log(`[Arena] Stopped auto-close timer for match ${this.arenaId}`);
        }
    }

    endMatch(reason: 'timeout' | 'surrender' | 'victory' | 'disconnect' = 'victory') {
        console.log(`[Arena] Ending match ${this.arenaId} - Reason: ${reason}`);
        
        // Stop the auto-close timer
        this.stopAutoCloseTimer();
        
        // Store match data in database
        this.storeMatchData(reason);
        
        // Remove arena from colosseum
        import('./Colosseum.ts').then(module => {
            module.default.removeArena(this.arenaId);
        });
        
        console.log(`[Arena] Match ${this.arenaId} ended and cleaned up`);
    }

    private async storeMatchData(reason: string) {
        try {
            const Match = (await import('../../../db/models/Matches.ts')).default;
            const User = (await import('../../../db/models/User.ts')).default;
            
            // Get user documents for player IDs
            const playerOne = await User.findById(this.players[0]);
            const playerTwo = await User.findById(this.players[1]);
            
            if (!playerOne || !playerTwo) {
                console.error(`[Arena] Could not find users for match ${this.arenaId}`);
                return;
            }
            
            // Determine winner
            let victor = null;
            const winner = this.Ledger.getWinner();
            if (winner && winner !== 'draw') {
                // Convert winner mark to player ID
                const winnerIndex = winner === 'X' ? 0 : 1;
                victor = this.players[winnerIndex];
            }
            
            // Calculate duration
            const duration = Date.now() - this.matchStartTime.getTime();
            
            // Create match record
            const matchData = {
                playerOne: this.players[0],
                playerTwo: this.players[1],
                victor: victor,
                duration: duration,
                startedAt: this.matchStartTime,
                endedAt: new Date(),
                gameSteps: this.Ledger.getGameSteps() || [],
                finalBoardState: this.Ledger.board,
                endReason: reason
            };
            
            const match = new Match(matchData);
            await match.save();
            
            console.log(`[Arena] Stored match data for ${this.arenaId} in database`);
        } catch (error) {
            console.error(`[Arena] Error storing match data for ${this.arenaId}:`, error);
        }
    }

    getMatchStartTime() {
        return this.matchStartTime;
    }

    getAutoCloseTimer() {
        return this.autoCloseTimer;
    }

}
