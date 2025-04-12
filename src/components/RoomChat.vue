<template>
  <ConfirmDialog></ConfirmDialog>
  <Toast />
  <AfficheRoom v-model:roomStatus="roomStatus" :userCount="userCount" :room="piniaStore.room" :username="piniaStore.username" />
  <div class="mt-2">
    <Card>
      <template #title>
        <div class="grid">
         <i class="col-9 inline-block p-4 pi pi-comments"><b class="ml-2">MESSAGES</b></i>
         <span class="text-right col-3">
           <Button icon="pi pi-sign-out" style="font-size: 1rem" v-tooltip.left="'Disconnect'" rounded variant="outlined"  @click="confirmDisconnect"  />
         </span>
        </div>

      </template>

      <template #content>
        <div class="mt-2">
          <InputGroup>
            <InputText
              v-model="message"
              placeholder="Votre message"
              @keydown.enter="sendMessage"
              maxlength="214"
            />
            <InputGroupAddon>
              <Button
                @click="sendMessage"
                label="📨"
                class="bg-transparent border-none p-3"
                v-tooltip.bottom="'Send'"
              />
            </InputGroupAddon>
          </InputGroup>
        </div>
        <MessageUser/>
      </template>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import axios from "axios";
import socket from "../services/SocketIO";
// import UserConnexion from "./UserConnexion.vue";
import MessageUser from "./MessageUser.vue";
import AfficheRoom from "./AfficheRoom.vue";
import { useConfirm } from "primevue/useconfirm";
import { useToast } from "primevue/usetoast";
import {
  decryptMessage,
  encryptMessage,
} from "../services/rsaService";
import { useRouter } from "vue-router";
import {getUrlDisconnect} from "../services/UtilsFunctions";


import {ChatStore} from '../stores/chatStore'
const piniaStore = ChatStore() 


const confirm = useConfirm();
const toast = useToast();
const router = useRouter();
const message = ref("");
const userCount = computed(() => piniaStore.connectedUsers.length);

const roomStatus = ref(true);

interface MessageUser {
  username: string;
  encryptedMessage: string;
}

//////////////////////////////////////////////////// send de message

const sendMessage = () => {


  if (message.value.trim() !== "") {

    if (message.value.length > 214) {
      toast.add({
        severity: "error",
        summary: "Too long",
        detail: "Message too long (max 214 characters)",
        life: 3000,
      });
      return;
    }
    let encryptedMessagesRoom = ref<Array<MessageUser>>([]);

      
    for (const userKey of piniaStore.usersPublicKeys) {
      const encryptedMessage = encryptMessage(userKey.publicKey, message.value.trim() );

      
      encryptedMessagesRoom.value.push({
        username: userKey.username,
        encryptedMessage: encryptedMessage,
      });
    }

    socket.value?.emit("newMessageSend", {
      room: piniaStore.room,
      username: piniaStore.username,
      encryptedMessagesRoom: encryptedMessagesRoom.value,
    });
  }
  message.value = "";
};

//////////////////////////////////////////////////// get public keys


socket.value?.on("newListKey", (data) => {
  const { usersKeys } = data;
  if (Array.isArray(usersKeys)) {
    // usersPublicKeys.value = usersKeys;
    piniaStore.usersPublicKeys = usersKeys;
    const connectedUsers = usersKeys.map((userKey) => userKey.username);
    piniaStore.connectedUsers = connectedUsers;

  } else {
    console.error("Error : userKeys is not an array", usersKeys);
  }
});

//////////////////////////////////////////////////// Receive message

socket.value?.off("newMessage");

socket.value?.on("newMessage", ({ username, encryptedMessagesRoom }) => {

  for (let coupleMessUser of encryptedMessagesRoom) {   
    if (coupleMessUser.username === piniaStore.username) {

      const decryptedMessage = decryptMessage(
        piniaStore.privateKey,
        coupleMessUser.encryptedMessage
      );

      piniaStore.messages.push({
        username: username,
        message: decryptedMessage,
      });


    }
  }

});


/////////////////////////// change new Status room

socket.value?.on("changeRoomStatus", ({status}) => {
  roomStatus.value = status;
});


//////////////////////////////////////////////////// disconnect

const disConnect = () => {

  axios.post(getUrlDisconnect(), {
    username: piniaStore.username,
    room: piniaStore.room,
  })
  .then(function (response) {
    if(response.status === 200){
      piniaStore.resetSession(); // méthode dans le store
      message.value = ""; // si message est une variable réactive locale

      router.push("/closed");
      toast.add({
        severity: "success",
        summary: "Disconnected",
        detail: response.data,
        life: 3000,
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
    toast.add({
      severity: "error",
      summary: "Error",
      detail: error.response ? error.response.data : error,
      life: 3000,
    });
  });
};

const confirmDisconnect = () => {
  confirm.require({
    message: "All your data will be lost. Are you sure?",
    header: "Disconnect",
    icon: "pi pi-exclamation-circle",
    rejectProps: {
      label: "Cancel",
      severity: "danger",
      outlined: true,
    },
    acceptProps: {
      label: "Confirm",
      severity: "success",
    },
    accept: () => {
      disConnect();
    },
    reject: () => {
      toast.add({
        severity: "error",
        summary: "Cancelled",
        detail: "Disconnection cancelled",
        life: 3000,
      });
    },
  });
};

</script>
