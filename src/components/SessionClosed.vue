<template>
    <Card>
        <template #title>
            <div class="text-center">
                <i class="pi pi-times-circle text-4xl text-red-500" > Disconnected </i>
            </div>
        </template>
        <template #content>
            <div class="text-center">
                <p class="text-lg">You have been disconnected from the chat room.</p>
                <Button label="Return to connection page" variant="link" @click="connecionPage" />
            </div>
        </template>
    </Card>
</template>

<script setup lang="ts">

import { useRouter } from "vue-router";

const router = useRouter();

const connecionPage = () => {
    router.push("/");
};

</script>


