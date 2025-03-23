
import { io, Socket } from "socket.io-client";
import { ref } from "vue";


const socketHost = process.env.VUE_APP_SOCKET_HOST || 'localhost';
const socketPort = process.env.VUE_APP_SOCKET_PORT || 3000;

const socket = ref<Socket | null>(null);
socket.value = io("http://localhost:3000/");

export default socket;



