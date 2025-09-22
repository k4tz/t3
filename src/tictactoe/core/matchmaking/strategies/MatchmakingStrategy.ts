import Challenger from '../../../stores/matchRegistrar/Challenger.ts';

export default abstract class MatchmakingStrategy {
    abstract getPlayerScore(player: Challenger): number;

    abstract isCompatibleMatch(player1Score: number, player2Score: number, queueTimeFactor?: number): boolean;

    abstract getMatchQuality(player1Score: number, player2Score: number, queueTimeFactor?: number): number;
}