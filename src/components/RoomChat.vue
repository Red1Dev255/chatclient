<template>

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
          <div class="col-12 text-center">
            <Button
                @click="confirmDisconnect"
                icon="pi pi-sign-out" 
                class="p-button-rounded p-button-plain font-bold" 
                v-tooltip.left="'Se déconnecter'"
                :disabled="!isConnected"
                v-if="isConnected"
              />   
          </div>
        </div>
      </template>
      <template #content>

        <div class="col-12">
          <div class="grid">
              <div class="col-12 sm:col-9 md:col-10 lg:col-10">
                <InputText
                  v-model="message"
                  placeholder="Votre message"
                  class="p-3 w-full border-round-sm font-bold"
                  @keydown.enter="sendMessage" 
                  :disabled="!isConnected"
                />
              </div>

              <div class="col-12 sm:col-3 md:col-2 lg:col-2">
                <Button
                  @click="sendMessage"
                  icon="pi pi-send"
                  iconPos="right"
                  label="Envoyer"
                  class="p-3 border-round-sm font-bold"
                  :class="{ 'text-gray-500 surface-500': disabled }"
                  :disabled="!isConnected"
                />            
                </div>
        </div>
        </div>
        <div class="grid">

         <div class="col-10 text-center">
            <Message variant="simple" size="small" :severity="disabled ? 'error' : 'Success' ">{{ disabled ? 'Rejoindre une room afin de pouvoir envoyer des messages':''}}</Message>
          </div>   
          </div>

      </template>
    </Card>
  </div>
<MessageUser :message="messages" :myUsername="username"/> 
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import socket from '../services/SocketIO';
import { onMounted } from 'vue';
import UserConnexion from "./UserConnexion.vue";
import MessageUser from "./MessageUser.vue";
import AfficheRoom from "./AfficheRoom.vue";
import { useConfirm } from "primevue/useconfirm";
import { useToast } from "primevue/usetoast";

const confirm = useConfirm();
const toast = useToast();

const room = ref('');
const username = ref('');
const message = ref('');
const messages = ref<any[]>([]);
const disabled = ref(true);
const toggleable = ref(false);

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

</script>
