<template>
  <Toast position="top-center" group="tc" />

  <div class="m-5">
    <Panel header="Connexion" toggleable :collapsed="!collapsed">
      <UserConnexion
        @joinRoomEmit="handleJoinRoom"
        :isConnected="isConnected"
      />
    </Panel>
  </div>

  <AfficheRoom :room="room" :username="username" />

  <div class="m-5">
    <Card style="margin: 10px">
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
                v-tooltip.bottom="'Envoyer'"
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
              disabled
                ? "Une connexion est requise pour envoyer des messages"
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


const confirm = useConfirm();
const toast = useToast();
const room = ref("");
const username = ref("");
const message = ref("");
const messages = ref<any[]>([]);
const disabled = ref(true);
const isConnected = ref(false);


const collapsed = computed(() => {
  return disabled.value;
});

// Fonction pour envoyer un message
const sendMessage = () => {
  if (message.value.trim() !== "") {
    socket.value?.emit("message", {
      room: room.value,
      username: username.value,
      message: message.value,
    });
  }
  message.value = "";
};

socket.value?.on("newMessage", ({ username, message }) => {
  messages.value.push({ username, message });
});


interface JoinSuccessResponse {
  success: boolean;
  // Add other properties if needed
}

const handleJoinRoom = (data: { username: string; room: string }) => {
  // Marque l'événement de succès comme non reçu initialement
  let joinSuccessReceived = false;

  // Fonction pour gérer le succès de la connexion
  const onJoinSuccess = ({ success } :JoinSuccessResponse) => {
    joinSuccessReceived = true; // Marquer que la réponse a été reçue

    if (success) {
      console.log("Vous avez bien rejoint la salle !");
      // Mettre à jour l'interface après la réussite
      room.value = data.room;
      username.value = data.username;
      message.value = "";
      disabled.value = false;
      messages.value = [];
      isConnected.value = true;
      toast.add({
        severity: "success",
        summary: "Connexion réussie",
        detail: "Vous êtes connecté(e) à la salle : " + data.room,
        life: 3000,
      });
    } else {
      toast.add({
        severity: "error",
        summary: "Erreur de connexion",
        detail: "Impossible de rejoindre la salle : " + data.room,
        life: 3000,
      });
    }
    // Après avoir reçu la réponse, on supprime l'événement
    socket.value?.removeListener("joinSuccess", onJoinSuccess);
  };

  // Émettre l'événement 'join' au serveur
  socket.value?.emit("join", { username: data.username, room: data.room });

  // Enregistrer le gestionnaire d'événement pour 'joinSuccess'
  socket.value?.on("joinSuccess", onJoinSuccess);

  // Ajouter un délai d'attente de 3 secondes (ou la durée que tu préfères)
  setTimeout(() => {
    if (!joinSuccessReceived) {
      toast.add({
        severity: "warn",
        summary: "Alerte",
        detail: "Le serveur ne répond pas. Veuillez réessayer.",
        life: 3000,
      });
      isConnected.value = false;  // Mettre l'état de connexion à false
      disabled.value = true;  // Désactiver les actions de l'utilisateur si l'opération échoue
      
      // Nettoyer l'événement joinSuccess si le délai est atteint sans réponse
      socket.value?.removeListener("joinSuccess", onJoinSuccess);
    }
  }, 3000);  // Attendre 3 secondes avant d'annuler
};




const seDeconnecter = () => {
  disabled.value = true;
  room.value = "";
  username.value = "";
  isConnected.value = false;
  messages.value = [];
  message.value = "";
  socket.value?.emit("leave", { username: username.value, room: room.value });
};

const confirmDisconnect = () => {
  confirm.require({
    message: "Êtes-vous sûr de vouloir vous déconnecter ?",
    header: "Confirmation",
    icon: "pi pi-exclamation-circle",
    rejectProps: {
      label: "Annuler",
      severity: "danger",
      outlined: true,
    },
    acceptProps: {
      label: "Confirmer",
      severity: "success",
    },
    accept: () => {
      toast.add({
        severity: "warn",
        summary: "Déconnexion",
        detail: "Déconnecté(e)",
        life: 3000,
      });
      seDeconnecter();
    },
    reject: () => {
      toast.add({
        severity: "error",
        summary: "Annulé",
        detail: "Déconnexion annulée",
        life: 3000,
      });
    },
  });
};

const getInformations = () => {
  const messageInf =
    "Veuillez noter qu'un rafraîchissement de la page entraînera systématiquement la perte de toutes les données. De même, toute déconnexion entraînera également la suppression de vos informations actuelles. Il est donc important de ne pas quitter la page ou de se déconnecter si vous souhaitez conserver vos données.";
  confirm.require({
    message: messageInf,
    header: "Important",
    icon: "pi pi-exclamation-circle",
    rejectProps: {
      label: "Fermer",
      severity: "danger",
      outlined: true,
    },
    acceptProps: {
      label: "J'ai compris",
      severity: "success",
    },
  });
};

// menuItems calculé de façon réactive
const menuItems = computed(() => [
  ...(isConnected.value
    ? [
        {
          label: "Se déconnecter",
          icon: "pi pi-sign-out",
          command: () => {
            confirmDisconnect();
          },
        },
      ]
    : []),
  {
    label: "Information",
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

