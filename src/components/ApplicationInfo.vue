<template>
    <Card class="mt-2">
        <template #title>
            <div class="text-center">
                <i>About this application</i>
            </div>
        </template>
        <template #content>
            <ul style="list-style: none;">
                <li v-for="info in infoList" :key="info.title">

                    <div>
                        <i class="pi pi-check-circle text-green-500 m-2">
                        </i>
                        <i><b>{{ info.title }}</b></i>
                    </div>
                    <p>{{ info.content }}</p>
                </li>
            </ul>
        </template>
    </Card>
</template>

<script setup lang="ts">

const infoList = [
    {
        title: "This application is a simple chat",
        content: "This application allows you to send and receive messages in real-time with other users. You can join different chat rooms and communicate with others easily."
    },
    {
        title: "Create or join an existing chat room",
        content: "You have the option to create your own chat room or join an already existing one."
    },
    {
        title: "You can close a room to prevent others from joining",
        content: "This feature allows you to close a chat room, ensuring that no new participants can join. Only the current members will remain in the room."
    },
    {
        title: "Messages in this application are secured with RSA and AES encryption",
        content: "This means that all the messages you send and receive are protected using a security method (RSA and AES), only the intended recipient can read your messages, keeping them safe from others."
        +"To ensure a high level of security for your messages, we use a combination of two encryption methods: RSA and AES. RSA securely exchanges the encryption key, while AES encrypts the actual message content."},
    {
        title: "Data are stored temporarily on your device",
        content: "Messages are stored temporarily on your device and will disappear as soon as you leave the chat"
    },
    {
        title: "If you refresh the page or leave the room, all informations will be lost",
        content: "If you reload the page or exit the chat room, any messages or data will be erased. You won’t be able to recover them once you leave or refresh."
    }
];

</script>