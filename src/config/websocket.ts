/**
 * @description: Define websocket config variables
 * 
 * @defaults eventBroadcastInterval: 10000
 */

const websocketConfig = {
    eventBroadcastInterval: process.env.GLOBAL_EVENT_BROADCAST_INTERVAL ? parseInt(process.env.GLOBAL_EVENT_BROADCAST_INTERVAL, 10) : 10000
} as const;

export default websocketConfig;