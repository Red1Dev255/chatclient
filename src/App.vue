<template>
  <div id="app">
    <h1>Vue.js avec Socket.IO</h1>
    <button @click="sendMessage">Envoyer un message</button>
    <p>{{ serverMessage }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from "vue";
import { io, Socket } from "socket.io-client";

// Typage correct de socket
const socket = ref<Socket | null>(null);
const serverMessage = ref<string>("");

// Connexion au serveur Socket.IO
onMounted(() => {
  socket.value = io("http://54.37.153.23:3000/");

  // Vérifier que socket.value n'est pas null avant d'utiliser .on()
  socket.value?.on("message", (data: string) => {
    console.log("Message reçu du serveur:", data);
    serverMessage.value = data;
  });

  socket.value?.on("connect", () => {
    console.log("Connecté au serveur Socket.IO");
  });

  socket.value?.on("disconnect", () => {
    console.log("Déconnecté du serveur Socket.IO");
  });
});

// Nettoyage des écouteurs lors de la destruction du composant
onBeforeUnmount(() => {
  if (socket.value) {
    socket.value.off("message");
    socket.value.off("connect");
    socket.value.off("disconnect");
    socket.value.disconnect();
  }
});

// Fonction pour envoyer un message
const sendMessage = () => {
  if (socket.value) {
    socket.value.emit("message", "je suis le client");
  }
};
</script>

<style>
/* Ajouter vos styles ici */
</style>
