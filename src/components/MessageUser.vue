<template>
  <div class="m-5">
    <Card>
      <template #title>
        <div class="col-12 text-center">
          <i class="pi pi-comment"></i> Messages </div>
      </template>
      <template #content>
        <div class="grid">
          <div v-for="(msg, index) in message.slice().reverse()" :key="index" class="col-12">
            <p ><strong :class="myUsername === msg.username ? 'text-green-500' : 'text-cyan-500'">{{ msg.username }} :</strong> {{ msg.message }}</p>
          </div>
        </div>
      </template>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

defineProps<{
  message: { username: string; message: string }[];
  myUsername: string;
}>();

</script>
