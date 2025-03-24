<template>

 <Toast position="top-center" group="tc" />

 <div class="m-5">
    <Panel header="Connexion" toggleable :collapsed="!collapsed">
         <UserConnexion @joinRoomEmit="handleJoinRoom" 
         :isConnected='isConnected' 
         />
    </Panel>
 </div>

  <AfficheRoom :room="room" :username="username" />

  <div class="m-5">
    <Card>
      <template #title>
        <div class="grid">
             <div class="col-12 text-right">
                <Button type="button" 
                icon="pi pi-ellipsis-v" 
                @click="toggle" 
                aria-haspopup="true"
                class="p-button-rounded p-button-plain font-bold mr-3"
                 aria-controls="overlay_menu" />
                <Menu ref="menu" id="overlay_menu"
                :model="items" 
                :popup="true" />
            </div>
        </div>
      </template>
      <template #content>

        <div class="col-12">
          <div class="grid">
              <div class="col-12 sm:col-12 md:col-12 lg:col-12">
                <InputText
                  v-model="message"
                  placeholder="Votre message"
                  class="p-3 w-full border-round-sm font-bold"
                  @keydown.enter="sendMessage" 
                  :disabled="!isConnected"
                />
              </div>
              <div>
                  <Message variant="simple" size="small" :severity="disabled ? 'error' : 'Success' ">{{ disabled ? 'Rejoindre une room afin de pouvoir envoyer des messages':''}}</Message>
              </div>
        </div>
        </div>

          <MessageUser :message="messages" :myUsername="username"/> 

      </template>
    </Card>
  </div>

</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import socket from '../services/SocketIO';
import UserConnexion from "./UserConnexion.vue";
import MessageUser from "./MessageUser.vue";
import AfficheRoom from "./AfficheRoom.vue";
import { useConfirm } from "primevue/useconfirm";
import { useToast } from "primevue/usetoast";
import Menu from 'primevue/menu';


const confirm = useConfirm();
const toast = useToast();

const room = ref('');
const username = ref('');
const message = ref('');
const messages = ref<any[]>([]);
const disabled = ref(true);


messages.value = [
  { username: 'user1', message: 'message1' },
  { username: 'user2', message: 'message2' },
  { username: 'user1', message: 'message2' },
  { username: 'user1', message: 'message3' },
  { username: 'user2', message: 'message2' },
  { username: 'user2', message: 'message3' },
  ]

const isConnected = ref(false);

const collapsed = computed(() => {
  return disabled.value ;
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
  message.value = '';

};

socket.value?.on('newMessage', ({ username, message }) => {
   messages.value.push({ username, message });
});

const handleJoinRoom = (data: { username: string, room: string }) => {
  room.value = data.room;
  username.value = data.username;
  disabled.value = false;
  messages.value = [];
  isConnected.value = true; 
  message.value = '';
  socket.value?.emit("join",  { username : username.value, room : room.value});
};


const seDeconnecter = () => {
  disabled.value = true;
  room.value = '';
  username.value = '';
  isConnected.value = false; 
  messages.value = [];
  message.value = '';
  socket.value?.emit("leave", { username : username.value, room : room.value});
};


const confirmDisconnect = () => {
    confirm.require({
        message: 'Êtes-vous sûr de vouloir vous déconnecter ?',
        header: 'Confirmation',
        icon: 'pi pi-exclamation-circle',
        rejectProps: {
            label: 'Annuler',
            severity: 'danger',
            outlined: true
        },
        acceptProps: {
            label: 'Confirmer',
            severity: 'success'
        },
        accept: () => {  
          toast.add({ severity: 'info', summary: 'Connecté', detail: 'Déconnecté(e)', life: 3000 });
          seDeconnecter();
        },
        reject: () => {
            toast.add({ severity: 'error', summary: 'Annulé', detail: 'Déconnexion annulée', life: 3000 });
        }
    });
};

const getInformations = () => {
  const messageInf = "Veuillez noter qu'un rafraîchissement de la page entraînera systématiquement la perte de toutes les données. De même, toute déconnexion entraînera également la suppression de vos informations actuelles. Il est donc important de ne pas quitter la page ou de se déconnecter si vous souhaitez conserver vos données.";
  confirm.require({
        message: messageInf,
        header: 'Important',
        icon: 'pi pi-exclamation-circle',
        rejectProps: {
            label: 'Fermer',
            severity: 'danger',
            outlined: true
        },
        acceptProps: {
            label: "J'ai compris",
            severity: 'success'
        },
    });
  
  };


// menuItems calculé de façon réactive
const menuItems = computed(() => [
  ...(isConnected.value ? [
    {
      label: 'Se déconnecter',
      icon: 'pi pi-sign-out',
      command: () => { confirmDisconnect(); }
    }
  ] : []),
  {
    label: 'Information',
    icon: 'pi pi-info',
    command: () => { getInformations(); }
  }
]);

const menu = ref();
const items = computed(() => [
  {
    label: 'Options',
    items: menuItems.value
  }
]);

const toggle = (event: any) => {
  menu.value.toggle(event);
};

</script>
