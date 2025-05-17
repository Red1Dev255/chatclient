<template>
    <Tabs value="/chat">
    <TabList v-if="showTabs">
        <Tab  v-for="tab in items" :key="tab.label" :value="tab.route" @click="navigateTo(tab.route)">
            <router-link v-if="tab.route" v-slot="{ href, navigate }" :to="tab.route" custom>
                <a v-ripple :href="href" @click="navigate" style="text-decoration: none; color: inherit;">
                    <i :class="tab.icon" />
                    <span class="ml-2">{{ tab.label }}</span>
                </a>
            </router-link>
        </Tab>
    </TabList>
</Tabs>

</template>

<script setup lang="ts">

import Tabs from 'primevue/tabs';
import TabList from 'primevue/tablist';
import Tab from 'primevue/tab';
import { useRouter } from 'vue-router';
import { ref, onMounted } from 'vue';

const items = [
    {
        label: 'Chat',
        icon: 'pi pi-fw pi-home',
        route: '/chat'
    },
    {
        label: 'Users',
        icon: 'pi pi-fw pi-users',
        route: '/users'
    },
    // {
    //     label: 'Voting',
    //     icon: 'pi pi-megaphone',
    //     route: '/vote'
    // },
    {
        label: 'About',
        icon: 'pi pi-info-circle',
        route: '/informations'
    }
];

// Use the router to navigate to the selected route
const router = useRouter();
const navigateTo = (route: string) => {
    router.push(route);
};


const showTabs = ref(true);

onMounted(() => {
  router.afterEach((to) => {
    showTabs.value = to.path !== '/' && to.path !== '/closed';
  });
});

</script>