<template>
<Toast />
<ConfirmDialog></ConfirmDialog>
  <div class="m-5">
    <Card>
      <template #title>
         <div class="text-right">
         <Button icon="pi pi-info-circle"
            v-tooltip.top="'help'"
            rounded variant="outlined" 
            class="border-none"  
            @click="openHelp"  />
        </div>
        <div class="text-center">
          <h1 class="text-3xl font-bold">🐦‍🔥 Welcome to Online-Chat</h1>
        </div>
      </template>
      <template #content>
        <div class="grid">
            <div class="col-12 text-center">
                <InputText
                  v-model="room"
                  placeholder = "Room"
                  @keydown.enter.prevent="connexion"
                  maxlength="20"
                  v-tooltip.focus.top="'Room (max 20 characters)'"
                  class="p-3 border-round-sm font-bold col-12 lg:col-6 sm:col-12 md:col-12"
                />
               
            </div>
            <div class="col-12 text-center">
                  <InputText
                    v-model="username"
                    placeholder="Username"
                    v-tooltip.focus.top="'username (max 20 characters)'"
                    maxlength="20"
                    @keydown.enter.prevent="connexion"
                    class=" p-3 border-round-sm font-bold col-12 lg:col-6 sm:col-12 md:col-12"
                  />
            </div>
          </div>

           <div class="grid">
                <div class="col-12 text-center">
                  <Button
                    @click="connexion"
                    icon="pi pi-user"
                    iconPos="left"
                    label="Join"
                    class="p-3 text-black-alpha-90 border-round-sm font-bold col-3 col-12 lg:col-6 sm:col-12 md:col-12"
                  />
                </div>

                
           </div>
      </template>
    </Card>

    <ApplicationInfo class="mt-5" />
    
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useConfirm } from "primevue/useconfirm";
import { useToast } from "primevue/usetoast";
import axios from "axios";
import { getUrlLogin } from "../services/UtilsFunctions";
import socket from "../services/SocketIO";
import {  generateRSAKeys} from "../services/rsaService";
import { useRouter } from 'vue-router';
import ApplicationInfo from './ApplicationInfo.vue';


const confirm = useConfirm();
const router = useRouter();
const toast = useToast();
const room = ref('');
const username = ref('');
const { privateKey, publicKey } = generateRSAKeys();
import {ChatStore} from '../stores/chatStore'
const store = ChatStore();
var regexRoom = /^[a-zA-Z0-9@#$%^&*(),.?":{}|<>-_+=]*$/; 
var regexUsername = /^[a-zA-Z0-9]*$/; 

const openHelp = () => {
  confirmHelp();
 };


const connexion = () => {

  if (room.value && username.value) {
    if (room.value.length > 20 || username.value.length > 20) {
      toast.add({ severity: 'error', summary: 'Invalid Input', detail: 'Username/Room too long (max 20 characters)', life: 3000 });
    } else if (room.value.length < 6 || username.value.length < 4) {
      toast.add({ severity: 'error', summary: 'Invalid Input', detail: 'Username/Room too short (min 4 characters for username and 6 for room)', life: 3000 });
    } else if (!regexRoom.test(room.value)) {
      toast.add({ severity: 'error', summary: 'Invalid Input', detail: 'Room contains invalid characters', life: 3000 });
    } else if (!regexUsername.test(username.value)) {
      toast.add({ severity: 'error', summary: 'Invalid Input', detail: 'Username contains invalid characters', life: 3000 });
    } else {
      confirm1();
    }
  } else {
    toast.add({ severity: 'error', summary: 'Empty Username/Room', detail: 'Please enter your username/room', life: 3000 });}
};


const confirm1 = () => {
    confirm.require({
        message: 'Username  :  ' + username.value + '  ||  Room :  ' + room.value,
        header: 'Confirmation',
        icon: 'pi pi-exclamation-circle',
        rejectProps: {
            label: 'Cancel',
            severity: 'danger',
            outlined: true
        },
        acceptProps: {
            label: 'Connect',
            severity: 'success'
        },
        accept: () => {  
           joinRoom();

        },
        reject: () => {
            toast.add({ severity: 'error', summary: 'Cancelled', detail: 'Connection cancelled', life: 3000 });
        }
    });
};

/////////////////////////// confirm 2

const confirmHelp = () => {
    confirm.require({
        message: "Username accepts only alphanumeric characters and must be between 4 and 20 characters. Room accepts alphanumeric characters and special characters @#$%^&*(),.?\":{}|<>-_+= and must be between 6 and 20 characters.",
        header: 'About Connection',
        icon: 'pi pi-exclamation-circle',
        rejectProps: {
            label: 'Cancel',
            severity: 'danger',
            outlined: true
        },
        acceptProps: {
            label: 'I understand',
            severity: 'success'
        },
    });
};


///////////// Connexion user 

const joinRoom =  () => {

axios.post(getUrlLogin(), {
  username: username.value,
  room: room.value,
  publicKey: publicKey,
})
.then(function (response) {
  
  if(response.status === 200){
    socket.value?.emit("join", { username: username.value, room: room.value });
    socket.value?.on("joinSuccess", (data) => {
      console.log("Connected to Room", data);
      router.push("/chat")
      store.username = username.value;
      store.room = room.value;
      store.privateKey = privateKey;
      store.status = true;
    });
  } else {
    toast.add({
      severity: "error",
      summary: "Error",
      detail: response.data,
      life: 3000,
    });
  }
 
})
.catch(function (error) {
  console.log(error);
  toast.add({
    severity: "error",
    summary: "Error",
    detail: error.response ? error.response.data : error,
    life: 3000,
  });
});

};


</script>

