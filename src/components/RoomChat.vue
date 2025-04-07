<template>
  <Toast/>
  <div class="mt-2">
    <Panel header="Connexion" toggleable :collapsed="!collapsed">
      <UserConnexion
        @joinRoomEmit="handleJoinRoom"
        :isConnected="isConnected"
      />
    </Panel>
  </div>

  <AfficheRoom :room="room" :username="username" />

  <div class="mt-2">
    <Card >
      <template #title>
        <Menubar :model="items" />
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
            <InputGroupAddon>
              <AfficheEmoji v-model="message" :isConnected="isConnected" :disabled="!isConnected" />
            </InputGroupAddon>
            <InputGroupAddon>
              <Button
                @click="sendMessage"
                label="📨"
                class="bg-transparent border-none p-3"
                :disabled="!isConnected"
                v-tooltip.bottom="'Send'"
                :class="{'p-button-click' : isConnected}"
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
              !isConnected
                ? "A connection is required to send messages"
                : ""
            }}</Message
          >
        </div>

        <MessageUser :message="messages" :myUsername="username" />
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
import AfficheEmoji from "./AfficheEmoji.vue";
import { useConfirm } from "primevue/useconfirm";
import { useToast } from "primevue/usetoast";
import { generateRSAKeys, decryptMessage, encryptMessage } from '../services/rsaService';
import { checkIfServerDown } from "../services/UtilsFunctions";


const lastPingToServer = ref(0);

const { privateKey, publicKey } = generateRSAKeys();

const confirm = useConfirm();
const toast = useToast();

const room = ref("");
const username = ref("");

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

const usersPublicKeys = ref<UserKey[]>([]);
const messages = ref<MessageUserDecrypted[]>([]);

const collapsed = computed(() => {
  return disabled.value;
});

//////////////////////////////////// Server ping

socket.value?.on("serverIsOk", (isOk) => {
lastPingToServer.value = new Date().getTime();
console.log("server is ok : " + isOk);
});

//////////////////////////////////////////////////// send de message

const sendMessage = () => {

  if(!getServerStatus()) { return ;}

 if (message.value.trim() !== "") {
    let encryptedMessagesRoom = ref<MessageUser[]>([]);
    for(const userKey of usersPublicKeys.value) {
      const encryptedMessage = encryptMessage(userKey.publicKey, message.value);
      encryptedMessagesRoom.value.push({
        username: userKey.username,
        encryptedMessage: encryptedMessage,
      });
    }

    socket.value?.emit("newMessageSend", {
      room: room.value,
      usernameSender: username.value,
      encryptedMessagesRoom: encryptedMessagesRoom.value,
    });
  }
  message.value = "";
};

//////////////////////////////////////////////////// get public keys


socket.value?.on("newListKey", (data) => {
  const usersKeys = data.usersKeys; 
  if (Array.isArray(usersKeys)) { 
    usersPublicKeys.value = usersKeys;
  } else {
    console.error("Error : userKeys is not an array", usersKeys);
  }
});

//////////////////////////////////////////////////// Receive message

socket.value?.on("newMessage", ({ usernameSender, encryptedMessagesRoom}) => {
  for (let coupleMessUser of encryptedMessagesRoom) {
    if (coupleMessUser.username === username.value) {
      const decryptedMessage = decryptMessage(privateKey, coupleMessUser.encryptedMessage);
      messages.value.push({
        username: usernameSender,
        message: decryptedMessage,
      });
    }
}
});

//////////////////////////////////////////////////// new Connected user



const handleJoinRoom = (data: { username: string; room: string }) => {

  let joinRoom = true;
  if(!getServerStatus()) { return; }
  
  if(joinRoom){
    socket.value?.emit("join", { username: data.username, room: data.room, publicKey : publicKey });
    joinRoom = false;
    socket.value?.on("joinSuccess", ( { success, detailsMessage})=>{
    if (success) {
      // Mettre à jour l'interface après la réussite
      room.value = data.room;
      username.value = data.username;
      message.value = "";
      disabled.value = false;
      messages.value = [];
      isConnected.value = true;
      lastPingToServer.value = new Date().getTime();
      toast.add({
        severity: "success",
        summary: "Connected",
        detail: detailsMessage,
        life: 3000,
      });
    } else {
      toast.add({
        severity: "error",
        summary: "Failed to connect",
        detail: detailsMessage,
        life: 3000,
      });
    }
    joinRoom = true;
  });
  } else {
    toast.add({
      severity: "error",
      summary: "Connection",
      detail: "Connection in progress",
      life: 3000,
    });
  }

  
};

//////////////////////////////////////////////////// disconnect

const disConnect = () => {

if(!getServerStatus()) { return}

  socket.value?.emit("leave", { username: username.value, room: room.value });
  disabled.value = true;
  room.value = "";
  username.value = "";
  isConnected.value = false;
  messages.value = [];
  message.value = "";

  toast.add({
    severity: "error",
    summary: "Disconnected",
    detail: "Disconnected from the room",
    life: 3000,
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
  const messageInf =
    "Please note that refreshing the page will systematically result in the loss of all data. Similarly, any disconnection will also lead to the deletion of your current information. Therefore, it is important not to leave the page or disconnect if you wish to retain your data.";
  confirm.require({
    message: messageInf,
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

/// Menu items for the menubar
const menuItems = computed(() => [
  ...(isConnected.value
    ? [
        {
          label: "Disconnect",
          icon: "pi pi-sign-out",
          command: () => {
            confirmDisconnect();
          },
        },
      ]
    : []),
  {
    label: "Informations",
    icon: "pi pi-info",
    command: () => {
      getInformations();
    },
  },
]);

const items = computed(() => [
  {
    label: "Options",
    items: menuItems.value,
  },
]);

////////////////////////////////////: verify if the server is down

const getServerStatus = () => {
  if (checkIfServerDown(lastPingToServer.value) && lastPingToServer.value !== 0) {
    toast.add({
      severity: "error",
      summary: "Server Down",
      detail: "The server is down, please try again later.",
      life: 3000,
    });
    return false;
  } 
  return true;
};

</script>

