import { io } from 'socket.io-client';
import { SOCKET_URL } from '@/lib/env';

// "undefined" means the URL will be computed from the `window.location` object
const URL = SOCKET_URL;

const socket = io(URL, {
    autoConnect: false,
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: 5,
    timeout: 20000,
    forceNew: true
});

export default socket;