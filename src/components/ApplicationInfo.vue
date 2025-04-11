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
                        <i class="pi pi-check-circle m-2">
                            <b class="ml-2">{{ info.title }}</b>
                        </i>
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
        title: "Messages in this application are secured with RSA encryption",
        content: "This means that all the messages you send and receive are protected using a security method called RSA encryption. Only the intended recipient can read your messages, keeping them safe from others."
    },
    {
        title: "Data are stored temporarily",
        content: "The informations you share in the application are only saved for a short period of time. they are not stored permanently."
    },
    {
        title: "If you refresh the page or leave the room, all informations will be lost",
        content: "If you reload the page or exit the chat room, any messages or data will be erased. You won’t be able to recover them once you leave or refresh."
    }
];

</script>