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
    private inactivityTimeout: NodeJS.Timeout | null;
    private lastActivityTime: Date;
    
    constructor({ arenaId, players, spectators = [], playerUsernames, matchStartTime, autoCloseTimer = 15 }: ArenaData) {
        this.arenaId = arenaId;
        this.players = players;
        this.spectators = spectators;
        this.playerUsernames = playerUsernames || ['Player 1', 'Player 2'];
        this.Ledger = new Ledger();
        this.matchStartTime = matchStartTime || new Date();
        this.autoCloseTimer = autoCloseTimer;
        this.autoCloseTimeout = null;
        this.inactivityTimeout = null;
        this.lastActivityTime = new Date();
        
        // Start inactivity monitoring for abandoned games
        this.startInactivityMonitoring();
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

    startInactivityMonitoring() {
        // Clear any existing inactivity timeout
        if (this.inactivityTimeout) {
            clearTimeout(this.inactivityTimeout);
        }
        
        // Set timer to check for inactivity (30 minutes)
        this.inactivityTimeout = setTimeout(() => {
            const timeSinceLastActivity = Date.now() - this.lastActivityTime.getTime();
            const thirtyMinutes = 30 * 60 * 1000; // 30 minutes in milliseconds
            
            if (timeSinceLastActivity >= thirtyMinutes) {
                console.log(`[Arena] Auto-closing match ${this.arenaId} due to inactivity`);
                this.endMatch('timeout');
            } else {
                // Restart monitoring
                this.startInactivityMonitoring();
            }
        }, 5 * 60 * 1000); // Check every 5 minutes
        
        console.log(`[Arena] Started inactivity monitoring for match ${this.arenaId}`);
    }

    stopInactivityMonitoring() {
        if (this.inactivityTimeout) {
            clearTimeout(this.inactivityTimeout);
            this.inactivityTimeout = null;
            console.log(`[Arena] Stopped inactivity monitoring for match ${this.arenaId}`);
        }
    }

    updateActivity() {
        this.lastActivityTime = new Date();
    }

    endMatch(reason: 'timeout' | 'surrender' | 'victory' | 'disconnect' = 'victory') {
        console.log(`[Arena] Ending match ${this.arenaId} - Reason: ${reason}`);
        
        // Stop all timers
        this.stopAutoCloseTimer();
        this.stopInactivityMonitoring();
        
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
            
            // Update user statistics
            if (victor) {
                // There's a winner - increment wins for winner, losses for loser
                const loserId = victor.toString() === this.players[0].toString() ? this.players[1] : this.players[0];
                
                await User.findByIdAndUpdate(victor, { 
                    $inc: { wins: 1, totalMatches: 1, totalStars: 1 } 
                });
                
                // Decrement one star for the loser, but never below 0
                try {
                    const loserDoc = await User.findById(loserId).select('totalStars');
                    const currentStars = Math.max(0, (loserDoc?.totalStars as number ?? 0));
                    const newStars = Math.max(0, currentStars - 1);
                    await User.findByIdAndUpdate(loserId, { 
                        $set: { totalStars: newStars },
                        $inc: { losses: 1, totalMatches: 1 } 
                    });
                } catch (e) {
                    console.error(`[Arena] Failed to decrement star for loser ${loserId}:`, e);
                    // Fallback: still increment losses and totalMatches
                    await User.findByIdAndUpdate(loserId, { 
                        $inc: { losses: 1, totalMatches: 1 } 
                    });
                }
                
                console.log(`[Arena] Updated stats: Winner ${victor} +1 win and +1 star, Loser ${loserId} +1 loss and -1 star`);
            } else {
                // Draw - increment total matches for both players
                await User.findByIdAndUpdate(this.players[0], { 
                    $inc: { draws: 1, totalMatches: 1 } 
                });
                
                await User.findByIdAndUpdate(this.players[1], { 
                    $inc: { draws: 1, totalMatches: 1 } 
                });
                
                console.log(`[Arena] Updated stats: Draw - both players +1 draw`);
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
