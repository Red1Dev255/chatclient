<template>
      <div class="mt-2">
        <div  class="overflow-auto surface-overlay p-3 border-gray-600 border-1 border-round" style="height: calc(100vh - 50vh);">
            <div v-for="(msg, index) in messages.slice().reverse()" :key="index" class="col-12">
                <strong :class="myUsername === msg.username ? 'text-green-500' : 'text-cyan-500'">
                  {{ msg.username }} :</strong> {{ msg.message }}
            </div>
        </div>
      </div>   
</template>

<script setup lang="ts">

import {ChatStore} from '../stores/chatStore'

const store = ChatStore()

const messages = store.messages
const myUsername = store.username

</script>
