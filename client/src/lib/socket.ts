import { io } from 'socket.io-client';
import { SOCKET_URL } from '@/lib/env';

// "undefined" means the URL will be computed from the `window.location` object
const URL = SOCKET_URL;

const socket = io(URL, {
    autoConnect: false,
    // Disable automatic reconnection to avoid multi-tab loops
    // will enable once connection sharing is implemented
    reconnection: false,
    timeout: 20000,
    forceNew: true
});

export default socket;