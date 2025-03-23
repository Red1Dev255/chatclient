<template>

 <div class="m-5">
    <Panel header="Connexion" toggleable :collapsed="!collapsed">
         <UserConnexion @joinRoomEmit="handleJoinRoom"/>
    </Panel>
 </div>

  <div class="m-5">
    <Card>
      <template #title>
        <div class="col-12 text-center">
          <i class="pi pi-comment"></i> Chat
        </div>
      </template>
      <template #content>
        <div class="grid">
          <div class="col-12 text-center">Room: {{ room }}</div>
          <div class="col-12 text-center">Username: {{ username }}</div>
        </div>

        <div class="grid">
          <div class="col-10">
            <InputText
              v-model="message"
              placeholder="Votre message"
              class="p-3 w-full border-round-sm font-bold"
               @keydown.enter="sendMessage" 
            />
          </div>

          <div class="col-2">
            <Button
              @click="sendMessage"
              icon="pi pi-send"
              iconPos="right"
              label="Envoyer"
              class="p-3 border-round-sm font-bold"
              :class="{ 'text-gray-500 surface-500': disabled }"
              :disabled="disabled"

            />            
          </div>
        </div>

        <div class="grid">

         <div class="col-10 text-center">
            <Message variant="simple" size="small" :severity="disabled ? 'error' : 'Success' ">{{ disabled ? 'Rejoindre une room afin de pouvoir envoyer des message':''}}</Message>
          </div>   
          </div>

      </template>
    </Card>
  </div>
<MessageUser :message="messages" :myUsername="username"/> 
</template>

<script setup lang="ts">
import Card from 'primevue/card';
import InputText from 'primevue/inputtext';
import Button from 'primevue/button';
import { computed, ref } from 'vue';
import socket from '../services/SocketIO';
import { onMounted } from 'vue';
import Message from 'primevue/message';
import UserConnexion from "./UserConnexion.vue";
import Panel from 'primevue/panel';
import MessageUser from "./MessageUser.vue";

const room = ref('');
const username = ref('');
const message = ref('');
const messages = ref<any[]>([]);
const disabled = ref(true);

const toggleable = ref(false);


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

  } else {
    alert("Veuillez saisir votre message !");
  }
};

socket.value?.on('newMessage', ({ username, message }) => {
   console.log(username, message);
   messages.value.push({ username, message });
});

const handleJoinRoom = (data: { username: string, room: string }) => {
  room.value = data.room;
  username.value = data.username;
  disabled.value = false;
  messages.value = [];
  socket.value?.emit("join",  { username : username.value, room : room.value});
};



</script>
