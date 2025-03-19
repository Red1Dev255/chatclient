<template>
  <div id="app">
    <h1>Vue.js avec Socket.IO</h1>
    
    <div v-if="!joined">
      <input v-model="room" placeholder="Nom de la room" />
      <input v-model="username" placeholder="Votre pseudo" />
      <button @click="joinRoom">Rejoindre</button>
    </div>

    <div v-else>
      <h2>Room: {{ room }}</h2>
      <h3>Votre pseudo: {{ username }}</h3>

      <label>Choisissez un numéro :</label>
      <select v-model="selectedNumber">
        <option v-for="num in numbers" :key="num" :value="num">
          {{ num }}
        </option>
      </select>
      <button @click="chooseNumber">Valider</button>

      <h2>Choix des utilisateurs :</h2>
      <ul>
        <li v-for="(num, user) in choices" :key="user">
          {{ user }} a choisi : {{ num }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from "vue";
import { io, Socket } from "socket.io-client";

const socket = ref<Socket | null>(null);
const room = ref("");
const username = ref("");
const joined = ref(false);
const selectedNumber = ref(null);
const choices = ref<Record<string, number>>({});
const numbers = Array.from({ length: 10 }, (_, i) => i + 1); // Nombres de 1 à 10

onMounted(() => {
  socket.value = io("http://54.37.153.23:3000/");

  socket.value?.on("updateChoices", (data) => {
    choices.value = data;
  });

  socket.value?.on("connect", () => {
    console.log("Connecté au serveur Socket.IO");
  });

  socket.value?.on("disconnect", () => {
    console.log("Déconnecté du serveur Socket.IO");
  });
});

onBeforeUnmount(() => {
  if (socket.value) {
    socket.value.off("updateChoices");
    socket.value.off("connect");
    socket.value.off("disconnect");
    socket.value.disconnect();
  }
});

const joinRoom = () => {
  if (room.value && username.value) {
    socket.value?.emit("joinRoom", room.value);
    joined.value = true;
  } else {
    alert("Veuillez entrer un nom de room et un pseudo !");
  }
};

const chooseNumber = () => {
  if (selectedNumber.value !== null) {
    socket.value?.emit("chooseNumber", {
      room: room.value,
      username: username.value,
      number: selectedNumber.value,
    });
  } else {
    alert("Veuillez choisir un numéro !");
  }
};
</script>

<style>
/* Ajouter vos styles ici */
</style>
