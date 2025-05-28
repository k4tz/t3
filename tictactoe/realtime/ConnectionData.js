export default class ConnectionData{
    constructor(userData, conn){
        this.userData = userData;
        this.conn = conn;
        this.connectedAt = Date.now();
        this.lastActiveAt = Date.now();
    }

    updateLastActive(){
        this.lastActiveAt = Date.now();
    }

    isActive(){
        return Date.now() - this.lastActiveAt < 300000;
    }
}