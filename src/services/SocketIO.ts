
import { io, Socket } from "socket.io-client";
import { ref } from "vue";



const socketHost = import.meta.env.VITE_SOCKET_HOST;
const socketPort = import.meta.env.VITE_SOCKET_PORT;

let socketUrl = `http://${socketHost}`;  

if (socketPort) {
  socketUrl = `http://${socketHost}:${socketPort}`;
}

const socket = ref<Socket | null>(null);
socket.value = io(socketUrl);
console.log('url ' +socketUrl )

export default socket;



