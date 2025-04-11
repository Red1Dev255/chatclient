<template>
    <Card class="mt-2">
            <template #title>
                <div class="text-center">
                     <i>{{ users.length }} {{ users.length > 1 ? 'Connected users' : 'Connected user' }}</i>
                </div>
            </template>
            <template #content>
                <ul style="list-style: none;">
                    <li v-for="user in users" :key="user">
                        <i class="pi pi-user m-2"></i> {{ user }}
                    </li>
                </ul>
            </template>
        </Card>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { ChatStore } from '../stores/chatStore';

const store = ChatStore();
const users = computed(() => store.connectedUsers);

</script>