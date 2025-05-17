<template>
    <Card class="mt-2">
        <template #title>
            <div class="text-center mb-4">
                <i class="text-4xl text-green-500" >voting Room </i>
            </div>
        </template>
        <template #content>
            <div class="mb-4 text-center">
                <Button label="Start Vote" icon="pi pi-megaphone" class="p-button-success" @click="startVote" />
            </div>
            <div class="mb-4">
                <div class="grid">
                    <div v-for="(item, index) in listValues" :key="index">
                            <Button 
                            :label="item" 
                            :class="selectedValue === item ? 'p-button-success' : 'p-button-secondary'" 
                            @click="selectedValue = item" 
                            class="col m-2"
                            />
                      </div>
                </div>
            </div>
            <div>
                <div class="text-center mt-4">
                    <i class="text-4xl text-green-500" > {{ selectedValue }} </i>
                </div>
            </div>
            <div>
                <div v-for="(user, index) in votedUsers" :key="index" class="col-12">
                    <div class="mt-1">
                        <i> {{ user.username }}  : {{ user.vote }}</i>
                    </div>

                </div>
            </div>
        </template>
    </Card>
</template>

<script setup lang="ts">
import { ref } from "vue";
// import {ChatStore} from '../stores/chatStore'

// const store = ChatStore()

const startVote = () => {
    console.log("Starting vote...");
}

const votedUsers = [
    {
        username: "user1",
        vote: "1"
    },
    {
        username: "user2",
        vote: "2"
    },
    {
        username: "user3",
        vote: "3"
    }
]

const selectedValue = ref();

const listValues = ["0", "½", "1", "2", "3", "5", "8", "13", "20", "XS", "S", "M", "L", "XL", "XXL", "∞", "?", "☕️"];


</script>