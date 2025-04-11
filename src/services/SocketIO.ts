
import { io, Socket } from "socket.io-client";
import { ref } from "vue";
import {getUrl} from "./UtilsFunctions.ts";


const socket = ref<Socket | null>(null);
socket.value = io(getUrl());
console.log('url ' +getUrl()); 

export default socket;



