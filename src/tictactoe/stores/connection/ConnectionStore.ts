import ConnectionData from "./ConnectionData.ts";

let __instance: null | ConnectionStore = null;

class ConnectionStore{

    #connections = new Map<string, ConnectionData>();
    constructor(){
        if(!__instance){
            __instance = this;
        }
        return __instance;
    }

    setConnection(userId: string, connectionData: ConnectionData){
        this.#connections.set(userId, connectionData);
    }

    getConnection(userId: string){
        return this.#connections.get(userId);
    }

    removeConnection(userId: string){
        this.#connections.delete(userId);
    }

    totalConnections(){
        return this.#connections.size;
    }
}

const i = new ConnectionStore();

export default i;