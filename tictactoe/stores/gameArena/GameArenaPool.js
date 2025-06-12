import { GameArena } from './GameArena.js';

class GameArenaPool {
  constructor() {
    if (!GameArenaPool.instance) {
      this.arena = new Map();
      GameArenaPool.instance = this;
    }
    return GameArenaPool.instance;
  }

  createRoom(roomData) {
    const room = new GameArena(roomData);
    this.arena.set(room.roomId, room);
    return room;
  }

  removeRoom(roomId) {
    this.arena.delete(roomId);
  }

  getRoom(roomId) {
    return this.arena.get(roomId);
  }

  addSpectator(roomId, spectator) {
    const room = this.arena.get(roomId);
    if (room) {
      room.spectators.push(spectator);
    }
  }

  addPlayer(roomId, player) {
    const room = this.arena.get(roomId);
    if (room) {
      room.players.push(player);
    }
  }

  getAllarena() {
    return Array.from(this.arena.values());
  }

  clear() {
    this.arena.clear();
  }
}

const instance = new GameArenaPool();
Object.freeze(instance);
export default instance;
