<template>
      <div class="line-height-4">
          <div class="overflow-scroll overflow-y-auto p-3 overflow-x-hidden border-round" style="height: 200px;">
              <div v-for="(msg, index) in message.slice().reverse()" :key="index" class="col-12">
                          <strong :class="myUsername === msg.username ? 'text-green-500' : 'text-cyan-500'">
                            {{ msg.username }} :</strong> {{ msg.message }}
              </div>
          </div>
      </div>   
</template>

<script setup lang="ts">
defineProps<{
  message: { username: string; message: string }[];
  myUsername: string;
}>();

</script>
