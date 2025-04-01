<template>
  <Toast position="top-center" group="tc" />

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
            <!-- <InputGroupAddon>
              <AfficheEmoji v-model="message" :isConnected="isConnected" :disabled="!isConnected" />
            </InputGroupAddon> -->
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
// import AfficheEmoji from "./AfficheEmoji.vue";
import { useConfirm } from "primevue/useconfirm";
import { useToast } from "primevue/usetoast";
import { generateRSAKeys, decryptMessage, encryptMessage } from '../services/rsaService';


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



//////////////////////////////////////////////////// send de message

const sendMessage = () => {
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
    console.error("Erreur : usersKeys n'est pas un tableau", usersKeys);
  }
});

//////////////////////////////////////////////////// Receive message

socket.value?.on("newMessage", ({ usernameSender, encryptedMessagesRoom}) => {
  for (let coupleMessUser of encryptedMessagesRoom) {
    if (coupleMessUser.username === username.value) {
      console.log("add message ", usernameSender, " : ", coupleMessUser.encryptedMessage);
      const decryptedMessage = decryptMessage(privateKey, coupleMessUser.encryptedMessage);
      messages.value.push({
        username: usernameSender,
        message: decryptedMessage,
      });
    }
}
});

//////////////////////////////////////////////////// new Connected user

interface JoinSuccessResponse {
  success: boolean;
  detailsMessage: string;
}

const handleJoinRoom = (data: { username: string; room: string }) => {
  // Marque l'événement de succès comme non reçu initialement
  let joinSuccessReceived = false;

  // Fonction pour gérer le succès de la connexion
  const onJoinSuccess = ({ success, detailsMessage } :JoinSuccessResponse) => {
    joinSuccessReceived = true; // Marquer que la réponse a été reçue

    if (success) {
      // Mettre à jour l'interface après la réussite
      room.value = data.room;
      username.value = data.username;
      message.value = "";
      disabled.value = false;
      messages.value = [];
      isConnected.value = true;
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
    socket.value?.removeListener("joinSuccess", onJoinSuccess);
  };

  socket.value?.emit("join", { username: data.username, room: data.room, publicKey : publicKey });
  socket.value?.on("joinSuccess", onJoinSuccess);

  setTimeout(() => {
    if (!joinSuccessReceived) {
      toast.add({
        severity: "danger",
        summary: "Connection failed",
        detail: "The server did not respond in time. Please try again.",
        life: 3000,
      });
      isConnected.value = false;  
      disabled.value = true; 
      
      socket.value?.removeListener("joinSuccess", onJoinSuccess);
    }
  }, 3000);  // wait 3 secondes before checking if the response was received
};


//////////////////////////////////////////////////// disconnect

const seDeconnecter = () => {
  socket.value?.emit("leave", { username: username.value, room: room.value });
  disabled.value = true;
  room.value = "";
  username.value = "";
  isConnected.value = false;
  messages.value = [];
  message.value = "";
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
      toast.add({
        severity: "warn",
        summary: "Disconnected",
        detail: "Disconnected from the room",
        life: 3000,
      });
      seDeconnecter();
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


// const handleBeforeUnload = (event) => {
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
</script>

