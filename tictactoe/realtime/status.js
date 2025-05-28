export default function statusRT(socket) {
    console.log("Connecting to status checks RT");

    socket.emit("message", { uid: "test" });
}