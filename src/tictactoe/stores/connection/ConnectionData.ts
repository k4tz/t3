import { Socket } from "socket.io";

export interface UserConnectionData{
    id: string;
    username: string;
}

export default class ConnectionData{
    private userData: UserConnectionData;
    private socket: Socket;
    private connectedAt: number;
    private lastActiveAt: number;

    constructor(userData: UserConnectionData, conn: Socket){
        this.userData = userData;
        this.socket = conn;
        this.connectedAt = Date.now();
        this.lastActiveAt = Date.now();
    }

    getUserData(){
        return {...this.userData};
    }

    getSocket(){
        return this.socket;
    }

    updateLastActive(){
        this.lastActiveAt = Date.now();
    }

    isActive(){
        return Date.now() - this.lastActiveAt < 300000;
    }

    getConnectedAt(){
        return this.connectedAt;
    }
}