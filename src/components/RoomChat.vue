<template>
  <Toast />



  <div class="mt-2">
    <Panel header="Connexion" toggleable :collapsed="!collapsed">
      <UserConnexion
        @joinRoomEmit="handleJoinRoom"
        :isConnected="isConnected"
      />
    </Panel>
  </div>


          

  <AfficheRoom :room="roomLocal" :connected-user="connectedUser" :username="usernameLocal" />
  <div class="mt-2">
    <Card>
      <template #title>
        <div class="text-center">
            <Button @click="getInformations" v-tooltip="'Informations'" icon="pi pi-info-circle" class="mr-1"/>
            <Button @click="confirmDisconnect" v-tooltip="'Disconnect'" :disabled="!isConnected" class="mr-1" icon="pi pi-arrow-circle-right" />
        </div>
      </template>
      <template #content>
        <div>
          <InputGroup>
            <InputText
              v-model="message"
              placeholder="Votre message"
              @keydown.enter="sendMessage"
              :disabled="!isConnected"
              maxlength="214"
            />
            <!-- <InputGroupAddon>
              <AfficheEmoji
                v-model="message"
                :isConnected="isConnected"
                :disabled="!isConnected"
              />
            </InputGroupAddon> -->
            <InputGroupAddon>
              <Button
                @click="sendMessage"
                label="📨"
                class="bg-transparent border-none p-3"
                :disabled="!isConnected"
                v-tooltip.bottom="'Send'"
                :class="{ 'p-button-click': isConnected }"
              />
            </InputGroupAddon>
          </InputGroup>
        </div>

        <div class="m-2">
          <Message
            variant="simple"
            size="small"
            :severity="disabled ? 'error' : 'Success'"
            >{{
              !isConnected ? "A connection is required to send messages" : ""
            }}</Message
          >
        </div>

        <MessageUser :message="messages" :myUsername="usernameLocal" />
      </template>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import socket from "../services/SocketIO";
import UserConnexion from "./UserConnexion.vue";
import MessageUser from "./MessageUser.vue";
import AfficheRoom from "./AfficheRoom.vue";
import { useConfirm } from "primevue/useconfirm";
import { useToast } from "primevue/usetoast";
import {
  generateRSAKeys,
  decryptMessage,
  encryptMessage,
} from "../services/rsaService";

import {getUrlLogin, getUrlDisconnect, getMessageInformation} from "../services/UtilsFunctions";
import axios from "axios";

const { privateKey, publicKey } = generateRSAKeys();

const confirm = useConfirm();
const toast = useToast();

const roomLocal = ref("");
const usernameLocal = ref("");
const connectedUser = ref(Array<string>());

const message = ref("");
const disabled = ref(true);
const isConnected = ref(false);

interface MessageUserDecrypted {
  username: string;
  message: string;
}

interface UserKey {
  username: string;
  publicKey: string;
}

interface MessageUser {
  username: string;
  encryptedMessage: string;
}

const usersPublicKeys = ref<Array<UserKey>>([]);
const messages = ref<Array<MessageUserDecrypted>>([]);

const collapsed = computed(() => {
  return disabled.value;
});

//////////////////////////////////////////////////// send de message

const sendMessage = () => {

  if (message.value.trim() !== "") {

    let encryptedMessagesRoom = ref<Array<MessageUser>>([]);
    
    for (const userKey of usersPublicKeys.value) {
      const encryptedMessage = encryptMessage(userKey.publicKey, message.value.trim() );

      encryptedMessagesRoom.value.push({
        username: userKey.username,
        encryptedMessage: encryptedMessage,
      });
    }

    socket.value?.emit("newMessageSend", {
      room: roomLocal.value,
      username: usernameLocal.value,
      encryptedMessagesRoom: encryptedMessagesRoom.value,
    });
  }
  message.value = "";
};

//////////////////////////////////////////////////// get public keys

socket.value?.on("newListKey", (data) => {
  const usersKeys = data.usersKeys;
  // let newConnectedUser = Array<string>();
  if (Array.isArray(usersKeys)) {
    usersPublicKeys.value = usersKeys;
    connectedUser.value = usersKeys.map((userKey) => userKey.username);
  } else {
    console.error("Error : userKeys is not an array", usersKeys);
  }
});

//////////////////////////////////////////////////// Receive message

socket.value?.on("newMessage", ({ username, encryptedMessagesRoom }) => {

  for (let coupleMessUser of encryptedMessagesRoom) {   
    if (coupleMessUser.username === usernameLocal.value) {
      const decryptedMessage = decryptMessage(
        privateKey,
        coupleMessUser.encryptedMessage
      );
      messages.value.push({
        username: username,
        message: decryptedMessage,
      });
    }
  }
});

//////////////////////////////////////////////////// new Connected user

const handleJoinRoom =  (data: { username: string; room: string }) => {


  axios.post(getUrlLogin(), {
    username: data.username,
    room: data.room,
    publicKey: publicKey,
  })
  .then(function (response) {

    if(response.status === 200){

      roomLocal.value = data.room;
      usernameLocal.value = data.username;
      message.value = "";
      disabled.value = false;
      messages.value = [];
      isConnected.value = true;

      socket.value?.emit("join", { username: data.username, room: data.room });

      toast.add({
        severity: "success",
        summary: "Connected",
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

//////////////////////////////////////////////////// disconnect

const disConnect = () => {

  axios.post(getUrlDisconnect(), {
    username: usernameLocal.value,
    room: roomLocal.value
  })
  .then(function (response) {

    if(response.status === 200){
      disabled.value = true;
      roomLocal.value = "";
      usernameLocal.value = "";
      isConnected.value = false;
      messages.value = [];
      message.value = "";

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
    message: "Are you sure you want to disconnect?",
    header: "Confirmation",
    icon: "pi pi-exclamation-circle",
    rejectProps: {
      label: "Cancel",
      severity: "danger",
      outlined: true,
    },
    acceptProps: {
      label: "Accept",
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

// const handleBeforeUnload = (event:any) => {
//   event.preventDefault();
//   // Certains navigateurs nécessitent que cette ligne soit ajoutée pour afficher une boîte de dialogue personnalisée.
//   socket.value?.emit("leave", { username: username.value, room: room.value });
//   event.returnValue = "Are you sure you want to leave? Your data will be lost.";
// };

// onMounted(() => {
//   // Ajouter l'événement avant le démontage du composant
//   window.addEventListener('beforeunload', handleBeforeUnload);
// });

// onBeforeUnmount(() => {
//   // Supprimer l'événement lorsque le composant est démonté
//   window.removeEventListener('beforeunload', handleBeforeUnload);
// });

//////////////////////////////////////////////////// application informations

const getInformations = () => {
   
  confirm.require({
    message: getMessageInformation(),
    header: "Confirm",
    icon: "pi pi-exclamation-circle",
    rejectProps: {
      label: "Cancel",
      severity: "danger",
      outlined: true,
    },
    acceptProps: {
      label: "I understand",
      severity: "success",
    },
  });
};

</script>
