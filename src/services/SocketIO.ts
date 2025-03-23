
import { io, Socket } from "socket.io-client";
import { ref } from "vue";

const socket = ref<Socket | null>(null);
socket.value = io("http://localhost:3000/");

export default socket;



